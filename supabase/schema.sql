create extension if not exists "pgcrypto";

do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type public.app_role as enum ('manager', 'member');
  end if;

  if not exists (select 1 from pg_type where typname = 'expense_category') then
    create type public.expense_category as enum ('bazaar', 'utilities', 'rent', 'other');
  end if;

  if not exists (select 1 from pg_type where typname = 'payment_method') then
    create type public.payment_method as enum ('cash', 'bkash', 'nagad', 'bank', 'other');
  end if;
end $$;

do $$
begin
  if exists (select 1 from pg_type where typname = 'expense_category') then
    if not exists (
      select 1
      from pg_enum e
      join pg_type t on t.oid = e.enumtypid
      where t.typname = 'expense_category' and e.enumlabel = 'gas'
    ) then
      alter type public.expense_category add value 'gas';
    end if;

    if not exists (
      select 1
      from pg_enum e
      join pg_type t on t.oid = e.enumtypid
      where t.typname = 'expense_category' and e.enumlabel = 'electricity'
    ) then
      alter type public.expense_category add value 'electricity';
    end if;

    if not exists (
      select 1
      from pg_enum e
      join pg_type t on t.oid = e.enumtypid
      where t.typname = 'expense_category' and e.enumlabel = 'internet'
    ) then
      alter type public.expense_category add value 'internet';
    end if;
  end if;
end $$;

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null check (char_length(trim(name)) >= 2),
  email text not null unique,
  phone text,
  avatar text,
  role public.app_role not null default 'member',
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.messes (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) >= 2),
  manager_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  constraint messes_one_per_manager unique (manager_id)
);

create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  mess_id uuid not null references public.messes(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  joined_at timestamptz not null default timezone('utc', now()),
  constraint members_unique_user unique (user_id),
  constraint members_unique_mess_user unique (mess_id, user_id)
);

create table if not exists public.meal_entries (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members(id) on delete cascade,
  date date not null,
  breakfast numeric(4,2) not null default 0 check (breakfast >= 0),
  lunch numeric(4,2) not null default 0 check (lunch >= 0),
  dinner numeric(4,2) not null default 0 check (dinner >= 0),
  constraint meal_entries_unique_member_date unique (member_id, date)
);

create table if not exists public.deposits (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members(id) on delete cascade,
  amount numeric(12,2) not null check (amount > 0),
  payment_method public.payment_method not null default 'cash',
  note text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  mess_id uuid not null references public.messes(id) on delete cascade,
  category public.expense_category not null,
  title text not null check (char_length(trim(title)) >= 2),
  amount numeric(12,2) not null check (amount > 0),
  created_by uuid not null references public.users(id) on delete restrict,
  expense_date date not null default current_date,
  note text
);

alter table public.expenses add column if not exists note text;

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null check (char_length(trim(title)) >= 2),
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.monthly_reports (
  id uuid primary key default gen_random_uuid(),
  mess_id uuid not null references public.messes(id) on delete cascade,
  month integer not null check (month between 1 and 12),
  year integer not null check (year between 2000 and 2100),
  total_meal numeric(12,2) not null default 0 check (total_meal >= 0),
  meal_rate numeric(12,2) not null default 0 check (meal_rate >= 0),
  total_expense numeric(12,2) not null default 0 check (total_expense >= 0),
  constraint monthly_reports_unique_month unique (mess_id, month, year)
);

create index if not exists idx_users_role on public.users(role);
create index if not exists idx_messes_manager_id on public.messes(manager_id);
create index if not exists idx_members_mess_id on public.members(mess_id);
create index if not exists idx_members_user_id on public.members(user_id);
create index if not exists idx_meal_entries_member_date on public.meal_entries(member_id, date desc);
create index if not exists idx_deposits_member_created_at on public.deposits(member_id, created_at desc);
create index if not exists idx_expenses_mess_date on public.expenses(mess_id, expense_date desc);
create index if not exists idx_notifications_user_created_at on public.notifications(user_id, created_at desc);
create index if not exists idx_monthly_reports_mess_period on public.monthly_reports(mess_id, year desc, month desc);

alter table public.users enable row level security;
alter table public.messes enable row level security;
alter table public.members enable row level security;
alter table public.meal_entries enable row level security;
alter table public.deposits enable row level security;
alter table public.expenses enable row level security;
alter table public.notifications enable row level security;
alter table public.monthly_reports enable row level security;

create or replace function public.current_user_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.users where id = auth.uid()
$$;

create or replace function public.is_manager()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.users
    where id = auth.uid() and role = 'manager'
  )
$$;

create or replace function public.manager_mess_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.messes where manager_id = auth.uid() limit 1
$$;

create or replace function public.current_member_mess_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select mess_id from public.members where user_id = auth.uid() limit 1
$$;

create or replace function public.can_access_mess(target_mess_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.messes m
    where m.id = target_mess_id
      and m.manager_id = auth.uid()
  )
  or exists (
    select 1
    from public.members mb
    where mb.mess_id = target_mess_id
      and mb.user_id = auth.uid()
  )
$$;

create or replace function public.is_mess_manager(target_mess_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.messes
    where id = target_mess_id
      and manager_id = auth.uid()
  )
