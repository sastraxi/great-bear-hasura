import Knex from 'knex';
import Bluebird from 'bluebird';

export const getUserLocationQuery = (knex: Knex) =>
  (userId: number): Bluebird<string> =>
    knex.raw(`
      select
        st_asgeojson(location.latlon) as latlon
      from user
      where id = ?
    `, [userId]).then(rows => rows[0].latlon);
