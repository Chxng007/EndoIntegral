-- EndoIntegral. PostgreSQL / Supabase. Never put service_role in the browser.
begin;
create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 nombre text not null check(char_length(nombre) between 2 and 80),
 rol text not null default 'miembra' check(rol in ('miembra','admin','profesional')),
 plan text not null default 'aprende' check(plan in ('diagnostico','orienta','aprende')),
 plan_inicio date default current_date, activo boolean not null default false,
 created_at timestamptz not null default now()
);
create function public.is_admin() returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.profiles where id=(select auth.uid()) and rol='admin' and activo);
$$;
create function public.is_active() returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.profiles where id=(select auth.uid()) and activo);
$$;
create table public.consents (
 id uuid primary key default gen_random_uuid(),user_id uuid not null references public.profiles on delete cascade,
 tipo text not null check(tipo in ('datos_sensibles','normas_foro')),version text not null,
 aceptado_at timestamptz not null default now(),unique(user_id,tipo,version)
);
create function public.has_consent(consent_type text) returns boolean language sql stable security definer set search_path='' as $$
 select public.is_active() and exists(select 1 from public.consents where user_id=(select auth.uid()) and tipo=consent_type and version='1.0');
$$;
create table public.contact_messages (
 id uuid primary key default gen_random_uuid(),nombre text not null check(char_length(nombre) between 3 and 80),
 email text not null,asunto text not null,telefono text,mensaje text not null check(char_length(mensaje) between 10 and 2000),
 consent_version text not null default '1.0',estado text not null default 'nuevo' check(estado in ('nuevo','respondido')),created_at timestamptz not null default now()
);
create table public.professionals (
 id uuid primary key default gen_random_uuid(),nombre text not null,cargo text not null,anios_experiencia integer default 0 check(anios_experiencia>=0),
 especialidades text[] not null default '{}',bio text not null,foto_url text,video_id text check(video_id is null or video_id~'^[a-zA-Z0-9_-]{11}$'),activo boolean not null default true,created_at timestamptz not null default now()
);
create table public.appointment_requests (
 id uuid primary key default gen_random_uuid(),user_id uuid not null references public.profiles on delete cascade,
 professional_id uuid references public.professionals on delete set null,telefono text,
 modalidad text not null check(modalidad in ('Videollamada','Presencial','Llamada telefónica')),
 horario text not null,motivo text not null check(char_length(motivo) between 10 and 2000),
 estado text not null default 'pendiente' check(estado in ('pendiente','confirmada','realizada','cancelada')),created_at timestamptz not null default now()
);
-- Keep internal notes in a separate table: member SELECT * must never disclose them.
create table public.appointment_team_notes (
 appointment_id uuid primary key references public.appointment_requests on delete cascade,notas text not null default '',created_at timestamptz not null default now()
);
create table public.podcast_episodes (
 id uuid primary key default gen_random_uuid(),titulo text not null,descripcion text not null,
 tipo text not null check(tipo in ('especialista','testimonio')),media_tipo text not null check(media_tipo in ('audio','video','youtube')),
 storage_path text,youtube_id text check(youtube_id is null or youtube_id~'^[a-zA-Z0-9_-]{11}$'),duracion_seg integer default 0 check(duracion_seg>=0),portada_url text,publicado_at timestamptz,created_at timestamptz not null default now(),
 check((media_tipo='youtube' and youtube_id is not null) or (media_tipo in ('audio','video') and storage_path is not null))
);
create table public.podcast_progress (
 user_id uuid not null references public.profiles on delete cascade,episode_id uuid not null references public.podcast_episodes on delete cascade,
 posicion_seg integer not null default 0 check(posicion_seg>=0),completado boolean not null default false,primary key(user_id,episode_id)
);
create table public.symptom_logs (
 id uuid primary key default gen_random_uuid(),user_id uuid not null references public.profiles on delete cascade,
 fecha date not null check(fecha<=current_date),dia_ciclo integer check(dia_ciclo between 1 and 60),dolor integer not null check(dolor between 0 and 10),
 animo text not null check(animo in ('Bien','Regular','Bajo','Irritable','Ansiosa','Agotada')),sintomas text[] not null default '{}',notas text check(char_length(notas)<=2000),
 created_at timestamptz not null default now(),updated_at timestamptz not null default now(),unique(user_id,fecha)
);
create table public.journal_prompts (id uuid primary key default gen_random_uuid(),orden integer not null default 0,pregunta text not null,activo boolean not null default true,created_at timestamptz not null default now());
create table public.journal_entries (
 id uuid primary key default gen_random_uuid(),user_id uuid not null references public.profiles on delete cascade,
 fecha date not null check(fecha<=current_date),emocion text not null,respuestas jsonb not null default '{}',texto_libre text not null check(char_length(texto_libre) between 1 and 10000),created_at timestamptz not null default now()
);
create table public.forum_posts (
 id uuid primary key default gen_random_uuid(),user_id uuid not null references public.profiles on delete cascade,
 contenido text not null check(char_length(contenido) between 3 and 5000),anonima boolean not null default false,
 youtube_id text check(youtube_id is null or youtube_id~'^[a-zA-Z0-9_-]{11}$'),oculto boolean not null default false,riesgo boolean not null default false,created_at timestamptz not null default now()
);
create table public.forum_replies (
 id uuid primary key default gen_random_uuid(),post_id uuid not null references public.forum_posts on delete cascade,user_id uuid not null references public.profiles on delete cascade,
 contenido text not null check(char_length(contenido) between 2 and 3000),anonima boolean not null default false,oculto boolean not null default false,riesgo boolean not null default false,created_at timestamptz not null default now()
);
create table public.forum_reactions(post_id uuid not null references public.forum_posts on delete cascade,user_id uuid not null references public.profiles on delete cascade,primary key(post_id,user_id));
create table public.forum_reports (
 id uuid primary key default gen_random_uuid(),target_tipo text not null check(target_tipo in ('post','reply')),target_id uuid not null,user_id uuid not null references public.profiles on delete cascade,
 motivo text not null check(char_length(motivo) between 5 and 1000),resuelto boolean not null default false,created_at timestamptz not null default now()
);
create table public.resources (
 id uuid primary key default gen_random_uuid(),categoria text not null check(categoria in ('yoga','mindfulness','cartilla','diario')),titulo text not null,descripcion text not null,pdf_path text not null,video_id text,orden integer default 0,created_at timestamptz not null default now()
);
create table public.site_videos (clave text primary key,youtube_id text check(youtube_id is null or youtube_id~'^[a-zA-Z0-9_-]{11}$'),storage_path text,poster_url text,created_at timestamptz not null default now());
-- Server-only anti-abuse counter. No IP addresses are persisted: keyed hash only.
create table public.request_limits(key_hash text primary key,window_start timestamptz not null default now(),attempts integer not null default 1);
create function public.consume_contact_limit(key_value text) returns boolean language plpgsql security definer set search_path='' as $$
 declare allowed boolean;
 begin
 insert into public.request_limits as limits(key_hash,window_start,attempts) values(key_value,now(),1)
 on conflict(key_hash) do update set
 attempts=case when limits.window_start<now()-interval '1 hour' then 1 else limits.attempts+1 end,
 window_start=case when limits.window_start<now()-interval '1 hour' then now() else limits.window_start end
 returning attempts<=5 into allowed;
 delete from public.request_limits where window_start<now()-interval '2 days';
 return allowed;
 end;
