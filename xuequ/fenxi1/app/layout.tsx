import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "京学龄·差异审计｜官方招生数与8篇文章对比",
  description: "把官方实招、文章计划数、普高率和网传录取线放回各自口径逐项核验。",
  openGraph: {
    title: "京学龄·差异审计",
    description: "为什么同一届学生会出现57.8%、80.8%和92%三个答案？",
    type: "website",
    locale: "zh_CN",
    images: [
      {
        url: "/og.png",
        width: 1731,
        height: 909,
        alt: "京学龄差异审计：57.8%、80.8%与92%的数据对比",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "京学龄·差异审计",
    description: "官方招生数 × 8篇文章：逐项标注分子、分母、时点和算术差异。",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
