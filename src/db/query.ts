import Knex, { QueryBuilder } from 'knex';

import { LatLon, fromGeoJSON } from '../util';

interface OrderLocations {
  current?: LatLon
  destination: LatLon
}

export const getOrderLocationsQuery = (knex: Knex) =>
  (orderId: number): PromiseLike<OrderLocations> =>
    knex.raw(`
      select
        st_asgeojson(current_latlon) as current,
        st_asgeojson(destination_latlon) as destination
      from "order"
      where id = ?
    `, [orderId])
    .then(({ rows }) => rows[0])
    .then(({ current, destination }) => ({
      current: fromGeoJSON(current),
      destination: fromGeoJSON(destination),
    }));

export const setOrderLocationQuery = (knex: Knex) => (
  orderId: number,
  latlon: LatLon,
): PromiseLike<void> =>
  knex.raw(`
    update "order"
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
    .then(({ rows }) => rows[0].latlon);

export const sendEmailQuery = (knex: Knex) => (
  userId: number,
  template: string,
  props: Object,
): PromiseLike<number> =>
  knex.raw(`
    insert into email (user_id, email, template, props)
    select
      "user".id, "user".email, ?, ?
    from "user"
    where "user".id = ?
  `, [template, JSON.stringify(props), userId]);

export const setOrderErrorQuery = (knex: Knex) =>
  (orderId: number) =>
    (error: Object): QueryBuilder<any, number> =>
      knex('order').update({
        error,
        failed_at: knex.fn.now(),
      }).where({ id: orderId });
