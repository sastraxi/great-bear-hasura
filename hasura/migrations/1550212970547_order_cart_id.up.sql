alter table "order"
  add column cart_id int null
    references "cart" (id)
      on delete set null
      on update cascade;
