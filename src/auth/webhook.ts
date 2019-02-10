import Express from 'express';

export default (
  req: Express.Request,
  res: Express.Response,
) => {
  if (!req.user) {
    return res.status(200).json({
      'X-Hasura-Role': 'anonymous',
    });
  }
  return res.status(200).json({
    'X-Hasura-Role': req.user.is_admin ? 'admin' : 'user',
    'X-Hasura-User-Id': `${req.user.id}`,
  });
};
