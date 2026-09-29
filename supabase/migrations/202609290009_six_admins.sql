-- El equipo pasa a ser de hasta 6 administradoras activas (antes 5).
-- Debe coincidir con MAX_ADMINS en src/lib/plans.js y con invite-member.
create or replace function public.enforce_admin_roles() returns trigger language plpgsql security definer set search_path='' as $$
 begin
 if new.rol='admin' and new.activo and (tg_op='INSERT' or old.rol<>'admin' or not old.activo) then
  perform pg_advisory_xact_lock(hashtext('public.profiles.admins'));
  if (select count(*) from public.profiles where rol='admin' and activo and id<>new.id)>=6 then
   raise exception 'Ya hay 6 administradoras activas. Quita el rol a alguien antes de agregar otra.';
  end if;
 end if;
 if tg_op='UPDATE' and old.rol='admin' and old.activo and (new.rol<>'admin' or not new.activo) then
  if new.id=(select auth.uid()) then
   raise exception 'No puedes quitarte tu propio acceso de administradora.';
  end if;
  if not exists(select 1 from public.profiles where rol='admin' and activo and id<>new.id) then
   raise exception 'Debe quedar al menos una administradora activa.';
  end if;
 end if;
 return new;
 end;
$$;
