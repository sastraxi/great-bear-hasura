import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import cors from 'cors';

import serviceRoutes from './service/routes';
import applyPassport from './auth/setup';
import applyAuthSchema from './auth';
import applyCartSchema from './cart';

import knex from './db/knex';

const app = express();

app.use(session({
  name: 'great-bear-hasura.sid',
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 120,
  },
  rolling: true,
}));

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

applyPassport(app, knex);
applyAuthSchema(app, knex);
applyCartSchema(app, knex);
app.use('/u', serviceRoutes(knex));
app.get('/', (req, res) => {
  req.session.abc = 123; // FIXME: delete this once we're actually logging in
  res.status(200).send('OK');
});

const port = process.env.PORT || 3000;
app.listen(port , () =>
  console.log('App running at http://localhost:' + port));
