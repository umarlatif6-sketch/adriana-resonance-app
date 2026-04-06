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
