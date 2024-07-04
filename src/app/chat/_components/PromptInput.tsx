"use client";
import Button from "@/app/_components/Button";
import { SendHorizonal, Square } from "lucide-react";
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
    if (!conversationRecordIds) {
      // Todo: check if this is needed, and note that I cannot use await here.
      initiateChat();
    }
    promptInputRef.current.value = promptInputRef.current.value.trim();

    setJustSent(true);
    processMessages(
      promptInputRef.current?.value.trim(),
      messageA,
      conversationRecordIds[0],
      setMessageA,
      setMessageAWaiting,
    );
    processMessages(
      promptInputRef.current?.value.trim(),
      messageB,
      conversationRecordIds[1],
      setMessageB,
      setMessageBWaiting,
    );
    setStopStreaming(false);
    promptInputRef.current.value = "";
    promptInputRef.current.style.height = "auto";
  };

  return (
    <div className="border border-t-0 p-5">
      <div className="flex flex-grow gap-3 items-center border border-solid rounded-3xl has-[textarea:focus]:border-2">
        <div className="flex-grow overflow-y-auto max-h-60 px-2 pr-5">
          <textarea
            className="w-full p-5 bg-transparent text-white overflow-hidden resize-none focus:outline-none"
            autoFocus
            onCompositionStart={handleComposingStart}
            onCompositionEnd={handleComposingEnd}
            onInput={handleInput}
            placeholder={rated ? "評分完畢，歡迎編輯以上對話！" : "輸入訊息..."}
            ref={promptInputRef}
            disabled={
              // I think it is better to make the textarea always focused. It is quite annoying to click on the textarea every time.
              (ratingButtonDisabled && !messageAWaiting && !messageBWaiting) ||
              !conversationRecordIds[0] ||
              !conversationRecordIds[1]
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
          {messageAWaiting || messageBWaiting ? (
            <Button
              text={
                <Square
                  size={12.5}
                  className="*animate-spin rounded-sm"
                  strokeWidth={20}
                />
              }
              onClick={() => setStopStreaming(true)}
              disableCond={
                ratingButtonDisabled && !(messageAWaiting || messageBWaiting)
              }
              className={
                "p-3 rounded-full mr-5 bg-white text-black hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
              }
              title="停止回應"
            />
          ) : (
            <Button
              text={<SendHorizonal size={25} />}
              onClick={sendMessage}
              disableCond={
                messageAWaiting || messageBWaiting || ratingButtonDisabled
              }
              className={
                "p-2 rounded-lg mr-5 bg-white text-black hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
              }
              title="送出"
            />
          )}
        </div>
      </div>
    </div>
  );
}
