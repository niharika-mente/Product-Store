export const typeDefs = `#graphql
  type Product {
    _id: ID!
    name: String!
    price: Float!
    image: String!
    description: String
    category: String
    brand: String
    stock: Int
    averageRating: Float
    reviewCount: Int
  }

  type User {
    _id: ID!
    name: String!
    email: String!
    avatar: String
  }

  type Order {
    _id: ID!
    totalAmount: Float!
    paymentStatus: String!
    stripeSessionId: String!
  }

  type Query {
    products: [Product]
    product(id: ID!): Product

    users: [User]
    user(id: ID!): User

    orders: [Order]
    order(id: ID!): Order
  }

  type Mutation {
    createProduct(
      name: String!
      price: Float!
      image: String!
      description: String
      category: String
      brand: String
      stock: Int
    ): Product

    updateProduct(
      id: ID!
      name: String
      price: Float
      image: String
      description: String
      category: String
      brand: String
      stock: Int
    ): Product

    deleteProduct(id: ID!): Boolean

    createUser(
      name: String!
      email: String!
    ): User

    deleteUser(id: ID!): Boolean
  }
`;
