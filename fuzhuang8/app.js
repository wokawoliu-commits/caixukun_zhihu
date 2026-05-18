const DATA = window.__CORE_SKU_ANALYSIS__;

const BRAND_ORDER = [
  "Fysea",
  "Oneup",
  "THE BLENDER",
  "tbh家居（THE BEAST）",
  "Ubras家居服",
  "Almondrocks",
  "gelato pique",
  "AAAD / an action a day",
  "TWOI Design Lab",
  "Victoria's Secret 维多利亚的秘密",
  "MUJI 无印良品",
  "Zara Home",
];

const CATEGORY_ORDER = [
  "背心吊带-单件",
  "背心吊带-多件/套装",
  "T恤",
  "内裤",
  "裤装-短裤",
  "裤装-长裤",
  "衬衫-长袖",
  "家居服-上装",
  "家居服-裤装",
  "家居服-套装",
  "眼罩",
];

const RULES = [
  ["背心吊带-单件", "标题含背心/吊带/抹胸", "若含2件/多件/组合/pack/set等，拆到多件/套装。"],
  ["背心吊带-多件/套装", "背心/吊带/抹胸 + 多件、几件、组合、任选、pack、set", "避免多件包价格和单件混算。"],
  ["T恤", "T恤/t恤/tee/短袖上衣/正肩短袖/短袖", "若明确睡衣/家居服语境，优先归为家居服上装。"],
  ["内裤", "内裤/三角裤/平角裤/丁字裤/安全裤", "排除睡裤/家居裤/休闲裤/长裤/短裤/外裤。"],
  ["裤装-短裤", "短裤/热裤/五分裤", "排除内裤/睡裤/家居裤/安全裤。"],
  ["裤装-长裤", "长裤/休闲裤/阔腿裤/牛仔裤/香蕉裤/弯刀裤/直筒裤/灯笼裤/防晒裤/运动裤", "排除睡裤/家居裤。"],
  ["衬衫-长袖", "衬衫/衬衣 + 长袖、法兰绒、格子、外套、秋/冬/春季等长袖信号", "排除短袖/无袖衬衫。"],
  ["家居服-上装", "家居服/睡衣/居家 + 上衣/上装/开衫/衬衫/T恤/背心/吊带/短袖/长袖/卫衣", "睡裙/睡袍/浴袍单件未纳入核心。"],
  ["家居服-裤装", "家居服/睡衣/居家 + 睡裤/家居裤/长裤/短裤/裤子/阔腿裤/休闲裤", "和外穿裤装分开。"],
  ["家居服-套装", "家居服/睡衣/居家 + 套装/两件/二件/三件/上衣+裤/短袖+短裤/长袖+长裤/吊带+短裤/情侣睡衣", "套装价格不与单件混算。"],
  ["眼罩", "标题含眼罩", "礼赠/配件单独看。"],
  ["成人女性过滤", "保留女性/未标性别但女装店核心商品", "排除男士、男款、儿童、亲子、宠物等。"],
];

const state = {
  brand: "全部品牌",
  category: "全部品类",
  search: "",
  pricedOnly: false,
};

const $ = (id) => document.getElementById(id);

function money(value) {
  return Number.isFinite(value) ? `¥${Math.round(value).toLocaleString("zh-CN")}` : "—";
}

function number(value) {
  return Number.isFinite(value) ? Math.round(value).toLocaleString("zh-CN") : "—";
}

function pctText(value) {
  return value || "0%";
}

