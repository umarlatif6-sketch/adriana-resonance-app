#!/bin/bash
# ═══════════════════════════════════════════════════════════
# ADRIANA RESONANCE APP — STRESS TEST v2
# Fixed endpoints: proper tRPC paths, GET for queries only
# Records: response times, status codes, error rates, throughput
# ═══════════════════════════════════════════════════════════

BASE_URL="http://localhost:3000"
TEST_NUM=$1
OUTPUT_FILE="stress-test-${TEST_NUM}.json"
CONCURRENT=20
TOTAL_REQUESTS=200

echo "═══ STRESS TEST #${TEST_NUM} ═══"
echo "Concurrent: ${CONCURRENT} | Total: ${TOTAL_REQUESTS}"
echo ""

# Arrays to collect data
ERRORS=0
SUCCESS=0
START_TIME=$(date +%s%N)

# Function to hit an endpoint and record
hit_endpoint() {
  local url=$1
  local label=$2
  local method=${3:-GET}
  local start=$(date +%s%N)
  
  if [ "$method" = "POST" ]; then
    local status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 \
      -X POST -H "Content-Type: application/json" \
      -d '{"0":{"json":{"sessionId":"stress-'${TEST_NUM}'-'$RANDOM'"}}}' \
      "$url" 2>/dev/null)
  else
    local status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$url" 2>/dev/null)
  fi
  
  local end=$(date +%s%N)
  local duration=$(( (end - start) / 1000000 ))
  
  if [ "$status" -ge 200 ] && [ "$status" -lt 400 ]; then
    SUCCESS=$((SUCCESS + 1))
  else
    ERRORS=$((ERRORS + 1))
  fi
  
  echo "${label}|${status}|${duration}"
}

# ─── CORRECTED ENDPOINTS ───────────────────────────────────
# All queries use GET with proper tRPC batch format
# Mutations use POST
ENDPOINTS=(
  "${BASE_URL}|homepage|GET"
  "${BASE_URL}/api/trpc/metaHex.compute?batch=1&input=%7B%220%22%3A%7B%7D%7D|metahex|GET"
  "${BASE_URL}/api/trpc/tracks.list?batch=1&input=%7B%220%22%3A%7B%7D%7D|seed_tracks|GET"
  "${BASE_URL}/api/trpc/trading.stats?batch=1&input=%7B%220%22%3A%7B%7D%7D|trading_stats|GET"
  "${BASE_URL}/api/trpc/trading.getAlert?batch=1&input=%7B%220%22%3A%7B%22json%22%3A%7B%22baselineHex%22%3A%2200FF4100%22%2C%22currentHex%22%3A%2200FF4100%22%2C%22baselineFrequency%22%3A432%2C%22currentFrequency%22%3A432%7D%7D%7D|trading_alert|GET"
)

# ─── WARMUP PHASE ──────────────────────────────────────────
echo "Phase 1: Sequential warm-up (5 requests per endpoint)"
echo "────────────────────────────────────────────────────"

declare -A WARMUP_TOTALS
declare -A WARMUP_STATUS

for endpoint_data in "${ENDPOINTS[@]}"; do
  IFS='|' read -r url label method <<< "$endpoint_data"
  WARMUP_TOTALS[$label]=0
  for i in $(seq 1 5); do
    result=$(hit_endpoint "$url" "$label" "$method")
    IFS='|' read -r rlabel rstatus rduration <<< "$result"
    WARMUP_TOTALS[$label]=$(( ${WARMUP_TOTALS[$label]} + rduration ))
    WARMUP_STATUS[$label]=$rstatus
    echo "  [WARMUP] ${rlabel}: ${rstatus} (${rduration}ms)"
  done
  WARMUP_TOTALS[$label]=$(( ${WARMUP_TOTALS[$label]} / 5 ))
done

echo ""
echo "Phase 2: Concurrent burst (${CONCURRENT} parallel x ${#ENDPOINTS[@]} endpoints)"
echo "────────────────────────────────────────────────────"
BURST_START=$(date +%s%N)

