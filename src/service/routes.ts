import Knex from 'knex';
import Express from 'express';

import waiter from './u/waiter';
import capture from './u/capture';
import chef from './u/chef';
import driver from './u/driver';
import email from './u/email';

export default (knex: Knex): Express.Router => {
  const app = Express.Router();

  app.get('waiter', waiter(knex));
  app.get('capture', capture(knex));
  app.get('chef', chef(knex));
  app.get('driver', driver(knex));
  app.get('email', email(knex));

  return app;  
};
