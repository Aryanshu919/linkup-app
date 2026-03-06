import { prisma } from "@/lib/prisma";
import { generateOTP } from "@/lib/otp";
import { sendOtpEmail } from "@/lib/mailer";

export async function POST(req: Request) {

  const { email } = await req.json();

  const code = generateOTP();

  await prisma.otp.create({
    data: {
      email,
      code,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000)
    }
  });

  await sendOtpEmail(email, code);

  return Response.json({ success: true });
}