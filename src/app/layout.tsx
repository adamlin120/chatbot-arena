import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import Header from "./_components/Header";
import { SessionProvider } from "next-auth/react";
import SideBar from "./_components/SideBar";

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
  return (
    <html lang="en">
      <SessionProvider>
        <body className={inter.className + " flex flex-col min-h-screen"}>
          {/* <Header /> */}
          <SideBar />
          <div className="h-full mt-5 ml-16 mb-10">{children}</div>
          <Footer />
        </body>
      </SessionProvider>
    </html>
  );
}

function Footer() {
  return (
    <footer className="w-full h-12 flex flex-col justify-center items-center mt-auto pl-20 mb-5">
      <p className="text-gray-500">© Taiwan LLM Chatbot Area</p>
      {/* Some content */}
    </footer>
  );
}
