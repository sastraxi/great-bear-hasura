import Knex from 'knex';
import Bluebird from 'bluebird';
import Express from 'express';

import {
  orderFromRequest,
  fromCoord,
} from './util';

const {
  DRIVER_DISTANCE_KM,
  DRIVER_SPEED_KPH,
  DRIVER_UPDATE_HZ,
} = process.env;

export default (knex: Knex) =>
  async (req: Express.Request, res: Express.Response) => {
    const order = orderFromRequest(req);
    
    const userLocation = await knex.raw(`
      select st_asgeojson(location.latlon) as latlon
      from user where id = ?
    `, [order.user_id])
      .then(rows => rows[0].latlon)
      .then(fromCoord);

    // TODO: generate a fake location based on the user's location
    // TODO: determine time to get to 
    // TODO: wait + interpolate

    // let hasura know everything is ok
    res.status(200).end();

    const amt = 0.01; // TODO: calc
    for (let pct = 0.0; pct < 1.0; pct += amt) {
      // TODO: interpolate point + store in db
      await Bluebird.delay(1000 / +DRIVER_UPDATE_HZ);
    } 
    // TODO: set final position
  };
