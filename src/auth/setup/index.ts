import Knex from 'knex';
import Express from 'express';
import passport from 'passport';

import applyLocal from './local';
import webhook from '../webhook';

interface UserRow {
  id: number
};

export default (app: Express.Application, knex: Knex) => {
  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((user: UserRow, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await knex('user')
        .where({ id })
        .first();
      done(null, user);
    } catch (err) {
      console.error('Could not deserialize user', err);
      done(err);
    }
  });

  applyLocal(app, knex);

  app.get('/auth/webhook', webhook);

  // TODO: remove this old restful authn code
  // app.post('/auth/logout', logout);
};
