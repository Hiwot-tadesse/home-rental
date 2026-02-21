// utils/sendWelcomeEmail.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,           // your Gmail
    pass: process.env.GMAIL_APP_PASSWORD    // your app password
  }
});

/**
 * Send a welcome email to new user
 * @param {string} userEmail - Recipient email
 * @param {string} fullName - User full name
 */
async function sendWelcomeEmail(userEmail, fullName) {
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: userEmail,
    subject: 'Welcome to myHome! 🏠',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #E5E7EB; border-radius: 10px; overflow: hidden;">
        <div style="background: #4F46E5; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">myHome</h1>
          <p style="color: #E0E7FF; margin: 5px 0;">Ethiopia's Trusted Home Rental Platform</p>
        </div>
        <div style="padding: 30px; text-align: center;">
          <h2 style="color: #1F2937;">Hello ${fullName}! 👋</h2>
          <p>Your registration was successful. Welcome to <strong>myHome</strong> — your gateway to finding the perfect rental property in Ethiopia!</p>
          <p style="font-size: 12px; color: #6B7280;">We are excited to have you on board.</p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${userEmail}`);
    return true;
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return false;
  }
}

module.exports = { sendWelcomeEmail };