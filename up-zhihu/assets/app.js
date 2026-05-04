const data = window.UP_ZHIHU_DATA;

const state = {
  query: "",
  domain: "全部",
  source: "all",
  sentiment: "all",
  sort: "weight",
  selected: null,
};

const els = {
  notice: document.getElementById("notice"),
  metrics: document.getElementById("metrics"),
  search: document.getElementById("searchInput"),
  sort: document.getElementById("sortSelect"),
  source: document.getElementById("sourceSelect"),
  sentiment: document.getElementById("sentimentSelect"),
  domainStrip: document.getElementById("domainStrip"),
  domainBars: document.getElementById("domainBars"),
  domainHint: document.getElementById("domainHint"),
  resultCount: document.getElementById("resultCount"),
  summaryBody: document.getElementById("summaryBody"),
  detail: document.getElementById("detailPanel"),
  reset: document.getElementById("resetButton"),
};

const numberFormat = new Intl.NumberFormat("zh-CN");

function fmt(value) {
  return numberFormat.format(Number(value || 0));
}

function classForSentiment(value) {
  if (value === "正向/推荐") return "sentiment-positive";
  if (value === "负向/避雷") return "sentiment-negative";
  return "sentiment-neutral";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function includesQuery(record, query) {
  if (!query) return true;
  const haystack = [
    record.name,
    record.domain,
    record.exemplar,
    record.sampleUrl,
    record.keywords,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
}

function mentionPassesFilters(mention) {
  if (state.domain !== "全部" && mention.domain !== state.domain) return false;
  if (state.source !== "all" && mention.sourceType !== state.source) return false;
  if (state.sentiment !== "all" && mention.sentiment !== state.sentiment) return false;
  if (!state.query) return true;
  const haystack = [
    mention.name,
    mention.domain,
    mention.comment,
    mention.title,
    mention.author,
    mention.keywords,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(state.query);
}

function enrichedSummary() {
  const matchingMentions = data.mentions.filter(mentionPassesFilters);
  const grouped = new Map();
  for (const mention of matchingMentions) {
    if (!grouped.has(mention.name)) {
      grouped.set(mention.name, {
        name: mention.name,
        domain: mention.domain,
        weight: 0,
        mentions: 0,
        answerMentions: 0,
        commentMentions: 0,
        positive: 0,
        negative: 0,
        neutral: 0,
        exemplar: mention.comment,
        sampleUrl: mention.url,
      });
    }
    const item = grouped.get(mention.name);
    item.weight += Number(mention.weight || 0);
    item.mentions += 1;
    if (mention.sourceType === "回答") item.answerMentions += 1;
    if (mention.sourceType === "回答下评论") item.commentMentions += 1;
    if (mention.sentiment === "正向/推荐") item.positive += 1;
    else if (mention.sentiment === "负向/避雷") item.negative += 1;
    else item.neutral += 1;
    if (Number(mention.weight || 0) > Number(item.bestWeight || 0)) {
      item.bestWeight = Number(mention.weight || 0);
      item.exemplar = mention.comment;
      item.sampleUrl = mention.url;
    }
  }

  const query = state.query.toLowerCase();
  return [...grouped.values()].filter((record) => includesQuery(record, query));
}

function sortRows(rows) {
  const sorted = [...rows];
  sorted.sort((a, b) => {
    if (state.sort === "name") return a.name.localeCompare(b.name, "zh-CN");
    if (state.sort === "mentions") return b.mentions - a.mentions || b.weight - a.weight;
    if (state.sort === "comments") return b.commentMentions - a.commentMentions || b.weight - a.weight;
    if (state.sort === "positive") return b.positive - a.positive || b.weight - a.weight;
    return b.weight - a.weight || b.mentions - a.mentions;
  });
  return sorted;
}

function renderNotice() {
  els.notice.innerHTML = `
    <strong>阶段性结果：</strong>
    搜索得到 ${fmt(data.meta.searchCandidates)} 条候选回答；知乎 API 在抓取中途触发 403 / unhuman 校验。
    当前页面基于已成功保存的 ${fmt(data.meta.answersProcessed)} 条回答和 ${fmt(
      data.meta.commentsProcessed,
    )} 条回答下评论生成，可继续复核和后续续跑。
  `;
}

function renderMetrics() {
  const metrics = [
    ["候选回答", data.meta.searchCandidates],
    ["成功回答", data.meta.answersProcessed],
    ["评论记录", data.meta.commentsProcessed],
    ["结构化提及", data.meta.mentions],
    ["候选 UP 主", data.meta.uniqueUps],
    ["失败记录", data.meta.failures],
  ];
  els.metrics.innerHTML = metrics
    .map(([label, value]) => `<div class="metric"><span>${label}</span><strong>${fmt(value)}</strong></div>`)
    .join("");
}

function renderDomainStrip() {
  const domains = ["全部", ...data.domains.map((item) => item.name)];
  els.domainStrip.innerHTML = domains
    .map(
      (domain) => `
        <button class="chip ${state.domain === domain ? "active" : ""}" type="button" data-domain="${escapeHtml(domain)}">
          ${escapeHtml(domain)}
        </button>
      `,
    )
    .join("");
}

function renderDomainBars() {
  const max = Math.max(...data.domains.map((item) => item.count));
  els.domainHint.textContent = `${data.domains.length} 个领域标签，按提及记录计数`;
  els.domainBars.innerHTML = data.domains
    .map((item) => {
      const width = Math.max(4, Math.round((item.count / max) * 100));
      return `
        <button class="bar-row chipless" type="button" data-domain="${escapeHtml(item.name)}">
          <span class="bar-label"><span>${escapeHtml(item.name)}</span><strong>${fmt(item.count)}</strong></span>
          <span class="bar-track"><span class="bar-fill" style="width: ${width}%"></span></span>
        </button>
      `;
    })
    .join("");
}

function renderSummary() {
  const rows = sortRows(enrichedSummary());
  if (!state.selected && rows.length) state.selected = rows[0].name;
  if (state.selected && !rows.some((row) => row.name === state.selected)) {
    state.selected = rows[0]?.name ?? null;
  }

  els.resultCount.textContent = `显示 ${fmt(Math.min(rows.length, 300))} / ${fmt(rows.length)} 个结果`;
  els.summaryBody.innerHTML = rows
    .slice(0, 300)
    .map(
      (row) => `
        <tr data-name="${escapeHtml(row.name)}" class="${row.name === state.selected ? "selected" : ""}">
          <td class="name-cell">${escapeHtml(row.name)}</td>
          <td><span class="domain-tag">${escapeHtml(row.domain)}</span></td>
          <td>${fmt(row.weight)}</td>
          <td>${fmt(row.mentions)}</td>
          <td>${fmt(row.commentMentions)}</td>
        </tr>
      `,
    )
    .join("");
  renderDetail();
}

function renderDetail() {
  if (!state.selected) {
    els.detail.innerHTML = `<div class="detail-empty">没有匹配结果。调整筛选条件后会在这里显示详情。</div>`;
    return;
  }

  const mentions = data.mentions
    .filter((mention) => mention.name === state.selected)
    .filter(mentionPassesFilters)
    .sort((a, b) => Number(b.weight || 0) - Number(a.weight || 0));

  const weight = mentions.reduce((sum, item) => sum + Number(item.weight || 0), 0);
  const domain = mentions[0]?.domain || "";
  const positive = mentions.filter((item) => item.sentiment === "正向/推荐").length;
  const negative = mentions.filter((item) => item.sentiment === "负向/避雷").length;

  els.detail.innerHTML = `
    <div class="detail-head">
      <p class="eyebrow">Selected Creator</p>
      <h3>${escapeHtml(state.selected)}</h3>
      <div class="detail-meta">
        <span class="pill">${escapeHtml(domain)}</span>
        <span class="pill">${fmt(mentions.length)} 条点评</span>
        <span class="pill">${fmt(weight)} 总权重</span>
      </div>
    </div>
    <div class="detail-stats">
      <div class="detail-stat"><span>回答</span><strong>${fmt(mentions.filter((m) => m.sourceType === "回答").length)}</strong></div>
      <div class="detail-stat"><span>评论</span><strong>${fmt(mentions.filter((m) => m.sourceType === "回答下评论").length)}</strong></div>
      <div class="detail-stat"><span>正向</span><strong>${fmt(positive)}</strong></div>
      <div class="detail-stat"><span>避雷</span><strong>${fmt(negative)}</strong></div>
    </div>
    <div class="mentions">
      ${mentions
        .slice(0, 80)
        .map(
          (item) => `
          <article class="mention">
            <p>${escapeHtml(item.comment)}</p>
            <div class="mention-footer">
              <span>
                <strong class="${classForSentiment(item.sentiment)}">${escapeHtml(item.sentiment)}</strong>
                · ${escapeHtml(item.sourceType)}
                · 权重 ${fmt(item.weight)}
                · 置信度 ${escapeHtml(item.confidence)}
              </span>
              <a href="${escapeHtml(item.url)}" target="_blank" rel="noreferrer">来源</a>
            </div>
          </article>
        `,
        )
        .join("")}
    </div>
  `;
}

function render() {
  renderDomainStrip();
  renderDomainBars();
  renderSummary();
}

function resetFilters() {
  state.query = "";
  state.domain = "全部";
  state.source = "all";
  state.sentiment = "all";
  state.sort = "weight";
  state.selected = null;
  els.search.value = "";
  els.source.value = "all";
  els.sentiment.value = "all";
  els.sort.value = "weight";
  render();
}

function bindEvents() {
  els.search.addEventListener("input", (event) => {
    state.query = event.target.value.trim().toLowerCase();
    state.selected = null;
    renderSummary();
  });
  els.sort.addEventListener("change", (event) => {
    state.sort = event.target.value;
    renderSummary();
  });
  els.source.addEventListener("change", (event) => {
    state.source = event.target.value;
    state.selected = null;
    renderSummary();
  });
  els.sentiment.addEventListener("change", (event) => {
    state.sentiment = event.target.value;
    state.selected = null;
    renderSummary();
  });
  els.domainStrip.addEventListener("click", (event) => {
    const button = event.target.closest("[data-domain]");
    if (!button) return;
    state.domain = button.dataset.domain;
    state.selected = null;
    render();
  });
  els.domainBars.addEventListener("click", (event) => {
    const button = event.target.closest("[data-domain]");
    if (!button) return;
    state.domain = button.dataset.domain;
    state.selected = null;
    render();
  });
  els.summaryBody.addEventListener("click", (event) => {
    const row = event.target.closest("[data-name]");
    if (!row) return;
    state.selected = row.dataset.name;
    renderSummary();
  });
  els.reset.addEventListener("click", resetFilters);
}

renderNotice();
renderMetrics();
bindEvents();
render();
