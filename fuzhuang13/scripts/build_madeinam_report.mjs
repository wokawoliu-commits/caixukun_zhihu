import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

const ROOT = "/Users/huangdong/Downloads/github/caixukun_zhihu/fuzhuang13";
const ASSET_DIR = path.join(ROOT, "assets");
const OUT_HTML = path.join(ROOT, "index.html");
const OUT_MANIFEST = path.join(ROOT, "assets", "manifest.json");

const today = "2026-05-19";

const products = [
  {
    code: "B9",
    name: "B9 木工裤",
    imageUrl: "https://img.alicdn.com/bao/uploaded/i2/59008891/O1CN01hQdbpQ2FY8YWCdkqV_!!59008891.png_580x580q90.jpg_.webp",
    price: "¥680",
    type: "男友裤 / 工装口袋",
    proof: "淘宝详情页显示“千人加购”；官方小红书 B9 产品帖 68 赞 / 32 藏 / 8 评。",
    signal: "公开前台最热候选",
    source: "https://item.taobao.com/item.htm?id=1044368765875",
  },
  {
    code: "W3",
    name: "W3 巴黎女孩口袋裤",
    imageUrl: "https://img.alicdn.com/bao/uploaded/i4/59008891/O1CN01mO5ONt2FY8YVb32XG_!!59008891.jpg_580x580q90.jpg",
    price: "¥680",
    type: "高腰 / 前贴袋 / 阔腿",
    proof: "淘宝详情页预售 26 天内发货；关键词 W3 多次命中。",
    signal: "核心编码裤型",
    source: "https://item.taobao.com/item.htm?id=1045249832549",
  },
  {
    code: "ST11",
    name: "ST11 破洞少年裤",
    imageUrl: "https://g-search1.alicdn.com/img/bao/uploaded/i4/i1/59008891/O1CN01QSqi8E2FY8YWCbsSD_!!59008891.jpg_580x580q90.jpg",
    price: "¥680",
    type: "中腰 / 破洞 / 宽松直筒",
    proof: "淘宝详情页“百人购买”；发货、避雷搜索中反复出现。",
    signal: "讨论高频款",
    source: "https://item.taobao.com/item.htm?id=1045267836105",
  },
  {
    code: "W4",
    name: "W4 三角插片阔腿裤",
    imageUrl: "https://g-search3.alicdn.com/img/bao/uploaded/i4/i1/59008891/O1CN01Y9YxRM2FY8Y9mhR7X_!!59008891.jpg_580x580q90.jpg_.webp",
    price: "¥680",
    type: "中高腰 / 侧插片 / 阔腿",
    proof: "淘宝详情页预售 24 天内发货。",
    signal: "核心阔腿线",
    source: "https://item.taobao.com/item.htm?id=1038123983626",
  },
  {
    code: "ST9",
    name: "ST9 老钱轻薄纸片裤",
    imageUrl: "https://g-search1.alicdn.com/img/bao/uploaded/i4/i2/59008891/O1CN01aUiMdL2FY8Ytk08ov_!!59008891.png_580x580q90.jpg",
    price: "¥680",
    type: "轻薄全棉 / 中腰直筒",
    proof: "淘宝详情页“百人购买”；官方产品帖 11 赞 / 3 藏。",
    signal: "通勤直筒款",
    source: "https://item.taobao.com/item.htm?id=1048177790885",
  },
  {
    code: "ST12",
    name: "ST12 冰蓝直尺裤",
    imageUrl: "https://g-search3.alicdn.com/img/bao/uploaded/i4/i2/59008891/O1CN01rfSd1U2FY8Yq2MELc_!!59008891.jpg_580x580q90.jpg_.webp",
    price: "¥680",
    type: "中腰 / 直筒微阔 / 浅蓝",
    proof: "淘宝详情页“近期热销”，预售 30 天内发货；官方新品帖。",
    signal: "近期新品热度",
    source: "https://item.taobao.com/item.htm?id=1049392787682",
  },
  {
    code: "ST10",
    name: "ST10 纯白低腰直筒裤",
    imageUrl: "https://g-search2.alicdn.com/img/bao/uploaded/i4/i1/59008891/O1CN018OEgMl2FY8Y9R6L5h_!!59008891.jpg_580x580q90.jpg",
    price: "¥680",
    type: "低腰 / 直筒 / 清爽白",
    proof: "淘宝详情页“百人购买”。",
    signal: "夏季直筒款",
    source: "https://item.taobao.com/item.htm?id=1032943754095",
  },
  {
    code: "B8",
    name: "B8 深靛蓝弯刀裤",
    imageUrl: "https://g-search2.alicdn.com/img/bao/uploaded/i4/i1/59008891/O1CN01S2mM4s2FY8Y9I7vOz_!!59008891.jpg_580x580q90.jpg_.webp",
    price: "¥680",
    type: "深靛蓝 / 微弯刀 / 挺括全棉",
    proof: "淘宝详情页“百人购买”。",
    signal: "深色弯刀款",
    source: "https://item.taobao.com/item.htm?id=1034654980560",
  },
  {
    code: "SL4",
    name: "SL4 挺缝线烟管裤",
    imageUrl: "https://g-search3.alicdn.com/img/bao/uploaded/i4/i4/59008891/O1CN01FeITi62FY8Y95kilP_!!59008891.jpg_580x580q90.jpg",
    price: "¥680-780",
    type: "烟管裤 / 弹力莱卡 / 牛仔西装",
    proof: "淘宝详情页“近期热销 / 即将售罄”。",
    signal: "套装与裤型组合",
    source: "https://item.taobao.com/item.htm?id=1032264455473",
  },
  {
    code: "TOP",
    name: "免穿文胸吊带背心",
    imageUrl: "https://g-search2.alicdn.com/img/bao/uploaded/i4/i4/59008891/O1CN01jiPLIR2FY8Y9SgzHZ_!!59008891.jpg_580x580q90.jpg",
    price: "¥280",
    type: "带胸垫 / 多色 / 收腰背心",
    proof: "AKIKIYU 评论区被问内搭，回复指向“店铺里带胸垫的背心”。",
    signal: "牛仔外延单品",
    source: "https://item.taobao.com/item.htm?id=1034692148443",
  },
];

