import axios from 'axios';

console.log('✅ Brevo API initialized successfully');

// Helper to send HTML email via Brevo REST API
const sendEmail = async (to, subject, htmlContent) => {
  try {
    console.log(`📧 Sending email to: ${to}`);
    
    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: {
          email: process.env.BREVO_SENDER_EMAIL,
          name: 'BullBoom'
        },
        to: [
          { email: to }
        ],
        subject: subject,
        htmlContent: htmlContent
      },
      {
        headers: {
          'accept': 'application/json',
          'api-key': process.env.BREVO_API_KEY,
          'content-type': 'application/json'
        }
      }
    );
    
    console.log('✅ Email sent successfully:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Failed to send email');
    console.error('Full error details:', error.response ? error.response.data : error);
    throw error;
  }
};

// Send OTP email
export const sendOtpEmail = async (to, otp) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #050816; padding: 20px; text-align: center;">
        <h1 style="color: #32CD32; margin: 0;">Bull Boom</h1>
      </div>
      <div style="padding: 30px; background-color: #0B1220; color: #fff;">
        <h2 style="color: #39FF14; margin-top: 0;">Verify Your Email</h2>
        <p style="font-size: 16px; line-height: 1.6;">
          Hello!
        </p>
        <p style="font-size: 16px; line-height: 1.6;">
          Thank you for registering with Bull Boom. Use the following OTP to complete your registration:
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <div style="display: inline-block; background: linear-gradient(to right, #32CD32, #39FF14); padding: 15px 40px; border-radius: 10px;">
            <span style="font-size: 32px; font-weight: bold; color: #050816; letter-spacing: 5px;">${otp}</span>
          </div>
        </div>
        <p style="font-size: 14px; line-height: 1.6; color: #B8C0D4;">
          This OTP is valid for 5 minutes only. Please do not share this OTP with anyone.
        </p>
        <hr style="border-color: #32CD32; margin: 20px 0; opacity: 0.3;">
        <p style="font-size: 12px; color: #B8C0D4;">
          If you didn't request this, please ignore this email.
        </p>
      </div>
    </div>
  `;

  return sendEmail(to, 'Your OTP for Bull Boom Registration', html);
};

// Send Forgot Password OTP email
export const sendForgotPasswordOtpEmail = async (to, otp) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #050816; padding: 20px; text-align: center;">
        <h1 style="color: #32CD32; margin: 0;">Bull Boom</h1>
      </div>
      <div style="padding: 30px; background-color: #0B1220; color: #fff;">
        <h2 style="color: #39FF14; margin-top: 0;">Reset Your Password</h2>
        <p style="font-size: 16px; line-height: 1.6;">
          Hello!
        </p>
        <p style="font-size: 16px; line-height: 1.6;">
          We received a request to reset your Bull Boom password. Use the following OTP to reset your password:
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <div style="display: inline-block; background: linear-gradient(to right, #32CD32, #39FF14); padding: 15px 40px; border-radius: 10px;">
            <span style="font-size: 32px; font-weight: bold; color: #050816; letter-spacing: 5px;">${otp}</span>
          </div>
        </div>
        <p style="font-size: 14px; line-height: 1.6; color: #B8C0D4;">
          This OTP is valid for 5 minutes only. Please do not share this OTP with anyone.
        </p>
        <hr style="border-color: #32CD32; margin: 20px 0; opacity: 0.3;">
        <p style="font-size: 12px; color: #B8C0D4;">
          If you didn't request this, please ignore this email. Your account will remain secure.
        </p>
      </div>
    </div>
  `;

  return sendEmail(to, 'Your OTP for Bull Boom Password Reset', html);
};
