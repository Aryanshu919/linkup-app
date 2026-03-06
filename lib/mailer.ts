import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendOtpEmail(email: string, code: string) {

  await transporter.sendMail({
    from: `"LinkUp" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your Login OTP",
    html: `
      <h2>Your OTP Code</h2>
      <p>Your login OTP is:</p>
      <h1>${code}</h1>
      <p>This OTP will expire in 5 minutes.</p>
    `,
  });

}