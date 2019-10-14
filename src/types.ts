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

export interface User {
  id: number
  email: string
  is_admin: boolean
}

declare module 'http' {
  export interface IncomingMessage {
    user?: User
    ip: string // from Express.Request
  }
}
