-- Registro gratuito y planes según «PDA 2da entrega».
-- * 'ninguno' = cuenta gratuita sin plan: no ve módulos hasta que el equipo le active uno.
-- * Plan 1 Aprende: Endo-Voces, cartilla y diario de bienestar.
-- * Plan 2 Orienta y Plan 3 Diagnosticadas ('diagnostico'): todos los módulos.
-- Debe coincidir con planModules en src/lib/plans.js.
begin;
alter table public.profiles drop constraint profiles_plan_check;
alter table public.profiles add constraint profiles_plan_check check(plan in ('ninguno','aprende','orienta','diagnostico'));
alter table public.profiles alter column plan set default 'ninguno';
-- Correo visible para el equipo (buscar a quien pidió un plan) sin exponer auth.users.
alter table public.profiles add column email text;
update public.profiles p set email=u.email from auth.users u where u.id=p.id;

-- Toda cuenta nueva (registro propio o invitación) recibe su perfil automáticamente.
create function public.handle_new_user() returns trigger language plpgsql security definer set search_path='' as $$
 declare name text := left(coalesce(nullif(trim(new.raw_user_meta_data->>'nombre'),''),split_part(new.email,'@',1)),80);
 begin
 if char_length(coalesce(name,''))<2 then name:='Usuaria'; end if;
 insert into public.profiles(id,nombre,email,plan,rol,activo)
 values(new.id,name,new.email,'ninguno','miembra',true)
 on conflict(id) do nothing;
 return new;
 end;
$$;
revoke all on function public.handle_new_user() from public,anon,authenticated;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create function public.sync_profile_email() returns trigger language plpgsql security definer set search_path='' as $$
 begin update public.profiles set email=new.email where id=new.id; return new; end;
$$;
revoke all on function public.sync_profile_email() from public,anon,authenticated;
create trigger on_auth_user_email after update of email on auth.users for each row execute function public.sync_profile_email();

create or replace function public.plan_allows(module text) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.profiles where id=(select auth.uid()) and activo and (
  rol='admin' or plan in ('diagnostico','orienta') or (plan='aprende' and module in ('endo-voces','cartilla','diario'))
 ));
$$;
commit;
