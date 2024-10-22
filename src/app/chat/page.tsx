"use client";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useContext } from "react";
import MessageSection from "./_components/MessageSection";
import PromptInput from "./_components/PromptInput";
import FunctionalButtons from "./_components/FunctionalButtons";
import { MessageContext } from "@/context/message";

export default function ChatPage() {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error("MessageContext is not provided");
  }
  const { modelAName, modelBName } = context;

  return (
    // Note that if min-h-[100dvh] is used, it will be too high
    <main className="pt-3 px-5 md:px-10 mb-3 md:min-h-[90dvh] md:max-h-[90dvh] flex flex-col fade-in">
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
          <h3>🤖 模型 A: {modelAName}</h3>
        </div>
        <div className="flex-1 p-4">
          <h3>🤖 模型 B: {modelBName}</h3>
        </div>
      </div>
      <div className="flex flex-col flex-grow h-full pb-5">
        <MessageSection />
        <PromptInput />
        <FunctionalButtons />
      </div>
    </main>
  );
}
