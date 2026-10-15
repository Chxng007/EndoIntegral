-- Videos propios (no YouTube) destacados dentro de un módulo, p. ej. yoga en «Recursos».
-- El archivo y su portada viven en el bucket privado 'resources'; se ven con el mismo permiso
-- que los documentos de su categoría (public.resource_allowed).
begin;
update storage.buckets
 set allowed_mime_types=array['application/pdf','image/webp','image/jpeg','video/mp4'], file_size_limit=209715200
 where id='resources';

create table public.featured_videos (
 id uuid primary key default gen_random_uuid(),
 categoria text not null check(categoria in ('yoga','mindfulness','cartilla','diario')),
 titulo text not null check(char_length(titulo) between 3 and 120),
 descripcion text check(descripcion is null or char_length(descripcion)<=600),
 video_path text not null,
 poster_path text,
 proporcion text not null default '9 / 16' check(proporcion ~ '^[0-9]+ / [0-9]+$'),
 duracion_segundos integer check(duracion_segundos is null or duracion_segundos>0),
 orden integer not null default 0,
 activo boolean not null default true,
 created_at timestamptz not null default now()
);
alter table public.featured_videos enable row level security;
revoke all on public.featured_videos from anon;
grant select,insert,update,delete on public.featured_videos to authenticated;
grant all on public.featured_videos to service_role;
create policy featured_videos_read on public.featured_videos for select to authenticated
 using(activo and public.is_active() and public.resource_allowed(categoria));
create policy featured_videos_admin on public.featured_videos for all to authenticated
 using(public.is_admin()) with check(public.is_admin());

drop policy member_resources_read on storage.objects;
create policy member_resources_read on storage.objects for select to authenticated
 using(bucket_id='resources' and public.is_active() and (
  exists(select 1 from public.resources r
   where (r.pdf_path=name or (r.carpeta is not null and starts_with(name,r.carpeta||'/')))
     and public.resource_allowed(r.categoria))
  or exists(select 1 from public.featured_videos v
   where v.activo and (v.video_path=name or v.poster_path=name) and public.resource_allowed(v.categoria))));
commit;
