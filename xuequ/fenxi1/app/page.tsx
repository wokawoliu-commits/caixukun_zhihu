import type { Metadata } from "next";
import ComparisonDashboard from "./ComparisonDashboard";

export const metadata: Metadata = {
  title: "京学龄·差异审计｜官方招生数与8篇文章对比",
  description: "逐项核验北京市、西城区、朝阳区官方招生数据与8篇中招文章的分子、分母、时点和计算差异。",
};

export default function Home() {
  return <ComparisonDashboard />;
}
