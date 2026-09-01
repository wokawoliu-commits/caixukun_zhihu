import { readFileSync, writeFileSync } from "node:fs";

const markdownPath = new URL("./SNACKPAPER_张月_合作拍摄与营销方案.md", import.meta.url);
const artifactPath = new URL("./artifact.json", import.meta.url);
const markdown = readFileSync(markdownPath, "utf8").trim();

const sections = markdown.split(/\n(?=## )/u);
const blocks = [];
sections.forEach((body, index) => {
  blocks.push({
    id: `section_${String(index + 1).padStart(2, "0")}`,
    type: "markdown",
    body,
  });
  if (body.startsWith("## Recommendations")) {
    blocks.push({ id: "budget_chart_block", type: "chart", chartId: "budget_allocation" });
  }
});

const bibliography = markdown.split("## Bibliography", 2)[1]?.split("## Appendix:", 1)[0] ?? "";
const sourcePattern = /^\[(\d+)\]\s+(.+?)(https?:\/\/\S+)\s*$/gmu;
const sources = [];
for (const match of bibliography.matchAll(sourcePattern)) {
  sources.push({
    id: `source_${match[1]}`,
    label: match[2].replace(/，访问于\d{4}-\d{2}-\d{2}。?$/u, ""),
    href: match[3],
    query: {
      description: `公开来源 [${match[1]}]，用于品牌叙事、人物表达或视觉偏好的事实复核。`,
      engine: "public web research",
      executed_at: "2026-09-01T00:00:00+08:00",
    },
  });
}

const artifact = {
  surface: "report",
  manifest: {
    title: "SNACKPAPER × 张月：STILL, SHE MOVES",
    description: "基于SNACKPAPER公开案例与张月跨平台调研形成的五套LOOK连续故事、完整拍摄执行、访谈、资产矩阵、三周营销、预算、KPI与风险方案。",
    generatedAt: "2026-09-01T00:00:00+08:00",
    surface: "report",
    version: 1,
    blocks,
    cards: [],
    charts: [
      {
        id: "budget_allocation",
        title: "建议制作预算结构",
        subtitle: "不含艺人合作费、媒体投放、产品生产、差旅和税费；百分比为前期询价基准，不是供应商报价",
        type: "horizontalBar",
        intent: "comparison",
        question: "有限制作预算应优先分配到哪些工作模块？",
        rationale: "横向条形图便于比较八个长标签模块的建议占比，并清楚显示总计100%。",
        comparisonContext: {
          grain: "制作模块",
          unit: "建议预算占比",
          denominator: "不含艺人费、投放、产品生产、差旅和税费的制作预算",
          normalization: "各模块占比合计100%",
        },
        dataset: "budget_allocation",
        sourceId: "src_budget_recommendation",
        encodings: {
          x: { field: "module", type: "nominal", label: "制作模块" },
          y: { field: "share", type: "quantitative", aggregate: "none", format: "percent", label: "占比" },
          tooltip: [
            { field: "priority", type: "nominal", label: "不能被压缩的部分" },
          ],
        },
        xAxisTitle: "制作模块",
        yAxisTitle: "建议占比",
        valueFormat: "percent",
        layout: "full",
        maxRows: 8,
        palette: { kind: "sequential", name: "blue" },
        settings: {
          orientation: "horizontal",
          showValues: true,
          sort: "descending",
          categoryLabelPolicy: "wrap",
        },
        surface: {
          surface: "explorer",
          compact: false,
          interactiveLegend: false,
          showControls: false,
          viewMode: "both",
        },
      },
    ],
    tables: [],
    sources: [
      {
        id: "src_budget_recommendation",
        label: "项目制作预算结构建议",
        query: {
          description: "由本案工作范围与必须交付资产反推的制作预算比例；用于供应商询价，不是历史支出或市场报价。",
          engine: "embedded snapshot",
          language: "sql",
          executed_at: "2026-09-01T00:00:00+08:00",
          sql: "SELECT module, share, priority FROM budget_allocation ORDER BY share DESC, module ASC;",
          tables_used: ["budget_allocation"],
          filters: ["不含艺人合作费、媒体投放、产品生产、差旅和税费"],
          metric_definitions: ["share=模块占不含排除项的制作预算比例，各模块合计100%"],
        },
      },
    ],
  },
  snapshot: {
    version: 1,
    status: "ready",
    generatedAt: "2026-09-01T00:00:00+08:00",
    datasets: {
      budget_allocation: [
        { module: "摄影、视频、灯光与器材", share: 0.20, priority: "双机、动作高速、稳定收音、预灯" },
        { module: "美术、场景与道具", share: 0.16, priority: "三分区预搭、光框安全、纸张与银线系统" },
        { module: "服装、妆发与动作指导", share: 0.16, priority: "五LOOK、真发测试、服装备份、防滑与热身" },
        { module: "制片、场地、人员与保险", share: 0.14, priority: "一日拍摄、一日预搭、现场安全与餐休" },
        { module: "后期、调色、声音与适配", share: 0.14, priority: "主片、五章、访谈、横竖版与无字母版" },
        { module: "创意、编辑与导演", share: 0.12, priority: "总叙事、分镜、采访与版本管理" },
        { module: "收藏物打样与授权管理", share: 0.04, priority: "五折页、纸样、字体/音乐/肖像授权" },
        { module: "机动金", share: 0.04, priority: "服装替补、超时、设备与不可预见成本" },
      ],
    },
  },
  sources: [
    ...sources,
    {
      id: "src_budget_recommendation",
      label: "项目制作预算结构建议",
      query: {
        description: "由本案工作范围与必须交付资产反推的建议比例，不代表供应商实际报价。",
        engine: "embedded snapshot",
        language: "sql",
        executed_at: "2026-09-01T00:00:00+08:00",
        sql: "SELECT module, share, priority FROM budget_allocation ORDER BY share DESC, module ASC;",
        tables_used: ["budget_allocation"],
      },
    },
  ],
};

writeFileSync(artifactPath, `${JSON.stringify(artifact, null, 2)}\n`, "utf8");
