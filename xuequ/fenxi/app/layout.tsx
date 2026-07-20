import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "京学龄｜北京入学人口数据观察",
  description: "可追溯、分口径的北京教育人口数据观察站。",
  openGraph: {
    title: "京学龄｜北京入学人口数据观察",
    description: "北京市、西城区、朝阳区教育人口的可追溯数据账本。",
    type: "website",
    locale: "zh_CN",
    images: [
      {
        url: "/og-education-observatory.png",
        width: 1731,
        height: 909,
        alt: "三组教育人口数据流通过统计刻度的抽象图像",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "京学龄｜北京入学人口数据观察",
    description: "北京市、西城区、朝阳区教育人口的可追溯数据账本。",
    images: ["/og-education-observatory.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
