import Product from "../models/product.model.js";
import User from "../models/user.model.js";
import Order from "../models/order.model.js";

export const resolvers = {
  Query: {
    products: async () => Product.find({ isDeleted: false }),
    product: async (_, { id }) =>
      Product.findOne({
        _id: id,
        isDeleted: false,
      }),

    users: async () => User.find(),
    user: async (_, { id }) => User.findById(id),

    orders: async () => Order.find().populate("user"),
    order: async (_, { id }) => Order.findById(id).populate("user"),
  },
  Mutation: {
    createProduct: async (_, args) => {
      return await Product.create(args);
    },

    updateProduct: async (_, { id, ...updates }) => {
      return await Product.findByIdAndUpdate(id, updates, {
        new: true,
      });
    },

    deleteProduct: async (_, { id }) => {
      const deleted = await Product.findByIdAndDelete(id);
      return !!deleted;
    },

    createUser: async (_, args) => {
      return await User.create(args);
    },

    deleteUser: async (_, { id }) => {
      const deleted = await User.findByIdAndDelete(id);
      return !!deleted;
    },
  },
};
