"use client";

import { signIn } from "next-auth/react";
import { FaGoogle, FaGithub } from "react-icons/fa";
import { Suspense } from "react";
import "react-toastify/dist/ReactToastify.css";
import { useSearchParams } from "next/navigation";

function AuthForm() {
  const handleGoogleSignIn = () => {
    signIn("google", {
      callbackUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/chat`,
    });
  };

  const handleGithubSignIn = () => {
    signIn("github", {
      callbackUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/chat`,
    });
  };

  const handleGoogleSignInChromeExtension = () => {
    signIn("google", {
      callbackUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/close`,
    });
  };

  const handleGithubSignInChromeExtension = () => {
    signIn("github", {
      callbackUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/close`,
    });
  };

  const isChromeExtension = useSearchParams().get("chromeExtension") === "true";

  return (
    <div className="min-w-[300px] bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-end"></div>
      <div className="mb-4 text-2xl font-semibold text-center text-black">
      </div>
      <Suspense>
        {isChromeExtension && (
          <div className="bg-blue-100 text-blue-600 text-center p-2">
            請先登入！登入後，重新打開 Chrome 擴充功能即可使用！
          </div>
        )}
        <div className="mt-6">
          <button
            type="button"
            className="w-full flex items-center justify-center bg-red-500 hover:bg-red-600 text-white py-2 rounded-md"
            onClick={
              isChromeExtension
                ? handleGoogleSignInChromeExtension
                : handleGoogleSignIn
            }
          >
            <FaGoogle className="h-10 w-10" />
            &nbsp; 使用 Google 帳號登入
          </button>
        </div>

        <div className="mt-6">
          <button
            type="button"
            className="w-full flex items-center justify-center bg-gray-700 hover:bg-gray-800 text-white py-2 rounded-md"
            onClick={
              isChromeExtension
                ? handleGithubSignInChromeExtension
                : handleGithubSignIn
            }
          >
            <FaGithub className="h-10 w-10" />
            &nbsp; 使用 Github 帳號登入
          </button>
          <div className="mt-6 text-sm text-gray-500">
            <span>
              登入即表示您同意我們的{" "}
              <a
                href="/privacy.txt"
                target="_blank"
                rel="noreferrer"
                className="text-blue-500 hover:underline"
              >
                隱私權政策
              </a>
              以及我們的{" "}
              <a
                href="/user_agreement.txt"
                target="_blank"
                rel="noreferrer"
                className="text-blue-500 hover:underline"
              >
                用戶同意書
              </a>
            </span>
          </div>
        </div>
      </Suspense>
    </div>
  );
}

export default AuthForm;
