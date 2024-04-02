"use client";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Header() {
  const [userId, setUserId] = useState(null);
  const { data: session } = useSession();
  const router = useRouter();
  useEffect(() => {
    const fetchUserId = async () => {
      if (session && session.user && session.user.email) {
        const email = session.user.email;
        const response = await fetch(`/api/profile/redirect`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        });
        const data = await response.json();
        setUserId(data.user.id);
      }
    };

    fetchUserId();
  }, [session]);
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
        {session?.user?.image && userId && <Link href={`/profile/${userId}`}>
              <img src={session.user.image} alt="Profile" style={{ width: '60px', height: '60px' }} />
          </Link>}
        {session?.user?.name && userId && <Link href={`/profile/${userId}`}><p>{session.user.name}</p></Link>}
        {session ? (
          <button className="text-2xl p-7" onClick={handleLogout}>
            Logout
          </button>
        ) : null}
      </header>
    </>
  );
}
