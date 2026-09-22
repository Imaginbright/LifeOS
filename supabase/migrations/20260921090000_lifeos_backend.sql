create extension if not exists pgcrypto with schema extensions;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'You' check (char_length(display_name) between 1 and 80),
  email text,
  appearance text not null default 'system' check (appearance in ('light', 'dark', 'system')),
  currency text not null default 'NGN' check (currency in ('NGN', 'USD', 'GBP', 'EUR')),
  start_of_week text not null default 'monday' check (start_of_week in ('sunday', 'monday')),
  notifications boolean not null default true,
  timezone text not null default 'Africa/Lagos',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade default auth.uid(),
  title text not null check (char_length(title) between 1 and 120),
  due_date date not null,
  completed boolean not null default false,
  priority text not null default 'Medium' check (priority in ('Low', 'Medium', 'High')),
  category text not null default 'Other' check (category in ('Content', 'Development', 'Personal', 'Admin', 'Health', 'Other')),
  scope text not null default 'daily' check (scope in ('daily', 'monthly')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade default auth.uid(),
  title text not null check (char_length(title) between 1 and 100),
  description text not null default '' check (char_length(description) <= 250),
  current_value numeric not null default 0 check (current_value >= 0),
  target_value numeric not null check (target_value > 0),
  unit text not null check (char_length(unit) between 1 and 30),
  deadline date not null,
  category text not null default 'Personal' check (char_length(category) between 1 and 40),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.goal_checkins (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references public.goals(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade default auth.uid(),
  value numeric not null check (value >= 0),
  note text check (note is null or char_length(note) <= 250),
  checked_in_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now())
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade default auth.uid(),
  name text not null check (char_length(name) between 1 and 80),
  amount numeric(14,2) not null check (amount > 0),
  currency text not null check (currency in ('NGN', 'USD', 'GBP', 'EUR')),
  billing_cycle text not null check (billing_cycle in ('monthly', 'yearly', 'weekly', 'custom')),
  custom_interval_days integer check (
    (billing_cycle = 'custom' and custom_interval_days > 0)
    or (billing_cycle <> 'custom' and custom_interval_days is null)
  ),
  renewal_date date not null,
  category text not null default 'Other' check (char_length(category) between 1 and 40),
  icon text check (icon is null or char_length(icon) <= 40),
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.inbox_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  source_key text not null,
  category text not null check (category in ('Subscription', 'Tasks', 'Goals', 'Creator', 'Review', 'Calendar', 'System')),
  title text not null check (char_length(title) between 1 and 140),
  description text not null default '' check (char_length(description) <= 500),
  event_at timestamptz not null default timezone('utc', now()),
  read_at timestamptz,
  dismissed_at timestamptz,
  action_label text not null default 'View' check (char_length(action_label) between 1 and 40),
  href text not null default '/' check (href like '/%'),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, source_key)
);

create table public.connected_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  platform text not null check (platform in ('youtube', 'tiktok', 'instagram')),
  external_account_id text not null,
  display_name text not null,
  username text,
  avatar_url text,
  status text not null default 'connected' check (status in ('connected', 'expired', 'error')),
  granted_scopes text[] not null default '{}',
  last_synced_at timestamptz,
  last_error text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, platform),
  unique (platform, external_account_id)
);

create table public.oauth_credentials (
  connected_account_id uuid primary key references public.connected_accounts(id) on delete cascade,
  access_token text not null,
  refresh_token text,
  token_type text,
  expires_at timestamptz,
  refresh_expires_at timestamptz,
  scope text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.social_snapshots (
  id uuid primary key default gen_random_uuid(),
  connected_account_id uuid not null references public.connected_accounts(id) on delete cascade,
  captured_at timestamptz not null default timezone('utc', now()),
  followers bigint not null default 0 check (followers >= 0),
  views bigint check (views is null or views >= 0),
  videos bigint check (videos is null or videos >= 0),
  source_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  unique (connected_account_id, captured_at)
);

create index tasks_user_due_idx on public.tasks (user_id, due_date);
create index goals_user_deadline_idx on public.goals (user_id, deadline);
create index goal_checkins_goal_date_idx on public.goal_checkins (goal_id, checked_in_at desc);
create index subscriptions_user_renewal_idx on public.subscriptions (user_id, renewal_date) where active;
create index inbox_user_event_idx on public.inbox_items (user_id, event_at desc) where dismissed_at is null;
create index connected_accounts_user_idx on public.connected_accounts (user_id);
create index social_snapshots_account_date_idx on public.social_snapshots (connected_account_id, captured_at desc);

create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();
create trigger tasks_set_updated_at before update on public.tasks
for each row execute function public.set_updated_at();
create trigger goals_set_updated_at before update on public.goals
for each row execute function public.set_updated_at();
create trigger subscriptions_set_updated_at before update on public.subscriptions
for each row execute function public.set_updated_at();
create trigger inbox_items_set_updated_at before update on public.inbox_items
for each row execute function public.set_updated_at();
create trigger connected_accounts_set_updated_at before update on public.connected_accounts
for each row execute function public.set_updated_at();
create trigger oauth_credentials_set_updated_at before update on public.oauth_credentials
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, email)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), nullif(split_part(new.email, '@', 1), ''), 'You'),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

