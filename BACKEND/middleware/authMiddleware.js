import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const token = authHeader.split(" ")[1];

    // JWT specific errors alag handle honge
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Token has expired. Please login again.",
        });
      }

      return res.status(401).json({
        success: false,
        message: "Invalid token. Authentication failed.",
      });
    }

    // Validate decoded payload before DB lookup
    if (!decoded?.id) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload.",
      });
    }

    // User existence verify karo DB se
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists.",
      });
    }

    // Sensitive fields exclude — sirf safe data attach karo
    req.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      themePreference: user.themePreference,
    };

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error during authentication.",
    });
  }
};

export default authMiddleware;

