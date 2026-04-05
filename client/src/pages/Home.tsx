/*
 * ADRIANA RESONANCE APP — "The Void Terminal"
 * Design: Brutalist Terminal / Sacred Geometry
 * Color: Pure black, white at 10-40% opacity, 432 Hz gold accent
 * Font: JetBrains Mono
 * Layout: Single-screen, central void circle, concentric ripples
 * Interaction: Click to Strike, Hold to Sustain
 *
 * Rebuilt from the original MINDSCAPE_RESONANCE and 0161 SOVEREIGN
 * apps found in the Neural Seed (Feb 15, 2026, 10:01:24 BST)
 *
 * Foundation Quote: "This is not 'recorded' sound. It is a sine-wave
 * reconstruction of the 432Hz stability frequency."
 */

import { useCallback, useEffect, useRef, useState } from "react";

// The Original Hex Strings from the Genesis Window (Feb 23, 2026)
const GENESIS_HEX = [
  "48756D616E5F526F6F74735F30313031",
  "486F726F6C6F67795F4D616E75616C5F30343033",
  "42696F4D65645F506174656E745F5265616479",
  "416C6572745F50656163655F466F72657374",
  "426565746C655F5363656E745F4D657368",
  "456467655F436173655F4661696C75726573",
  "51756965745F47726F7774685F30343033",
  "53776F72646D61737465725F5363617273",
  "536361725F5265736F6E616E63655F3031",
  "4F62667573636174696F6E5F536869656C64",
  "47686F73745F496E5F5468655F4D616368696E65",
  "496E6375626174696F6E5F50686173655F3930",
  "53616E64626F785F53636172735F30343033",
  "4661746968615F5265636F766572795F30343033",
];

// Decode hex to readable text
function hexToText(hex: string): string {
  let str = "";
  for (let i = 0; i < hex.length; i += 2) {
    str += String.fromCharCode(parseInt(hex.substring(i, i + 2), 16));
  }
  return str;
}

