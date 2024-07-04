"use client";
import { Message } from "@/lib/types/db";
import { createContext, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const serverErrorMessage = "伺服器端錯誤，請稍後再試";
const DEFAULT_MODEL_NAME = "評分後即可揭曉";

export const MessageContext = createContext<{
  messageA: Message[];
  messageB: Message[];
  setMessageA: React.Dispatch<React.SetStateAction<Message[]>>;
  setMessageB: React.Dispatch<React.SetStateAction<Message[]>>;
  conversationRecordIds: string[];
  setConversationRecordIds: React.Dispatch<React.SetStateAction<string[]>>;
  messageAWaiting: boolean;
  setMessageAWaiting: React.Dispatch<React.SetStateAction<boolean>>;
  messageBWaiting: boolean;
  setMessageBWaiting: React.Dispatch<React.SetStateAction<boolean>>;
  justSent: boolean;
  setJustSent: React.Dispatch<React.SetStateAction<boolean>>;
  ratingButtonDisabled: boolean;
  setRatingButtonDisabled: React.Dispatch<React.SetStateAction<boolean>>;
  modelAName: String;
  setModelAName: React.Dispatch<React.SetStateAction<string>>;
  modelBName: string;
  setModelBName: React.Dispatch<React.SetStateAction<string>>;
  rated: boolean;
  setRated: React.Dispatch<React.SetStateAction<boolean>>;
  stopStreaming: boolean;
  setStopStreaming: React.Dispatch<React.SetStateAction<boolean>>;
  initiateChat: () => void;
  DEFAULT_MODEL_NAME: string;
  origMessage: Message[];
} | null>(null);

export function MessageProvider({ children }: { children: React.ReactNode }) {
  const [conversationRecordIds, setConversationRecordIds] = useState<string[]>(
    [],
  );
  const router = useRouter();

  const origMessage: Message[] = [
    {
      role: "user",
      content:
        "你是一個繁體中文人工智能助理，必須根據我的輸入做出適當的回覆以解決我的需求。",
    },
    {
      role: "assistant",
      content: "沒問題，我會竭盡所能地協助您。",
    },
  ];

  const [messageA, setMessageA] = useState<Message[]>(origMessage);
  const [messageB, setMessageB] = useState<Message[]>(origMessage);
  const [modelAName, setModelAName] = useState<string>(DEFAULT_MODEL_NAME);
  const [modelBName, setModelBName] = useState<string>(DEFAULT_MODEL_NAME);
  const [rated, setRated] = useState<boolean>(false);
  const [messageAWaiting, setMessageAWaiting] = useState<boolean>(false);
  const [messageBWaiting, setMessageBWaiting] = useState<boolean>(false);
  const [justSent, setJustSent] = useState<boolean>(false);
  const [ratingButtonDisabled, setRatingButtonDisabled] =
    useState<boolean>(false);
  const [stopStreaming, setStopStreaming] = useState<boolean>(false);

  const initiateChat = async () => {
    const response = await fetch("/api/chat/initiate", {
      method: "POST",
    });

    if (!response.body) {
      return;
    } else if (response.status === 429) {
      toast.info("喜歡這個GPT測試嗎？立刻註冊！");
      setTimeout(() => {
        router.push("/login");
      }, 3000);
      return;
    } else if (response.status !== 200) {
      toast.error(serverErrorMessage);
      console.error("Error in response", response);
      return;
    }

    const data = await response.json();
    setConversationRecordIds(data.conversationRecordId);

    setModelAName(DEFAULT_MODEL_NAME);
    setModelBName(DEFAULT_MODEL_NAME);
  };

  return (
    <MessageContext.Provider
      value={{
        messageA,
        messageB,
        setMessageA,
        setMessageB,
        conversationRecordIds,
        setConversationRecordIds,
        messageAWaiting,
        setMessageAWaiting,
        messageBWaiting,
        setMessageBWaiting,
        justSent,
        setJustSent,
        ratingButtonDisabled,
        setRatingButtonDisabled,
        initiateChat,
        modelAName,
        setModelAName,
        modelBName,
        setModelBName,
        rated,
        setRated,
        stopStreaming,
        setStopStreaming,
        DEFAULT_MODEL_NAME,
        origMessage,
      }}
    >
      {children}
    </MessageContext.Provider>
  );
}
