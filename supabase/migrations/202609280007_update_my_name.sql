-- Cada persona puede cambiar el nombre con el que aparece en su perfil (solo el nombre:
-- rol, plan y estado siguen siendo exclusivos del equipo).
create function public.update_my_name(new_name text) returns public.profiles language plpgsql security definer set search_path='' as $$
 declare clean text := regexp_replace(trim(coalesce(new_name,'')),'\s+',' ','g'); updated public.profiles;
 begin
 if char_length(clean) not between 2 and 80 then raise exception 'El nombre debe tener entre 2 y 80 caracteres.'; end if;
 update public.profiles set nombre=clean where id=(select auth.uid()) returning * into updated;
 if updated.id is null then raise exception 'No encontramos tu perfil.'; end if;
 return updated;
 end;
$$;
revoke all on function public.update_my_name(text) from public,anon;
grant execute on function public.update_my_name(text) to authenticated;
