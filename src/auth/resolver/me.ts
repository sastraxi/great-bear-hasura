import { AuthContext } from '../types';
import { User } from '../../types';

const me = async (
  _root: any,
  _params: any,
  { req }: AuthContext,
): Promise<User> => req.user;

export default me;
