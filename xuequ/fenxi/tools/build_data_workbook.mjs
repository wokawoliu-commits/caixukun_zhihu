import fs from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { SpreadsheetFile, Workbook } = require("@oai/artifact-tool");

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cleaned = path.join(root, "research", "cleaned");
const deliverables = path.join(root, "research", "deliverables");
const downloads = path.join(root, "public", "downloads");

const admissions = JSON.parse(
  await fs.readFile(path.join(cleaned, "education_admissions_2014_2025.json"), "utf8"),
);
const checks = JSON.parse(
  await fs.readFile(path.join(cleaned, "internal_consistency_checks.json"), "utf8"),
);
const bulletins = JSON.parse(
  await fs.readFile(path.join(cleaned, "statistical_bulletin_checks.json"), "utf8"),
);
const exam = JSON.parse(await fs.readFile(path.join(cleaned, "exam_metrics.json"), "utf8"));

await fs.mkdir(deliverables, { recursive: true });
await fs.mkdir(downloads, { recursive: true });

const workbook = Workbook.create();
const colors = {
  ink: "#17201E",
  red: "#C6402C",
  paper: "#F4EFE4",
  soft: "#E9E1D2",
  line: "#D5CCBC",
  white: "#FBF8F1",
  teal: "#1F5E67",
};

function columnName(number) {
  let result = "";
  let value = number;
  while (value > 0) {
    const remainder = (value - 1) % 26;
    result = String.fromCharCode(65 + remainder) + result;
    value = Math.floor((value - 1) / 26);
  }
  return result;
}

function buildSheet(name, title, note, headers, rows, options = {}) {
  const sheet = workbook.worksheets.add(name);
  sheet.showGridLines = false;
  const lastColumn = columnName(headers.length);
  sheet.getRange(`A1:${lastColumn}1`).merge();
  sheet.getRange("A1").values = [[title]];
  sheet.getRange(`A2:${lastColumn}2`).merge();
  sheet.getRange("A2").values = [[note]];
  sheet.getRange(`A4:${lastColumn}4`).values = [headers];
  if (rows.length > 0) {
    sheet.getRange(`A5:${lastColumn}${rows.length + 4}`).values = rows;
  }
  sheet.getRange(`A1:${lastColumn}1`).format = {
    fill: colors.ink,
    font: { bold: true, color: colors.white, size: 18 },
    rowHeight: 34,
    verticalAlignment: "center",
  };
  sheet.getRange(`A2:${lastColumn}2`).format = {
    fill: colors.paper,
    font: { color: "#6B665D", italic: true, size: 10 },
    rowHeight: 28,
    verticalAlignment: "center",
    wrapText: true,
  };
  sheet.getRange(`A4:${lastColumn}4`).format = {
    fill: colors.red,
    font: { bold: true, color: colors.white, size: 10 },
    rowHeight: 24,
    verticalAlignment: "center",
    wrapText: true,
  };
  if (rows.length > 0) {
    const body = sheet.getRange(`A5:${lastColumn}${rows.length + 4}`);
    body.format = {
      fill: colors.white,
      font: { color: colors.ink, size: 10 },
      verticalAlignment: "top",
      wrapText: true,
    };
    body.format.rowHeight = options.rowHeight ?? 22;
  }
  sheet.getRange(`A1:${lastColumn}${rows.length + 4}`).format.autofitColumns();
  for (const [column, width] of Object.entries(options.widths ?? {})) {
    sheet.getRange(`${column}1:${column}${Math.max(rows.length + 4, 10)}`).format.columnWidth = width;
  }
  sheet.freezePanes.freezeRows(4);
  return sheet;
}

