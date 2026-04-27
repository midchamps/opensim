#!/usr/bin/env bash
# Phase-12 regression — run all 8 golden cases sequentially.
# Logs per-case go to logs/regression-<case>.log; summary appended to
# logs/regression-summary.txt.

set -u
cd "$(dirname "$0")/.."

mkdir -p logs
SUMMARY="logs/regression-summary.txt"
{
  echo "=========================================="
  echo "Phase-12 regression — $(date -Iseconds)"
  echo "=========================================="
} > "$SUMMARY"

CASES=(pendulum boids titration ph reactionRate population invasive selection)

for case in "${CASES[@]}"; do
  LOG="logs/regression-${case}.log"
  echo ">>> $case  (log: $LOG)" | tee -a "$SUMMARY"
  START=$(date +%s)
  npm test -- "$case" > "$LOG" 2>&1
  EXIT=$?
  END=$(date +%s)
  DURATION=$((END - START))
  STATUS_LINE=$(grep -E "^Status:" "$LOG" | tail -1)
  FILES_LINE=$(grep -E "^Files:" "$LOG" | tail -1)
  API_ERR=$(grep -c "API Error" "$LOG" || true)
  {
    echo "  exit=$EXIT  duration=${DURATION}s  $STATUS_LINE  $FILES_LINE  apiErrors=$API_ERR"
  } | tee -a "$SUMMARY"
done

{
  echo "=========================================="
  echo "Done — $(date -Iseconds)"
  echo "=========================================="
} >> "$SUMMARY"
