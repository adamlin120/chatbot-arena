import { useContext, useEffect, useRef } from "react";
import CompletionContainer from "./CompletionContainer";
import { MessageContext } from "@/context/message";
import PromptContainer from "./PromptContainer";
import { Bot } from "lucide-react";

export default function MessageSection() {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error("MessageContext is not provided"); // Todo: think an elegant way to handle this
  }
  const {
    messageA,
    messageB,
    messageAWaiting,
    messageBWaiting,
    conversationRecordIds,
    setConversationRecordIds,
  } = context;

  const messageEndRef = useRef<HTMLDivElement | null>(null);

  // Scroll to the bottom of the chat
  // Use block: "nearest" to get a better UX. (https://developer.mozilla.org/zh-CN/docs/Web/API/Element/scrollIntoView)
  useEffect(() => {
    if (messageEndRef.current && messageA.length > 2 && messageB.length > 2) {
      messageEndRef.current.scrollIntoView({
        behavior: "auto",
        block: "nearest",
        inline: "nearest",
      });
    }
  }, [messageA, messageB]);

  return (
    // Todo: think a better way to handle the height of the container
    <div className="flex flex-col flex-grow justify-between border max-h-[62dvh]">
      <div className="flex flex-col gap-8 py-4 overflow-y-auto">
        {messageA.length <= 2 ? (
          <div className="flex flex-col items-center justify-center h-screen gap-5 text-2xl">
            <Bot size={45} /> 我今天要怎麼幫你呢？
          </div>
        ) : (
          messageA.map((message, index) => {
            return (
              index >= 2 &&
              (message.role === "user" ? (
                <PromptContainer
                  key={index + "prompt"}
                  msgIndex={index}
                  origMessage={message.content}
                  isCompleted={!messageAWaiting}
                  conversationRecordId={conversationRecordIds[0]}
                  conversationRecordIds={conversationRecordIds}
                  setConversationRecordIds={setConversationRecordIds}
                />
              ) : (
                <div className="flex flex-col gap-5 md:flex-row w-full">
                  <CompletionContainer
                    key={index + "completion"}
                    msgIndex={index}
                    origMessage={message.content}
                    isUser={false}
                    isCompleted={!messageAWaiting}
                    conversationRecordId={conversationRecordIds[0]}
                    messages={messageA}
                    isLeft={true}
                  />
                  <CompletionContainer
                    key={index}
                    msgIndex={index}
                    origMessage={messageB[index].content}
                    isUser={false}
                    isCompleted={!messageBWaiting}
                    conversationRecordId={conversationRecordIds[1]}
                    messages={messageB}
                    isLeft={false}
                  />
                </div>
              ))
            );
          })
        )}
        <div ref={messageEndRef} />
      </div>
    </div>
  );
}
