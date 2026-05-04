#!/usr/bin/env python3
from __future__ import annotations

import csv
import json
import shutil
from collections import Counter
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path("/Users/huangdong/Downloads/codex-zhihu0526/output/zhihu_knowledge_up/final")
SEARCH_WORKBOOK = Path("/Users/huangdong/Downloads/codex-zhihu0526/output/zhihu_knowledge_up/knowledge-up-zhihu-search.xlsx")
ASSETS = ROOT / "assets"


def read_csv(path: Path) -> list[dict[str, str]]:
    with path.open(encoding="utf-8-sig", newline="") as handle:
        return list(csv.DictReader(handle))


def read_jsonl(path: Path) -> list[dict]:
    with path.open(encoding="utf-8") as handle:
        return [json.loads(line) for line in handle if line.strip()]


def to_int(value) -> int:
    try:
        return int(float(value or 0))
    except (TypeError, ValueError):
        return 0


def main() -> None:
    ASSETS.mkdir(parents=True, exist_ok=True)

    summary_rows = read_csv(SOURCE / "knowledge-up-summary.csv")
    mention_rows = read_jsonl(SOURCE / "knowledge-up-mentions-clean.jsonl")
    failures = sum(1 for _ in (SOURCE / "knowledge-up-failures.tsv").open(encoding="utf-8"))

    summary = [
        {
            "name": row["up主名字"],
            "domain": row["主要知识领域"],
            "weight": to_int(row["总权重"]),
            "mentions": to_int(row["提及次数"]),
            "answerMentions": to_int(row["回答提及数"]),
            "commentMentions": to_int(row["评论提及数"]),
            "positive": to_int(row["正向/推荐"]),
            "negative": to_int(row["负向/避雷"]),
            "neutral": to_int(row["中性/提及"]),
            "exemplar": row["代表点评"],
            "sampleUrl": row["来源URL样例"],
        }
        for row in summary_rows
    ]
    summary_domain = {row["name"]: row["domain"] for row in summary}

    mentions = [
        {
            "name": row["up主名字"],
            "domain": summary_domain.get(row["up主名字"], row["知识领域"]),
            "comment": row["点评"],
            "weight": to_int(row["评论权重"]),
            "sourceType": row["来源类型"],
            "sentiment": row["推荐倾向"],
            "method": row["抽取方式"],
            "confidence": row["置信度"],
            "rawName": row["原始名称/别名"],
            "title": row["回答标题"],
            "url": row["来源URL"],
            "answerId": row["回答ID"],
            "sourceId": row["来源ID"],
            "answerVotes": to_int(row["回答赞同数"]),
            "answerComments": to_int(row["回答评论数"]),
            "author": row["知乎作者"],
            "keywords": row["命中关键词"],
            "createdAt": row["创建时间"],
        }
        for row in mention_rows
    ]

    domains = [
        {"name": name, "count": count}
        for name, count in Counter(row["domain"] for row in mentions).most_common()
    ]

    meta = {
        "searchCandidates": 3657,
        "answersProcessed": 143,
        "commentsProcessed": 11038,
        "mentions": len(mentions),
        "uniqueUps": len(summary),
        "failures": failures,
        "generatedAt": "2026-05-04 09:39:00",
    }

    payload = {
        "meta": meta,
        "domains": domains,
        "summary": summary,
        "mentions": mentions,
    }

    data_js = "window.UP_ZHIHU_DATA = " + json.dumps(payload, ensure_ascii=False, separators=(",", ":")) + ";\n"
    (ASSETS / "data.js").write_text(data_js, encoding="utf-8")

    shutil.copy2(SOURCE / "knowledge-up-summary.csv", ASSETS / "knowledge-up-summary.csv")
    shutil.copy2(SOURCE / "knowledge-up-mentions-clean.csv", ASSETS / "knowledge-up-mentions-clean.csv")
    shutil.copy2(SOURCE / "knowledge-up-mentions-partial.xlsx", ASSETS / "knowledge-up-mentions-partial.xlsx")
    shutil.copy2(SEARCH_WORKBOOK, ASSETS / "knowledge-up-zhihu-search.xlsx")

    print(f"WROTE {ASSETS / 'data.js'}")
    print(f"SUMMARY_ROWS {len(summary)}")
    print(f"MENTION_ROWS {len(mentions)}")


if __name__ == "__main__":
    main()
