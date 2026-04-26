/**
 * ═══════════════════════════════════════════════════════════════
 * SONIC STUDIO — The Audio Decomposition Interface
 * ═══════════════════════════════════════════════════════════════
 *
 * Separate 33 tracks into stems (vocals, drums, bass, other)
 * Apply real-time audio controls: pitch, volume, aggression, tempo, EQ
 * Blend stems at different frequencies
 */

import { useEffect, useState } from "react";
import { useSonicStudio } from "@/hooks/useSonicStudio";
import Nav from "@/components/Nav";

export default function SonicStudio() {
  const sonic = useSonicStudio();
  const [activeTab, setActiveTab] = useState<"library" | "studio" | "blend">(
    "library"
  );
  const [separatingTrack, setSeparatingTrack] = useState<number | null>(null);

  return (
    <div
      style={{
        background: "#020202",
        color: "#00ff41",
        fontFamily: "'JetBrains Mono', monospace",
        minHeight: "100vh",
        paddingBottom: "80px",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "1.5rem",
          borderBottom: "1px solid rgba(0,255,65,0.2)",
          marginBottom: "1.5rem",
        }}
      >
        <h1 style={{ margin: "0 0 0.5rem 0", fontSize: "1.5rem" }}>
          ◆ SONIC STUDIO
        </h1>
        <p style={{ margin: "0", fontSize: "0.75rem", color: "rgba(0,255,65,0.5)" }}>
          Decompose the 33-track library into stems. Apply frequency controls.
          Blend at sovereign frequencies.
        </p>
      </div>

      {/* Tab Navigation */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          padding: "0 1.5rem",
          marginBottom: "1.5rem",
          borderBottom: "1px solid rgba(0,255,65,0.1)",
        }}
      >
        {(["library", "studio", "blend"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "0.5rem 1rem",
              border: "none",
              background: activeTab === tab ? "rgba(0,255,65,0.1)" : "transparent",
              color: activeTab === tab ? "#00ff41" : "rgba(0,255,65,0.5)",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "0.75rem",
              cursor: "pointer",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              borderBottom: activeTab === tab ? "2px solid #00ff41" : "none",
            }}
          >
            {tab === "library" && "Track Library"}
            {tab === "studio" && "Audio Studio"}
            {tab === "blend" && "Cross-Frequency Blend"}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: "0 1.5rem" }}>
        {activeTab === "library" && (
          <LibraryTab
            sonic={sonic}
            separatingTrack={separatingTrack}
            setSeparatingTrack={setSeparatingTrack}
          />
        )}
        {activeTab === "studio" && <StudioTab sonic={sonic} />}
        {activeTab === "blend" && <BlendTab sonic={sonic} />}
      </div>

      {/* Audio Element */}
      <audio ref={sonic.audioRef} crossOrigin="anonymous" />

      <Nav />
    </div>
  );
}

/**
 * Library Tab — Browse and separate tracks
 */
