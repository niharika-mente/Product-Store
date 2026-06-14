import express from "express";
import passport from "../config/passport.js";
import jwt from "jsonwebtoken";

import {
  registerUser,
  loginUser,
  logoutUser,
} from "../controllers/auth.controller.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.post("/logout", authMiddleware, logoutUser);

// Social OAuth Routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/login' }), (req, res) => {
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/callback`);
});

router.get('/github', passport.authenticate('github', { scope: ['user:email'], session: false }));

router.get('/github/callback', passport.authenticate('github', { session: false, failureRedirect: '/login' }), (req, res) => {
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/callback`);
});

router.get('/me', authMiddleware, async (req, res) => {
    res.json({
        success: true,
        data: { id: req.user._id, name: req.user.name, email: req.user.email, avatar: req.user.avatar, provider: req.user.provider }
    });
});

export default router;