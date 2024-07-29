"use client";

import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function UploadPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);

  const clientError = () => (
    <div>
      您上傳的壓縮檔格式錯誤！
      <br />
      請確認您上傳的是正確的檔案。
    </div>
  );
  const clientNoFileError = "請選擇檔案";
  const serverDBError = "儲存對話時發生錯誤，請稍後再試";
  const serverStatusError = "伺服器錯誤，請稍後再試";
  const serverUnknownError = "上傳失敗，請稍後再試";
  const successMessage = "上傳成功，感謝您的貢獻！";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!fileRef.current?.files?.length) {
      toast.error(clientNoFileError);
      return;
    }
    const formData = new FormData();
    formData.append("file", fileRef.current.files[0]);
    setIsLoading(true);
    setProgress(0);
    try {
      const response = await fetch("/api/dataset/upload", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const status = response.status;
        if (status === 400) {
          toast.error(clientError);
        } else if (status === 500) {
          toast.error(serverStatusError);
        }
        setIsLoading(false);
        return;
      }
      const reader = response.body?.getReader();
      if (!reader) throw new Error("Unable to read response");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = new TextDecoder().decode(value);
        const lines = text.split("\n\n");
        const events = lines
          .map((line) => line.replace(/^data: /, ""))
          .filter((line) => line.trim() !== "")
          .map((line) => JSON.parse(line));

        for (const event of events) {
          if (event.error) {
            setIsLoading(false);
            if (event.error === "Invalid file content") {
              toast.error(clientError);
            } else if (event.error === "Failed to save conversation") {
              toast.error(serverDBError);
            } else if (event.error === "Unauthorized") {
              toast.error("請先登入!");
              router.push("/login");
            } else {
              toast.error(serverUnknownError);
            }
          } else if (event.progress) {
            setProgress(event.progress);
          }

          if (event.complete) {
            toast.success(successMessage);
            setIsLoading(false);
            setProgress(0);
            if (fileRef.current) {
              fileRef.current.value = "";
            }
          }
        }
      }
    } catch (e) {
      toast.error(serverUnknownError);
      setIsLoading(false);
    }
  };

  return (
    <main className="p-5 md:px-22 fade-in hidden-scrollbar">
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable
        pauseOnHover
        theme="light"
      />
      <h1 className="font-bold">上傳資料集</h1>
      <div className="text-md py-2">歡迎貢獻您與 ChatGPT 的對話資料！</div>
      <form
        className="flex flex-col gap-4 py-2 items-start"
        onSubmit={handleSubmit}
        encType="multipart/form-data"
      >
        <input type="file" className="mt-2" accept=".zip" ref={fileRef} />
        <div className="text-sm text-gray-300">
          請上傳從 OpenAI 帳戶所匯出的 .zip 格式的檔案。
        </div>
        <button
          type="submit"
          className={`bg-blue-600 text-md text-center py-2 rounded-xl text-nowrap whitespace-nowrap px-4 ${!isLoading && "hover:bg-blue-500 active:bg-blue-700 active:scale-95"} ${isLoading && "bg-gray-400"} transition duration-250`}
          disabled={isLoading}
        >
          上傳
        </button>
        {isLoading && (
          <div className="text-sm text-gray-300">上傳中... {progress}%</div>
        )}
      </form>
    </main>
  );
}
