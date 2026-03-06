import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";
import { cookies } from "next/headers";

export async function POST(req: Request) {

 const { email, code } = await req.json();

 const otp = await prisma.otp.findFirst({
  where: { email, code }
 });

 if (!otp) {
  return Response.json({ error: "Invalid OTP" });
 }

 let user = await prisma.user.findUnique({
  where: { email }
 });

 if (!user) {

  user = await prisma.user.create({
   data: { email }
  });

  await prisma.profile.create({
   data: {
    userId: user.id,
    slug: nanoid(8)
   }
  });
 }

 // ✅ CREATE SESSION COOKIE
 (await cookies()).set("session", user.id, {
  httpOnly: true,
  path: "/",
  maxAge: 60 * 60 * 24 * 7
 });

 return Response.json({
  success: true
 });
}