insert into public.profiles (id, display_name, email)
select id, coalesce(nullif(raw_user_meta_data ->> 'display_name', ''), nullif(split_part(email, '@', 1), ''), 'You'), email
from auth.users
on conflict (id) do nothing;

alter table public.profiles enable row level security;
alter table public.tasks enable row level security;
alter table public.goals enable row level security;
alter table public.goal_checkins enable row level security;
alter table public.subscriptions enable row level security;
alter table public.inbox_items enable row level security;
alter table public.connected_accounts enable row level security;
alter table public.oauth_credentials enable row level security;
alter table public.social_snapshots enable row level security;

revoke all on table public.profiles, public.tasks, public.goals, public.goal_checkins,
  public.subscriptions, public.inbox_items, public.connected_accounts,
  public.oauth_credentials, public.social_snapshots from anon, authenticated;

grant select, insert, update, delete on table public.profiles, public.tasks, public.goals,
  public.goal_checkins, public.subscriptions to authenticated;
grant select, update on table public.inbox_items to authenticated;
grant select on table public.connected_accounts, public.social_snapshots to authenticated;
grant all on table public.profiles, public.tasks, public.goals, public.goal_checkins,
  public.subscriptions, public.inbox_items, public.connected_accounts,
  public.oauth_credentials, public.social_snapshots to service_role;

create policy profiles_select_own on public.profiles for select to authenticated
using ((select auth.uid()) = id);
create policy profiles_insert_own on public.profiles for insert to authenticated
with check ((select auth.uid()) = id);
create policy profiles_update_own on public.profiles for update to authenticated
using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy profiles_delete_own on public.profiles for delete to authenticated
using ((select auth.uid()) = id);

create policy tasks_select_own on public.tasks for select to authenticated
using ((select auth.uid()) = user_id);
create policy tasks_insert_own on public.tasks for insert to authenticated
with check ((select auth.uid()) = user_id);
create policy tasks_update_own on public.tasks for update to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy tasks_delete_own on public.tasks for delete to authenticated
using ((select auth.uid()) = user_id);

create policy goals_select_own on public.goals for select to authenticated
using ((select auth.uid()) = user_id);
create policy goals_insert_own on public.goals for insert to authenticated
with check ((select auth.uid()) = user_id);
create policy goals_update_own on public.goals for update to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy goals_delete_own on public.goals for delete to authenticated
using ((select auth.uid()) = user_id);

create policy goal_checkins_select_own on public.goal_checkins for select to authenticated
using ((select auth.uid()) = user_id);
create policy goal_checkins_insert_own on public.goal_checkins for insert to authenticated
with check (
  (select auth.uid()) = user_id
  and exists (select 1 from public.goals where goals.id = goal_id and goals.user_id = (select auth.uid()))
);
create policy goal_checkins_update_own on public.goal_checkins for update to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy goal_checkins_delete_own on public.goal_checkins for delete to authenticated
using ((select auth.uid()) = user_id);

create policy subscriptions_select_own on public.subscriptions for select to authenticated
using ((select auth.uid()) = user_id);
create policy subscriptions_insert_own on public.subscriptions for insert to authenticated
with check ((select auth.uid()) = user_id);
create policy subscriptions_update_own on public.subscriptions for update to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy subscriptions_delete_own on public.subscriptions for delete to authenticated
using ((select auth.uid()) = user_id);

create policy inbox_items_select_own on public.inbox_items for select to authenticated
using ((select auth.uid()) = user_id);
create policy inbox_items_update_own on public.inbox_items for update to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy connected_accounts_select_own on public.connected_accounts for select to authenticated
using ((select auth.uid()) = user_id);

create policy social_snapshots_select_own on public.social_snapshots for select to authenticated
using (
  exists (
    select 1 from public.connected_accounts
    where connected_accounts.id = connected_account_id
      and connected_accounts.user_id = (select auth.uid())
  )
);

revoke execute on function public.set_updated_at() from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
grant execute on function public.set_updated_at(), public.handle_new_user() to service_role;
