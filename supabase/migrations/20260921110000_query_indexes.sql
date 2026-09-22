create index tasks_user_scope_idx on public.tasks (user_id, scope);
create index inbox_user_state_idx on public.inbox_items (user_id, dismissed_at, resolved_at);
