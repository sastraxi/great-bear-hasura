import Knex from 'knex';
import Stripe from 'stripe';
import Express from 'express';

import {
  rowFromRequest,
} from '../../util';

import { setOrderErrorQuery } from '../../db/query';

/**
 * when an order is created, we need to authorize the charge
 * on the credit card, as well as make sure the amount is right
 */
export default (knex: Knex) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  return async (req: Express.Request, res: Express.Response) => {
    const {
      id: orderId,
      cart_id: cartId,
      amount,
      stripe_token: stripeToken,
      user_id: userId,
    } = rowFromRequest(req);
    const setError = setOrderErrorQuery(knex)(orderId);

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
      await setError({
        message: "You do not own this cart!",
      });
      return;
    }

    if (cart.totalAmount !== amount) {
      await setError({
        message: `Cart amount: ${cart.totalAmount}. Your amount: ${amount}`,
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
      knex('order').update({
        stripe_charge: charge,
        authorized_at: knex.fn.now(),
      })
    ]);

    // let hasura know everything is ok
    return res.status(200).end();
  };
};
