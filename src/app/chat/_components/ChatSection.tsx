"use client";
import { useEffect, useRef, useState } from "react";
import MessageContainer from "./MessageContainer";
import type { Message } from "@/lib/types/db";
import { toast, ToastContainer } from "react-toastify";

export default function ChatSection() { 
  const [messageA, setMessageA] = useState<Message[]>([
    { role: "assistant", content: "Hello, how are you?" },
    { role: "user", content: "I am good, thank you." },
    { role: "assistant", content: "What are you up to?" },
    { role: "user", content: "Just working on some code." },
    { role: "assistant", content: "Cool! What are you building?" },
    { role: "user", content: "I am building a chat application." },
  ]);

  const [messageB, setMessageB] = useState<Message[]>([
    { role: "assistant", content: "Hello, how are you?" },
    { role: "user", content: "I am good, thank you." },
    { role: "assistant", content: "What are you up to?" },
    { role: "user", content: "Just working on some code." },
    { role: "assistant", content: "Cool! What are you building?" },
    { role: "user", content: "I am building a chat application." },
  ]);

  const modelA = "gpt-3.5-turbo";
  const modelB = "gpt-4";

  const messageAEndRef = useRef<HTMLDivElement | null>(null);
  const messageBEndRef = useRef<HTMLDivElement | null>(null);

  const [prompt, setPrompt] = useState<string>("");
  const promptInputRef = useRef<HTMLTextAreaElement>(null);

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

  const processMessages = async (currPrompt: string, messages: Message[], setMessages: React.Dispatch<React.SetStateAction<Message[]>>, model: string) => {
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
        model: model,
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
    while (count < 1000) {
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
    processMessages(prompt, messageA, setMessageA, modelA);
    processMessages(prompt, messageB, setMessageB, modelB);
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
            className="w-full border rounded-xl p-5 bg-transparent text-white overflow-hidden" 
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