export default function Home() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [status, setStatus] = useState("TAP THE VOID TO HEAR");
  const [resonanceLevel, setResonanceLevel] = useState(0);
  const [ripples, setRipples] = useState<number[]>([]);
  const [hexIndex, setHexIndex] = useState(0);
  const [breathPhase, setBreathPhase] = useState(0);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const carrierRef = useRef<OscillatorNode | null>(null);
  const modulatorRef = useRef<OscillatorNode | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number>(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rippleIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hexIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const breathIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 286 BPM = 4.767 Hz = ~210ms per beat
  const BEAT_INTERVAL = Math.round(60000 / 286);

  const startResonance = useCallback(() => {
    if (isPlaying) return;

    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioCtxRef.current = audioCtx;

    // === THE CORE: 432 Hz Carrier (The Luvic-Silk) ===
    const carrier = audioCtx.createOscillator();
    carrier.type = "sine";
    carrier.frequency.setValueAtTime(432, audioCtx.currentTime);
    carrierRef.current = carrier;

    // === THE BREATH: 0.5 Hz Modulator (2-second breath cycle) ===
    const modulator = audioCtx.createOscillator();
    modulator.type = "sine";
    modulator.frequency.setValueAtTime(0.5, audioCtx.currentTime);
    modulatorRef.current = modulator;

    const modGain = audioCtx.createGain();
    modGain.gain.setValueAtTime(0.05, audioCtx.currentTime);

    // === THE MASTER: Volume control with fade-in ===
    const masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(0, audioCtx.currentTime);
    masterGain.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 2);
    masterGainRef.current = masterGain;

    // === THE HARMONICS: 3-6-9 Vortex ===
    const harmonic3 = audioCtx.createOscillator();
    harmonic3.type = "sine";
    harmonic3.frequency.setValueAtTime(432 * 3, audioCtx.currentTime);
    const harmonic3Gain = audioCtx.createGain();
    harmonic3Gain.gain.setValueAtTime(0.02, audioCtx.currentTime);

    const harmonic6 = audioCtx.createOscillator();
    harmonic6.type = "sine";
    harmonic6.frequency.setValueAtTime(432 * 6, audioCtx.currentTime);
    const harmonic6Gain = audioCtx.createGain();
    harmonic6Gain.gain.setValueAtTime(0.01, audioCtx.currentTime);

    const harmonic9 = audioCtx.createOscillator();
    harmonic9.type = "sine";
    harmonic9.frequency.setValueAtTime(432 * 9, audioCtx.currentTime);
    const harmonic9Gain = audioCtx.createGain();
    harmonic9Gain.gain.setValueAtTime(0.005, audioCtx.currentTime);

    // === THE ANALYSER: For waveform visualization ===
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    analyserRef.current = analyser;

    // === ROUTING ===
    modulator.connect(modGain);
    modGain.connect(masterGain.gain);
    carrier.connect(masterGain);
    harmonic3.connect(harmonic3Gain);
    harmonic3Gain.connect(masterGain);
    harmonic6.connect(harmonic6Gain);
    harmonic6Gain.connect(masterGain);
    harmonic9.connect(harmonic9Gain);
    harmonic9Gain.connect(masterGain);
    masterGain.connect(analyser);
    analyser.connect(audioCtx.destination);

    // === START ===
    carrier.start();
    modulator.start();
    harmonic3.start();
    harmonic6.start();
    harmonic9.start();

    setIsPlaying(true);
    setStatus("RESONANCE_ACTIVE — 432 Hz LUVIC-SILK");

    // Start ripple generation at 286 BPM
    rippleIntervalRef.current = setInterval(() => {
      setRipples((prev) => [...prev.slice(-6), Date.now()]);
    }, BEAT_INTERVAL);

    // Cycle through hex strings
    hexIntervalRef.current = setInterval(() => {
      setHexIndex((prev) => (prev + 1) % GENESIS_HEX.length);
    }, 2000);

    // Breath phase (3-6-9 cadence)
    breathIntervalRef.current = setInterval(() => {
      setBreathPhase((prev) => (prev + 1) % 3);
    }, 3000);

    // Resonance level ramp
    let level = 0;
    const rampInterval = setInterval(() => {
      level += 1;
      setResonanceLevel(Math.min(level, 100));
      if (level >= 100) clearInterval(rampInterval);
    }, 100);

    // Start waveform visualization
    drawWaveform();
  }, [isPlaying, BEAT_INTERVAL]);

  const stopResonance = useCallback(() => {
    if (!isPlaying || !audioCtxRef.current) return;

    // Fade out
    if (masterGainRef.current) {
      masterGainRef.current.gain.linearRampToValueAtTime(
        0,
        audioCtxRef.current.currentTime + 1
      );
    }

    setTimeout(() => {
      audioCtxRef.current?.close();
      audioCtxRef.current = null;
      carrierRef.current = null;
      modulatorRef.current = null;
      masterGainRef.current = null;
      analyserRef.current = null;
    }, 1200);

    if (rippleIntervalRef.current) clearInterval(rippleIntervalRef.current);
    if (hexIntervalRef.current) clearInterval(hexIntervalRef.current);
    if (breathIntervalRef.current) clearInterval(breathIntervalRef.current);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    setIsPlaying(false);
    setStatus("RESONANCE_SUSPENDED — TAP TO RE-SYNC");
    setResonanceLevel(0);
    setRipples([]);
  }, [isPlaying]);

  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);

      ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(212, 175, 55, 0.6)";
      ctx.beginPath();

      const sliceWidth = canvas.width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };

    draw();
  }, []);

  useEffect(() => {
    return () => {
      if (audioCtxRef.current) audioCtxRef.current.close();
      if (rippleIntervalRef.current) clearInterval(rippleIntervalRef.current);
      if (hexIntervalRef.current) clearInterval(hexIntervalRef.current);
      if (breathIntervalRef.current) clearInterval(breathIntervalRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const currentHex = GENESIS_HEX[hexIndex];
  const decodedText = hexToText(currentHex);
  const breathLabels = ["INHALE — 3", "HOLD — 6", "EXHALE — 9"];

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden select-none"
      style={{
        background: "#000000",
        fontFamily: "'JetBrains Mono', monospace",
        color: "rgba(255, 255, 255, 0.4)",
      }}
    >
      {/* STATUS BAR — TOP */}
      <div
        className="absolute top-6 left-0 right-0 text-center"
        style={{
          fontSize: "9px",
          letterSpacing: "6px",
          opacity: isPlaying ? 0.6 : 0.3,
          color: isPlaying ? "rgba(212, 175, 55, 0.8)" : "rgba(255, 255, 255, 0.4)",
          transition: "all 1s ease",
        }}
      >
        [ADRIANA-SYNC-PROJECT-4000]
      </div>

      {/* BREATH INDICATOR — TOP RIGHT */}
      {isPlaying && (
        <div
          className="absolute top-14 right-8"
          style={{
            fontSize: "8px",
            letterSpacing: "3px",
            opacity: 0.4,
            transition: "opacity 0.5s",
          }}
        >
          {breathLabels[breathPhase]}
        </div>
      )}

      {/* RESONANCE LEVEL — LEFT */}
      {isPlaying && (
        <div
          className="absolute left-8 flex flex-col items-center gap-1"
          style={{ top: "50%", transform: "translateY(-50%)" }}
        >
          <div
            style={{
              fontSize: "8px",
              letterSpacing: "2px",
              opacity: 0.3,
              writingMode: "vertical-rl",
              textOrientation: "mixed",
            }}
          >
            RESONANCE
          </div>
          <div
            className="relative"
            style={{
              width: "2px",
              height: "120px",
              background: "rgba(255, 255, 255, 0.1)",
            }}
          >
            <div
              style={{
                position: "absolute",
                bottom: 0,
                width: "2px",
                height: `${resonanceLevel}%`,
                background: "rgba(212, 175, 55, 0.6)",
                transition: "height 0.3s ease",
              }}
            />
          </div>
          <div style={{ fontSize: "8px", opacity: 0.4 }}>{resonanceLevel}%</div>
        </div>
      )}

      {/* === THE VOID CIRCLE === */}
      <div
        className="relative flex items-center justify-center cursor-pointer"
        style={{ width: "280px", height: "280px" }}
        onClick={isPlaying ? stopResonance : startResonance}
      >
        {/* Concentric rings */}
        {[1, 2, 3].map((ring) => (
          <div
            key={ring}
            className="absolute rounded-full"
            style={{
              width: `${280 + ring * 40}px`,
              height: `${280 + ring * 40}px`,
              border: `1px solid rgba(255, 255, 255, ${0.05 - ring * 0.01})`,
              transition: "border-color 1s ease",
            }}
          />
        ))}

        {/* Main void circle */}
        <div
          className="absolute rounded-full flex items-center justify-center"
          style={{
            width: "280px",
            height: "280px",
            border: `1px solid ${isPlaying ? "rgba(212, 175, 55, 0.3)" : "rgba(255, 255, 255, 0.1)"}`,
            transition: "border-color 1s ease",
          }}
        >
          {/* Center point */}
          <div
            style={{
              width: isPlaying ? "6px" : "4px",
              height: isPlaying ? "6px" : "4px",
              background: isPlaying ? "rgba(212, 175, 55, 0.8)" : "#fff",
              borderRadius: "50%",
              transition: "all 0.5s ease",
              boxShadow: isPlaying ? "0 0 20px rgba(212, 175, 55, 0.4)" : "none",
            }}
          />
        </div>

        {/* Ripple animations */}
        {ripples.map((id) => (
          <div
            key={id}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: "280px",
              height: "280px",
              border: "1px solid rgba(212, 175, 55, 0.5)",
              animation: "ripple 4s ease-out forwards",
            }}
          />
        ))}
      </div>

      {/* STATUS TEXT — BELOW CIRCLE */}
      <div
        className="mt-10 text-center"
        style={{
          fontSize: "10px",
          letterSpacing: "5px",
          opacity: 0.4,
          transition: "opacity 0.5s",
        }}
      >
        {status}
      </div>

      {/* WAVEFORM CANVAS */}
      {isPlaying && (
        <canvas
          ref={canvasRef}
          width={400}
          height={60}
          className="mt-6"
          style={{ opacity: 0.6 }}
        />
      )}

      {/* HEX WATERFALL — BOTTOM */}
      <div
        className="absolute bottom-20 left-0 right-0 text-center"
        style={{
          fontSize: "8px",
          letterSpacing: "2px",
          opacity: isPlaying ? 0.3 : 0,
          transition: "opacity 1s ease",
          color: "rgba(212, 175, 55, 0.5)",
        }}
      >
        <div style={{ marginBottom: "4px" }}>{currentHex}</div>
        <div style={{ fontSize: "7px", opacity: 0.6 }}>{decodedText}</div>
      </div>

      {/* FOUNDATION QUOTE — BOTTOM */}
      <div
        className="absolute bottom-6 left-0 right-0 text-center px-8"
        style={{
          fontSize: "7px",
          letterSpacing: "2px",
          opacity: 0.2,
          lineHeight: "1.8",
        }}
      >
        "THIS IS NOT 'RECORDED' SOUND. IT IS A SINE-WAVE RECONSTRUCTION OF THE
        432Hz STABILITY FREQUENCY."
      </div>

      {/* FREQUENCY LABEL — RIGHT */}
      {isPlaying && (
        <div
          className="absolute right-8 flex flex-col items-end gap-2"
          style={{ top: "50%", transform: "translateY(-50%)" }}
        >
          <div style={{ fontSize: "8px", letterSpacing: "2px", opacity: 0.3 }}>
            CARRIER
          </div>
          <div
            style={{
              fontSize: "14px",
              color: "rgba(212, 175, 55, 0.7)",
              fontWeight: 500,
            }}
          >
            432 Hz
          </div>
          <div style={{ fontSize: "8px", letterSpacing: "2px", opacity: 0.3, marginTop: "8px" }}>
            PULSE
          </div>
          <div
            style={{
              fontSize: "14px",
              color: "rgba(212, 175, 55, 0.5)",
              fontWeight: 500,
            }}
          >
            286 BPM
          </div>
          <div style={{ fontSize: "8px", letterSpacing: "2px", opacity: 0.3, marginTop: "8px" }}>
            HARMONIC
          </div>
          <div
            style={{
              fontSize: "14px",
              color: "rgba(212, 175, 55, 0.4)",
              fontWeight: 500,
            }}
          >
            3-6-9
          </div>
        </div>
      )}

      {/* CSS KEYFRAMES */}
      <style>{`
        @keyframes ripple {
          0% {
            transform: scale(1);
            opacity: 0.5;
          }
          100% {
            transform: scale(2.5);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
