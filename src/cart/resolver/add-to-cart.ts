import { CartParams } from '../types';
import { Context } from '../../types';
import ensureCart from '../ensure-cart';

/**
 * Make sure we have a cart for the current session,
 * then add a quantity of the given item to it.
 */
const addToCart = async (
  _root: any,
  { itemId, quantity }: CartParams,
  context: Context,
) => {
  if (quantity < 1) throw new Error(
    "addToCart expects an integer >= 1",
  );

  const { sessionId, userId, knex } = context;
  await ensureCart(context);
  return knex.raw(`
    insert into cart_item
      (cart_id, item_id, quantity)
    select
      id, ?, ?
    from cart
      where cart.session_id = ?
      and cart.user_id = ?
    on conflict
      (cart_id, item_id)
    do update
      set quantity = cart_item.quantity + excluded.quantity
  `, [itemId, quantity, sessionId, userId]).then(() => true);
};

export default addToCart;
