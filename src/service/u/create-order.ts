import Knex from 'knex';
import Stripe from 'stripe';
import Express from 'express';

import {
  rowFromRequest,
} from '../../util';

const setResponseQuery =
  (knex: Knex) =>
    (id: number) =>
      (responseJson: object) =>
        knex.raw(`
          update create_order
          set
            response_json = ?,
            finished_at = now()
          where id = ?
        `, [JSON.stringify(responseJson), id])

/**
 * after the order has been verified, the authorized charge
 * is captured and points are added to the user's account
 */
export default (knex: Knex) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  return async (req: Express.Request, res: Express.Response) => {
    const {
      id,
      cart_id: cartId,
      amount,
      stripe_token: stripeToken,
      user_id: userId,
    } = rowFromRequest(req);
    const setResponse = setResponseQuery(knex)(id);

    // validate our cart
    const cart = await knex.raw(`
      select
        c.user_id as userId,
        sum(i.amount * ci.quantity) as totalAmount
      from "cart" c
      inner join "cart_item" ci on ci.cart_id = c.id
      inner join "item" i on i.id = ci.item_id
      where c.id = ?
      group by c.id
    `, [cartId]).then(rows => rows[0]);

    if (cart.userId !== userId) {
      await setResponse({
        error: "You do not own this cart!",
      });
      return;
    }

    if (cart.totalAmount !== amount) {
      await setResponse({
        error: `Cart amount: ${cart.totalAmount}. Your amount: ${amount}`,
      });
      return;
    }

    // validated! authorize a charge and create the order.
    // FIXME: in this ordering, someone could add items
    // to the cart at the last minute, between payment and item copy.

    const charge = await stripe.charges.create({
      amount,
      currency: process.env.ISO_CURRENCY,
      source: stripeToken,
      description: 'Great Bear Food Delivery',
      capture: false,
    });

    const orderId = await knex('order').insert({
      user_id: userId,
      amount,
      stripe_charge: charge,
    }).returning('id').then(ids => ids[0]);

    await knex.raw(`
      insert into order_item (order_id, item_id, quantity)
      select
        ?,
        item_id,
        quantity
      from cart_item
      where cart_id = ?
    `, [orderId, cartId])
  
    await knex('cart_item').delete().where('cart_id', cartId);
    await Promise.all([
      knex('cart').delete().where('id', cartId),
      setResponse({ orderId }),
    ]);

    // let hasura know everything is ok
    return res.status(200).end();
  };
};
