import pick from 'lodash/pick';
import passport from 'passport';
import { AuthContext } from '../types';
import { UserParams, User } from "../types";

const login = async (
  _root: any,
  { email, password }: UserParams,
  { req }: AuthContext,
): Promise<User> => new Promise((resolve, reject) => {
  req.body.email = email;
  req.body.password = password;

  passport.authenticate('local', (err: any, user) => {
    if (err) {
      return reject('User or password mismatch.');
    }
    return req.login(user, (loginError) => {
      if (loginError) return reject(loginError);

      return resolve(
        pick(user, ['id', 'email', 'is_admin']),
      );
    });
  })(req);
});

export default login;
