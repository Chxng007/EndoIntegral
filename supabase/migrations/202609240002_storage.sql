begin;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values
 ('podcasts','podcasts',false,104857600,array['audio/mpeg','audio/mp4','audio/x-m4a','audio/wav','video/mp4','video/webm']),
 ('resources','resources',false,26214400,array['application/pdf']),
 ('public-assets','public-assets',true,104857600,array['image/jpeg','image/png','image/webp','video/mp4','video/webm'])
on conflict(id) do nothing;
create policy team_assets_insert on storage.objects for insert to authenticated with check(bucket_id in ('podcasts','resources','public-assets') and public.is_admin());
create policy team_assets_update on storage.objects for update to authenticated using(bucket_id in ('podcasts','resources','public-assets') and public.is_admin()) with check(bucket_id in ('podcasts','resources','public-assets') and public.is_admin());
create policy team_assets_delete on storage.objects for delete to authenticated using(bucket_id in ('podcasts','resources','public-assets') and public.is_admin());
create policy team_assets_read on storage.objects for select to authenticated using(bucket_id in ('podcasts','resources','public-assets') and public.is_admin());
create policy member_podcasts_read on storage.objects for select to authenticated using(bucket_id='podcasts' and public.is_active() and exists(select 1 from public.podcast_episodes e where e.storage_path=name and e.publicado_at<=now()));
create policy member_resources_read on storage.objects for select to authenticated using(bucket_id='resources' and public.is_active() and exists(select 1 from public.resources r where r.pdf_path=name));
create policy public_assets_read on storage.objects for select to anon,authenticated using(bucket_id='public-assets');
-- Do not enable Postgres Changes for forum_posts/replies: raw records reveal author IDs.
-- The frontend polls only the sanitized views. A sanitized Broadcast channel can be added later.
commit;
