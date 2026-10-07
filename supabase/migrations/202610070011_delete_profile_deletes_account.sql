-- Borrar una fila de profiles (p. ej., desde el Table Editor de Supabase) también elimina su cuenta
-- de acceso en auth.users. Así una persona borrada ya no puede iniciar sesión.
-- (El sentido contrario ya existe: profiles.id references auth.users on delete cascade.)
create function public.delete_account_with_profile() returns trigger language plpgsql security definer set search_path='' as $$
 begin
 delete from auth.users where id=old.id;
 return old;
 end;
$$;
revoke all on function public.delete_account_with_profile() from public,anon,authenticated;
create trigger profiles_delete_account after delete on public.profiles for each row execute function public.delete_account_with_profile();
