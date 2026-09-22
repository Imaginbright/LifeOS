revoke update, delete on table public.goal_checkins from authenticated;
drop policy if exists goal_checkins_update_own on public.goal_checkins;
drop policy if exists goal_checkins_delete_own on public.goal_checkins;

revoke update on table public.inbox_items from authenticated;
grant update (read_at, dismissed_at) on table public.inbox_items to authenticated;
