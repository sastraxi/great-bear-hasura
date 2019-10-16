exports.up = knex =>
  knex.raw(`
    alter table "order"
      alter column user_id
        set default current_user_id();
  `);

exports.down = knex =>
  knex.raw(`
    alter table "order" alter column user_id drop default;
  `);
