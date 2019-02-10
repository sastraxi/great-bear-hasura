import Express from 'express';
import passport from 'passport';
import _ from 'lodash';
import { fromCoord } from '../util';

export default (
  req: Express.Request,
  res: Express.Response,
  next: any
) => {
  passport.authenticate('local', (err, user) => {
    if (err) {
      return res.status(401).send('User or password mismatch.');
    }
    return req.login(user, (loginError) => {
      if (loginError) return res.status(500).send(loginError);
      return res.status(200).json({
        user: {
          ..._.pick(user, ['id', 'email', 'is_admin']),
          latlon: fromCoord(user.latlon),
        },
      });
    });
  })(req, res, next);
};
