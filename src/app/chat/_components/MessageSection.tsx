import { useContext, useEffect, useRef } from "react";
import MessageContainer from "./MessageContainer";
import { MessageContext } from "@/context/message";

export default function MessageSection() {
  const context = useContext(MessageContext);
  if(!context) {
    throw new Error("MessageContext is not provided"); // Todo: think an elegant way to handle this
  }
  const { messageA, messageB } = context;

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
    <div className="flex flex-row flex-grow justify-between border max-h-[50vh] min-h-[25vh] px-0.5">
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
  )
}