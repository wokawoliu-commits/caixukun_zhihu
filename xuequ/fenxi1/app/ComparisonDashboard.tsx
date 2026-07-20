"use client";

import { useMemo, useState } from "react";
import comparison from "../research/comparison/article_comparison.json";

type Article = (typeof comparison.articles)[number];
type Filter = "all" | "critical" | "error" | "definition" | "complement";

const filters: Array<{ id: Filter; label: string }> = [
  { id: "all", label: "全部 8 篇" },
  { id: "critical", label: "重大冲突" },
  { id: "error", label: "计算 / 量表错误" },
  { id: "definition", label: "计划与实招" },
  { id: "complement", label: "补充维度" },
];

const severityLabel: Record<Article["severity"], string> = {
  critical: "需修正",
  medium: "需解释",
  low: "可补充",
};

function matchesFilter(article: Article, filter: Filter) {
  if (filter === "all") return true;
  if (filter === "critical") return article.severity === "critical";
  if (filter === "error") return article.type === "error";
  if (filter === "definition") {
    return ["definition", "scope", "update"].includes(article.type);
  }
  return article.type === "complement";
}

function number(value: number) {
  return new Intl.NumberFormat("zh-CN", { maximumFractionDigits: 2 }).format(value);
}

function DeltaMark({ value, unit }: { value: number; unit: string }) {
  const sign = value > 0 ? "+" : "";
  return (
    <span className={value === 0 ? "delta neutral" : Math.abs(value) < 20 ? "delta close" : "delta alert"}>
      {sign}{number(value)} {unit}
    </span>
  );
}

