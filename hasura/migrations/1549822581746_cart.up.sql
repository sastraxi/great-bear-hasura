create table "item" (
  id serial primary key,
  "name" text not null,
  "category" text not null,
  "description" text
);

create table "cart" (
  id serial primary key,
  user_id int null
    references "user" (id)
      on delete restrict
      on update cascade,
  session_id text not null,
  created_at timestamptz not null default now(),
  modified_at timestamptz not null default now()
);

create trigger cart___modified_at___update
  before update on "cart"
  for each row
  execute procedure update_modified_at();

create table "cart_item" (
  id serial primary key,
  cart_id int not null
    references "cart" (id)
      on delete restrict
      on update cascade,
  item_id int not null
    references "item" (id)
      on delete restrict
      on update cascade,
  quantity int not null default 1
    check (quantity > 0),
  unique (cart_id, item_id)
);
