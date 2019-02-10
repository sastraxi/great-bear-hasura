create table "email" (
  id serial primary key,
  user_id int not null
    references "user" (id)
      on delete restrict
      on update cascade,
  recipient text not null,
  template text not null,
  props jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  sent_at timestamptz default null,
  sent_mime text default null
);

create index email___props___idx
  on "email"
  using gin (props);

comment on column "email".sent_mime is
  'The generated email that was ultimately sent';
