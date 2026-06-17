import nodemailer from 'nodemailer';

const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
        port: process.env.SMTP_PORT || 2525,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
};

export const sendEmail = async ({ to, subject, html }) => {
    // Skip sending emails in test environment
    if (process.env.NODE_ENV === 'test') {
        console.log(`[Test Mode] Email to ${to} suppressed. Subject: ${subject}`);
        return true;
    }

    try {
        const transporter = createTransporter();
        const mailOptions = {
            from: process.env.EMAIL_FROM || 'noreply@product-store.com',
            to,
            subject,
            html,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to ${to}: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error(`Failed to send email to ${to}:`, error.message);
        // We don't throw the error so it doesn't break the main workflow
        return false;
    }
};

export const getOrderStatusTemplate = (order, status) => {
    const orderItemsList = order.items.map(item => `
        <li>${item.name} (x${item.quantity}) - $${item.price.toFixed(2)}</li>
    `).join('');

    const statusMessage = {
        placed: "Your order has been successfully placed and is being processed.",
        shipped: "Good news! Your order has been shipped and is on its way.",
        delivered: "Your order has been delivered. We hope you enjoy your purchase!"
    }[status] || "Your order status has been updated.";

    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Order Status Update: ${status.toUpperCase()}</h2>
            <p>${statusMessage}</p>
            <p><strong>Order ID:</strong> ${order._id}</p>
            <p><strong>Total Amount:</strong> $${order.totalAmount.toFixed(2)}</p>
            <h3>Order Details:</h3>
            <ul>
                ${orderItemsList}
            </ul>
            <p>Thank you for shopping with us!</p>
        </div>
    `;
};
