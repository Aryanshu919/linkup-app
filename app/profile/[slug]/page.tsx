import { prisma } from "@/lib/prisma";

export default async function Profile({
 params
}: {
 params:{ slug:string }
}) {

 const profile = await prisma.profile.findUnique({
  where:{ slug:params.slug },
  include:{
   user:{
    include:{ links:true }
   }
  }
 });

 if(!profile) return <div>Not found</div>;

 return (

  <div className="min-h-screen flex flex-col items-center justify-center">

   <h1 className="text-3xl font-bold">
    {profile.user.name || "Profile"}
   </h1>

   <div className="mt-6 space-y-3">

    {profile.user.links.map(link=>(
     <a
      key={link.id}
      href={link.url}
      className="block border p-3 rounded"
     >
      {link.platform}
     </a>
    ))}

   </div>

  </div>

 );
}