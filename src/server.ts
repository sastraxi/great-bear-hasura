import 'dotenv/config';
import express from 'express';

import serviceRoutes from './service/routes';
import applyPassport from './auth/passport';

import knex from './db/knex';

const app = express();
applyPassport(app, knex);

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/u', serviceRoutes(knex));
app.get('/', (req, res) => {
  res.status(200).send('OK');
});

const port = process.env.PORT || 3000;
app.listen(port , () =>
  console.log('App running at http://localhost:' + port));