const accountRows = [
  ["官方", "MADEINAM", "42,451", "获赞收藏 64,272", "《限定掉落》2461 赞 / 205 藏 / 49 评 / 47 转", "品牌信息、上新、快闪预约、限定说明"],
  ["矩阵", "MADEINAM灵感衣橱", "2,202", "获赞收藏 3,708", "《Kids Denim》135 赞 / 18 评 / 37 转", "素人试穿、AMmuse、亲子/快闪补充"],
  ["主理人", "AKIKIYU", "208,581", "获赞收藏 739,957", "《这一刻，像在做梦一样》1301 赞 / 253 评 / 176 转", "审美权威、线下召集、情感资产"],
  ["主理人", "张悦儿Masami", "280,445", "获赞收藏 1,095,212", "《蓝房子。随笔。》1237 赞 / 224 评 / 120 转", "生活方式、亲子、牛仔裤清单"],
  ["生活方式", "Hi！Seeya", "143,485", "获赞收藏 522,391", "《耶！今天和@Shea是AM Girls！》569 赞 / 85 评", "AM Girls 身份传播"],
  ["生活方式", "鸭鸭呀", "60,672", "获赞收藏 280,733", "《今天是东湖路肯豆》500 赞 / 100 评 / 137 转", "试穿购买、男裤/裤型询问"],
  ["穿搭种草", "比比", "6,148", "获赞收藏 50,912", "《90s denim girl》823 赞 / 132 藏", "强视觉种草"],
  ["探店", "虞氏小女探街", "11,123", "获赞收藏 153,257", "蓝房子探店 57 赞 / 110 转", "位置扩散、商业空间观察"],
  ["探店", "Jia在英伦", "1,182", "获赞收藏 46,555", "快闪店笔记 47 赞 / 169 转", "低粉高分享，承担打卡扩散"],
  ["风险讨论", "Candice可青很灵", "2,414", "获赞收藏 21,316", "吴千语直播间笔记 993 赞 / 678 评 / 334 转", "直播选品信任风险"],
];

