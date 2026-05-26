const DATA = window.__ALL_SKU_DATA__;
const BRAND_ORDER = ["Fysea", "Oneup", "THE BLENDER", "tbh家居（THE BEAST）", "Ubras家居服", "Almondrocks", "gelato pique", "AAAD / an action a day", "TWOI Design Lab", "Victoria's Secret 维多利亚的秘密", "MUJI 无印良品", "Zara Home"];
const CATEGORY_ORDER = ["背心吊带-单件", "背心吊带-多件/套装", "T恤", "内裤", "裤装-短裤", "裤装-长裤", "衬衫-长袖", "家居服-上装", "家居服-裤装", "家居服-套装", "眼罩", "非核心-裙装/连衣裙", "非核心-袍服", "非核心-其他"];
const state = {
  brand: "全部品牌",
  category: "全部品类",
  core: "全部",
  price: "全部",
  image: "全部",
  search: "",
  view: "grid",
  priceMin: null,
  priceMax: null,
};
const $ = (id) => document.getElementById(id);

function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function money(value) {
  return Number.isFinite(value) ? "¥" + Math.round(value).toLocaleString("zh-CN") : "—";
}

function num(value) {
  return Number.isFinite(value) ? Math.round(value).toLocaleString("zh-CN") : "—";
}

function parseNumberParam(params, names) {
  for (const name of names) {
    const raw = params.get(name);
    if (raw === null || raw === "") continue;
    const value = Number(raw);
    if (Number.isFinite(value)) return value;
  }
  return null;
}

function applyQueryParams() {
  const params = new URLSearchParams(window.location.search);
  const fromParam = (name, allowed, fallback) => {
    const value = params.get(name);
    return value && allowed.includes(value) ? value : fallback;
  };

  state.brand = fromParam("brand", ["全部品牌", ...BRAND_ORDER], state.brand);
  state.category = fromParam("category", ["全部品类", ...CATEGORY_ORDER], state.category);
  state.core = fromParam("core", ["全部", "核心品类", "非核心/剔除"], state.core);
  state.price = fromParam("price", ["全部", "有价格", "缺价格"], state.price);
  state.image = fromParam("image", ["全部", "有本地图片", "无本地图片"], state.image);
  state.search = params.get("search") || params.get("q") || "";
  state.view = fromParam("view", ["grid", "table"], state.view);
  state.priceMin = parseNumberParam(params, ["min", "priceMin"]);
  state.priceMax = parseNumberParam(params, ["max", "priceMax"]);
}

function priceRangeLabel() {
  if (!Number.isFinite(state.priceMin) && !Number.isFinite(state.priceMax)) return "";
  if (Number.isFinite(state.priceMin) && Number.isFinite(state.priceMax)) {
    return `${money(state.priceMin)}-${money(state.priceMax - 1)}`;
  }
  if (Number.isFinite(state.priceMin)) return `${money(state.priceMin)}+`;
  return `<${money(state.priceMax)}`;
}

function picture(row, cls = "") {
  if (!row.localImageWebp && !row.localImageAvif) return "";
  return `<picture${cls ? ` class="${cls}"` : ""}>${row.localImageAvif ? `<source srcset="${esc(row.localImageAvif)}" type="image/avif">` : ""}${row.localImageWebp ? `<source srcset="${esc(row.localImageWebp)}" type="image/webp">` : ""}<img src="${esc(row.localImageWebp || row.localImageAvif)}" alt="${esc(row.title)}" loading="lazy"></picture>`;
}

function syncControls() {
  $("brandFilter").value = state.brand;
  $("categoryFilter").value = state.category;
  $("coreFilter").value = state.core;
  $("priceFilter").value = state.price;
  $("imageFilter").value = state.image;
  $("searchInput").value = state.search;
  document.querySelectorAll(".segmented button").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === state.view);
  });
}

function init() {
  document.title = "核心 SKU 明细 · 新分类策略";
  $("heroCount").textContent = DATA.rows.length.toLocaleString("zh-CN");
  $("brandFilter").innerHTML = ["全部品牌", ...BRAND_ORDER].map((value) => `<option>${esc(value)}</option>`).join("");
  $("categoryFilter").innerHTML = ["全部品类", ...CATEGORY_ORDER].map((value) => `<option>${esc(value)}</option>`).join("");

  applyQueryParams();
  syncControls();

  $("brandFilter").onchange = (event) => {
    state.brand = event.target.value;
    render();
  };
  $("categoryFilter").onchange = (event) => {
    state.category = event.target.value;
    render();
  };
  $("coreFilter").onchange = (event) => {
    state.core = event.target.value;
    render();
  };
  $("priceFilter").onchange = (event) => {
    state.price = event.target.value;
    render();
  };
  $("imageFilter").onchange = (event) => {
    state.image = event.target.value;
    render();
  };
  $("searchInput").oninput = (event) => {
    state.search = event.target.value;
    render();
  };
  document.querySelectorAll(".segmented button").forEach((button) => {
    button.onclick = () => {
      state.view = button.dataset.view;
      syncControls();
      render();
    };
  });
  render();
}

