import { AuthContext } from '../types';
import { User } from '../../types';

const currentUser = async (
  _root: any,
  _params: any,
  { req }: AuthContext,
): Promise<User> => req.user;

export default currentUser;
