"use client";
import { Message } from "@/lib/types/db";
import { createContext, useState } from "react";
import { toast } from "react-toastify";

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
  ratingButtonDisabled: boolean;
  setRatingButtonDisabled: React.Dispatch<React.SetStateAction<boolean>>;
  modelAName: String;
  setModelAName: React.Dispatch<React.SetStateAction<string>>;
  modelBName: string;
  setModelBName: React.Dispatch<React.SetStateAction<string>>;
  rated: boolean;
  setRated: React.Dispatch<React.SetStateAction<boolean>>;
  initiateChat: () => void;
} | null>(null);

export function MessageProvider({ children }: { children: React.ReactNode }) {
  const [conversationRecordIds, setConversationRecordIds] = useState<string[]>(
    [],
  );

  const [messageA, setMessageA] = useState<Message[]>([
    {
      role: "user",
      content: "You are a helpful chatbot that aims to assist human.",
    },
    {
      role: "assistant",
      content: "No problem, I can do my best to assist you",
    },
  ]);
  const [messageB, setMessageB] = useState<Message[]>([
    {
      role: "user",
      content: "You are a helpful chatbot that aims to assist human.",
    },
    {
      role: "assistant",
      content: "No problem, I can do my best to assist you",
    },
  ]);

  const [modelAName, setModelAName] = useState<string>(DEFAULT_MODEL_NAME);
  const [modelBName, setModelBName] = useState<string>(DEFAULT_MODEL_NAME);
  const [rated, setRated] = useState<boolean>(false);
  const [messageAWaiting, setMessageAWaiting] = useState<boolean>(false);
  const [messageBWaiting, setMessageBWaiting] = useState<boolean>(false);
  const [ratingButtonDisabled, setRatingButtonDisabled] =
    useState<boolean>(false);

  const initiateChat = async () => {
    const response = await fetch("/api/chat/initiate", {
      method: "POST",
    });

    if (!response.body) {
      return;
    } else if (response.status !== 200) {
      toast.error(serverErrorMessage);
      console.error("Error in response", response);
      return;
    }

    const data = await response.json();
    console.log("conversation id data: ", data);
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
        ratingButtonDisabled,
        setRatingButtonDisabled,
        initiateChat,
        modelAName,
        setModelAName,
        modelBName,
        setModelBName,
        rated,
        setRated,
      }}
    >
      {children}
    </MessageContext.Provider>
  );
}
