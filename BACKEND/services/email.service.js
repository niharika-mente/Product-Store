import nodemailer from 'nodemailer';

const isConfigured = () =>
    process.env.EMAIL_HOST &&
    process.env.EMAIL_USER &&
    process.env.EMAIL_PASS;

let transporter = null;

if (isConfigured()) {
    transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT) || 587,
        secure: Number(process.env.EMAIL_PORT) === 465,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
} else {
    console.warn('[Email] EMAIL_HOST / EMAIL_USER / EMAIL_PASS not set — password-reset emails will not be sent.');
}

export const sendPasswordResetEmail = async (toEmail, resetUrl) => {
    if (!transporter) {
        console.warn(`[Email] Would have sent password-reset email to ${toEmail}: ${resetUrl}`);
        return;
    }

    await transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: toEmail,
        subject: 'Password Reset Request – Product Store',
        html: `
            <div style="font-family:sans-serif;max-width:520px;margin:auto">
                <h2 style="color:#3182CE">Reset your password</h2>
                <p>You requested a password reset. Click the button below to set a new password.
                   This link expires in <strong>1 hour</strong>.</p>
                <a href="${resetUrl}"
                   style="display:inline-block;padding:12px 24px;background:#3182CE;color:#fff;
                          border-radius:6px;text-decoration:none;font-weight:600;margin:16px 0">
                    Reset Password
                </a>
                <p style="color:#718096;font-size:13px">
                    If you did not request this, you can safely ignore this email.<br/>
                    The link will expire automatically after 1 hour.
                </p>
            </div>
        `,
    });
};
