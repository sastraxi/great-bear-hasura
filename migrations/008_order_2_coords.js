exports.up = knex =>
  knex.raw(`
    alter table "order" rename "latlon" to "destination_latlon";
    alter table "order"
      add column "current_latlon" geometry(point, 4326) default null;

    update "order" set "current_latlon" = "destination_latlon";
  `);

exports.down = (knex, Promise) => Promise.resolve();
