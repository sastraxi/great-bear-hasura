drop function current_session_id();
drop view current_cart;
alter table "cart" drop constraint cart_session_id_key;
