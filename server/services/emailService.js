import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// Send verification code email
export const sendVerificationCode = async (email, code) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Blog Platform" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset Verification Code',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
              .code-box { background: white; border: 2px dashed #f59e0b; padding: 20px; text-align: center; margin: 20px 0; border-radius: 10px; }
              .code { font-size: 32px; font-weight: bold; color: #d97706; letter-spacing: 5px; }
              .footer { text-align: center; margin-top: 20px; color: #64748b; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🔐 Password Reset Request</h1>
              </div>
              <div class="content">
                <p>Hello,</p>
                <p>We received a request to reset your password. Please use the verification code below to reset your password:</p>
                
                <div class="code-box">
                  <div class="code">${code}</div>
                  <p style="color: #64748b; font-size: 14px; margin-top: 10px;">This code will expire in 10 minutes</p>
                </div>
                
                <p><strong>Important:</strong></p>
                <ul>
                  <li>This code is valid for 10 minutes only</li>
                  <li>Do not share this code with anyone</li>
                  <li>If you didn't request this, please ignore this email</li>
                </ul>
                
                <div class="footer">
                  <p>This is an automated message. Please do not reply to this email.</p>
                  <p>&copy; ${new Date().getFullYear()} Blog Platform. All rights reserved.</p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Verification code sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error.message);
    return false;
  }
};
