#!/bin/zsh
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR"

if [[ ! -d node_modules ]]; then
  echo "缺少本地运行依赖。请保留项目中的 node_modules 文件夹。"
  echo "按回车键退出。"
  read -r
  exit 1
fi

echo "正在启动京学龄本地网站……"
npm run local &
SERVER_PID=$!

cleanup() {
  if kill -0 "$SERVER_PID" 2>/dev/null; then
    kill "$SERVER_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT INT TERM

for attempt in {1..30}; do
  if curl -fsS http://localhost:4173/ >/dev/null 2>&1; then
    open http://localhost:4173/
    echo "网站已打开：http://localhost:4173/"
    echo "关闭这个终端窗口即可停止网站。"
    wait "$SERVER_PID"
    exit 0
  fi
  sleep 0.2
done

echo "本地网站未能在 4173 端口启动，请确认该端口没有被其他程序占用。"
wait "$SERVER_PID"
