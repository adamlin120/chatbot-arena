"use client";

export default function Button({ text, onClick, disableCond }: { text: string | JSX.Element; onClick: () => void; disableCond: boolean }) {
  return (
    <button
      className={`bg-sky-900 transform transition duration-500 hover:bg-sky-950 hover:scale-105 active:scale-100 flex items-center gap-2 active:opacity-75 text-white text-lg py-4 rounded-xl ml-2 text-nowrap whitespace-nowrap px-8 ${disableCond ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={onClick}
      disabled={disableCond}
    >
      {text}
    </button>
  );
}