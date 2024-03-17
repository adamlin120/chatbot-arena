import Link from "next/link";

export default function Header() {
  return (
    <>
      <header className="fixed top-0 w-full h-20 z-50 flex items-center gap-1 py-3 px-2 border-b-2 border-white bg-[rgb(50,50,50)]">
        <Link className="p-2 rounded-xl text-2xl" href="/">
          [Website image] Taiwan Chatbot Arena
        </Link>
        <div className="flex-grow">{/* any other things */}</div>
        <div className="text-2xl p-7">LeaderBoard</div>
      </header>
    </>
  );
}