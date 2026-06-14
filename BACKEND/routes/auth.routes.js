import express from "express";

import {
  registerUser,
  loginUser,
  logoutUser,
} from "../controllers/auth.controller.js";

import authMiddleware from "../middleware/authMiddleware.js";
import { loginLimiter, logoutLimiter, registerLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/register",registerLimiter, registerUser);

router.post("/login",loginLimiter, loginUser);

router.post("/logout", logoutLimiter, authMiddleware,logoutUser);

export default router;