"use client";
import Button from "@/app/_components/Button";
import { useContext, useState } from "react";
import { MessageContext } from "@/context/message";
import { toast } from "react-toastify";

const serverErrorMessage = "伺服器端錯誤，請稍後再試";

export default function FunctionalButtons() {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error("MessageContext is not provided"); // Todo: think an elegant way to handle this
  }
  const {
    messageA,
    messageB,
    setMessageA,
    setMessageB,
    messageAWaiting,
    messageBWaiting,
    conversationRecordIds,
    ratingButtonDisabled,
    setRatingButtonDisabled,
    initiateChat,
  } = context;

  const MIN_RATING_MESSAGE_COUNT = 3;
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

  const [showRule, setShowRule] = useState<boolean>(false);
  const [sendingRating, setSendingRating] = useState<boolean>(false);

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

  const sendRating = async (conversationRecordId: string, rating: number) => {
    setRatingButtonDisabled(true);
    setSendingRating(true);
    if (
      messageA.length < MIN_RATING_MESSAGE_COUNT ||
      messageB.length < MIN_RATING_MESSAGE_COUNT
    ) {
      toast.warn("您與模型的對話還不夠多，請再繼續對話方可送出回饋。");
      setRatingButtonDisabled(false);
      setSendingRating(false);
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

    setSendingRating(false);
    if (response.status === 200) {
      // Use a pop up to show the message that the rating has been submitted, do not use toast
      toast.success("您的回饋已經送出，謝謝！");
      console.log("Rating submitted successfully");
      return;
    } else if (response.status !== 200) {
      toast.error(serverErrorMessage);
      setRatingButtonDisabled(false);
      console.error("Error in response", response);
      return;
    }
  };

  return (
    <div className="flex w-full">
      <div className="flex w-full gap-2 justify-start items-center border-b border-l rounded-bl-lg border-gray-300 p-4">
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
        <div className="flex-grow"></div>
        <h4
          className="underline cursor-pointer"
          onClick={() => setShowRule(true)}
        >
          ⓘ&nbsp;規則
        </h4>
        {showRule && <RuleDialog setShowRule={setShowRule} />}
      </div>
      <div className="w-fit gap-2 justify-center items-center border-r border-b border-l border-gray-300 rounded-br-lg p-4">
        <Button
          text="🔁 重新開始對話"
          onClick={restartChat}
          disableCond={sendingRating || messageAWaiting || messageBWaiting}
        />
      </div>
    </div>
  );
}

function RuleDialog({
  setShowRule,
}: {
  setShowRule: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <div
      className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50"
      onClick={() => setShowRule(false)}
    >
      <div
        className="p-5 rounded-lg w-[80%] max-w-lg bg-[rgb(31,41,55)]"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold">📜 規則</h3>
        <ul className="list-disc list-outside px-6 pt-2 text-indent">
          <li>
            向兩個匿名模型（例如
            GPT-4、ChatGPT、Claude、Gemini-Pro、Mistral-Medium、Taiwan-LLM、Breeze）提問，並為較佳者投票！
          </li>
          <li>您可以持續對話，直到確定贏家。</li>
          <li>如果在對話過程中透露了模型身份，則不計入投票。</li>
          <li>您可以編輯模型出輸出，讓我們的模型有機會做得更好！</li>
        </ul>
        <div className="flex justify-end mt-5">
          <Button
            text="關閉"
            onClick={() => setShowRule(false)}
            disableCond={false}
            className="bg-gray-500 hover:bg-gray-600"
          />
        </div>
      </div>
    </div>
  );
}