$$;
-- Protected tables: privileges and RLS are both explicit.
do $$ declare t text;begin
 foreach t in array array['profiles','consents','contact_messages','professionals','appointment_requests','appointment_team_notes','podcast_episodes','podcast_progress','symptom_logs','journal_prompts','journal_entries','forum_posts','forum_replies','forum_reactions','forum_reports','resources','site_videos','request_limits'] loop
 execute format('alter table public.%I enable row level security',t);
 execute format('revoke all on public.%I from anon, authenticated',t);
 execute format('grant all on public.%I to service_role',t);
 end loop;
end $$;
grant select,insert,update,delete on public.profiles,public.professionals,public.podcast_episodes,public.resources,public.site_videos,public.journal_prompts,public.appointment_team_notes to authenticated;
grant select,insert,update,delete on public.consents,public.symptom_logs,public.journal_entries,public.podcast_progress to authenticated;
grant select,insert,update on public.appointment_requests,public.forum_reports to authenticated;
grant select,update on public.contact_messages,public.forum_posts,public.forum_replies to authenticated;
grant select on public.professionals,public.site_videos to anon;
create policy profiles_read_self on public.profiles for select to authenticated using(id=auth.uid());
create policy profiles_admin on public.profiles for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy consents_owner on public.consents for select to authenticated using(user_id=auth.uid());
create policy consents_insert on public.consents for insert to authenticated with check(user_id=auth.uid() and public.is_active() and version='1.0');
create policy symptoms_owner on public.symptom_logs for all to authenticated using(user_id=auth.uid() and public.has_consent('datos_sensibles')) with check(user_id=auth.uid() and public.has_consent('datos_sensibles'));
create policy journal_owner on public.journal_entries for all to authenticated using(user_id=auth.uid() and public.has_consent('datos_sensibles')) with check(user_id=auth.uid() and public.has_consent('datos_sensibles'));
create policy progress_owner on public.podcast_progress for all to authenticated using(user_id=auth.uid() and public.is_active()) with check(user_id=auth.uid() and public.is_active());
create policy contact_admin on public.contact_messages for all to authenticated using(public.is_admin()) with check(public.is_admin());
-- Public contact has no direct insert grant: it MUST go through the rate-limited Edge Function.
create policy appointment_read on public.appointment_requests for select to authenticated using((user_id=auth.uid() and public.is_active()) or public.is_admin());
create policy appointment_insert on public.appointment_requests for insert to authenticated with check(user_id=auth.uid() and public.has_consent('datos_sensibles') and estado='pendiente');
create policy appointment_update on public.appointment_requests for update to authenticated using(public.is_admin()) with check(public.is_admin());
create policy notes_admin on public.appointment_team_notes for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy professional_public on public.professionals for select to anon,authenticated using(activo or public.is_admin());
create policy professional_admin on public.professionals for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy videos_public on public.site_videos for select to anon,authenticated using(true);
create policy videos_admin on public.site_videos for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy episodes_read on public.podcast_episodes for select to authenticated using(public.is_active() and publicado_at<=now());
create policy episodes_admin on public.podcast_episodes for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy resources_read on public.resources for select to authenticated using(public.is_active());
create policy resources_admin on public.resources for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy prompts_read on public.journal_prompts for select to authenticated using(public.is_active() and activo);
create policy prompts_admin on public.journal_prompts for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy posts_admin on public.forum_posts for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy replies_admin on public.forum_replies for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy reports_insert on public.forum_reports for insert to authenticated with check(public.is_active() and user_id=auth.uid() and not resuelto);
create policy reports_admin on public.forum_reports for all to authenticated using(public.is_admin()) with check(public.is_admin());
-- These views deliberately run as owner to expose ONLY sanitized, active-member data.
-- The base tables cannot be read by ordinary members, even their own anonymous posts.
create view public.forum_posts_public with(security_barrier=true) as
 select p.id,p.contenido,p.anonima,p.youtube_id,p.created_at,
 case when p.anonima then 'Anónima' else split_part(pr.nombre,' ',1) end as autora,
 (select count(*)::integer from public.forum_reactions r where r.post_id=p.id) as reacciones,
 exists(select 1 from public.forum_reactions r where r.post_id=p.id and r.user_id=auth.uid()) as mi_reaccion
 from public.forum_posts p join public.profiles pr on pr.id=p.user_id
 where not p.oculto and public.is_active();
