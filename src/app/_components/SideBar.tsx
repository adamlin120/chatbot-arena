"use client";
import { createContext, useContext, useEffect, useState } from "react";
import {
  AlignJustify,
  Database,
  MessageCircleMore,
  ThumbsUp,
  LogIn,
  LogOut,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { usePathname, useRouter } from 'next/navigation'
import Image from "next/image";
import { cn } from "@/lib/utils/shadcn";

const SideBarContext = createContext<{
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
} | null>(null);

export default function SideBar() {
  const [userId, setUserId] = useState(null);
  const { data: session } = useSession();
  const router = useRouter();
  const username = session?.user?.name;
  const avatarUrl = session?.user?.image;
  const [isOpen, setIsOpen] = useState<boolean>(false);
  
  useEffect(() => {
    const fetchUserId = async () => {
      if (session && session.user && session.user.email) {
        const email = session.user.email;
        const response = await fetch(`/api/profile/redirect`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        });
        const data = await response.json();
        setUserId(data.user.id);
      }
    };

    fetchUserId();
  }, [session]);

  
  const pathNames = usePathname().split("/");
  const currentPath = pathNames[1];
  const subtitle: {[key: string]: string} = {
    "chat": "語言模型競技場 ⚔️",
    "rating": "模型評分區 👍👎",
    "dataset": "對話資料集 📚",
    "leaderboard": "模型排行榜 🏆",
    "profile": "個人頁面",
  };
  
  return (
    <div className="flex mt-5">
      <Link
        href="/"
        className="text-2xl ml-[4rem] mt-1 font-semibold text-nowrap"
        onClick={() => setIsOpen(false)}
      >
        LLM Arena 
        <span className="text-xl">{currentPath && subtitle[currentPath] ? ` - ${subtitle[currentPath]}` : ""}</span>
      </Link>
      <aside
        className={cn(
          `flex flex-col transform top-0 left-0 w-16 bg-gray-800 fixed h-full overflow-auto ease-in-out transition-all duration-300 z-30 overflow-x-hidden ${
            // isOpen ? "translate-x-0 w-64" : "-translate-x-full** "
            isOpen && "w-64"
          }`,
        )}
      >
        <div className="flex items-center ml-2 mt-5 gap-3">
          <button
            className="rounded-full p-2 transition duration-500 ease-in-out transform hover:scale-125 active:scale-90"
            onClick={() => setIsOpen(!isOpen)}
          >
            <AlignJustify />
          </button>
          {isOpen && (
            <Link
              href="/"
              className="text-2xl font-semibold text-nowrap"
              onClick={() => setIsOpen(false)}
            >
              LLM Arena
            </Link>
          )}
        </div>
        <SideBarContext.Provider value={{ isOpen, setIsOpen }}>
          <div className="flex flex-col w-full mt-5 flex-grow">
            <LinkComponent
              href="/chat"
              text="語言模型競技場 ⚔️"
              icon={<MessageCircleMore size={28} />}
            />
            <LinkComponent
              href="/rating"
              text="對模型評分 👍👎"
              icon={<ThumbsUp size={28} />}
            />
            <LinkComponent
              href="/dataset"
              text="對話資料集 📚"
              icon={<Database size={28} />}
            />
            <LinkComponent
              href="/leaderboard"
              text="模型排行榜 🏆"
              icon={<Trophy size={28} />}
            />
          </div>
          {useSession().status === "authenticated" ? (
            <div className="flex">
              {session?.user?.image && userId && (
                <Link
                  href={`/profile/${userId}`}
                  className="p-4 hover:bg-gray-700 text-lg flex items-center gap-3 truncate flex-grow"
                  onClick={() => setIsOpen(false)}
                >
                  <div
                    className={`transition-none min-w-fit`}
                    title={!isOpen ? "個人頁面" : ""}
                  >
                    <Image
                      src={avatarUrl || ""}
                      width={24}
                      height={24}
                      className="rounded-full transition-none"
                      alt="profile-pic"
                    />
                  </div>
                  {isOpen && <div className="truncate">{username}</div>}
                </Link>
              )}
              {isOpen && (
                <button
                  className="hover:bg-gray-700 px-3"
                  title="登出"
                  onClick={() => signOut()}
                >
                  <LogOut size={28} />
                </button>
              )}
            </div>
          ) : (
            <LinkComponent
              href="/login"
              text="登入 / 註冊"
              icon={<LogIn size={28} />}
            />
          )}
        </SideBarContext.Provider>
      </aside>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-20"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </div>
  );
}

function LinkComponent({
  href,
  text,
  icon,
}: {
  href: string;
  text: string;
  icon?: React.ReactNode;
}) {
  const context = useContext(SideBarContext);
  if (!context) {
    console.log("context is null");
    return <></>;
  }
  const { isOpen, setIsOpen } = context;
  return (
    <Link
      href={href}
      className="p-4 hover:bg-gray-700 text-lg flex items-center gap-3 truncate"
      onClick={() => setIsOpen(false)}
    >
      <div className="transition-none" title={!isOpen ? text : ""}>
        {icon}
      </div>
      {isOpen && text}
    </Link>
  );
}
