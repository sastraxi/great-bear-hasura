alter table "item"
  add column amount int not null check (amount > 0);
