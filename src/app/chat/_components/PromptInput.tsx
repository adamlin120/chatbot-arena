import Button from "@/app/_components/Button";
import { SendHorizonal } from "lucide-react";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";
import { MessageContext } from "@/context/message";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import { Message } from "@/lib/types/db";
import { serverErrorMessage } from "../page";

export default function PromptInput() {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error("MessageContext is not provided");
  }
  const {
    messageA,
    messageB,
    conversationRecordIds,
    setMessageA,
    setMessageB,
    messageAWaiting,
    setMessageAWaiting,
    messageBWaiting,
    setMessageBWaiting,
    ratingButtonDisabled,
    setRatingButtonDisabled,
  } = context;

  const MAX_TOKENS = 1024;
  const { data: session } = useSession();
  const router = useRouter();

  const [prompt, setPrompt] = useState<string>("");
  const promptInputRef = useRef<HTMLTextAreaElement>(null);

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
      {
        role: "assistant",
        content: "思考中...",
      },
    ];
    setMessages(newMessages);

    const response = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({
        messages: newMessages.slice(0, newMessages.length - 1),
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
    }
    setRatingButtonDisabled(false);
    setMessageWaiting(false);
  };

  // Auto resize the textarea
  useEffect(() => {
    if (promptInputRef.current) {
      promptInputRef.current.style.height = "auto";
      promptInputRef.current.style.height = `${promptInputRef.current.scrollHeight}px`;
    }
  }, [prompt]);

  const sendMessage = async () => {
    if (prompt.length === 0 || prompt.trim().length === 0) return;
    setPrompt(prompt.trim());

    processMessages(
      prompt.trim(),
      messageA,
      conversationRecordIds[0],
      setMessageA,
      setMessageAWaiting,
    );
    processMessages(
      prompt.trim(),
      messageB,
      conversationRecordIds[1],
      setMessageB,
      setMessageBWaiting,
    );
    setPrompt("");
    if (!session || !session.user) {
      const response = await fetch("https://api.ipify.org?format=json");
      const data = await response.json();
      const { ip } = data;
      try {
        const response = await fetch("/api/chat/trail/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ip: ip }),
        });
        if (!response.ok) {
          throw new Error("Failed to store IP address");
        }
        const responseData = await response.json();
        const { quota } = responseData;
        if (quota >= 3) {
          toast.info("喜歡這個GPT測試嗎？立刻註冊！");
          setTimeout(() => {
            router.push("/login");
          }, 3000);
          return;
        }
      } catch (error) {
        console.error("Error storing IP address:", error);
      }
    }
  };

  return (
    <div className="flex gap-3 items-center border border-t-0 p-5">
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
              if (!messageAWaiting && !messageBWaiting) {
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
          disableCond={
            messageAWaiting || messageBWaiting || ratingButtonDisabled
          }
          className="py-5"
        />
      </div>
    </div>
  );
}
