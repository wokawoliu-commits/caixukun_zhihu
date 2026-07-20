import type { Metadata } from "next";
import Dashboard from "./Dashboard";

export const metadata: Metadata = {
  title: "京学龄｜北京入学人口数据观察",
  description:
    "北京市、西城区、朝阳区小学、初中、高中招生与高考、本科线人数的官方数据观察站。",
};

export default function Home() {
  return <Dashboard />;
}