const discussionRows = [
  ["直播/选品信任", "Candice 可青《昨天在吴千语的直播间0消费》678 评论", "直播渠道能放大成交，也会放大选品、价格与信任风险。"],
  ["主理人事件", "AKIKIYU《这一刻，像在做梦一样》253 评论；张悦儿《蓝房子。随笔。》224 评论", "蓝房子事件里，情绪与人比单品参数更能驱动讨论。"],
  ["购买/预约", "309 条评论/回复样本中购买/抢购相关 40 条，快闪地址/预约 39 条", "“怎么预约、线上能否买、主理人在不在、哪条裤子”是强购买意向。"],
  ["版型与尺码", "版型显瘦 33 条、尺码 10 条；多条评论问 B9、B7、ST 系列、XS/S 和身高版", "尺码教育和不同身材试穿是转化关键。"],
  ["发货售后", "Ting、莊. 等负面样本集中在发货、退换、气味、做工与客服话术", "履约风险会反噬主理人社群情绪。"],
];

const channelRows = [
  ["淘宝/官方店铺", "成交与 SKU 展示", "可见核心牛仔裤 580-680 元；店铺前台 4.8、好评率 98%、平均 3 天内发货；B9 千人加购。", "可确认前台热度，不等同 GMV"],
  ["小红书官方", "品牌信息与上新承接", "官方简介、产品帖、预约帖、限定掉落、空间指南。", "种草/信息"],
  ["主理人账号", "人格化与社群召集", "AKIKIYU、张悦儿高粉账号驱动蓝房子评论峰值。", "破圈/信任"],
  ["小程序", "快闪预约与核销", "官方评论回复“要预约，小程序约”；预约帖写“限时预约”。", "线下转化"],
  ["蓝房子快闪", "线下体验与 UGC", "2026.4.27-5.10 上海东湖路 30 号；男装、童装、周边、拍照机。", "品牌资产"],
  ["直播", "转化与风险并存", "主理人简介提直播售后通道；吴千语直播间讨论高。", "需管控选品与售后"],
];

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function slug(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function assetExt(url, contentType = "") {
  const clean = url.split("?")[0].toLowerCase();
  if (contentType.includes("png") || clean.includes(".png")) return ".png";
  if (contentType.includes("webp") || clean.includes(".webp")) return ".webp";
  return ".jpg";
}

async function downloadAsset(item) {
  const response = await fetch(item.imageUrl, {
    headers: {
      "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      referer: "https://www.taobao.com/",
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to download ${item.name}: ${response.status} ${response.statusText}`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  const ext = assetExt(item.imageUrl, response.headers.get("content-type") || "");
  const hash = crypto.createHash("sha1").update(item.imageUrl).digest("hex").slice(0, 10);
  const filename = `${slug(item.code)}-${hash}${ext}`;
  await fs.writeFile(path.join(ASSET_DIR, filename), buffer);
  return `assets/${filename}`;
}

function table(headers, rows, className = "") {
  return `
    <div class="table-wrap ${className}">
      <table>
        <thead><tr>${headers.map((h) => `<th>${escapeHtml(h)}</th>`).join("")}</tr></thead>
        <tbody>
          ${rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("")}
        </tbody>
      </table>
    </div>`;
}

function productGrid(items) {
  return `
    <div class="product-grid">
      ${items
        .map(
          (p) => `
        <article class="product">
          <a href="${p.source}" target="_blank" rel="noreferrer" class="product-image" aria-label="${escapeHtml(p.name)} 商品页">
            <img src="${p.localImage}" alt="${escapeHtml(p.name)}">
          </a>
          <div class="product-body">
            <div class="product-kicker">${escapeHtml(p.code)} · ${escapeHtml(p.price)}</div>
            <h3>${escapeHtml(p.name)}</h3>
            <p class="muted">${escapeHtml(p.type)}</p>
            <p>${escapeHtml(p.proof)}</p>
            <span>${escapeHtml(p.signal)}</span>
          </div>
        </article>`,
        )
        .join("")}
    </div>`;
}

function metric(label, value, note) {
  return `<div class="metric"><strong>${escapeHtml(value)}</strong><span>${escapeHtml(label)}</span><small>${escapeHtml(note)}</small></div>`;
}

function html(items) {
  const accountTable = table(
    ["分层", "账号", "粉丝", "账号资产", "代表内容效果", "传播作用"],
    accountRows.map((r) => r.map(escapeHtml)),
    "dense",
  );
  const discussionTable = table(
    ["问题", "证据", "判断"],
    discussionRows.map((r) => r.map(escapeHtml)),
  );
  const channelTable = table(
    ["渠道", "角色", "公开线索", "结论边界"],
    channelRows.map((r) => r.map(escapeHtml)),
  );
  const productTable = table(
    ["产品", "定价", "卖点", "公开热度信号", "来源"],
    items.map((p) => [
      `<strong>${escapeHtml(p.name)}</strong><br><span class="mini">${escapeHtml(p.code)}</span>`,
      escapeHtml(p.price),
      escapeHtml(p.type),
      escapeHtml(p.proof),
      `<a href="${p.source}" target="_blank" rel="noreferrer">商品页</a>`,
    ]),
  );

  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>MADEINAM 小红书人群与传播推广分析</title>
  <style>
    :root {
      --ink: #111316;
      --muted: #626a73;
      --line: #dfe3e8;
      --paper: #f7f5ef;
      --white: #ffffff;
      --denim: #174f8a;
      --denim-deep: #102a43;
      --sky: #d9e9f5;
      --warm: #e7dfd0;
      --risk: #8f2d26;
      --ok: #1f6f54;
    }
    * { box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body {
      margin: 0;
      color: var(--ink);
      background: var(--paper);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", Arial, sans-serif;
      line-height: 1.62;
    }
    a { color: var(--denim); text-decoration: none; }
    a:hover { text-decoration: underline; }
    .nav {
      position: sticky;
      top: 0;
      z-index: 10;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
      padding: 14px 32px;
      border-bottom: 1px solid rgba(17, 19, 22, 0.1);
      background: rgba(247, 245, 239, 0.92);
      backdrop-filter: blur(14px);
    }
    .brand-mark { font-size: 13px; font-weight: 800; letter-spacing: 0; }
    .nav-links { display: flex; flex-wrap: wrap; gap: 16px; font-size: 13px; color: var(--muted); }
    .hero {
      min-height: 72svh;
      display: grid;
      grid-template-columns: minmax(280px, 0.8fr) minmax(420px, 1.2fr);
      gap: 48px;
      align-items: end;
      padding: 64px 48px 56px;
      background:
        linear-gradient(120deg, rgba(16, 42, 67, 0.88), rgba(23, 79, 138, 0.62)),
        url("${items[0].localImage}") center 35% / cover;
      color: var(--white);
      overflow: hidden;
    }
    .hero h1 {
      margin: 10px 0 18px;
      font-size: clamp(46px, 8vw, 108px);
      line-height: 0.9;
      letter-spacing: 0;
    }
    .eyebrow {
      display: inline-flex;
      width: fit-content;
      border: 1px solid rgba(255,255,255,0.38);
      padding: 5px 10px;
      font-size: 12px;
      border-radius: 999px;
      color: rgba(255,255,255,0.88);
    }
    .hero-copy {
      max-width: 640px;
      font-size: clamp(18px, 2vw, 26px);
      line-height: 1.38;
      color: rgba(255,255,255,0.88);
    }
    .hero-proof {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      align-self: stretch;
      align-items: end;
    }
    .proof-item {
      padding-top: 16px;
      border-top: 1px solid rgba(255,255,255,0.34);
      color: rgba(255,255,255,0.84);
      font-size: 13px;
    }
    .proof-item strong {
      display: block;
      color: var(--white);
      font-size: 28px;
      line-height: 1.1;
      margin-bottom: 6px;
    }
    main { overflow: clip; }
    section {
      padding: 76px 48px;
      border-bottom: 1px solid rgba(17, 19, 22, 0.1);
    }
    .section-inner {
      max-width: 1240px;
      margin: 0 auto;
    }
    .section-head {
      display: grid;
      grid-template-columns: minmax(240px, 0.42fr) minmax(300px, 0.58fr);
      gap: 48px;
      align-items: end;
      margin-bottom: 34px;
    }
    h2 {
      margin: 0;
      font-size: clamp(28px, 4vw, 54px);
      line-height: 1.02;
      letter-spacing: 0;
    }
    h3 { margin: 0 0 8px; line-height: 1.18; letter-spacing: 0; }
    p { margin: 0 0 14px; }
    .muted { color: var(--muted); }
    .mini { color: var(--muted); font-size: 12px; }
    .summary {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 1px;
      background: var(--line);
      border: 1px solid var(--line);
    }
    .metric {
      background: var(--white);
      min-height: 150px;
      padding: 22px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .metric strong { display: block; font-size: 30px; line-height: 1; color: var(--denim-deep); }
    .metric span { display: block; font-weight: 750; margin-top: 10px; }
    .metric small { color: var(--muted); }
    .takeaways {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 1px;
      background: var(--line);
      border: 1px solid var(--line);
      margin-top: 34px;
    }
    .takeaway {
      background: var(--white);
      padding: 26px;
    }
    .takeaway b { color: var(--denim); }
    .product-grid {
      display: grid;
      grid-template-columns: repeat(5, minmax(0, 1fr));
      gap: 1px;
      border: 1px solid var(--line);
      background: var(--line);
    }
    .product {
      background: var(--white);
      min-width: 0;
      display: flex;
      flex-direction: column;
    }
    .product-image {
      display: block;
      aspect-ratio: 4 / 5;
      background: var(--warm);
      overflow: hidden;
    }
    .product-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      transition: transform 260ms ease, filter 260ms ease;
    }
    .product:hover img { transform: scale(1.035); filter: saturate(1.08); }
    .product-body { padding: 18px; display: flex; flex: 1; flex-direction: column; }
    .product-kicker { color: var(--denim); font-size: 12px; font-weight: 800; margin-bottom: 8px; }
    .product p { font-size: 13px; }
    .product span {
      margin-top: auto;
      color: var(--denim-deep);
      border-top: 1px solid var(--line);
      padding-top: 12px;
      font-size: 12px;
      font-weight: 800;
    }
    .table-wrap {
      overflow-x: auto;
      border: 1px solid var(--line);
      background: var(--white);
    }
    table {
      width: 100%;
      border-collapse: collapse;
      min-width: 900px;
      font-size: 14px;
    }
    th, td {
      text-align: left;
      vertical-align: top;
      border-bottom: 1px solid var(--line);
      padding: 14px 16px;
    }
    th {
      position: sticky;
      top: 48px;
      background: #eef3f7;
      color: var(--denim-deep);
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0;
      z-index: 2;
    }
    tr:last-child td { border-bottom: 0; }
    .dense table { font-size: 13px; }
    .band {
      background: var(--denim-deep);
      color: var(--white);
    }
    .band .muted { color: rgba(255,255,255,0.72); }
    .band-grid {
      display: grid;
      grid-template-columns: 0.85fr 1.15fr;
      gap: 48px;
      align-items: start;
    }
    .tag-cloud {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
    .tag-cloud span {
      border: 1px solid rgba(255,255,255,0.24);
      color: rgba(255,255,255,0.9);
      border-radius: 999px;
      padding: 7px 11px;
      font-size: 13px;
    }
    .risk-list {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 1px;
      background: var(--line);
      border: 1px solid var(--line);
    }
    .risk {
      background: var(--white);
      padding: 22px;
    }
    .risk strong { color: var(--risk); }
    .footer {
      padding: 34px 48px 54px;
      color: var(--muted);
      font-size: 13px;
    }
    .reveal { animation: rise 620ms cubic-bezier(.2,.8,.2,1) both; }
    .reveal:nth-child(2) { animation-delay: 80ms; }
    @keyframes rise {
      from { opacity: 0; transform: translateY(18px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @media (max-width: 1100px) {
      .hero { grid-template-columns: 1fr; align-items: end; }
      .hero-proof, .summary, .product-grid { grid-template-columns: repeat(2, 1fr); }
      .section-head, .band-grid { grid-template-columns: 1fr; gap: 24px; }
    }
    @media (max-width: 720px) {
      .nav { padding: 12px 18px; align-items: flex-start; }
      .nav-links { display: none; }
      .hero { min-height: 76svh; padding: 42px 22px 30px; }
      .hero-proof, .summary, .takeaways, .product-grid, .risk-list { grid-template-columns: 1fr; }
      section { padding: 52px 20px; }
      .footer { padding: 28px 20px 42px; }
      table { min-width: 760px; }
      .proof-item strong { font-size: 23px; }
    }
  </style>
</head>
<body>
  <nav class="nav">
    <div class="brand-mark">MADEINAM XHS REPORT</div>
    <div class="nav-links">
      <a href="#summary">核心结论</a>
      <a href="#products">核心产品</a>
      <a href="#kol">KOL/KOC</a>
      <a href="#discussion">用户讨论</a>
      <a href="#channels">渠道线索</a>
      <a href="#risks">风险建议</a>
    </div>
  </nav>
  <header class="hero">
    <div class="reveal">
      <span class="eyebrow">老板汇报版 · 抓取日期 ${today}</span>
      <h1>MADEINAM</h1>
      <p class="hero-copy">以牛仔裤版型为商业核心，以主理人审美和 AM 女孩社群为传播核心的 Denim lifestyle 品牌。</p>
    </div>
    <div class="hero-proof reveal">
      <div class="proof-item"><strong>229</strong>去重小红书笔记</div>
      <div class="proof-item"><strong>37</strong>重点笔记详情</div>
      <div class="proof-item"><strong>309</strong>评论/回复精读</div>
    </div>
  </header>
  <main>
    <section id="summary">
      <div class="section-inner">
        <div class="section-head">
          <h2>核心结论</h2>
          <p class="muted">结论按“可确认 / 可推断 / 需后台确认”区分。公开前台热度不能直接等同销量或 GMV。</p>
        </div>
        <div class="summary">
          ${metric("官方账号粉丝", "42,451", "MADEINAM 官方小红书")}
          ${metric("官方获赞收藏", "64,272", "主页前台可见")}
          ${metric("AKIKIYU 粉丝", "208,581", "高关联主理人账号")}
          ${metric("张悦儿粉丝", "280,445", "高关联主理人账号")}
          ${metric("核心价带", "¥580-680", "牛仔裤主价格带")}
        </div>
        <div class="takeaways">
          <div class="takeaway"><b>品牌定位：</b>不是单一牛仔裤品牌，而是牛仔裤 + 主理人审美 + AM 女孩社群 + 蓝房子线下事件的组合。</div>
          <div class="takeaway"><b>最强公开热度单品：</b>B9 木工裤。淘宝前台“千人加购”，高于本次核验的其他核心裤型。</div>
          <div class="takeaway"><b>最高讨论主题：</b>直播/选品信任和蓝房子主理人事件，高于单一产品参数讨论。</div>
          <div class="takeaway"><b>最大经营风险：</b>预售发货、售后口径、价格与做工争议，会反噬主理人社群信任。</div>
        </div>
      </div>
    </section>

    <section id="products">
      <div class="section-inner">
        <div class="section-head">
          <h2>核心产品与价格带</h2>
          <p class="muted">所有产品图片均已下载为本地图片。产品热度来自小红书公开互动、淘宝前台文案和详情页提示。</p>
        </div>
        ${productGrid(items)}
        <div style="height:28px"></div>
        ${productTable}
      </div>
    </section>

    <section id="kol">
      <div class="section-inner">
        <div class="section-head">
          <h2>账号资产与 KOL/KOC</h2>
          <p class="muted">MADEINAM 的传播不是单点达人投放，而是官方、矩阵、主理人、KOC 探店和社群素人的组合打法。</p>
        </div>
        ${accountTable}
      </div>
    </section>

    <section class="band">
      <div class="section-inner band-grid">
        <div>
          <h2>核心标签词</h2>
          <p class="muted">品牌词、版型词、社群词和线下词共同构成搜索资产。</p>
        </div>
        <div class="tag-cloud">
          ${["MADEINAM", "MADEINAM牛仔裤", "AM女孩", "AKIKIYU", "张悦儿Masami", "马总", "W3", "ST11", "B9", "W4", "ST9", "ST12", "蓝房子", "东湖路", "上海快闪", "限定掉落", "预约", "发货", "避雷", "尺码", "显瘦", "男装", "Kids Denim", "周边"].map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}
        </div>
      </div>
    </section>

    <section id="discussion">
      <div class="section-inner">
        <div class="section-head">
          <h2>用户讨论洞察</h2>
          <p class="muted">用户讨论最高频集中在购买/预约、快闪地址、版型显瘦、尺码，以及发货售后。负面样本不是主流声量，但对高信任社群杀伤力更强。</p>
        </div>
        ${discussionTable}
      </div>
    </section>

    <section id="channels">
      <div class="section-inner">
        <div class="section-head">
          <h2>渠道与销售线索</h2>
          <p class="muted">公开资料只能支持渠道角色判断，不能证明完整 GMV 排名。全渠道销量第一与渠道销量第一均需品牌后台确认。</p>
        </div>
        ${channelTable}
      </div>
    </section>

    <section id="risks">
      <div class="section-inner">
        <div class="section-head">
          <h2>风险与建议</h2>
          <p class="muted">建议把官方号做成产品和履约知识库，主理人账号继续承接审美、情感和线下召集。</p>
        </div>
        <div class="risk-list">
          <div class="risk"><strong>预售与发货周期</strong><p>淘宝详情页多款显示预售 20-30 天。建议置顶发货周期、退换规则、客服路径，避免“等太久”转为负面笔记。</p></div>
          <div class="risk"><strong>价格与做工争议</strong><p>580-680 元牛仔裤需要更强的面料、工艺、版型、身高版本解释。用不同身材试穿降低决策成本。</p></div>
          <div class="risk"><strong>线下限定焦虑</strong><p>明确哪些款只在快闪、哪些会补货、哪些可线上买；评论区统一回复口径。</p></div>
          <div class="risk"><strong>直播选品信任</strong><p>直播能带成交，也会放大“网红滤镜”。高价打底、天然材质、起球等问题需要提前解释优缺点。</p></div>
        </div>
      </div>
    </section>
  </main>
  <footer class="footer">
    <div class="section-inner">
      数据口径：小红书 14 个搜索词文件、380 条原始结果、229 条去重笔记、37 条详情、309 条评论/回复、20 个账号主页；另核验淘宝前台 MADEINAM 核心 SKU 与商品详情页。<br>
      本地数据目录：/Users/huangdong/Downloads/codex-xhs10/xhs_madeinam/。完整 Markdown 报告：/Users/huangdong/Downloads/codex-xhs10/madeinam_xhs_brand_report.md。
    </div>
  </footer>
</body>
</html>`;
}

async function main() {
  await fs.mkdir(ASSET_DIR, { recursive: true });
  const withAssets = [];
  const manifest = [];
  for (const product of products) {
    const localImage = await downloadAsset(product);
    withAssets.push({ ...product, localImage });
    manifest.push({ name: product.name, source: product.imageUrl, local: localImage });
  }
  await fs.writeFile(OUT_MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  await fs.writeFile(OUT_HTML, html(withAssets), "utf8");
  console.log(JSON.stringify({ html: OUT_HTML, assets: manifest.length }, null, 2));
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
