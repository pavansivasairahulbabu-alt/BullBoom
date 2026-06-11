import nodemailer from 'nodemailer';

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Send OTP email
export const sendOtpEmail = async (to, otp) => {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: `"BullBoom" <${process.env.SENDER_EMAIL}>`,
    to: to,
    subject: 'Your OTP for Bull Boom Registration',
    html: `
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
    `,
  };

  try {
    await transporter.verify();
    console.log("SMTP Connected Successfully");
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send OTP email');
  }
  
};

// Send Forgot Password OTP email
export const sendForgotPasswordOtpEmail = async (to, otp) => {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: `"BullBoom" <${process.env.SENDER_EMAIL}>`,
    to: to,
    subject: 'Your OTP for Bull Boom Password Reset',
    html: `
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
    `,
  };

  try {
    await transporter.verify();
    console.log("SMTP Connected Successfully");
    const info = await transporter.sendMail(mailOptions);
    console.log('Forgot password email sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending forgot password email:', error);
    throw new Error('Failed to send forgot password OTP email');
  }
  
};
