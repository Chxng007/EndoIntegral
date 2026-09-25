begin;
create table public.notification_outbox(id uuid primary key default gen_random_uuid(),tipo text not null check(tipo in ('contact','appointment')),record_id uuid not null,created_at timestamptz not null default now(),sent_at timestamptz);
alter table public.notification_outbox enable row level security;
revoke all on public.notification_outbox from anon,authenticated;
grant all on public.notification_outbox to service_role;
create function public.queue_team_notification() returns trigger language plpgsql security definer set search_path='' as $$
 begin
 insert into public.notification_outbox(tipo,record_id) values(case when TG_TABLE_NAME='contact_messages' then 'contact' else 'appointment' end,new.id);
 return new;
 end;
$$;
revoke all on function public.queue_team_notification() from public,anon,authenticated;
create trigger contact_notification after insert on public.contact_messages for each row execute function public.queue_team_notification();
create trigger appointment_notification after insert on public.appointment_requests for each row execute function public.queue_team_notification();
commit;
