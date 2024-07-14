"use client";
import React, { useState, useRef, useContext, useEffect } from "react";
import {
  Pencil,
  User,
  IterationCw,
  Clipboard,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { MessageContext } from "@/context/message";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Message } from "@/lib/types/db";
import { getCompletion, serverErrorMessage } from "./getCompletion";

export default function PromptContainer({
  msgIndex,
  isCompleted,
}: {
  msgIndex: number;
  isCompleted: boolean;
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const imageUrl = session?.user?.image;
  const imageSize = 30;

  const context = useContext(MessageContext);
  if (!context) {
    throw new Error("MessageContext is not provided"); // Todo: think an elegant way to handle this
  }
  const {
    ratingButtonDisabled,
    setRatingButtonDisabled,
    messageA,
    setMessageA,
    messageB,
    setMessageB,
    setMessageAWaiting,
    setMessageBWaiting,
    conversationRecordIds,
    setConversationRecordIds,
    stopStreaming,
    setStopStreaming,
  } = context;

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const promptTextAreaRef = useRef<HTMLTextAreaElement>(null);

  const stopStreamingRef = useRef(stopStreaming);
  useEffect(() => {
    stopStreamingRef.current = stopStreaming;
  }, [stopStreaming]);

  const [isComposing, setIsComposing] = useState(false);

  const [childConversationIds, setChildConversationIds] = useState<string[][]>([
    conversationRecordIds,
  ]);
  const [childAMessages, setChildAMessages] = useState<Message[][]>([
    messageA.slice(msgIndex),
  ]);
  const [childBMessages, setChildBMessages] = useState<Message[][]>([
    messageB.slice(msgIndex),
  ]);
  const [childMessageIndex, setChildMessageIndex] = useState<number>(0);

  // We need to save the current child messages before shifting to another child
  const saveCurrentChild = () => {
    setChildAMessages(
      childAMessages.map((m, index) => {
        if (index === childMessageIndex) {
          return messageA.slice(msgIndex);
        }
        return m;
      }),
    );
    setChildBMessages(
      childBMessages.map((m, index) => {
        if (index === childMessageIndex) {
          return messageB.slice(msgIndex);
        }
        return m;
      }),
    );
  };

  const handleShift = (newChildIndex: number) => {
    if (newChildIndex < 0 || newChildIndex >= childAMessages.length) return;

    saveCurrentChild();
    setMessageA(
      messageA.slice(0, msgIndex).concat(childAMessages[newChildIndex]),
    );
    setMessageB(
      messageB.slice(0, msgIndex).concat(childBMessages[newChildIndex]),
    );

    setConversationRecordIds(childConversationIds[newChildIndex]);
    setChildMessageIndex(newChildIndex);
  };

  const handleEdit = async (isRegen: boolean = false) => {
    const oldMessageA = messageA.slice(0, isRegen ? msgIndex + 1 : msgIndex);
    const oldMessageB = messageB.slice(0, isRegen ? msgIndex + 1 : msgIndex);

    const processChildMessages = (
      newPrompt: string = messageA[msgIndex].content,
    ) => {
      // Add a new branch here
      const n = childAMessages.length;

      const newChildAMessages = [...childAMessages];
      newChildAMessages[childMessageIndex] = messageA.slice(msgIndex);
      setChildAMessages([
        ...newChildAMessages,
        [{ role: "user", content: newPrompt }],
      ]);

      const newChildBMessages = [...childBMessages];
      newChildBMessages[childMessageIndex] = messageB.slice(msgIndex);
      setChildBMessages([
        ...newChildBMessages,
        [{ role: "user", content: newPrompt }],
      ]);

      setChildMessageIndex(n);
    };

    if (!isRegen) {
      // edit
      const newPrompt = promptTextAreaRef.current?.value.trim();
      if (!newPrompt || newPrompt === messageA[msgIndex].content) return;

      setIsEditing(false);
      processChildMessages(newPrompt);

      oldMessageA.push({
        role: "user",
        content: newPrompt,
      });
      oldMessageB.push({
        role: "user",
        content: newPrompt,
      });
    } else {
      processChildMessages();
    }

    const handleRegenerate = async (
      setMessagesWaiting: React.Dispatch<React.SetStateAction<boolean>>,
      messages: Message[],
      setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
      // conversationRecordId: string,
      conversationRecordIdIndex: number,
      newConversationRecordIds: string[],
    ) => {
      setMessagesWaiting(true);
      const conversationRecordId =
        conversationRecordIds[conversationRecordIdIndex];

      const oldMessages: Message[] = messages;
      const newMessages: Message[] = [
        ...messages.slice(0, msgIndex + 1),
        {
          role: "assistant",
          content: "思考中...",
        },
      ];
      setMessages(newMessages);

      // Get the new conversation record ID for regenerated conversation
      let newConversationRecordId: string;
      try {
        const response = await fetch("/api/chat/regenerate/initiate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ conversationRecordId }),
        });
        // if response code is 429, it means the user has exceeded the quota
        if (response.status === 429) {
          toast.info("喜歡這個GPT測試嗎？立刻註冊！");
          setTimeout(() => {
            router.push("/login");
          }, 3000);
          return;
        }
        if (!response.ok) {
          throw new Error("Failed to get new conversation record ID");
        }
        const responseData = await response.json();
        newConversationRecordId = responseData.conversationRecordId;
      } catch (error) {
        console.error("Error getting new conversation record ID:", error);
        toast.error(serverErrorMessage);
        setMessagesWaiting(false);
        setMessages(oldMessages);
        return;
      }

      await getCompletion(
        "/api/chat/regenerate",
        router,
        newMessages,
        newConversationRecordId,
        setMessages,
        setMessagesWaiting,
        setRatingButtonDisabled,
        setStopStreaming,
        stopStreamingRef,
        "",
      );
      newConversationRecordIds[conversationRecordIdIndex] =
        newConversationRecordId;
    };

    const newConversationRecordIds: string[] = ["", ""];
    await Promise.all([
      handleRegenerate(
        setMessageAWaiting,
        oldMessageA,
        setMessageA,
        0,
        newConversationRecordIds,
      ),
      handleRegenerate(
        setMessageBWaiting,
        oldMessageB,
        setMessageB,
        1,
        newConversationRecordIds,
      ),
    ]);

    setChildConversationIds([
      ...childConversationIds,
      newConversationRecordIds,
    ]); // Todo: Needs to be checked
    setConversationRecordIds(newConversationRecordIds);
  };

  return (
    <div className="flex flex-col w-full group pt-6 px-5">
      <div className="flex w-full gap-3 mb-2">
        <div className="self-start flex-shrink-0">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt="User Image"
              width={imageSize}
              height={imageSize}
              className="rounded-full"
            />
          ) : (
            <User size={imageSize} />
          )}
        </div>
        <div className="flex-grow flex flex-col border rounded-sm mr-10">
          {isEditing ? (
            <textarea
              className="bg-transparent p-5 mx-5 px-0 text-white pb-0 flex-grow whitespace-pre-wrap text-pretty break-words text-lg border-b border-solid resize-none focus:outline-none overflow-hidden min-h-0 h-auto"
              autoFocus
              onCompositionStart={() => setIsComposing(true)}
              onCompositionEnd={() => setIsComposing(false)}
              ref={promptTextAreaRef}
              onKeyDown={async (
                e: React.KeyboardEvent<HTMLTextAreaElement>,
              ) => {
                if (e.key === "Enter" && !e.shiftKey && !isComposing) {
                  e.preventDefault();
                  const inputText = promptTextAreaRef.current?.value || "";
                  if (
                    inputText.trim().length === 0 ||
                    inputText.trim() === messageA[msgIndex].content
                  )
                    return;
                  e.currentTarget.blur(); // will trigger handleEdit
                }
              }}
              onBlur={async () => await handleEdit(false)}
              onFocus={(e) => {
                e.target.selectionStart = e.target.value.length;
                e.target.selectionEnd = e.target.value.length;
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height = `${target.scrollHeight}px`;
              }}
              defaultValue={messageA[msgIndex].content}
            />
          ) : (
            <div
              className={`px-5 pt-3 pb-4 flex-grow whitespace-pre-wrap text-pretty break-words text-lg
            ${isEditing && "border-b border-solid"} focus:outline-none`}
            >
              {messageA[msgIndex].content}
            </div>
          )}
          <div className="inline-flex items-center pb-5 pt-3 self-start px-4 h-10 whitespace-nowrap w-full">
            {!isEditing && isCompleted && (
              <>
                <div>
                  <CopyToClipBoard
                    content={messageA[msgIndex].content}
                    isEditing={isEditing}
                  />
                  {!ratingButtonDisabled && (
                    <>
                      <button
                        className="p-1 opacity-0 group-hover:opacity-100 self-end"
                        onClick={async () => await handleEdit(true)}
                        title={"重新生成模型輸出"}
                        disabled={isEditing}
                      >
                        <IterationCw size={20} />
                      </button>
                      <button
                        className="p-1 opacity-0 group-hover:opacity-100 self-end"
                        onClick={() => setIsEditing(true)}
                        title={"點擊以修改訊息"}
                        disabled={isEditing}
                      >
                        <Pencil color="white" size={20} />
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
            {!isEditing && childAMessages.length > 1 && (
              <div className="inline-flex items-center justify-center ml-auto">
                <button
                  className="p-1 self-end"
                  onClick={() => handleShift(childMessageIndex - 1)}
                  disabled={childMessageIndex === 0 || !isCompleted}
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="p-0.5 self-end">
                  {childMessageIndex + 1}&nbsp;/&nbsp;{childAMessages.length}
                </span>
                <button
                  className="p-1 self-end"
                  onClick={() => handleShift(childMessageIndex + 1)}
                  disabled={
                    childMessageIndex === childAMessages.length - 1 ||
                    !isCompleted
                  }
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CopyToClipBoard({
  content,
  isEditing,
}: {
  content: string;
  isEditing: boolean;
}) {
  const [justCopied, setJustCopied] = useState(false);
  return (
    <button
      className="p-1 opacity-0 group-hover:opacity-100 self-end"
      onClick={() => {
        navigator.clipboard.writeText(content);
        setJustCopied(true);
        setTimeout(() => setJustCopied(false), 2000); // Reset after 3 seconds
      }}
      title={"複製"}
      disabled={isEditing}
    >
      {justCopied ? <Check size={20} /> : <Clipboard size={20} />}
    </button>
  );
}
