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
    (1, 'Level 1 - Basic stories for absolute beginners'),
    (2, 'Level 2 - Simple stories with basic vocabulary'),
    (3, 'Level 3 - Stories with slightly more complex sentences'),
    (4, 'Level 4 - Short stories with everyday vocabulary'),
    (5, 'Level 5 - Stories with common expressions'),
    (6, 'Level 6 - Stories with basic dialogue'),
    (7, 'Level 7 - Stories with varied sentence structures'),
    (8, 'Level 8 - Stories with descriptive language'),
    (9, 'Level 9 - Stories with natural conversations'),
    (10, 'Level 10 - Stories with idioms and expressions'),
    (11, 'Level 11 - Stories with varied tenses'),
    (12, 'Level 12 - Stories with complex dialogue'),
    (13, 'Level 13 - Stories with advanced vocabulary'),
    (14, 'Level 14 - Stories with cultural context'),
    (15, 'Level 15 - Stories with abstract concepts'),
    (16, 'Level 16 - Stories with business vocabulary'),
    (17, 'Level 17 - Stories with academic language'),
    (18, 'Level 18 - Stories with technical terms'),
    (19, 'Level 19 - Stories with professional scenarios'),
    (20, 'Level 20 - Stories with specialized vocabulary'),
    (21, 'Level 21 - Stories with complex narratives'),
    (22, 'Level 22 - Stories with advanced expressions'),
    (23, 'Level 23 - Stories with sophisticated dialogue'),
    (24, 'Level 24 - Stories with literary devices'),
    (25, 'Level 25 - Stories with advanced grammar'),
    (26, 'Level 26 - Stories with professional jargon'),
    (27, 'Level 27 - Stories with academic discourse'),
    (28, 'Level 28 - Stories with technical discussions'),
    (29, 'Level 29 - Stories with complex scenarios'),
    (30, 'Level 30 - Stories with advanced concepts'),
    (31, 'Level 31 - Stories with expert vocabulary'),
    (32, 'Level 32 - Stories with specialized terms'),
    (33, 'Level 33 - Stories with advanced idioms'),
    (34, 'Level 34 - Stories with complex themes'),
    (35, 'Level 35 - Stories with professional context'),
    (36, 'Level 36 - Stories with academic themes'),
    (37, 'Level 37 - Stories with technical complexity'),
    (38, 'Level 38 - Stories with advanced scenarios'),
    (39, 'Level 39 - Stories with expert concepts'),
    (40, 'Level 40 - Stories with specialized context'),
    (41, 'Level 41 - Stories with mastery vocabulary'),
    (42, 'Level 42 - Stories with expert expressions'),
    (43, 'Level 43 - Stories with advanced themes'),
    (44, 'Level 44 - Stories with complex concepts'),
    (45, 'Level 45 - Stories with specialized scenarios'),
    (46, 'Level 46 - Stories with expert context'),
    (47, 'Level 47 - Stories with mastery concepts'),
    (48, 'Level 48 - Stories with advanced mastery'),
    (49, 'Level 49 - Stories with expert mastery'),
    (50, 'Level 50 - Stories with complete mastery');

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

-- Drop existing policies for stories if they exist
drop policy if exists "Stories are viewable by everyone" on stories;
drop policy if exists "Stories can be created by admins" on stories;
drop policy if exists "Stories can be updated by admins" on stories;
drop policy if exists "Stories can be deleted by admins" on stories;

-- Create policies for stories with proper role checking
create policy "Stories are viewable by everyone"
    on stories for select
    to authenticated, anon
    using (true);

create policy "Stories can be created by admins"
    on stories for insert
    to authenticated
    with check (exists (
        select 1 from profiles
        where profiles.id = auth.uid()
        and profiles.role = 'admin'
    ));

create policy "Stories can be updated by admins"
    on stories for update
    to authenticated
    using (exists (
        select 1 from profiles
        where profiles.id = auth.uid()
        and profiles.role = 'admin'
    ));

create policy "Stories can be deleted by admins"
    on stories for delete
    to authenticated
    using (exists (
        select 1 from profiles
        where profiles.id = auth.uid()
        and profiles.role = 'admin'
    ));

-- Create storage bucket for story images
insert into storage.buckets (id, name, public)
values ('stories', 'stories', true);

-- Allow authenticated users to upload images
create policy "Anyone can upload story images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'stories');

-- Allow public access to story images
create policy "Anyone can view story images"
  on storage.objects for select
  to public
  using (bucket_id = 'stories');

-- Allow authenticated users to delete their uploaded images
create policy "Authenticated users can delete story images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'stories'); 