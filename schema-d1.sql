create table if not exists students (
  student_code text primary key,
  student_name text not null,
  updated_at text not null
);

create table if not exists favorites (
  student_code text not null,
  chapter_id text not null,
  card_index integer not null,
  updated_at text not null,
  primary key (student_code, chapter_id, card_index),
  foreign key (student_code) references students(student_code) on delete cascade
);

create table if not exists progress (
  student_code text not null,
  chapter_id text not null,
  card_index integer not null default 0,
  correct_count integer not null default 0,
  incorrect_count integer not null default 0,
  updated_at text not null,
  primary key (student_code, chapter_id),
  foreign key (student_code) references students(student_code) on delete cascade
);

create table if not exists answer_logs (
  id integer primary key autoincrement,
  student_code text not null,
  chapter_id text not null,
  card_index integer not null,
  study_mode text not null,
  is_correct integer not null,
  answered_at text not null,
  foreign key (student_code) references students(student_code) on delete cascade
);

create index if not exists answer_logs_student_idx on answer_logs(student_code, answered_at);
create index if not exists answer_logs_card_idx on answer_logs(chapter_id, card_index);
