#!/usr/bin/env python3
"""Build a self-contained, readable HTML edition of the research report."""

from __future__ import annotations

import argparse
import html
import re
from pathlib import Path

import markdown
from bs4 import BeautifulSoup


def slugify(text: str, used: set[str]) -> str:
    slug = re.sub(r"[^\w\u4e00-\u9fff]+", "-", text.lower()).strip("-") or "section"
    base = slug
    number = 2
    while slug in used:
        slug = f"{base}-{number}"
        number += 1
    used.add(slug)
    return slug


def strip_markdown(value: str) -> str:
    value = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", value)
    value = re.sub(r"[*_`]", "", value)
    return re.sub(r"\s+", " ", value).strip(" 。")


def split_report(markdown_text: str) -> tuple[str, str, str]:
    title_match = re.search(r"^#\s+(.+)$", markdown_text, flags=re.MULTILINE)
    title = title_match.group(1).strip() if title_match else "曾可妮品牌访谈与概念企划综合调研报告"
    body = re.sub(r"^#\s+.+\n", "", markdown_text, count=1, flags=re.MULTILINE)
    parts = re.split(r"^## Bibliography[^\n]*\n", body, maxsplit=1, flags=re.MULTILINE)
    return title, parts[0].strip(), parts[1].strip() if len(parts) == 2 else ""


def parse_bibliography(bibliography_md: str) -> list[dict[str, str]]:
    entries: list[dict[str, str]] = []
    for line in bibliography_md.splitlines():
        match = re.match(r"^\[(\d+)\]\s+(.+?)\s*$", line)
        if not match:
            continue
        number, raw = match.groups()
        link_match = re.search(r"\[([^\]]+)\]\((https?://[^)]+)\)", raw)
        url = link_match.group(2) if link_match else ""
        title = strip_markdown(link_match.group(1) if link_match else raw)
        prefix = strip_markdown(raw[: link_match.start()] if link_match else "")
        display = f"{prefix}。{title}" if prefix else title
        entries.append({"number": number, "raw": raw, "title": title, "display": display, "url": url})
    return entries


def convert_body(body_md: str, source_titles: dict[str, str]) -> tuple[str, list[dict[str, str]]]:
    body_html = markdown.markdown(
        body_md,
        extensions=["tables", "sane_lists", "toc"],
        extension_configs={"toc": {"permalink": False}},
        output_format="html5",
    )
    soup = BeautifulSoup(body_html, "html.parser")
    used_slugs: set[str] = set()
    toc: list[dict[str, str]] = []

    for heading in soup.find_all(["h2", "h3"]):
        level = heading.name
        label = heading.get_text(" ", strip=True)
        anchor_id = slugify(label, used_slugs)
        anchor = soup.new_tag("span", id=anchor_id)
        anchor["class"] = "heading-anchor"
        heading.insert_before(anchor)
        heading.attrs = {"class": ["section-title" if level == "h2" else "subsection-title"]}
        toc.append({"level": level, "label": label, "anchor": anchor_id})

    first_h2 = soup.find("h2")
    if first_h2 and "Executive Summary" in first_h2.get_text():
        first_h2["class"] = ["section-title", "executive-title"]
        next_node = first_h2.find_next_sibling()
        if next_node and next_node.name in {"ul", "ol"}:
            next_node["class"] = ["summary-grid"]

    for table in list(soup.find_all("table")):
        table["class"] = ["data-table"]
        wrapper = soup.new_tag("div")
        wrapper["class"] = "table-scroll"
        table.wrap(wrapper)

    body_fragment = str(soup)

    def citation_link(match: re.Match[str]) -> str:
        number = match.group(1)
        title = html.escape(source_titles.get(number, "查看参考来源"), quote=True)
        return f'<a class="citation" href="#ref-{number}" title="{title}" aria-label="来源 {number}">[{number}]</a>'

    body_fragment = re.sub(r"\[(\d+)\]", citation_link, body_fragment)
    return body_fragment, toc


