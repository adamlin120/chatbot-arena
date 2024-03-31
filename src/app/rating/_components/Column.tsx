"use client";
import { useState } from "react";

type Props = {
  isPrompt: boolean;
  original: string;
  edited: string;
  rating: number | undefined;
  setRating: (rating: number) => void;
};

export default function Column({
  isPrompt,
  original,
  edited,
  rating,
  setRating,
}: Props) {
  const feedbackDescription = [
    {
      id: 1 + (isPrompt ? 0 : 5),
      text: "Much worse than Original",
    },
    {
      id: 2 + (isPrompt ? 0 : 5),
      text: "Worse than Original",
    },
    {
      id: 3 + (isPrompt ? 0 : 5),
      text: "No noticeable difference compared to the original",
    },
    {
      id: 4 + (isPrompt ? 0 : 5),
      text: "Better than Original",
    },
    {
      id: 5 + (isPrompt ? 0 : 5),
      text: "Much better than Original",
    },
  ];

  const [toggle, setToggle] = useState(false);

  const type = isPrompt ? "Prompts" : "Completions";
  return (
    <div className="flex-1 flex flex-col justify-center gap-10 p-3 bg-gray-600 rounded-lg text-xl">
      <div className="bg-gray-400 text-center font-bold text-3xl rounded-xl p-3 w-1/2 mx-auto mt-4">
        Step {isPrompt ? `1: ${type}` : `2: ${type}`}
      </div>

      <div className="text-left flex flex-col gap-2 px-4">
        <div className="font-semibold text-xl">Read the Original {type}</div>
        <textarea
          className="p-3 rounded-lg text-black"
          value={original}
          readOnly
        />
      </div>

      <div className="text-left flex flex-col gap-2 px-4">
        <div className="font-semibold text-xl">
          Read the Edited {type}
          {/* TODO: Below is the "Show edits" button. The highlighting of differences has not been done. */}
          <label className="ml-3 inline-flex align-middle items-center cursor-pointer">
            <input
              type="checkbox"
              value=""
              checked={toggle}
              onChange={() => setToggle(!toggle)}
              className="sr-only peer"
            />
            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-400"></div>
            <span className="ms-3 text-lg dark:text-gray-300">Show Edits</span>
          </label>
        </div>
        <textarea
          className="p-3 rounded-lg text-black"
          value={edited}
          readOnly
        />

        <div>Edit Distance [{type}]: [TODO]</div>
      </div>

      <div className="text-left flex flex-col gap-2 px-4">
        <div className="font-semibold text-xl">
          <span className="text-red-400 font-normal">*Required </span> <br />
          Is the edited {type.toLowerCase().slice(0, -1)} an improvement over
          the original?
        </div>
        <div className="flex flex-col gap-1">
          {feedbackDescription.map((feedback) => (
            <div className="flex gap-2" key={feedback.id}>
              <input
                type="radio"
                id={feedback.id.toString()}
                value={feedback.text}
                checked={rating === feedback.id}
                onChange={() => {
                  setRating(feedback.id);
                }}
              />
              <label htmlFor={feedback.id.toString()}>
                {feedback.id - (isPrompt ? 0 : 5)} - {feedback.text}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
