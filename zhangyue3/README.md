# SNACKPAPER × 张月新版方案

本目录是独立于 `zhangyue1` 与 `zhangyue2` 的新版交付，旧版未被修改。

- `index.html`：可直接打开的完整静态报告
- `SNACKPAPER_张月_合作拍摄与营销方案.md`：可编辑正文
- `artifact.json`：静态报告的结构化源文件
- `sources.jsonl` / `evidence.jsonl` / `claims.jsonl`：研究证据层
- `run_manifest.json`：研究运行记录
- `DESIGN.md`：报告视觉与内容系统说明

如正文有修改，先运行 `node build_artifact.mjs` 生成 `artifact.json`，再使用 Data Analytics 的 portable artifact builder 生成 `index.html`。