create view public.forum_replies_public with(security_barrier=true) as
 select r.id,r.post_id,r.contenido,r.anonima,r.created_at,
 case when r.anonima then 'Anónima' else split_part(pr.nombre,' ',1) end as autora
 from public.forum_replies r join public.profiles pr on pr.id=r.user_id join public.forum_posts p on p.id=r.post_id
 where not r.oculto and not p.oculto and public.is_active();
revoke all on public.forum_posts_public,public.forum_replies_public from anon,authenticated;
grant select on public.forum_posts_public,public.forum_replies_public to authenticated;
create function public.create_forum_post(body text,anonymous boolean default false,video_id text default null) returns uuid language plpgsql security definer set search_path='' as $$
 declare new_id uuid;
 begin
 if not public.has_consent('normas_foro') then raise exception 'Acepta las normas de la comunidad.';end if;
 if (select count(*) from public.forum_posts where user_id=auth.uid() and created_at>now()-interval '1 minute')>=3 then raise exception 'Espera un momento antes de volver a publicar.';end if;
 insert into public.forum_posts(user_id,contenido,anonima,youtube_id,riesgo) values(auth.uid(),body,anonymous,video_id,body~*'(suicid|matarme|quitarme la vida|hacerme daño)') returning id into new_id;
 return new_id;
 end;
