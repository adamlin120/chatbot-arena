import { auth } from "@/lib/auth";
import ChatSection from "./_components/ChatSection";
import { redirect } from "next/navigation";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

export default async function ChatPage() {
  const session = await auth();
  if (!session || !session.user) {
    redirect("/login");
  }
  return (
    <main className="py-6 px-12 max-h-[100dvh]">
      <h1 className="mb-5">
        ⚔️ 繁中 LLM 聊天機器人競技場⚔️ : 野生的大模型測試
      </h1>
      <div className="flex flex-col gap-5 mb-5">
        <h2>📜 規則</h2>
        <ul className="list-disc list-inside pl-4">
          <li>
            向兩個匿名模型（例如
            GPT-4、ChatGPT、Claude、Gemini-Pro、Mistral-Medium、Taiwan-LLM、Breeze）提問，並為較佳者投票！
          </li>
          <li>您可以持續對話，直到確定贏家。</li>
          <li>如果在對話過程中透露了模型身份，則不計入投票。</li>
        </ul>
      </div>
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <ChatSection />
    </main>
  );
}
