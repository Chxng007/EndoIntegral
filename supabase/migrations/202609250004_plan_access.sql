-- Acceso a módulos del área privada según el plan (ver src/lib/plans.js, que debe coincidir).
-- Diagnóstico y Orienta: todos los módulos. Aprende: Endo-Voces, Cartilla y Recursos.
-- El equipo (rol admin) siempre tiene acceso completo.
begin;
create function public.plan_allows(module text) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.profiles where id=(select auth.uid()) and activo and (
  rol='admin' or plan in ('diagnostico','orienta') or module in ('endo-voces','cartilla','recursos')
 ));
$$;
revoke all on function public.plan_allows(text) from public,anon,authenticated;
grant execute on function public.plan_allows(text) to authenticated,service_role;

drop policy symptoms_owner on public.symptom_logs;
create policy symptoms_owner on public.symptom_logs for all to authenticated
 using(user_id=auth.uid() and public.has_consent('datos_sensibles') and public.plan_allows('sintomas'))
 with check(user_id=auth.uid() and public.has_consent('datos_sensibles') and public.plan_allows('sintomas'));

drop policy journal_owner on public.journal_entries;
create policy journal_owner on public.journal_entries for all to authenticated
 using(user_id=auth.uid() and public.has_consent('datos_sensibles') and public.plan_allows('diario'))
 with check(user_id=auth.uid() and public.has_consent('datos_sensibles') and public.plan_allows('diario'));

drop policy appointment_read on public.appointment_requests;
create policy appointment_read on public.appointment_requests for select to authenticated
 using((user_id=auth.uid() and public.plan_allows('acompanamiento')) or public.is_admin());
drop policy appointment_insert on public.appointment_requests;
create policy appointment_insert on public.appointment_requests for insert to authenticated
 with check(user_id=auth.uid() and public.has_consent('datos_sensibles') and public.plan_allows('acompanamiento') and estado='pendiente');

drop policy resources_read on public.resources;
create policy resources_read on public.resources for select to authenticated
 using(public.is_active() and (categoria<>'diario' or public.plan_allows('diario')));
drop policy member_resources_read on storage.objects;
create policy member_resources_read on storage.objects for select to authenticated
 using(bucket_id='resources' and public.is_active() and exists(select 1 from public.resources r where r.pdf_path=name and (r.categoria<>'diario' or public.plan_allows('diario'))));

drop policy prompts_read on public.journal_prompts;
create policy prompts_read on public.journal_prompts for select to authenticated using(public.plan_allows('diario') and activo);

drop policy reports_insert on public.forum_reports;
create policy reports_insert on public.forum_reports for insert to authenticated
 with check(public.plan_allows('foro') and user_id=auth.uid() and not resuelto);

create or replace view public.forum_posts_public with(security_barrier=true) as
 select p.id,p.contenido,p.anonima,p.youtube_id,p.created_at,
 case when p.anonima then 'Anónima' else split_part(pr.nombre,' ',1) end as autora,
 (select count(*)::integer from public.forum_reactions r where r.post_id=p.id) as reacciones,
 exists(select 1 from public.forum_reactions r where r.post_id=p.id and r.user_id=auth.uid()) as mi_reaccion
 from public.forum_posts p join public.profiles pr on pr.id=p.user_id
 where not p.oculto and public.plan_allows('foro');
create or replace view public.forum_replies_public with(security_barrier=true) as
 select r.id,r.post_id,r.contenido,r.anonima,r.created_at,
 case when r.anonima then 'Anónima' else split_part(pr.nombre,' ',1) end as autora
 from public.forum_replies r join public.profiles pr on pr.id=r.user_id join public.forum_posts p on p.id=r.post_id
 where not r.oculto and not p.oculto and public.plan_allows('foro');

create or replace function public.create_forum_post(body text,anonymous boolean default false,video_id text default null) returns uuid language plpgsql security definer set search_path='' as $$
 declare new_id uuid;
 begin
 if not public.plan_allows('foro') then raise exception 'El foro no está incluido en tu plan.';end if;
 if not public.has_consent('normas_foro') then raise exception 'Acepta las normas de la comunidad.';end if;
 if (select count(*) from public.forum_posts where user_id=auth.uid() and created_at>now()-interval '1 minute')>=3 then raise exception 'Espera un momento antes de volver a publicar.';end if;
 insert into public.forum_posts(user_id,contenido,anonima,youtube_id,riesgo) values(auth.uid(),body,anonymous,video_id,body~*'(suicid|matarme|quitarme la vida|hacerme daño)') returning id into new_id;
 return new_id;
 end;
$$;
create or replace function public.create_forum_reply(parent_id uuid,body text,anonymous boolean default false) returns uuid language plpgsql security definer set search_path='' as $$
 declare new_id uuid;
 begin
 if not public.plan_allows('foro') then raise exception 'El foro no está incluido en tu plan.';end if;
 if not public.has_consent('normas_foro') then raise exception 'Acepta las normas de la comunidad.';end if;
 if not exists(select 1 from public.forum_posts where id=parent_id and not oculto) then raise exception 'Publicación no disponible.';end if;
 if (select count(*) from public.forum_replies where user_id=auth.uid() and created_at>now()-interval '1 minute')>=5 then raise exception 'Espera un momento antes de volver a responder.';end if;
 insert into public.forum_replies(user_id,post_id,contenido,anonima,riesgo) values(auth.uid(),parent_id,body,anonymous,body~*'(suicid|matarme|quitarme la vida|hacerme daño)') returning id into new_id;
 return new_id;
 end;
$$;
create or replace function public.toggle_forum_reaction(target uuid) returns void language plpgsql security definer set search_path='' as $$
 begin
 if not public.plan_allows('foro') or not exists(select 1 from public.forum_posts where id=target and not oculto) then raise exception 'No autorizado.';end if;
 if exists(select 1 from public.forum_reactions where post_id=target and user_id=auth.uid()) then delete from public.forum_reactions where post_id=target and user_id=auth.uid();
 else insert into public.forum_reactions(post_id,user_id) values(target,auth.uid()) on conflict do nothing;end if;
 end;
$$;
commit;
