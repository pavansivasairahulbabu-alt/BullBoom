import { BrevoClient } from '@getbrevo/brevo';

// Initialize Brevo API client
const initializeBrevo = () => {
  console.log("BREVO KEY:", !!process.env.BREVO_API_KEY);
  console.log("SENDER:", process.env.SENDER_EMAIL);
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.error('BREVO_API_KEY is not set in environment variables');
    return null;
  }

  return new BrevoClient({ apiKey });
};

// Generic send email function
const sendEmail = async (to, subject, htmlContent) => {
  try {
    const brevo = initializeBrevo();
    if (!brevo) {
      throw new Error('Brevo API not initialized');
    }

    const senderEmail = process.env.SENDER_EMAIL;
    if (!senderEmail) {
      throw new Error('SENDER_EMAIL is not set in environment variables');
    }

    console.log("Attempting to send email with Brevo...");
    const result = await brevo.transactionalEmails.sendTransacEmail({
      subject: subject,
      htmlContent: htmlContent,
      sender: { name: "BullBoom", email: senderEmail },
      to: [{ email: to }]
    });

    console.log('Email sent successfully:', result);
    return { success: true, message: 'Email sent successfully', data: result };
  } catch (error) {
    console.error("Brevo Error:", error);
    return { success: false, message: error.message, error: error };
  }
};

// Send OTP email
export const sendOtpEmail = async (to, otp) => {
  const subject = "Bull Boom OTP Verification";
  const htmlContent = `
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
          This OTP is valid for 10 minutes only. Please do not share this OTP with anyone.
        </p>
        <hr style="border-color: #32CD32; margin: 20px 0; opacity: 0.3;">
        <p style="font-size: 12px; color: #B8C0D4;">
          If you didn't request this, please ignore this email.
        </p>
      </div>
    </div>
  `;

  const result = await sendEmail(to, subject, htmlContent);
  if (!result.success) {
    throw new Error(result.message);
  }
  return true;
};

// Send Forgot Password OTP email
export const sendForgotPasswordOtpEmail = async (to, otp) => {
  const subject = "Your OTP for Bull Boom Password Reset";
  const htmlContent = `
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
          This OTP is valid for 10 minutes only. Please do not share this OTP with anyone.
        </p>
        <hr style="border-color: #32CD32; margin: 20px 0; opacity: 0.3;">
        <p style="font-size: 12px; color: #B8C0D4;">
          If you didn't request this, please ignore this email. Your account will remain secure.
        </p>
      </div>
    </div>
  `;

  const result = await sendEmail(to, subject, htmlContent);
  if (!result.success) {
    throw new Error(result.message);
  }
  return true;
};

// Check if Brevo is configured
export const isBrevoConfigured = () => {
  return {
    provider: "Brevo",
    apiKeyConfigured: !!process.env.BREVO_API_KEY,
    senderConfigured: !!process.env.SENDER_EMAIL
  };
};

// Send test email
export const sendTestEmail = async (to) => {
  const subject = "Test Email from Bull Boom";
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #050816; padding: 20px; text-align: center;">
        <h1 style="color: #32CD32; margin: 0;">Bull Boom</h1>
      </div>
      <div style="padding: 30px; background-color: #0B1220; color: #fff;">
        <h2 style="color: #39FF14; margin-top: 0;">Test Email</h2>
        <p style="font-size: 16px; line-height: 1.6;">
          This is a test email from Bull Boom to verify that the Brevo email service is working correctly!
        </p>
        <hr style="border-color: #32CD32; margin: 20px 0; opacity: 0.3;">
        <p style="font-size: 12px; color: #B8C0D4;">
          If you received this email, the integration is working!
        </p>
      </div>
    </div>
  `;

  return await sendEmail(to, subject, htmlContent);
};