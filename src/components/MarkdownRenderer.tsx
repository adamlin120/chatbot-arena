"use client";
import { useState } from "react";
import Markdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/cjs/styles/prism";
import "katex/dist/katex.min.css";
import { Check, Copy } from "lucide-react";

// Reference: https://hannadrehman.com/blog/enhancing-your-react-markdown-experience-with-syntax-highlighting

export default function MarkdownRenderer({ children }: { children: string }) {
  const [justCopied, setJustCopied] = useState(false);
  return (
    <Markdown
      remarkPlugins={[remarkMath, remarkGfm]}
      rehypePlugins={[rehypeKatex, rehypeRaw]}
      components={{
        code({ className, children, ...props }: any) {
          const match = /language-(\w+)/.exec(className || "");
          const language = match
            ? match[1]
            : children && children.includes("\n")
              ? "text"
              : undefined;
          // Note: inline props is removed accoding to the latest version of react-markdown. I do not know how to distinguish inline code and block code. Currently, I use '\n' to distinguish them.
          // Some models will not give me the language

          return language ? (
            <div className="w-full">
              <div className="flex justify-between border py-2 px-4 border-b-0 rounded-t-xl border-gray-700 bg-gray-700 font-sans">
                {language === "text" ? "code" : language}
                <button
                  className={`p-1 self-end rounded-xl ${!justCopied && "hover:bg-gray-600 active:scale-90"} transition-colors duration-200 ease-in-out`}
                  onClick={() => {
                    navigator.clipboard.writeText(children);
                    setJustCopied(true);
                    setTimeout(() => setJustCopied(false), 2000); // Reset after 3 seconds
                  }}
                  title={"複製程式碼"}
                  disabled={justCopied}
                >
                  {justCopied ? <Check size={20} /> : <Copy size={20} />}
                </button>
              </div>
              <SyntaxHighlighter
                style={dracula}
                PreTag="div"
                language={language}
                {...props}
                customStyle={{
                  overflowX: "auto",
                  maxWidth: "100%",
                  marginTop: 0,
                }}
              >
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            </div>
          ) : (
            <>
              <code
                className={className}
                {...props}
                style={{
                  overflowX: "auto",
                  maxWidth: "100%",
                }}
              >
                {children}
              </code>
            </>
          );
        },
      }}
    >
      {children.replace(/\\\[/g, "$").replace(/\\\]/g, "$")}
    </Markdown>
  );
}
