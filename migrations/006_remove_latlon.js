exports.up = knex =>
  knex.raw(`
    alter table "user" drop column latlon;
  `);

exports.down = (knex, Promise) => Promise.resolve();
