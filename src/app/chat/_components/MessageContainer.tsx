"use client";
import React, { useEffect, useState, useRef } from "react";
import { Pencil } from 'lucide-react';
import { toast } from "react-toastify";

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

  // Todo: is there a better way to handle this?
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (messageContainerRef.current && !messageContainerRef.current.contains(event.target as Node)) {
        setIsEditing(false);
        setIsFocused(false);

        // Manually trigger onBlur event
        const blurEvent = new Event('blur', { bubbles: true, cancelable: true });
        messageContainerRef.current.dispatchEvent(blurEvent);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [messageContainerRef]);


  // Todo: save new message to database
  const saveNewMessage = async (newMessage: string) => {
    console.log("New message: ", newMessage); // You can remove this line after implementing the save function
  };

  return (
    <div className={`flex gap-2 group ${isUser ? "justify-end" : "justify-start"} mb-2`}>
      <div
        className={`${
          isUser ? "bg-blue-700 text-white" : "bg-gray-200 text-gray-800"
        } p-2 rounded-lg max-w-xs whitespace-pre-wrap text-pretty break-words ${isEditing && !isFocused && "border-4 border-solid animate-pulse"}`}
        ref={messageContainerRef} 
        contentEditable={isEditing}
        role="textbox"
        tabIndex={0}
        suppressContentEditableWarning={true}
        onBlur={async (e) => {
          setIsEditing(false);
          setIsFocused(false);
          await saveNewMessage(e.currentTarget.textContent || "");
        }}
        onFocus={() => setIsFocused(true)}
        onKeyDown={async (e: React.KeyboardEvent<HTMLDivElement>) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if(messageContainerRef.current) {
              messageContainerRef.current.blur();
            }
          }
        }}
      >
        {origMessage}
      </div>
      {!isUser && !isEditing && (
        <button 
          className="p-1  opacity-0 group-hover:opacity-100" 
          onClick={() => {
            toast.info("進入編輯模型輸出模式！", {
              autoClose: 1000,
              
            });
            setIsEditing(!isEditing);
          }}
          title="點擊以編輯模型輸出，讓我們的模型有機會做得更好！"
        >
          <Pencil color="white" size={20}/>
        </button>
      )}
    </div>
  );
}
