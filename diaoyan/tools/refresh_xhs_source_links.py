#!/usr/bin/env python3
"""Refresh verified Xiaohongshu bibliography URLs from archived TikHub details."""

from __future__ import annotations

import json
import re
import subprocess
import sys
from pathlib import Path


XHS_ROOT = Path("/Users/huangdong/Downloads/ding1/output/曾可妮_小红书调研_20260810")
COMBINED_ROOT = Path("/Users/huangdong/Downloads/ding1/output/曾可妮_综合调研_20260810")
DEPLOY_ROOT = Path("/Users/huangdong/Downloads/github/caixukun_zhihu/diaoyan")

SOURCE_FILES = (
    XHS_ROOT / "sources.jsonl",
    COMBINED_ROOT / "sources.jsonl",
    DEPLOY_ROOT / "data/sources.jsonl",
)
REPORT_FILES = (
    COMBINED_ROOT / "曾可妮_品牌访谈与概念企划综合调研报告_第三步.md",
    DEPLOY_ROOT / "曾可妮_品牌访谈与概念企划综合调研报告_第三步.md",
)
NOTE_URL_RE = re.compile(r"https://www\.xiaohongshu\.com/explore/([0-9a-f]+)")


def find_note(payload: object, note_id: str) -> dict | None:
    if isinstance(payload, dict):
        if payload.get("id") == note_id and (payload.get("share_info") or {}).get("link"):
            return payload
        for value in payload.values():
            found = find_note(value, note_id)
            if found:
                return found
    elif isinstance(payload, list):
        for value in payload:
            found = find_note(value, note_id)
            if found:
                return found
    return None


def load_share_links() -> dict[str, str]:
    links: dict[str, str] = {}
    for path in sorted((XHS_ROOT / "raw").glob("detail_*.json")):
        note_id = path.stem.removeprefix("detail_")
        note = find_note(json.loads(path.read_text(encoding="utf-8")), note_id)
        if note:
            links[note_id] = note["share_info"]["link"]
    return links


def update_sources(path: Path, links: dict[str, str]) -> int:
    rows = [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]
    changed = 0
    for row in rows:
        match = NOTE_URL_RE.match(row.get("canonical_locator", ""))
        note_id = match.group(1) if match else ""
        if row.get("metadata_status") == "api_detail_verified" and note_id in links:
            if row.get("raw_url") != links[note_id]:
                row["raw_url"] = links[note_id]
                changed += 1
    path.write_text(
        "".join(json.dumps(row, ensure_ascii=False) + "\n" for row in rows),
        encoding="utf-8",
    )
    return changed


def update_report(path: Path, links: dict[str, str]) -> int:
    text = path.read_text(encoding="utf-8")
    changed = 0

    def replace(match: re.Match[str]) -> str:
        nonlocal changed
        share_url = links.get(match.group(1))
        if not share_url:
            return match.group(0)
        changed += 1
        return share_url

    path.write_text(NOTE_URL_RE.sub(replace, text), encoding="utf-8")
    return changed


def build_html() -> None:
    jobs = (
        (
            COMBINED_ROOT / "build_html.py",
            COMBINED_ROOT / "曾可妮_品牌访谈与概念企划综合调研报告_第三步.md",
            COMBINED_ROOT / "曾可妮_品牌访谈与概念企划综合调研报告_第三步.html",
        ),
        (
            DEPLOY_ROOT / "tools/build_html.py",
            DEPLOY_ROOT / "曾可妮_品牌访谈与概念企划综合调研报告_第三步.md",
            DEPLOY_ROOT / "曾可妮_品牌访谈与概念企划综合调研报告_第三步.html",
        ),
        (
            DEPLOY_ROOT / "tools/build_html.py",
            DEPLOY_ROOT / "曾可妮_品牌访谈与概念企划综合调研报告_第三步.md",
            DEPLOY_ROOT / "index.html",
        ),
    )
    for builder, source, output in jobs:
        subprocess.run(
            [sys.executable, str(builder), "--input", str(source), "--output", str(output)],
            check=True,
        )


def main() -> None:
    links = load_share_links()
    if len(links) != 29:
        raise SystemExit(f"Expected 29 archived detail share links, found {len(links)}")
    source_changes = {str(path): update_sources(path, links) for path in SOURCE_FILES}
    report_changes = {str(path): update_report(path, links) for path in REPORT_FILES}
    build_html()
    print(json.dumps({
        "share_links": len(links),
        "source_changes": source_changes,
        "report_changes": report_changes,
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
