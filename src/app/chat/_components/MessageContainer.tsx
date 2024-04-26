"use client";
import React, { useEffect, useState, useRef, useContext } from "react";
import { Bot, Pencil, User, IterationCw } from "lucide-react";
import { MessageContext } from "@/context/message";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";


export default function MessageContainer({
  origMessage,
  msgIndex,
  isUser,
  isCompleted,
  conversationRecordId,
  type,
}: {
  origMessage: string;
  msgIndex: number;
  isUser: boolean;
  isCompleted: boolean;
  conversationRecordId: string;
  type: string;
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const imageUrl = session?.user?.image;
  const userEmail = session?.user?.email;
  const imageSize = 30;

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [message, setMessage] = useState<string>(origMessage);
  const messageTextAreaRef = useRef<HTMLTextAreaElement>(null);

  const context = useContext(MessageContext);
  if (!context) {
    throw new Error("MessageContext is not provided"); // Todo: think an elegant way to handle this
  }
  const { messageA, messageB, conversationRecordIds, ratingButtonDisabled} = context;

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

  const handleRegenerate = async () => { };

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
    if (type == 'A') {
      messageA[msgIndex].content = message;
    } else {
      messageB[msgIndex].content = message;
    }
    router.refresh();
  };

  // Todo: save new message to database
  const saveEditedModelOutput = async () => {
    let originalPrompt, editedPrompt, conversationRecordId;
    if (type === 'A') {
      originalPrompt = messageA[msgIndex - 1];
      editedPrompt = messageA[msgIndex - 1];
      conversationRecordId = conversationRecordIds[0];
    } else {
      originalPrompt = messageB[msgIndex - 1];
      editedPrompt = messageB[msgIndex - 1];
      conversationRecordId = conversationRecordIds[1];
    }
    try {
      const response = await fetch("/api/chat/editing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversationRecordId: conversationRecordId,
          msgIndex: msgIndex-1,
          contributorEmail: userEmail,
          originalPrompt: originalPrompt.content,
          editedPrompt: editedPrompt.content,
          originalCompletion: origMessage,
          editedCompletion: message
        })
      })
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
    };
  };

  // Todo: edit the prompt
  const handleEditPrompt = async () => {
    let originalCompletion, editedCompletion,conversationRecordId;
    if (type === 'A') {
      originalCompletion = messageA[msgIndex + 1];
      editedCompletion = messageA[msgIndex + 1];
      conversationRecordId = conversationRecordIds[0];
    } else {
      originalCompletion = messageB[msgIndex + 1];
      editedCompletion = messageB[msgIndex + 1];
      conversationRecordId = conversationRecordIds[1];
    }
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
          conversationRecordId: conversationRecordId
        })
      })
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
        setDotCount((prevCount) => (prevCount % 4) + 1);
      }, 500); // Update every 500ms
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [origMessage]);

  return (
    <div className="flex flex-col group">
      <div className={`flex gap-3 mb-2`}>
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
            ref={messageTextAreaRef}
            onKeyDown={async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
              if (e.key === "Enter" && !e.shiftKey) {
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
            className={`px-2 flex-grow whitespace-pre-wrap text-pretty break-words text-lg
          ${isEditing && "border-b border-solid"} focus:outline-none `}
          >
            {message === "思考中..." && !isUser
              ? `思考中${".".repeat(dotCount)}`
              : message}
          </div>
        )}
      </div>
      {!isEditing && isCompleted && (
        <div className="self-end">
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
          {ratingButtonDisabled&&(<button
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
          </button>)}
        </div>
      )}
    </div>
  );
}
