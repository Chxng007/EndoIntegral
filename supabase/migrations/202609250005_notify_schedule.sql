-- Cada 2 minutos, si hay avisos pendientes, llama a la función notify-team (correo al equipo vía Resend).
-- El secreto NO va en el repositorio: se guarda aparte en Vault con
--   select vault.create_secret('<mismo valor que WEBHOOK_SECRET>','notify_webhook_secret');
-- y el mismo valor se configura como secreto WEBHOOK_SECRET de las Edge Functions.
create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;
select cron.schedule('notify-team','*/2 * * * *', $cron$
 select net.http_post(
  url:='https://nsqbqrxumaripvavbkoe.supabase.co/functions/v1/notify-team',
  headers:=jsonb_build_object('Content-Type','application/json','x-webhook-secret',(select decrypted_secret from vault.decrypted_secrets where name='notify_webhook_secret')),
  body:='{}'::jsonb)
 where exists(select 1 from public.notification_outbox where sent_at is null)
   and exists(select 1 from vault.decrypted_secrets where name='notify_webhook_secret');
$cron$);
