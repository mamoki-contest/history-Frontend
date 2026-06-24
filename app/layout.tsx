import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "역사 고증 검색",
  description:
    "현대어로 물어보면 국역 사료에서 맥락이 같은 근거를 찾아 출처와 함께 답해주는 멀티턴 대화형 고증 검색.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
