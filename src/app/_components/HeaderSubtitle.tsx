"use client";
import { usePathname } from "next/navigation";

export default function HeaderSubtitle() {
  const pathNames = usePathname().split("/");
  const currentPath = pathNames[1];
  const subtitle: { [key: string]: string } = {
    chat: "語言模型競技場 ⚔️",
    rating: "模型評分區 👍👎",
    dataset: "對話資料集 📚",
    leaderboard: "模型排行榜 🏆",
    profile: "個人頁面",
  };
  return (
    <span className="text-xl">
      {currentPath && subtitle[currentPath]
        ? ` - ${subtitle[currentPath]}`
        : ""}
    </span>
  )
}