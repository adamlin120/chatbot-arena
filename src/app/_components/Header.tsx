"use client";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Header() {
  const { data: session } = useSession();
  const router = useRouter();
  const handleLogout = async () => {
    await signOut(); // Signing out the user
    router.push("/login");
  };
  return (
    <>
      <header className="fixed top-0 w-full h-20 z-50 flex items-center gap-1 py-3 px-2 border-b-2 border-white bg-[rgb(50,50,50)]">
        <Link className="p-2 rounded-xl text-2xl" href="/">
          [Website image] Taiwan Chatbot Arena
        </Link>
        <div className="flex-grow">{/* any other things */}</div>
        <div className="text-2xl p-7">LeaderBoard</div>
        {session?.user?.image && <img src={session.user.image} alt="Profile" style={{ width: '60px', height: '60px' }} />}
        {session?.user?.name}
        {session ? (
          <button className="text-2xl p-7" onClick={handleLogout}>
            Logout
          </button>
        ) : null}
      </header>
    </>
  );
}
