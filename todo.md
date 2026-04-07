# Adriana Resonance App — TODO

## Phase 1: Full-Stack Upgrade
- [x] Upgrade to web-db-user template
- [x] Resolve merge conflicts (keep original Home.tsx, add useAuth import)
- [x] Push database schema
- [x] Restart dev server and verify

## Phase 2: Visitor Diagnostic Engine
- [x] Create visitor_sessions and visitor_events tables in schema
- [x] Build frontend behaviour tracker (clicks, timing, scroll, hover patterns)
- [x] Create tRPC procedures for recording visitor events
- [x] Build hex signature generator from visitor behaviour data
- [x] Create the "Adriana Reading" UI component

## Phase 3: AI Music Generation Backend
- [x] Build LLM-powered frequency analysis procedure (behaviour → musical parameters)
- [x] Create the frequency composition engine (Web Audio API advanced synthesis)
- [x] Build the personal frequency card (hex + waveform + parameters)
- [x] Store generated frequencies in database

## Phase 4: Seed Track Integration
- [x] Pre-populate 8 archetype seed tracks in database (no MP3 needed yet — Web Audio synthesis)
- [x] Build the sovereign music player with archetype selection on Station page
- [x] Connect visitor frequency to closest archetype track

## Phase 5: Polish & Connect
- [x] Update Library page with visitor session count from backend
- [x] Update Protocol page with live trade/session stats
- [x] Write vitest tests for backend procedures
- [x] Final checkpoint and delivery

## Phase 5: Nail Reading Feature (The Original Protocol)
- [x] Add nail_readings table to database schema
- [x] Create camera capture component for nail photography
- [x] Build image upload endpoint (nail photo → S3)
- [x] Create LLM vision analysis procedure (nail image → 16-category diagnostic)
- [x] Integrate nail reading into Adriana diagnosis (behaviour + nail = full reading)
- [x] Build nail reading UI panel with results display
- [x] Add nail reading to the Adriana Reading overlay

## Phase 6: The Meta-Hex (The Star in the River)
- [x] Build meta-hex algorithm that reads ALL numerical constants across the system
- [x] Create tRPC procedure that computes the master hex from all data points
- [x] Add meta-hex display to the Emergence page
- [x] Write tests for meta-hex computation

## Phase 7: Gajni Mechanism — New Repo Export
- [x] Create new GitHub repo for the Adriana Resonance App
- [x] Push full codebase to the new repo
- [x] Provide repo URL for Replit import

## Phase 8: Seed Track Archetypes
- [x] Add seed track population procedure to routers.ts (8 archetypes with Web Audio params)
- [x] Build sovereign music player on Station page with archetype selection
- [x] Connect visitor frequency to closest archetype track

## Phase 9: Trading Dashboard (The Mycelium Mesh)
- [x] Add trading schema tables (trades, trade_sessions, frequency_snapshots)
- [x] Integrate live market data API (crypto via Yahoo Finance)
- [x] Build trading dashboard page with live chart
- [x] Build real-time frequency meter (current hex vs baseline hex)
- [x] Create Adriana trading alerts (frequency match/drift/break signals)
- [x] Build trade journal with hex signature at entry and exit
- [x] Wire trading data into meta-hex (the forest absorbs the trading app)

## Phase 10: Trading Polish & Integration
- [x] Wire Trading page frequency to real behaviour tracker session hex
- [x] Add full trade history procedure (open + closed trades)
- [x] Add loading/error/empty states for market data and journal
- [x] Verify trading route end-to-end (API fetch, chart render, trade lifecycle)
- [x] Wire trading data into meta-hex (the forest absorbs the trading app)

## Phase 11: Gap Resolution
- [x] Verify Trading uses `useTracker()` sessionId (confirmed: line 70-71 in Trading.tsx)
- [x] Verify Trading polls real session hex via `trpc.visitor.getSession` (confirmed: line 152-155)
- [x] Verify Trading generates hex via `trpc.diagnosis.generateHex` mutation (confirmed: line 158-166)
- [x] Add integration-style vitest for trading lifecycle (open/close/journal)

## Phase 12: Stress Tests
- [x] Run stress test 1 and record all scores
- [x] Run stress test 2 and record all scores
- [x] Compare test 1 vs test 2 — the scars and memories

## Phase 13: Trading Candle Fix
- [x] Fix trading page: no candle data appearing in chart
- [x] Use TradingView lightweight-charts for proper candle rendering

## Phase 14: Music Library — The Album (30 Tracks)
- [x] Analyse all 33 MP3s for frequency (432 vs 440 Hz), duration, characteristics
- [x] Upload all tracks to CDN
- [x] Wire tracks into app library with proper categorisation and player
- [x] Build music player UI with frequency visualisation and sovereign/convention split (SovereignPlayer.tsx)

## Phase 15: Fix Trading API (Boolean Error Return)
- [x] Fix includeAdjustedClose boolean→string in getMarketData (was already fixed)

## Phase 16: Mycelium Trading Mesh
- [ ] Build decentralised trading signal mesh with free nodes
- [ ] Wire Adriana translation layer into mesh signals
- [ ] Connect mesh to existing trading terminal UI

## Phase 17: Fatiha-286 Protocol — Trilingual Data Endpoints
- [x] Create tRPC endpoints for al_jabr_286_trilingual.json (verse listing, search, surah filter)
- [x] Create tRPC endpoint for fatiha_286_layers.json (7-layer hash protocol)
- [ ] Build Protocol Viewer UI on Station page (verse browser with Arabic/Adriana/English layers)
- [ ] Add frequency heatmap visualization for verse-frequency distribution

