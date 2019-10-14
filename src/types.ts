import Knex from 'knex';
import Express from 'express';

export interface Context {
  knex: Knex,
  userId?: number,
  sessionId?: string,
}

export interface HasRequest {
  req: Express.Request,
}
