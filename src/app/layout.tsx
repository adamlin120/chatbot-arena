import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { SessionProvider } from "next-auth/react";
import SideBar from "./_components/SideBar";
import Link from "next/link";
// import { headers } from "next/headers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Chatbot Arena",
  description: "The description of Chatbot Arena",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // const headerList = headers();
  // const pathNames = headerList.get("referer");
  // const currentPath = pathNames?.split("/")[3];
  // const subtitle: { [key: string]: string } = {
  //   chat: "語言模型競技場 ⚔️",
  //   rating: "模型評分區 👍👎",
  //   dataset: "對話資料集 📚",
  //   leaderboard: "模型排行榜 🏆",
  //   profile: "個人頁面",
  // };
  
  return (
    <html lang="en">
      <SessionProvider>
        <body className={inter.className + "flex flex-col"}>
          {/* <Header /> */}
          
          
          <div className="flex flex-col md:min-h-screen flex-grow">
            <Link
              href="/"
              className="text-2xl ml-[4rem] mt-6 font-semibold text-nowrap"
            >            
              LLM Arena
              {/* <span className="text-xl">
                {currentPath && subtitle[currentPath]
                  ? ` - ${subtitle[currentPath]}`
                  : ""}
              </span> */}
            </Link>
            <div className="md:h-full mt-5 mb-16 md:mb-0 md:ml-16">{children}</div>
          </div>
          <SideBar />
          {/* <Footer /> */}
        </body>
      </SessionProvider>
    </html>
  );
}

// Todo: There are some css issue with footer. Fix it if we need footer; otherwise remove it.

// function Footer() {
//   return (
//     <footer className="w-full h-12 flex flex-col justify-center items-center mt-auto pl-20 mb-5">
//       <p className="text-gray-500">© Taiwan LLM Chatbot Area</p>
//       {/* Some content */}
//     </footer>
//   );
// }
