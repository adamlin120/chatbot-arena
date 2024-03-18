import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import Header from "./_components/Header";
import { SessionProvider } from "next-auth/react";

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
      <body className={inter.className}>
        
        <Header /> 
        <div className="h-screen pt-20 overflow-y-scroll">
          {children}
        </div>
      </body>
      </SessionProvider>
    </html>
  );
}
