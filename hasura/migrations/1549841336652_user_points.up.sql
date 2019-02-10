alter table "user"
  add column points int not null default 0
    check (points >= 0);