$$;

create or replace function public.can_access_member(target_member_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.members mb
    join public.messes m on m.id = mb.mess_id
    where mb.id = target_member_id
      and (mb.user_id = auth.uid() or m.manager_id = auth.uid())
  )
$$;

create or replace function public.can_manage_member(target_member_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.members mb
    join public.messes m on m.id = mb.mess_id
    where mb.id = target_member_id
      and m.manager_id = auth.uid()
  )
$$;

create or replace function public.get_mess_meal_rate(target_mess_id uuid)
returns numeric
language sql
stable
security definer
set search_path = public
as $$
  with meal_totals as (
    select coalesce(sum(me.breakfast + me.lunch + me.dinner), 0) as total_meals
    from public.meal_entries me
    join public.members mb on mb.id = me.member_id
    where mb.mess_id = target_mess_id
  ),
  expense_totals as (
    select coalesce(sum(amount), 0) as total_expense
    from public.expenses
    where mess_id = target_mess_id
  )
  select
    case
      when not public.can_access_mess(target_mess_id) then 0
      when meal_totals.total_meals = 0 then 0
      else expense_totals.total_expense / meal_totals.total_meals
    end
  from meal_totals, expense_totals
$$;

drop function if exists public.add_member_by_email(text);
drop function if exists public.update_managed_member_profile(uuid, text, text, text);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_role public.app_role;
begin
  requested_role := coalesce((new.raw_user_meta_data ->> 'role')::public.app_role, 'member');

  insert into public.users (id, name, email, phone, avatar, role)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'name', ''), split_part(new.email, '@', 1)),
    new.email,
    nullif(new.raw_user_meta_data ->> 'phone', ''),
    nullif(new.raw_user_meta_data ->> 'avatar', ''),
    requested_role
  );

  if requested_role = 'manager' and nullif(new.raw_user_meta_data ->> 'mess_name', '') is not null then
    insert into public.messes (name, manager_id)
    values (new.raw_user_meta_data ->> 'mess_name', new.id)
    on conflict (manager_id) do nothing;

    insert into public.members (mess_id, user_id)
    select id, new.id
    from public.messes
    where manager_id = new.id
    on conflict (user_id) do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.ensure_manager_membership()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.members (mess_id, user_id)
  values (new.id, new.manager_id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_mess_created_ensure_manager_membership on public.messes;
create trigger on_mess_created_ensure_manager_membership
after insert on public.messes
for each row execute function public.ensure_manager_membership();

insert into public.members (mess_id, user_id)
select id, manager_id
from public.messes
on conflict (user_id) do nothing;

drop policy if exists "Users can view own profile" on public.users;
create policy "Users can view own profile"
on public.users for select
to authenticated
using (id = auth.uid());

drop policy if exists "Mess peers can view user profile" on public.users;
create policy "Mess peers can view user profile"
on public.users for select
to authenticated
using (
  public.is_manager()
  or
  exists (
    select 1
    from public.members viewer
    join public.members target on target.mess_id = viewer.mess_id
    where viewer.user_id = auth.uid()
      and target.user_id = users.id
  )
  or exists (
    select 1
    from public.messes m
    join public.members target on target.mess_id = m.id
    where m.manager_id = auth.uid()
      and target.user_id = users.id
  )
);

drop policy if exists "Users can update own profile basics" on public.users;
create policy "Users can update own profile basics"
on public.users for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid() and role = public.current_user_role());

drop policy if exists "Managers can update managed member profiles" on public.users;
create policy "Managers can update managed member profiles"
on public.users for update
to authenticated
using (
  exists (
    select 1
    from public.members mb
    join public.messes m on m.id = mb.mess_id
    where mb.user_id = users.id
      and m.manager_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.members mb
    join public.messes m on m.id = mb.mess_id
    where mb.user_id = users.id
      and m.manager_id = auth.uid()
  )
);

drop policy if exists "Managers can view managed mess" on public.messes;
create policy "Managers can view managed mess"
on public.messes for select
to authenticated
using (manager_id = auth.uid() or public.can_access_mess(id));

drop policy if exists "Managers can create own mess" on public.messes;
create policy "Managers can create own mess"
on public.messes for insert
to authenticated
with check (manager_id = auth.uid() and public.is_manager());

drop policy if exists "Managers can update own mess" on public.messes;
create policy "Managers can update own mess"
on public.messes for update
to authenticated
using (manager_id = auth.uid())
with check (manager_id = auth.uid());

drop policy if exists "Managers can delete own mess" on public.messes;
create policy "Managers can delete own mess"
on public.messes for delete
to authenticated
using (manager_id = auth.uid());

drop policy if exists "Mess users can view memberships" on public.members;
create policy "Mess users can view memberships"
on public.members for select
to authenticated
using (public.can_access_mess(mess_id));

drop policy if exists "Managers can add members" on public.members;
create policy "Managers can add members"
on public.members for insert
to authenticated
with check (public.is_mess_manager(mess_id));

drop policy if exists "Managers can update members" on public.members;
create policy "Managers can update members"
on public.members for update
to authenticated
using (public.is_mess_manager(mess_id))
with check (public.is_mess_manager(mess_id));