def toc_html(items: list[dict[str, str]]) -> str:
    rows = []
    for item in items:
        level_class = "toc-sub" if item["level"] == "h3" else "toc-main"
        rows.append(
            f'<a class="toc-link {level_class}" href="#{html.escape(item["anchor"], quote=True)}">'
            f'{html.escape(item["label"])}</a>'
        )
    return "\n".join(rows)


def bibliography_html(entries: list[dict[str, str]]) -> str:
    rows = []
    for entry in entries:
        number = html.escape(entry["number"])
        display = html.escape(entry["display"])
        url = html.escape(entry["url"], quote=True)
        platform = "微博" if int(entry["number"]) <= 84 else "小红书"
        link = f'<a href="{url}" target="_blank" rel="noopener noreferrer">{display}</a>' if url else display
        search_text = html.escape(f"{number} {platform} {entry['display']}", quote=True)
        rows.append(
            f'<li class="bib-entry" id="ref-{number}" data-search="{search_text}">'
            f'<span class="bib-number">[{number}]</span>'
            f'<span class="platform-badge">{platform}</span>'
            f'<span class="bib-text">{link}</span>'
            f'<a class="back-to-report" href="#top" aria-label="返回报告顶部">返回顶部</a>'
            f'</li>'
        )
    return "\n".join(rows)


def build_html(markdown_path: Path, output_path: Path) -> None:
    markdown_text = markdown_path.read_text(encoding="utf-8")
    title, body_md, bibliography_md = split_report(markdown_text)
    entries = parse_bibliography(bibliography_md)
    source_titles = {entry["number"]: entry["display"] for entry in entries}
    body_fragment, toc_items = convert_body(body_md, source_titles)

    page = TEMPLATE.format(
        title=html.escape(title),
        date="2026-08-10",
        source_count=len(entries),
        toc=toc_html(toc_items),
        content=body_fragment,
        bibliography=bibliography_html(entries),
    )
    output_path.write_text(page, encoding="utf-8")


