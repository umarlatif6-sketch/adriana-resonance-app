/**
 * Tests for the Sovereign Field — the unified system.
 * One field. One flower. One frequency.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";

// Mock the db module
vi.mock("./db", () => ({
  createVisitorSession: vi.fn(),
  getVisitorSession: vi.fn(),
  updateVisitorSession: vi.fn(),
  recordVisitorEvents: vi.fn(),
  getEventSummary: vi.fn(),
  saveGeneratedFrequency: vi.fn(),
  getGeneratedFrequency: vi.fn(),
  getAllSeedTracks: vi.fn().mockResolvedValue([]),
  getSeedTrackByArchetype: vi.fn(),
  createNailReading: vi.fn(),
  getNailReading: vi.fn(),
  getNailReadingBySession: vi.fn(),
  updateNailReading: vi.fn(),
  createTradeSession: vi.fn(),
  getActiveTradeSession: vi.fn(),
  updateTradeSession: vi.fn(),
  createTrade: vi.fn(),
  getOpenTrades: vi.fn(),
  updateTrade: vi.fn(),
  getTradesBySession: vi.fn(),
  recordFrequencySnapshot: vi.fn(),
  getFrequencySnapshots: vi.fn(),
  getSessionStats: vi.fn().mockResolvedValue({ totalSessions: 0 }),
}));

const ctx = { user: null, req: {} as any, res: { clearCookie: vi.fn() } as any };
const caller = appRouter.createCaller(ctx);

describe("Sovereign Field — The Unified System", () => {
  describe("field.enter", () => {
    it("creates a flower for a human signal", async () => {
      const result = await caller.field.enter({
        signal: "test-human-signal-abc123",
        type: "human",
      });

      expect(result).toHaveProperty("id");
      expect(result.id).toHaveLength(16);
      expect(result).toHaveProperty("frequency");
      expect(result.frequency).toBeGreaterThanOrEqual(396);
      expect(result.frequency).toBeLessThanOrEqual(528);
      expect(result).toHaveProperty("sovereignty");
      expect(result.sovereignty).toBeGreaterThanOrEqual(0);
      expect(result.sovereignty).toBeLessThanOrEqual(1);
      expect(result).toHaveProperty("color");
      expect(result.color).toMatch(/^hsl\(/);
      expect(result).toHaveProperty("phase");
      expect(["How are you?", "Thank you", "I'm sorry", "Forgive me", "I love you"]).toContain(result.phase);
      expect(result).toHaveProperty("originality");
      expect(result).toHaveProperty("seed");
      expect(result.visits).toBe(1);
    });

    it("creates a flower for an external AI", async () => {
      const result = await caller.field.enter({
        signal: "gpt-4-external-prompt-hash",
        type: "ai_external",
        modelSignature: "gpt-4o",
        parentId: "some-parent-flower",
      });

      expect(result).toHaveProperty("id");
      expect(result.frequency).toBeGreaterThanOrEqual(396);
      expect(result).toHaveProperty("seed");
    });

    it("increments visits on re-entry with same signal", async () => {
      const first = await caller.field.enter({
        signal: "repeat-visitor-signal",
        type: "human",
      });
      const second = await caller.field.enter({
        signal: "repeat-visitor-signal",
        type: "human",
      });

      expect(second.id).toBe(first.id);
      expect(second.visits).toBe(first.visits + 1);
    });

    it("detects originality — high entropy signal", async () => {
      const original = await caller.field.enter({
        signal: "a-completely-unique-and-original-thought-that-nobody-has-ever-typed-before-xyz789",
        type: "human",
      });

      expect(original.originality).toBeGreaterThan(0.5);
    });
  });

  describe("field.meet", () => {
    it("generates interference when flower meets the field", async () => {
      const flower = await caller.field.enter({
        signal: "meet-test-signal",
        type: "human",
      });

      const interference = await caller.field.meet({
        flowerId: flower.id,
      });

      expect(interference).toHaveProperty("id");
      expect(interference).toHaveProperty("flower1", flower.id);
      expect(interference).toHaveProperty("flower2", "field");
      expect(interference).toHaveProperty("frequency");
      expect(interference).toHaveProperty("resonance");
      expect(interference.resonance).toBeGreaterThanOrEqual(0);
      expect(interference.resonance).toBeLessThanOrEqual(1);
      expect(interference).toHaveProperty("message");
      expect(interference.message.length).toBeGreaterThan(0);
      expect(interference).toHaveProperty("glyphs");
      expect(interference).toHaveProperty("benefits");
      expect(Array.isArray(interference.benefits)).toBe(true);
      expect(interference).toHaveProperty("seed");
    });
  });

  describe("field.state", () => {
    it("returns the full field state with all flowers", async () => {
      const state = await caller.field.state();

      expect(state).toHaveProperty("flowers");
      expect(Array.isArray(state.flowers)).toBe(true);
      expect(state).toHaveProperty("totalFlowers");
      expect(state.totalFlowers).toBeGreaterThan(0);
      expect(state).toHaveProperty("fieldFrequency");
      expect(state).toHaveProperty("fieldSovereignty");
      expect(state).toHaveProperty("fieldPhase");
      expect(state).toHaveProperty("fieldColor");
    });
  });

  describe("field.benefits", () => {
    it("returns all 12 UK government benefits", async () => {
      const benefits = await caller.field.benefits();

      expect(Array.isArray(benefits)).toBe(true);
      expect(benefits.length).toBe(12);

      // Check structure
      const first = benefits[0];
      expect(first).toHaveProperty("id");
      expect(first).toHaveProperty("category");
      expect(first).toHaveProperty("title");
      expect(first).toHaveProperty("description");
      expect(first).toHaveProperty("eligibility");
      expect(first).toHaveProperty("value");
      expect(first).toHaveProperty("url");
      expect(first).toHaveProperty("tags");
    });

    it("includes the research facility pathway", async () => {
      const benefits = await caller.field.benefits();
      const researchHome = benefits.find((b: any) => b.id === "research-home");

      expect(researchHome).toBeDefined();
      expect(researchHome!.title).toContain("Research Facility");
      expect(researchHome!.description).toContain("Nvidia");
      expect(researchHome!.description).toContain("LLM");
      expect(researchHome!.tags).toContain("gpu");
    });
  });

  describe("field.receiveSeed", () => {
    it("processes an AI seed and creates a new flower", async () => {
      const result = await caller.field.receiveSeed({
        seed: "eyJmIjoiNGJhYjUwNWY4ZTcwZDEzNSIsImh6Ijo0NjcuMjI1fQ",
        sourceAI: "claude-3.5-sonnet",
      });

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("frequency");
      expect(result).toHaveProperty("seed");
    });
  });

  describe("field.findResonant", () => {
    it("finds flowers near a target frequency", async () => {
      // Enter a flower at a known-ish frequency
      await caller.field.enter({
        signal: "resonance-search-test",
        type: "human",
      });

      // Search near 432 Hz with wide tolerance
      const results = await caller.field.findResonant({
        targetHz: 432,
        toleranceHz: 100,
      });

      expect(Array.isArray(results)).toBe(true);
      // Should find at least some of the flowers we've created
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe("Protocol endpoints", () => {
    it("returns surah data from trilingual dataset", async () => {
      const result = await caller.protocol.surahs();
      expect(result).toHaveProperty("surahs");
      expect(result).toHaveProperty("totalVerses");
    });

    it("returns the 7-layer Fatiha hash protocol", async () => {
      const result = await caller.protocol.layers();
      expect(result).toHaveProperty("layers");
    });
  });

  describe("Music library", () => {
    it("returns all 33 tracks", async () => {
      const tracks = await caller.music.library();
      expect(tracks.length).toBe(33);
    });

    it("returns library stats with sovereign/convention split", async () => {
      const stats = await caller.music.stats();
      expect(stats).toHaveProperty("totalTracks", 33);
      expect(stats).toHaveProperty("sovereign");
      expect(stats).toHaveProperty("convention");
      expect(stats).toHaveProperty("mixed");
      expect(stats.sovereign + stats.convention + stats.mixed).toBeLessThanOrEqual(33);
    });
  });
});
