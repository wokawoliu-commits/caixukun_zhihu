# 京学龄｜北京入学人口数据观察

这是一个只在本机运行的数据网站，不依赖“站点”托管，也不需要 ChatGPT 登录。

## 本地启动

双击 `启动本地网站.command`，浏览器会自动打开：

`http://localhost:4173/`

关闭启动网站的终端窗口即可停止服务。完整说明见 `本地使用说明.md`。

## 常用命令

- `npm run local`：在 `127.0.0.1:4173` 启动本地网站
- `npm run build`：验证生产构建
- `npm run prepare:github-pages`：生成可放入 GitHub Pages 子目录的 `index.html` 与静态资源
- `npm test`：构建并执行页面渲染测试
- `npm run lint`：检查代码

GitHub Pages 部署时，请把本项目根目录（包含生成后的 `index.html`、`assets/` 和 `downloads/`）放在仓库的 `xuequ/fenxi/` 目录下。

核心数据、图表、页面样式、分享图片和 Excel 数据包都保存在本地。政府来源链接只有在主动点击时才会联网。
