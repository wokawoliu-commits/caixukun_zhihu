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
    XHS_ROOT / "04_小红书调研报告_第二步.md",
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
        if note_id in links:
            if row.get("raw_url") != links[note_id]:
                row["raw_url"] = links[note_id]
                changed += 1
            row["metadata_status"] = "api_detail_verified"
    path.write_text(
        "".join(json.dumps(row, ensure_ascii=False) + "\n" for row in rows),
        encoding="utf-8",
    )
    return changed


def update_report(path: Path, links: dict[str, str], raw_count: int) -> int:
    text = path.read_text(encoding="utf-8")
    changed = 0

    def replace(match: re.Match[str]) -> str:
        nonlocal changed
        share_url = links.get(match.group(1))
        if not share_url:
            return match.group(0)
        changed += 1
        return share_url

    text = NOTE_URL_RE.sub(replace, text)
    detail_count = len(links)
    cost = raw_count / 100
    text = re.sub(r"归档\d+个API响应文件", f"归档{raw_count}个API响应文件", text)
    text = re.sub(r"共\d+个响应文件", f"共{raw_count}个响应文件", text)
    text = re.sub(r"抽取\d+条详情", f"抽取{detail_count}条详情", text)
    text = re.sub(r"只有\d+条详情", f"只有{detail_count}条详情", text)
    text = re.sub(r"\d+个笔记详情", f"{detail_count}个笔记详情", text)
    text = re.sub(r"共归档\d+个响应", f"共归档{raw_count}个响应", text)
    text = re.sub(r"API响应归档：\d+个", f"API响应归档：{raw_count}个", text)
    text = re.sub(r"保守成本上限约\d+(?:\.\d+)?美元", f"保守成本上限约{cost:.2f}美元", text)
    text = re.sub(r"保守费用上限约\d+(?:\.\d+)?美元", f"保守费用上限约{cost:.2f}美元", text)
    path.write_text(text, encoding="utf-8")
    return changed


def update_manifests(raw_count: int, detail_count: int) -> None:
    cost = raw_count / 100
    api_path = XHS_ROOT / "api_call_manifest.json"
    api_manifest = json.loads(api_path.read_text(encoding="utf-8"))
    api_manifest["archived_response_files"]["note_details"] = detail_count
    api_manifest["total_archived_responses"] = raw_count
    api_manifest["estimated_max_cost_usd_at_0_01_per_response"] = cost
    api_path.write_text(json.dumps(api_manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    manifest_paths = (
        XHS_ROOT / "run_manifest.json",
        COMBINED_ROOT / "run_manifest.json",
        DEPLOY_ROOT / "data/run_manifest.json",
    )
    for path in manifest_paths:
        manifest = json.loads(path.read_text(encoding="utf-8"))
        provider = manifest.setdefault("provider_config", {})
        if "estimated_max_cost_usd" in provider:
            provider["estimated_max_cost_usd"] = cost
        if "xiaohongshu_estimated_max_cost_usd" in provider:
            provider["xiaohongshu_estimated_max_cost_usd"] = cost
        counts = manifest.get("counts")
        if isinstance(counts, dict) and "xiaohongshu_detail_samples" in counts:
            counts["xiaohongshu_detail_samples"] = detail_count
        path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


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
    detail_files = list((XHS_ROOT / "raw").glob("detail_*.json"))
    if not links or len(links) != len(detail_files):
        raise SystemExit(f"Expected one share link for each detail file: files={len(detail_files)}, links={len(links)}")
    raw_count = len(list((XHS_ROOT / "raw").glob("*.json")))
    source_changes = {str(path): update_sources(path, links) for path in SOURCE_FILES}
    report_changes = {str(path): update_report(path, links, raw_count) for path in REPORT_FILES}
    update_manifests(raw_count, len(links))
    build_html()
    print(json.dumps({
        "share_links": len(links),
        "source_changes": source_changes,
        "report_changes": report_changes,
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
