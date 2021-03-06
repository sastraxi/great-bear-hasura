import Express from 'express';

/**
 * This is called by Hasura whenever it needs to know who's logged in
 * for a given HTTP request. It lets us control authentication!
 */
export default (
  req: Express.Request,
  res: Express.Response,
) => {
  if (!req.user) {
    return res.status(200).json({
      'X-Hasura-Role': 'anonymous',
      'X-Hasura-Session-Id': req.session && req.session.id,
    });
  }
  return res.status(200).json({
    'X-Hasura-Role': req.user.is_admin ? 'admin' : 'user',
    'X-Hasura-User-Id': `${req.user.id}`,
    'X-Hasura-Session-Id': req.session.id,
  });

  // XXX: testing!
  // return res.status(200).json({
  //   'X-Hasura-Role': 'user',
  //   'X-Hasura-User-Id': '3',
  //   'X-Hasura-Session-Id': req.session.id,
  // });
};
