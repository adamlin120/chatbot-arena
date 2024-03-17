"use client";
import Column from "./_components/Column";
import { useState } from "react";

export default function RatingPage() {
  const contributor = "[contributor name here]";
  const [feedbackText, setFeedbackText] = useState<string>("");
  const [promptRating, setPromptRating] = useState<number | undefined>();
  const [completionRating, setCompletionRating] = useState<number | undefined>();

  const handleSkip = () => {

  }

  const handleSubmit = async () => {
    console.log("Submit feedback");
    console.log(feedbackText);
    console.log(promptRating);
    console.log(completionRating);

    if(promptRating === undefined || completionRating === undefined) {
      console.log("Please rate both prompts and completions");
      alert("Please rate both prompts and completions");
      return;
    }
  }
  
  return (
    <div className="p-5 px-44">
      <div className="flex flex-col gap-3">
        <div className="text-4xl font-bold">
          Review User Feedback
        </div>
        <div className="text-xl">
          Help rate other users edited prompts and completions.
        </div>
      </div>
      <div className="flex flex-col mt-10">
        <div className="text-2xl">
          Contributed by: {contributor}
        </div>
        <div className="flex mt-5 gap-8 p-1">
          <Column 
            isPrompt={true}
            original="Original Prompt"
            edited="Edited Prompt"
            rating={promptRating}
            setRating={setPromptRating}
          />
          <Column 
            isPrompt={false}
            original="Original Completion"
            edited="Edited Completion"
            rating={completionRating}
            setRating={setCompletionRating}
          />
        </div>
        <div className="flex flex-col gap-3 p-3 mt-10 text-xl w-full">
          <div className="font-semibold">
            <span className="font-normal text-gray-300">(Optional)</span> Why did you give this rating?
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