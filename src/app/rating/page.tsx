"use client";
import { useRouter } from "next/navigation";
import Column from "./_components/Column";
import { useEffect, useState } from "react";
import { getSession } from "next-auth/react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loading from "./Loading";
import Image from "next/image";
import { User } from "lucide-react";
export const dynamic = "force-dynamic";
export default function RatingPage() {
  const [feedbackText, setFeedbackText] = useState<string>("");
  const [promptRating, setPromptRating] = useState<number | undefined>(); // 1 - 5
  const [completionRating, setCompletionRating] = useState<
    number | undefined
  >();
  // 6 - 10 (need to subtract 5 to get 1 - 5 rating)
  // If we do not use 6 - 10, then the Column component will have the same ID, then there will be some strange bugs.
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [rateEditingID, setRateEditingID] = useState<string | undefined>();
  const [originalPrompt, setOriginalPrompt] = useState<string | undefined>();
  const [originalCompletion, setOriginalCompletion] = useState<
    string | undefined
  >();
  const [editedPrompt, setEditedPrompt] = useState<string | undefined>();
  const [editedCompletion, setEditedCompletion] = useState<
    string | undefined
  >();
  const [contributorName, setContributorName] = useState<string | undefined>();
  const [contributorAvatar, setContributorAvatar] = useState<
    string | undefined
  >();

  const [selected, setSelected] = useState<string>();

  const imageSize = 30;

  const handleColumnClick = (isOriginal: boolean) => {
    if (isOriginal) {
      setSelected("original");
    } else {
      setSelected("edited");
    }
  };

  const fetchRandomRating = async () => {
    const content = document.getElementById("content");
    if (content) {
      content.classList.add("hidden");
    }
    const res = await fetch("/api/rating");
    if (!res.ok) {
      return;
    }
    const data = await res.json();
    setFeedbackText("");
    setPromptRating(undefined);
    setCompletionRating(undefined);
    if (content) {
      content.classList.remove("fade-out-R");
      content.classList.remove("fade-out-L");
      content.classList.remove("hidden");
      content.classList.add("fade-in");
    }

    if (res.status == 404) {
      toast.info(
        "You have rated all available edited prompts and completions!",
      );
      return;
    }

    if (!data || !res.ok) {
      toast.error("Failed to fetch data");
      return;
    }

    setRateEditingID(data.rateEditingID);
    if (
      !data.originalPrompt ||
      !data.originalCompletion ||
      !data.editedPrompt ||
      !data.editedCompletion
    ) {
      toast.error("Loss of data from server. Please try again.");
      return;
    }
    setOriginalPrompt(data.originalPrompt);
    setOriginalCompletion(data.originalCompletion);
    setEditedPrompt(data.editedPrompt);
    setEditedCompletion(data.editedCompletion);
    setContributorName(data.contributorName);
    if (data.contributorAvatar !== null) {
      setContributorAvatar(data.contributorAvatar);
    }
  };

  useEffect(() => {
    (async () => {
      const session = await getSession();
      if (session?.user?.verified == false) {
        router.push("/login");
      } else if (!session) {
        router.push("/login");
      } else {
        await fetchRandomRating();
        setLoading(false);
      }
    })();
  }, [router]);

  if (loading) {
    return <Loading />;
  }

  function fadeOutAndIn(direction: number): void {
    const content = document.getElementById("content");
    if (direction == 1) {
      if (content) {
        content.classList.add("fade-out-R");
        content.classList.remove("fade-in");
        setTimeout(() => {
          fetchRandomRating();
        }, 1000);
      }
    } else {
      if (content) {
        content.classList.add("fade-out-L");
        content.classList.remove("fade-in");
        setTimeout(() => {
          fetchRandomRating();
        }, 1000);
      }
    }
  }

  const handleSkip = async () => {
    fadeOutAndIn(0);
    toast.info("略過此問答紀錄！");
    setSelected(undefined);
  };

  const handleSubmit = async () => {
    //console.log("Submit feedback");
    //console.log(feedbackText);
    //console.log(promptRating);
    //console.log(completionRating! - 5);

    if (selected === undefined) {
      console.log("Please rate prompts & completions");
      toast.error("請選取何者較佳");
      return;
    }
    var originalScore;
    var revisedScore;
    if (selected == "original") {
      originalScore = 5;
      revisedScore = 1;
    } else if (selected == "edited") {
      originalScore = 1;
      revisedScore = 5;
    }
    const res = await fetch("/api/rating", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        rateEditingID: rateEditingID,
        promptEditedScore: revisedScore,
        completionEditedScore: revisedScore,
        feedback: feedbackText,
      }),
    });
    const data = await res.json();
    if (!data.success) {
      toast.error("回饋送出失敗，請再試一次！");
      return;
    }
    toast.success("回饋送出成功，感謝你的幫助！");
    fadeOutAndIn(1);
    setSelected(undefined);
  };

  return (
    <main className="hidden-scrollbar">
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
        className="hidden-scrollbar"
      />
      <div id="content" className="p-5 px-44 fade-in hidden-scrollbar">
        <div className="flex flex-col gap-3">
          <div className="text-3xl font-bold">Review Feedback</div>
          <div className="text-s">
            對其他使用者編輯後的prompts和completions進行評分
          </div>
          <div className="text-xl">
            請點選表現較好的conversation：
          </div>
        </div>
        <div className="flex flex-col mt-10">
          <div className="flex items-center">
            <div className="text-l">Contributor: &nbsp;</div>
            {contributorAvatar &&
              (contributorAvatar === "anonymous.com" ? (
                <User size={imageSize} />
              ) : (
                <Image
                  src={contributorAvatar}
                  alt="Contributor Image"
                  width={imageSize}
                  height={imageSize}
                  className="rounded-full"
                />
              ))}
            <div> &nbsp; {contributorName}</div>
          </div>
          <div className="flex mt-5 gap-8 p-1">
            <Column
              isOriginal={true}
              originalPrompt={String(originalPrompt)}
              originalCompletion={String(originalCompletion)}
              editedPrompt={String(editedPrompt)}
              editedCompletion={String(editedCompletion)}
              rating={promptRating}
              setRating={setPromptRating}
              selected={handleColumnClick}
              isClick={selected === "original"}
            />
            <Column
              isOriginal={false}
              originalPrompt={String(originalPrompt)}
              originalCompletion={String(originalCompletion)}
              editedPrompt={String(editedPrompt)}
              editedCompletion={String(editedCompletion)}
              rating={completionRating}
              setRating={setCompletionRating}
              selected={handleColumnClick}
              isClick={selected === "edited"}
            />
          </div>
          <div className="flex flex-col gap-3 p-3 mt-10 w-full">
            <div className="font-semibold text-xl">
              評分理由 &nbsp;
              <span className="font-normal text-gray-300">(Optional)</span>
            </div>
            <textarea
              className="p-3 rounded-lg text-white w-full text-l bg-[rgb(31,41,55)] border border-white focus:outline-none overflow-auto h-32"
              placeholder="輸入內容..."
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                WebkitOverflowScrolling: "touch",
              }}
            />
          </div>
          <div className="flex gap-4 justify-center mt-5 text-xl w-1/3 mx-auto">
            <button
              className="flex-1 bg-gray-500 hover:bg-gray-600 active:bg-gray-700 text-white font-bold py-2 px-4 rounded-3xl"
              onClick={handleSkip}
            >
              Skip
            </button>
            <button
              className="flex-1 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-bold py-2 px-4 rounded-3xl"
              onClick={handleSubmit}
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
