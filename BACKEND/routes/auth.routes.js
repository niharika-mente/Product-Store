import express from "express";
import passport from "../config/passport.js";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import {
  registerUser,
  loginUser,
  logoutUser,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller.js";
import {
  setupTwoFactor,
  verifyTwoFactorSetup,
  disableTwoFactor,
} from "../controllers/twoFactor.controller.js";

import authMiddleware from "../middleware/authMiddleware.js";
import { loginLimiter, logoutLimiter, registerLimiter, forgotPasswordLimiter, resetPasswordLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/register",registerLimiter, registerUser);

router.post("/login",loginLimiter, loginUser);

router.post("/logout", logoutLimiter, authMiddleware,logoutUser);

router.post("/forgot-password", forgotPasswordLimiter, forgotPassword);
router.post("/reset-password/:token", resetPasswordLimiter, resetPassword);

// Two-factor authentication (TOTP / authenticator app). All require a logged-in
// session; the login route itself enforces the code once 2FA is enabled.
router.post("/2fa/setup", authMiddleware, setupTwoFactor);
router.post("/2fa/verify", authMiddleware, verifyTwoFactorSetup);
router.post("/2fa/disable", authMiddleware, disableTwoFactor);


// Social OAuth Routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/login' }), (req, res) => {
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/callback?token=${token}`);
});

router.get('/github', passport.authenticate('github', { scope: ['user:email'], session: false }));

router.get('/github/callback', passport.authenticate('github', { session: false, failureRedirect: '/login' }), (req, res) => {
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/callback?token=${token}`);
});

router.get('/me', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                provider: user.provider,
                themePreference: user.themePreference
            }
        });
    } catch (error) {
        console.error('GET ME ERROR:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

export default router;