"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
export const NewVerificationForm = () => {
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();
  useEffect(() => {
    onSubmit();
  }, []);
  const onSubmit = useCallback(async () => {
    if (success || error) return;

    if (!token) {
      setError("Missing token!");
      return;
    }
    const res = await fetch("/api/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token,
      }),
    });
    if (res.status == 200) {
      router.push("/rating");
    }
  }, [token, success, error]);
  const handleButtonClick = () => {
    onSubmit();
  };

  return (
    <div>
      {/*點擊這個按鈕驗證Email!
          <button onClick={handleButtonClick}>Verify Email</button>*/}
    </div>
  );
};
