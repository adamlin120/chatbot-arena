"use client"
import { useSession } from "next-auth/react";
import ChatSection from "./_components/ChatSection";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useEffect } from "react";
import { useRouter } from 'next/navigation'

export default function ChatPage() {
  const router = useRouter();
  const { data: session } = useSession();
  useEffect(() => {
    const checkAuth = async () => {
      if (!session || !session.user) {
        const response = await fetch("https://api.ipify.org?format=json");
        
        const data = await response.json();
        const { ip } = data;
        try {
          const response = await fetch("/api/chat/trail", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ ip: ip }),
          });
          if (!response.ok) {
            throw new Error("Failed to store IP address");
          }
          const responseData = await response.json();
          const { quota } = responseData;
          if (quota >= 3) {
            router.push("/login");
          }
        } catch (error) {
          console.error("Error storing IP address:", error);
        }
      }
    }
    checkAuth();
  }, []);
  return (
    <main className="py-6 px-12 max-h-[105dvh]">
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
