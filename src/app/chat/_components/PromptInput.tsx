"use client";
import Button from "@/components/Button";
import { LoaderCircle, SendHorizonal } from "lucide-react";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";
import { MessageContext } from "@/context/message";
import { Message } from "@/lib/types/db";
import { getCompletion } from "./getCompletion";

export default function PromptInput() {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error("MessageContext is not provided");
  }
  const {
    messageA,
    messageB,
    conversationRecordIds,
    setMessageA,
    setMessageB,
    messageAWaiting,
    setMessageAWaiting,
    messageBWaiting,
    setMessageBWaiting,
    setJustSent,
    ratingButtonDisabled,
    setRatingButtonDisabled,
    rated,
    stopStreaming,
    setStopStreaming,
    initiateChat,
  } = context;
  const router = useRouter();

  const promptInputRef = useRef<HTMLTextAreaElement>(null);
  const [isComposing, setIsComposing] = useState<boolean>(false);

  const stopStreamingRef = useRef(stopStreaming);
  useEffect(() => {
    stopStreamingRef.current = stopStreaming;
  }, [stopStreaming]);

  const handleComposingStart = () => {
    setIsComposing(true);
  };

  const handleComposingEnd = () => {
    setIsComposing(false);
  };

  const processMessages = async (
    currPrompt: string,
    messages: Message[],
    conversationRecordId: String,
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
    setMessageWaiting: React.Dispatch<React.SetStateAction<boolean>>,
  ) => {
    setMessageWaiting(true);
    const newMessages: Message[] = [
      ...messages,
      {
        role: "user",
        content: currPrompt,
      },
      {
        role: "assistant",
        content: "思考中...",
      },
    ];
    setMessages(newMessages);

    await getCompletion(
      "/api/chat",
      router,
      newMessages,
      conversationRecordId,
      setMessages,
      setMessageWaiting,
      setRatingButtonDisabled,
      setStopStreaming,
      stopStreamingRef,
      currPrompt,
      promptInputRef,
    );
  };

  // Auto resize the textarea
  const handleInput = (event: React.FormEvent<HTMLTextAreaElement>) => {
    event.currentTarget.style.height = "auto";
    event.currentTarget.style.height = `${event.currentTarget.scrollHeight}px`;
  };

  const sendMessage = async () => {
    if (!promptInputRef.current?.value) return;

    if (
      promptInputRef.current?.value.length === 0 ||
      promptInputRef.current?.value.trim().length === 0
    )
      return;

    let convIds = conversationRecordIds;
    if (conversationRecordIds.length === 0) {
      const res = await initiateChat();
      // initiateChat() would set conversationRecordIds
      // However, it is not guaranteed that the conversationRecordIds are set immediately
      if (!res) return;
      convIds = res;
    }
    promptInputRef.current.value = promptInputRef.current.value.trim();

    setJustSent(true);
    processMessages(
      promptInputRef.current?.value.trim(),
      messageA,
      convIds[0],
      setMessageA,
      setMessageAWaiting,
    );
    processMessages(
      promptInputRef.current?.value.trim(),
      messageB,
      convIds[1],
      setMessageB,
      setMessageBWaiting,
    );
    setStopStreaming(false);
    promptInputRef.current.value = "";
    promptInputRef.current.style.height = "auto";
  };

  return (
    <div className="border border-t-0 p-5">
      <div className="flex flex-grow gap-1 items-center border border-solid rounded-3xl has-[textarea:focus]:border-2">
        <div className="flex-grow overflow-y-auto max-h-60 pl-2 ">
          <textarea
            className={
              "w-full p-5 pr-1 bg-transparent text-white overflow-hidden resize-none focus:outline-none" +
              (rated ? " cursor-not-allowed" : "")
            }
            autoFocus
            onCompositionStart={handleComposingStart}
            onCompositionEnd={handleComposingEnd}
            onInput={handleInput}
            placeholder={rated ? "評分完畢，歡迎編輯以上對話！" : "輸入訊息..."}
            ref={promptInputRef}
            disabled={
              ratingButtonDisabled && !messageAWaiting && !messageBWaiting
            }
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !isComposing) {
                e.preventDefault();
                if (
                  !messageAWaiting &&
                  !messageBWaiting &&
                  !ratingButtonDisabled
                ) {
                  sendMessage();
                }
              }
            }}
            rows={1}
          ></textarea>
        </div>
        <div>
          <Button
            text={
              messageAWaiting || messageBWaiting ? (
                <LoaderCircle size={25} className="animate-spin" />
              ) : (
                <SendHorizonal size={25} />
              )
            }
            onClick={sendMessage}
            disableCond={
              messageAWaiting || messageBWaiting || ratingButtonDisabled
            }
            className="p-2 rounded-lg mr-5 bg-white text-black hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
          />
        </div>
      </div>
    </div>
  );
}
