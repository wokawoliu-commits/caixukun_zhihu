# 曾可妮品牌访谈与概念企划调研

这是可直接部署的静态站点根目录。

## 入口

- `index.html`：HTML阅读版，部署后默认首页。
- `曾可妮_品牌访谈与概念企划综合调研报告_第三步.html`：同一份HTML的原文件名备份。

## 本地预览

在本目录运行：

```bash
python3 -m http.server 8765
```

然后打开 `http://127.0.0.1:8765/`。

## 资料追溯

- `曾可妮_品牌访谈与概念企划综合调研报告_第三步.md`：Markdown原始报告。
- `data/sources.jsonl`：137个来源。
- `data/evidence.jsonl`：252条原子证据。
- `data/claims.jsonl`：30条结论—证据记录。
- `docs/质量核验.md`：报告与HTML质量核验记录。

## 重新生成HTML

```bash
python3 tools/build_html.py \
  --input "曾可妮_品牌访谈与概念企划综合调研报告_第三步.md" \
  --output index.html
```

页面为单文件HTML，不依赖外部CSS、JavaScript或图片资源；`.nojekyll`用于兼容静态托管服务。
