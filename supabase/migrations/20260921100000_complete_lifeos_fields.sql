alter table public.tasks
  add column notes text check (notes is null or char_length(notes) <= 1000),
  add column period_month date,
  add column completed_at timestamptz,
  alter column due_date drop not null;

alter table public.tasks drop constraint tasks_priority_check;
alter table public.tasks alter column priority set default 'medium';
alter table public.tasks add constraint tasks_priority_check check (priority in ('low', 'medium', 'high'));

alter table public.goals add column completed_at timestamptz;

alter table public.inbox_items
  add column metadata jsonb not null default '{}'::jsonb,
  add column resolved_at timestamptz;

alter table public.connected_accounts drop constraint connected_accounts_status_check;
alter table public.connected_accounts alter column status set default 'connected';
alter table public.connected_accounts add constraint connected_accounts_status_check
  check (status in ('not_connected', 'connected', 'needs_setup', 'token_expired', 'error'));
alter table public.connected_accounts
  add column environment text check (environment in ('sandbox', 'production') or environment is null),
  add column connected_at timestamptz,
  add column disconnected_at timestamptz;

alter table public.social_snapshots
  add column user_id uuid references public.profiles(id) on delete cascade,
  add column provider text check (provider in ('youtube', 'tiktok', 'instagram')),
  add column following bigint check (following is null or following >= 0),
  add column likes bigint check (likes is null or likes >= 0);

update public.social_snapshots s
set user_id = a.user_id, provider = a.platform
from public.connected_accounts a
where a.id = s.connected_account_id;

alter table public.social_snapshots
  alter column user_id set not null,
  alter column provider set not null,
  alter column followers drop not null,
  alter column followers drop default;

create index social_snapshots_user_provider_date_idx
  on public.social_snapshots (user_id, provider, captured_at desc);

drop policy social_snapshots_select_own on public.social_snapshots;
create policy social_snapshots_select_own on public.social_snapshots for select to authenticated
using ((select auth.uid()) = user_id);
