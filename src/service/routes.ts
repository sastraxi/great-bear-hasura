import Knex from 'knex';
import Express from 'express';

import createOrder from './u/create-order';
import waiter from './u/waiter';
import capture from './u/capture';
import chef from './u/chef';
import driver from './u/driver';
import email from './u/email';

export default (knex: Knex): Express.Router => {
  const app = Express.Router();

  app.post('/create-order', createOrder(knex));
  app.post('/waiter', waiter(knex));
  app.post('/capture', capture(knex));
  app.post('/chef', chef(knex));
  app.post('/driver', driver(knex));
  app.post('/email', email(knex));

  return app;  
};
