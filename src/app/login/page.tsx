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
      if (session?.user?.verified == false) {
        router.push("?error=NotVerified");
      } else if (session) {
        router.push("/rating");
      }
    });
  }, []);
  return (
    <div className="flex h-screen">
      <div className="w-1/2 flex justify-center items-center bg-gray-100">
        <img
          src="/map-and-location.png"
          alt="Food Image"
          className="max-w-xs"
        />
      </div>
      <div className="w-1/2 flex justify-center items-center">
        <div className="w-full max-w-xs">
          <AuthForm error={props.searchParams?.error} />
        </div>
      </div>
    </div>
  );
}
