import { useContext, useEffect, useRef, useState } from "react";
import CompletionContainer from "./CompletionContainer";
import { MessageContext } from "@/context/message";
import PromptContainer from "./PromptContainer";
import { Bot, ArrowDown } from "lucide-react";

export default function MessageSection() {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error("MessageContext is not provided");
  }
  const {
    messageA,
    messageB,
    setMessageA,
    setMessageB,
    messageAWaiting,
    messageBWaiting,
    justSent,
    setJustSent,
    conversationRecordIds,
  } = context;

  const messageEndRef = useRef<HTMLDivElement | null>(null);
  const messageContainerRef = useRef<HTMLDivElement | null>(null);
  const scrollToBottomButtonRef = useRef<HTMLButtonElement | null>(null);

  const [showButton, setShowButton] = useState<boolean>(false);
  const AUTO_SCROLL_THRESHOLD = 100;
  const SHOW_BUTTON_THRESHOLD = 100;

  // Scroll to the bottom of the chat
  // Use block: "nearest" to get a better UX. (https://developer.mozilla.org/zh-CN/docs/Web/API/Element/scrollIntoView)
  useEffect(() => {
    if (
      messageEndRef.current &&
      messageA.length > 2 &&
      messageB.length > 2 &&
      (messageAWaiting || messageBWaiting) &&
      messageContainerRef.current
    ) {
      const h =
        messageContainerRef.current?.scrollHeight -
        messageContainerRef.current?.scrollTop -
        messageContainerRef.current?.clientHeight;

      if (h < AUTO_SCROLL_THRESHOLD || justSent) {
        // 100 is experimentally determined.
        if (justSent) {
          setJustSent(false);
        }
        messageEndRef.current.scrollIntoView({
          behavior: "auto",
          block: "nearest",
          inline: "nearest",
        });
      } else {
        scrollToBottomButtonRef.current?.style.setProperty("display", "block");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messageA, messageB, messageAWaiting, messageBWaiting, justSent]);

  // Check message length is equal
  useEffect(() => {
    if (messageA.length !== messageB.length) {
      const minLength = Math.min(messageA.length, messageB.length);
      setMessageA(messageA.slice(0, minLength));
      setMessageB(messageB.slice(0, minLength));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messageA, messageB]);

  const checkScroll = () => {
    const messageContainer = messageContainerRef.current;
    if (!messageContainer) return;

    if (
      messageContainer.scrollHeight -
        messageContainer.scrollTop -
        messageContainer.clientHeight >
      SHOW_BUTTON_THRESHOLD
    ) {
      setShowButton(true);
    } else {
      setShowButton(false);
    }
  };

  return (
    <div className="relative flex flex-col flex-grow justify-between border h-[50dvh] w-full">
      <div
        className="relative flex flex-col flex-grow gap-8 py-4 overflow-y-auto w-full"
        ref={messageContainerRef}
        onScroll={checkScroll}
      >
        {messageA.length <= 2 ? (
          <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 flex flex-col items-center justify-center  gap-5 text-2xl">
            <Bot size={45} /> 我今天要怎麼幫你呢？
          </div>
        ) : (
          messageA.map((message, index) => {
            return (
              index >= 2 &&
              (message.role === "user" ? (
                <PromptContainer
                  key={index}
                  msgIndex={index}
                  isCompleted={!messageAWaiting && !messageBWaiting}
                />
              ) : (
                <div
                  className="flex flex-col gap-5 md:flex-row w-full"
                  key={index}
                >
                  <CompletionContainer
                    msgIndex={index}
                    origMessage={message.content}
                    isCompleted={!messageAWaiting}
                    conversationRecordId={conversationRecordIds[0]}
                    messages={messageA}
                    isLeft={true}
                  />
                  {messageB[index] && (
                    <CompletionContainer
                      key={index}
                      msgIndex={index}
                      origMessage={messageB[index].content}
                      isCompleted={!messageBWaiting}
                      conversationRecordId={conversationRecordIds[1]}
                      messages={messageB}
                      isLeft={false}
                    />
                  )}
                </div>
              ))
            );
          })
        )}
        <div ref={messageEndRef} />
      </div>
      {showButton && messageA.length > 2 && (
        <button
          className="absolute bottom-9 right-1/2 translate-x-1/2 z-10 p-1.5 rounded-full bg-gray-100 hover:bg-gray-300 hover:scale-105 ease-in-out transition-transform duration-300"
          ref={scrollToBottomButtonRef}
          onClick={() => {
            messageEndRef.current?.scrollIntoView({
              behavior: "smooth",
              block: "nearest",
              inline: "nearest",
            });
          }}
        >
          <ArrowDown size={25} color="black" />
        </button>
      )}
    </div>
  );
}
