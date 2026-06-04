-- Profile social features for Vault.
-- Run this in the Supabase SQL editor before using follow counts and avatar uploads.

create table if not exists follows (
  follower_id uuid not null references profiles(id) on delete cascade,
  following_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

create index if not exists follows_follower_idx on follows (follower_id);
create index if not exists follows_following_idx on follows (following_id);

alter table follows enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'follows' and policyname = 'Follows are readable'
  ) then
    create policy "Follows are readable"
    on follows for select
    using (auth.role() = 'authenticated');
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'follows' and policyname = 'Users can follow as themselves'
  ) then
    create policy "Users can follow as themselves"
    on follows for insert
    with check (auth.uid() = follower_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'follows' and policyname = 'Users can unfollow as themselves'
  ) then
    create policy "Users can unfollow as themselves"
    on follows for delete
    using (auth.uid() = follower_id);
  end if;
end $$;

insert into storage.buckets (id, name, public)
values ('profile-avatars', 'profile-avatars', true)
on conflict (id) do nothing;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Avatar images are publicly readable'
  ) then
    create policy "Avatar images are publicly readable"
    on storage.objects for select
    using (bucket_id = 'profile-avatars');
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Users can upload their own avatar'
  ) then
    create policy "Users can upload their own avatar"
    on storage.objects for insert
    with check (
      bucket_id = 'profile-avatars'
      and auth.uid()::text = (storage.foldername(name))[1]
    );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Users can update their own avatar'
  ) then
    create policy "Users can update their own avatar"
    on storage.objects for update
    using (
      bucket_id = 'profile-avatars'
      and auth.uid()::text = (storage.foldername(name))[1]
    );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Users can delete their own avatar'
  ) then
    create policy "Users can delete their own avatar"
    on storage.objects for delete
    using (
      bucket_id = 'profile-avatars'
      and auth.uid()::text = (storage.foldername(name))[1]
    );
  end if;
end $$;
