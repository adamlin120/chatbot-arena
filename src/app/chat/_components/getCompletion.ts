import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { toast } from "react-toastify";
import { Message } from "@/lib/types/db";

export const serverErrorMessage = "伺服器端錯誤，請稍後再試";
const MAX_TOKENS = 2048;

export async function getCompletion(
  apiPath: string,
  router: AppRouterInstance,
  newMessages: Message[],
  conversationRecordId: String,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  setMessageWaiting: React.Dispatch<React.SetStateAction<boolean>>,
  setRatingButtonDisabled: React.Dispatch<React.SetStateAction<boolean>>,
  setStopStreaming: React.Dispatch<React.SetStateAction<boolean>>,
  stopStreamingRef: React.MutableRefObject<boolean>,
  currPrompt: string,
  promptInputRef?: React.MutableRefObject<HTMLTextAreaElement | null>,
) {
  // Abort the request if it takes too long (currently 10 second)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  const response = await fetch(apiPath, {
    method: "POST",
    body: JSON.stringify({
      messages: newMessages.slice(0, newMessages.length - 1),
      conversationRecordId: conversationRecordId,
    }),
    signal: controller.signal,
  })
    .then((res) => {
      if (!res.ok) {
        toast.error("伺服器沒有回應，請稍後再試");
        setStopStreaming(true);
        setMessageWaiting(false);
        setMessages((messages) => {
          return messages.slice(0, messages.length - 2);
        });
        if (promptInputRef && promptInputRef.current) {
          promptInputRef.current.value = currPrompt;
        }
        return;
      }
      return res;
    })
    .catch((error) => {
      if (error.name === "AbortError") {
        // This may due to LLM api error
        console.error("Request timed out");
        toast.error("伺服器沒有回應，請稍後再試");
      } else {
        console.error("Error processing messages:", error);
        toast.error(serverErrorMessage);
      }
      setStopStreaming(true);
      setMessageWaiting(false);
      setMessages((messages) => {
        return messages.slice(0, messages.length - 2);
      });
      if (promptInputRef && promptInputRef.current) {
        promptInputRef.current.value = currPrompt;
      }
      return;
    })
    .finally(() => clearTimeout(timeoutId));

  if (!response || !response.body) {
    return;
  } else if (response.status === 429) {
    toast.info("喜歡這個GPT測試嗎？立刻註冊！");
    setTimeout(() => {
      router.push("/login");
    }, 3000);
    return;
  } else if (response.status !== 200) {
    toast.error(serverErrorMessage);
    return;
  }

  function fluent(ms: number | undefined) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let count = 0;
  let buffer = "";
  setRatingButtonDisabled(true);
  while (count < MAX_TOKENS) {
    const { value, done } = await reader.read();
    if (done) break;
    if (stopStreamingRef.current) {
      reader.cancel();
      break;
    }
    const text = decoder.decode(value);
    buffer += text;
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
    await fluent(50);
  }
  setRatingButtonDisabled(false);
  setMessageWaiting(false);
}
