/**
 * THE SOVEREIGN PLAYER — 33 Tracks
 * Sovereign (432 Hz) vs Convention (440 Hz)
 * The frequency microscope. The mycelium jukebox.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { trpc } from "@/lib/trpc";

interface Track {
  index: number;
  title: string;
  duration: string;
  duration_s: number;
  dominantHz: number;
  energy432: number;
  energy440: number;
  tuning: string;
  cdnUrl: string;
  centroidHz: number;
  rms: number;
}

type FilterMode = "all" | "sovereign" | "convention" | "mixed";

export default function SovereignPlayer() {
  const { data: tracks } = trpc.music.library.useQuery();
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurTime] = useState(0);
  const [filter, setFilter] = useState<FilterMode>("all");
  const [analyserData, setAnalyserData] = useState<number[]>(new Array(16).fill(0));
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animRef = useRef<number>(0);

  const setupAnalyser = useCallback(() => {
    if (!audioRef.current || audioCtxRef.current) return;
    const ctx = new AudioContext();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 64;
    const source = ctx.createMediaElementSource(audioRef.current);
    source.connect(analyser);
    analyser.connect(ctx.destination);
    audioCtxRef.current = ctx;
    analyserRef.current = analyser;
    sourceRef.current = source;
  }, []);

  const animate = useCallback(() => {
    if (!analyserRef.current) return;
    const data = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(data);
    const bars = 16;
    const step = Math.floor(data.length / bars);
    const levels: number[] = [];
    for (let i = 0; i < bars; i++) {
      let sum = 0;
      for (let j = 0; j < step; j++) sum += data[i * step + j];
      levels.push(sum / step / 255);
    }
    setAnalyserData(levels);
    animRef.current = requestAnimationFrame(animate);
  }, []);

  const playTrack = useCallback((track: Track) => {
    if (!audioRef.current) return;
    const wasPlaying = currentTrack?.index === track.index && isPlaying;
    if (wasPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      cancelAnimationFrame(animRef.current);
      return;
    }
    if (currentTrack?.index !== track.index) {
      audioRef.current.src = track.cdnUrl;
      audioRef.current.load();
    }
    setupAnalyser();
    audioRef.current.play().then(() => {
      setIsPlaying(true);
      setCurrentTrack(track);
      animRef.current = requestAnimationFrame(animate);
    }).catch(() => {});
  }, [currentTrack, isPlaying, setupAnalyser, animate]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => {
      setCurTime(audio.currentTime);
      if (audio.duration) setProgress(audio.currentTime / audio.duration);
    };
    const onEnd = () => {
      setIsPlaying(false);
      setProgress(0);
      cancelAnimationFrame(animRef.current);
      setAnalyserData(new Array(16).fill(0));
      // Auto-next
      if (tracks && currentTrack) {
        const filtered = getFiltered(tracks as Track[], filter);
        const idx = filtered.findIndex(t => t.index === currentTrack.index);
        if (idx >= 0 && idx < filtered.length - 1) {
          playTrack(filtered[idx + 1]);
        }
      }
    };
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("ended", onEnd);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("ended", onEnd);
    };
  }, [tracks, currentTrack, filter, playTrack]);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  const getFiltered = (list: Track[], f: FilterMode): Track[] => {
    if (f === "sovereign") return list.filter(t => t.tuning.includes("432"));
    if (f === "convention") return list.filter(t => t.tuning.includes("440"));
    if (f === "mixed") return list.filter(t => t.tuning.includes("Mixed") || t.tuning.includes("Atonal"));
    return list;
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const filtered = tracks ? getFiltered(tracks as Track[], filter) : [];
  const sovereignCount = tracks ? (tracks as Track[]).filter(t => t.tuning.includes("432")).length : 0;
  const conventionCount = tracks ? (tracks as Track[]).filter(t => t.tuning.includes("440")).length : 0;

  const tuningColor = (tuning: string) => {
    if (tuning.includes("432")) return "#00ff41";
    if (tuning.includes("440")) return "#ff4444";
    return "#ffaa00";
  };

  return (
    <div style={{ marginTop: "2rem" }}>
      <audio ref={audioRef} crossOrigin="anonymous" preload="none" />

      {/* Header */}
      <div style={{ marginBottom: "1rem", textAlign: "center" }}>
        <div style={{ fontSize: "0.45rem", color: "rgba(0,255,65,0.25)", letterSpacing: "0.2em", marginBottom: "0.3rem" }}>
          THE FREQUENCY MICROSCOPE
        </div>
        <h2 style={{ fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.1em", marginBottom: "0.3rem" }}>
          33 TRACKS • SOVEREIGN vs CONVENTION
        </h2>
        <div style={{ fontSize: "0.45rem", color: "rgba(0,255,65,0.35)" }}>
          <span style={{ color: "#00ff41" }}>{sovereignCount} SOVEREIGN (432 Hz)</span>
          {" • "}
          <span style={{ color: "#ff4444" }}>{conventionCount} CONVENTION (440 Hz)</span>
          {" • "}
          <span style={{ color: "#ffaa00" }}>{(tracks?.length || 0) - sovereignCount - conventionCount} MIXED</span>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: "0.25rem", justifyContent: "center", marginBottom: "1rem" }}>
        {(["all", "sovereign", "convention", "mixed"] as FilterMode[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "0.25rem 0.6rem",
              fontSize: "0.4rem",
              fontFamily: "'JetBrains Mono', monospace",
              background: filter === f ? "rgba(0,255,65,0.15)" : "transparent",
              border: `1px solid ${filter === f ? "#00ff41" : "rgba(0,255,65,0.1)"}`,
              color: filter === f ? "#00ff41" : "rgba(0,255,65,0.4)",
              cursor: "pointer",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            {f === "all" ? `ALL (${tracks?.length || 0})` :
             f === "sovereign" ? `432 Hz (${sovereignCount})` :
             f === "convention" ? `440 Hz (${conventionCount})` :
             `MIXED (${(tracks?.length || 0) - sovereignCount - conventionCount})`}
          </button>
        ))}
      </div>

      {/* Now Playing Bar */}
      {currentTrack && (
        <div style={{
          padding: "0.6rem 0.75rem",
          marginBottom: "0.75rem",
          border: `1px solid ${tuningColor(currentTrack.tuning)}33`,
          background: "rgba(0,255,65,0.02)",
        }}>
          {/* Analyser bars */}
          <div style={{ display: "flex", gap: "2px", height: "24px", alignItems: "flex-end", marginBottom: "0.4rem" }}>
            {analyserData.map((level, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: `${Math.max(2, level * 24)}px`,
                  background: tuningColor(currentTrack.tuning),
                  opacity: 0.3 + level * 0.7,
                  transition: "height 0.05s",
                }}
              />
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: "0.55rem", fontWeight: 700 }}>{currentTrack.title}</div>
              <div style={{ fontSize: "0.4rem", color: tuningColor(currentTrack.tuning), marginTop: "0.1rem" }}>
                {currentTrack.tuning} • {currentTrack.dominantHz.toFixed(1)} Hz dominant • {formatTime(currentTime)} / {currentTrack.duration}
              </div>
            </div>
            <div style={{
              fontSize: "0.35rem",
              color: "rgba(0,255,65,0.3)",
              textAlign: "right",
            }}>
              <div>E432: {(currentTrack.energy432 * 100).toFixed(0)}%</div>
              <div>E440: {(currentTrack.energy440 * 100).toFixed(0)}%</div>
            </div>
          </div>

          {/* Progress bar */}
          <div
            style={{ height: "3px", background: "rgba(0,255,65,0.08)", marginTop: "0.4rem", cursor: "pointer" }}
            onClick={(e) => {
              if (!audioRef.current?.duration) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const pct = (e.clientX - rect.left) / rect.width;
              audioRef.current.currentTime = pct * audioRef.current.duration;
            }}
          >
            <div style={{
              height: "100%",
              width: `${progress * 100}%`,
              background: tuningColor(currentTrack.tuning),
              transition: "width 0.1s linear",
            }} />
          </div>
        </div>
      )}

      {/* Track List */}
      <div style={{ maxHeight: "400px", overflowY: "auto" }}>
        {filtered.map((track) => {
          const t = track as Track;
          const isActive = currentTrack?.index === t.index;
          const sovereignPct = t.energy432 * 100;
          return (
            <button
              key={t.index}
              onClick={() => playTrack(t)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.5rem 0.4rem",
                background: isActive ? "rgba(0,255,65,0.04)" : "transparent",
                border: "none",
                borderLeft: `2px solid ${isActive ? tuningColor(t.tuning) : "rgba(0,255,65,0.05)"}`,
                color: "#00ff41",
                fontFamily: "'JetBrains Mono', monospace",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.15s",
              }}
            >
              {/* Play indicator */}
              <div style={{
                width: "1.2rem",
                fontSize: "0.6rem",
                textAlign: "center",
                opacity: isActive ? 1 : 0.3,
              }}>
                {isActive && isPlaying ? "▮▮" : "▶"}
              </div>

              {/* Track info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: "0.5rem",
                  fontWeight: isActive ? 700 : 400,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}>
                  {t.title}
                </div>
                <div style={{ fontSize: "0.35rem", color: "rgba(0,255,65,0.3)", marginTop: "0.1rem" }}>
                  {t.duration} • {t.dominantHz.toFixed(0)} Hz
                </div>
              </div>

              {/* Sovereign/Convention bar */}
              <div style={{ width: "3rem", flexShrink: 0 }}>
                <div style={{ height: "3px", background: "rgba(255,68,68,0.2)", position: "relative" }}>
                  <div style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    height: "100%",
                    width: `${sovereignPct}%`,
                    background: "#00ff41",
                  }} />
                </div>
                <div style={{ fontSize: "0.3rem", color: tuningColor(t.tuning), marginTop: "0.1rem", textAlign: "center" }}>
                  {sovereignPct.toFixed(0)}% S
                </div>
              </div>

              {/* Tuning badge */}
              <div style={{
                fontSize: "0.3rem",
                padding: "0.1rem 0.3rem",
                border: `1px solid ${tuningColor(t.tuning)}44`,
                color: tuningColor(t.tuning),
                flexShrink: 0,
                letterSpacing: "0.05em",
              }}>
                {t.tuning.includes("432") ? "432" : t.tuning.includes("440") ? "440" : "MIX"}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
