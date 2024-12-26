-- Drop existing tables and functions if they exist
drop table if exists stories;
drop table if exists story_levels;
drop function if exists update_updated_at_column cascade;

-- Create story_levels table
create table story_levels (
    id bigint primary key generated always as identity,
    level_number integer not null unique check (level_number between 1 and 50),
    description text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create stories table
create table stories (
    id bigint primary key generated always as identity,
    title text not null,
    story_html text not null,
    level_id bigint references story_levels(id) on delete restrict,
    images text[], -- Array of image URLs/paths
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create trigger to automatically update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

-- Add triggers to both tables
create trigger update_story_levels_updated_at
    before update on story_levels
    for each row
    execute function update_updated_at_column();

create trigger update_stories_updated_at
    before update on stories
    for each row
    execute function update_updated_at_column();

-- Insert some initial story levels
insert into story_levels (level_number, description)
values 
    (1, 'First level - Basic stories for absolute beginners'),
    (2, 'Second level - Simple stories with basic vocabulary'),
    (3, 'Third level - Stories with slightly more complex sentences');

-- Enable Row Level Security (RLS)
alter table story_levels enable row level security;
alter table stories enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Story levels are viewable by everyone" on story_levels;
drop policy if exists "Story levels can be created by admins" on story_levels;
drop policy if exists "Story levels can be updated by admins" on story_levels;
drop policy if exists "Story levels can be deleted by admins" on story_levels;

-- Create new policies with proper role checking
create policy "Story levels are viewable by everyone"
    on story_levels for select
    to authenticated, anon
    using (true);

create policy "Story levels can be created by admins"
    on story_levels for insert
    to authenticated
    with check (exists (
        select 1 from profiles
        where profiles.id = auth.uid()
        and profiles.role = 'admin'
    ));

create policy "Story levels can be updated by admins"
    on story_levels for update
    to authenticated
    using (exists (
        select 1 from profiles
        where profiles.id = auth.uid()
        and profiles.role = 'admin'
    ));

create policy "Story levels can be deleted by admins"
    on story_levels for delete
    to authenticated
    using (exists (
        select 1 from profiles
        where profiles.id = auth.uid()
        and profiles.role = 'admin'
    ));

-- Create policies for stories
create policy "Stories are viewable by everyone"
    on stories for select
    to authenticated, anon
    using (true);

create policy "Stories can be created by admins"
    on stories for insert
    to authenticated
    with check (auth.jwt() ->> 'role' = 'admin');

create policy "Stories can be updated by admins"
    on stories for update
    to authenticated
    using (auth.jwt() ->> 'role' = 'admin');

create policy "Stories can be deleted by admins"
    on stories for delete
    to authenticated
    using (auth.jwt() ->> 'role' = 'admin'); 