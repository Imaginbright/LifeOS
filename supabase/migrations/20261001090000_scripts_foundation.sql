create table public.scripts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade default auth.uid(),
  title text not null default 'Untitled script' check (char_length(title) between 1 and 180),
  type text not null check (type in ('longform', 'shorts', 'blog')),
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  template_id uuid,
  content text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index scripts_user_status_updated_idx on public.scripts (user_id, status, updated_at desc);

create trigger scripts_set_updated_at before update on public.scripts
  for each row execute function public.set_updated_at();

alter table public.scripts enable row level security;
revoke all on table public.scripts from public, anon, authenticated;
grant select, insert, update, delete on table public.scripts to authenticated;
grant all on table public.scripts to service_role;

create policy scripts_select_own on public.scripts for select to authenticated
  using ((select auth.uid()) = user_id);
create policy scripts_insert_own on public.scripts for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy scripts_update_own on public.scripts for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy scripts_delete_own on public.scripts for delete to authenticated
  using ((select auth.uid()) = user_id);
