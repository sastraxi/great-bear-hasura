create table create_order (
  id serial primary key,
  cart_id int not null,
  amount int not null check (amount > 0),
  stripe_token text not null,
  user_id int not null default current_user_id(),
  created_at timestamptz not null default now()
);

alter table "order"
  drop column stripe_token,
  drop column authorized_at;

alter table "order"
  alter column user_id drop not null;
