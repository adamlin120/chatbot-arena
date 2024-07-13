"use client";
import AuthForm from "../_components/AuthForm";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();
  useEffect(() => {
    getSession().then((session) => {
      if (session) {
        router.push("/chat");
      }
    });
  }, [router]);
  return (
    <div className="flex md:h-[90dvh] md:overflow-y-scroll fade-in">
      <div className="hidden w-1/2 md:flex justify-center items-center bg-gray-100 flyInFromTop">
        <img src="/llama.jpg" alt="Arena Image" className="w-full h-full" />
      </div>
      <div className="md:w-1/2 w-full flex justify-center items-center overflow-hidden flyInFromBottom">
        <div className="w-full max-w-xs items-center">
          <AuthForm/>
        </div>
      </div>
    </div>
  );
}
