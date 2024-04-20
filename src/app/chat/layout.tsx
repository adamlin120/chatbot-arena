import { MessageProvider } from "@/context/message";
export default function ChatLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main>
      <MessageProvider>{children}</MessageProvider>
    </main>
  );
}
