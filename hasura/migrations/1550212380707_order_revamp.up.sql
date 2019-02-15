drop table create_order;

alter table "order"
  add column stripe_token text not null,
  add column authorized_at timestamptz default null;

alter table "order"
  alter column user_id set not null;
