import { skip } from 'graphql-resolvers';
import { Context } from '../types';

const NOT_LOGGED_IN_MSG = 'You must be logged in to interact with this resource.';
const NO_SESSION_ID_MSG = 'No session ID is available on your request!';

/**
 * A simple resolver "middleware" we can combine with other resolvers
 * to make sure we always have a valid user session.
 */
const ensureUserSession = (_root: any, _params: any, { userId, sessionId }: Context) => {
  if (!userId) return new Error(NOT_LOGGED_IN_MSG);
  if (!sessionId) return new Error(NO_SESSION_ID_MSG);
  return skip;
};

export default ensureUserSession;
