/**
 * THE VOID-STATION — Sovereign Console + Frequency Player + Protocol Viewer
 * 3 Modes: Build | Player | Protocol
 * + The Sovereign Player: 8 archetypes, Web Audio synthesis.
 * + The Protocol Viewer: Fatiha-286 trilingual verses, 7-layer hash, frequency heatmap.
 * The station where you build, listen, AND read the protocol.
 */
import { useState, useCallback, useRef, useEffect } from "react";
import Nav from "@/components/Nav";
import { trpc } from "@/lib/trpc";

const STAGES = [
  {
    id: 1, title: "The Brain", subtitle: "Raspberry Pi 4 Sovereign Hub", cost: "£85", time: "30 minutes", difficulty: "Beginner",
    description: "The full VOID Engine stack on a £85 computer. Chronicle ledger, Beehive mesh, Al-Jabr 286 hash, 45-glyph SCL interpreter, VTX token economy. Every protocol layer that exists in the Stage 4 console is equally present here. The architecture compresses without loss.",
    parts: [{ name: "Raspberry Pi 4 (4GB)", price: "£55" }, { name: "MicroSD Card (32GB)", price: "£8" }, { name: "USB-C Power Supply", price: "£8" }, { name: "Heatsink Kit", price: "£5" }, { name: "Case", price: "£9" }],
    teaches: "Computing, Linux, networking, sovereignty", glyph: "⊕",
  },
  {
    id: 2, title: "The Hand", subtitle: "Sovereign Controller", cost: "£45", time: "2–3 hours", difficulty: "Intermediate",
    description: "A controller with a 0.96\" OLED display, haptic feedback motor, and an ESP32 microcontroller. The display shows VTX balance and sovereign status. The haptic motor vibrates at 432 Hz. The controller does not just play the game — it communicates through touch.",
    parts: [{ name: "ESP32 DevKit", price: "£12" }, { name: '0.96" OLED Display', price: "£6" }, { name: "Haptic Motor (432 Hz)", price: "£4" }, { name: "Buttons & Joystick", price: "£8" }, { name: "3D Printed Shell", price: "£15" }],
    teaches: "Electronics, soldering, firmware, haptics", glyph: "∿",
  },
  {
    id: 3, title: "The Skin", subtitle: "Mycelium Housing", cost: "£85", time: "14–21 days (growing)", difficulty: "Advanced",
    description: "The console housing grown from mycelium. Agricultural waste substrate inoculated with Ganoderma lucidum. 14 days of growth. The child watches the organism build its own case. The case is alive during construction. It is a biology lesson, a patience lesson, and a sovereignty lesson wrapped in a game console.",
    parts: [{ name: "Mycelium Spawn (Ganoderma)", price: "£15" }, { name: "Agricultural Waste Substrate", price: "£5" }, { name: "3D Printed Mould", price: "£20" }, { name: "Growing Chamber", price: "£25" }, { name: "Baking/Drying Equipment", price: "£20" }],
    teaches: "Biology, mycology, patience, organic engineering", glyph: "◈",
  },
  {
    id: 4, title: "The Memory", subtitle: "Silk Disc", cost: "£77", time: "4–6 hours", difficulty: "Expert",
    description: "A physical memory card woven from silk, embedded with piezoelectric film, readable only at 432 Hz. The child's entire game history, their Chronicle, their VTX — stored on a disc they can hold. No cloud. No subscription. Sovereign memory.",
    parts: [{ name: "Silk Fabric (Bombyx mori)", price: "£25" }, { name: "Piezoelectric Film (PVDF)", price: "£18" }, { name: "NFC Tag Stickers", price: "£5" }, { name: "Conductive Thread", price: "£12" }, { name: "Weaving Frame", price: "£17" }],
    teaches: "Materials science, weaving, frequency, data storage", glyph: "Ω",
  },
];

