-- ============================================================================
-- BasseyFlow — Supabase schema with Row Level Security
-- ----------------------------------------------------------------------------
-- Run this entire file in the Supabase SQL Editor (Project → SQL → New query)
-- after creating your Supabase project. It is idempotent and safe to re-run.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. profiles
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  full_name   text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists profiles_email_idx on public.profiles (email);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own"   on public.profiles;
drop policy if exists "profiles_insert_own"   on public.profiles;
drop policy if exists "profiles_update_own"   on public.profiles;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Auto-create a profile row when a new auth user is created.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Keep updated_at fresh.
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch
  before update on public.profiles
  for each row execute function public.touch_updated_at();

-- ----------------------------------------------------------------------------
-- 2. transactions
-- ----------------------------------------------------------------------------
create table if not exists public.transactions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  type         text not null check (type in ('income', 'expense')),
  category     text not null,
  amount       numeric(14, 2) not null check (amount >= 0),
  description  text not null default '',
  date         date not null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists transactions_user_id_idx      on public.transactions (user_id);
create index if not exists transactions_user_date_idx     on public.transactions (user_id, date desc);
create index if not exists transactions_user_type_idx     on public.transactions (user_id, type);
create index if not exists transactions_user_category_idx on public.transactions (user_id, category);

alter table public.transactions enable row level security;

drop policy if exists "transactions_select_own" on public.transactions;
drop policy if exists "transactions_insert_own" on public.transactions;
drop policy if exists "transactions_update_own" on public.transactions;
drop policy if exists "transactions_delete_own" on public.transactions;

create policy "transactions_select_own"
  on public.transactions for select
  using (auth.uid() = user_id);

create policy "transactions_insert_own"
  on public.transactions for insert
  with check (auth.uid() = user_id);

create policy "transactions_update_own"
  on public.transactions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "transactions_delete_own"
  on public.transactions for delete
  using (auth.uid() = user_id);

drop trigger if exists transactions_touch on public.transactions;
create trigger transactions_touch
  before update on public.transactions
  for each row execute function public.touch_updated_at();

-- ----------------------------------------------------------------------------
-- 3. budgets
-- ----------------------------------------------------------------------------
create table if not exists public.budgets (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  category    text not null,
  amount      numeric(14, 2) not null check (amount >= 0),
  period      text not null default 'monthly' check (period in ('monthly', 'weekly', 'yearly')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id, category)
);

create index if not exists budgets_user_id_idx on public.budgets (user_id);

alter table public.budgets enable row level security;

drop policy if exists "budgets_select_own" on public.budgets;
drop policy if exists "budgets_insert_own" on public.budgets;
drop policy if exists "budgets_update_own" on public.budgets;
drop policy if exists "budgets_delete_own" on public.budgets;

create policy "budgets_select_own"
  on public.budgets for select
  using (auth.uid() = user_id);

create policy "budgets_insert_own"
  on public.budgets for insert
  with check (auth.uid() = user_id);

create policy "budgets_update_own"
  on public.budgets for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "budgets_delete_own"
  on public.budgets for delete
  using (auth.uid() = user_id);

drop trigger if exists budgets_touch on public.budgets;
create trigger budgets_touch
  before update on public.budgets
  for each row execute function public.touch_updated_at();

-- ----------------------------------------------------------------------------
-- 4. savings_goals (optional future use; pre-wired with RLS)
-- ----------------------------------------------------------------------------
create table if not exists public.savings_goals (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  name            text not null,
  target_amount   numeric(14, 2) not null check (target_amount >= 0),
  current_amount  numeric(14, 2) not null default 0 check (current_amount >= 0),
  deadline        date,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists savings_goals_user_id_idx on public.savings_goals (user_id);

alter table public.savings_goals enable row level security;

drop policy if exists "savings_goals_select_own" on public.savings_goals;
drop policy if exists "savings_goals_insert_own" on public.savings_goals;
drop policy if exists "savings_goals_update_own" on public.savings_goals;
drop policy if exists "savings_goals_delete_own" on public.savings_goals;

create policy "savings_goals_select_own"
  on public.savings_goals for select
  using (auth.uid() = user_id);
create policy "savings_goals_insert_own"
  on public.savings_goals for insert
  with check (auth.uid() = user_id);
create policy "savings_goals_update_own"
  on public.savings_goals for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
create policy "savings_goals_delete_own"
  on public.savings_goals for delete
  using (auth.uid() = user_id);

drop trigger if exists savings_goals_touch on public.savings_goals;
create trigger savings_goals_touch
  before update on public.savings_goals
  for each row execute function public.touch_updated_at();

-- ============================================================================
-- End of schema. Every user-owned table is protected by RLS and only allows
-- the row's owner (auth.uid() = user_id) to read, insert, update, or delete.
-- ============================================================================
