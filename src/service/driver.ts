import Knex from 'knex';
import Bluebird from 'bluebird';
import Express from 'express';

const HR_TO_SEC = 3600;
const KM_TO_M = 1000;

import {
  LatLon,
  orderFromRequest,
  fromCoord,
  mix,
} from './util';

import {
  getUserLocationQuery,
  setOrderLocationQuery,
  markOrderDeliveredQuery,
  getProjectionQuery,
} from './query';

const {
  DRIVER_DISTANCE_KM,
  DRIVER_SPEED_KPH,
  DRIVER_UPDATE_HZ,
  DRIVER_DROP_PACKAGE_SEC,
} = process.env;

export default (knex: Knex) => {
  const getUserLocation = getUserLocationQuery(knex);
  const setOrderLocation = setOrderLocationQuery(knex);
  const markOrderDelivered = markOrderDeliveredQuery(knex);
  const getProjection = getProjectionQuery(knex);

  async (req: Express.Request, res: Express.Response) => {
    const order = orderFromRequest(req);

    const userLocation = await getUserLocation(order.user_id)
      .then(fromCoord);

    // generate a fake location based on the user's location using postgis
    const randomAngle = 360.0 * Math.random();
    const restaurantLocation = await getProjection(
      userLocation,
      KM_TO_M * +DRIVER_DISTANCE_KM,
      randomAngle,
    ).then(fromCoord);

    // let hasura know everything is ok
    res.status(200).end();

    // simulate sending a drone to the user's house then dropping their meal
    const deliverySeconds = HR_TO_SEC * (+DRIVER_DISTANCE_KM / +DRIVER_SPEED_KPH);
    const step = 1000.0 / +DRIVER_UPDATE_HZ;
    for (let t = 0.0; t < deliverySeconds; t += step) {
      const pct = t / deliverySeconds;
      const interpolated = mix(restaurantLocation, userLocation, pct);
      await Promise.all([
        setOrderLocation(order.id, interpolated),
        Bluebird.delay(step),
      ])
    }
    await Promise.all([
      setOrderLocation(order.id, userLocation),
      Bluebird.delay(1000 * +DRIVER_DROP_PACKAGE_SEC),
    ]);
  
    // mark / notify that the delivery has been completed
    await markOrderDelivered(order.id);
  };
};
