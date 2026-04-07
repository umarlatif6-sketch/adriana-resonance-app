/**
 * FlowerQR — The Gate Component
 * Reads entrance data, generates the visitor's flower, renders it as a QR code.
 * One component. One field. One flower.
 */
import { useEffect, useState, useCallback } from "react";
import { QRCodeSVG } from "qrcode.react";
import { trpc } from "@/lib/trpc";

// Collect the 19 entrance data points from the browser
function collectEntranceData() {
  const nav = navigator as any;
  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    languages: Array.from(navigator.languages || []),
    platform: nav.platform || "unknown",
    screenWidth: screen.width,
    screenHeight: screen.height,
    colorDepth: screen.colorDepth,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timezoneOffset: new Date().getTimezoneOffset(),
    referrer: document.referrer || "",
    connectionType: nav.connection?.effectiveType || "unknown",
    deviceMemory: nav.deviceMemory || 0,
    hardwareConcurrency: navigator.hardwareConcurrency || 0,
    touchPoints: navigator.maxTouchPoints || 0,
    // Canvas fingerprint
    canvasFingerprint: (() => {
      try {
        const c = document.createElement("canvas");
        const ctx = c.getContext("2d");
        if (!ctx) return "none";
        ctx.textBaseline = "top";
        ctx.font = "14px Arial";
        ctx.fillText("0161", 2, 2);
        return c.toDataURL().slice(-16);
      } catch { return "blocked"; }
    })(),
    // WebGL renderer
    webglRenderer: (() => {
      try {
        const c = document.createElement("canvas");
        const gl = c.getContext("webgl");
        if (!gl) return "none";
        const ext = gl.getExtension("WEBGL_debug_renderer_info");
        return ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : "unknown";
      } catch { return "blocked"; }
    })(),
    // Audio fingerprint (simplified)
    audioFingerprint: (() => {
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const hash = ctx.sampleRate.toString(16) + ctx.destination.maxChannelCount.toString(16);
        ctx.close();
        return hash;
      } catch { return "none"; }
    })(),
    fontsDetected: 0, // simplified
    cookiesEnabled: navigator.cookieEnabled,
    doNotTrack: navigator.doNotTrack || "unset",
  };
}

// Map frequency to color — the aura
function frequencyToColor(freq: number): string {
  if (freq <= 432) return "#00ff41"; // sovereign green
  if (freq <= 528) return "#41ffb6"; // healing teal
  if (freq <= 639) return "#4169ff"; // connection blue
  if (freq <= 741) return "#a041ff"; // expression purple
  if (freq <= 852) return "#ff41a0"; // intuition pink
  return "#ffd700"; // crown gold
}

// Map frequency to Solfeggio name
function frequencyToSolfeggio(freq: number): string {
  if (freq <= 417) return "UT — Liberation";
  if (freq <= 471) return "RE — Resonance";
  if (freq <= 528) return "MI — Transformation";
  if (freq <= 583) return "FA — Connection";
  if (freq <= 693) return "SOL — Expression";
  if (freq <= 795) return "LA — Awakening";
  if (freq <= 900) return "SI — Intuition";
  return "OM — Crown";
}

interface FlowerQRProps {
  sessionId: string;
  compact?: boolean;
  onFlowerReady?: (data: { hex: string; frequency: number; slot: number }) => void;
}

export default function FlowerQR({ sessionId, compact = false, onFlowerReady }: FlowerQRProps) {
  const [entranceData, setEntranceData] = useState<ReturnType<typeof collectEntranceData> | null>(null);

  const readEntrance = trpc.gate.readEntrance.useMutation();
  const { data: qrData } = trpc.gate.getFlowerQR.useQuery(
    { sessionId },
    { enabled: !!readEntrance.data }
  );

  // Collect entrance data once on mount
  useEffect(() => {
    const data = collectEntranceData();
    setEntranceData(data);
  }, []);

  // Send entrance data to the gate
  useEffect(() => {
    if (!entranceData || readEntrance.data || readEntrance.isPending) return;
    readEntrance.mutate({
      sessionId,
      ...entranceData,
    });
  }, [entranceData, sessionId]);

  // Notify parent when flower is ready
  useEffect(() => {
    if (readEntrance.data && onFlowerReady) {
      onFlowerReady({
        hex: readEntrance.data.entranceHex || "",
        frequency: readEntrance.data.entranceFrequency || 432,
        slot: readEntrance.data.collectionSlot || 1,
      });
    }
  }, [readEntrance.data]);

  const flower = readEntrance.data;
  if (!flower) {
    return (
      <div className="flex items-center justify-center p-4" style={{ color: "#00ff41" }}>
        <span className="animate-pulse">Reading entrance data...</span>
      </div>
    );
  }

  const color = frequencyToColor(flower.entranceFrequency || 432);
  const solfeggio = frequencyToSolfeggio(flower.entranceFrequency || 432);

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }}
        />
        <span style={{ color, fontFamily: "'JetBrains Mono', monospace", fontSize: "12px" }}>
          {flower.entranceHex} · {flower.entranceFrequency}Hz · Slot {flower.collectionSlot}
        </span>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col items-center gap-4 p-6"
      style={{
        background: "#020202",
        border: `1px solid ${color}22`,
        fontFamily: "'JetBrains Mono', monospace",
      }}
    >
      {/* The Flower — QR Code */}
      <div
        className="p-3"
        style={{
          background: "#020202",
          border: `2px solid ${color}`,
          boxShadow: `0 0 20px ${color}33`,
        }}
      >
        {qrData?.qrPayload ? (
          <QRCodeSVG
            value={qrData.qrPayload}
            size={180}
            bgColor="#020202"
            fgColor={color}
            level="M"
          />
        ) : (
          <div className="w-[180px] h-[180px] flex items-center justify-center">
            <span className="animate-pulse" style={{ color }}>Generating flower...</span>
          </div>
        )}
      </div>

      {/* The Aura — Frequency Reading */}
      <div className="text-center space-y-1">
        <div style={{ color, fontSize: "24px", fontWeight: "bold" }}>
          {flower.entranceHex}
        </div>
        <div style={{ color: `${color}99`, fontSize: "14px" }}>
          {flower.entranceFrequency} Hz · {solfeggio}
        </div>
        <div style={{ color: "#666", fontSize: "12px" }}>
          Collection Slot {flower.collectionSlot} / 286
        </div>
        {/* DNA Triple-Key */}
        {(flower as any).dna && (
          <div style={{ marginTop: "0.5rem" }}>
            <div style={{ color: "#444", fontSize: "9px", letterSpacing: "0.15em" }}>DNA TRIPLE-KEY</div>
            <div style={{ color: `${color}66`, fontSize: "10px", fontFamily: "'JetBrains Mono', monospace", wordBreak: "break-all" }}>
              {(flower as any).dna}
            </div>
          </div>
        )}
      </div>

      {/* 19 Data Points Indicator */}
      <div className="flex gap-1">
        {Array.from({ length: 19 }).map((_, i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full"
            style={{
              backgroundColor: color,
              opacity: 0.3 + (i / 19) * 0.7,
            }}
          />
        ))}
      </div>
      <div style={{ color: "#444", fontSize: "10px" }}>
        19 data points · 19 pages · Your book is written
      </div>
    </div>
  );
}
