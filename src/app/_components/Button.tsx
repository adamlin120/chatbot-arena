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
  disableCond: boolean;
  className?: string;
}) {
  return (
    <button
      className={cn(`bg-sky-900 transform transition duration-500 hover:bg-sky-950 hover:scale-105 active:scale-100 flex items-center gap-2 active:opacity-75 text-white text-md py-2 rounded-xl ml-2 text-nowrap whitespace-nowrap px-6 ${disableCond ? "opacity-50 cursor-not-allowed" : ""}`, className)}
      onClick={onClick}
      disabled={disableCond}
    >
      {text}
    </button>
  );
}
