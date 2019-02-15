import Knex from 'knex';

import { LatLon } from '../util';

export const getUserLocationQuery = (knex: Knex) =>
  (userId: number): PromiseLike<string> =>
    knex.raw(`
      select
        st_asgeojson(location.latlon) as latlon
      from user
      where id = ?
    `, [userId]).then(rows => rows[0].latlon);
  
export const setOrderLocationQuery = (knex: Knex) => (
  orderId: number,
  latlon: LatLon,
): PromiseLike<void> =>
  knex.raw(`
    update order
    set
      latlon = st_setsrid(st_makepoint(?, ?), 4326)
    where id = ?
  `, [latlon.lon, latlon.lat, orderId]);

export const getProjectionQuery = (knex: Knex) => (
  latlon: LatLon,
  distanceMetres: number,
  degreesFromNorthCCW: number
): PromiseLike<string> =>
  knex.raw(`
    select
      st_asgeojson(
        st_project(
          st_setsrid(st_makepoint(?, ?), 4326),
          ?,
          radians(?)
        )
      ) as latlon
  `, [latlon.lon, latlon.lat, distanceMetres, degreesFromNorthCCW])

export const sendEmailQuery = (knex: Knex) => (
  userId: number,
  template: string,
  props: Object,
): PromiseLike<number> =>
  knex.raw(`
    insert into email (user_id, email, template, props)
    select
      user.id, user.email, ?, ?
    from user
    where user.id = ?
  `, [template, JSON.stringify(props), userId]);

export const setOrderErrorQuery = (knex: Knex) =>
  (orderId: number) =>
    (error: Object): PromiseLike<void> =>
      knex('order').update({ error }).where({ id: orderId });
  