export default function ComparisonDashboard() {
  const [filter, setFilter] = useState<Filter>("all");
  const articles = useMemo(
    () => comparison.articles.filter((article) => matchesFilter(article, filter)),
    [filter],
  );

  return (
    <main id="top">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="京学龄差异审计首页">
          <span className="brand-mark">核</span>
          <span>
            <strong>京学龄·差异审计</strong>
            <small>OFFICIAL DATA × 8 ARTICLES</small>
          </span>
        </a>
        <nav aria-label="页面导航">
          <a href="#findings">关键差异</a>
          <a href="#definitions">口径</a>
          <a href="#articles">逐篇核验</a>
          <a href="#method">方法</a>
        </nav>
        <span className="edition">独立网站 · 2026.07</span>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">2025 北京中招数据审计</p>
          <h1>同一届学生，<br />为什么出现 <em>57.8%</em>、<em>80.8%</em>、<em>92%</em>？</h1>
          <p className="hero-intro">
            原网站记录教委实际招生数；8 篇文章混合使用招生计划、初三在籍人数、
            一分一段参考人数和网传录取线。这里不把数字强行拉平，而是标出每一处
            <strong>分子、分母、时点和算术差异</strong>。
          </p>
          <div className="hero-actions">
            <a className="primary-action" href="#findings">查看差异结论 ↓</a>
            <a className="text-action" href="downloads/beijing-education-population-data.xlsx" download>
              下载原网站底表
            </a>
          </div>
        </div>

        <div className="hero-ledger" aria-label="审计范围">
          <div><span>08</span><p>篇文章逐篇核验</p></div>
          <div><span>11</span><p>个可访问来源</p></div>
          <div><span>04</span><p>类差异标签</p></div>
          <div><span>03</span><p>处重大问题</p></div>
          <p className="ledger-note">基线：北京市教委 2025—2026 学年度普通中学分区统计</p>
        </div>
      </section>

      <section className="section finding-section" id="findings">
        <div className="section-head">
          <span>01 / 关键差异</span>
          <h2>先看能被精确复算的地方。</h2>
          <p>人数差定义为“教委实际招生－文章通道合计”。百分比差按同一文章所列分子、分母重算。</p>
        </div>

        <div className="finding-grid">
          {comparison.headline_findings.map((finding, index) => (
            <article className={`finding-card ${finding.severity}`} key={finding.id}>
              <div className="finding-index">0{index + 1}</div>
              <p className="finding-label">{finding.label}</p>
              <div className="finding-number-row">
                <strong>{number(finding.official)}</strong>
                <span>核验值</span>
              </div>
              <div className="comparison-line">
                <span>文章值 {number(finding.article)}</span>
                <DeltaMark value={finding.difference} unit={finding.unit} />
              </div>
              <p>{finding.summary}</p>
            </article>
          ))}
        </div>

        <div className="reconcile-panel">
          <div className="reconcile-copy">
            <p className="eyebrow">人数闭合度</p>
            <h3>朝阳几乎重合，西城仍少 355 人。</h3>
            <p>
              朝阳文章含“1+3”的 10,219 人，与教委实招 10,202 人仅差 17 人；
              西城文章合计 11,271 人，与教委实招 11,626 人相差 355 人。
              这更像计划、实招、跨区与统计时点的边界，而不是简单抄错。
            </p>
          </div>
          <div className="bar-compare" aria-label="西城和朝阳人数比较">
            <div className="bar-group">
              <div className="bar-title"><strong>西城区</strong><span>差 355 人</span></div>
              <div className="bar-track"><span className="bar official" style={{ width: "100%" }}><b>教委 11,626</b></span></div>
              <div className="bar-track"><span className="bar article" style={{ width: "96.95%" }}><b>文章 11,271</b></span></div>
            </div>
            <div className="bar-group">
              <div className="bar-title"><strong>朝阳区</strong><span>仅差 17 人</span></div>
              <div className="bar-track"><span className="bar official" style={{ width: "99.83%" }}><b>教委 10,202</b></span></div>
              <div className="bar-track"><span className="bar article" style={{ width: "100%" }}><b>文章 10,219</b></span></div>
            </div>
            <div className="bar-legend"><span className="official-dot">教委实招</span><span className="article-dot">文章通道合计</span></div>
          </div>
        </div>

        <div className="rate-panel">
          <div className="rate-title">
            <span>同名“比例”，不是同一件事</span>
            <p>57.82% 是同年两个不同届入口的容量比；80.82% 是文章队列估算；92% 没有分母。</p>
          </div>
          <div className="rate-scale">
            <div className="rate-row muted">
              <div><strong>57.82%</strong><span>网站同年入口容量比</span></div>
              <div className="rate-track"><i style={{ width: "57.82%" }} /></div>
              <small>11,626 ÷ 20,106，不是同届升学率</small>
            </div>
            <div className="rate-row verified">
              <div><strong>80.82%</strong><span>文章含1+3正确重算</span></div>
              <div className="rate-track"><i style={{ width: "80.82%" }} /></div>
              <small>11,271 ÷ 13,945</small>
            </div>
            <div className="rate-row danger">
              <div><strong>92%</strong><span>后续文章无分母说法</span></div>
              <div className="rate-track"><i style={{ width: "92%" }} /></div>
              <small>比可重算值高 11.18 个百分点</small>
            </div>
          </div>
        </div>
      </section>

      <section className="section definition-section" id="definitions">
        <div className="section-head inverse">
          <span>02 / 口径对照</span>
          <h2>数字之前，先把名词拆开。</h2>
          <p>同一个“2025”，可能指招生计划、录取过程、秋季实招或不同年级入口。</p>
        </div>
        <div className="definition-table" role="table" aria-label="网站和文章口径比较">
          <div className="definition-row header" role="row">
            <span>指标</span><span>原网站</span><span>8篇文章</span><span>能否直接比较</span>
          </div>
          {comparison.definitions.map((item) => (
            <div className="definition-row" role="row" key={item.term}>
              <strong>{item.term}</strong>
              <p>{item.website}</p>
              <p>{item.articles}</p>
              <p className="definition-answer">{item.comparison}</p>
            </div>
          ))}
        </div>
        <aside className="cohort-warning">
          <strong>最容易犯的错</strong>
          <p>2025 年“初中招生 20,106 人”是新初一；文章“初三在籍 13,855 人”是毕业年级。两者相差三个年级，不能互换分母。</p>
        </aside>
      </section>

      <section className="section articles-section" id="articles">
        <div className="section-head">
          <span>03 / 逐篇核验</span>
          <h2>8 篇文章，8 个差异标记。</h2>
          <p>每一条都保留原始微信链接；“补充维度”不代表文章错误，只表示原网站没有对应字段。</p>
        </div>

        <div className="filter-row" role="group" aria-label="筛选文章差异类型">
          {filters.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={filter === item.id}
              onClick={() => setFilter(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="article-list" aria-live="polite">
          {articles.map((article) => (
            <article className={`article-row ${article.severity}`} key={article.id}>
              <div className="article-meta">
                <span className="article-id">{article.id}</span>
                <time>{article.date}</time>
                <span className="severity">{severityLabel[article.severity]}</span>
              </div>
              <div className="article-body">
                <h3>{article.title}</h3>
                <dl>
                  <div><dt>文章数据</dt><dd>{article.claim}</dd></div>
                  <div className="difference"><dt>差异点</dt><dd>{article.difference}</dd></div>
                </dl>
              </div>
              <div className="article-verdict">
                <strong>{article.verdict}</strong>
                <a href={article.url} target="_blank" rel="noreferrer">打开原文 ↗</a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section method-section" id="method">
        <div className="section-head">
          <span>04 / 结论与方法</span>
          <h2>差异不是噪声，是口径留下的指纹。</h2>
        </div>
        <div className="method-grid">
          <article>
            <span>结论 01</span>
            <h3>文章没有推翻官方主序列。</h3>
            <p>朝阳总量几乎闭合，西城差3.15%。官方实招继续作为主数，文章用来解释招生通道和家长圈说法。</p>
          </article>
          <article>
            <span>结论 02</span>
            <h3>西城优势主要是容量与通道。</h3>
            <p>中位分只比朝阳高5分，但校额、提招、登记和西职普高班等通道占比更高；这比“朝阳学生考得差”更符合现有证据。</p>
          </article>
          <article>
            <span>结论 03</span>
            <h3>92%暂不进入主比较。</h3>
            <p>没有分子分母的百分比无法复算。网站保留来源和冲突标记，但不把它与80.82%连成同一序列。</p>
          </article>
        </div>
        <div className="method-note">
          <p><strong>核验流程</strong>：指定对话 → 8篇本地归档正文 → 分子分母重算 → 教委实招交叉核验 → 差异分级。</p>
          <p>完整研究记录保存在项目的 <code>research/comparison/</code>：来源表、证据表、结论表和审计报告均可复查。</p>
        </div>
      </section>

      <footer>
        <p><strong>京学龄·差异审计</strong> · 只对公开数据做口径核验，不提供升学承诺。</p>
        <a href="#top">返回顶部 ↑</a>
      </footer>
    </main>
  );
}
