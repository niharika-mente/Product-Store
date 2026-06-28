import crypto from "crypto";
import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendPasswordResetEmail } from "../services/email.service.js";
import { processReferralOnRegister } from "../services/referral.service.js";
import { verifyTOTP } from "../services/totp.service.js";
const generateAccessToken = (user) =>
  jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );

const generateRefreshToken = (user) =>
  jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );
export const registerUser = async (req, res) => {
  try {
    
    const { name, email, password, referralCode } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });

    // Process referral asynchronously so it doesn't block response
    if (referralCode) {
      processReferralOnRegister(referralCode, user).catch(err => {
        console.error("Referral Error:", err);
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password, token: twoFactorToken } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and Password required",
      });
    }

    // twoFactorSecret is select:false, so it must be requested explicitly.
    const user = await User.findOne({ email }).select("+twoFactorSecret");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    if (!user.password) {
      let message = "Please log in with your social provider.";
      if (user.provider === "google") {
        message = "Please log in with Google";
      } else if (user.provider === "github") {
        message = "Please log in with GitHub";
      }
      return res.status(400).json({
        success: false,
        message,
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // When 2FA is enabled, a valid authenticator code is required in addition
    // to the password. If no code was supplied, signal the client to prompt for
    // one rather than issuing a session token.
    if (user.twoFactorEnabled) {
      if (!twoFactorToken) {
        return res.status(200).json({
          success: true,
          twoFactorRequired: true,
          message: "Two-factor authentication code required",
        });
      }
      if (!verifyTOTP(twoFactorToken, user.twoFactorSecret)) {
        return res.status(401).json({
          success: false,
          message: "Invalid two-factor authentication code",
        });
      }
    }

const accessToken = generateAccessToken(user);
const refreshToken = generateRefreshToken(user);

user.refreshToken = refreshToken;
await user.save();

res.status(200).json({
  success: true,
  message: "Login successful",
  accessToken,
  refreshToken,
  user: { 
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const logoutUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("+refreshToken");

    if (user) {
      user.refreshToken = null;
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: "Refresh token required",
      });
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET
    );

    const user = await User.findById(decoded.id)
      .select("+refreshToken");

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    user.refreshToken = newRefreshToken;
    await user.save();

    res.status(200).json({
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid refresh token",
    });
  }
};

const SAFE_RESET_RESPONSE = { success: true, message: "If that email exists, a reset link has been sent." };

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // Artificial delay on early-return paths so response time doesn't reveal user existence
    if (!user || user.provider !== 'local') {
      await new Promise(r => setTimeout(r, 250));
      return res.status(200).json(SAFE_RESET_RESPONSE);
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    const tokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password/${rawToken}`;

    // Send email BEFORE persisting token — prevents orphaned tokens if email fails
    try {
      await sendPasswordResetEmail(user.email, resetUrl);
    } catch (emailErr) {
      console.error('[Email] Password reset send failed:', emailErr.message);
      return res.status(500).json({ success: false, message: "Failed to send reset email. Please try again later." });
    }

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = tokenExpiry;
    await user.save();

    res.status(200).json(SAFE_RESET_RESPONSE);
  } catch (error) {
    console.error('[ForgotPassword] Unexpected error:', error.message);
    res.status(500).json({ success: false, message: "An unexpected error occurred. Please try again." });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ success: false, message: "Token and new password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Reset link is invalid or has expired" });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.status(200).json({ success: true, message: "Password updated successfully. You can now log in." });
  } catch (error) {
    console.error('[ResetPassword] Unexpected error:', error.message);
    res.status(500).json({ success: false, message: "An unexpected error occurred. Please try again." });
  }
};