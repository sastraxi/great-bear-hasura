exports.up = knex =>
  knex.raw(`
    alter table "item"
      add column image_url text default null;
  `);

exports.down = (knex, Promise) => Promise.resolve();
