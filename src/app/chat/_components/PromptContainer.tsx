"use client";
import React, { useEffect, useState, useRef, useContext } from "react";
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
import ip_test from "./ip_test";

const serverErrorMessage = "伺服器端錯誤，請稍後再試";
const MAX_TOKENS = 2048;

export default function PromptContainer({
  // origPrompt,
  msgIndex,
  isCompleted,
}: {
  origPrompt: string;
  msgIndex: number;
  isCompleted: boolean;
}) {
  // console.log("PromptContainer Rerendered");
  // console.log("MessageContent: ", origPrompt);
  const router = useRouter();
  const { data: session } = useSession();
  const imageUrl = session?.user?.image;
  const imageSize = 30;

  const [isEditing, setIsEditing] = useState<boolean>(false);
  // const [prompt, setPrompt] = useState<string>(origPrompt);
  const promptTextAreaRef = useRef<HTMLTextAreaElement>(null);

  const [isComposing, setIsComposing] = useState(false);

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
  } = context;

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

  // console.log("childAMessages: ", childAMessages);
  // console.log("isCompleted: ", isCompleted);

  useEffect(() => {
    // Todo
    if (promptTextAreaRef.current) {
      promptTextAreaRef.current.style.height = "auto";
      promptTextAreaRef.current.style.height = `${promptTextAreaRef.current.scrollHeight}px`;
    }
  }, [/*prompt, */ isEditing]);

  // useEffect(() => {
  //   setPrompt(origPrompt);
  // }, [origPrompt]);

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

  // TODO: 切之前要把現在的訊息存起來
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

  const handleLeftShift = () => {
    if (childMessageIndex === 0) return;

    saveCurrentChild();
    setMessageA(
      messageA.slice(0, msgIndex).concat(childAMessages[childMessageIndex - 1]),
    );
    setMessageB(
      messageB.slice(0, msgIndex).concat(childBMessages[childMessageIndex - 1]),
    );

    setChildMessageIndex(childMessageIndex - 1);
    router.refresh();
  };

  const handleRightShift = () => {
    if (childMessageIndex === childAMessages.length - 1) return;

    saveCurrentChild();
    setMessageA(
      messageA.slice(0, msgIndex).concat(childAMessages[childMessageIndex + 1]),
    );
    setMessageB(
      messageB.slice(0, msgIndex).concat(childBMessages[childMessageIndex + 1]),
    );

    setChildMessageIndex(childMessageIndex + 1);
  };

  const handleRegenerate = async (
    setMessagesWaiting: React.Dispatch<React.SetStateAction<boolean>>,
    messages: Message[],
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
    conversationRecordId: string,
  ) => {
    setMessagesWaiting(true);

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

    // Abort the request if it takes too long (currently 10 second)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    const response = await fetch("/api/chat/regenerate", {
      method: "POST",
      body: JSON.stringify({
        messages: newMessages.slice(0, newMessages.length - 1),
        conversationRecordId: newConversationRecordId,
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

    function replaceConversationRecordId(
      oldConversationRecordId: string,
      newConversationRecordId: string,
      conversationRecordIds: string[],
    ) {
      const index = conversationRecordIds.indexOf(oldConversationRecordId);
      if (index !== -1) {
        conversationRecordIds[index] = newConversationRecordId;
      }
      setConversationRecordIds(conversationRecordIds);
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
    replaceConversationRecordId(
      conversationRecordId,
      newConversationRecordId,
      conversationRecordIds,
    );
    setRatingButtonDisabled(false);
    setMessagesWaiting(false);

    if (!session || !session.user) {
      ip_test(router);
    }
  };

  const handleEdit = async () => {
    const newPrompt = promptTextAreaRef.current?.value;
    if (!newPrompt) return;

    setIsEditing(false);

    processChildMessages(newPrompt);

    const oldMessageA = messageA.slice(0, msgIndex);
    const oldMessageB = messageB.slice(0, msgIndex);
    oldMessageA.push({
      role: "user",
      content: newPrompt,
    });
    oldMessageB.push({
      role: "user",
      content: newPrompt,
    });

    // setMessageA([
    //   ...messageA.slice(0, msgIndex),
    //   {
    //     role: "user",
    //     content: newPrompt,
    //   },
    // ]);
    // setMessageB([
    //   ...messageB.slice(0, msgIndex),
    //   {
    //     role: "user",
    //     content: newPrompt,
    //   },
    // ]);
    // messageA[msgIndex].content = prompt;
    // messageB[msgIndex].content = prompt;
    // router.refresh();

    await Promise.all([
      handleRegenerate(
        setMessageAWaiting,
        oldMessageA,
        setMessageA,
        conversationRecordIds[0],
      ),
      handleRegenerate(
        setMessageBWaiting,
        oldMessageB,
        setMessageB,
        conversationRecordIds[1],
      ),
    ]);
    setChildConversationIds([...childConversationIds, conversationRecordIds]); // Needs to be checked
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
              onCompositionStart={() => {
                setIsComposing(true);
              }}
              onCompositionEnd={() => {
                setIsComposing(false);
              }}
              ref={promptTextAreaRef}
              onKeyDown={async (
                e: React.KeyboardEvent<HTMLTextAreaElement>,
              ) => {
                if (e.key === "Enter" && !e.shiftKey && !isComposing) {
                  e.preventDefault();
                  e.currentTarget.blur(); // will trigger handleEdit
                }
              }}
              onBlur={handleEdit}
              onFocus={(e) => {
                e.target.selectionStart = e.target.value.length;
                e.target.selectionEnd = e.target.value.length;
              }}
              // onChange={(e) => setPrompt(e.target.value)}
              // value={prompt}
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
                        onClick={async () => {
                          processChildMessages();
                          handleRegenerate(
                            setMessageAWaiting,
                            messageA,
                            setMessageA,
                            conversationRecordIds[0],
                          );
                          handleRegenerate(
                            setMessageBWaiting,
                            messageB,
                            setMessageB,
                            conversationRecordIds[1],
                          );
                        }}
                        title={"重新生成模型輸出"}
                        disabled={isEditing}
                      >
                        <IterationCw size={20} />
                      </button>
                      <button
                        className="p-1 opacity-0 group-hover:opacity-100 self-end"
                        onClick={() => {
                          setIsEditing(true);
                        }}
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
                  onClick={handleLeftShift}
                  disabled={childMessageIndex === 0 || !isCompleted}
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="p-0.5 self-end">
                  {childMessageIndex + 1}&nbsp;/&nbsp;{childAMessages.length}
                </span>
                <button
                  className="p-1 self-end"
                  onClick={handleRightShift}
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

// Todo: edit the prompt
// const handleEditPrompt = async () => {
//   let originalCompletion, editedCompletion;
//   const index = msgIndex + 1;
//   originalCompletion = messageA[index];
//   editedCompletion = originalCompletion;
//   try {
//     const response = await fetch("/api/chat/editing", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         msgIndex: msgIndex,
//         contributorEmail: userEmail,
//         originalPrompt: origPrompt,
//         editedPrompt: prompt,
//         originalCompletion: originalCompletion.content,
//         editedCompletion: editedCompletion.content,
//         conversationRecordId: conversationRecordId,
//       }),
//     });
//     if (response.ok)
//       // After saving the new prompt, you can show a toast message to indicate the success
//       toast.success("輸入提示已更新，請稍後", {
//         autoClose: 1000,
//       });
//     else
//       toast.error("輸入提示更新失敗，請再試一次", {
//         autoClose: 1000,
//       });
//   } catch (error) {
//     toast.error("輸入提示更新失敗，請再試一次", {
//       autoClose: 1000,
//     });
//   }
// };