drop policy if exists "Managers can remove members" on public.members;
create policy "Managers can remove members"
on public.members for delete
to authenticated
using (public.is_mess_manager(mess_id) and user_id <> auth.uid());

drop policy if exists "Mess users can view meals" on public.meal_entries;
create policy "Mess users can view meals"
on public.meal_entries for select
to authenticated
using (
  exists (
    select 1
    from public.members target_member
    where target_member.id = meal_entries.member_id
      and public.can_access_mess(target_member.mess_id)
  )
);

drop policy if exists "Managers can create meals" on public.meal_entries;
create policy "Managers can create meals"
on public.meal_entries for insert
to authenticated
with check (public.can_manage_member(member_id));

drop policy if exists "Managers can update meals" on public.meal_entries;
create policy "Managers can update meals"
on public.meal_entries for update
to authenticated
using (public.can_manage_member(member_id))
with check (public.can_manage_member(member_id));

drop policy if exists "Managers can delete meals" on public.meal_entries;
create policy "Managers can delete meals"
on public.meal_entries for delete
to authenticated
using (public.can_manage_member(member_id));

drop policy if exists "Mess users can view deposits" on public.deposits;
create policy "Mess users can view deposits"
on public.deposits for select
to authenticated
using (public.can_access_member(member_id));

drop policy if exists "Managers can create deposits" on public.deposits;
create policy "Managers can create deposits"
on public.deposits for insert
to authenticated
with check (public.can_manage_member(member_id));

drop policy if exists "Managers can update deposits" on public.deposits;
create policy "Managers can update deposits"
on public.deposits for update
to authenticated
using (public.can_manage_member(member_id))
with check (public.can_manage_member(member_id));

drop policy if exists "Managers can delete deposits" on public.deposits;
create policy "Managers can delete deposits"
on public.deposits for delete
to authenticated
using (public.can_manage_member(member_id));

drop policy if exists "Mess users can view expenses" on public.expenses;
create policy "Mess users can view expenses"
on public.expenses for select
to authenticated
using (public.can_access_mess(mess_id));

drop policy if exists "Managers can create expenses" on public.expenses;
create policy "Managers can create expenses"
on public.expenses for insert
to authenticated
with check (public.is_mess_manager(mess_id) and created_by = auth.uid());

drop policy if exists "Managers can update expenses" on public.expenses;
create policy "Managers can update expenses"
on public.expenses for update
to authenticated
using (public.is_mess_manager(mess_id))
with check (public.is_mess_manager(mess_id));

drop policy if exists "Managers can delete expenses" on public.expenses;
create policy "Managers can delete expenses"
on public.expenses for delete
to authenticated
using (public.is_mess_manager(mess_id));

drop policy if exists "Users can view own notifications" on public.notifications;
create policy "Users can view own notifications"
on public.notifications for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "Users can update own notifications" on public.notifications;
create policy "Users can update own notifications"
on public.notifications for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Managers can notify managed members" on public.notifications;
create policy "Managers can notify managed members"
on public.notifications for insert
to authenticated
with check (
  exists (
    select 1
    from public.messes m
    left join public.members mb on mb.mess_id = m.id
    where m.manager_id = auth.uid()
      and (notifications.user_id = m.manager_id or notifications.user_id = mb.user_id)
  )
);

drop policy if exists "Mess users can view reports" on public.monthly_reports;
create policy "Mess users can view reports"
on public.monthly_reports for select
to authenticated
using (public.can_access_mess(mess_id));

drop policy if exists "Managers can create reports" on public.monthly_reports;
create policy "Managers can create reports"
on public.monthly_reports for insert
to authenticated
with check (public.is_mess_manager(mess_id));

drop policy if exists "Managers can update reports" on public.monthly_reports;
create policy "Managers can update reports"
on public.monthly_reports for update
to authenticated
using (public.is_mess_manager(mess_id))
with check (public.is_mess_manager(mess_id));

drop policy if exists "Managers can delete reports" on public.monthly_reports;
create policy "Managers can delete reports"
on public.monthly_reports for delete
to authenticated
using (public.is_mess_manager(mess_id));

grant execute on function public.current_user_role() to authenticated;
grant execute on function public.is_manager() to authenticated;
grant execute on function public.manager_mess_id() to authenticated;
grant execute on function public.current_member_mess_id() to authenticated;
grant execute on function public.can_access_mess(uuid) to authenticated;
grant execute on function public.is_mess_manager(uuid) to authenticated;
grant execute on function public.can_access_member(uuid) to authenticated;
grant execute on function public.can_manage_member(uuid) to authenticated;
grant execute on function public.get_mess_meal_rate(uuid) to authenticated;

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'notifications'
    ) then
      alter publication supabase_realtime add table public.notifications;
    end if;

    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'meal_entries'
    ) then
      alter publication supabase_realtime add table public.meal_entries;
    end if;

    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'deposits'
    ) then
      alter publication supabase_realtime add table public.deposits;
    end if;

    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'expenses'
    ) then
      alter publication supabase_realtime add table public.expenses;
    end if;
  end if;
end $$;
