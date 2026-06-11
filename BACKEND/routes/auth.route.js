import express from 'express';
import bcrypt from 'bcryptjs';
import passport from '../config/passport.js';
import User from '../models/user.model.js';
import { generateToken, protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide name, email and password' });
        }
        if (password.length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
        }
        const exists = await User.findOne({ email });
        if (exists) {
            return res.status(400).json({ success: false, message: 'Email already registered' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(password, salt);
        const user = await User.create({ name, email, password: hashed, provider: 'local' });
        const token = generateToken(user);
        res.status(201).json({
            success: true,
            data: { token, user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar, provider: user.provider } }
        });
    } catch (error) {
        console.error('Register error:', error.message);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide email and password' });
        }
        const user = await User.findOne({ email });
        if (!user || !user.password) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        const token = generateToken(user);
        res.json({
            success: true,
            data: { token, user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar, provider: user.provider } }
        });
    } catch (error) {
        console.error('Login error:', error.message);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/login' }), (req, res) => {
    const token = generateToken(req.user);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/callback?token=${token}`);
});

router.get('/github', passport.authenticate('github', { scope: ['user:email'], session: false }));

router.get('/github/callback', passport.authenticate('github', { session: false, failureRedirect: '/login' }), (req, res) => {
    const token = generateToken(req.user);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/callback?token=${token}`);
});

router.get('/me', protect, async (req, res) => {
    res.json({
        success: true,
        data: { id: req.user._id, name: req.user.name, email: req.user.email, avatar: req.user.avatar, provider: req.user.provider }
    });
});

export default router;
