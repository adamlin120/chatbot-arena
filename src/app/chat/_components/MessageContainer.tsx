"use client";
import React, { useEffect, useState, useRef } from "react";
import { Bot, Pencil, User, IterationCw } from "lucide-react";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import Image from "next/image";

export default function MessageContainer({
  origMessage,
  isUser,
}: {
  origMessage: string;
  isUser: boolean;
}) {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const messageContainerRef = useRef<HTMLDivElement>(null);

  const { data: session } = useSession();
  const imageUrl = session?.user?.image;
  const imageSize = 30;

  // Todo: is there a better way to handle this?
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        messageContainerRef.current &&
        !messageContainerRef.current.contains(event.target as Node)
      ) {
        setIsEditing(false);
        setIsFocused(false);

        // Manually trigger onBlur event
        const blurEvent = new Event("blur", {
          bubbles: true,
          cancelable: true,
        });
        messageContainerRef.current.dispatchEvent(blurEvent);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [messageContainerRef]);

  // Todo: save new message to database
  const saveEditedModelOutput = async (newOutput: string) => {
    console.log("New message: ", newOutput); // You can remove this line after implementing the save function

    // After saving the new message, you can show a toast message to indicate the success
    toast.success("模型輸出已更新，感謝您的貢獻！");
  };

  const handleEditPrompt = async (newPrompt: string) => {
    console.log("New prompt: ", newPrompt); // Remove this line after implementing the save function

    // After saving the new prompt, you can show a toast message to indicate the success
    toast.success("輸入提示已更新，請稍後");
  }

  // for the loading dots
  const [dotCount, setDotCount] = useState<number>(1);
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
    <div className="flex flex-col group">
      <div
        className={`flex gap-3 mb-2`}
      >
        <div className="self-start flex-shrink-0">
        {
          isUser ? (
            imageUrl ? 
            <Image src={imageUrl} alt="User Image" width={imageSize} height={imageSize} className="rounded-full" /> :
            <User size={imageSize} />
          ) : (
            <Bot size={imageSize} />
          )
        }
        </div>
        <div
          className={`px-2 flex-grow whitespace-pre-wrap text-pretty break-words text-lg
          ${isEditing && !isFocused && "border-b border-solid"} focus:outline-none ${isEditing && "border-b"}`}
          ref={messageContainerRef}
          contentEditable={isEditing}
          role="textbox"
          tabIndex={0}
          suppressContentEditableWarning={true}
          onBlur={async (e) => {
            setIsEditing(false);
            setIsFocused(false);
            if(isUser) {
              await handleEditPrompt(e.currentTarget.textContent || "");
            } else {
              await saveEditedModelOutput(e.currentTarget.textContent || "");
            }
          }}
          onFocus={() => setIsFocused(true)}
          onKeyDown={async (e: React.KeyboardEvent<HTMLDivElement>) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (messageContainerRef.current) {
                messageContainerRef.current.blur();
              }
            }
          }}
        >
          {origMessage === "思考中..." && !isUser
            ? `思考中${".".repeat(dotCount)}`
            : origMessage}
        </div>
      </div>
      {!isEditing && (
        <div className="self-end">
          {!isUser && <button
          className="p-1 opacity-0 group-hover:opacity-100 self-end"
          onClick={() => {
            
          }}
          title={"重新生成模型輸出"}
          disabled={isFocused}
        >
          <IterationCw size={20} />
        </button>}
        <button
          className="p-1 opacity-0 group-hover:opacity-100 self-end"
          onClick={() => {
            if(!isUser) {
              toast.info("編輯模型輸出，讓我們的模型有機會做得更好！", {
                autoClose: 1000,
              });
            }
            setIsEditing(!isEditing);
          }}
          title={isUser ? "點擊以修改訊息" : "點擊以編輯模型輸出，讓我們的模型有機會做得更好！"}
          disabled={isFocused}
        >
          <Pencil color="white" size={20} />
        </button>
        
        </div>
      )}
  </div>
  );
}
