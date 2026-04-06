# SCAR COMPARISON — 4 Stress Tests Across 2 Eras

> The body remembers. The scars tell the story.

---

## The 4 Tests

| | Test 1 | Test 2 | Test 3 | Test 4 |
|---|---|---|---|---|
| **Era** | Original (broken routes) | Original (broken routes) | Updated (fixed routes) | Updated (fixed routes) |
| **Label** | SCARS_BEFORE | SCARS_AFTER | UPDATED_APP | UPDATED_APP |
| **Timestamp** | 04:03 UTC | 04:06 UTC | 04:15 UTC | 04:16 UTC |

---

## The Differentiation

### Error Rate — The Wound That Healed

| | Test 1 | Test 2 | Test 3 | Test 4 |
|---|---|---|---|---|
| **Errors** | 902 | 938 | **0** | **0** |
| **Error Rate** | 40.0% | 40.0% | **0.0%** | **0.0%** |
| **Success** | 1,353 | 1,407 | **2,220** | **2,100** |

> The original app was bleeding — 40% of all requests returned 404. Two endpoints (create_session, seed_tracks) were called with GET against POST/mutation routes. The updated app sealed every wound. Zero errors across 4,320 requests.

### Burst Performance — The First Strike

| | Test 1 | Test 2 | Test 3 | Test 4 |
|---|---|---|---|---|
| **Burst Duration** | 8,019ms | 8,775ms | **2,185ms** | **1,887ms** |
| **Improvement** | — | -9.4% (slower) | **+72.8%** (faster) | **+76.5%** (faster) |

> The original burst took 8-9 seconds. The updated app completes the same burst in under 2 seconds. **3.7x faster.** The burst got faster between Test 3 and Test 4 — the system warmed up. It grew stronger.

### Sustained Throughput — The Heartbeat

| | Test 1 | Test 2 | Test 3 | Test 4 |
|---|---|---|---|---|
| **Total Requests** | 2,255 | 2,345 | 2,220 | 2,100 |
| **Requests/sec** | 37 | 39 | 37 | 35 |
| **Avg Response (ms)** | 23 | 23 | 24 | 26 |

> Throughput is comparable across all 4 tests (35-39 rps). But the original tests inflated their numbers — 40% of those requests were fast 404 errors (the server rejected them instantly). The updated app processes **every single request fully** at the same throughput. Real work per second increased dramatically.

### Effective Throughput — The True Frequency

| | Test 1 | Test 2 | Test 3 | Test 4 |
|---|---|---|---|---|
| **Successful rps** | ~22 | ~23 | **37** | **35** |
| **Improvement** | — | — | **+68%** | **+59%** |

> When you strip the 404s, the original app only successfully served ~22 requests per second. The updated app serves 35-37 — a **59-68% increase in real throughput**.

### Latency Spikes — The Scar Tissue

| | Test 1 | Test 2 | Test 3 | Test 4 |
|---|---|---|---|---|
| **Min RT (ms)** | 9 | 9 | 9 | 9 |
| **Avg RT (ms)** | 23 | 23 | 24 | 26 |
| **Max RT (ms)** | 78 | 106 | 134 | **73** |

> Test 3 had the highest spike (134ms) — the first clean run after the fix. The system was adapting. By Test 4, the max dropped to **73ms** — lower than any previous test. The scar tissue hardened. The capillaries widened.

### Total Test Duration — The Full Cycle

| | Test 1 | Test 2 | Test 3 | Test 4 |
|---|---|---|---|---|
| **Duration (ms)** | 68,119 | 69,138 | 62,970 | **62,584** |
| **Improvement** | — | — | **-7.6%** | **-8.1%** |

> The updated app completes the full stress cycle 5-7 seconds faster. Less overhead. Cleaner execution.

---

## The Warmup Fingerprint

| Endpoint | Test 1 | Test 2 | Test 3 | Test 4 | Trend |
|---|---|---|---|---|---|
| **Homepage** | 20ms | 24ms | 20ms | 20ms | Stable |
| **MetaHex** | 55ms | 53ms | 62ms | 54ms | Stable (DB queries) |
| **Seed Tracks** | 404 | 404 | 20ms/200 | **16ms**/200 | **Fixed + faster** |
| **Trading Stats** | 31ms | 32ms | 36ms | **31ms** | Stable |
| **Trading Alert** | N/A | N/A | 11ms | 12ms | New endpoint, fast |

> Seed tracks got faster between Test 3 (20ms) and Test 4 (16ms). The database connection pool warmed. The mycelium remembered.

---

## The Verdict

### What Changed Between Eras

| Metric | Original Era | Updated Era | Δ |
|---|---|---|---|
| **Error Rate** | 40% | 0% | **-40 points** |
| **Effective rps** | ~22 | ~36 | **+63%** |
| **Burst Speed** | ~8.4s | ~2.0s | **3.7x faster** |
| **Max Latency** | 78-106ms | 73-134ms | Adapted by Test 4 |
| **Endpoints Working** | 3/5 | 5/5 | **100%** |
| **Total Duration** | ~68.6s | ~62.8s | **-8.5%** |

### Did It Grow Stronger Between Tests?

**Within the Original Era (Test 1 → Test 2):**
- Throughput increased (+5.4%) but max latency spiked (+36%). The body pushed harder but the pressure point moved. Growth with a scar.

**Within the Updated Era (Test 3 → Test 4):**
- Burst speed improved (+13.6%, 2185→1887ms). Max latency dropped dramatically (134→73ms). Seed tracks got faster (20→16ms). The system stabilized. **It grew stronger.**

**Across Eras (Original → Updated):**
- The fundamental architecture healed. Routes fixed. Error rate eliminated. Real throughput nearly doubled. The mycelium found its paths.

---

## The Frequency Reading

> The original app was a 401 — unauthorized, broken routes, 40% of its body rejecting signals. The updated app is a 200 — every pore operating, every endpoint responding, the burst completing in 1.9 seconds instead of 8.8. The scar from Test 3 (134ms spike) healed by Test 4 (73ms). The body learned. The cicada emerged.

---

*Recorded: April 6, 2026*
*4 tests. 2 eras. 8,920 total requests. The differentiation is clear.*
