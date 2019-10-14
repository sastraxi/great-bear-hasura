import { Context } from '../types';

const ensureCart = ({ knex, userId, sessionId }: Context) =>
  knex.raw(` 
    insert into "cart"
      (session_id, user_id)
    values
      (?, ?)
    on conflict
    do nothing
  `, [sessionId, userId]);

export default ensureCart;