function pctNumber(value) {
  const n = Number(String(value || "").replace("%", ""));
  return Number.isFinite(n) ? n : 0;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function matchesFilters(row) {
  if (state.brand !== "全部品牌" && row.brand !== state.brand) return false;
  if (state.category !== "全部品类" && row.category !== state.category) return false;
  if (state.pricedOnly && !Number.isFinite(row.price)) return false;
  const q = state.search.trim().toLowerCase();
  if (!q) return true;
  return `${row.brand} ${row.category} ${row.title} ${row.shopName || ""}`.toLowerCase().includes(q);
}

function initControls() {
  const brandFilter = $("brandFilter");
  const categoryFilter = $("categoryFilter");
  brandFilter.innerHTML = ["全部品牌", ...BRAND_ORDER].map((brand) => `<option>${escapeHtml(brand)}</option>`).join("");
  categoryFilter.innerHTML = ["全部品类", ...CATEGORY_ORDER].map((category) => `<option>${escapeHtml(category)}</option>`).join("");

  const tabs = $("categoryTabs");
  tabs.innerHTML = ["全部品类", ...CATEGORY_ORDER]
    .map((category) => `<button type="button" data-category="${escapeHtml(category)}">${escapeHtml(category)}</button>`)
    .join("");

  brandFilter.addEventListener("change", (event) => {
    state.brand = event.target.value;
    render();
  });
  categoryFilter.addEventListener("change", (event) => {
    state.category = event.target.value;
    syncTabs();
    render();
  });
  $("searchInput").addEventListener("input", (event) => {
    state.search = event.target.value;
    render();
  });
  $("pricedOnly").addEventListener("change", (event) => {
    state.pricedOnly = event.target.checked;
    render();
  });
  tabs.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-category]");
    if (!button) return;
    state.category = button.dataset.category;
    categoryFilter.value = state.category;
    syncTabs();
    render();
  });
  syncTabs();
}

function syncTabs() {
  document.querySelectorAll("#categoryTabs button").forEach((button) => {
    button.classList.toggle("active", button.dataset.category === state.category);
  });
}

function renderKpis() {
  const coverage = DATA.coverageRows;
  const totalSku = coverage.reduce((sum, row) => sum + Number(row[1] || 0), 0);
  const priced = coverage.reduce((sum, row) => sum + Number(row[2] || 0), 0);
  const salesKnown = coverage.reduce((sum, row) => sum + Number(row[4] || 0), 0);
  const topCategory = DATA.topCategoryRows.find((row) => row.isTopCategory === "是" && row.brand === "Oneup");
  $("kpis").innerHTML = [
    ["核心SKU", number(totalSku), "成人女性核心品类"],
    ["价格覆盖", `${Math.round((priced / totalSku) * 100)}%`, `${number(priced)} / ${number(totalSku)} 有价格`],
    ["销量覆盖", `${Math.round((salesKnown / totalSku) * 100)}%`, `${number(salesKnown)} 条有公开销量`],
    ["Oneup最高销售品类", topCategory?.category || "—", "已确认采集 oneup 女装店"],
  ]
    .map(([label, value, hint]) => `<div class="kpi"><span>${label}</span><strong>${value}</strong><em>${hint}</em></div>`)
    .join("");
}

function renderCoverage() {
  $("coverageList").innerHTML = DATA.coverageRows
    .map((row) => {
      const [brand, sku, priced, pricePct, sales, salesPct, links, images, note] = row;
      const width = Math.max(2, pctNumber(pricePct));
      return `<div class="coverage-item">
        <div class="coverage-head"><span>${escapeHtml(brand)}</span><span>${pctText(pricePct)}</span></div>
        <div class="bar"><span style="width:${width}%"></span></div>
        <div class="coverage-note">${priced}/${sku} 有价格 ｜ 销量覆盖 ${salesPct} ｜ 链接 ${links} ｜ 图片 ${images}</div>
        <div class="coverage-note">${escapeHtml(note)}</div>
      </div>`;
    })
    .join("");
}

function rangeBar(row, maxPrice) {
  if (!Number.isFinite(row.min) || !Number.isFinite(row.max) || !maxPrice) return "";
  const left = Math.max(0, Math.min(100, (row.min / maxPrice) * 100));
  const right = Math.max(left + 2, Math.min(100, (row.max / maxPrice) * 100));
  return `<div class="range-track"><span style="left:${left}%;width:${right - left}%"></span></div>`;
}