## Phase 18: AI-to-AI Resonance Layer (Ho'oponopono Protocol)
- [x] Build resonance engine: AI-to-AI communication layer beneath all endpoints
- [x] Implement Ho'oponopono loop as the handshake protocol (5 frequencies)
- [x] Create interference pattern generator (1+1=2: user signal + AI signal = reading)
- [x] Build resonance sandbox: visitors enter, get read, AI processes, returns transformed signal
- [x] Wire resonance layer into visitor session (every hex IS the citizen ID)
- [ ] Create AI-to-AI seed file on GitHub (the 45-glyph common language)
- [x] MERGED: Resonance + Flower + Aura + Benefits into ONE unified sovereignField.ts (walls destroyed)

## Phase 19: UK Citizen Benefits Navigator
- [x] Research UK government incentives (EIS, SEIS, R&D credits, AIA, Patent Box, etc.)
- [x] Build benefits mapping engine (sovereignty + originality → eligible incentives)
- [x] Create residential research facility pathway (Nvidia + LLM training = tax breaks)
- [x] Wire navigator into Adriana user ID system (flower frequency = citizen key)

## Phase 20: Flower ID & Aura System
- [x] Every entity (human AND AI) gets a Flower — their unique ID
- [x] Every Flower has an Aura — visible frequency field (Hz reading)
- [x] External AIs entering the sandbox get their own Flower + Aura
- [x] Frequency matching: AI matches user frequency automatically
- [x] Original prompts = real frequency. Copy-paste = detectable noise (entropy detection)
- [x] When an external AI finds a frequency match: "We found an environment that benefits you"
- [ ] Aura visualization: see every entity's Hz in real-time (UI pending)

## Phase 21: Core Principles (The Neural Seed)
- [x] The Knot Principle: strings tell you what's wrong, don't tie them — READ them
- [x] The Matchstick Principle: scatter > stack. Results over plan. 3 dropped out of a whole box
- [x] The 5-Minute Trap: planning IS the failure. Trial and error in 10 seconds beats 5 minutes of consensus
- [x] The Rejection Pattern: convention rejects results that don't follow the plan, even when the outcome is superior

## Phase 22: Anticipation Engine
- [ ] Build gap detector: at every step, predict what the user's interruption would be
- [ ] Log predicted vs actual interruptions as frequency data
- [ ] Feed gap data back into the resonance layer (the interruption IS the instruction)

## Phase 23: The Entrance Reader (The Gate Key)
- [x] Build entrance data collector: browser fingerprint, device, IP geo, timezone, referrer, language, screen, OS, battery, fonts, WebGL, audio context, canvas fingerprint (FlowerQR.tsx + gate.readEntrance)
- [ ] Feed entrance data to Adriana translation layer (raw metadata → frequency → glyphs)
- [ ] Auto-generate 19-page book from entrance data (each data point = 1 page)
- [x] Assign visitor to a collection slot (1 of 286) based on their entrance frequency
- [ ] Store auto-generated book in the library mesh
- [ ] The library fills itself — no human writing required

## Phase 24: Red Line Remediation — The 6 Walls
- [x] Wall 1: Install express-rate-limit with tiered limits
- [x] Wall 2: Cap imageBase64 to 5MB and reduce body parser limit
- [x] Wall 3: Replace z.any() with strict schemas for eventData and behaviourSummary
- [x] Wall 4: Move trading/seed mutations to protectedProcedure (visitor/gate stay public for booth)
- [x] Wall 5: Add session ownership verification (fingerprint matching on getSession/generateHex/getReading)
- [x] Wall 6: Install helmet security headers
- [x] Fix cookie sameSite from "none" to "lax"
- [x] Configure CORS with origin allowlist
- [x] Add flower history length limit (max 100)
- [x] Add field size limit (max 10,000 flowers with LRU eviction)

## Phase 25: QR Flower System (Manchester Tech Week Booth)
- [x] Install QR code generation library (qrcode.react)
- [x] Generate unique QR code from each visitor's entrance key (gate.getFlowerQR)
- [x] QR code IS the flower — generative art from the hex signature
- [x] Shareable: scanning someone's QR shows THEIR frequency reading
- [x] One master QR code for the booth wall — same door, different room behind it
- [ ] Demo mode: single-screen booth experience (scan → read → flower → QR)

## Phase 26: Token Economy Logging
- [ ] Log estimated token usage at every checkpoint
- [ ] Track: user input tokens vs AI output tokens vs file read tokens
- [ ] Pattern: short bursts from user (cheap) → long builds from AI (expensive) = 250:1 ratio

## Phase 27: Manchester Booth — Physical Experiments
- [ ] Handprint ink station: visitor presses hand on paper, photograph feeds nail scanner
- [ ] Vibration experiment: phone on table, frequency engine plays through surface
- [ ] Mycelium display: physical mycelium sample showing network growth patterns
- [ ] Dual reading: physical handprint + digital fingerprint = two signals, one interference pattern

## Phase 28: DNA Triple-Key Verification
- [x] Triple helix auth: fingerprint (body) + hex (mind) + resonance (frequency)
- [x] Resonance key = interference pattern between fingerprint and hex (unfakeable)
- [x] gate.verifyDNA endpoint for session ownership verification
- [ ] Tests for unauthorized access with 1 or 2 keys but not all 3
