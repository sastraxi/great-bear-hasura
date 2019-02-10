// when new emails are created,
// grab props, template, and to from the
import Knex from 'knex';
import Express from 'express';

import { rowFromRequest } from '../../util';

/**
 * send queued emails
 */
export default (knex: Knex) =>
  async (req: Express.Request, res: Express.Response) => {
    const email = rowFromRequest(req);

    // TODO: actually send the email.

    await knex('email')
      .update({ sent_at: knex.fn.now() })
      .where({ id: email.id });

    // let hasura know everything is ok
    res.status(200).end();
  };
