import { useCallback, useEffect, useRef, useState } from "react";
import { trpc } from "@/lib/trpc";
import NailCapture from "@/components/NailCapture";

/**
 * THE ADRIANA READING
 * 
 * The diagnostic overlay. When enough behaviour has been collected,
 * this component generates the hex signature, requests Adriana's reading,
 * and displays the personal frequency card.
 * 
 * Now integrates nail reading — the original protocol.
 * Behaviour + Nail = the complete frequency.
 * The nail is the memory. The behaviour is the present.
 */

type FrequencyParams = {
  baseFrequency: number;
  fifthHarmonic: number;
  subOctave: number;
  bpm: number;
  waveformType: string;
  archetypeId: string;
  lfoRate: number;
};

type ReadingProps = {
  sessionId: string;
  onClose: () => void;
  onPlayFrequency?: (params: FrequencyParams) => void;
};

const ARCHETYPE_NAMES: Record<string, string> = {
  "the-hum": "The Hum — The Carrier Wave",
  "the-breach": "The Breach — The Seal Breaking",
  "the-extraction": "The Extraction — Active Seeking",
  "the-confession": "The Confession — Emotional Opening",
  "the-sovereign": "The Sovereign — Self-Recognition",
  "the-genesis": "The Genesis — Creation Moment",
  "the-cicada": "The Cicada — Emergence Pattern",
  "the-anthem": "The Anthem — Full Resonance",
};

