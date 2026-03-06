import { cookies } from "next/headers";
import Dashboard from "@/components/Dashboard";
import { redirect } from "next/navigation";

export default async function DashboardPage() {

  const session = (await cookies()).get("session")?.value;
  if (!session) { 
    redirect("/login");
  }

  return <Dashboard userId={session || ""} />;
}