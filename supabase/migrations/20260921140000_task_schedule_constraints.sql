alter table public.tasks
  add constraint tasks_scope_dates_check check (
    (scope = 'daily' and due_date is not null and period_month is null)
    or
    (scope = 'monthly' and due_date is null and period_month is not null and period_month = date_trunc('month', period_month)::date)
  ),
  add constraint tasks_completion_timestamp_check check (
    (completed = false and completed_at is null)
    or completed = true
  );
