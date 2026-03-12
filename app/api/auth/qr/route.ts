import { generateQR } from "@/lib/qr";

export async function POST(req: Request) {

 const { slug } = await req.json();

 const url = `${process.env.NEXT_PUBLIC_URL}/profile/${slug}`;

 const qr = await generateQR(url);

 return Response.json({ qr });
}