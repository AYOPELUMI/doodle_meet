create extension if not exists pg_cron;
create extension if not exists pg_net;

alter table public.calendar_connections enable row level security;
alter table public.calendar_sync_jobs enable row level security;
alter table public.meeting_invites enable row level security;
alter table public.invite_email_jobs enable row level security;
alter table public.meeting_transcripts enable row level security;
alter table public.meeting_recordings enable row level security;

drop policy if exists "calendar_connections_self" on public.calendar_connections;
create policy "calendar_connections_self"
on public.calendar_connections
for all
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "calendar_sync_jobs_self" on public.calendar_sync_jobs;
create policy "calendar_sync_jobs_self"
on public.calendar_sync_jobs
for all
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "meeting_invites_host_or_member" on public.meeting_invites;
create policy "meeting_invites_host_or_member"
on public.meeting_invites
for select
using (
  exists (
    select 1
    from public.meetings m
    where m.id = meeting_invites.meeting_id
      and (
        m.created_by = auth.uid()
        or exists (
          select 1
          from public.meeting_members mm
          where mm.meeting_id = m.id
            and mm.user_id = auth.uid()
        )
      )
  )
);

drop policy if exists "meeting_invites_host_insert" on public.meeting_invites;
create policy "meeting_invites_host_insert"
on public.meeting_invites
for insert
with check (
  exists (
    select 1
    from public.meetings m
    where m.id = meeting_invites.meeting_id
      and m.created_by = auth.uid()
  )
);

drop policy if exists "meeting_recordings_authorized" on public.meeting_recordings;
create policy "meeting_recordings_authorized"
on public.meeting_recordings
for select
using (
  exists (
    select 1
    from public.meetings m
    where m.id = meeting_recordings.meeting_id
      and (
        m.created_by = auth.uid()
        or exists (
          select 1
          from public.meeting_members mm
          where mm.meeting_id = m.id
            and mm.user_id = auth.uid()
        )
      )
  )
);

drop policy if exists "meeting_transcripts_authorized" on public.meeting_transcripts;
create policy "meeting_transcripts_authorized"
on public.meeting_transcripts
for select
using (
  exists (
    select 1
    from public.meetings m
    where m.id = meeting_transcripts.meeting_id
      and (
        m.created_by = auth.uid()
        or exists (
          select 1
          from public.meeting_members mm
          where mm.meeting_id = m.id
            and mm.user_id = auth.uid()
        )
      )
  )
);

create or replace function public.mark_stale_presence_offline()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set presence_status = 'offline',
      updated_at = now()
  where presence_status <> 'offline'
    and last_seen_at is not null
    and last_seen_at < now() - interval '10 minutes';
end;
$$;

create or replace function public.enqueue_pending_invites()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.invite_email_jobs (
    meeting_id,
    email,
    one_click_token,
    provider,
    status,
    created_at,
    updated_at
  )
  select
    mi.meeting_id,
    mi.email,
    mi.one_click_token,
    'supabase_queue',
    'pending',
    now(),
    now()
  from public.meeting_invites mi
  where mi.status = 'queued'
    and not exists (
      select 1
      from public.invite_email_jobs iej
      where iej.meeting_id = mi.meeting_id
        and iej.email = mi.email
        and iej.status in ('pending', 'processing')
    );
end;
$$;

create or replace function public.enqueue_calendar_sync_jobs()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.calendar_sync_jobs (
    user_id,
    meeting_id,
    provider,
    direction,
    status,
    payload,
    created_at,
    updated_at
  )
  select
    m.created_by,
    m.id,
    m.calendar_provider,
    'outbound',
    'pending',
    jsonb_build_object(
      'title', m.title,
      'scheduled_for', m.scheduled_for,
      'audience', m.audience
    ),
    now(),
    now()
  from public.meetings m
  where m.calendar_provider is not null
    and m.status = 'scheduled'
    and not exists (
      select 1
      from public.calendar_sync_jobs csj
      where csj.meeting_id = m.id
        and csj.provider = m.calendar_provider
        and csj.status in ('pending', 'processing')
    );
end;
$$;

create or replace function public.schedule_edge_job(job_name text, endpoint text, payload jsonb default '{}'::jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform
    net.http_post(
      url := endpoint,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
      ),
      body := payload
    );
end;
$$;

select cron.unschedule(jobid)
from cron.job
where jobname in (
  'doodlw-presence-cleanup',
  'doodlw-invite-queue',
  'doodlw-calendar-queue',
  'doodlw-recording-poll',
  'doodlw-transcript-poll'
);

select cron.schedule(
  'doodlw-presence-cleanup',
  '*/5 * * * *',
  $$select public.mark_stale_presence_offline();$$
);

select cron.schedule(
  'doodlw-invite-queue',
  '* * * * *',
  $$select public.enqueue_pending_invites();$$
);

select cron.schedule(
  'doodlw-calendar-queue',
  '*/2 * * * *',
  $$select public.enqueue_calendar_sync_jobs();$$
);

-- Replace the endpoint values below with your deployed Supabase Edge Function URLs.
select cron.schedule(
  'doodlw-recording-poll',
  '*/5 * * * *',
  $$select public.schedule_edge_job(
    'recording-poll',
    'https://YOUR_PROJECT_REF.supabase.co/functions/v1/recording-webhook-sync',
    '{}'::jsonb
  );$$
);

select cron.schedule(
  'doodlw-transcript-poll',
  '*/5 * * * *',
  $$select public.schedule_edge_job(
    'transcript-poll',
    'https://YOUR_PROJECT_REF.supabase.co/functions/v1/transcript-sync',
    '{}'::jsonb
  );$$
);
