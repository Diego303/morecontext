#!/usr/bin/env bash
# Ejecuta todas las pruebas de los ejemplos con modelos simulados (sin claves reales).
# Uso: bash ejecutar_todo.sh   (desde cualquier carpeta)
set -u
DIR="$(cd "$(dirname "$0")" && pwd)"
BASE="$(dirname "$DIR")"
cd "$DIR"
export ANTHROPIC_API_KEY=sk-falsa OPENAI_API_KEY=sk-falsa PYDANTIC_AI_NO_BANNER=1 \
       CREWAI_DISABLE_TELEMETRY=true OTEL_SDK_DISABLED=true HAYSTACK_TELEMETRY_ENABLED=False

correr() {  # correr <venv> <script> [args]
  local venv="$1"; shift
  printf '\n### %s (%s)\n' "$*" "$venv"
  if timeout 180 "$BASE/$venv/bin/python" "$@" 2>&1 | grep -vE "Processing request|Warning|warn\(|INFO|^\s{20,}" ; then :; fi
}

correr venv        test_lc_01.py
correr venv        test_lc_02.py
correr venv        test_lg_01.py
correr venv        test_lg_02.py
correr venv        test_lg_03.py
correr venv        test_da_01.py
correr venv        test_mcp_01.py
correr venv-lcmcp  test_mcp_02.py
correr venv        test_oai_01.py
correr venv        test_pai_01.py
correr venv-llamaindex test_li_01.py
correr venv-crewai test_crew_01.py
for q in smolagents:smolagents dspy:dspy adk:adk haystack:haystack strands:strands maf:maf2; do
  correr "venv-${q#*:}" otros_01_minimos.py "${q%%:*}"
done
printf '\n### TypeScript (tsc --noEmit + pruebas en Node)\n'
cd "$BASE/ts" && npx tsc --noEmit -p . && echo "tsc OK" && node test_aisdk.mjs && node test_langchain.mjs
