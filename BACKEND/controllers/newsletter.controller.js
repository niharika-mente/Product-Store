import Newsletter from "../models/newsletter.model.js";
import { AppError } from "../middleware/errorMiddleware.js";

export const subscribeNewsletter = async (req, res, next) => {
  try {
    console.log("HEADERS =", req.headers);
    console.log("BODY =", req.body);

    const { email } = req.body || {};

    if (!email) {
      return next(new AppError("Email is required", 400));
    }

    const existingSubscriber = await Newsletter.findOne({
      email: email.toLowerCase(),
    });

    if (existingSubscriber) {
      return next(new AppError("Email already subscribed", 400));
    }

    const subscriber = await Newsletter.create({
      email: email.toLowerCase(),
    });

    res.status(201).json({
      success: true,
      message: "Successfully subscribed to newsletter",
      data: subscriber,
    });
  } catch (error) {
    next(error);
  }
};