TEMPLATE = r'''<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <link rel="icon" href="data:,">
  <title>{title}</title>
  <style>
    :root {{
      --navy: #12344a;
      --navy-2: #204e68;
      --ink: #18242b;
      --muted: #64727a;
      --line: #d8e0e4;
      --soft: #f4f7f8;
      --paper: #ffffff;
      --accent: #a9573d;
      --sidebar: 292px;
    }}
    * {{ box-sizing: border-box; }}
    html {{ scroll-behavior: smooth; }}
    body {{
      margin: 0;
      color: var(--ink);
      background: #eef2f3;
      font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Noto Sans CJK SC", "Microsoft YaHei", sans-serif;
      font-size: 15px;
      line-height: 1.78;
    }}
    a {{ color: var(--navy-2); }}
    .skip-link {{ position: fixed; left: 12px; top: -60px; z-index: 100; background: white; padding: 8px 12px; border: 1px solid var(--navy); }}
    .skip-link:focus {{ top: 12px; }}
    .sidebar {{
      position: fixed;
      inset: 0 auto 0 0;
      width: var(--sidebar);
      background: var(--navy);
      color: white;
      display: flex;
      flex-direction: column;
      z-index: 20;
    }}
    .sidebar-head {{ padding: 24px 22px 18px; border-bottom: 1px solid rgba(255,255,255,.18); }}
    .sidebar-kicker {{ color: #b9ced9; font-size: 11px; letter-spacing: .12em; text-transform: uppercase; }}
    .sidebar-title {{ margin-top: 8px; font-size: 17px; line-height: 1.45; font-weight: 650; }}
    .toc {{ padding: 14px 10px 32px; overflow-y: auto; }}
    .toc-link {{
      display: block;
      color: #e8f0f3;
      text-decoration: none;
      border-left: 3px solid transparent;
      line-height: 1.45;
    }}
    .toc-main {{ padding: 8px 10px; margin-top: 2px; font-size: 13px; font-weight: 620; }}
    .toc-sub {{ padding: 5px 10px 5px 25px; font-size: 12px; color: #b9ced9; }}
    .toc-link:hover, .toc-link.active {{ background: rgba(255,255,255,.09); border-left-color: #d9a48f; color: #fff; }}
    .page {{ margin-left: var(--sidebar); min-height: 100vh; }}
    .hero {{ background: var(--paper); border-bottom: 1px solid var(--line); padding: 44px 54px 30px; }}
    .hero-inner, .metrics, .report {{ max-width: 1180px; margin: 0 auto; }}
    .eyebrow {{ color: var(--accent); font-size: 12px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }}
    h1 {{ color: var(--navy); font-size: clamp(28px, 3vw, 42px); line-height: 1.22; letter-spacing: -.035em; margin: 10px 0 16px; max-width: 980px; }}
    .hero-meta {{ display: flex; flex-wrap: wrap; gap: 10px 24px; color: var(--muted); font-size: 13px; }}
    .hero-actions {{ display: flex; gap: 10px; margin-top: 20px; }}
    .button {{ appearance: none; border: 1px solid var(--navy); background: white; color: var(--navy); padding: 8px 13px; font: inherit; font-size: 13px; cursor: pointer; text-decoration: none; }}
    .button.primary {{ color: white; background: var(--navy); }}
    .metrics-wrap {{ background: var(--soft); border-bottom: 1px solid var(--line); }}
    .metrics {{ display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); }}
    .metric {{ padding: 20px 18px; border-right: 1px solid var(--line); }}
    .metric:last-child {{ border-right: 0; }}
    .metric-number {{ display: block; color: var(--navy); font-size: 28px; line-height: 1.1; font-weight: 750; font-variant-numeric: tabular-nums; }}
    .metric-label {{ display: block; color: var(--muted); font-size: 12px; margin-top: 5px; }}
    .report {{ background: var(--paper); padding: 30px 54px 70px; }}
    blockquote {{ margin: 0 0 28px; padding: 13px 17px; background: var(--soft); border-left: 4px solid var(--navy-2); color: #43545d; }}
    blockquote p {{ margin: 0; }}
    .heading-anchor {{ display: block; position: relative; top: -18px; visibility: hidden; }}
    .section-title {{ color: var(--navy); font-size: 23px; line-height: 1.35; margin: 50px 0 18px; padding: 0 0 10px; border-bottom: 2px solid var(--navy); letter-spacing: -.012em; }}
    .subsection-title {{ color: var(--ink); font-size: 18px; line-height: 1.45; margin: 32px 0 12px; }}
    p {{ margin: 0 0 15px; }}
    strong {{ color: #0d2c3e; font-weight: 680; }}
    ul, ol {{ margin: 12px 0 20px; padding-left: 26px; }}
    li {{ margin: 7px 0; padding-left: 3px; }}
    .executive-title {{ margin-top: 16px; }}
    .summary-grid {{ list-style: none; padding: 0; display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 12px; }}
    .summary-grid li {{ margin: 0; padding: 15px 16px; background: var(--soft); border-left: 3px solid var(--navy-2); line-height: 1.65; }}
    .table-scroll {{ overflow-x: auto; margin: 18px 0 28px; border: 1px solid var(--line); }}
    .data-table {{ width: 100%; min-width: 760px; border-collapse: collapse; font-size: 13px; line-height: 1.55; }}
    .data-table th {{ position: sticky; top: 0; background: var(--navy); color: white; text-align: left; vertical-align: top; padding: 11px 12px; font-weight: 650; }}
    .data-table td {{ border-bottom: 1px solid var(--line); padding: 10px 12px; vertical-align: top; }}
    .data-table tbody tr:nth-child(even) {{ background: #f8fafb; }}
    .data-table tbody tr:hover {{ background: #edf4f6; }}
    code {{ padding: 2px 5px; background: var(--soft); border: 1px solid var(--line); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: .9em; }}
    .citation {{ color: var(--navy-2); background: #eaf2f5; text-decoration: none; font-size: 11px; font-weight: 700; padding: 1px 4px; margin: 0 1px; white-space: nowrap; }}
    .citation:hover {{ color: white; background: var(--navy-2); }}
    .bibliography {{ margin-top: 60px; padding-top: 8px; }}
    .bib-tools {{ display: flex; align-items: center; gap: 12px; margin: 14px 0 18px; }}
    .bib-search {{ flex: 1; min-width: 220px; border: 1px solid #aebcc3; padding: 10px 12px; font: inherit; background: white; }}
    .bib-count {{ color: var(--muted); font-size: 12px; white-space: nowrap; }}
    .bib-list {{ list-style: none; padding: 0; margin: 0; }}
    .bib-entry {{ display: grid; grid-template-columns: 46px 54px minmax(0,1fr) 62px; gap: 10px; align-items: start; margin: 0; padding: 12px 8px; border-bottom: 1px solid var(--line); font-size: 13px; }}
    .bib-entry:target {{ background: #fff4d8; outline: 2px solid #d3a034; }}
    .bib-number {{ color: var(--navy); font-weight: 750; font-variant-numeric: tabular-nums; }}
    .platform-badge {{ display: inline-block; border: 1px solid #aebcc3; color: #4f626c; padding: 1px 5px; font-size: 10px; text-align: center; white-space: nowrap; }}
    .bib-text a {{ text-decoration: none; }}
    .bib-text a:hover {{ text-decoration: underline; }}
    .back-to-report {{ font-size: 11px; color: var(--muted); text-decoration: none; text-align: right; }}
    .empty-state {{ display: none; padding: 24px; color: var(--muted); background: var(--soft); }}
    .footer {{ color: var(--muted); font-size: 12px; border-top: 1px solid var(--line); padding-top: 20px; margin-top: 35px; }}
    @media (max-width: 980px) {{
      :root {{ --sidebar: 0px; }}
      .sidebar {{ position: static; width: auto; height: auto; }}
      .sidebar-head {{ padding: 15px 18px; }}
      .sidebar-title {{ font-size: 14px; }}
      .toc {{ display: flex; overflow-x: auto; padding: 8px; white-space: nowrap; }}
      .toc-link {{ display: inline-block; border-left: 0; border-bottom: 3px solid transparent; }}
      .toc-sub {{ display: none; }}
      .page {{ margin-left: 0; }}
      .hero {{ padding: 30px 24px 24px; }}
      .report {{ padding: 25px 24px 55px; }}
      .metrics {{ grid-template-columns: repeat(3, 1fr); }}
      .metric {{ border-bottom: 1px solid var(--line); }}
    }}
    @media (max-width: 640px) {{
      body {{ font-size: 14px; }}
      .metrics {{ grid-template-columns: repeat(2, 1fr); }}
      .summary-grid {{ grid-template-columns: 1fr; }}
      .section-title {{ font-size: 20px; }}
      .bib-entry {{ grid-template-columns: 42px 50px minmax(0,1fr); }}
      .back-to-report {{ display: none; }}
      .hero-actions {{ flex-wrap: wrap; }}
    }}
    @media print {{
      body {{ background: white; font-size: 10pt; color: #111; }}
      .sidebar, .hero-actions, .bib-tools, .back-to-report, .skip-link {{ display: none !important; }}
      .page {{ margin: 0; }}
      .hero, .report {{ padding: 14mm 16mm; max-width: none; }}
      .metrics {{ display: table; width: 100%; }}
      .metric {{ display: table-cell; border: 1px solid #ccc; }}
      .section-title, .subsection-title {{ break-after: avoid; page-break-after: avoid; }}
      p, li {{ orphans: 3; widows: 3; }}
      .table-scroll {{ overflow: visible; border: 0; }}
      .data-table {{ min-width: 0; font-size: 7.5pt; break-inside: avoid; page-break-inside: avoid; }}
      .data-table th {{ position: static; background: #e7ecef; color: #111; }}
      .citation {{ color: #111; background: none; padding: 0; }}
      .bib-entry {{ break-inside: avoid; page-break-inside: avoid; }}
      a {{ color: #111; text-decoration: none; }}
    }}
  </style>
</head>
<body id="top">
  <a class="skip-link" href="#report">跳到正文</a>
  <aside class="sidebar" aria-label="报告目录">
    <div class="sidebar-head">
      <div class="sidebar-kicker">Research Report</div>
      <div class="sidebar-title">曾可妮品牌访谈与概念企划</div>
    </div>
    <nav class="toc">{toc}</nav>
  </aside>
  <div class="page">
    <header class="header">
      <div class="hero">
        <div class="hero-inner">
        <div class="eyebrow">微博 × 小红书跨平台综合调研</div>
        <h1>{title}</h1>
        <div class="hero-meta">
          <span>数据截止：{date}</span>
          <span>{source_count}个可回查来源</span>
          <span>适用：品牌、访谈导演、摄影与公关审核</span>
        </div>
        <div class="hero-actions">
          <a class="button primary" href="#executive-summary-执行摘要">从执行摘要开始</a>
          <a class="button" href="#bibliography">查看参考来源</a>
          <button class="button" type="button" onclick="window.print()">打印或另存为PDF</button>
        </div>
        </div>
      </div>
    </header>
    <div class="metrics-wrap">
      <div class="metrics" aria-label="关键数据">
        <div class="metric"><span class="metric-number">137</span><span class="metric-label">可回查来源</span></div>
        <div class="metric"><span class="metric-number">252</span><span class="metric-label">原子证据</span></div>
        <div class="metric"><span class="metric-number">30/30</span><span class="metric-label">获支持结论</span></div>
        <div class="metric"><span class="metric-number">15</span><span class="metric-label">拍摄主题</span></div>
        <div class="metric"><span class="metric-number">15</span><span class="metric-label">猫咪日常</span></div>
      </div>
    </div>
    <main class="content" id="report">
      <article class="report">
        {content}
        <section class="bibliography" id="bibliography">
        <h2 class="section-title">Bibliography｜参考来源</h2>
        <div class="bib-tools">
          <label for="bib-search">筛选来源</label>
          <input class="bib-search" id="bib-search" type="search" placeholder="输入编号、平台、作者或标题" autocomplete="off">
          <span class="bib-count" id="bib-count">显示 {source_count} 条</span>
        </div>
        <div class="empty-state" id="empty-state">没有匹配的来源。</div>
        <ol class="bib-list" id="bib-list">{bibliography}</ol>
        </section>
        <footer class="footer">本HTML为离线阅读版；事实边界、引用编号和来源链接以同目录Markdown报告及证据账本为准。</footer>
      </article>
    </main>
  </div>
  <script>
    (() => {{
      const input = document.getElementById('bib-search');
      const entries = Array.from(document.querySelectorAll('.bib-entry'));
      const count = document.getElementById('bib-count');
      const empty = document.getElementById('empty-state');
      input.addEventListener('input', () => {{
        const query = input.value.trim().toLowerCase();
        let visible = 0;
        entries.forEach((entry) => {{
          const match = !query || entry.dataset.search.toLowerCase().includes(query);
          entry.hidden = !match;
          if (match) visible += 1;
        }});
        count.textContent = `显示 ${{visible}} 条`;
        empty.style.display = visible ? 'none' : 'block';
      }});

      const links = Array.from(document.querySelectorAll('.toc-link'));
      const anchors = links.map((link) => document.getElementById(link.getAttribute('href').slice(1))).filter(Boolean);
      const observer = new IntersectionObserver((events) => {{
        const current = events.filter((event) => event.isIntersecting).sort((a,b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (!current) return;
        links.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${{current.target.id}}`));
      }}, {{ rootMargin: '-10% 0px -82% 0px', threshold: 0 }});
      anchors.forEach((anchor) => observer.observe(anchor));
    }})();
  </script>
</body>
</html>
'''


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    build_html(args.input, args.output)


if __name__ == "__main__":
    main()
