"use client";

import { useState, useRef } from "react";

export default function UploadPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "loading" | "success" | "error" | "error-no-file"
  >("idle");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!fileRef.current?.files?.length) {
      setUploadStatus("error-no-file");
      return;
    }
    const formData = new FormData();
    formData.append("file", fileRef.current.files[0]);
    setUploadStatus("loading");
    try {
      const res = await fetch("/api/dataset/upload", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        fileRef.current.value = "";
        const data = await res.json();
        console.log(data);
        setUploadStatus("success");
      } else {
        setUploadStatus("error");
      }
    } catch (e) {
      console.error(e);
      setUploadStatus("error");
    }
  };

  return (
    <main className="p-5 px-10 md:px-22 fade-in hidden-scrollbar">
      <h1 className="font-bold">上傳資料集</h1>
      <div className="text-md py-2">歡迎貢獻您與 ChatGPT 的對話資料！</div>
      <form
        className="flex flex-col gap-4 py-2 items-start"
        onSubmit={handleSubmit}
        encType="multipart/form-data"
      >
        <input type="file" className="mt-2" accept=".zip" ref={fileRef} />
        <div className="text-sm text-gray-300">請上傳 .zip 格式的檔案。</div>
        <button
          type="submit"
          className={`bg-blue-600 text-md text-center py-2 rounded-xl text-nowrap whitespace-nowrap px-4 ${uploadStatus !== "loading" && "hover:bg-blue-500 active:bg-blue-700 active:scale-95"} ${uploadStatus === "loading" && "bg-gray-400"} transition duration-250`}
          disabled={uploadStatus === "loading"}
        >
          上傳
        </button>
        {uploadStatus === "loading" && (
          <div className="text-sm text-gray-300">上傳中...</div>
        )}
        {uploadStatus === "success" && (
          <div className="text-sm text-green-500">上傳成功！</div>
        )}
        {uploadStatus === "error" && (
          <div className="text-sm text-red-500">上傳失敗，請再試一次。</div>
        )}
        {uploadStatus === "error-no-file" && (
          <div className="text-sm text-red-500">請選擇檔案。</div>
        )}
      </form>
    </main>
  );
}
