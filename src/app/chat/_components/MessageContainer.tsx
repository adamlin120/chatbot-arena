"use client";
import React, { useEffect, useState, useRef, useContext } from "react";
import { Bot, Pencil, User, IterationCw, Clipboard, Check } from "lucide-react";
import { MessageContext } from "@/context/message";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Message } from "@/lib/types/db";
import MarkdownRenderer from "@/app/_components/MarkdownRenderer";

const serverErrorMessage = "伺服器端錯誤，請稍後再試";
const MAX_TOKENS = 2048;

export default function MessageContainer({
  origMessage,
  msgIndex,
  isUser,
  isCompleted,
  conversationRecordId,
  messages,
  setMessages,
  setMessagesWaiting,
}: {
  origMessage: string;
  msgIndex: number;
  isUser: boolean;
  isCompleted: boolean;
  conversationRecordId: string;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setMessagesWaiting: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const imageUrl = session?.user?.image;
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
  const { ratingButtonDisabled, setRatingButtonDisabled } = context;

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
  const handleRegenerate = async () => {
    setMessagesWaiting(true);

    const oldMessages: Message[] = messages;
    const newMessages: Message[] = [
      ...messages.slice(0, msgIndex),
      {
        role: "assistant",
        content: "思考中...",
      },
    ];
    console.log("newMessages: ", newMessages);
    setMessages(newMessages);

    // Abort the request if it takes too long (currently 10 second)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    const response = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({
        messages: newMessages.slice(0, newMessages.length - 1),
        conversationRecordId: conversationRecordId,
      }),
      signal: controller.signal,
    })
      .catch((error) => {
        if (error.name === "AbortError") {
          // This may due to llm api error
          console.error("Request timed out");
          toast.error("伺服器沒有回應，請稍後再試");
          setMessagesWaiting(false);
          setMessages(oldMessages);
        } else {
          console.error("Error processing messages:", error);
          toast.error(serverErrorMessage);
        }
        return;
      })
      .finally(() => clearTimeout(timeoutId));

    if (!response || !response.body) {
      return;
    } else if (response.status !== 200) {
      toast.error(serverErrorMessage);
      return;
    }

    function fluent(ms: number | undefined) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let count = 0;
    let buffer = "";
    setRatingButtonDisabled(true);
    while (count < MAX_TOKENS) {
      const { value, done } = await reader.read();
      if (done) break;
      const text = decoder.decode(value);
      buffer += text;

      setMessages((messages) => {
        return [
          ...messages.slice(0, messages.length - 1),
          {
            ...messages[messages.length - 1],
            content: buffer,
          },
        ];
      });
      count++;
      await fluent(50);
    }
    setRatingButtonDisabled(false);
    setMessagesWaiting(false);

    // Todo: Do we need this here? If not, tell me and I will remove it. Otherwise, tell me and I will uncomment it.
    // if (!session || !session.user) {
    //   const response = await fetch("https://api.ipify.org?format=json");
    //   const data = await response.json();
    //   const { ip } = data;
    //   try {
    //     const response = await fetch("/api/chat/trail/send", {
    //       method: "POST",
    //       headers: {
    //         "Content-Type": "application/json",
    //       },
    //       body: JSON.stringify({ ip: ip }),
    //     });
    //     if (!response.ok) {
    //       throw new Error("Failed to store IP address");
    //     }
    //     const responseData = await response.json();
    //     const { quota } = responseData;
    //     if (quota >= 3) {
    //       toast.info("喜歡這個GPT測試嗎？立刻註冊！");
    //       setTimeout(() => {
    //         router.push("/login");
    //       }, 3000);
    //       return;
    //     }
    //   } catch (error) {
    //     console.error("Error storing IP address:", error);
    //   }
    // }
  };

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
    if (isUser) {
      await handleEditPrompt();
    } else {
      await saveEditedModelOutput();
    }
    messages[msgIndex].content = message;
    router.refresh();
  };

  // Todo: save new message to database
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

  // Todo: edit the prompt
  const handleEditPrompt = async () => {
    let originalCompletion, editedCompletion;
    const index = msgIndex + 1;
    originalCompletion = messages[index];
    editedCompletion = originalCompletion;
    try {
      const response = await fetch("/api/chat/editing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          msgIndex: msgIndex,
          contributorEmail: userEmail,
          originalPrompt: origMessage,
          editedPrompt: message,
          originalCompletion: originalCompletion.content,
          editedCompletion: editedCompletion.content,
          conversationRecordId: conversationRecordId,
        }),
      });
      if (response.ok)
        // After saving the new prompt, you can show a toast message to indicate the success
        toast.success("輸入提示已更新，請稍後", {
          autoClose: 1000,
        });
      else
        toast.error("輸入提示更新失敗，請再試一次", {
          autoClose: 1000,
        });
    } catch (error) {
      toast.error("輸入提示更新失敗，請再試一次", {
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
    <div className="flex flex-col w-full group">
      <div className={`flex w-full gap-3 mb-2`}>
        <div className="self-start flex-shrink-0">
          {isUser ? (
            imageUrl ? (
              <Image
                src={imageUrl}
                alt="User Image"
                width={imageSize}
                height={imageSize}
                className="rounded-full"
              />
            ) : (
              <User size={imageSize} />
            )
          ) : (
            <Bot size={imageSize} />
          )}
        </div>
        {isEditing ? (
          <textarea
            className="bg-transparent p-5 text-white px-2 pt-0 flex-grow whitespace-pre-wrap text-pretty break-words text-lg border-b border-solid resize-none focus:outline-none overflow-hidden min-h-0 h-auto"
            autoFocus
            onCompositionStart={handleComposingStart}
            onCompositionEnd={handleComposingEnd}
            ref={messageTextAreaRef}
            onKeyDown={async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
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
            className={`px-5 w-9/12 flex-grow whitespace-pre-wrap text-pretty break-words text-lg
          ${isEditing && "border-b border-solid"} focus:outline-none `}
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
      </div>
      <div className="self-end h-10">
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
            {!isUser && (
              <button
                className="p-1 opacity-0 group-hover:opacity-100 self-end"
                onClick={handleRegenerate}
                title={"重新生成模型輸出"}
                disabled={isEditing}
              >
                <IterationCw size={20} />
              </button>
            )}
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
  );
}
