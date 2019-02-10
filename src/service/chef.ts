import Knex from 'knex';
import Bluebird from 'bluebird';
import Express from 'express';

import {
  orderFromRequest,
  SEC_TO_MS,
} from './util';

const {
  CHEF_PREP_SEC,
} = process.env;

/**
 * after the charge has been authorized,
 * the waiter receives and validates the order
 */
export default (knex: Knex) =>
  async (req: Express.Request, res: Express.Response) => {
    const order = orderFromRequest(req);

    // let hasura know everything is ok before we sleep
    res.status(200).end();

    // the chef takes their time cooking the food...
    await Bluebird.delay(SEC_TO_MS * +CHEF_PREP_SEC);

    // the chef cooked the order.
    await knex('order')
      .update({ cooked_at: knex.fn.now() })
      .where({ id: order.id });
  };
