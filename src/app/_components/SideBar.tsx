"use client";
import { createContext, useContext, useState } from "react";
import {
  AlignJustify,
  Database,
  MessageCircleMore,
  ThumbsUp,
  LogIn,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { cn } from "@/lib/utils/shadcn";

const SideBarContext = createContext<{
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
} | null>(null);

export default function SideBar() {
  const session = useSession();
  const username = session.data?.user?.username || "不知名使用者"; // TODO: 我拿不到 username
  const avatarUrl = session.data?.user?.avatarUrl;
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <div className="flex mt-5">
      <Link
        href="/"
        className="text-2xl ml-[4rem] mt-1 font-semibold text-nowrap"
        onClick={() => setIsOpen(false)}
      >
        Taiwan LLM
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
              Taiwan LLM
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
          </div>
          {session.status === "authenticated" ? (
            <div className="flex">
              <Link
                href="/profile"
                className="p-4 hover:bg-gray-700 text-lg flex gap-3 truncate flex-grow"
                onClick={() => setIsOpen(false)}
              >
                <div
                  className="transition-none"
                  title={!isOpen ? "個人頁面" : ""}
                >
                  <Image
                    src={avatarUrl || ""}
                    width={28}
                    height={28}
                    className="rounded-full"
                    alt="profile-pic"
                  />
                </div>
                {isOpen && username}
              </Link>
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