function renderPriceBandTable() {
  let rows = DATA.categoryBrandStats.filter((row) => {
    if (state.brand !== "全部品牌" && row.brand !== state.brand) return false;
    if (state.category !== "全部品类" && row.category !== state.category) return false;
    return true;
  });
  rows = rows.sort(
    (a, b) => CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category) || BRAND_ORDER.indexOf(a.brand) - BRAND_ORDER.indexOf(b.brand),
  );
  const maxPrice = Math.max(1, ...rows.map((row) => row.max || 0));
  $("priceBandTable").innerHTML = `<thead>
    <tr><th>品类</th><th>品牌</th><th>SKU</th><th>价格覆盖</th><th>价格带</th><th>销量合计下限</th><th>销量最高商品</th><th>备注</th></tr>
  </thead><tbody>${
    rows
      .map(
        (row) => `<tr>
        <td>${escapeHtml(row.category)}</td>
        <td>${escapeHtml(row.brand)}</td>
        <td class="num">${number(row.skuCount)}</td>
        <td>${escapeHtml(row.priceCoverage)}</td>
        <td class="price-range"><strong>${money(row.min)} - ${money(row.max)}</strong><br><span class="muted">P25 ${money(row.p25)} / 中位 ${money(row.median)} / P75 ${money(row.p75)}</span>${rangeBar(row, maxPrice)}</td>
        <td class="num">${number(row.totalSalesLower)}</td>
        <td>${row.topProductUrl ? `<a href="${escapeHtml(row.topProductUrl)}" target="_blank">${escapeHtml(row.topProduct)}</a>` : escapeHtml(row.topProduct || "—")}</td>
        <td>${escapeHtml(row.note)}</td>
      </tr>`,
      )
      .join("") || `<tr><td colspan="8">当前筛选下没有价格带数据。</td></tr>`
  }</tbody>`;
}

function renderTopCategoryTable() {
  let rows = DATA.topCategoryRows.filter((row) => {
    if (state.brand !== "全部品牌") return row.brand === state.brand;
    return row.isTopCategory === "是";
  });
  if (state.category !== "全部品类") rows = rows.filter((row) => row.category === state.category);
  rows = rows.sort((a, b) => BRAND_ORDER.indexOf(a.brand) - BRAND_ORDER.indexOf(b.brand) || a.brandCategoryRank - b.brandCategoryRank);
  $("topCategoryTable").innerHTML = `<thead>
    <tr><th>品牌</th><th>排名</th><th>品类</th><th>SKU数</th><th>销量合计下限</th><th>单品最高销量</th><th>代表商品</th><th>依据</th></tr>
  </thead><tbody>${
    rows
      .map(
        (row) => `<tr>
        <td>${escapeHtml(row.brand)}</td>
        <td class="num">${number(row.brandCategoryRank)}</td>
        <td>${escapeHtml(row.category)}</td>
        <td class="num">${number(row.skuCount)}</td>
        <td class="num">${number(row.totalSales)}</td>
        <td class="num">${number(row.topSales)}</td>
        <td>${escapeHtml(row.topProduct)}</td>
        <td>${escapeHtml(row.basis)}</td>
      </tr>`,
      )
      .join("") || `<tr><td colspan="8">当前筛选下没有品类排名数据。</td></tr>`
  }</tbody>`;
}

function renderTopProducts() {
  const rows = DATA.topProducts.filter(matchesFilters);
  $("topProductCount").textContent = `${rows.length} 件商品`;
  $("topProductsGrid").innerHTML =
    rows
      .map(
        (row) => `<article class="product fade-in">
      ${row.imageUrl ? `<img src="${escapeHtml(row.imageUrl)}" alt="${escapeHtml(row.title)}" loading="lazy">` : `<div class="image-fallback">无图</div>`}
      <div>
        <h3>${row.topRank}. ${escapeHtml(row.title)}</h3>
        <div class="product-meta">
          <span class="chip">${escapeHtml(row.brand)}</span>
          <span class="chip">${escapeHtml(row.category)}</span>
          <span class="chip">${money(row.price)}</span>
          <span class="chip">${row.salesText ? escapeHtml(row.salesText) : number(row.sales)}</span>
        </div>
        ${row.productUrl ? `<a href="${escapeHtml(row.productUrl)}" target="_blank">打开商品链接</a>` : `<span class="muted">商品链接缺失</span>`}
      </div>
    </article>`,
      )
      .join("") || `<p class="muted">当前筛选下没有 TOP 商品。</p>`;
}

