import { useContext, useEffect, useRef } from "react";
import MessageContainer from "./MessageContainer";
import { MessageContext } from "@/context/message";
import { Message } from "@/lib/types/db";
import { Bot } from "lucide-react";

export default function MessageSection() {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error("MessageContext is not provided"); // Todo: think an elegant way to handle this
  }
  const { messageA, messageB, messageAWaiting, messageBWaiting } = context;

  const messageAEndRef = useRef<HTMLDivElement | null>(null);
  const messageBEndRef = useRef<HTMLDivElement | null>(null);

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

  return (
    // Todo: think a better way to handle the height of the container
    <div className="flex flex-row flex-grow justify-between border max-h-[62dvh] px-0.5">
      <MessageDisplay messages={messageA} messagesEndRef={messageAEndRef} isCompleted={!messageAWaiting} />
      <MessageDisplay messages={messageB} messagesEndRef={messageBEndRef} isCompleted={!messageBWaiting} />
    </div>
  );
}

function MessageDisplay({
  messages,
  messagesEndRef,
  isCompleted,
}: {
  messages: Message[];
  messagesEndRef: React.RefObject<HTMLDivElement>;
  isCompleted: boolean;
}) {
  return (
    <div className="flex-1 flex flex-col gap-8 border-r p-5 py-4 overflow-y-auto">
      {messages.length > 2 ? (
        messages.map(
          (message, index) =>
            index >= 2 && (
              <MessageContainer
                key={index}
                origMessage={message.content}
                isUser={message.role === "user"}
                isCompleted={isCompleted}
              />
            ),
        )
      ) : (
        <div className="flex flex-col items-center justify-center h-screen gap-5 text-2xl">
          <Bot size={45} /> 我今天要怎麼幫你呢？
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}