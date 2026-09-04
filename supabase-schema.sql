-- 승인보드 — Supabase 스키마
-- Supabase 대시보드 > SQL Editor 에서 이 파일 전체를 붙여넣고 Run 하세요.

create extension if not exists pgcrypto;

create table if not exists apb_boards (
  id uuid primary key default gen_random_uuid(),
  share_code text unique not null,
  title text not null,
  created_at timestamptz not null default now()
);

create table if not exists apb_feedback_items (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references apb_boards(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

create table if not exists apb_feedback_comments (
  id uuid primary key default gen_random_uuid(),
  feedback_item_id uuid not null references apb_feedback_items(id) on delete cascade,
  author_name text not null,
  comment text not null,
  created_at timestamptz not null default now()
);

create index if not exists apb_feedback_items_board_id_idx on apb_feedback_items (board_id);
create index if not exists apb_feedback_comments_feedback_item_id_idx on apb_feedback_comments (feedback_item_id);

alter table apb_boards enable row level security;
alter table apb_feedback_items enable row level security;
alter table apb_feedback_comments enable row level security;

-- MVP 정책: 링크(share_code)를 아는 사람은 누구나 읽고 쓸 수 있습니다.
drop policy if exists "public read apb_boards" on apb_boards;
create policy "public read apb_boards" on apb_boards for select using (true);
drop policy if exists "public insert apb_boards" on apb_boards;
create policy "public insert apb_boards" on apb_boards for insert with check (true);

drop policy if exists "public read apb_feedback_items" on apb_feedback_items;
create policy "public read apb_feedback_items" on apb_feedback_items for select using (true);
drop policy if exists "public insert apb_feedback_items" on apb_feedback_items;
create policy "public insert apb_feedback_items" on apb_feedback_items for insert with check (true);
drop policy if exists "public update apb_feedback_items" on apb_feedback_items;
create policy "public update apb_feedback_items" on apb_feedback_items for update using (true);
drop policy if exists "public delete apb_feedback_items" on apb_feedback_items;
create policy "public delete apb_feedback_items" on apb_feedback_items for delete using (true);

drop policy if exists "public read apb_feedback_comments" on apb_feedback_comments;
create policy "public read apb_feedback_comments" on apb_feedback_comments for select using (true);
drop policy if exists "public insert apb_feedback_comments" on apb_feedback_comments;
create policy "public insert apb_feedback_comments" on apb_feedback_comments for insert with check (true);
drop policy if exists "public delete apb_feedback_comments" on apb_feedback_comments;
create policy "public delete apb_feedback_comments" on apb_feedback_comments for delete using (true);
