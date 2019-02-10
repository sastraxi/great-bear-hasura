import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import cors from 'cors';

import serviceRoutes from './service/routes';
import applyPassport from './auth/passport';

import knex from './db/knex';

const app = express();

app.use(session({
  name: 'great-bear-hasura.sid',
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
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

app.use('/u', serviceRoutes(knex));
app.get('/', (req, res) => {
  res.status(200).send('OK');
});

const port = process.env.PORT || 3000;
app.listen(port , () =>
  console.log('App running at http://localhost:' + port));
