import Product from "../models/product.model.js";
import User from "../models/user.model.js";
import Order from "../models/order.model.js";
import {
  indexProduct,
  deleteProductFromIndex,
} from "../services/elasticsearch.service.js";
import redis from "../config/redis.js";

async function invalidateProductCache() {
  if (!redis) return;
  try {
    const keys = await redis.keys("products:*");
    if (keys.length) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.warn("[Redis] Cache invalidation error:", error.message);
  }
}

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
    createProduct: async (_, args, context) => {
      if (!context.user) {
        throw new Error("Unauthorized");
      }

      const product = await Product.create(args);
      await indexProduct(product);
      await invalidateProductCache();
      return product;
    },

    updateProduct: async (_, { id, ...updates }, context) => {
      if (!context.user) {
        throw new Error("Unauthorized");
      }

      const product = await Product.findByIdAndUpdate(id, updates, {
        new: true,
      });
      if (product) {
        await indexProduct(product);
        await invalidateProductCache();
      }
      return product;
    },

    deleteProduct: async (_, { id }, context) => {
      if (!context.user) {
        throw new Error("Unauthorized");
      }

      const deleted = await Product.findByIdAndUpdate(
        id,
        { isDeleted: true },
        { new: true }
      );
      if (!deleted) {
        return false;
      }

      await deleteProductFromIndex(id);
      await invalidateProductCache();
      return true;
    },

    createUser: async (_, args, context) => {
      if (!context.user) {
        throw new Error("Unauthorized");
      }

      return await User.create(args);
    },

    deleteUser: async (_, { id }, context) => {
      if (!context.user) {
        throw new Error("Unauthorized");
      }

      const deleted = await User.findByIdAndDelete(id);
      return !!deleted;
    },
  },
};

