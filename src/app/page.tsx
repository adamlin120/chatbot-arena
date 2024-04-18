import { auth } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import ThreeDText from "./_components/ThreeDText";

export default async function Home() {
  // const session = await auth();
  // if (session?.user?.email) {
  //   redirect("/rating");
  // }
  return (
    <>
      <div className="flex p-5 gap-0 text-xl z-10 animate-slide-up">
        <div className="w-1/2 h-4 hidden lg:block">
          <ThreeDText />
        </div>
        <div className="w-1/2">
          <div className="self-start flex items-end gap-3 mt-32 md:text-6xl sm:text-5xl xs:text-4xl p-5">
            Taiwan LLM Chatbot Arena
          </div>
          <div className="self-start flex items-end gap-3 md:text-6xl sm:text-5xl xs:text-4xl px-5 pb-5">
            台灣語言模型競技場
          </div>
          <div className="self-start text-lg p-5 pt-1 w-4/6">
            [chatbot arena 說明文字]
          </div>
          <Link href="/login">
            <button className="rounded-3xl bg-gray-500 text-white text-xl hover:bg-gray-600 hover:scale-105 active:scale-100 active:opacity-75 transform transition duration-500 w-fit ml-4 px-7 py-3">
              註冊 / 登入
            </button>
          </Link>
        </div>
      </div>
    </>
  );
}