const guide = buildSheet(
  "使用说明",
  "京学龄｜北京教育人口数据包",
  "版本：2026-07-20。网页主序列、原始来源与质量核验的可下载底表。",
  ["主题", "说明", "使用建议"],
  [
    ["主序列", "2014—2025年北京市、西城区、朝阳区小学、普通初中、普通高中招生数。", "优先用于同口径趋势分析。"],
    ["高考人口", "每年保留原始发布口径：报名、参加统一高考或实际参加。", "跨年比较前必须查看“口径”列。"],
    ["本科实际录取", "2010—2019年可核实的实际本科录取人数，存在空年。", "不要与本科线上人数拼接。"],
    ["本科线上", "2020—2025年普通本科控制线及以上累计人数。", "上线不等于最终录取。"],
    ["区级缺口", "西城、朝阳未找到连续的本科绝对人数。", "不得按全市比例反推。"],
    ["质量等级", "A=政府/考试院原始表或官方发布；B=权威机构转引；C=媒体历史汇总。", "筛选或展示时保留等级。"],
  ],
  { widths: { A: 18, B: 62, C: 44 }, rowHeight: 32 },
);
guide.getRange("A5:A10").format.font = { bold: true, color: colors.red };

buildSheet(
  "入学人口",
  "分区域入学人口主序列",
  "来源：北京市教委教育统计概况原始工作簿；单位均为人。",
  ["年份", "学年", "区域", "小学招生", "初中招生", "普通高中招生", "质量", "市教委索引页", "小学原表", "中学原表"],
  admissions.map((item) => [
    item.year,
    item.school_year,
    item.area,
    item.primary_admissions,
    item.junior_high_admissions,
    item.senior_high_admissions,
    item.confidence,
    item.source_index_url,
    item.primary_source_url,
    item.middle_source_url,
  ]),
  { widths: { A: 10, B: 14, C: 12, D: 14, E: 14, F: 16, G: 9, H: 42, I: 42, J: 42 }, rowHeight: 34 },
).getRange(`D5:F${admissions.length + 4}`).format.numberFormat = "#,##0";

buildSheet(
  "高考人口",
  "高考人口：保留原始口径",
  "注意：报名、实考、参加统一高考并非同一概念；约数不伪装为精确数。",
  ["年份", "区域", "数值", "原文显示", "口径", "精度", "质量", "原始来源"],
  exam.gaokao_population.map((item) => [
    item.year,
    item.area,
    item.value,
    item.display,
    item.scope,
    item.precision,
    item.confidence,
    item.source,
  ]),
  { widths: { A: 10, B: 12, C: 14, D: 14, E: 18, F: 20, G: 9, H: 48 }, rowHeight: 30 },
).getRange(`C5:C${exam.gaokao_population.length + 4}`).format.numberFormat = "#,##0";

buildSheet(
  "本科实际录取",
  "可核实的本科实际录取人数",
  "历史公开并不连续。2018年及2020年以后未找到稳定、可核实的公开总数。",
  ["年份", "区域", "本科实际录取", "质量", "来源"],
  exam.undergraduate_admitted.map((item) => [item.year, item.area, item.value, item.confidence, item.source]),
  { widths: { A: 10, B: 12, C: 18, D: 9, E: 52 }, rowHeight: 28 },
).getRange(`C5:C${exam.undergraduate_admitted.length + 4}`).format.numberFormat = "#,##0";

buildSheet(
  "本科线上",
  "普通本科控制线及以上人数",
  "来自北京教育考试院一分一段表；上线人数不等于实际录取人数。",
  ["年份", "区域", "控制线", "控制线及以上人数", "质量", "来源"],
  exam.undergraduate_above_cutoff.map((item) => [item.year, item.area, item.cutoff, item.value, item.confidence, item.source]),
  { widths: { A: 10, B: 12, C: 12, D: 21, E: 9, F: 52 }, rowHeight: 28 },
).getRange(`C5:D${exam.undergraduate_above_cutoff.length + 4}`).format.numberFormat = "#,##0";

const checksSheet = buildSheet(
  "内部核验",
  "招生数 vs 对应一年级在校生",
  "两项来自同一官方工作簿；差值反映统计时点、学籍状态等，不应强制归零。",
  ["年份", "区域", "核验项", "招生数", "一年级在校生", "差值", "相对差"],
  checks.map((item) => [item.year, item.area, item.metric, item.reported, item.comparison, item.difference, null]),
  { widths: { A: 10, B: 12, C: 38, D: 14, E: 18, F: 12, G: 12 }, rowHeight: 25 },
);
checksSheet.getRange("G5").formulas = [["=ABS(F5)/D5"]];
checksSheet.getRange(`G5:G${checks.length + 4}`).fillDown();
checksSheet.getRange(`D5:F${checks.length + 4}`).format.numberFormat = "#,##0";
checksSheet.getRange(`G5:G${checks.length + 4}`).format.numberFormat = "0.00%";