for round in $(seq 1 $((TOTAL_REQUESTS / CONCURRENT / ${#ENDPOINTS[@]} + 1))); do
  for endpoint_data in "${ENDPOINTS[@]}"; do
    IFS='|' read -r url label method <<< "$endpoint_data"
    for i in $(seq 1 $CONCURRENT); do
      hit_endpoint "$url" "${label}_burst" "$method" > /dev/null &
    done
  done
  wait
done
wait

BURST_END=$(date +%s%N)
BURST_DURATION=$(( (BURST_END - BURST_START) / 1000000 ))

echo "  Burst complete: ${BURST_DURATION}ms"

echo ""
echo "Phase 3: Sustained load (60 seconds continuous)"
echo "────────────────────────────────────────────────────"
SUSTAINED_SUCCESS=0
SUSTAINED_ERRORS=0
SUSTAINED_REQUESTS=0
SUSTAINED_START=$(date +%s)
SUSTAINED_MIN_RT=999999
SUSTAINED_MAX_RT=0
SUSTAINED_TOTAL_RT=0

while [ $(($(date +%s) - SUSTAINED_START)) -lt 60 ]; do
  for endpoint_data in "${ENDPOINTS[@]}"; do
    IFS='|' read -r url label method <<< "$endpoint_data"
    start_req=$(date +%s%N)
    
    if [ "$method" = "POST" ]; then
      status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 \
        -X POST -H "Content-Type: application/json" \
        -d '{"0":{"json":{"sessionId":"sustained-'${TEST_NUM}'-'$RANDOM'"}}}' \
        "$url" 2>/dev/null)
    else
      status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$url" 2>/dev/null)
    fi
    
    end_req=$(date +%s%N)
    rt=$(( (end_req - start_req) / 1000000 ))
    
    SUSTAINED_REQUESTS=$((SUSTAINED_REQUESTS + 1))
    SUSTAINED_TOTAL_RT=$((SUSTAINED_TOTAL_RT + rt))
    
    if [ "$rt" -lt "$SUSTAINED_MIN_RT" ]; then SUSTAINED_MIN_RT=$rt; fi
    if [ "$rt" -gt "$SUSTAINED_MAX_RT" ]; then SUSTAINED_MAX_RT=$rt; fi
    
    if [ "$status" -ge 200 ] && [ "$status" -lt 400 ]; then
      SUSTAINED_SUCCESS=$((SUSTAINED_SUCCESS + 1))
    else
      SUSTAINED_ERRORS=$((SUSTAINED_ERRORS + 1))
    fi
  done
done

SUSTAINED_AVG_RT=$((SUSTAINED_TOTAL_RT / (SUSTAINED_REQUESTS > 0 ? SUSTAINED_REQUESTS : 1)))
SUSTAINED_RPS=$((SUSTAINED_REQUESTS / 60))

END_TIME=$(date +%s%N)
TOTAL_DURATION=$(( (END_TIME - START_TIME) / 1000000 ))

# Memory and CPU snapshot
MEM_USAGE=$(ps aux | grep "tsx watch" | grep -v grep | awk '{print $6}' | head -1)
MEM_MB=$((${MEM_USAGE:-0} / 1024))
CPU_USAGE=$(ps aux | grep "tsx watch" | grep -v grep | awk '{print $3}' | head -1)

# Calculate error rate
if [ "$SUSTAINED_REQUESTS" -gt 0 ]; then
  ERROR_RATE=$(echo "scale=2; ${SUSTAINED_ERRORS} * 100 / ${SUSTAINED_REQUESTS}" | bc)
else
  ERROR_RATE=0
fi

# Test results
echo ""
echo "═══ STRESS TEST #${TEST_NUM} RESULTS ═══"
echo "Burst duration: ${BURST_DURATION}ms"
echo "Sustained: ${SUSTAINED_REQUESTS} reqs in 60s (${SUSTAINED_RPS} rps)"
echo "Sustained RT: min=${SUSTAINED_MIN_RT}ms avg=${SUSTAINED_AVG_RT}ms max=${SUSTAINED_MAX_RT}ms"
echo "Sustained success: ${SUSTAINED_SUCCESS} errors: ${SUSTAINED_ERRORS} (${ERROR_RATE}%)"
echo "Memory: ${MEM_MB}MB | CPU: ${CPU_USAGE}%"
echo "Total test duration: ${TOTAL_DURATION}ms"

# Write JSON results
cat > "$OUTPUT_FILE" << EOF
{
  "test_number": ${TEST_NUM},
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "label": "UPDATED_APP",
  "config": {
    "concurrent": ${CONCURRENT},
    "total_requests": ${TOTAL_REQUESTS},
    "sustained_duration_seconds": 60,
    "endpoints_tested": ${#ENDPOINTS[@]}
  },
  "warmup": {
    "homepage_avg_ms": ${WARMUP_TOTALS[homepage]:-0},
    "metahex_avg_ms": ${WARMUP_TOTALS[metahex]:-0},
    "seed_tracks_avg_ms": ${WARMUP_TOTALS[seed_tracks]:-0},
    "seed_tracks_status": ${WARMUP_STATUS[seed_tracks]:-0},
    "trading_stats_avg_ms": ${WARMUP_TOTALS[trading_stats]:-0},
    "trading_stats_status": ${WARMUP_STATUS[trading_stats]:-0},
    "trading_alert_avg_ms": ${WARMUP_TOTALS[trading_alert]:-0},
    "trading_alert_status": ${WARMUP_STATUS[trading_alert]:-0}
  },
  "burst": {
    "duration_ms": ${BURST_DURATION}
  },
  "sustained": {
    "total_requests": ${SUSTAINED_REQUESTS},
    "success": ${SUSTAINED_SUCCESS},
    "errors": ${SUSTAINED_ERRORS},
    "requests_per_second": ${SUSTAINED_RPS},
    "response_time_min_ms": ${SUSTAINED_MIN_RT},
    "response_time_avg_ms": ${SUSTAINED_AVG_RT},
    "response_time_max_ms": ${SUSTAINED_MAX_RT},
    "error_rate_percent": ${ERROR_RATE}
  },
  "system": {
    "memory_mb": ${MEM_MB},
    "cpu_percent": ${CPU_USAGE:-0}
  },
  "total_duration_ms": ${TOTAL_DURATION}
}
EOF

echo ""
echo "Results saved to ${OUTPUT_FILE}"
echo "═══ TEST #${TEST_NUM} COMPLETE ═══"
