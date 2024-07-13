"use client";
import { createContext, useContext, useEffect, useState } from "react";
import {
  AlignJustify,
  Database,
  MessageCircleMore,
  ThumbsUp,
  LogIn,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { cn } from "@/lib/utils/shadcn";
import { useSearchParams } from "next/navigation";

const SideBarContext = createContext<{
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
} | null>(null);

export default function SideBar() {
  const [userId, setUserId] = useState(null);
  const { data: session, status } = useSession();
  const username = session?.user?.name;
  const avatarUrl = session?.user?.image;
  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {
    // Close sidebar on resize to prevent layout issues
    const handleResize = () => {
      setIsOpen(false);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  if (useSearchParams().get("chromeExtension")) {
    return null;
  }

  return (
    <>
      <aside
        className={cn(
          "flex",
          `md:flex-col md:transform md:top-0 md:left-0 md:w-16 md:h-full md:bg-gray-800 md:fixed  md:overflow-auto md:ease-in-out md:transition-all md:duration-300 md:z-30 md:overflow-x-hidden ${
            // isOpen ? "translate-x-0 w-64" : "-translate-x-full** "
            isOpen && "md:w-64"
          }`,
          `fixed z-30 bg-gray-800 bottom-0 left-0 right-0 w-screen h-16`,
        )}
      >
        <div className="hidden md:flex items-center ml-2 mt-5 gap-3">
          {" "}
          {/* Temporarily hidden on mobile */}
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
              Chatbot Arena
            </Link>
          )}
        </div>
        <SideBarContext.Provider value={{ isOpen, setIsOpen }}>
          <div
            className={cn(
              "flex",
              "md:flex-col md:w-full md:mt-5 md:flex-grow md:justify-start md:items-start",
              "flex-row w-screen justify-around",
            )}
          >
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
            <div className="hidden md:block md:flex-grow"></div>
            {status === "authenticated" ? (
              <>
                {session?.user?.image && userId && username && (
                  <LinkComponent
                    href={`/profile/${userId}`}
                    text={username}
                    icon={
                      <Image
                        src={avatarUrl || ""}
                        width={28}
                        height={28}
                        className="rounded-full transition-none flex-shrink-0 w-full h-full"
                        alt="profile-pic"
                      />
                    }
                    title="個人頁面"
                  />
                )}
              </>
            ) : (
              status === "unauthenticated" && (
                <LinkComponent
                  href="/login"
                  text="登入 / 註冊"
                  icon={<LogIn size={28} />}
                />
              )
            )}
          </div>
        </SideBarContext.Provider>
      </aside>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-20"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
      {/* </div> */}
    </>
  );
}

function LinkComponent({
  href,
  text,
  icon,
  title,
}: {
  href: string;
  text: string;
  icon?: React.ReactNode;
  title?: string;
}) {
  const context = useContext(SideBarContext);
  if (!context) {
    console.error("context is null");
    return <></>;
  }
  const { isOpen, setIsOpen } = context;
  return (
    <Link
      href={href}
      className="p-4 hover:bg-gray-700 text-lg flex items-center justify-center md:justify-start gap-3 truncate w-full"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="transition-none"
        title={!isOpen ? (title ? title : text) : ""}
      >
        {icon}
      </div>
      {isOpen && text}
    </Link>
  );
}
