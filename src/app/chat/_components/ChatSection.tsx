"use client";
import { useEffect, useRef, useState } from "react";
import MessageContainer from "./MessageContainer";
import Button from "@/app/_components/Button";
import type { Message } from "@/lib/types/db";
import { SendHorizonal } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const MAX_TOKENS = 1024;
const MIN_RATING_MESSAGE_COUNT = 3;

export default function ChatSection() {
  // Todo: get model names after rating
  const [modelAName, setModelAName] = useState<string>("???");
  const [modelBName, setModelBName] = useState<string>("???");

  const [conversationRecordIds, setConversationRecordIds] = useState([]);
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

  const messageAEndRef = useRef<HTMLDivElement | null>(null);
  const messageBEndRef = useRef<HTMLDivElement | null>(null);
  const promptInputRef = useRef<HTMLTextAreaElement>(null);

  const [ratingButtonDisabled, setRatingButtonDisabled] =
    useState<boolean>(false);
  const [messageAWaiting, setMessageAWaiting] = useState<boolean>(false);
  const [messageBWaiting, setMessageBWaiting] = useState<boolean>(false);

  const [prompt, setPrompt] = useState<string>("");

  const serverErrorMessage = "伺服器端錯誤，請稍後再試";

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
    setConversationRecordIds(data.conversationRecordId);
  };

  useEffect(() => {
    initiateChat();
  }, []);

  useEffect(() => {
    // Auto resize the textarea
    if (promptInputRef.current) {
      promptInputRef.current.style.height = "auto";
      promptInputRef.current.style.height = `${promptInputRef.current.scrollHeight}px`;
    }
  }, [prompt]);

  // Scroll to the bottom of the chat
  // Use block: "nearest" to get a better UX. (https://developer.mozilla.org/zh-CN/docs/Web/API/Element/scrollIntoView)
  useEffect(() => {
    if (messageAEndRef.current && messageA.length > 2) {
      messageAEndRef.current.scrollIntoView({
        behavior: "auto",
        block: "nearest",
        inline: "nearest",
      });
    }
  }, [messageA]);
  useEffect(() => {
    if (messageBEndRef.current && messageB.length > 2) {
      messageBEndRef.current.scrollIntoView({
        behavior: "auto",
        block: "nearest",
        inline: "nearest",
      });
    }
  }, [messageB]);

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
    ];
    setMessages(newMessages);

    const response = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({
        messages: newMessages,
        conversationRecordId: conversationRecordId,
      }),
    });

    if (!response.body) {
      return;
    } else if (response.status !== 200) {
      toast.error(serverErrorMessage);
      return;
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
      // Check last the role of the last message
      // If it is user, then we have to create a new message
      // If it is assistant, then we have to append to the last message
      if (count === 0) {
        setMessages((messages) => [
          ...messages,
          { role: "assistant", content: buffer },
        ]);
      } else {
        setMessages((messages) => {
          return [
            ...messages.slice(0, messages.length - 1),
            {
              ...messages[messages.length - 1],
              content: buffer,
            },
          ];
        });
      }
      count++;
    }
    setRatingButtonDisabled(false);
    setMessageWaiting(false);
  };

  const sendMessage = async () => {
    processMessages(
      prompt,
      messageA,
      conversationRecordIds[0],
      setMessageA,
      setMessageAWaiting,
    );
    processMessages(
      prompt,
      messageB,
      conversationRecordIds[1],
      setMessageB,
      setMessageBWaiting,
    );
    setPrompt("");
  };

  const sendRating = async (conversationRecordId: string, rating: number) => {
    setRatingButtonDisabled(true);
    if (
      messageA.length < MIN_RATING_MESSAGE_COUNT ||
      messageB.length < MIN_RATING_MESSAGE_COUNT
    ) {
      toast.warn("您與模型的對話還不夠多，請再繼續對話方可送出回饋。");
      setRatingButtonDisabled(false);
      return;
    }

    if (!conversationRecordId) {
      toast.error(serverErrorMessage);
      console.error("Conversation Record ID is empty");
      return;
    }
    const response = await fetch("/api/chat/rating", {
      method: "POST",
      body: JSON.stringify({
        conversationRecordId: conversationRecordId,
        rating: rating,
      }),
    });

    if (response.status === 200) {
      // Use a pop up to show the message that the rating has been submitted, do not use toast
      toast.success("您的回饋已經送出，謝謝！");
      return;
    } else if (response.status !== 200) {
      toast.error(serverErrorMessage);
      console.error("Error in response", response);
      return;
    }
  };

  const restartChat = () => {
    setMessageA([
      {
        role: "user",
        content: "You are a helpful chatbot that aims to assist human.",
      },
      {
        role: "assistant",
        content: "No problem, I can do my best to assist you",
      },
    ]);
    setMessageB([
      {
        role: "user",
        content: "You are a helpful chatbot that aims to assist human.",
      },
      {
        role: "assistant",
        content: "No problem, I can do my best to assist you",
      },
    ]);
    initiateChat();
  };

  const ratingButtonAttributes = [
    {
      text: "👈  A表現較佳",
      onClick: () => sendRating(conversationRecordIds[0], 1),
    },
    {
      text: "👉  B表現較佳",
      onClick: () => sendRating(conversationRecordIds[1], 1),
    },
    {
      text: "🤝  平手",
      onClick: () => sendRating(conversationRecordIds[0], 2),
    },
    {
      text: "👎  兩者皆差",
      onClick: () => sendRating(conversationRecordIds[0], 0),
    },
  ];

  return (
    <div className="flex flex-col">
      <h2 className="mb-5">👇 現在就來測試吧！</h2>

      <div className="flex flex-row justify-between border border-b-0 rounded-t-xl">
        <div className="flex-1 border-r p-4">
          <h3>🤖 模型 A: {modelAName}</h3>
        </div>
        <div className="flex-1 p-4">
          <h3>🤖 模型 B: {modelBName}</h3>
        </div>
      </div>
      <div className="flex flex-row justify-between border max-h-[50vh] min-h-[25vh] px-0.5">
        <div className="flex-1 border-r p-5 my-4 overflow-y-scroll">
          {messageA.map(
            (message, index) =>
              index >= 2 && (
                <MessageContainer
                  key={index}
                  origMessage={message.content}
                  isUser={message.role === "user"}
                />
              ),
          )}
          <div ref={messageAEndRef} />
        </div>
        <div className="flex-1 p-5 my-4 overflow-y-scroll">
          {messageB.map(
            (message, index) =>
              index >= 2 && (
                <MessageContainer
                  key={index}
                  origMessage={message.content}
                  isUser={message.role === "user"}
                />
              ),
          )}
          <div ref={messageBEndRef} />
        </div>
      </div>

      <div className="flex gap-3 flex-grow items-center border border-t-0 p-5">
        <div className="flex-grow">
          <textarea
            className="w-full border rounded-xl p-5 bg-transparent text-white overflow-hidden"
            placeholder="輸入訊息..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            ref={promptInputRef}
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.shiftKey === false) {
                e.preventDefault();
                if (prompt.length > 0) {
                  sendMessage();
                }
              }
            }}
          ></textarea>
        </div>
        <div>
          <Button
            text={
              <>
                <SendHorizonal size={20} />
                送出
              </>
            }
            onClick={sendMessage}
            disableCond={messageAWaiting || messageBWaiting}
          />
        </div>
      </div>
      <div className="flex w-full">
        <div className="flex w-full gap-2 justify-start items-center border border-gray-300 rounded-b-lg p-4">
          {ratingButtonAttributes.map((buttonAttribute, index) => (
            <Button
              key={index}
              text={buttonAttribute.text}
              onClick={buttonAttribute.onClick}
              disableCond={
                ratingButtonDisabled || messageAWaiting || messageBWaiting
              }
            />
          ))}
        </div>
        <div className="w-fit gap-2 justify-center items-center border border-gray-300 rounded-b-lg p-4">
          <Button
            text="🔁 重新開始對話"
            onClick={restartChat}
            disableCond={
              ratingButtonDisabled || messageAWaiting || messageBWaiting
            }
          />
        </div>
      </div>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}
