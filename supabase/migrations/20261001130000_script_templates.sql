create table public.script_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade default auth.uid(),
  name text not null check (char_length(btrim(name)) between 1 and 180),
  type text not null check (type in ('longform', 'shorts', 'blog')),
  source_markdown text not null check (char_length(btrim(source_markdown)) between 1 and 500000),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index script_templates_user_updated_idx on public.script_templates (user_id, updated_at desc);

create trigger script_templates_set_updated_at before update on public.script_templates
  for each row execute function public.set_updated_at();

alter table public.script_templates enable row level security;
revoke all on table public.script_templates from public, anon, authenticated;
grant select, insert, update, delete on table public.script_templates to authenticated;
grant all on table public.script_templates to service_role;

create policy script_templates_select_own on public.script_templates for select to authenticated
  using ((select auth.uid()) = user_id);
create policy script_templates_insert_own on public.script_templates for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy script_templates_update_own on public.script_templates for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy script_templates_delete_own on public.script_templates for delete to authenticated
  using ((select auth.uid()) = user_id);
