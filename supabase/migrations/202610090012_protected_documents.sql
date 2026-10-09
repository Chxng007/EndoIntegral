-- Documentos protegidos: cartilla, diario, yoga y mindfulness viven en el bucket privado
-- 'resources' (no en la carpeta pública de la web). Cada documento puede tener, además del PDF,
-- una carpeta con sus páginas en WebP para el lector en pantalla.
-- Solo se pueden leer con sesión activa y un plan que incluya el módulo del documento:
--   cartilla → 'cartilla' · diario → 'diario' · yoga / mindfulness → 'recursos'.
begin;
update storage.buckets set allowed_mime_types=array['application/pdf','image/webp'], file_size_limit=26214400 where id='resources';

alter table public.resources add column carpeta text check(carpeta is null or carpeta ~ '^[a-z0-9/-]+$');
alter table public.resources add column paginas integer check(paginas is null or paginas between 1 and 300);
alter table public.resources add column proporcion text check(proporcion is null or proporcion ~ '^[0-9]+ / [0-9]+$');

create function public.resource_allowed(categoria text) returns boolean language sql stable security definer set search_path='' as $$
 select public.plan_allows(case categoria when 'diario' then 'diario' when 'cartilla' then 'cartilla' else 'recursos' end);
$$;
revoke all on function public.resource_allowed(text) from public,anon;
grant execute on function public.resource_allowed(text) to authenticated,service_role;

drop policy resources_read on public.resources;
create policy resources_read on public.resources for select to authenticated
 using(public.is_active() and public.resource_allowed(categoria));

drop policy member_resources_read on storage.objects;
create policy member_resources_read on storage.objects for select to authenticated
 using(bucket_id='resources' and public.is_active() and exists(
  select 1 from public.resources r
  where (r.pdf_path=name or (r.carpeta is not null and starts_with(name,r.carpeta||'/')))
    and public.resource_allowed(r.categoria)));
commit;
