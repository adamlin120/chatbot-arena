import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function UploadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session || !session.user) {
    redirect("/login");
  }
  return <main className="hidden-scrollbar">{children}</main>;
}
