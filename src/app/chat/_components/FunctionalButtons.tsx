"use client";
import Button from "@/components/Button";
import { useContext, useState } from "react";
import { MessageContext } from "@/context/message";
import { toast } from "react-toastify";
import { serverErrorMessage } from "./getCompletion";

export default function FunctionalButtons() {
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
    setMessageAWaiting,
    setMessageBWaiting,
    conversationRecordIds,
    setConversationRecordIds,
    ratingButtonDisabled,
    setRatingButtonDisabled,
    setModelAName,
    setModelBName,
    setRated,
    DEFAULT_MODEL_NAME,
    origMessage,
  } = context;

  const MIN_RATING_MESSAGE_COUNT = 3;
  const ratingButtonAttributes = [
    {
      text: "👈  A表現較佳",
      onClick: () =>
        sendRating(conversationRecordIds[0], conversationRecordIds[1], 1),
    },
    {
      text: "👉  B表現較佳",
      onClick: () =>
        sendRating(conversationRecordIds[1], conversationRecordIds[0], 1),
    },
    {
      text: "🤝  平手",
      onClick: () =>
        sendRating(conversationRecordIds[0], conversationRecordIds[1], 2),
    },
    {
      text: "👎  兩者皆差",
      onClick: () =>
        sendRating(conversationRecordIds[0], conversationRecordIds[1], 0),
    },
  ];

  const [showRule, setShowRule] = useState<boolean>(false);
  const [sendingRating, setSendingRating] = useState<boolean>(false);

  const restartChat = () => {
    setRated(false);
    setRatingButtonDisabled(false);
    if (messageA.length <= 2 && messageB.length <= 2) {
      return;
    }
    setMessageA(origMessage);
    setMessageB(origMessage);
    setConversationRecordIds([]);
    setModelAName(DEFAULT_MODEL_NAME);
    setModelBName(DEFAULT_MODEL_NAME);
    setRatingButtonDisabled(false);
    setMessageAWaiting(false);
    setMessageBWaiting(false);
  };

  const sendRating = async (
    conversationRecordId: string,
    siblingRecordId: string,
    rating: number,
  ) => {
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
        siblingRecordId: siblingRecordId,
      }),
    });

    setSendingRating(false);
    if (response.status === 200) {
      toast.success(
        "您的回饋已經送出，謝謝！\n歡迎修改模型輸出，讓我們的模型有機會做得更好",
        {
          className: "whitespace-pre-line",
        },
      );
      setRated(true);
      // read the model names from the response
      const responseData = await response.json();
      const modelA = responseData.find(
        (item: { conversationRecordId: string }) =>
          item.conversationRecordId === conversationRecordIds[0],
      );
      if (modelA) {
        setModelAName(modelA.model);
      }
      const modelB = responseData.find(
        (item: { conversationRecordId: string }) =>
          item.conversationRecordId === conversationRecordIds[1],
      );
      if (modelB) {
        setModelBName(modelB.model);
      }
      return;
    } else if (response.status !== 200) {
      toast.error(serverErrorMessage);
      setRatingButtonDisabled(false);
      console.error("Error in response", response);
      return;
    }
  };

  return (
    <div className="flex flex-col md:flex-row w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 w-full gap-2 justify-start items-center border-b border-l border-r md:border-r-0 md:rounded-bl-lg border-gray-300 p-4">
        {ratingButtonAttributes.map((buttonAttribute, index) => (
          <Button
            key={index}
            text={buttonAttribute.text}
            onClick={buttonAttribute.onClick}
            disableCond={
              ratingButtonDisabled || messageAWaiting || messageBWaiting
            }
            className="justify-center"
          />
        ))}
        {/* <div className="flex-grow"></div> */}
        <h4
          className="underline cursor-help ml-5 w-fit"
          onClick={() => setShowRule(true)}
        >
          ⓘ&nbsp;規則
        </h4>
        {showRule && <RuleDialog setShowRule={setShowRule} />}
      </div>
      <div className="md:w-fit rounded-bl-lg md:rounded-bl-none flex gap-2 justify-center items-center border-r border-b border-l border-gray-300 rounded-br-lg p-4">
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
          <li>
            確定贏家並評分後，您可以編輯模型的輸出以及您的輸入，讓我們的模型有機會做得更好！
          </li>
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
