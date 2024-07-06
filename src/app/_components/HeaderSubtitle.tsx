"use client";
import { usePathname } from "next/navigation";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function HeaderSubtitle() {
  const pathNames = usePathname().split("/");
  if (useSearchParams().get("chromeExtension")) {
    return null;
  }
  const currentPath = pathNames[1];
  const subtitle: { [key: string]: string } = {
    chat: "語言模型競技場 ⚔️",
    rating: "模型評分區 👍👎",
    dataset: "對話資料集 📚",
    leaderboard: "模型排行榜 🏆",
    profile: "個人頁面",
  };
  return (
    <Link
      href="/"
      className="text-2xl ml-5 md:ml-[4rem] mt-6 font-semibold text-nowrap w-fit"
    >
      Chatbot Arena
      <span className="text-xl">
        {currentPath && subtitle[currentPath]
          ? ` - ${subtitle[currentPath]}`
          : ""}
      </span>
    </Link>
  );
}
