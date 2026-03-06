import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { platform, url, userId } = await req.json();

  const link = await prisma.link.create({
    data: {
      platform,
      url,
      userId,
    },
  });

  return Response.json(link);
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const userId = searchParams.get("userId");

  const links = await prisma.link.findMany({
    where: { userId: userId ?? undefined },
  });

  return Response.json(links);
}
