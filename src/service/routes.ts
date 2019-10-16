import Knex from 'knex';
import Express from 'express';

import createOrder from './u/1-create-order';
import waiter from './u/2-waiter';
import capture from './u/3-capture';
import chef from './u/4-chef';
import driver from './u/5-driver';

export default (knex: Knex): Express.Router => {
  const app = Express.Router();

  app.post('/create-order', createOrder(knex));
  app.post('/waiter', waiter(knex));
  app.post('/capture', capture(knex));
  app.post('/chef', chef(knex));
  app.post('/driver', driver(knex));

  return app;  
};
