create table public.task_recurrences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade default auth.uid(),
  title text not null check (char_length(title) between 1 and 120),
  notes text not null default '' check (char_length(notes) <= 1000),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  category text not null default 'Other' check (category in ('Content', 'Development', 'Personal', 'Admin', 'Health', 'Other')),
  frequency text not null check (frequency in ('daily', 'weekly', 'monthly')),
  interval_count integer not null default 1 check (interval_count between 1 and 365),
  weekdays integer[] not null default '{}',
  day_of_month integer check (day_of_month between 1 and 31),
  starts_on date not null,
  ends_on date,
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (id, user_id),
  constraint recurrence_dates_check check (ends_on is null or ends_on >= starts_on),
  constraint recurrence_rule_check check (
    (frequency = 'weekly' and cardinality(weekdays) between 1 and 7 and weekdays <@ array[1,2,3,4,5,6,7] and day_of_month is null)
    or (frequency = 'monthly' and cardinality(weekdays) = 0 and day_of_month is not null)
    or (frequency = 'daily' and cardinality(weekdays) = 0 and day_of_month is null)
  )
);

create trigger task_recurrences_set_updated_at before update on public.task_recurrences
  for each row execute function public.set_updated_at();

alter table public.tasks
  add column recurrence_id uuid,
  add column occurrence_date date,
  add column skipped boolean not null default false,
  add constraint tasks_recurrence_owner_fkey foreign key (recurrence_id, user_id)
    references public.task_recurrences(id, user_id) on delete restrict,
  add constraint tasks_recurrence_shape_check check (
    (recurrence_id is null and occurrence_date is null and skipped = false)
    or (recurrence_id is not null and occurrence_date is not null and scope = 'daily')
  ),
  add constraint tasks_skipped_completion_check check (not (skipped and completed));

create unique index tasks_recurrence_occurrence_unique
  on public.tasks (recurrence_id, occurrence_date);
create index task_recurrences_user_active_idx on public.task_recurrences (user_id, active);
create index tasks_user_unresolved_due_idx on public.tasks (user_id, due_date)
  where completed = false and skipped = false;

alter table public.task_recurrences enable row level security;
revoke all on table public.task_recurrences from public, anon, authenticated;
grant select, insert, update, delete on table public.task_recurrences to authenticated;
grant all on table public.task_recurrences to service_role;

create policy task_recurrences_select_own on public.task_recurrences for select to authenticated
  using ((select auth.uid()) = user_id);
create policy task_recurrences_insert_own on public.task_recurrences for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy task_recurrences_update_own on public.task_recurrences for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy task_recurrences_delete_own on public.task_recurrences for delete to authenticated
  using ((select auth.uid()) = user_id);
