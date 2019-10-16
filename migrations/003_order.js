exports.up = knex =>
  knex.raw(`
    create table public."order" (
      id serial primary key,
      user_id int not null
        references "user" (id)
          on delete restrict
          on update cascade,

      cart_id int null
        references "cart" (id)
          on delete set null
          on update cascade,
    
      stripe_charge jsonb default null,
      stripe_token text not null,
      amount int not null
        check (amount > 0),

      "error" jsonb null,
      failed_at timestamptz default null,

      latlon geometry(point, 4326) not null,
    
      created_at timestamptz not null default now(),
      modified_at timestamptz not null default now(),

      authorized_at timestamptz default null,
      verified_at timestamptz default null,
      captured_at timestamptz default null,
      cooked_at timestamptz default null,
      delivered_at timestamptz default null,
    
      check (
        delivered_at is null or
        failed_at is null
      )
    );
    
    comment on column "order".amount is
      'In the smallest currency unit available for the currency.';
    
    create index order___stripe_charge___idx
      on "order"
      using gin (stripe_charge);
    
    create trigger order___modified_at___update
      before update on "order"
      for each row
      execute procedure update_modified_at();
    
    create table "order_item" (
      id serial primary key,
      order_id int not null
        references "order" (id)
          on delete restrict
          on update cascade,
      item_id int not null
        references "item" (id)
          on delete restrict
          on update cascade,
      quantity int not null default 1
        check (quantity > 0),
      unique (order_id, item_id)
    );
  `);

exports.down = (knex, Promise) => Promise.resolve();
