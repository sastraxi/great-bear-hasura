import Knex from 'knex';
import Express from 'express';
import { ApolloServer, gql } from 'apollo-server-express';
import { combineResolvers } from 'graphql-resolvers';

import { Context, HasRequest } from '../types';

import ensureUserSession from '../resolver/ensure-user-session';
import addToCart from './resolver/add-to-cart';
import setCartQuantity from './resolver/set-cart-quantity';
import resetCart from './resolver/reset-cart';

const typeDefs = gql`
  type Mutation {
    addToCart(itemId: Int!, quantity: Int!): Boolean!
    setCartQuantity(itemId: Int!, quantity: Int!): Boolean!
    resetCart: Boolean!
  }

  type Query {
    sessionId: String!
  }
`;

const resolvers = {
  Query: {
    /**
     * Exposing the session ID via GraphQL lets us use HTTP-only
     * cookies, as well as subscribe to our cart table directly through Hasura.
     */
    sessionId: (_root: any, _params: any, { sessionId }: Context) => sessionId,
  },
  Mutation: {
    addToCart: combineResolvers(
      ensureUserSession,
      addToCart,
    ),

    setCartQuantity: combineResolvers(
      ensureUserSession,
      setCartQuantity,
    ),

    resetCart: combineResolvers(
      ensureUserSession,
      resetCart,
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
        knex,
        role: req.headers['x-hasura-role'],
        userId: +req.headers['x-hasura-user-id'],
        sessionId: req.headers['x-hasura-session-id'],
      };
    },
  });

  server.applyMiddleware({
    app,
    path: '/schema/cart',
  });

  return app;
};
