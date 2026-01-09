-- 1. Create the note_comments table
create table public.note_comments (
  id uuid not null default gen_random_uuid (),
  note_id text not null, -- Can be the note title or a slug
  author text not null,
  email text not null,
  content text not null,
  created_at timestamp with time zone not null default now(),
  approved boolean not null default true, -- Auto-approve by default for demo
  constraint note_comments_pkey primary key (id)
) tablespace pg_default;

-- 2. Enable Row Level Security (RLS)
alter table public.note_comments enable row level security;

-- 3. Create Access Policies
-- Policy: Everyone can read approved comments
create policy "Enable read access for all users" on public.note_comments
  as permissive for select
  to public
  using ((approved = true));

-- Policy: Everyone can insert comments
create policy "Enable insert access for all users" on public.note_comments
  as permissive for insert
  to public
  with check (true);

-- 4. Create Index for faster lookup by note_id
create index if not exists idx_note_comments_note_id on public.note_comments (note_id);
