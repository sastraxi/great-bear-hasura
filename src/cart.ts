import Knex from 'knex';
import Express from 'express';
import { ApolloServer, gql } from 'apollo-server-express';
import knex from './db/knex';

interface Context {
  knex: Knex,
  userId?: number,
  sessionId?: string,
}

interface HasRequest {
  req: Express.Request,
}

interface CartParams {
  itemId: number,
  quantity: number,
}

const schema = gql`
  type Mutation {
    addToCart(itemId: Int!, quantity: Int!): Boolean!
    setCartQuantity(itemId: Int!, quantity: Int!): Boolean!
    resetCart: Boolean!
  }

  type Query {
    sessionId: String!
  }
`;

const ensureCart = ({ knex, userId, sessionId }: Context) =>
  knex.raw(`
    insert into "cart"
      (session_id, user_id)
    values
      (?, ?)
    on conflict do nothing
  `, [sessionId, userId]);

const resolvers = {
  Query: {
    /**
     * Exposing the session ID via GraphQL lets us use HTTP-only
     * cookies, as well as subscribe to our cart table directly through Hasura.
     */
    sessionId: (_root: any, _params: any, { sessionId }: Context) => sessionId,
  },
  Mutation: {
    /**
     * Make sure we have a cart for the current session,
     * then add a quantity of the given item to it.
     */
    addToCart: async (
      _root: any,
      { itemId, quantity }: CartParams,
      context: Context,
    ) => {
      const { sessionId, userId } = context;      
      await ensureCart(context);
      return knex.raw(`
        insert into cart_item
          (cart_id, item_id, quantity)
        select
          id, ?, ?
          from cart
          where cart.session_id = ?
          and cart.user_id = ?
        on conflict do update
          set quantity = quantity + excluded.quantity
      `, [itemId, quantity, sessionId, userId]).then(() => true);
    },

    /**
     * Make sure we have a cart for the current session,
     * then set an item's quantity in it (0 to remove).
     */
    setCartQuantity: async (
      _root: any,
      { itemId, quantity }: CartParams,
      context: Context,
    ) => {
      const { sessionId, userId } = context;
      await ensureCart(context);
      if (quantity > 0) {
        return knex.raw(`
          insert into cart_item
            (cart_id, item_id, quantity)
          select
            id, ?, ?
            from cart
            where cart.session_id = ?
            and cart.user_id = ?
          on conflict do update
            set quantity = excluded.quantity
      `, [itemId, quantity, sessionId, userId]).then(() => true);
      } else {
        return knex.raw(`
          delete from cart_item
          where item_id = ? and cart_id = (
            select id
            from cart
            where cart.session_id = ?
            and cart.user_id = ?
          )
        `, [itemId, sessionId, userId]).then(() => true);
      }
    },

    /**
     * Make sure we have a cart for the current session,
     * then remove all items from it.
     */
    resetCart: async(
      _root: any,
      _params: any,
      context: Context,
    ) => {
      const { sessionId, userId } = context;      
      await ensureCart(context);
      return knex.raw(`
        delete from cart_item
        where cart_id = (
          select id
          from cart
          where cart.session_id = ?
          and cart.user_id = ?
        )
      `, [sessionId, userId]).then(() => true);
    },
  },
};

export default (
  app: Express.Application,
  knex: Knex
): Express.Application => {
  const server = new ApolloServer({
    typeDefs: schema,
    resolvers,
    context: ({ req }: HasRequest) => {
      console.log('request headers', req.headers);
      return {
        knex,
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
