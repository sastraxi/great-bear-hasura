import { CartParams } from '../types';
import { Context } from '../../types';
import ensureCart from '../ensure-cart';

/**
 * Make sure we have a cart for the current session,
 * then set an item's quantity in it (0 to remove).
 */
const setCartQuantity = async (
  _root: any,
  { itemId, quantity }: CartParams,
  context: Context,
) => {
  const { sessionId, userId, knex } = context;
  await ensureCart(context);
  if (quantity > 0) {
    // directly set cart_item.quantity
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
        set quantity = excluded.quantity
  `, [itemId, quantity, sessionId, userId]).then(() => true);
  } else {
    // silently treats negatives as 0 (deletion)
    return knex.raw(`
      delete from cart_item

      where item_id = ? and cart_id = (
        select id
        from cart
        where cart.session_id = ?
        and cart.user_id = ?
      )
    `, [itemId, sessionId, userId]).then(() => true);
  }
};

export default setCartQuantity;
