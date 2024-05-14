"use client";
import React, { useEffect, useState, useRef, useContext } from "react";
import { Bot, Pencil, Clipboard, Check } from "lucide-react";
import { MessageContext } from "@/context/message";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Message } from "@/lib/types/db";
import MarkdownRenderer from "@/app/_components/MarkdownRenderer";

export default function CompletionContainer({
  origMessage,
  msgIndex,
  isUser,
  isCompleted,
  conversationRecordId,
  conversationRecordIds,
  messages,
  setMessages,
  setMessagesWaiting,
  setConversationRecordIds,
  isLeft,
}: {
  origMessage: string;
  msgIndex: number;
  isUser: boolean;
  isCompleted: boolean;
  conversationRecordId: string;
  conversationRecordIds: string[];
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setMessagesWaiting: React.Dispatch<React.SetStateAction<boolean>>;
  setConversationRecordIds: React.Dispatch<React.SetStateAction<string[]>>;
  isLeft: boolean;
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const userEmail = session?.user?.email;
  const imageSize = 30;

  const [justCopied, setJustCopied] = useState(false);

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [message, setMessage] = useState<string>(origMessage);
  const messageTextAreaRef = useRef<HTMLTextAreaElement>(null);

  const [isComposing, setIsComposing] = useState(false);

  const context = useContext(MessageContext);
  if (!context) {
    throw new Error("MessageContext is not provided"); // Todo: think an elegant way to handle this
  }
  const { ratingButtonDisabled } = context;

  useEffect(() => {
    if (messageTextAreaRef.current) {
      messageTextAreaRef.current.style.height = "auto";
      messageTextAreaRef.current.style.height = `${messageTextAreaRef.current.scrollHeight}px`;
    }
  }, [message, isEditing]);

  useEffect(() => {
    setMessage(origMessage);
  }, [origMessage]);

  const handleClickEdit = () => {
    setIsEditing(true);
    if (!isUser) {
      toast.info("編輯模型輸出，讓我們的模型有機會做得更好！", {
        autoClose: 1000,
      });
    }
  };

  // below is copied from PromptInput.tsx

  const handleComposingStart = () => {
    setIsComposing(true);
  };

  const handleComposingEnd = () => {
    setIsComposing(false);
  };

  const handleSubmit = async () => {
    setIsEditing(false);
    if (!isUser && message === origMessage) {
      return;
    }

    console.log("newMessage: ", message);

    await saveEditedModelOutput();
    messages[msgIndex].content = message;
    router.refresh();
  };

  const saveEditedModelOutput = async () => {
    let originalPrompt, editedPrompt;
    const index = msgIndex - 1;
    originalPrompt = messages[index];
    editedPrompt = originalPrompt;
    try {
      const response = await fetch("/api/chat/editing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversationRecordId: conversationRecordId,
          msgIndex: msgIndex - 1,
          contributorEmail: userEmail,
          originalPrompt: originalPrompt.content,
          editedPrompt: editedPrompt.content,
          originalCompletion: origMessage,
          editedCompletion: message,
        }),
      });
      // After saving the new message, you can show a toast message to indicate the success
      if (response.ok)
        toast.success("模型輸出已更新，感謝您的貢獻！", {
          autoClose: 1000,
        });
      else
        toast.error("模型輸出更新失敗，請再試一次！", {
          autoClose: 1000,
        });
    } catch (error) {
      toast.error("模型輸出更新失敗，請再試一次！", {
        autoClose: 1000,
      });
    }
  };

  // for the loading dots
  const [dotCount, setDotCount] = useState<number>(0);
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (origMessage === "思考中...") {
      intervalId = setInterval(() => {
        setDotCount((prevCount) => (prevCount % 3) + 1);
      }, 500); // Update every 500ms
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [origMessage]);

  return (
    <div className="flex flex-col md:flex-1 overflow-x-auto w-full group px-5">
      <div className="flex w-full gap-3 mb-2">
        {isLeft && (
          <div className="self-start flex-shrink-0 flex flex-col items-center text-center text-sm">
            <Bot size={imageSize} />A
          </div>
        )}
        <div
          className={`flex-grow flex flex-col w-9/12 ${
            !isEditing &&
            `border rounded-2xl ${isLeft ? "rounded-tl-none mr-10 md:mr-0" : "rounded-tr-none ml-10 md:ml-0"}`
          }`}
        >
          {isEditing ? (
            <textarea
              className="bg-transparent p-5 text-white px-2 pt-0 flex-grow whitespace-pre-wrap text-pretty break-words text-lg border-b border-solid resize-none focus:outline-none overflow-hidden min-h-0 h-auto"
              autoFocus
              onCompositionStart={handleComposingStart}
              onCompositionEnd={handleComposingEnd}
              ref={messageTextAreaRef}
              onKeyDown={async (
                e: React.KeyboardEvent<HTMLTextAreaElement>,
              ) => {
                if (e.key === "Enter" && !e.shiftKey && !isComposing) {
                  e.preventDefault();
                  e.currentTarget.blur(); // will trigger handleSubmit
                }
              }}
              onBlur={handleSubmit}
              onFocus={(e) => {
                e.target.selectionStart = e.target.value.length;
                e.target.selectionEnd = e.target.value.length;
              }}
              onChange={(e) => setMessage(e.target.value)}
              value={message}
            ></textarea>
          ) : (
            <div
              className={`px-5 pt-3 pb-4 flex-grow whitespace-pre-wrap text-pretty break-words text-lg`}
            >
              {message === "思考中..." && !isUser ? (
                `思考中${".".repeat(dotCount)}`
              ) : isUser ? (
                message
              ) : (
                <MarkdownRenderer>{message}</MarkdownRenderer>
              )}
            </div>
          )}
          <div className="self-start px-4 h-10">
            {!isEditing && isCompleted && (
              <>
                <button
                  className="p-1 opacity-0 group-hover:opacity-100 self-end"
                  onClick={() => {
                    navigator.clipboard.writeText(message);
                    setJustCopied(true);
                    setTimeout(() => setJustCopied(false), 2000); // Reset after 3 seconds
                  }}
                  title={"複製"}
                  disabled={isEditing}
                >
                  {justCopied ? <Check size={20} /> : <Clipboard size={20} />}
                </button>
                {ratingButtonDisabled && ( // Todo: add a condition here to show the button only when the rating is sent
                  // there are some bugs here, I will fix them later
                  <button
                    className="p-1 opacity-0 group-hover:opacity-100 self-end"
                    onClick={handleClickEdit}
                    title={
                      isUser
                        ? "點擊以修改訊息"
                        : "點擊以編輯模型輸出，讓我們的模型有機會做得更好！"
                    }
                    disabled={isEditing}
                  >
                    <Pencil color="white" size={20} />
                  </button>
                )}
              </>
            )}
          </div>
        </div>
        {!isLeft && (
          <div className="self-start flex-shrink-0 flex flex-col items-center text-center text-sm">
            <Bot size={imageSize} />B
          </div>
        )}
      </div>
    </div>
  );
}
