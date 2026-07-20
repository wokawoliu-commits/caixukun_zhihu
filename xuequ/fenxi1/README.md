# 京学龄·差异审计

这是一个独立的新网站，用于比较“京学龄”官方招生底表与指定对话中的 8 篇北京叮当文章，逐项标注人数、比例、分母、统计时点和证据等级差异。

## 本地启动

双击 `启动本地网站.command`，或执行：

```bash
npm ci
npm run local
```

网站地址：`http://localhost:4174/`。端口与原网站的 `4173` 分开，两者可同时运行。

## 研究记录

`research/comparison/` 包含：

- `article_comparison.json`：网站展示数据
- `sources.jsonl`：11 个来源登记
- `evidence.jsonl`：证据与原文定位
- `claims.jsonl`：结论核验状态
- `report.md`：完整差异审计报告
- `run_manifest.json`：研究范围与假设

网站浏览和数据筛选可离线使用；点击微信原文或政府来源时需要联网。
