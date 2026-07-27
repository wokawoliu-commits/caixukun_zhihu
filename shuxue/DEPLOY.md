# 部署说明

这是一个无需构建、无需安装依赖的纯静态网页。

- 站点入口：`index.html`
- 主视觉资源：`assets/math-animation-hero.png`
- 调研附件：根目录中的 Markdown 与 Excel 文件
- 知乎引用：页面中的“看知乎证据”等链接直接跳转原回答 URL

部署时请将本目录中的全部文件原样上传，并将 Web 根目录指向本目录。

本地预览可在本目录运行：

```bash
python3 -m http.server 8000
```

然后访问 `http://127.0.0.1:8000/`。