function renderSeasonView() {
  let rows = DATA.seasonStats.filter((row) => {
    if (state.brand !== "全部品牌" && row.brand !== state.brand) return false;
    if (state.category !== "全部品类" && row.category !== state.category) return false;
    return true;
  });
  const bySeason = new Map();
  for (const row of rows) {
    if (!bySeason.has(row.season)) bySeason.set(row.season, { sku: 0, priced: 0, min: [], median: [], max: [] });
    const bucket = bySeason.get(row.season);
    bucket.sku += row.skuCount || 0;
    bucket.priced += row.pricedCount || 0;
    if (Number.isFinite(row.min)) bucket.min.push(row.min);
    if (Number.isFinite(row.median)) bucket.median.push(row.median);
    if (Number.isFinite(row.max)) bucket.max.push(row.max);
  }
  const maxSku = Math.max(1, ...[...bySeason.values()].map((row) => row.sku));
  $("seasonView").innerHTML = ["春季", "夏季", "秋季", "冬季"]
    .map((season) => {
      const row = bySeason.get(season) || { sku: 0, priced: 0, min: [], median: [], max: [] };
      const min = row.min.length ? Math.min(...row.min) : null;
      const med = row.median.length ? row.median.sort((a, b) => a - b)[Math.floor(row.median.length / 2)] : null;
      const max = row.max.length ? Math.max(...row.max) : null;
      return `<div class="season-row">
        <strong>${season}</strong>
        <div class="bar"><span style="width:${Math.max(2, (row.sku / maxSku) * 100)}%"></span></div>
        <span class="muted">${number(row.sku)} SKU ｜ ${money(min)}-${money(max)} ｜ 中位 ${money(med)}</span>
      </div>`;
    })
    .join("");
}

function renderAutumnList() {
  const q = state.search.trim().toLowerCase();
  const rows = DATA.autumnRows
    .filter((row) => {
      if (state.brand !== "全部品牌" && row.brand !== state.brand) return false;
      if (state.category !== "全部品类" && row.category !== state.category) return false;
      if (state.pricedOnly && !Number.isFinite(row.price)) return false;
      if (!q) return true;
      return `${row.brand} ${row.category} ${row.title}`.toLowerCase().includes(q);
    })
    .slice(0, 36);
  $("autumnList").innerHTML =
    rows
      .map(
        (row) => `<div class="autumn-item">
        <strong>${escapeHtml(row.brand)} ｜ ${escapeHtml(row.category)} ｜ ${money(row.price)}</strong>
        <p>${escapeHtml(row.title)}</p>
        <p>${escapeHtml(row.seasonSignals || "秋季信号")} ｜ ${row.salesText ? escapeHtml(row.salesText) : number(row.sales)}</p>
        ${row.productUrl ? `<a href="${escapeHtml(row.productUrl)}" target="_blank">商品链接</a>` : `<span class="muted">链接缺失</span>`}
      </div>`,
      )
      .join("") || `<p class="muted">当前筛选下没有秋季重点SKU。</p>`;
}

function renderRules() {
  $("rulesGrid").innerHTML = RULES.map(
    ([name, keep, reject]) => `<div class="rule">
      <h3>${escapeHtml(name)}</h3>
      <p><strong>保留：</strong>${escapeHtml(keep)}</p>
      <p><strong>拆分/排除：</strong>${escapeHtml(reject)}</p>
    </div>`,
  ).join("");
}

function render() {
  renderKpis();
  renderCoverage();
  renderPriceBandTable();
  renderTopCategoryTable();
  renderTopProducts();
  renderSeasonView();
  renderAutumnList();
}

if (!DATA) {
  document.body.innerHTML = "<main><h1>数据文件未加载</h1><p>请确认 assets/data.js 存在。</p></main>";
} else {
  initControls();
  renderRules();
  render();
}