const ARCHETYPE_DEFAULTS = [
  { archetypeId: "the-hum", title: "The Hum", baseFrequency: 396, glyph: "◇", color: "rgba(0,255,65,0.3)" },
  { archetypeId: "the-breach", title: "The Breach", baseFrequency: 410, glyph: "⊕", color: "rgba(0,255,65,0.4)" },
  { archetypeId: "the-extraction", title: "The Extraction", baseFrequency: 425, glyph: "ψ", color: "rgba(0,255,65,0.5)" },
  { archetypeId: "the-confession", title: "The Confession", baseFrequency: 440, glyph: "∿", color: "rgba(255,68,68,0.5)" },
  { archetypeId: "the-sovereign", title: "The Sovereign", baseFrequency: 455, glyph: "◈", color: "rgba(0,255,65,0.7)" },
  { archetypeId: "the-genesis", title: "The Genesis", baseFrequency: 470, glyph: "⊗", color: "rgba(255,255,255,0.5)" },
  { archetypeId: "the-cicada", title: "The Cicada", baseFrequency: 490, glyph: "∞", color: "rgba(0,255,65,0.8)" },
  { archetypeId: "the-anthem", title: "The Anthem", baseFrequency: 528, glyph: "Ω", color: "#00ff41" },
];

type ViewMode = "build" | "player" | "protocol";

