"use client";

import { useSession } from "next-auth/react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useContext, useEffect } from "react";
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
  }, []);
  // Todo: React Hook useEffect has missing dependencies: 'router' and 'session'. Either include them or remove the dependency array.
  // If this is intentional, add a // eslint-disable-next-line react-hooks/exhaustive-deps comment before the line of dependency array.

  const context = useContext(MessageContext);
  if (!context) {
    throw new Error("MessageContext is not provided");
  }
  const { initiateChat } = context;

  useEffect(() => {
    initiateChat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    // Todo: think a better way to handle the height of the main container
    // If min-h-[100dvh] is used, it will be too high
    <main className="pt-3 px-10 md:min-h-[90dvh] md:max-h-[90dvh] flex flex-col">
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
      <div className="flex flex-row justify-between border border-b-0 rounded-t-xl">
        <div className="flex-1 border-r p-4">
          <h3>🤖 模型 A: {context.modelAName}</h3>
        </div>
        <div className="flex-1 p-4">
          <h3>🤖 模型 B: {context.modelBName}</h3>
        </div>
      </div>
      <div className="flex flex-col flex-grow h-full">
        <MessageSection />
        <PromptInput />
        <FunctionalButtons />
      </div>
    </main>
  );
}
