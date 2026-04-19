const nodemailer = require('nodemailer');

// Ethereal is a fake SMTP service provided by Nodemailer for testing
// We will create a test account on the fly if credentials aren't provided in .env
let transporter;

const getTransporter = async () => {
  if (transporter) return transporter;

  // Use provided SMTP if configured in .env (e.g. real Gmail or custom SMTP)
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    return transporter;
  }

  // Fallback to auto-generated Ethereal account for local dev/testing
  console.log("No SMTP settings found in .env. Falling back to Ethereal Email for testing...");
  const testAccount = await nodemailer.createTestAccount();

  transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: testAccount.user, // generated ethereal user
      pass: testAccount.pass, // generated ethereal password
    },
  });

  return transporter;
};

const sendVerificationEmail = async (toEmail, code) => {
  try {
    const t = await getTransporter();

    const info = await t.sendMail({
      from: '"Nathan Blog" <noreply@nathanblog.com>',
      to: toEmail,
      subject: "Verify Your Email Address",
      text: `Your verification code is: ${code}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #2F3E46;">Welcome to Nathan Blog!</h2>
          <p>Thank you for registering. Please use the following code to verify your email address:</p>
          <div style="background-color: #f4f4f4; padding: 15px; border-radius: 6px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 2px;">
            ${code}
          </div>
          <p>If you did not request this, you can safely ignore this email.</p>
        </div>
      `,
    });

    return true;
  } catch (error) {
    console.error("Error sending verification email:", error);
    return false;
  }
};

const sendPasswordResetEmail = async (toEmail, code) => {
  try {
    const t = await getTransporter();

    const info = await t.sendMail({
      from: '"Nathan Blog Security" <security@nathanblog.com>',
      to: toEmail,
      subject: "Reset Your Password",
      text: `Your password reset code is: ${code}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #2F3E46;">Password Reset Request</h2>
          <p>We received a request to reset your password. Here is your 6-digit reset code:</p>
          <div style="background-color: #f4f4f4; padding: 15px; border-radius: 6px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 2px;">
            ${code}
          </div>
          <p style="color: #666; font-size: 14px;">This code will expire in 30 minutes. If you did not request a password reset, please ignore this email.</p>
        </div>
      `,
    });

    return true;
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return false;
  }
};

const sendContactEmail = async (name, email, subject, message) => {
  try {
    const t = await getTransporter();

    const toEmail = process.env.SMTP_USER || 'admin@nathanblog.com';

    const info = await t.sendMail({
      from: '"Nathan Blog Contact Form" <noreply@nathanblog.com>',
      replyTo: email,
      to: toEmail,
      subject: `New Contact Submission: ${subject}`,
      text: `You have a new message from ${name} (${email}):\n\n${message}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #2F3E46; border-bottom: 2px solid #ddd; padding-bottom: 10px;">New Contact Message</h2>
          <p><strong>From:</strong> ${name} (<a href="mailto:${email}">${email}</a>)</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #C4A484; margin-top: 20px;">
            <p style="white-space: pre-wrap; margin: 0;">${message}</p>
          </div>
        </div>
      `,
    });

    console.log("----------------------------------------");
    console.log("📧 Contact Email sent: %s", info.messageId);
    console.log("🔗 Preview URL: %s", nodemailer.getTestMessageUrl(info));
    console.log("----------------------------------------");
    return true;
  } catch (error) {
    console.error("Error sending contact email:", error);
    return false;
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendContactEmail
};
