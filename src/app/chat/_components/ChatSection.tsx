"use client";
import { useEffect, useRef, useState } from "react";
import MessageContainer from "./MessageContainer";
import type { Message } from "@/lib/types/db";
import { toast, ToastContainer } from "react-toastify";

const MAX_TOKENS = 1024;

export default function ChatSection() { 
  const [messageA, setMessageA] = useState<Message[]>([
    { role: "user", content: "You are a helpful chatbot that aims to assist human." },
    { role: "assistant", content: "No problem, I can do my best to assist you" }
  ]);

  const [messageB, setMessageB] = useState<Message[]>([
    { role: "user", content: "You are a helpful chatbot that aims to assist human." },
    { role: "assistant", content: "No problem, I can do my best to assist you" }
  ]);


  const messageAEndRef = useRef<HTMLDivElement | null>(null);
  const messageBEndRef = useRef<HTMLDivElement | null>(null);

  const [prompt, setPrompt] = useState<string>("");
  const promptInputRef = useRef<HTMLTextAreaElement>(null);
  var conversationRecordIds : String[] = [];

  useEffect(() => {
    const initiateChat = async () => {
      const response = await fetch("/api/chat/initiate", {
        method: "POST",
      });

      if (!response.body) {
        return;
      } else if(response.status !== 200) {
        toast.error("Error in response", {
        type: "error",
        position: "top-center",
        });
        console.error("Error in response", response);
        return;
      }

      const data = await response.json();
      conversationRecordIds = data.conversationRecordId;
    }
    initiateChat();
  }
  , []);

  useEffect(() => {
    if (promptInputRef.current) {
      promptInputRef.current.style.height = "auto";
      promptInputRef.current.style.height = `${promptInputRef.current.scrollHeight}px`;
    }
  }, [prompt]);

  useEffect(() => {
    if (messageAEndRef.current) {
      messageAEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messageA]);
  
  useEffect(() => {
    if (messageBEndRef.current) {
      messageBEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messageB]);

  const processMessages = async (currPrompt: string, messages: Message[], conversationRecordId : String, setMessages: React.Dispatch<React.SetStateAction<Message[]>>) => {
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
        conversationRecordId: conversationRecordId
      }),
    });

    if (!response.body) {
      return;
    } else if(response.status !== 200) {
      // toast.error("Error in response", {
      //   type: "error",
      //   position: "top-center",
      // });
      // TODO: Add toast notification (現在他長得超怪)
      alert("There was something wrong with the response. Please try again later.");
      console.error("Error in response", response);
      return;
    }

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let count = 0;
    let buffer = "";
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
  }

  const sendMessage = async () => {
    processMessages(prompt, messageA, conversationRecordIds[0], setMessageA);
    processMessages(prompt, messageB, conversationRecordIds[1], setMessageB);
    setPrompt("");
  };

  return (
    <div className="flex flex-col">
      <ToastContainer 
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <h2 className="mb-5">👇 現在就來測試吧！</h2>
      <div className="flex flex-row justify-between border rounded-t-xl max-h-lvh">
        <div className="flex-1 border-r p-5 overflow-y-scroll">
          <h3 className="mb-5">🤖 模型 A</h3>
          {messageA.map((message, index) => (
            <MessageContainer key={index} message={message.content} isUser={message.role === "user"} />
          ))}
          <div ref={messageAEndRef} />
        </div>
        <div className="flex-1 p-5 overflow-y-scroll">
          <h4 className="mb-5">🤖 模型 B</h4>  
          {messageB.map((message, index) => (
            <MessageContainer key={index} message={message.content} isUser={message.role === "user"} />
          ))}       
          <div ref={messageBEndRef} />
        </div>
      </div>
      <div className="flex gap-3 flex-grow items-center border border-t-0 rounded-b-xl p-5">
        <div className="flex-grow">
          <textarea 
            className="w-full border rounded-xl p-5 bg-transparent text-black overflow-hidden" 
            placeholder="輸入訊息..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            ref={promptInputRef}
            onKeyDown={
              (e) => {
                if (e.key === "Enter" && e.shiftKey === false) {
                  sendMessage();
                }
              }
            }
          ></textarea>
        </div>
        <div>
          <button 
            className="bg-blue-500 text-white py-4 rounded-xl ml-2 text-nowrap px-10"
            onClick={sendMessage}
          >
            送出
          </button>
        </div>
      </div>
    </div>
  );
}