import Express from 'express';
import { Context } from '../types';

export interface UserParams {
  email: string
  password: string
}

export interface AuthContext extends Context {
  req: Express.Request,
}
