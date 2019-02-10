import Knex from 'knex';
import Express from 'express';
import passport from 'passport';
import bcrypt from 'bcrypt';

import { Strategy as LocalStrategy } from 'passport-local';
import { fromCoord } from '../util';
import login from './login';
import signup from './signup';

const ERR_USER_OR_PASSWORD_MISMATCH = 'user-or-password-mismatch';

export default (app: Express.Application, knex: Knex) => {
  passport.use(new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    async (email, password, done) => {
      const user = await knex('user')
        .whereRaw('lower(email) = ?', [email.toLowerCase().trim()])
        .first('id', 'email', 'hash_password', 'is_admin', 'latlon');
      
      if (!user) return done(ERR_USER_OR_PASSWORD_MISMATCH);
      if (!user.hash_password) return done(ERR_USER_OR_PASSWORD_MISMATCH);
      
      const passwordMatches = await bcrypt.compare(password, user.hash_password);
      if (!passwordMatches) return done(ERR_USER_OR_PASSWORD_MISMATCH);

      return done(null, {
        id: user.id,
        email: user.email,
        is_admin: user.is_admin,
        latlon: fromCoord(user.latlon),
      });
    },
  ));

  app.post('/auth/login', login);
  app.post('/auth/signup', signup(knex));
};
