#!/usr/bin/env python3
"""Fetch missing TikHub App V2 details without persisting the API key."""

from __future__ import annotations

import json
import os
import random
import time
import urllib.parse
import urllib.request
from collections import Counter
from pathlib import Path


XHS_ROOT = Path("/Users/huangdong/Downloads/ding1/output/曾可妮_小红书调研_20260810")
RAW_ROOT = XHS_ROOT / "raw"
API_ROOT = "https://api.tikhub.io/api/v1/xiaohongshu/app_v2"


def read_jsonl(path: Path) -> list[dict]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def find_note(payload: object, note_id: str) -> dict | None:
    if isinstance(payload, dict):
        if payload.get("id") == note_id and (payload.get("share_info") or {}).get("link"):
            return payload
        for value in payload.values():
            note = find_note(value, note_id)
            if note:
                return note
    elif isinstance(payload, list):
        for value in payload:
            note = find_note(value, note_id)
            if note:
                return note
    return None


def pending_notes() -> list[dict[str, str]]:
    candidates = {row["note_id"]: row for row in read_jsonl(XHS_ROOT / "trial_candidates.jsonl")}
    sources = read_jsonl(XHS_ROOT / "sources.jsonl")
    pending = []
    for source in sources:
        if source.get("metadata_status") != "api_search_preview":
            continue
        note_id = source["canonical_locator"].rsplit("/", 1)[-1]
        note_type = candidates.get(note_id, {}).get("note_type")
        if note_type not in {"normal", "video"}:
            raise RuntimeError(f"Unsupported or missing note type for {note_id}: {note_type!r}")
        if not (RAW_ROOT / f"detail_{note_id}.json").exists():
            pending.append({"note_id": note_id, "note_type": note_type})
    return pending


def fetch(note_id: str, note_type: str, api_key: str) -> dict:
    method = "get_video_note_detail" if note_type == "video" else "get_image_note_detail"
    url = f"{API_ROOT}/{method}?{urllib.parse.urlencode({'note_id': note_id})}"
    request = urllib.request.Request(
        url,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Accept": "application/json",
            "User-Agent": "CodexResearchArchive/1.0",
        },
    )
    with urllib.request.urlopen(request, timeout=90) as response:
        payload = json.loads(response.read().decode("utf-8"))
    if payload.get("code") != 200:
        raise RuntimeError(f"TikHub request failed for {note_id}: code={payload.get('code')}")
    if not find_note(payload, note_id):
        raise RuntimeError(f"TikHub response for {note_id} lacks the target share_info.link")
    return payload


def main() -> None:
    api_key = os.environ.get("TIKHUB_API_KEY", "").strip()
    if not api_key:
        raise SystemExit("TIKHUB_API_KEY is required and is never written to disk")

    pending = pending_notes()
    print(json.dumps({
        "pending": len(pending),
        "types": Counter(row["note_type"] for row in pending),
    }, ensure_ascii=False, default=dict))

    completed = []
    for index, row in enumerate(pending, start=1):
        note_id = row["note_id"]
        payload = fetch(note_id, row["note_type"], api_key)
        output = RAW_ROOT / f"detail_{note_id}.json"
        temporary = output.with_suffix(".json.tmp")
        temporary.write_text(json.dumps(payload, ensure_ascii=False), encoding="utf-8")
        temporary.replace(output)
        completed.append(note_id)
        print(f"[{index}/{len(pending)}] archived {note_id} ({row['note_type']})", flush=True)
        if index < len(pending):
            time.sleep(random.uniform(1.2, 2.0))

    print(json.dumps({"completed": len(completed), "note_ids": completed}, ensure_ascii=False))


if __name__ == "__main__":
    main()
