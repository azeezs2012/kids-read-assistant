-- Add role enum type if it doesn't exist
do $$ 
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type public.user_role as enum ('admin', 'children');
  end if;
end $$;

-- Add role column to profiles table if it doesn't exist
do $$
begin
  if not exists (select 1 from information_schema.columns 
    where table_schema = 'public' 
    and table_name = 'profiles' 
    and column_name = 'role') 
  then
    alter table public.profiles 
    add column role user_role not null default 'children';
  end if;
end $$;

-- Drop existing policies
drop policy if exists "Users can view their own profile" on profiles;
drop policy if exists "Users can update their own profile" on profiles;
drop policy if exists "Users can insert their own profile" on profiles;
drop policy if exists "Profile view policy" on profiles;
drop policy if exists "Profile update policy" on profiles;

-- Create a function to check if user is admin
create or replace function is_admin(user_id uuid)
returns boolean as $$
  select exists (
    select 1 from profiles 
    where id = user_id and role = 'admin'::user_role
  );
$$ language sql security definer;

-- Admins can view all profiles, children can only view their own
create policy "Profile view policy"
  on profiles for select
  using (
    is_admin(auth.uid()) or id = auth.uid()
  );

-- Admins can update all profiles, children can only update their own (except role)
create policy "Profile update policy"
  on profiles for update
  using (
    is_admin(auth.uid()) or id = auth.uid()
  )
  with check (
    (is_admin(auth.uid()) or (id = auth.uid() and role = 'children'))
  );

-- Allow users to insert their own profile
create policy "Profile insert policy"
  on profiles for insert
  with check (
    auth.uid() = id
  );

-- Create function to promote user to admin (can only be executed by admin)
create or replace function promote_to_admin(user_id uuid)
returns void as $$
begin
  if not is_admin(auth.uid()) then
    raise exception 'Only admins can promote users';
  end if;
  
  update profiles
  set role = 'admin'
  where id = user_id;
end;
$$ language plpgsql security definer;

-- Create function to demote admin to children (can only be executed by admin)
create or replace function demote_to_children(user_id uuid)
returns void as $$
begin
  if not is_admin(auth.uid()) then
    raise exception 'Only admins can demote users';
  end if;
  
  -- Prevent demotion if this would leave no admins
  if (select count(*) from profiles where role = 'admin') <= 1 and
     (select role from profiles where id = user_id) = 'admin' then
    raise exception 'Cannot demote the last admin';
  end if;
  
  update profiles
  set role = 'children'
  where id = user_id;
end;
$$ language plpgsql security definer;

-- Update the handle_new_user function to set default role
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, role)
  values (new.id, 'children');
  return new;
end;
$$ language plpgsql;

-- Create the trigger if it doesn't exist
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute procedure public.handle_new_user(); 

-- Update profiles table to include role column if it doesn't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user';

-- Create an index on the role column
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role); 