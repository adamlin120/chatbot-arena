"use client";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { toast } from "react-toastify";

export default async function ip_test(router: AppRouterInstance) {
  const response = await fetch("https://api.ipify.org?format=json");
  const data = await response.json();
  const { ip } = data;
  console.log("IP address:", ip);
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
