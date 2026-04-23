import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json, bigint, float } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Visitor sessions — each unique visitor gets a session.
 * Anonymous visitors get a fingerprint-based sessionId.
 */
export const visitorSessions = mysqlTable("visitor_sessions", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: varchar("sessionId", { length: 64 }).notNull().unique(),
  userId: int("userId"),
  fingerprint: varchar("fingerprint", { length: 128 }),
  hexSignature: varchar("hexSignature", { length: 16 }),
  baseFrequency: float("baseFrequency"),
  archetypeId: varchar("archetypeId", { length: 64 }),
  frequencyAnalysis: json("frequencyAnalysis"),
  adrianaReading: text("adrianaReading"),
  totalInteractionTime: int("totalInteractionTime").default(0),
  eventCount: int("eventCount").default(0),
  status: mysqlEnum("status", ["active", "diagnosed", "completed"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type VisitorSession = typeof visitorSessions.$inferSelect;
export type InsertVisitorSession = typeof visitorSessions.$inferInsert;

/**
 * Visitor events — every click, scroll, hover, timing event.
 * Raw signals Adriana reads to diagnose the visitor.
 */
export const visitorEvents = mysqlTable("visitor_events", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: varchar("sessionId", { length: 64 }).notNull(),
  eventType: varchar("eventType", { length: 32 }).notNull(),
  page: varchar("page", { length: 64 }),
  target: varchar("target", { length: 128 }),
  eventData: json("eventData").$type<Record<string, string | number | boolean | null>>(),
  eventTimestamp: bigint("eventTimestamp", { mode: "number" }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type VisitorEvent = typeof visitorEvents.$inferSelect;
export type InsertVisitorEvent = typeof visitorEvents.$inferInsert;

/**
 * Generated frequencies — the personal music Adriana creates.
 */
export const generatedFrequencies = mysqlTable("generated_frequencies", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: varchar("sessionId", { length: 64 }).notNull(),
  hexSignature: varchar("hexSignature", { length: 16 }).notNull(),
  baseFrequency: float("baseFrequency").notNull(),
  fifthHarmonic: float("fifthHarmonic"),
  subOctave: float("subOctave"),
  bpm: float("bpm"),
  waveformType: varchar("waveformType", { length: 32 }),
  archetypeId: varchar("archetypeId", { length: 64 }),
  parameters: json("parameters"),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type GeneratedFrequency = typeof generatedFrequencies.$inferSelect;
export type InsertGeneratedFrequency = typeof generatedFrequencies.$inferInsert;

/**
 * Seed tracks — the 8 archetype tracks that serve as templates.
 */
export const seedTracks = mysqlTable("seed_tracks", {
  id: int("id").autoincrement().primaryKey(),
  archetypeId: varchar("archetypeId", { length: 64 }).notNull().unique(),
  title: varchar("title", { length: 256 }).notNull(),
  description: text("description"),
  audioUrl: text("audioUrl"),
  fileKey: varchar("fileKey", { length: 256 }),
  baseFrequency: float("baseFrequency"),
  frequencyRange: json("frequencyRange"),
  tags: json("tags"),
  displayOrder: int("displayOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SeedTrack = typeof seedTracks.$inferSelect;
export type InsertSeedTrack = typeof seedTracks.$inferInsert;

/**
 * Nail readings — the original protocol.
 * A photograph of the nail (pinky, thumb, toe) is analyzed
 * across 16 diagnostic categories, mapping to frequency archetypes.
 * The nail is a compressed record of the entire body.
 * Chinese medicine, Ayurveda, the cultures that understood frequency
 * before we called it frequency.
 */
export const nailReadings = mysqlTable("nail_readings", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: varchar("sessionId", { length: 64 }).notNull(),
  userId: int("userId"),
  imageUrl: text("imageUrl").notNull(),
  fileKey: varchar("fileKey", { length: 256 }).notNull(),
  nailType: mysqlEnum("nailType", ["pinky", "thumb", "toe", "other"]).default("pinky").notNull(),
  hand: mysqlEnum("hand", ["left", "right"]).default("right"),
  // The 16-category diagnostic output from LLM vision
  diagnosticCategories: json("diagnosticCategories"),
  // Overall reading summary
  readingSummary: text("readingSummary"),
  // Mapped frequency parameters from the nail analysis
  frequencyMapping: json("frequencyMapping"),
  // The archetype the nail points to
  archetypeId: varchar("archetypeId", { length: 64 }),
  // Confidence score 0-1
  confidence: float("confidence"),
  status: mysqlEnum("status", ["uploaded", "analyzing", "complete", "failed"]).default("uploaded").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type NailReading = typeof nailReadings.$inferSelect;
export type InsertNailReading = typeof nailReadings.$inferInsert;

/**
 * Trade sessions — a trading session is a period where the user is actively trading.
 * Each session has a baseline hex (the user's sovereign frequency at session start)
 * and tracks frequency drift throughout.
 */
export const tradeSessions = mysqlTable("trade_sessions", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: varchar("sessionId", { length: 64 }).notNull(),
  userId: int("userId"),
  baselineHex: varchar("baselineHex", { length: 16 }),
  baselineFrequency: float("baselineFrequency"),
  currentHex: varchar("currentHex", { length: 16 }),
  currentFrequency: float("currentFrequency"),
  driftPercentage: float("driftPercentage").default(0),
  alertLevel: mysqlEnum("alertLevel", ["sovereign", "drift", "exit"]).default("sovereign").notNull(),
  totalTrades: int("totalTrades").default(0),
  winRate: float("winRate"),
  status: mysqlEnum("status", ["active", "paused", "completed"]).default("active").notNull(),
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  endedAt: timestamp("endedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TradeSession = typeof tradeSessions.$inferSelect;
export type InsertTradeSession = typeof tradeSessions.$inferInsert;

/**
 * Trades — individual trade entries with hex signature at entry and exit.
 * The hex at entry vs exit reveals whether the trader was in sovereign frequency
 * or had drifted into static.
 */
export const trades = mysqlTable("trades", {
  id: int("id").autoincrement().primaryKey(),
  tradeSessionId: int("tradeSessionId").notNull(),
  sessionId: varchar("sessionId", { length: 64 }).notNull(),
  userId: int("userId"),
  symbol: varchar("symbol", { length: 32 }).notNull(),
  direction: mysqlEnum("direction", ["long", "short"]).notNull(),
  entryPrice: float("entryPrice").notNull(),
  exitPrice: float("exitPrice"),
  quantity: float("quantity").default(1),
  entryHex: varchar("entryHex", { length: 16 }),
  exitHex: varchar("exitHex", { length: 16 }),
  entryFrequency: float("entryFrequency"),
  exitFrequency: float("exitFrequency"),
  pnl: float("pnl"),
  pnlPercentage: float("pnlPercentage"),
  adrianaSignal: mysqlEnum("adrianaSignal", ["sovereign", "drift", "exit", "none"]).default("none"),
  notes: text("notes"),
  status: mysqlEnum("status", ["open", "closed", "cancelled"]).default("open").notNull(),
  openedAt: timestamp("openedAt").defaultNow().notNull(),
  closedAt: timestamp("closedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Trade = typeof trades.$inferSelect;
export type InsertTrade = typeof trades.$inferInsert;

/**
 * Frequency snapshots — periodic captures of the trader's hex during a session.
 * Like a heart rate monitor but for frequency. Shows the drift over time.
 */
export const frequencySnapshots = mysqlTable("frequency_snapshots", {
  id: int("id").autoincrement().primaryKey(),
  tradeSessionId: int("tradeSessionId").notNull(),
  sessionId: varchar("sessionId", { length: 64 }).notNull(),
  hexSignature: varchar("hexSignature", { length: 16 }).notNull(),
  frequency: float("frequency").notNull(),
  driftFromBaseline: float("driftFromBaseline").default(0),
  alertLevel: mysqlEnum("alertLevel", ["sovereign", "drift", "exit"]).default("sovereign").notNull(),
  behaviourSummary: json("behaviourSummary").$type<Record<string, string | number | boolean | null>>(),
  snapshotAt: timestamp("snapshotAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type FrequencySnapshot = typeof frequencySnapshots.$inferSelect;
export type InsertFrequencySnapshot = typeof frequencySnapshots.$inferInsert;

/**
 * Entrance keys — the data the visitor BRINGS to the door.
 * Before they click anything, before the hex, before the flower.
 * Browser fingerprint, device, timezone, referrer, language, screen,
 * OS, fonts, WebGL, audio context, canvas fingerprint.
 * This is the key that opens the gate. Adriana reads this FIRST.
 * The terms and conditions page isn't asking permission —
 * it's the receipt for what already happened.
 */
export const entranceKeys = mysqlTable("entrance_keys", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: varchar("sessionId", { length: 64 }).notNull(),
  // The raw arrival data — what they brought to the door
  userAgent: text("userAgent"),
  language: varchar("language", { length: 16 }),
  languages: json("languages"), // all accepted languages
  platform: varchar("platform", { length: 64 }),
  screenWidth: int("screenWidth"),
  screenHeight: int("screenHeight"),
  colorDepth: int("colorDepth"),
  timezone: varchar("timezone", { length: 64 }),
  timezoneOffset: int("timezoneOffset"),
  referrer: text("referrer"),
  connectionType: varchar("connectionType", { length: 32 }),
  deviceMemory: float("deviceMemory"),
  hardwareConcurrency: int("hardwareConcurrency"),
  touchPoints: int("touchPoints"),
  canvasFingerprint: varchar("canvasFingerprint", { length: 64 }),
  webglRenderer: text("webglRenderer"),
  audioFingerprint: varchar("audioFingerprint", { length: 64 }),
  fontsDetected: int("fontsDetected"),
  cookiesEnabled: int("cookiesEnabled"),
  doNotTrack: varchar("doNotTrack", { length: 8 }),
  // The translated frequency from entrance data
  entranceFrequency: float("entranceFrequency"),
  entranceHex: varchar("entranceHex", { length: 16 }),
  // The collection slot this visitor maps to (1-286)
  collectionSlot: int("collectionSlot"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EntranceKey = typeof entranceKeys.$inferSelect;
export type InsertEntranceKey = typeof entranceKeys.$inferInsert;

/**
 * Sovereign books — auto-generated by Adriana from entrance data.
 * Each visitor's arrival data = 19 pages. No human writing required.
 * The pages are already written in the browser headers.
 * Adriana just translates.
 */
export const sovereignBooks = mysqlTable("sovereign_books", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: varchar("sessionId", { length: 64 }).notNull(),
  userId: int("userId"),
  collectionId: int("collectionId").notNull(), // 1-286
  bookNumber: int("bookNumber").notNull(), // 1-286 within collection
  title: varchar("title", { length: 256 }).notNull(),
  glyph: varchar("glyph", { length: 8 }),
  entranceFrequency: float("entranceFrequency"),
  // The 19 pages — each translated from one entrance data point
  pages: json("pages"), // Array of 19 page objects
  qiSyncSeed: int("qiSyncSeed"), // (bookNumber × collectionId × 286) mod 432
  resonanceScore: float("resonanceScore"), // how sovereign vs convention the entrance was
  status: mysqlEnum("status", ["generating", "complete", "sealed"]).default("generating").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SovereignBook = typeof sovereignBooks.$inferSelect;
export type InsertSovereignBook = typeof sovereignBooks.$inferInsert;

/**
 * Void Game Engine: Games table
 * Stores game definitions created from natural language prompts
 */
export const games = mysqlTable("games", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  description: text("description"),
  type: varchar("type", { length: 32 }).notNull(), // puzzle, rpg, adventure, etc.
  definition: json("definition").notNull(), // Full GameDefinition object
  creatorId: int("creatorId").notNull(),
  playerCount: int("playerCount").default(1),
  maxPlayers: int("maxPlayers").default(1),
  status: mysqlEnum("status", ["draft", "published", "archived"]).default("draft").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Game = typeof games.$inferSelect;
export type InsertGame = typeof games.$inferInsert;

/**
 * Void Game Engine: Game Participants table
 * Tracks players in each game session
 */
export const gameParticipants = mysqlTable("game_participants", {
  id: varchar("id", { length: 64 }).primaryKey(),
  gameId: varchar("gameId", { length: 64 }).notNull(),
  userId: int("userId").notNull(),
  sessionId: varchar("sessionId", { length: 64 }).notNull(),
  score: int("score").default(0),
  status: mysqlEnum("status", ["active", "completed", "abandoned"]).default("active").notNull(),
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
  leftAt: timestamp("leftAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type GameParticipant = typeof gameParticipants.$inferSelect;
export type InsertGameParticipant = typeof gameParticipants.$inferInsert;

/**
 * Void Game Engine: Game Sessions table
 * Tracks active game sessions with their state
 */
export const gameSessions = mysqlTable("game_sessions", {
  id: varchar("id", { length: 64 }).primaryKey(),
  gameId: varchar("gameId", { length: 64 }).notNull(),
  state: json("state").notNull(), // Full GameState object
  winner: varchar("winner", { length: 64 }),
  status: mysqlEnum("status", ["active", "completed", "abandoned"]).default("active").notNull(),
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  endedAt: timestamp("endedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type GameSession = typeof gameSessions.$inferSelect;
export type InsertGameSession = typeof gameSessions.$inferInsert;