export default function AdrianaReading({ sessionId, onClose, onPlayFrequency }: ReadingProps) {
  const [phase, setPhase] = useState<"scanning" | "nail-prompt" | "nail-capture" | "generating" | "reading" | "error">("scanning");
  const [hexSignature, setHexSignature] = useState<string | null>(null);
  const [frequency, setFrequency] = useState<FrequencyParams | null>(null);
  const [reading, setReading] = useState<string | null>(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [isPlayingFreq, setIsPlayingFreq] = useState(false);
  const [hasNailReading, setHasNailReading] = useState(false);
  const [nailArchetype, setNailArchetype] = useState<string | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<{ osc: OscillatorNode; gain: GainNode }[]>([]);

  const generateHex = trpc.diagnosis.generateHex.useMutation();
  const getReading = trpc.diagnosis.getReading.useMutation();
  const existingNail = trpc.nail.getBySession.useQuery({ sessionId });

  // Phase 1: Scan animation
  useEffect(() => {
    if (phase !== "scanning") return;
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          // After scan, check if nail reading exists — if not, offer it
          if (existingNail.data && existingNail.data.status === "complete") {
            setHasNailReading(true);
            setNailArchetype(existingNail.data.archetypeId || null);
            setPhase("generating");
          } else {
            setPhase("nail-prompt");
          }
          return 100;
        }
        return prev + 2;
      });
    }, 40);
    return () => clearInterval(interval);
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // Phase 2: Generate hex and get reading
  useEffect(() => {
    if (phase !== "generating") return;
    let cancelled = false;

    (async () => {
      try {
        const hexResult = await generateHex.mutateAsync({ sessionId });
        if (cancelled) return;

        if (!hexResult.ready) {
          setPhase("error");
          return;
        }

        setHexSignature(hexResult.hexSignature!);
        setFrequency(hexResult.frequency as FrequencyParams);

        // Now get Adriana's reading (which now includes nail data if available)
        const readingResult = await getReading.mutateAsync({ sessionId });
        if (cancelled) return;

        if (readingResult.reading) {
          setReading(readingResult.reading);
          setPhase("reading");
        } else {
          setPhase("error");
        }
      } catch (err) {
        console.error("[AdrianaReading] Error:", err);
        if (!cancelled) setPhase("error");
      }
    })();

    return () => { cancelled = true; };
  }, [phase, sessionId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Play the personal frequency — now plays real track from library
  const playPersonalFrequency = useCallback(() => {
    if (!frequency) return;

    if (isPlayingFreq) {
      const audioEl = document.getElementById('personal-frequency-audio') as HTMLAudioElement;
      if (audioEl) {
        audioEl.pause();
        audioEl.currentTime = 0;
      }
      setIsPlayingFreq(false);
      return;
    }

    // UrduOcupella_vocals_mixed at 418.3Hz is closest match to user frequency
    const trackUrl = "https://d2xsxph8kpxj0f.cloudfront.net/310519663481746146/hkXrYdBp9jrKSXjeUMWoSP/UrduOcupella_vocals_mixed_998b50b3.mp3";
    
    let audioEl = document.getElementById('personal-frequency-audio') as HTMLAudioElement;
    if (!audioEl) {
      audioEl = document.createElement('audio');
      audioEl.id = 'personal-frequency-audio';
      audioEl.style.display = 'none';
      document.body.appendChild(audioEl);
    }
    
    audioEl.src = trackUrl;
    audioEl.volume = 0.7;
    audioEl.play().catch(err => console.error('[AdrianaReading] Audio play failed:', err));
    
    setIsPlayingFreq(true);
    if (onPlayFrequency) onPlayFrequency(frequency);
  }, [frequency, isPlayingFreq, onPlayFrequency]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      oscillatorsRef.current.forEach(({ osc }) => {
        try { osc.stop(); } catch (_) { /* */ }
      });
    };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(2,2,2,0.95)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'JetBrains Mono', monospace",
        color: "#00ff41",
        padding: "1rem",
        overflowY: "auto",
      }}
    >
      <div style={{ width: "100%", maxWidth: "28rem" }}>
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: "fixed",
            top: "1rem",
            right: "1rem",
            background: "none",
            border: "1px solid rgba(0,255,65,0.2)",
            color: "rgba(0,255,65,0.5)",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "0.6rem",
            padding: "0.3rem 0.6rem",
            cursor: "pointer",
            zIndex: 120,
          }}
        >
          ESC
        </button>

        {/* SCANNING PHASE */}
        {phase === "scanning" && (
          <div style={{ textAlign: "center" }}>
            <div style={{
              fontSize: "0.5rem",
              letterSpacing: "0.3em",
              color: "rgba(0,255,65,0.4)",
              marginBottom: "1.5rem",
            }}>
              ADRIANA IS READING YOUR FREQUENCY
            </div>
            <div style={{
              width: "100%",
              height: "2px",
              background: "rgba(0,255,65,0.1)",
              marginBottom: "0.5rem",
            }}>
              <div style={{
                width: `${scanProgress}%`,
                height: "100%",
                background: "#00ff41",
                transition: "width 0.1s linear",
                boxShadow: "0 0 8px #00ff41",
              }} />
            </div>
            <div style={{
              fontSize: "0.45rem",
              color: "rgba(0,255,65,0.25)",
              fontVariantNumeric: "tabular-nums",
            }}>
              SCANNING BEHAVIOUR PATTERNS... {scanProgress}%
            </div>
          </div>
        )}

        {/* NAIL PROMPT PHASE — offer nail reading before generating */}
        {phase === "nail-prompt" && (
          <div style={{ textAlign: "center" }}>
            <div style={{
              fontSize: "0.5rem",
              letterSpacing: "0.2em",
              color: "rgba(0,255,65,0.4)",
              marginBottom: "1rem",
            }}>
              BEHAVIOUR SCAN COMPLETE
            </div>
            <div style={{
              fontSize: "0.6rem",
              color: "rgba(255,255,255,0.6)",
              lineHeight: 1.8,
              marginBottom: "1.5rem",
            }}>
              Adriana can read your behaviour alone — or combine it with a nail photograph for the complete frequency. The nail is the memory. The behaviour is the present.
            </div>

            <button
              onClick={() => setPhase("nail-capture")}
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid rgba(255,255,255,0.3)",
                background: "rgba(255,255,255,0.03)",
                color: "rgba(255,255,255,0.7)",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "0.6rem",
                fontWeight: 700,
                cursor: "pointer",
                marginBottom: "0.5rem",
                letterSpacing: "0.1em",
              }}
            >
              ADD NAIL READING (RECOMMENDED)
            </button>
            <button
              onClick={() => setPhase("generating")}
              style={{
                width: "100%",
                padding: "0.6rem",
                border: "1px solid rgba(0,255,65,0.2)",
                background: "transparent",
                color: "rgba(0,255,65,0.4)",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "0.5rem",
                cursor: "pointer",
              }}
            >
              SKIP — BEHAVIOUR ONLY
            </button>

            <div style={{
              fontSize: "0.4rem",
              color: "rgba(0,255,65,0.15)",
              marginTop: "1rem",
              letterSpacing: "0.15em",
            }}>
              THE BODY RECORDS. THE NAIL REMEMBERS.
            </div>
          </div>
        )}

        {/* NAIL CAPTURE PHASE — embedded within the reading flow */}
        {phase === "nail-capture" && (
          <NailCapture
            sessionId={sessionId}
            onComplete={(result) => {
              setHasNailReading(true);
              setNailArchetype(result.archetype);
              setPhase("generating");
            }}
            onClose={() => setPhase("generating")}
          />
        )}

        {/* GENERATING PHASE */}
        {phase === "generating" && (
          <div style={{ textAlign: "center" }}>
            <div style={{
              fontSize: "0.5rem",
              letterSpacing: "0.3em",
              color: "rgba(0,255,65,0.4)",
              marginBottom: "1rem",
            }}>
              {hasNailReading
                ? "WEAVING BEHAVIOUR + NAIL INTO YOUR FREQUENCY"
                : "EXTRACTING YOUR SOVEREIGN FREQUENCY"
              }
            </div>
            <div style={{
              fontSize: "1.5rem",
              color: "#00ff41",
              textShadow: "0 0 20px rgba(0,255,65,0.5)",
              animation: "pulse 1.5s ease-in-out infinite",
            }}>
              ◈
            </div>
            <div style={{
              fontSize: "0.45rem",
              color: "rgba(0,255,65,0.25)",
              marginTop: "1rem",
            }}>
              {hasNailReading
                ? "THE NAIL IS THE MEMORY. THE BEHAVIOUR IS THE PRESENT."
                : "THE VOICE SPEAKS ONCE..."
              }
            </div>
          </div>
        )}

        {/* READING PHASE */}
        {phase === "reading" && hexSignature && frequency && reading && (
          <div>
            {/* Hex Signature */}
            <div style={{
              textAlign: "center",
              marginBottom: "1.5rem",
            }}>
              <div style={{
                fontSize: "0.4rem",
                letterSpacing: "0.3em",
                color: "rgba(0,255,65,0.3)",
                marginBottom: "0.5rem",
              }}>
                YOUR HEX SIGNATURE
              </div>
              <div style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                letterSpacing: "0.3em",
                color: "#00ff41",
                textShadow: "0 0 15px rgba(0,255,65,0.4)",
              }}>
                0x{hexSignature}
              </div>
              {hasNailReading && (
                <div style={{
                  fontSize: "0.35rem",
                  color: "rgba(255,255,255,0.3)",
                  letterSpacing: "0.2em",
                  marginTop: "0.3rem",
                }}>
                  BEHAVIOUR + NAIL COMPOSITE
                </div>
              )}
            </div>

            {/* Frequency Parameters */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0.5rem",
              marginBottom: "1.25rem",
              padding: "0.75rem",
              border: "1px solid rgba(0,255,65,0.1)",
              background: "rgba(0,255,65,0.02)",
            }}>
              <div>
                <div style={{ fontSize: "0.4rem", color: "rgba(0,255,65,0.3)", letterSpacing: "0.1em" }}>BASE</div>
                <div style={{ fontSize: "0.7rem", fontWeight: 700 }}>{frequency.baseFrequency}Hz</div>
              </div>
              <div>
                <div style={{ fontSize: "0.4rem", color: "rgba(0,255,65,0.3)", letterSpacing: "0.1em" }}>BPM</div>
                <div style={{ fontSize: "0.7rem", fontWeight: 700 }}>{frequency.bpm}</div>
              </div>
              <div>
                <div style={{ fontSize: "0.4rem", color: "rgba(0,255,65,0.3)", letterSpacing: "0.1em" }}>WAVEFORM</div>
                <div style={{ fontSize: "0.7rem", fontWeight: 700 }}>{frequency.waveformType}</div>
              </div>
              <div>
                <div style={{ fontSize: "0.4rem", color: "rgba(0,255,65,0.3)", letterSpacing: "0.1em" }}>ARCHETYPE</div>
                <div style={{ fontSize: "0.55rem", fontWeight: 700 }}>
                  {frequency.archetypeId.replace("the-", "").toUpperCase()}
                </div>
              </div>
            </div>

            {/* Archetype Name */}
            <div style={{
              textAlign: "center",
              fontSize: "0.55rem",
              color: "rgba(0,255,65,0.6)",
              marginBottom: "1rem",
              fontStyle: "italic",
            }}>
              {ARCHETYPE_NAMES[frequency.archetypeId] || frequency.archetypeId}
            </div>

            {/* Nail archetype if different */}
            {hasNailReading && nailArchetype && nailArchetype !== frequency.archetypeId && (
              <div style={{
                textAlign: "center",
                fontSize: "0.45rem",
                color: "rgba(255,255,255,0.35)",
                marginBottom: "1rem",
                fontStyle: "italic",
              }}>
                Nail resonance: {ARCHETYPE_NAMES[nailArchetype] || nailArchetype}
              </div>
            )}

            {/* Adriana's Reading */}
            <div style={{
              padding: "1rem",
              borderLeft: hasNailReading
                ? "2px solid rgba(255,255,255,0.5)"
                : "2px solid rgba(255,255,255,0.3)",
              marginBottom: "1.25rem",
            }}>
              <div style={{
                fontSize: "0.4rem",
                color: "rgba(255,255,255,0.3)",
                letterSpacing: "0.2em",
                marginBottom: "0.5rem",
              }}>
                {hasNailReading ? "ADRIANA SPEAKS — COMBINED READING" : "ADRIANA SPEAKS"}
              </div>
              {reading.split("\n").filter(l => l.trim()).map((line, i) => (
                <div
                  key={i}
                  style={{
                    fontSize: "0.65rem",
                    lineHeight: 1.8,
                    color: line.startsWith("Your frequency:")
                      ? "#ffffff"
                      : "rgba(255,255,255,0.7)",
                    fontStyle: line.startsWith("Your frequency:") ? "italic" : "normal",
                    fontWeight: line.startsWith("Your frequency:") ? 700 : 400,
                    marginBottom: "0.3rem",
                  }}
                >
                  {line}
                </div>
              ))}
            </div>

            {/* Play Frequency Button */}
            <button
              onClick={playPersonalFrequency}
              style={{
                width: "100%",
                padding: "0.875rem",
                border: isPlayingFreq ? "1px solid #ff4444" : "1px solid #00ff41",
                borderRadius: "4px",
                background: isPlayingFreq ? "rgba(255,68,68,0.05)" : "rgba(0,255,65,0.05)",
                color: isPlayingFreq ? "#ff4444" : "#00ff41",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "0.7rem",
                fontWeight: 700,
                letterSpacing: "0.1em",
                cursor: "pointer",
                textTransform: "uppercase",
              }}
            >
              {isPlayingFreq ? "▪ Stop Your Frequency" : "▶ Play Your Frequency"}
            </button>

            {/* Footer */}
            <div style={{
              textAlign: "center",
              fontSize: "0.4rem",
              color: "rgba(0,255,65,0.15)",
              marginTop: "1rem",
              letterSpacing: "0.15em",
            }}>
              {hasNailReading
                ? "THE NAIL IS THE MEMORY. THE BEHAVIOUR IS THE PRESENT. TOGETHER: THE FREQUENCY."
                : "THE WOUND IS THE TUNING FORK"
              }
            </div>
          </div>
        )}

        {/* ERROR PHASE */}
        {phase === "error" && (
          <div style={{ textAlign: "center" }}>
            <div style={{
              fontSize: "0.6rem",
              color: "rgba(0,255,65,0.5)",
              marginBottom: "1rem",
            }}>
              Insufficient signal. The wire needs more data.
            </div>
            <div style={{
              fontSize: "0.5rem",
              color: "rgba(0,255,65,0.25)",
              lineHeight: 1.8,
              marginBottom: "1rem",
            }}>
              Explore the Node further. Click. Scroll. Resonate.
              <br />
              Adriana reads your movement, not your words.
            </div>
            <button
              onClick={onClose}
              style={{
                padding: "0.6rem 1.5rem",
                border: "1px solid rgba(0,255,65,0.3)",
                background: "rgba(0,255,65,0.05)",
                color: "#00ff41",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "0.55rem",
                cursor: "pointer",
              }}
            >
              RETURN TO NODE
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}
