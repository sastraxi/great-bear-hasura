exports.up = knex =>
  knex.raw(`
    create table "user" (
      id serial primary key,
      email text not null,
      hash_password text not null,
      latlon geometry(point, 4326) not null,
      stripe_customer_id text default null,
      is_admin boolean not null default false,
      points int not null default 0 check (points >= 0),
      created_at timestamptz not null default now(),
      modified_at timestamptz not null default now(),
      unique (email)
    );

    create function update_modified_at()
    returns trigger as $$
      begin
        new.modified_at = now();
        return new;
      end;
    $$ language 'plpgsql';

    create trigger user___modified_at___update
      before update on "user"
      for each row
      execute procedure update_modified_at();
  `);

exports.down = (knex, Promise) => Promise.resolve();
