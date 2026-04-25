-- GJ Habits schema
-- Run in Supabase SQL Editor

create extension if not exists "pgcrypto";

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric(12,2) not null check (amount > 0),
  category text not null,
  payment_method text not null,
  description text,
  spent_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  habit_type text not null,
  done_at timestamptz not null default now(),
  duration_minutes integer check (duration_minutes is null or duration_minutes >= 0),
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.bets (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  type text not null,
  condition_type text not null,
  penalty text not null,
  reward text,
  created_by uuid not null references auth.users(id) on delete cascade,
  assigned_to uuid references auth.users(id) on delete set null,
  starts_at timestamptz,
  ends_at timestamptz,
  status text not null default 'active',
  winner_user_id uuid references auth.users(id) on delete set null,
  loser_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.bet_results (
  id uuid primary key default gen_random_uuid(),
  bet_id uuid not null references public.bets(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  result text not null,
  points_change integer not null default 0,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists expenses_spent_at_idx on public.expenses (spent_at desc);
create index if not exists expenses_user_id_idx on public.expenses (user_id);
create index if not exists expenses_category_idx on public.expenses (category);
create index if not exists expenses_payment_method_idx on public.expenses (payment_method);

create index if not exists habits_done_at_idx on public.habits (done_at desc);
create index if not exists habits_user_id_idx on public.habits (user_id);
create index if not exists habits_type_idx on public.habits (habit_type);

create index if not exists bets_status_idx on public.bets (status);
create index if not exists bets_ends_at_idx on public.bets (ends_at);
create index if not exists bets_created_by_idx on public.bets (created_by);
create index if not exists bet_results_bet_idx on public.bet_results (bet_id);
create index if not exists bet_results_user_idx on public.bet_results (user_id);
create index if not exists bet_results_created_at_idx on public.bet_results (created_at desc);

alter table public.expenses enable row level security;
alter table public.habits enable row level security;
alter table public.bets enable row level security;
alter table public.bet_results enable row level security;

drop function if exists public.is_gj_member();
create function public.is_gj_member()
returns boolean
language sql
stable
as $$
  select coalesce(
    (auth.jwt() ->> 'email') in ('giss@example.com', 'jorge@example.com'),
    false
  );
$$;

drop policy if exists "gj members can read expenses" on public.expenses;
create policy "gj members can read expenses"
on public.expenses
for select
using (public.is_gj_member());

drop policy if exists "gj users insert own expenses" on public.expenses;
create policy "gj users insert own expenses"
on public.expenses
for insert
with check (public.is_gj_member() and auth.uid() = user_id);

drop policy if exists "gj users update own expenses" on public.expenses;
create policy "gj users update own expenses"
on public.expenses
for update
using (public.is_gj_member() and auth.uid() = user_id)
with check (public.is_gj_member() and auth.uid() = user_id);

drop policy if exists "gj users delete own expenses" on public.expenses;
create policy "gj users delete own expenses"
on public.expenses
for delete
using (public.is_gj_member() and auth.uid() = user_id);

drop policy if exists "gj members can read habits" on public.habits;
create policy "gj members can read habits"
on public.habits
for select
using (public.is_gj_member());

drop policy if exists "gj users insert own habits" on public.habits;
create policy "gj users insert own habits"
on public.habits
for insert
with check (public.is_gj_member() and auth.uid() = user_id);

drop policy if exists "gj users update own habits" on public.habits;
create policy "gj users update own habits"
on public.habits
for update
using (public.is_gj_member() and auth.uid() = user_id)
with check (public.is_gj_member() and auth.uid() = user_id);

drop policy if exists "gj users delete own habits" on public.habits;
create policy "gj users delete own habits"
on public.habits
for delete
using (public.is_gj_member() and auth.uid() = user_id);

drop policy if exists "gj members can read bets" on public.bets;
create policy "gj members can read bets"
on public.bets
for select
using (public.is_gj_member());

drop policy if exists "gj members create bets" on public.bets;
create policy "gj members create bets"
on public.bets
for insert
with check (public.is_gj_member() and auth.uid() = created_by);

drop policy if exists "gj members update bets" on public.bets;
create policy "gj members update bets"
on public.bets
for update
using (public.is_gj_member())
with check (public.is_gj_member());

drop policy if exists "gj members can read bet results" on public.bet_results;
create policy "gj members can read bet results"
on public.bet_results
for select
using (public.is_gj_member());

drop policy if exists "gj members create bet results" on public.bet_results;
create policy "gj members create bet results"
on public.bet_results
for insert
with check (public.is_gj_member());
