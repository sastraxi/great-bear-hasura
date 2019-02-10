import Knex from 'knex';
import Bluebird from 'bluebird';
import Stripe from 'stripe';
import Express from 'express';

import {
  orderFromRequest,
} from './util';

const amountPaidToPoints = (cents: number) =>
  Math.ceil(cents / 100) * 10;

/**
 * after the order has been verified, the authorized charge
 * is captured and points are added to the user's account
 */
export default (knex: Knex) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  async (req: Express.Request, res: Express.Response) => {
    const order = orderFromRequest(req);
    const existingCharge = JSON.parse(order.stripe_charge);

    // let hasura know everything is ok
    res.status(200).end();

    const charge = await stripe.charges.capture(existingCharge.id, {
      amount: order.amount,
    });
  
    await Promise.all([
      knex('user')
        .increment('points', amountPaidToPoints(order.amount)),
      knex('order')
        .update({
          captured_at: knex.fn.now(),
          stripe_charge: JSON.stringify(charge),
        })
        .where({ id: order.id }),
    ]);
  };
};
