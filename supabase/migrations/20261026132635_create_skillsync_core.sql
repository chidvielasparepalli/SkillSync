-- Core SkillSync schema: student profiles, exchange requests, chat messages and saved profiles.
-- Row Level Security is enabled for every public table in this migration.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default 'SkillSync member' check (char_length(full_name) between 1 and 80),
  headline text not null default '' check (char_length(headline) <= 120),
  bio text not null default '' check (char_length(bio) <= 700),
  college text not null default '' check (char_length(college) <= 120),
  skills_teach text[] not null default '{}'::text[] check (cardinality(skills_teach) <= 20),
  skills_learn text[] not null default '{}'::text[] check (cardinality(skills_learn) <= 20),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
grant select, insert, update on public.profiles to authenticated;

drop policy if exists "Authenticated users can discover profiles" on public.profiles;
create policy "Authenticated users can discover profiles"
  on public.profiles for select to authenticated using (true);
drop policy if exists "Users create their own profile" on public.profiles;
create policy "Users create their own profile"
  on public.profiles for insert to authenticated with check ((select auth.uid()) = id);
drop policy if exists "Users update their own profile" on public.profiles;
create policy "Users update their own profile"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Auth trigger creates a minimal profile as part of successful account creation.
create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(nullif(btrim(new.raw_user_meta_data ->> 'full_name'), ''), 'SkillSync member')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
revoke all on function public.handle_new_user_profile() from public, anon, authenticated;
drop trigger if exists on_auth_user_created_skill_sync on auth.users;
create trigger on_auth_user_created_skill_sync
  after insert on auth.users
  for each row execute procedure public.handle_new_user_profile();

create table if not exists public.exchange_requests (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  teach_skill text not null check (char_length(teach_skill) between 1 and 80),
  learn_skill text not null check (char_length(learn_skill) between 1 and 80),
  message text not null default '' check (char_length(message) <= 500),
  status text not null default 'pending' check (status in ('pending','accepted','rejected','cancelled','completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (sender_id <> recipient_id)
);
create index if not exists exchange_requests_recipient_status_idx
  on public.exchange_requests (recipient_id, status, created_at desc);
create index if not exists exchange_requests_sender_status_idx
  on public.exchange_requests (sender_id, status, created_at desc);
create unique index if not exists exchange_requests_one_pending_pair_idx
  on public.exchange_requests (sender_id, recipient_id) where status = 'pending';

alter table public.exchange_requests enable row level security;
grant select, insert, update on public.exchange_requests to authenticated;
drop policy if exists "Participants can view their exchange requests" on public.exchange_requests;
create policy "Participants can view their exchange requests"
  on public.exchange_requests for select to authenticated
  using ((select auth.uid()) = sender_id or (select auth.uid()) = recipient_id);
drop policy if exists "Users can send exchange requests" on public.exchange_requests;
create policy "Users can send exchange requests"
  on public.exchange_requests for insert to authenticated
  with check ((select auth.uid()) = sender_id and sender_id <> recipient_id and status = 'pending');
drop policy if exists "Participants can update exchange status" on public.exchange_requests;
create policy "Participants can update exchange status"
  on public.exchange_requests for update to authenticated
  using ((select auth.uid()) = sender_id or (select auth.uid()) = recipient_id)
  with check ((select auth.uid()) = sender_id or (select auth.uid()) = recipient_id);

create or replace function public.guard_exchange_request_updates()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
begin
  if new.id is distinct from old.id
     or new.sender_id is distinct from old.sender_id
     or new.recipient_id is distinct from old.recipient_id
     or new.teach_skill is distinct from old.teach_skill
     or new.learn_skill is distinct from old.learn_skill
     or new.message is distinct from old.message
     or new.created_at is distinct from old.created_at then
    raise exception 'Exchange request details cannot be changed after submission.';
  end if;
  if actor = old.sender_id then
    if old.status = 'pending' and new.status not in ('pending', 'cancelled') then
      raise exception 'A sender can only cancel a pending request.';
    end if;
    if old.status = 'accepted' and new.status not in ('accepted', 'completed') then
      raise exception 'An accepted exchange can only be marked completed.';
    end if;
    if old.status in ('rejected', 'cancelled', 'completed') and new.status is distinct from old.status then
      raise exception 'This request can no longer be changed.';
    end if;
  elsif actor = old.recipient_id then
    if old.status = 'pending' and new.status not in ('pending', 'accepted', 'rejected') then
      raise exception 'A recipient can accept or reject a pending request.';
    end if;
    if old.status = 'accepted' and new.status not in ('accepted', 'completed') then
      raise exception 'An accepted exchange can only be marked completed.';
    end if;
    if old.status in ('rejected', 'cancelled', 'completed') and new.status is distinct from old.status then
      raise exception 'This request can no longer be changed.';
    end if;
  else
    raise exception 'Only exchange participants can update this request.';
  end if;
  new.updated_at := now();
  return new;
end;
$$;
drop trigger if exists guard_exchange_request_updates_trigger on public.exchange_requests;
create trigger guard_exchange_request_updates_trigger
  before update on public.exchange_requests
  for each row execute procedure public.guard_exchange_request_updates();

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.exchange_requests(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(btrim(body)) between 1 and 2000),
  created_at timestamptz not null default now()
);
create index if not exists messages_request_created_idx on public.messages (request_id, created_at);
alter table public.messages enable row level security;
grant select, insert on public.messages to authenticated;
drop policy if exists "Accepted exchange participants can read messages" on public.messages;
create policy "Accepted exchange participants can read messages"
  on public.messages for select to authenticated using (exists (
    select 1 from public.exchange_requests r
    where r.id = messages.request_id
      and ((select auth.uid()) = r.sender_id or (select auth.uid()) = r.recipient_id)
      and r.status in ('accepted', 'completed')
  ));
drop policy if exists "Users can message accepted exchange partners" on public.messages;
create policy "Users can message accepted exchange partners"
  on public.messages for insert to authenticated with check (
    (select auth.uid()) = sender_id and exists (
      select 1 from public.exchange_requests r
      where r.id = messages.request_id
        and ((select auth.uid()) = r.sender_id or (select auth.uid()) = r.recipient_id)
        and r.status = 'accepted'
    )
  );

create table if not exists public.saved_profiles (
  user_id uuid not null references public.profiles(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, profile_id),
  check (user_id <> profile_id)
);
alter table public.saved_profiles enable row level security;
grant select, insert, delete on public.saved_profiles to authenticated;
drop policy if exists "Users read their saved profiles" on public.saved_profiles;
create policy "Users read their saved profiles"
  on public.saved_profiles for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "Users save profiles" on public.saved_profiles;
create policy "Users save profiles"
  on public.saved_profiles for insert to authenticated with check ((select auth.uid()) = user_id and user_id <> profile_id);
drop policy if exists "Users unsave profiles" on public.saved_profiles;
create policy "Users unsave profiles"
  on public.saved_profiles for delete to authenticated using ((select auth.uid()) = user_id);
