import Knex from 'knex';
import Bluebird from 'bluebird';
import createDebugger from 'debug';
import Express from 'express';
import moment from 'moment';
import _ from 'lodash';

const debug = createDebugger('gbh:delivery');

const HR_TO_SEC = 3600;
const KM_TO_M = 1000;

import {
  rowFromRequest,
  fromGeoJSON,
  mix,
  SEC_TO_MS,
} from '../../util';

import {
  getOrderLocationsQuery,
  setOrderLocationQuery,
  getProjectionQuery,
  sendEmailQuery,
} from '../../db/query';

const {
  DRIVER_DISTANCE_KM,
  DRIVER_SPEED_KPH,
  DRIVER_UPDATE_HZ,
  DRIVER_DROP_PACKAGE_SEC,
} = process.env;

/**
 * After the food has been prepared, a drone flies it to the user's address.
 */
export default (knex: Knex) => {
  const getOrderLocations = getOrderLocationsQuery(knex);
  const setOrderLocation = setOrderLocationQuery(knex);
  const getProjection = getProjectionQuery(knex);
  const sendEmail = sendEmailQuery(knex);

  return async (req: Express.Request, res: Express.Response) => {
    const order = rowFromRequest(req);

    const { destination: targetCoord } = await getOrderLocations(order.id);

    // generate a fake location near the user's location using postgis
    const randomAngle = 360.0 * Math.random();
    const initialCoord = await getProjection(
      targetCoord,
      KM_TO_M * +DRIVER_DISTANCE_KM,
      randomAngle,
    ).then(fromGeoJSON);

    // let hasura know everything is ok before we start our sleeps
    res.status(200).end();

    // simulate sending a drone to the user's house then dropping their meal
    const deliverySeconds = HR_TO_SEC * (+DRIVER_DISTANCE_KM / +DRIVER_SPEED_KPH);
    const step = 1.0 / +DRIVER_UPDATE_HZ;
    for (let t = 0.0; t < deliverySeconds; t += step) {
      const pct = t / deliverySeconds;
      const interpolated = mix(initialCoord, targetCoord, pct);
      await Promise.all([
        setOrderLocation(order.id, interpolated),
        Bluebird.delay(SEC_TO_MS * step),
      ])
    }
    await Promise.all([
      setOrderLocation(order.id, targetCoord),
      Bluebird.delay(SEC_TO_MS * +DRIVER_DROP_PACKAGE_SEC),
    ]);
  
    // mark / notify that the delivery has been completed
    const delivered_at = moment().toISOString();
    await Promise.all([
      sendEmail(
        order.user_id,
        'receipt',
        {
          order: {
            ..._.pick(order, ['id', 'amount', 'created_at']),
            delivered_at,
          },
        },
      ),
      knex('order')
        .update({ delivered_at })
        .where({ id: order.id }),
    ]);

    debug(`delivered order #${order.id}`);
  };
};
