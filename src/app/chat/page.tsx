"use client";
import { useSession } from "next-auth/react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MessageSection from "./_components/MessageSection";
import PromptInput from "./_components/PromptInput";
import FunctionalButtons from "./_components/FunctionalButtons";
import { MessageContext } from "@/context/message";

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
    };
    checkAuth();
  }, [router, session]); // Suggested by ESLint

  // Todo: get model names after rating
  const [modelAName, setModelAName] = useState<string>("???");
  const [modelBName, setModelBName] = useState<string>("???");

  const context = useContext(MessageContext);
  if(!context) {
    throw new Error("MessageContext is not provided");
  }
  const { initiateChat } = context;


  useEffect(() => {
    initiateChat();
  }, [initiateChat]); // Suggested by ESLint

  return (
    <main className="pb-6 pt-3 px-10 max-h-[105dvh] flex flex-col">
      <div className="flex flex-row justify-between border border-b-0 rounded-t-xl">
        <div className="flex-1 border-r p-4">
          <h3>🤖 模型 A: {modelAName}</h3>
        </div>
        <div className="flex-1 p-4">
          <h3>🤖 模型 B: {modelBName}</h3>
        </div>
      </div>
      <div className="flex flex-col h-full">
      <MessageSection />
      <PromptInput />
      <FunctionalButtons />
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
    </main>
  );
}
