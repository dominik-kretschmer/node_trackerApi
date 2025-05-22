#!/usr/bin/env bash
set -uo pipefail

OUTFILE="./test_logs/curl-results.json"

readarray -t cmds < <(node ./createCurl.js)

echo "[" > "$OUTFILE"

json_escape() {
  local str="$1"
  printf "%s" "$str" \
    | sed -e 's/\\\\/\\\\\\\\/g' -e 's/\"/\\\"/g' -e ':a;N;s/\n/\\n/g;ta'
}
first=true
for idx in "${!cmds[@]}"; do
  sleep 0.01
  cmd="${cmds[idx]//$'\r'/}"
  resp=$(eval "$cmd" 2>&1)

  esc_resp=$(json_escape "$resp")
  esc_cmd=$(json_escape "$cmd")

  if [ "$first" = true ]; then
    first=false
  else
    echo "," >> "$OUTFILE"
  fi

  printf '  {"response": "%s", "command": "%s"}' "$esc_resp" "$esc_cmd" >> "$OUTFILE"
done

echo "
"

echo "]" >> "$OUTFILE"