function filtered() {
  const query = state.search.trim().toLowerCase();
  return DATA.rows.filter((row) => {
    if (state.brand !== "全部品牌" && row.brand !== state.brand) return false;
    if (state.category !== "全部品类" && row.category !== state.category) return false;
    if (state.core === "核心品类" && !row.includeInCore) return false;
    if (state.core === "非核心/剔除" && row.includeInCore) return false;
    if (state.price === "有价格" && !Number.isFinite(row.price)) return false;
    if (state.price === "缺价格" && Number.isFinite(row.price)) return false;
    if (Number.isFinite(state.priceMin) && (!Number.isFinite(row.price) || row.price < state.priceMin)) return false;
    if (Number.isFinite(state.priceMax) && (!Number.isFinite(row.price) || row.price >= state.priceMax)) return false;
    if (state.image === "有本地图片" && !row.localImage) return false;
    if (state.image === "无本地图片" && row.localImage) return false;
    if (!query) return true;
    return `${row.brand} ${row.category} ${row.title} ${row.shopName} ${row.itemId} ${row.skuSummary} ${row.categoryBasis} ${row.previousCategory || ""}`.toLowerCase().includes(query);
  });
}

function renderSummary(rows) {
  const core = rows.filter((row) => row.includeInCore).length;
  const excluded = rows.length - core;
  const priced = rows.filter((row) => Number.isFinite(row.price)).length;
  const images = rows.filter((row) => row.localImage).length;
  const changed = rows.filter((row) => row.categoryChanged).length;
  $("summary").innerHTML = [
    ["筛选后SKU", num(rows.length), "当前条件命中"],
    ["核心品类", num(core), excluded ? num(excluded) + " 条剔除" : "无剔除"],
    ["有价格", Math.round((priced / (rows.length || 1)) * 100) + "%", num(priced) + " 条"],
    ["有本地图片", Math.round((images / (rows.length || 1)) * 100) + "%", num(images) + " 张"],
    ["分类变更", num(changed), "相对 fuzhuang9"],
  ]
    .map(([label, value, detail]) => `<div class=stat><span>${label}</span><strong>${value}</strong><em>${detail}</em></div>`)
    .join("");
}

function productCard(row) {
  return `<article class="sku ${row.includeInCore ? "" : "excluded"}">${row.localImageWebp || row.localImageAvif ? picture(row) : `<div class="no-img">${row.hasRemoteImage ? "图片未下载" : "无图"}</div>`}<div><h2>${esc(row.title)}</h2><div class="chips"><span class="chip">${esc(row.brand)}</span><span class="chip">${esc(row.category)}</span><span class="chip">${money(row.price)}</span><span class="chip">${row.salesText ? esc(row.salesText) : num(row.sales)}</span>${row.includeInCore ? "" : '<span class="chip warn">非核心</span>'}</div><small>店铺：${esc(row.shopName || "—")} ｜ itemId：${esc(row.itemId || "—")}</small><small>分类依据：${esc(row.categoryBasis || "")}</small><div class="links">${row.productUrl ? `<a href="${esc(row.productUrl)}" target="_blank">商品链接</a>` : "<span>链接缺失</span>"}<a href="#tableView" onclick="window.__jumpToTable && window.__jumpToTable()">表格定位</a></div></div></article>`;
}

function tableRow(row) {
  return `<tr class="${row.includeInCore ? "" : "excluded"}"><td>${row.localImageWebp || row.localImageAvif ? picture(row, "thumb-picture") : "—"}</td><td>${esc(row.brand)}</td><td>${esc(row.category)}</td><td>${row.includeInCore ? "核心" : "剔除"}</td><td>${esc(row.title)}</td><td class=num>${money(row.price)}</td><td>${row.salesText ? esc(row.salesText) : num(row.sales)}</td><td>${esc(row.shopName || "")}</td><td>${row.productUrl ? `<a href="${esc(row.productUrl)}" target="_blank">打开</a>` : "—"}</td><td>${esc(row.itemId || "")}</td><td>${esc(row.previousCategory || "")}</td><td>${esc(row.categoryBasis || "")}</td></tr>`;
}

function renderList() {
  const rows = filtered();
  const range = priceRangeLabel();
  $("pageInfo").innerHTML = `已展示 ${num(rows.length)} / 共命中 ${num(rows.length)} 条${range ? ` ｜ 价格区间：${esc(range)} <button class="clear-range" type="button" onclick="window.__clearPriceRange()">清除区间</button>` : ""}`;
  $("gridView").hidden = state.view !== "grid";
  $("tableView").hidden = state.view !== "table";
  $("gridView").innerHTML = rows.map(productCard).join("") || "<p>没有匹配的SKU。</p>";
  $("skuTable").innerHTML = `<thead><tr><th>图</th><th>品牌</th><th>品类</th><th>口径</th><th>标题</th><th>价格</th><th>销量</th><th>店铺</th><th>链接</th><th>itemId</th><th>原品类</th><th>分类依据</th></tr></thead><tbody>${rows.map(tableRow).join("")}</tbody>`;
}

window.__jumpToTable = () => {
  state.view = "table";
  syncControls();
  renderList();
};

window.__clearPriceRange = () => {
  state.priceMin = null;
  state.priceMax = null;
  const url = new URL(window.location.href);
  ["min", "max", "priceMin", "priceMax"].forEach((key) => url.searchParams.delete(key));
  window.history.replaceState(null, "", url);
  render();
};

function render() {
  const rows = filtered();
  renderSummary(rows);
  renderList();
}

init();
