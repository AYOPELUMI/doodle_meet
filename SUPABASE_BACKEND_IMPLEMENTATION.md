# Supabase Backend Implementation

## Goal

Support `Doodlw Meet` with:

- Supabase Auth using SSR cookie sessions
- User profile storage
- Meeting persistence for dashboard and scheduling
- Optional participant membership/history
- Stream token issuance tied to authenticated users

The frontend already expects:

- `profiles`
- `meetings`
- authenticated cookie sessions
- a server route that can issue Stream tokens

## Environment Variables

Set these in Supabase-hosted app or deployment environment:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_STREAM_API_KEY=
STREAM_API_SECRET=
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_SITE_URL_PROD=
NEXT_PUBLIC_GOOGLE_CLIENT_ID=
```

## Auth Strategy

- Use Supabase Auth with PKCE.
- Let `@supabase/ssr` store access and refresh tokens in cookies.
- Keep the custom `doodlw-user` cookie as lightweight UI identity only.
- Enable providers you want in Supabase Auth:
  - Email/password
  - Google
  - GitHub

## Database Schema

```sql
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text,
  avatar_url text,
  timezone text default 'Africa/Lagos',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.meetings (
  id text primary key,
  created_by uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  room_mode text not null default 'video' check (room_mode in ('video', 'audio')),
  status text not null default 'live' check (status in ('live', 'scheduled', 'ended', 'cancelled')),
  scheduled_for timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.meeting_members (
  meeting_id text not null references public.meetings(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'participant' check (role in ('host', 'participant')),
  joined_at timestamptz,
  left_at timestamptz,
  primary key (meeting_id, user_id)
);

create table if not exists public.meeting_events (
  id bigint generated always as identity primary key,
  meeting_id text not null references public.meetings(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
```

## Triggers

```sql
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.handle_updated_at();

drop trigger if exists set_meetings_updated_at on public.meetings;
create trigger set_meetings_updated_at
before update on public.meetings
for each row execute function public.handle_updated_at();
```

## Auto Profile Creation

```sql
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture')
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = excluded.full_name,
    avatar_url = excluded.avatar_url,
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
```

## RLS Policies

Enable RLS:

```sql
alter table public.profiles enable row level security;
alter table public.meetings enable row level security;
alter table public.meeting_members enable row level security;
alter table public.meeting_events enable row level security;
```

Profiles:

```sql
create policy "profiles_select_self"
on public.profiles
for select
using (auth.uid() = id);

create policy "profiles_update_self"
on public.profiles
for update
using (auth.uid() = id);
```

Meetings:

```sql
create policy "meetings_select_host_or_member"
on public.meetings
for select
using (
  created_by = auth.uid()
  or exists (
    select 1
    from public.meeting_members mm
    where mm.meeting_id = meetings.id
      and mm.user_id = auth.uid()
  )
);

create policy "meetings_insert_host"
on public.meetings
for insert
with check (created_by = auth.uid());

create policy "meetings_update_host"
on public.meetings
for update
using (created_by = auth.uid());
```

Meeting members:

```sql
create policy "meeting_members_select_host_or_self"
on public.meeting_members
for select
using (
  user_id = auth.uid()
  or exists (
    select 1
    from public.meetings m
    where m.id = meeting_members.meeting_id
      and m.created_by = auth.uid()
  )
);

create policy "meeting_members_insert_host_or_self"
on public.meeting_members
for insert
with check (
  user_id = auth.uid()
  or exists (
    select 1
    from public.meetings m
    where m.id = meeting_members.meeting_id
      and m.created_by = auth.uid()
  )
);
```

Meeting events:

```sql
create policy "meeting_events_select_authorized"
on public.meeting_events
for select
using (
  exists (
    select 1
    from public.meetings m
    where m.id = meeting_events.meeting_id
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

create policy "meeting_events_insert_authorized"
on public.meeting_events
for insert
with check (
  actor_id = auth.uid()
);
```

## Stream Token Issuance

Use a server-side route or edge function only. Never expose `STREAM_API_SECRET` in the browser.

Expected flow:

1. Read the authenticated Supabase user from server cookies.
2. Read `profiles.full_name` and `avatar_url`.
3. Generate a Stream user token using the same Stream app for chat and video.
4. Return:
   - `apiKey`
   - `token`
   - `user.id`
   - `user.name`
   - `user.image`

The app now implements this in `/api/stream/token`.

## Recommended Edge Functions

- `create-stream-token`
  - Input: authenticated request
  - Output: Stream token payload

- `meeting-webhook`
  - Accept Stream webhooks for call started, call ended, recording ready, participant joined, participant left
  - Write normalized events into `meeting_events`
  - Update `meetings.status`

- `upsert-meeting-member`
  - Called when invite acceptance or direct join should persist membership

## Recording and Analytics Extension

If you want dashboard recordings/history to become real:

- Add `meeting_recordings`
- Store Stream recording metadata:
  - `meeting_id`
  - `stream_call_cid`
  - `url`
  - `duration_seconds`
  - `started_at`
  - `ended_at`

Suggested schema:

```sql
create table if not exists public.meeting_recordings (
  id bigint generated always as identity primary key,
  meeting_id text not null references public.meetings(id) on delete cascade,
  stream_call_cid text not null,
  url text not null,
  duration_seconds integer,
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz not null default now()
);
```

## Frontend Contract Notes

The current frontend assumes:

- a meeting can still open even if the `meetings` insert fails
- dashboard data comes from `public.meetings`
- room IDs are generated client-side with `nanoid`
- chat uses a Stream `livestream` channel keyed by the meeting ID
- video uses Stream call type:
  - `default` for video
  - `audio_room` for audio-only rooms

## Deployment Checklist

1. Enable Supabase email auth and OAuth providers.
2. Add all redirect URLs:
   - `/auth/callback`
   - `/auth/callback/hash-handler`
   - production origin
   - local origin
3. Run schema SQL and RLS policies.
4. Add Stream API key and secret.
5. Verify `/api/stream/token` returns a token for authenticated users.
6. Create at least one meeting and confirm it appears on `/dashboard`.
7. Join the same meeting from two browsers and verify:
   - video/audio connect
   - chat syncs
   - dashboard still loads from cookie session

## Nice-to-Have Next

- Presence and last-seen indicators
- Calendar sync table for Google/Outlook
- Recording ingestion job
- Meeting transcripts
- Invite emails with one-click join

## Implemented Expansion

The app now includes frontend contracts and API routes for these features:

- `POST /api/presence/ping`
- `POST /api/meetings/schedule`
- `POST /api/settings/profile`

Those routes assume the schema below exists.

## Expanded Schema

```sql
alter table public.profiles
  add column if not exists presence_status text default 'offline',
  add column if not exists last_seen_at timestamptz,
  add column if not exists preferred_calendar_provider text,
  add column if not exists notify_meeting_reminders boolean not null default true,
  add column if not exists notify_chat_messages boolean not null default true,
  add column if not exists notify_recording_ready boolean not null default true,
  add column if not exists notify_transcript_ready boolean not null default true,
  add column if not exists invite_one_click_join boolean not null default true,
  add column if not exists auto_sync_calendar boolean not null default false;

alter table public.meetings
  add column if not exists visibility text default 'private' check (visibility in ('public', 'private')),
  add column if not exists waiting_room_enabled boolean not null default true,
  add column if not exists auto_record_enabled boolean not null default false,
  add column if not exists auto_transcript_enabled boolean not null default false,
  add column if not exists duration_minutes integer,
  add column if not exists calendar_provider text;

alter table public.meeting_members
  add column if not exists last_seen_at timestamptz;

create table if not exists public.calendar_connections (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  provider text not null check (provider in ('google', 'outlook')),
  status text not null default 'available' check (status in ('available', 'connected', 'error', 'revoked')),
  external_email text,
  external_calendar_id text,
  refresh_token_encrypted text,
  scopes text[] not null default '{}'::text[],
  last_sync_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, provider)
);

create table if not exists public.calendar_sync_jobs (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  meeting_id text references public.meetings(id) on delete cascade,
  provider text not null check (provider in ('google', 'outlook')),
  direction text not null default 'outbound' check (direction in ('outbound', 'inbound')),
  status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'failed')),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.meeting_invites (
  id bigint generated always as identity primary key,
  meeting_id text not null references public.meetings(id) on delete cascade,
  email text not null,
  status text not null default 'queued' check (status in ('queued', 'sent', 'accepted', 'expired', 'failed')),
  one_click_token text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (meeting_id, email)
);

create table if not exists public.invite_email_jobs (
  id bigint generated always as identity primary key,
  meeting_id text not null references public.meetings(id) on delete cascade,
  email text not null,
  one_click_token text not null,
  provider text not null default 'supabase_queue',
  status text not null default 'pending' check (status in ('pending', 'processing', 'sent', 'failed')),
  provider_message_id text,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.meeting_transcripts (
  id bigint generated always as identity primary key,
  meeting_id text not null references public.meetings(id) on delete cascade,
  stream_call_cid text,
  language text default 'en',
  status text not null default 'processing' check (status in ('processing', 'ready', 'failed')),
  content text,
  summary text,
  speaker_map jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.meeting_recordings
  add column if not exists transcript_status text;
```

## New RLS

```sql
alter table public.calendar_connections enable row level security;
alter table public.calendar_sync_jobs enable row level security;
alter table public.meeting_invites enable row level security;
alter table public.invite_email_jobs enable row level security;
alter table public.meeting_transcripts enable row level security;
alter table public.meeting_recordings enable row level security;
```

```sql
create policy "calendar_connections_self"
on public.calendar_connections
for all
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "calendar_sync_jobs_self"
on public.calendar_sync_jobs
for all
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "meeting_invites_host_or_member"
on public.meeting_invites
for select
using (
  exists (
    select 1 from public.meetings m
    where m.id = meeting_invites.meeting_id
      and (
        m.created_by = auth.uid()
        or exists (
          select 1 from public.meeting_members mm
          where mm.meeting_id = m.id and mm.user_id = auth.uid()
        )
      )
  )
);

create policy "meeting_invites_host_insert"
on public.meeting_invites
for insert
with check (
  exists (
    select 1 from public.meetings m
    where m.id = meeting_invites.meeting_id
      and m.created_by = auth.uid()
  )
);

create policy "meeting_recordings_authorized"
on public.meeting_recordings
for select
using (
  exists (
    select 1 from public.meetings m
    where m.id = meeting_recordings.meeting_id
      and (
        m.created_by = auth.uid()
        or exists (
          select 1 from public.meeting_members mm
          where mm.meeting_id = m.id and mm.user_id = auth.uid()
        )
      )
  )
);

create policy "meeting_transcripts_authorized"
on public.meeting_transcripts
for select
using (
  exists (
    select 1 from public.meetings m
    where m.id = meeting_transcripts.meeting_id
      and (
        m.created_by = auth.uid()
        or exists (
          select 1 from public.meeting_members mm
          where mm.meeting_id = m.id and mm.user_id = auth.uid()
        )
      )
  )
);
```

## Worker / Edge Function Responsibilities

### Presence

- A lightweight client heartbeat now updates:
  - `profiles.last_seen_at`
  - `profiles.presence_status`
  - `meeting_members.last_seen_at`

### Calendar Sync

- Consume `calendar_sync_jobs`
- Create or update provider calendar events
- Store external ids on `calendar_connections` or a future `calendar_events` table

### Invite Emails

- Consume `invite_email_jobs`
- Compose a join link like:
  - `/meeting/<meeting_id>?invite=<one_click_token>`
- Mark `meeting_invites.status` and `invite_email_jobs.status`

### Recordings

- Consume Stream call webhooks
- Insert into `meeting_recordings`
- Update `meetings.status`

### Transcripts

- When transcript processing finishes, insert or update `meeting_transcripts`
- Optionally generate `summary`