$$;
create function public.create_forum_reply(parent_id uuid,body text,anonymous boolean default false) returns uuid language plpgsql security definer set search_path='' as $$
 declare new_id uuid;
 begin
 if not public.has_consent('normas_foro') then raise exception 'Acepta las normas de la comunidad.';end if;
 if not exists(select 1 from public.forum_posts where id=parent_id and not oculto) then raise exception 'Publicación no disponible.';end if;
 if (select count(*) from public.forum_replies where user_id=auth.uid() and created_at>now()-interval '1 minute')>=5 then raise exception 'Espera un momento antes de volver a responder.';end if;
 insert into public.forum_replies(user_id,post_id,contenido,anonima,riesgo) values(auth.uid(),parent_id,body,anonymous,body~*'(suicid|matarme|quitarme la vida|hacerme daño)') returning id into new_id;
 return new_id;
 end;
$$;
create function public.toggle_forum_reaction(target uuid) returns void language plpgsql security definer set search_path='' as $$
 begin
 if not public.is_active() or not exists(select 1 from public.forum_posts where id=target and not oculto) then raise exception 'No autorizado.';end if;
 if exists(select 1 from public.forum_reactions where post_id=target and user_id=auth.uid()) then delete from public.forum_reactions where post_id=target and user_id=auth.uid();
 else insert into public.forum_reactions(post_id,user_id) values(target,auth.uid()) on conflict do nothing;end if;
 end;
$$;
revoke all on function public.is_admin(),public.is_active(),public.has_consent(text),public.consume_contact_limit(text),public.create_forum_post(text,boolean,text),public.create_forum_reply(uuid,text,boolean),public.toggle_forum_reaction(uuid) from public,anon,authenticated;
grant execute on function public.is_admin(),public.is_active() to anon,authenticated,service_role;
grant execute on function public.has_consent(text),public.create_forum_post(text,boolean,text),public.create_forum_reply(uuid,text,boolean),public.toggle_forum_reaction(uuid) to authenticated;
grant execute on function public.consume_contact_limit(text) to service_role;
create index symptom_user_date on public.symptom_logs(user_id,fecha desc);
create index journal_user_date on public.journal_entries(user_id,fecha desc);
create index appointments_user on public.appointment_requests(user_id);
create index replies_parent on public.forum_replies(post_id);
create index posts_created on public.forum_posts(created_at desc);
create index reports_open on public.forum_reports(resuelto,created_at desc);
insert into public.site_videos(clave) values('inicio_validacion'),('programa_institucional'),('plan_diagnostico'),('plan_orienta'),('plan_aprende'),('endometriosis_definicion'),('endometriosis_mental'),('endometriosis_tratamiento'),('contacto_saludo'),('miembros_bienvenida'),('sintomas_tutorial'),('diario_tutorial'),('cartilla_tutorial');
commit;
