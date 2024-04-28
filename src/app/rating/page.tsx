"use client";
import { useRouter } from "next/navigation";
import Column from "./_components/Column";
import { useEffect, useState } from "react";
import { getSession } from "next-auth/react";
import { toast } from "react-toastify";

export default function RatingPage() {
  const contributor = "[contributor name here]";
  const [feedbackText, setFeedbackText] = useState<string>("");
  const [promptRating, setPromptRating] = useState<number | undefined>(); // 1 - 5
  const [completionRating, setCompletionRating] = useState<
    number | undefined
  >(); // 6 - 10 (need to subtract 5 to get 1 - 5 rating)
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

  const fetchRandomRating = async () => {
    const res = await fetch("/api/rating");
    const data = await res.json();

    if (res.status == 404) {
      toast.error("No edited messages!");
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
  };

  useEffect(() => {
    (async () => {
      const session = await getSession();
      if (session?.user?.verified == false) {
        router.push("/login");
      } else if (!session) {
        router.push("/login");
      } else {
        setLoading(false); // Set loading to false when session verified
      }

      await fetchRandomRating();
    })();
  }, [router]);

  if (loading) {
    return <div></div>; //TODO: think of more elegant way
  }
  const handleSkip = () => {};

  const handleSubmit = async () => {
    //console.log("Submit feedback");
    //console.log(feedbackText);
    //console.log(promptRating);
    //console.log(completionRating! - 5);

    if (promptRating === undefined || completionRating === undefined) {
      console.log("Please rate both prompts and completions");
      alert("Please rate both prompts and completions");
      return;
    }

    const res = await fetch("/api/rating", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        rateEditingID: rateEditingID,
        promptEditedScore: promptRating,
        completionEditedScore: completionRating! - 5,
        feedback: feedbackText,
      }),
    });
    const data = await res.json();
    if (!data.success) {
      toast.error("Failed to submit feedback");
      return;
    }

    toast.success("Feedback submitted successfully");
    await fetchRandomRating();
    setFeedbackText("");
    setPromptRating(undefined);
    setCompletionRating(undefined);
  };
  return (
    <div className="p-5 px-44">
      <div className="flex flex-col gap-3">
        <div className="text-4xl font-bold">Review User Feedback</div>
        <div className="text-xl">
          Help rate other users edited prompts and completions.
        </div>
      </div>
      <div className="flex flex-col mt-10">
        <div className="text-2xl">Contributed by: {contributor}</div>
        <div className="flex mt-5 gap-8 p-1">
          <Column
            isPrompt={true}
            original={String(originalPrompt)}
            edited={String(editedPrompt)}
            rating={promptRating}
            setRating={setPromptRating}
          />
          <Column
            isPrompt={false}
            original={String(originalCompletion)}
            edited={String(editedCompletion)}
            rating={completionRating}
            setRating={setCompletionRating}
          />
        </div>
        <div className="flex flex-col gap-3 p-3 mt-10 text-xl w-full">
          <div className="font-semibold">
            <span className="font-normal text-gray-300">(Optional)</span> Why
            did you give this rating?
          </div>
          <textarea
            className="p-3 rounded-lg text-black w-full"
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
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
            Submit Feedback
          </button>
        </div>
      </div>
    </div>
  );
}
