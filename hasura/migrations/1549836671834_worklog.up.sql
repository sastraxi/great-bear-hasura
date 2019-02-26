create function get_hasura_user()
returns jsonb as $$
  select nullif(current_setting('hasura.user', true), '')::jsonb
$$ language sql stable;

create function current_user_id()
returns integer as $$
  select case when get_hasura_user() is null
    then null 
    else (get_hasura_user()->>'x-hasura-user-id')::integer
  end
$$ language sql stable;

-- unfortunately it would be a headache to truly have foreign
-- keys here, so we're just going to keep this table as an island.
-- getting rid of the foreign keys also means that we don't have to worry
-- about this table infecting the cart or user tables.
create table create_order (
  id serial primary key,
  cart_id int not null,
  amount int not null check (amount > 0),
  stripe_token text not null,
  user_id int not null default current_user_id(),
  created_at timestamptz not null default now()
);
