import { ApolloServer } from "@apollo/server";
import { typeDefs } from "./schema.js";
import { resolvers } from "./resolvers.js";

export const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
});
