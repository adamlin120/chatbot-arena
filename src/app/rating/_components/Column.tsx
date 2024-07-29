"use client";
import { useState } from "react";
const jsDiff = require("diff");

type Props = {
  isOriginal: boolean;
  originalPrompt: string;
  editedPrompt: string;
  originalCompletion: string;
  editedCompletion: string;
  rating: number | undefined;
  setRating: React.Dispatch<React.SetStateAction<number | undefined>>;
  selected: (value: boolean) => void;
  isClick: boolean;
};

export default function Column({
  isOriginal,
  originalPrompt,
  originalCompletion,
  editedPrompt,
  editedCompletion,
  selected,
  isClick,
}: Props) {
  const [togglePrompt, setTogglePrompt] = useState(false);
  const [toggleCompletion, setToggleCompletion] = useState(false);
  const handleClick = () => {
    selected(isOriginal);
  };
  function editDistance(str1: string, str2: string): number {
    const m: number = str1.length;
    const n: number = str2.length;

    const dp: number[][] = [];
    for (let i = 0; i <= m; i++) {
      dp[i] = [];
      for (let j = 0; j <= n; j++) {
        if (i === 0) {
          dp[i][j] = j;
        } else if (j === 0) {
          dp[i][j] = i;
        } else if (str1[i - 1] === str2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
        } else {
          dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
        }
      }
    }

    return dp[m][n];
  }
  function disableHTML(htmlString: string) {
    return htmlString
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;")
      .replace(/\n/g, "<br>");
  }

  function highlightDifferences(original: string, modified: string): string {
    const diffResult = jsDiff.diffChars(original, modified);
    let highlightedText = "";

    diffResult.forEach(
      (part: { added?: boolean; removed?: boolean; value: string }) => {
        if (part.added) {
          highlightedText += `<span style="color: green;">${disableHTML(part.value)}</span>`;
        } else if (part.removed) {
          highlightedText += `<span style="color: red;">${disableHTML(part.value)}</span>`;
        } else {
          highlightedText += disableHTML(part.value);
        }
      },
    );

    return highlightedText;
  }

  return (
    <div
      className={`cursor-pointer flex-1 flex flex-col justify-center gap-10 p-3 bg-[rgb(31,41,55)] rounded-lg border ${isClick ? "border-sky-500 border-4" : "border-white border-4"}`}
      onClick={handleClick}
    >
      <div className="bg-[rgb(31,41,55)] text-center font-bold text-2xl rounded-xl p-3 mx-auto mt-4 whitespace-nowrap">
        {isOriginal ? `Original Conversation` : `Revised Conversation`}
      </div>

      <div className="text-left flex flex-col gap-2 px-4">
        <div className="font-semibold text-xl flex justify-between">
          <span>{isOriginal ? `Original Prompt` : `Revised Prompt`}</span>
          {!isOriginal && (
            <label
              className="ml-3 inline-flex align-middle items-center cursor-grabbing focus:outline-none"
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type="checkbox"
                value=""
                checked={togglePrompt}
                onChange={() => setTogglePrompt(!togglePrompt)}
                className="sr-only peer"
                onClick={(e) => e.stopPropagation()}
              />
              <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-400"></div>
              <span className="ms-3 text-lg dark:text-gray-300">
                Show Edits
              </span>
            </label>
          )}
        </div>
        {!isOriginal && togglePrompt && (
          <div
            className="bg-white p-3 rounded-lg text-black resize-none overflow-auto h-32"
            dangerouslySetInnerHTML={{
              __html: highlightDifferences(originalPrompt, editedPrompt),
            }}
            style={{
              wordBreak: "break-word",
              overflowWrap: "break-word",
            }}
            onClick={(e) => e.stopPropagation()}
          />
        )}
        {!isOriginal && !togglePrompt && (
          <textarea
            className="p-3 rounded-lg text-black resize-none overflow-auto h-32 focus:outline-none cursor-auto"
            value={editedPrompt}
            readOnly
            onClick={(e) => e.stopPropagation()}
          />
        )}
        {isOriginal && (
          <textarea
            className="p-3 rounded-lg text-black resize-none overflow-auto h-32 focus:outline-none cursor-auto"
            value={originalPrompt}
            readOnly
            onClick={(e) => e.stopPropagation()}
          />
        )}
        {!isOriginal && (
          <div className="text-l">
            Edit Distance: {editDistance(editedPrompt, originalPrompt)}
          </div>
        )}
        {isOriginal && <div className="text-l">&nbsp;</div>}
      </div>

      <div className="text-left flex flex-col gap-2 px-4">
        <div className="font-semibold text-xl flex justify-between">
          <span>
            {isOriginal ? `Original Completion` : `Revised Completion`}
          </span>
          {!isOriginal && (
            <label
              className="ml-3 inline-flex align-middle items-center cursor-grabbing focus:outline-none"
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type="checkbox"
                value=""
                checked={toggleCompletion}
                onChange={() => setToggleCompletion(!toggleCompletion)}
                className="sr-only peer"
              />
              <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-400"></div>
              <span className="ms-3 text-lg dark:text-gray-300">
                Show Edits
              </span>
            </label>
          )}
        </div>
        {!isOriginal && toggleCompletion && (
          <div
            className="bg-white p-3 rounded-lg text-black resize-none overflow-auto h-32"
            dangerouslySetInnerHTML={{
              __html: highlightDifferences(
                originalCompletion,
                editedCompletion,
              ),
            }}
            style={{
              wordBreak: "break-word",
              overflowWrap: "break-word",
            }}
            onClick={(e) => e.stopPropagation()}
          />
        )}
        {!isOriginal && !toggleCompletion && (
          <textarea
            className="p-3 rounded-lg text-black resize-none overflow-auto h-32 focus:outline-none cursor-auto"
            value={editedCompletion}
            readOnly
            onClick={(e) => e.stopPropagation()}
          />
        )}
        {isOriginal && (
          <textarea
            className="p-3 rounded-lg text-black resize-none overflow-auto h-32 focus:outline-none cursor-auto"
            value={originalCompletion}
            readOnly
            onClick={(e) => e.stopPropagation()}
          />
        )}
        {!isOriginal && (
          <div className="text-l">
            Edit Distance: {editDistance(editedCompletion, originalCompletion)}
          </div>
        )}
        {isOriginal && <div className="text-l">&nbsp;</div>}
      </div>

      <div className="text-left flex flex-col gap-2 px-4">
        {/*<div className="font-semibold">
          <span className="text-m text-red-400 font-normal">*必填</span> <br />
          <p className="text-l">
            Is the edited {type.toLowerCase().slice(0, -1)} an improvement over
            the original?
          </p>
        </div>
        <div className="flex flex-col gap-1 text-l">
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
                {feedback.id - (isOriginal ? 0 : 5)} - {feedback.text}
              </label>
            </div>
          ))
        </div>*/}
        <div></div>
        <div></div>
      </div>
    </div>
  );
}
