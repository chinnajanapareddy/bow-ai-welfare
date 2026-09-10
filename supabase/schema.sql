create table if not exists users (
  id text primary key,
  name text not null,
  email text not null unique,
  password text not null,
  joined_at timestamptz not null default now()
);

create table if not exists reports (
  id text primary key,
  email text,
  location text not null,
  description text not null,
  voiceText text,
  concern text,
  priority text not null check (priority in ('High', 'Medium', 'Low')),
  status text not null default 'Submitted',
  createdAt timestamptz not null default now()
);

create index if not exists idx_users_email on users (lower(email));
create index if not exists idx_reports_created_at on reports (createdAt desc);
