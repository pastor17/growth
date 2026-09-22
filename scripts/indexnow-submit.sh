#!/usr/bin/env bash
# =============================================================
# IndexNow 批量提交 —— 让 Bing / Yandex / Seznam 等即时重新抓取
# 为什么重要：ChatGPT Search 的网页检索主要走 Bing 索引，
#             IndexNow 是目前唯一「提交即抓取」的公开通道（秒级~分钟级）。
#
# 用法：
#   ./scripts/indexnow-submit.sh              # 提交 sitemap 里的全部 URL
#   ./scripts/indexnow-submit.sh <url> [...]  # 只提交指定 URL（改完文章后最常用）
#
# 前置：密钥文件已随站点部署（static/<key>.txt），无需其他配置。
# =============================================================
set -euo pipefail

HOST="irudder.me"
KEY="ecb6acda329f4386b83be86c669ee80d"
KEY_LOCATION="https://${HOST}/${KEY}.txt"
ENDPOINT="https://api.indexnow.org/indexnow"
SITEMAP="https://${HOST}/sitemap.xml"

if [ "$#" -gt 0 ]; then
  URLS=("$@")
else
  echo "→ 从 ${SITEMAP} 拉取 URL 列表…"
  # 无 jq 依赖：用 grep 抽取 <loc> 内容
  URLS=()
  while IFS= read -r u; do
    URLS+=("$u")
  done < <(curl -sSL "$SITEMAP" | grep -o '<loc>[^<]*</loc>' | sed -e 's|<loc>||' -e 's|</loc>||')
fi

TOTAL=${#URLS[@]}
if [ "$TOTAL" -eq 0 ]; then
  echo "✗ 没有取到任何 URL，检查 sitemap 是否可访问：${SITEMAP}" >&2
  exit 1
fi
echo "→ 准备提交 ${TOTAL} 个 URL"

# IndexNow 单次请求上限 10000 条，这里按 200 分批，避免网关超时
BATCH=200
sent=0
for ((i = 0; i < TOTAL; i += BATCH)); do
  chunk=("${URLS[@]:i:BATCH}")
  # 拼 JSON 数组
  json_urls=$(printf '"%s",' "${chunk[@]}")
  json_urls="[${json_urls%,}]"
  payload=$(cat <<JSON
{"host":"${HOST}","key":"${KEY}","keyLocation":"${KEY_LOCATION}","urlList":${json_urls}}
JSON
)
  code=$(curl -sS -o /tmp/indexnow-resp.txt -w '%{http_code}' \
    -X POST "$ENDPOINT" \
    -H 'Content-Type: application/json; charset=utf-8' \
    --data-binary "$payload")
  sent=$((sent + ${#chunk[@]}))
  case "$code" in
    200|202) echo "  ✓ 已提交 ${sent}/${TOTAL}（HTTP ${code}）" ;;
    400) echo "  ✗ 400 请求格式错误" >&2; cat /tmp/indexnow-resp.txt >&2; exit 1 ;;
    403) echo "  ✗ 403 密钥校验失败：确认 ${KEY_LOCATION} 可公开访问且内容等于密钥" >&2; exit 1 ;;
    422) echo "  ✗ 422 URL 与 host 不匹配或不属于该域名" >&2; exit 1 ;;
    429) echo "  ! 429 触发限流，请稍后再试" >&2; exit 1 ;;
    *)   echo "  ? 未预期状态 ${code}" >&2; cat /tmp/indexnow-resp.txt >&2 ;;
  esac
done

echo "✓ 完成，共提交 ${sent} 个 URL"
echo
echo "提示：改完一篇文章后，用精准提交比全量提交更受引擎欢迎："
echo "  ./scripts/indexnow-submit.sh https://${HOST}/architecture/xxx/"
