# REA 安装与安卓连接记录

日期：2026-10-12。

## REA

- 上游：[morluto/rea](https://github.com/morluto/rea)。安装包 `rea-agents@6.4.0`。
- 隔离运行目录：`/Users/huangdong/.local/share/rea-runtime`，配套 `node@24.19.0`；原系统 Node 未替换。
- 命令入口：`/Users/huangdong/.homebrew/bin/rea`；已验证 `rea --version` 为 6.4.0。
- Codex 配置：`/Users/huangdong/.codex/config.toml`，原备份 `config.toml.rea.backup`。
- 技能：`/Users/huangdong/.agents/skills/reverse-engineer-anything/SKILL.md`。
- `rea doctor --client codex --skill --json` 的指定范围检查健康：Node、Codex 注册、技能身份均通过。结果在 `tools/rea-doctor-final.json`。
- 真正启动 MCP 子进程后，初始化和工具清单读取成功，返回 170 个工具；证据 `tools/rea-mcp-smoke.json`。

当前对话不会因安装而自动新增 MCP 工具，所以本次通过 REA CLI 完成安装包清单与 JavaScript 分析。新建对话或重启 Codex 后可加载注册。没有安装 Hopper／Ghidra／IDA；因此不表示全部原生反汇编能力就绪。分析本次 JS／ZIP 资源不依赖这些引擎。

## 安卓连接

设备型号 HUAWEI P40（系统型号 ANA-AN00），用户说明 HarmonyOS 4.2.0，ADB 报底层 Android 12。早先 Mac USB 树和 ADB 均未发现手机；更换接口和切 USB 模式后仍未恢复。手机重启、解锁重连并由用户确认 USB 调试授权后，ADB 返回 `device`，只读 shell 检查成功。只能确认恢复步骤，不能据此断定唯一根因。

游戏包为 `cn.wdhysj.huawei`，安装版本 1.2.1，入口游戏版本 `V460.0.18-prod`。Appium 使用 `noReset=true`、`fullReset=false`，复用既有辅助包，创建本任务自己的会话；未清除应用数据或登录态。本记录不含设备序列号和账号凭据。

访问参考用户指定的 安卓访问技能。用户随后明确授权“登录页你操作就行”，按此授权点击开始游戏并成功进入花园，完成当前页面采样；结束时返回主界面并关闭本任务 Appium 会话。未出现需处理的密码或验证码。
