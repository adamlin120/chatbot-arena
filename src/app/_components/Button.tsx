"use client";

import { cn } from "@/lib/utils/shadcn";

export default function Button({
  text,
  onClick,
  disableCond,
  className = "",
}: {
  text: string | JSX.Element;
  onClick: () => void;
  disableCond?: boolean;
  className?: string;
}) {
  return (
    <button
      className={cn(
        `bg-gray-600 text-white transform transition duration-500 flex items-center gap-2 text-md py-2 rounded-xl ml-2 text-nowrap whitespace-nowrap px-6 ${disableCond ? "opacity-50 cursor-not-allowed" : "active:opacity-75 hover:scale-105 active:scale-100 hover:bg-gray-700"}`,
        className,
      )}
      onClick={onClick}
      disabled={disableCond}
    >
      {text}
    </button>
  );
}
