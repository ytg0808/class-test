import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "☀️ 아침 독서 요정 | 초등 독서기록장",
  description: "초등학교 5학년 아침 독서 시간을 위한 재미있고 간편한 온라인 독서기록장 웹앱",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin=""
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css"
        />
      </head>
      <body>
        <div className="mx-auto max-w-6xl px-4 py-6 md:px-6 lg:py-10">
          {children}
        </div>
      </body>
    </html>
  );
}
