import nodemailer from 'nodemailer';

function createTransporter() {
  const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS } = process.env;
  if (!EMAIL_HOST || !EMAIL_USER || !EMAIL_PASS) {
    console.warn('[Email] EMAIL_HOST / EMAIL_USER / EMAIL_PASS not set — emails will not be sent.');
    return null;
  }
  return nodemailer.createTransport({
    host: EMAIL_HOST,
    port: parseInt(EMAIL_PORT || '587'),
    secure: parseInt(EMAIL_PORT || '587') === 465,
    auth: { user: EMAIL_USER, pass: EMAIL_PASS },
  });
}

const transporter = createTransporter();
const FROM = process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@productstore.com';

async function send(to, subject, html) {
  if (!transporter) {
    console.log(`[Email] Would send "${subject}" to ${to} (SMTP not configured)`);
    return;
  }
  await transporter.sendMail({ from: FROM, to, subject, html });
}

export async function sendOrderConfirmationEmail(toEmail, order) {
  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);
  const deliveryStr = estimatedDelivery.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const itemRows = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 8px;border-bottom:1px solid #eee;">${item.name}</td>
        <td style="padding:10px 8px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
        <td style="padding:10px 8px;border-bottom:1px solid #eee;text-align:right;">$${(item.price * item.quantity).toFixed(2)}</td>
      </tr>`
    )
    .join('');

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);">

        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#00b5d8,#3182ce);padding:32px 40px;">
          <h1 style="margin:0;color:#fff;font-size:24px;">Order Confirmed!</h1>
          <p style="margin:6px 0 0;color:rgba(255,255,255,.85);font-size:14px;">Thank you for your purchase.</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:32px 40px;">
          <p style="margin:0 0 24px;color:#444;font-size:15px;">
            Hi there,<br><br>
            Your order has been received and is being processed. Here's a summary:
          </p>

          <!-- Order meta -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
            <tr>
              <td style="color:#888;font-size:13px;">Order ID</td>
              <td style="color:#222;font-size:13px;text-align:right;font-family:monospace;">${order._id}</td>
            </tr>
            <tr>
              <td style="color:#888;font-size:13px;padding-top:6px;">Estimated Delivery</td>
              <td style="color:#222;font-size:13px;text-align:right;padding-top:6px;">${deliveryStr}</td>
            </tr>
          </table>

          <!-- Items table -->
          <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
            <thead>
              <tr style="background:#f8f8f8;">
                <th style="padding:10px 8px;text-align:left;font-size:13px;color:#555;">Item</th>
                <th style="padding:10px 8px;text-align:center;font-size:13px;color:#555;">Qty</th>
                <th style="padding:10px 8px;text-align:right;font-size:13px;color:#555;">Subtotal</th>
              </tr>
            </thead>
            <tbody>${itemRows}</tbody>
          </table>

          <!-- Total -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
            <tr>
              <td style="font-weight:bold;font-size:16px;color:#222;">Total Charged</td>
              <td style="font-weight:bold;font-size:16px;color:#00b5d8;text-align:right;">$${order.totalAmount.toFixed(2)}</td>
            </tr>
          </table>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#f8f8f8;padding:20px 40px;text-align:center;">
          <p style="margin:0;color:#aaa;font-size:12px;">
            Questions? Reply to this email or visit our store.<br>
            &copy; ${new Date().getFullYear()} Product Store
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  await send(toEmail, `Order Confirmation — $${order.totalAmount.toFixed(2)}`, html);
}

export const sendPasswordResetEmail = async (toEmail, resetUrl) => {
  if (!transporter) {
    console.warn(`[Email] Would have sent password-reset email to ${toEmail}: ${resetUrl}`);
    return;
  }

  await transporter.sendMail({
    from: FROM,
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
