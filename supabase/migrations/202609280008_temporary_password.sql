-- Las personas invitadas reciben una contraseña temporal por correo y deben cambiarla
-- en su primer ingreso. invite-member marca debe_cambiar_contrasena=true.
alter table public.profiles add column debe_cambiar_contrasena boolean not null default false;

create function public.mark_password_changed() returns public.profiles language sql security definer set search_path='' as $$
 update public.profiles set debe_cambiar_contrasena=false where id=(select auth.uid()) returning *;
$$;
revoke all on function public.mark_password_changed() from public,anon;
grant execute on function public.mark_password_changed() to authenticated;
