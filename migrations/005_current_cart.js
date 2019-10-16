exports.up = knex =>
  knex.raw(`
    alter table "cart" add unique (session_id);

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

    create function current_session_id()
    returns text as $$
      select case when get_hasura_user() is null
        then null 
        else (get_hasura_user()->>'x-hasura-session-id')::text
      end
    $$ language sql stable;

    -- the current cart for a given user session (via passport)
    create view current_cart as
      select * from "cart"
      where session_id = current_session_id();
  `);

exports.down = (knex, Promise) => Promise.resolve();
