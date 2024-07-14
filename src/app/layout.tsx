import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { SessionProvider } from "next-auth/react";
import SideBar from "./_components/SideBar";
import { Suspense } from "react";
import HeaderSubtitle from "./_components/HeaderSubtitle";

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
        <body className={inter.className + "flex flex-col"}>
          <div className="flex flex-col md:min-h-screen flex-grow">
            <Suspense>
              <HeaderSubtitle />
            </Suspense>
            <div className="md:h-full mt-5 mb-16 md:mb-0 md:ml-16">
              {children}
            </div>
          </div>
          <Suspense>
            <SideBar />
          </Suspense>
          {/* <Footer /> */}
        </body>
      </SessionProvider>
    </html>
  );
}