function LibraryTab({
  sonic,
  separatingTrack,
  setSeparatingTrack,
}: {
  sonic: ReturnType<typeof useSonicStudio>;
  separatingTrack: number | null;
  setSeparatingTrack: (track: number | null) => void;
}) {
  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "1rem",
        }}
      >
        {sonic.tracks.map((track) => (
          <div
            key={track.index}
            style={{
              padding: "1rem",
              border: "1px solid rgba(0,255,65,0.2)",
              background: "rgba(0,255,65,0.02)",
              cursor: "pointer",
            }}
            onClick={() => sonic.setSelectedTrack(track.index)}
          >
            <div
              style={{
                fontSize: "0.75rem",
                color: "rgba(0,255,65,0.5)",
                marginBottom: "0.25rem",
              }}
            >
              Track {track.index + 1}
            </div>
            <div style={{ fontSize: "0.9rem", marginBottom: "0.5rem" }}>
              {track.title}
            </div>
            <div
              style={{
                fontSize: "0.65rem",
                color: "rgba(0,255,65,0.4)",
                marginBottom: "0.75rem",
              }}
            >
              {track.duration} • {track.dominantHz.toFixed(1)}Hz •{" "}
              {track.tuning}
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setSeparatingTrack(track.index);
                sonic.separateTrack(track.index);
              }}
              style={{
                width: "100%",
                padding: "0.5rem",
                border: "1px solid #00ff41",
                background: "rgba(0,255,65,0.05)",
                color: "#00ff41",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "0.7rem",
                cursor: "pointer",
                textTransform: "uppercase",
              }}
              disabled={separatingTrack === track.index}
            >
              {separatingTrack === track.index
                ? "▪ Separating..."
                : "▶ Separate Stems"}
            </button>

            {sonic.stems && sonic.selectedTrack === track.index && (
              <div style={{ marginTop: "0.75rem", fontSize: "0.65rem" }}>
                <div style={{ color: "#00ff41", marginBottom: "0.25rem" }}>
                  ✓ Stems ready
                </div>
                <div style={{ color: "rgba(0,255,65,0.5)" }}>
                  Vocals • Drums • Bass • Other
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Studio Tab — Real-time audio controls
 */
function StudioTab({ sonic }: { sonic: ReturnType<typeof useSonicStudio> }) {
  if (!sonic.stems) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "2rem",
          color: "rgba(0,255,65,0.5)",
        }}
      >
        Select a track and separate it first
      </div>
    );
  }

  const stemData = sonic.stems[
    sonic.selectedStem as keyof typeof sonic.stems
  ] as any;
  const stemUrl = stemData?.url;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "2rem",
      }}
    >
      {/* Left: Player */}
      <div>
        <h3 style={{ fontSize: "0.85rem", marginBottom: "1rem" }}>
          {sonic.selectedStem.toUpperCase()}
        </h3>

        {/* Frequency Bars */}
        <div
          style={{
            display: "flex",
            gap: "0.25rem",
            marginBottom: "1.5rem",
            height: "60px",
            alignItems: "flex-end",
          }}
        >
          {sonic.barLevels.map((level, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: `${level * 100}%`,
                background: `rgba(0,255,65,${0.3 + level * 0.7})`,
              }}
            />
          ))}
        </div>

        {/* Play Button */}
        <button
          onClick={() =>
            sonic.isPlaying ? sonic.stopPlayback() : sonic.playStem(stemUrl)
          }
          style={{
            width: "100%",
            padding: "0.75rem",
            border: sonic.isPlaying ? "1px solid #ff4444" : "1px solid #00ff41",
            background: sonic.isPlaying
              ? "rgba(255,68,68,0.05)"
              : "rgba(0,255,65,0.05)",
            color: sonic.isPlaying ? "#ff4444" : "#00ff41",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "0.75rem",
            cursor: "pointer",
            textTransform: "uppercase",
            marginBottom: "1.5rem",
          }}
        >
          {sonic.isPlaying ? "▪ Stop" : "▶ Play"}
        </button>

        {/* Stem Selector */}
        <div style={{ fontSize: "0.75rem", marginBottom: "0.5rem" }}>
          SELECT STEM
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
          {(["vocals", "drums", "bass", "other"] as const).map((stem) => (
            <button
              key={stem}
              onClick={() => sonic.setSelectedStem(stem)}
              style={{
                padding: "0.5rem",
                border:
                  sonic.selectedStem === stem
                    ? "1px solid #00ff41"
                    : "1px solid rgba(0,255,65,0.2)",
                background:
                  sonic.selectedStem === stem
                    ? "rgba(0,255,65,0.1)"
                    : "transparent",
                color: "#00ff41",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "0.7rem",
                cursor: "pointer",
                textTransform: "uppercase",
              }}
            >
              {stem}
            </button>
          ))}
        </div>
      </div>

      {/* Right: Controls */}
      <div>
        <h3 style={{ fontSize: "0.85rem", marginBottom: "1rem" }}>
          AUDIO CONTROLS
        </h3>

        {/* Presets */}
        <div style={{ marginBottom: "1.5rem" }}>
          <div style={{ fontSize: "0.65rem", color: "rgba(0,255,65,0.5)", marginBottom: "0.5rem" }}>
            PRESETS
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
            {sonic.presets.slice(0, 4).map((preset) => (
              <button
                key={preset.name}
                onClick={() => sonic.applyPreset(preset.name)}
                style={{
                  padding: "0.5rem",
                  border: "1px solid rgba(0,255,65,0.2)",
                  background: "rgba(0,255,65,0.02)",
                  color: "rgba(0,255,65,0.7)",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "0.65rem",
                  cursor: "pointer",
                  textTransform: "uppercase",
                }}
              >
                {preset.name.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Sliders */}
        <ControlSlider
          label="PITCH"
          value={sonic.controls.pitch}
          min={-12}
          max={12}
          onChange={(v) => sonic.updateControl("pitch", v)}
          unit="semitones"
        />
        <ControlSlider
          label="VOLUME"
          value={sonic.controls.volume}
          min={0}
          max={200}
          onChange={(v) => sonic.updateControl("volume", v)}
          unit="%"
        />
        <ControlSlider
          label="TEMPO"
          value={sonic.controls.tempo}
          min={0.5}
          max={2.0}
          step={0.1}
          onChange={(v) => sonic.updateControl("tempo", v)}
          unit="x"
        />
        <ControlSlider
          label="BASS"
          value={sonic.controls.bass}
          min={-12}
          max={12}
          onChange={(v) => sonic.updateControl("bass", v)}
          unit="dB"
        />
        <ControlSlider
          label="MID"
          value={sonic.controls.mid}
          min={-12}
          max={12}
          onChange={(v) => sonic.updateControl("mid", v)}
          unit="dB"
        />
        <ControlSlider
          label="TREBLE"
          value={sonic.controls.treble}
          min={-12}
          max={12}
          onChange={(v) => sonic.updateControl("treble", v)}
          unit="dB"
        />
      </div>
    </div>
  );
}

/**
 * Blend Tab — Cross-frequency resonance
 */
function BlendTab({ sonic }: { sonic: ReturnType<typeof useSonicStudio> }) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "2rem",
        color: "rgba(0,255,65,0.5)",
      }}
    >
      <p>Cross-Frequency Resonance — Blend stems at sovereign frequencies</p>
      <p style={{ fontSize: "0.75rem", marginTop: "1rem" }}>
        Coming soon: Real-time vocal + instrumental blending with frequency
        mapping
      </p>
    </div>
  );
}

/**
 * Control Slider Component
 */
function ControlSlider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  unit,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  unit: string;
}) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "0.65rem",
          marginBottom: "0.5rem",
        }}
      >
        <span style={{ color: "rgba(0,255,65,0.5)" }}>{label}</span>
        <span style={{ color: "#00ff41" }}>
          {value.toFixed(step < 1 ? 1 : 0)} {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{
          width: "100%",
          accentColor: "#00ff41",
          cursor: "pointer",
        }}
      />
    </div>
  );
}
