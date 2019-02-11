import Express from 'express';
import { ApolloServer, gql } from 'apollo-server-express';

const schema = gql`
  type Mutation {
    addToCart(itemId: Int!, quantity: Int!): Int!
    setCartQuantity(itemId: Int!, quantity: Int!): Boolean!
    resetCart(): Boolean!
  }
`;

export default (app: Express.Application) => {

};
