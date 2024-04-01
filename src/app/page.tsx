import { auth } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();
  if (session?.user?.name) {
    redirect("/rating");
  }
  return (
    <>
      <div className="flex flex-col p-5 gap-0 text-xl z-10 animate-slide-up">
        <div className="self-start flex items-end gap-3 mt-32 md:text-6xl sm:text-5xl xs:text-4xl p-5">
          Taiwan Chatbot Arena 台灣語言模型競技場
        </div>
        <div className="self-start text-lg p-5 pt-1 w-4/6">
          [chatbot arena 說明文字]
        </div>
        <Link href="/login">
          <button className="rounded-3xl bg-gray-500 text-white text-xl hover:bg-gray-600 active:bg-gray-500 w-fit ml-4 px-7 py-3">
            註冊 / 登入
          </button>
        </Link>
      </div>
    </>
  );
}
