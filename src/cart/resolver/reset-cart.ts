import { Context } from '../../types';
import ensureCart from '../ensure-cart';

/**
 * Make sure we have a cart for the current session,
 * then remove all items from it.
 */
const resetCart = async(
  _root: any,
  _params: any,
  context: Context,
) => {
  const { sessionId, userId, knex } = context;
  await ensureCart(context);
  return knex.raw(`
    delete from cart_item
    where cart_id = (
      select id
      from cart
      where cart.session_id = ?
      and cart.user_id = ?
    )
  `, [sessionId, userId]).then(() => true);
};

export default resetCart;
