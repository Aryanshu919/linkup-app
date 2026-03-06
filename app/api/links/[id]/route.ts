import { prisma } from "@/lib/prisma";

export async function DELETE(
 req: Request,
 { params }: { params: { id: string } }
) {

 await prisma.link.delete({
  where: { id: params.id }
 });

 return Response.json({ success: true });
}