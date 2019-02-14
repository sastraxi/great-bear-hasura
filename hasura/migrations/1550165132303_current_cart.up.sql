alter table "cart" add unique (session_id);

create function current_session_id()
returns text as $$
  select case when get_hasura_user() is null
    then null 
    else (get_hasura_user()->>'x_hasura_session_id')::text
  end
$$ language sql stable;

create view current_cart as
  select * from "cart"
  where session_id = current_session_id();
  