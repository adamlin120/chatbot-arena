"use client";
import { useState } from "react";
import {
  AlignJustify,
  Database,
  MessageCircleMore,
  ThumbsUp,
  LogIn,
  User,
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { cn } from "@/lib/utils/shadcn";

export default function SideBar() {
  const session = useSession();
  const username = session.data?.user?.username || "不知名使用者"; // TODO: 我拿不到 username
  const avatarUrl = session.data?.user?.avatarUrl;
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex mt-5">
      <div className="flex ml-2 items-center">
        <div className="text-2xl font-semibold text-nowrap ml-20">
          Taiwan LLM Arena{/* 這裡可以放 logo */}
        </div>
      </div>
      <aside
        className={cn(`flex flex-col transform top-0 left-0 w-16 bg-gray-800 fixed h-full overflow-auto ease-in-out transition-all duration-300 z-30 overflow-x-hidden ${
          isOpen ? "translate-x-0 w-64" : "-translate-x-full** "
        }`)}
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
        <div className="flex flex-col w-full mt-5 flex-grow">
          <LinkComponent
            href="/chat"
            text="語言模型競技場 ⚔️"
            isOpen={isOpen}
            onClick={() => setIsOpen(false)}
            icon={<MessageCircleMore size={24} />}
          />
          <LinkComponent
            href="/rating"
            text="對模型評分 👍👎"
            isOpen={isOpen}
            onClick={() => setIsOpen(false)}
            icon={<ThumbsUp size={24} />}
          />
          <LinkComponent
            href="/dataset"
            text="對話資料集 📚"
            isOpen={isOpen}
            onClick={() => setIsOpen(false)}
            icon={<Database size={24} />}
          />
        </div>
        {session.status === "authenticated" ? (
          <LinkComponent
            href="/profile"
            text={username}
            isOpen={isOpen}
            onClick={() => setIsOpen(false)}
            icon={
              avatarUrl ? (
                <Image
                  src={avatarUrl}
                  width={24}
                  height={24}
                  className="rounded-full"
                  alt="pic"
                />
              ) : (
                <User size={24} />
              )
            }
          />
        ) : (
          <LinkComponent
            href="/login"
            text="登入 / 註冊"
            isOpen={isOpen}
            onClick={() => setIsOpen(false)}
            icon={<LogIn size={24} />}
          />
        )}
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
  isOpen,
  onClick,
  icon,
}: {
  href: string;
  text: string;
  isOpen: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="p-4 hover:bg-gray-700 text-lg flex gap-3 truncate"
      onClick={onClick}
    >
      {icon}
      {isOpen && text}
    </Link>
  );
}