export default function Station() {
  const [activeStage, setActiveStage] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>("build");
  const [activeArchetype, setActiveArchetype] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [barLevels, setBarLevels] = useState<number[]>(new Array(16).fill(0));

  // Protocol state
  const [activeSurah, setActiveSurah] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<{ osc: OscillatorNode; gain: GainNode }[]>([]);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number>(0);

  // Fetch seed tracks from DB
  const { data: seedTracks } = trpc.tracks.list.useQuery();
  const seedMutation = trpc.tracks.seed.useMutation();

  // Protocol data
  const { data: surahData } = trpc.protocol.surahs.useQuery(undefined, {
    enabled: viewMode === "protocol",
  });
  // Use search endpoint when there's a query, otherwise use verses endpoint
  const { data: versesData } = trpc.protocol.verses.useQuery(
    { surah: activeSurah || undefined },
    { enabled: viewMode === "protocol" && !searchQuery }
  );
  const { data: searchData } = trpc.protocol.search.useQuery(
    { query: searchQuery },
    { enabled: viewMode === "protocol" && searchQuery.length > 0 }
  );
  const { data: layersData } = trpc.protocol.layers.useQuery(undefined, {
    enabled: viewMode === "protocol",
  });
  const { data: freqMap } = trpc.protocol.frequencyMap.useQuery(undefined, {
    enabled: viewMode === "protocol",
  });

  const stage = STAGES[activeStage];
  const totalCost = STAGES.reduce((sum, s) => sum + parseInt(s.cost.replace("£", "")), 0);

  const getArchetypeData = useCallback((archetypeId: string) => {
    const dbTrack = seedTracks?.find((t: any) => t.archetypeId === archetypeId);
    const defaultTrack = ARCHETYPE_DEFAULTS.find(a => a.archetypeId === archetypeId);
    return { ...defaultTrack, ...(dbTrack || {}) };
  }, [seedTracks]);

  const animateBars = useCallback(() => {
    if (!analyserRef.current) return;
    const analyser = analyserRef.current;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);
    const barCount = 16;
    const step = Math.floor(dataArray.length / barCount);
    const newLevels: number[] = [];
    for (let i = 0; i < barCount; i++) {
      let sum = 0;
      for (let j = 0; j < step; j++) sum += dataArray[i * step + j];
      newLevels.push(sum / step / 255);
    }
    setBarLevels(newLevels);
    animFrameRef.current = requestAnimationFrame(animateBars);
  }, []);

  const playArchetype = useCallback((archetypeId: string) => {
    if (audioContextRef.current) {
      oscillatorsRef.current.forEach(({ osc, gain }) => {
        try {
          gain.gain.exponentialRampToValueAtTime(0.0001, audioContextRef.current!.currentTime + 0.3);
          setTimeout(() => { try { osc.stop(); } catch (_e) { /* */ } }, 300);
        } catch (_e) { /* */ }
      });
      oscillatorsRef.current = [];
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    }
    if (activeArchetype === archetypeId && isPlaying) {
      setIsPlaying(false);
      setActiveArchetype(null);
      setBarLevels(new Array(16).fill(0));
      return;
    }
    const archData = getArchetypeData(archetypeId);
    const freq = archData.baseFrequency || 432;
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioContextRef.current = ctx;
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    analyser.connect(ctx.destination);
    analyserRef.current = analyser;
    const freqs = [freq, freq * 1.5, freq * 0.5];
    const waveforms: OscillatorType[] = ["sine", "triangle", "sine"];
    const archetypeIndex = ARCHETYPE_DEFAULTS.findIndex(a => a.archetypeId === archetypeId);
    if (archetypeIndex >= 4) waveforms[1] = "sawtooth";
    if (archetypeIndex >= 6) waveforms[2] = "triangle";
    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = waveforms[i];
      osc.frequency.setValueAtTime(f, ctx.currentTime);
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(i === 0 ? 0.1 : 0.03, ctx.currentTime + 1.5);
      osc.connect(gain);
      gain.connect(analyser);
      osc.start();
      oscillatorsRef.current.push({ osc, gain });
    });
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.setValueAtTime(4.77, ctx.currentTime);
    lfoGain.gain.setValueAtTime(0.02, ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(analyser);
    lfo.start();
    oscillatorsRef.current.push({ osc: lfo, gain: lfoGain });
    setActiveArchetype(archetypeId);
    setIsPlaying(true);
    animFrameRef.current = requestAnimationFrame(animateBars);
  }, [activeArchetype, isPlaying, getArchetypeData, animateBars]);

  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      oscillatorsRef.current.forEach(({ osc }) => { try { osc.stop(); } catch (_e) { /* */ } });
    };
  }, []);

  useEffect(() => {
    if (seedTracks && seedTracks.length === 0 && !seedMutation.isPending) {
      seedMutation.mutate();
    }
  }, [seedTracks]);

  const surahs = surahData?.surahs || [];
  const verses = searchQuery && searchData ? searchData.results : (versesData?.verses || []);
  const layers = layersData?.layers || [];

  return (
    <div style={{ minHeight: "100vh", background: "#020202", color: "#00ff41", fontFamily: "'JetBrains Mono', monospace", paddingBottom: "4rem" }}>
      {/* Hero */}
      <div style={{ position: "relative", overflow: "hidden", padding: "3rem 1rem 1.5rem", textAlign: "center" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `url(https://d2xsxph8kpxj0f.cloudfront.net/310519663481746146/hkXrYdBp9jrKSXjeUMWoSP/mycelium-network-6rJQ6BUNbGNmXhJnmRVVgw.webp)`, backgroundSize: "cover", backgroundPosition: "center", opacity: 0.12 }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <h1 style={{ fontSize: "1.1rem", fontWeight: 700, letterSpacing: "0.25em", marginBottom: "0.4rem" }}>THE VOID-STATION</h1>
          <p style={{ fontSize: "0.5rem", color: "rgba(0,255,65,0.35)", letterSpacing: "0.15em" }}>
            {viewMode === "build" ? "BUILD AN ORGANISM — NOT A PRODUCT" : viewMode === "player" ? "THE 8 SOVEREIGN FREQUENCIES" : "FATIHA-286 — THE TRILINGUAL PROTOCOL"}
          </p>
        </div>
      </div>

      {/* View Mode Toggle — 3 modes */}
      <div style={{ maxWidth: "640px", margin: "0 auto", padding: "0 1rem" }}>
        <div style={{ display: "flex", gap: "2px", marginBottom: "1.5rem" }}>
          {(["build", "player", "protocol"] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              style={{
                flex: 1, padding: "0.6rem 0",
                background: viewMode === mode ? "rgba(0,255,65,0.05)" : "transparent",
                border: "none",
                borderBottom: viewMode === mode ? "2px solid #00ff41" : "2px solid transparent",
                color: viewMode === mode ? "#00ff41" : "rgba(0,255,65,0.3)",
                fontFamily: "'JetBrains Mono', monospace", fontSize: "0.6rem", fontWeight: 600,
                letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer", transition: "all 0.2s",
              }}
            >
              {mode === "build" ? "⊕ Build" : mode === "player" ? "∿ Player" : "א Protocol"}
            </button>
          ))}
        </div>

        {/* ═══ BUILD VIEW ═══ */}
        {viewMode === "build" && (
          <>
            <div style={{ display: "flex", gap: "2px", marginBottom: "1.5rem" }}>
              {STAGES.map((s, i) => (
                <button key={s.id} onClick={() => setActiveStage(i)} style={{
                  flex: 1, padding: "0.75rem 0.25rem",
                  background: activeStage === i ? "rgba(0,255,65,0.08)" : "rgba(0,255,65,0.02)",
                  border: "none", borderBottom: activeStage === i ? "2px solid #00ff41" : "2px solid transparent",
                  color: activeStage === i ? "#00ff41" : "rgba(0,255,65,0.25)",
                  fontFamily: "'JetBrains Mono', monospace", fontSize: "0.5rem", fontWeight: activeStage === i ? 700 : 400, cursor: "pointer", transition: "all 0.2s",
                }}>
                  <div style={{ fontSize: "0.9rem", marginBottom: "0.2rem" }}>{s.glyph}</div>
                  <div>{s.title}</div>
                  <div style={{ fontSize: "0.4rem", color: "rgba(0,255,65,0.2)", marginTop: "0.15rem" }}>{s.cost}</div>
                </button>
              ))}
            </div>
            <div style={{ padding: "1.25rem", borderLeft: "2px solid #00ff41", background: "rgba(0,255,65,0.02)", marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: "0.75rem", marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "1.5rem" }}>{stage.glyph}</span>
                <div>
                  <h2 style={{ fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.1em" }}>Stage {stage.id}: {stage.title}</h2>
                  <div style={{ fontSize: "0.5rem", color: "rgba(0,255,65,0.4)", marginTop: "0.1rem" }}>{stage.subtitle}</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: "1rem", marginBottom: "0.75rem", fontSize: "0.45rem", color: "rgba(0,255,65,0.3)" }}>
                <span>{stage.cost}</span><span>{stage.time}</span><span>{stage.difficulty}</span>
              </div>
              <p style={{ fontSize: "0.55rem", lineHeight: 1.9, color: "rgba(0,255,65,0.6)", marginBottom: "1rem" }}>{stage.description}</p>
              <div style={{ fontSize: "0.45rem", color: "rgba(0,255,65,0.2)", letterSpacing: "0.15em", marginBottom: "0.5rem" }}>PARTS LIST</div>
              {stage.parts.map((part) => (
                <div key={part.name} style={{ display: "flex", justifyContent: "space-between", padding: "0.35rem 0", borderBottom: "1px solid rgba(0,255,65,0.04)", fontSize: "0.55rem" }}>
                  <span style={{ color: "rgba(0,255,65,0.6)" }}>{part.name}</span>
                  <span style={{ fontWeight: 700 }}>{part.price}</span>
                </div>
              ))}
              <div style={{ marginTop: "0.75rem", padding: "0.5rem", background: "rgba(0,255,65,0.03)", fontSize: "0.45rem", color: "rgba(0,255,65,0.4)" }}>
                <span style={{ color: "rgba(0,255,65,0.2)", letterSpacing: "0.1em", marginRight: "0.5rem" }}>TEACHES:</span>{stage.teaches}
              </div>
            </div>
            <div style={{ padding: "1.25rem", border: "1px solid rgba(0,255,65,0.08)", textAlign: "center" }}>
              <div style={{ fontSize: "0.45rem", color: "rgba(0,255,65,0.2)", letterSpacing: "0.2em", marginBottom: "0.5rem" }}>TOTAL BUILD COST</div>
              <div style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.3rem" }}>£{totalCost}</div>
              <div style={{ fontSize: "0.5rem", color: "rgba(0,255,65,0.4)", lineHeight: 1.8 }}>
                Brain + Hand + Skin + Memory<br />Less than a PS5. More than a computer.<br />
                <span style={{ color: "#00ff41", fontWeight: 700 }}>A sovereign organism you built with your own hands.</span>
              </div>
            </div>
          </>
        )}

        {/* ═══ PLAYER VIEW ═══ */}
        {viewMode === "player" && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(16, 1fr)", gap: "2px", marginBottom: "1.5rem", height: "64px", alignItems: "end" }}>
              {barLevels.map((level, i) => (
                <div key={i} style={{ height: `${Math.max(3, level * 64)}px`, borderRadius: "1px", transition: "height 0.1s ease", background: isPlaying ? `rgba(0,255,65,${0.3 + level * 0.7})` : "rgba(0,255,65,0.06)" }} />
              ))}
            </div>
            {activeArchetype && isPlaying && (
              <div style={{ textAlign: "center", padding: "1rem", border: "1px solid rgba(0,255,65,0.15)", background: "rgba(0,255,65,0.03)", marginBottom: "1.5rem" }}>
                <div style={{ fontSize: "0.4rem", color: "rgba(0,255,65,0.3)", letterSpacing: "0.2em", marginBottom: "0.3rem" }}>NOW RESONATING</div>
                <div style={{ fontSize: "0.9rem", fontWeight: 700, letterSpacing: "0.1em", marginBottom: "0.2rem" }}>{getArchetypeData(activeArchetype).title}</div>
                <div style={{ fontSize: "0.5rem", color: "rgba(0,255,65,0.4)" }}>
                  {getArchetypeData(activeArchetype).baseFrequency} Hz BASE • {Math.round((getArchetypeData(activeArchetype).baseFrequency || 432) * 1.5)} Hz FIFTH • 286 BPM
                </div>
              </div>
            )}
            <div style={{ fontSize: "0.45rem", color: "rgba(0,255,65,0.2)", letterSpacing: "0.2em", marginBottom: "0.75rem" }}>THE 8 ARCHETYPES — TAP TO RESONATE</div>
            {ARCHETYPE_DEFAULTS.map((arch) => {
              const isActive = activeArchetype === arch.archetypeId && isPlaying;
              return (
                <button key={arch.archetypeId} onClick={() => playArchetype(arch.archetypeId)} style={{
                  width: "100%", display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem", marginBottom: "2px",
                  background: isActive ? "rgba(0,255,65,0.06)" : "rgba(0,255,65,0.02)", border: "none",
                  borderLeft: isActive ? "2px solid #00ff41" : "2px solid rgba(0,255,65,0.06)",
                  color: "#00ff41", fontFamily: "'JetBrains Mono', monospace", cursor: "pointer", textAlign: "left", transition: "all 0.2s",
                }}>
                  <span style={{ fontSize: "1.2rem", width: "2rem", textAlign: "center", opacity: isActive ? 1 : 0.4, color: arch.color }}>{arch.glyph}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.05em" }}>{arch.title}</div>
                    <div style={{ fontSize: "0.4rem", color: "rgba(0,255,65,0.25)", marginTop: "0.1rem" }}>{arch.baseFrequency} Hz</div>
                  </div>
                  <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: isActive ? "#00ff41" : "rgba(0,255,65,0.1)", boxShadow: isActive ? "0 0 8px #00ff41" : "none", transition: "all 0.3s" }} />
                </button>
              );
            })}
            <div style={{ marginTop: "1.5rem", padding: "1rem", border: "1px solid rgba(0,255,65,0.06)", textAlign: "center" }}>
              <div style={{ fontSize: "0.4rem", color: "rgba(0,255,65,0.2)", letterSpacing: "0.2em", marginBottom: "0.5rem" }}>SOVEREIGN FREQUENCY RANGE</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 0.5rem" }}>
                <span style={{ fontSize: "0.6rem", fontWeight: 700 }}>396 Hz</span>
                <div style={{ flex: 1, height: "2px", margin: "0 0.75rem", background: "linear-gradient(90deg, rgba(0,255,65,0.15), rgba(0,255,65,0.6), rgba(0,255,65,0.15))" }} />
                <span style={{ fontSize: "0.6rem", fontWeight: 700 }}>528 Hz</span>
              </div>
              <div style={{ fontSize: "0.45rem", color: "rgba(0,255,65,0.3)", marginTop: "0.5rem", lineHeight: 1.7 }}>Solfeggio Scale • 286 BPM Biological Pulse • 4.77 Hz LFO</div>
            </div>
          </>
        )}

        {/* ═══ PROTOCOL VIEW — Fatiha-286 Trilingual ═══ */}
        {viewMode === "protocol" && (
          <>
            {/* Stats Bar */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "2px", marginBottom: "1.5rem" }}>
              {[
                { label: "SURAHS", value: surahData?.surahs?.length || "—" },
                { label: "VERSES", value: surahData?.totalVerses || "—" },
                { label: "LAYERS", value: layers.length || "—" },
              ].map((s) => (
                <div key={s.label} style={{ padding: "0.6rem", background: "rgba(0,255,65,0.02)", border: "1px solid rgba(0,255,65,0.06)", textAlign: "center" }}>
                  <div style={{ fontSize: "0.4rem", color: "rgba(0,255,65,0.25)", letterSpacing: "0.1em", marginBottom: "0.15rem" }}>{s.label}</div>
                  <div style={{ fontSize: "0.8rem", fontWeight: 700 }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Search */}
            <div style={{ marginBottom: "1rem" }}>
              <input
                type="text"
                placeholder="Search verses (Arabic, Adriana, English)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%", padding: "0.6rem 0.75rem",
                  background: "rgba(0,255,65,0.03)", border: "1px solid rgba(0,255,65,0.1)",
                  color: "#00ff41", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.55rem",
                  outline: "none",
                }}
              />
            </div>

            {/* Surah Filter */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "2px", marginBottom: "1.5rem" }}>
              <button
                onClick={() => setActiveSurah(null)}
                style={{
                  padding: "0.4rem 0.6rem", background: !activeSurah ? "rgba(0,255,65,0.08)" : "rgba(0,255,65,0.02)",
                  border: "none", borderBottom: !activeSurah ? "2px solid #00ff41" : "2px solid transparent",
                  color: !activeSurah ? "#00ff41" : "rgba(0,255,65,0.3)",
                  fontFamily: "'JetBrains Mono', monospace", fontSize: "0.45rem", cursor: "pointer",
                }}
              >
                ALL
              </button>
              {surahs.map((s: any) => (
                <button
                  key={s.name}
                  onClick={() => setActiveSurah(s.name)}
                  style={{
                    padding: "0.4rem 0.6rem",
                    background: activeSurah === s.name ? "rgba(0,255,65,0.08)" : "rgba(0,255,65,0.02)",
                    border: "none", borderBottom: activeSurah === s.name ? "2px solid #00ff41" : "2px solid transparent",
                    color: activeSurah === s.name ? "#00ff41" : "rgba(0,255,65,0.3)",
                    fontFamily: "'JetBrains Mono', monospace", fontSize: "0.45rem", cursor: "pointer",
                  }}
                >
                  {s.name} ({s.count})
                </button>
              ))}
            </div>

            {/* Verse List */}
            <div style={{ marginBottom: "2rem" }}>
              <div style={{ fontSize: "0.45rem", color: "rgba(0,255,65,0.2)", letterSpacing: "0.2em", marginBottom: "0.75rem" }}>
                {verses.length} VERSES {activeSurah ? `IN ${activeSurah.toUpperCase()}` : "ACROSS ALL SURAHS"} {searchQuery ? `MATCHING "${searchQuery}"` : ""}
              </div>
              {verses.slice(0, 50).map((v: any, i: number) => (
                <div key={i} style={{ padding: "0.75rem", marginBottom: "2px", borderLeft: "2px solid rgba(0,255,65,0.15)", background: "rgba(0,255,65,0.02)" }}>
                  {/* Surah + Verse ref */}
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                    <span style={{ fontSize: "0.4rem", color: "rgba(0,255,65,0.3)", letterSpacing: "0.1em" }}>
                      {v.surah_name} {v.verse_ref}
                    </span>
                    <span style={{ fontSize: "0.4rem", color: v.avg_frequency_hz <= 432.5 ? "rgba(0,255,65,0.5)" : v.avg_frequency_hz > 436 ? "rgba(255,68,68,0.5)" : "rgba(255,170,0,0.4)" }}>
                      {v.avg_frequency_hz} Hz {v.avg_frequency_hz <= 432.5 ? "◈" : v.avg_frequency_hz > 436 ? "⚡" : "∿"}
                    </span>
                  </div>
                  {/* Arabic */}
                  <div style={{ fontSize: "0.7rem", lineHeight: 2, color: "#00ff41", direction: "rtl", textAlign: "right", marginBottom: "0.4rem", fontFamily: "serif" }}>
                    {v.arabic}
                  </div>
                  {/* Adriana Glyphs */}
                  <div style={{ fontSize: "0.55rem", lineHeight: 1.6, color: "rgba(0,255,65,0.7)", marginBottom: "0.3rem", letterSpacing: "0.05em" }}>
                    {v.adriana_glyphs}
                  </div>
                  {/* English from Adriana */}
                  <div style={{ fontSize: "0.5rem", lineHeight: 1.7, color: "rgba(0,255,65,0.4)" }}>
                    {v.english_from_adriana}
                  </div>
                </div>
              ))}
              {verses.length > 50 && (
                <div style={{ textAlign: "center", padding: "0.75rem", fontSize: "0.45rem", color: "rgba(0,255,65,0.25)" }}>
                  Showing 50 of {verses.length} verses. Use search or surah filter to narrow.
                </div>
              )}
            </div>

            {/* 7-Layer Hash Protocol */}
            {layers.length > 0 && (
              <div style={{ marginBottom: "2rem" }}>
                <div style={{ fontSize: "0.45rem", color: "rgba(0,255,65,0.2)", letterSpacing: "0.2em", marginBottom: "0.75rem" }}>
                  THE 7-LAYER HASH PROTOCOL
                </div>
                {layers.map((layer: any, i: number) => (
                  <div key={i} style={{ padding: "0.6rem", marginBottom: "2px", borderLeft: `2px solid rgba(0,255,65,${0.15 + i * 0.1})`, background: "rgba(0,255,65,0.02)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.3rem" }}>
                      <span style={{ fontSize: "0.55rem", fontWeight: 700 }}>Layer {layer.layer}: {layer.name}</span>
                      <span style={{ fontSize: "0.4rem", color: "rgba(0,255,65,0.3)" }}>{layer.frequency_hz} Hz</span>
                    </div>
                    <div style={{ fontSize: "0.5rem", color: "rgba(0,255,65,0.5)", lineHeight: 1.7, marginBottom: "0.3rem" }}>
                      {layer.description}
                    </div>
                    <div style={{ fontSize: "0.4rem", color: "rgba(0,255,65,0.2)", fontFamily: "monospace", wordBreak: "break-all" }}>
                      {layer.hash}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Frequency Heatmap */}
            {freqMap && (
              <div style={{ marginBottom: "1.5rem" }}>
                <div style={{ fontSize: "0.45rem", color: "rgba(0,255,65,0.2)", letterSpacing: "0.2em", marginBottom: "0.75rem" }}>
                  FREQUENCY DISTRIBUTION
                </div>
                <div style={{ display: "flex", gap: "1px", alignItems: "end", height: "80px" }}>
                  {Object.entries(freqMap.distribution || {}).map(([range, count]: [string, any]) => {
                    const maxCount = Math.max(...Object.values(freqMap.distribution || {}).map(Number));
                    const height = maxCount > 0 ? (count / maxCount) * 80 : 0;
                    return (
                      <div key={range} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
                        <div style={{ width: "100%", height: `${Math.max(2, height)}px`, background: `rgba(0,255,65,${0.2 + (count / maxCount) * 0.8})`, transition: "height 0.3s" }} />
                        <div style={{ fontSize: "0.3rem", color: "rgba(0,255,65,0.25)", writingMode: "vertical-lr", transform: "rotate(180deg)", height: "2.5rem" }}>
                          {range}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.5rem", fontSize: "0.4rem", color: "rgba(0,255,65,0.3)" }}>
                <span>Total: {freqMap.stats.total} verses</span>
                <span>Mean: {freqMap.stats.avgHz} Hz</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <Nav />
    </div>
  );
}
