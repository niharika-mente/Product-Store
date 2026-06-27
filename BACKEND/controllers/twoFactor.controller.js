import User from "../models/user.model.js";
import { generateSecret, verifyTOTP, buildOtpauthURL } from "../services/totp.service.js";

const ISSUER = process.env.TOTP_ISSUER || "Product-Store";

// POST /api/auth/2fa/setup  (authenticated)
// Generates a fresh TOTP secret, stashes it as a *pending* secret, and returns
// it together with an otpauth:// URI for the user to add to their authenticator
// app. 2FA is not active until the first code is verified.
export const setupTwoFactor = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("+twoFactorTempSecret");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    if (user.twoFactorEnabled) {
      return res.status(400).json({
        success: false,
        message: "Two-factor authentication is already enabled",
      });
    }

    const secret = generateSecret();
    user.twoFactorTempSecret = secret;
    await user.save();

    const otpauthUrl = buildOtpauthURL({ secret, accountName: user.email, issuer: ISSUER });

    return res.status(200).json({
      success: true,
      message:
        "Add this secret to your authenticator app, then verify a generated code to enable two-factor authentication.",
      secret,
      otpauthUrl,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/auth/2fa/verify  (authenticated)
// Confirms the pending secret by checking the first code. On success the
// pending secret is promoted to the active secret and 2FA is enabled.
export const verifyTwoFactorSetup = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: "Verification code is required" });
    }

    const user = await User.findById(req.user.id).select(
      "+twoFactorSecret +twoFactorTempSecret"
    );
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    if (user.twoFactorEnabled) {
      return res.status(400).json({
        success: false,
        message: "Two-factor authentication is already enabled",
      });
    }
    if (!user.twoFactorTempSecret) {
      return res.status(400).json({
        success: false,
        message: "No pending two-factor setup. Start setup first.",
      });
    }
    if (!verifyTOTP(token, user.twoFactorTempSecret)) {
      return res.status(400).json({ success: false, message: "Invalid verification code" });
    }

    user.twoFactorSecret = user.twoFactorTempSecret;
    user.twoFactorTempSecret = null;
    user.twoFactorEnabled = true;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Two-factor authentication enabled successfully",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/auth/2fa/disable  (authenticated)
// Turns 2FA off, but only after the user proves possession of the device with a
// current code — so a hijacked session alone can't strip the second factor.
export const disableTwoFactor = async (req, res) => {
  try {
    const { token } = req.body;

    const user = await User.findById(req.user.id).select(
      "+twoFactorSecret +twoFactorTempSecret"
    );
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    if (!user.twoFactorEnabled) {
      return res.status(400).json({
        success: false,
        message: "Two-factor authentication is not enabled",
      });
    }
    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Verification code is required to disable two-factor authentication",
      });
    }
    if (!verifyTOTP(token, user.twoFactorSecret)) {
      return res.status(400).json({ success: false, message: "Invalid verification code" });
    }

    user.twoFactorEnabled = false;
    user.twoFactorSecret = null;
    user.twoFactorTempSecret = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Two-factor authentication disabled",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