const bulletinRows = [];
const metricDefs = [
  ["小学招生", "primary_admissions", "primary"],
  ["初中招生", "junior_high_admissions", "junior"],
  ["普通高中招生", "senior_high_admissions", "senior"],
];
for (const bulletin of bulletins) {
  const admissionIndex = admissions.findIndex((item) => item.area === "北京市" && item.year === bulletin.year);
  for (const [label, admissionKey, bulletinKey] of metricDefs) {
    bulletinRows.push({
      year: bulletin.year,
      metric: label,
      exactReference: `='入学人口'!${columnName({ primary_admissions: 4, junior_high_admissions: 5, senior_high_admissions: 6 }[admissionKey])}${admissionIndex + 5}`,
      bulletin: bulletin[bulletinKey],
      source: bulletin.source,
    });
  }
}
const bulletinSheet = buildSheet(
  "公报交叉核验",
  "市教委精确数 vs 市统计局公报约数",
  "统计公报以0.1万人发布；差值绝对值不超过500人即符合四舍五入预期。",
  ["年份", "指标", "市教委精确数", "公报换算值", "差值", "四舍五入一致", "公报来源"],
  bulletinRows.map((item) => [item.year, item.metric, null, item.bulletin, null, null, item.source]),
  { widths: { A: 10, B: 18, C: 18, D: 18, E: 14, F: 16, G: 52 }, rowHeight: 27 },
);
bulletinRows.forEach((item, index) => {
  const row = index + 5;
  bulletinSheet.getRange(`C${row}`).formulas = [[item.exactReference]];
  bulletinSheet.getRange(`E${row}`).formulas = [[`=C${row}-D${row}`]];
  bulletinSheet.getRange(`F${row}`).formulas = [[`=IF(ABS(E${row})<=500,"是","否")`]];
});
bulletinSheet.getRange(`C5:E${bulletinRows.length + 4}`).format.numberFormat = "#,##0";

buildSheet(
  "数据字典",
  "字段与口径字典",
  "前端、分析脚本与研究报告共用这些定义。",
  ["字段", "中文名称", "定义", "单位", "可否跨年直接比较"],
  [
    ["primary_admissions", "小学招生", "小学教育招生数，含一贯制学校小学部", "人", "是"],
    ["junior_high_admissions", "初中招生", "普通初中招生数", "人", "是"],
    ["senior_high_admissions", "普通高中招生", "普通高中招生数，不含中职", "人", "是"],
    ["gaokao_population", "高考人口", "报名、参加统一高考或实际参加，逐年保留原口径", "人", "需核对口径"],
    ["undergraduate_admitted", "本科实际录取", "最终被本科层次录取的考生数", "人", "同口径年份可比"],
    ["undergraduate_above_cutoff", "本科线及以上", "普通本科控制线及以上累计人数", "人", "是，但不等于录取"],
    ["confidence", "质量等级", "A官方原始；B权威转引；C媒体历史汇总", "等级", "不适用"],
    ["precision", "精度", "exact精确；rounded约数；lower_bound_rounded为“余”", "类别", "不适用"],
  ],
  { widths: { A: 30, B: 22, C: 62, D: 12, E: 22 }, rowHeight: 30 },
);

const inspection = await workbook.inspect({
  kind: "sheet,formula",
  maxChars: 8000,
  tableMaxRows: 8,
  tableMaxCols: 8,
});
await fs.writeFile(path.join(deliverables, "workbook-inspection.json"), JSON.stringify(inspection, null, 2));

const formulaErrors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 200 },
  maxChars: 4000,
});
await fs.writeFile(path.join(deliverables, "workbook-formula-scan.json"), JSON.stringify(formulaErrors, null, 2));

const preview = await workbook.render({
  sheetName: "使用说明",
  autoCrop: "all",
  scale: 1,
  format: "png",
});
await fs.writeFile(
  path.join(deliverables, "data-workbook-preview.png"),
  new Uint8Array(await preview.arrayBuffer()),
);

const output = await SpreadsheetFile.exportXlsx(workbook);
const outputPath = path.join(downloads, "beijing-education-population-data.xlsx");
await output.save(outputPath);
console.log(outputPath);
