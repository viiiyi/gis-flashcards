create table if not exists students (
  student_code text primary key,
  student_name text not null,
  updated_at timestamptz not null default now()
);

create table if not exists favorites (
  student_code text not null references students(student_code) on delete cascade,
  chapter_id text not null,
  card_index int not null,
  updated_at timestamptz not null default now(),
  primary key (student_code, chapter_id, card_index)
);

create table if not exists progress (
  student_code text not null references students(student_code) on delete cascade,
  chapter_id text not null,
  card_index int not null default 0,
  correct_count int not null default 0,
  incorrect_count int not null default 0,
  updated_at timestamptz not null default now(),
  primary key (student_code, chapter_id)
);

create table if not exists answer_logs (
  id bigint generated always as identity primary key,
  student_code text not null references students(student_code) on delete cascade,
  chapter_id text not null,
  card_index int not null,
  study_mode text not null,
  is_correct boolean not null,
  answered_at timestamptz not null default now()
);

alter table students enable row level security;
alter table favorites enable row level security;
alter table progress enable row level security;
alter table answer_logs enable row level security;

create policy "students anonymous read" on students for select using (true);
create policy "students anonymous upsert" on students for insert with check (true);
create policy "students anonymous update" on students for update using (true) with check (true);

create policy "favorites anonymous read" on favorites for select using (true);
create policy "favorites anonymous insert" on favorites for insert with check (true);
create policy "favorites anonymous update" on favorites for update using (true) with check (true);
create policy "favorites anonymous delete" on favorites for delete using (true);

create policy "progress anonymous read" on progress for select using (true);
create policy "progress anonymous insert" on progress for insert with check (true);
create policy "progress anonymous update" on progress for update using (true) with check (true);

create policy "answer_logs anonymous read" on answer_logs for select using (true);
create policy "answer_logs anonymous insert" on answer_logs for insert with check (true);
