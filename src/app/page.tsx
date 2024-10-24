import { redirect } from "next/navigation";
export default async function Home() {
  redirect("/chat", {
    permanent: true, // This sets the status code to 301
  });
}
