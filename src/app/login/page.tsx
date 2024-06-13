"use client";
import AuthForm from "../_components/AuthForm";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "next-auth/react";

type Props = {
  searchParams?: Record<"error", string>;
};

export default function LoginPage(props: Props) {
  const router = useRouter();
  useEffect(() => {
    getSession().then((session) => {
      /*if (session?.user?.verified == false) {
                router.push('?error=NotVerified');
            }
            else */ if (session) {
        router.push("/chat");
      }
    });
  }, []);
  return (
    <div className="flex md:h-[90dvh] md:overflow-y-scroll fade-in">
      <div className="hidden w-1/2 md:flex justify-center items-center bg-gray-100 flyInFromTop">
        <img src="/llama.jpg" alt="Arena Image" className="w-full h-full" />
      </div>
      <div className="md:w-1/2 w-full flex justify-center items-center overflow-hidden flyInFromBottom">
        <div className="w-full max-w-xs items-center">
          <AuthForm error={props.searchParams?.error} />
        </div>
      </div>
    </div>
  );
}
