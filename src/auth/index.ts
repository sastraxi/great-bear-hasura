import Knex from 'knex';
import Express from 'express';
import { ApolloServer, gql } from 'apollo-server-express';
import { combineResolvers } from 'graphql-resolvers';

import { HasRequest } from '../types';

import ensureUserSession from '../resolver/ensure-user-session';
import ensureLoggedOut from '../resolver/ensure-logged-out';
import login from './resolver/login';
import logout from './resolver/logout';
import signup from './resolver/signup';
import currentUser from './resolver/current-user';

const typeDefs = gql`
  type AuthedUser {
    id: Int!
    email: String!
    isAdmin: Boolean!
  }

  type Mutation {
    login(email: String!, password: String!): AuthedUser!
    logout: Boolean!
    signup(email: String!, password: String!): AuthedUser!
  }

  type Query {
    currentUser: AuthedUser
  }
`;

/**
 * Wrap our resolver delegates in middleware.
 */
const resolvers = {
  Query: {
    currentUser: combineResolvers(
      ensureUserSession,
      currentUser,
    ),
  },
  Mutation: {
    login: combineResolvers(
      ensureLoggedOut,
      login,
    ),
    logout: combineResolvers(
      ensureUserSession,
      logout,
    ),
    signup: combineResolvers(
      ensureLoggedOut,
      signup,
    ),
  },
};

export default (
  app: Express.Application,
  knex: Knex,
): Express.Application => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }: HasRequest) => {
      console.log('request headers', req.headers);
      return {
        req,
        knex,
        role: req.headers['x-hasura-role'],
        userId: +req.headers['x-hasura-user-id'],
        sessionId: req.headers['x-hasura-session-id'],
      };
    },
  });

  server.applyMiddleware({
    app,
    path: '/schema/auth',
  });

  return app;
};
