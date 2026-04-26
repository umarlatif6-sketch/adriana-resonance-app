/**
 * ═══════════════════════════════════════════════════════════════
 * DJ MIXER COMPONENT — Frequency-Based Track Blending
 * ═══════════════════════════════════════════════════════════════
 *
 * Dual-track mixer with frequency crossfader
 * Integrated into the Resonator homepage
 */

import { useDJMixer } from "@/hooks/useDJMixer";
import { useState } from "react";

export function DJMixer() {
  const mixer = useDJMixer();
  const [selectedMashupName, setSelectedMashupName] = useState("");
  const [isSavingMashup, setIsSavingMashup] = useState(false);

  const trackA = mixer.tracks[mixer.state.trackAIndex];
  const trackB = mixer.tracks[mixer.state.trackBIndex];

  const handlePlay = () => {
    if (!trackA || !trackB) return;

    // Get stem URLs (in production, these would come from separated stems)
    const trackAUrl = `${trackA.index}`;
    const trackBUrl = `${trackB.index}`;

    mixer.play(trackAUrl, trackBUrl);
  };

  const handleSaveMashup = async () => {
    if (!selectedMashupName) return;
    setIsSavingMashup(true);
    try {
      await mixer.createMashup(selectedMashupName);
      setSelectedMashupName("");
    } catch (error) {
      console.error("Failed to save mashup:", error);
    } finally {
      setIsSavingMashup(false);
    }
  };

  return (
    <div
      style={{
        padding: "1.5rem",
        border: "1px solid rgba(0,255,65,0.2)",
        background: "rgba(0,255,65,0.02)",
        marginTop: "1.5rem",
      }}
    >
      <h3 style={{ fontSize: "0.85rem", marginBottom: "1rem", color: "#00ff41" }}>
        ◆ SOVEREIGN DJ MIXER
      </h3>

      {/* Frequency Bars */}
      <div
        style={{
          display: "flex",
          gap: "0.25rem",
          marginBottom: "1.5rem",
          height: "80px",
          alignItems: "flex-end",
        }}
      >
        {mixer.barLevels.map((level, i) => (
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

      {/* Dual Track Display */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        {/* Track A */}
        <div
          style={{
            padding: "1rem",
            border: "1px solid rgba(0,255,65,0.2)",
            background: "rgba(0,255,65,0.05)",
          }}
        >
          <div style={{ fontSize: "0.65rem", color: "rgba(0,255,65,0.5)", marginBottom: "0.5rem" }}>
            TRACK A
          </div>
          <div style={{ fontSize: "0.8rem", marginBottom: "0.5rem" }}>
            {trackA?.title || "Select Track"}
          </div>
          <div style={{ fontSize: "0.65rem", color: "rgba(0,255,65,0.4)", marginBottom: "0.75rem" }}>
            {trackA?.dominantHz.toFixed(1)}Hz • {mixer.state.trackAStem}
          </div>

          <select
            value={mixer.state.trackAIndex}
            onChange={(e) =>
              mixer.setState((prev) => ({
                ...prev,
                trackAIndex: parseInt(e.target.value),
              }))
            }
            style={{
              width: "100%",
              padding: "0.5rem",
              marginBottom: "0.5rem",
              border: "1px solid rgba(0,255,65,0.2)",
              background: "rgba(0,255,65,0.02)",
              color: "#00ff41",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "0.7rem",
            }}
          >
            {mixer.tracks.map((t) => (
              <option key={t.index} value={t.index}>
                {t.title}
              </option>
            ))}
          </select>

          <select
            value={mixer.state.trackAStem}
            onChange={(e) =>
              mixer.setState((prev) => ({
                ...prev,
                trackAStem: e.target.value as any,
              }))
            }
            style={{
              width: "100%",
              padding: "0.5rem",
              border: "1px solid rgba(0,255,65,0.2)",
              background: "rgba(0,255,65,0.02)",
              color: "#00ff41",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "0.7rem",
            }}
          >
            <option value="vocals">Vocals</option>
            <option value="drums">Drums</option>
            <option value="bass">Bass</option>
            <option value="other">Other</option>
          </select>

          <div
            style={{
              marginTop: "0.75rem",
              fontSize: "0.65rem",
              color: "rgba(0,255,65,0.5)",
            }}
          >
            Volume: {mixer.crossfadeVolumes.volumeA.toFixed(0)}%
          </div>
        </div>

        {/* Track B */}
        <div
          style={{
            padding: "1rem",
            border: "1px solid rgba(0,255,65,0.2)",
            background: "rgba(0,255,65,0.05)",
          }}
        >
          <div style={{ fontSize: "0.65rem", color: "rgba(0,255,65,0.5)", marginBottom: "0.5rem" }}>
            TRACK B
          </div>
          <div style={{ fontSize: "0.8rem", marginBottom: "0.5rem" }}>
            {trackB?.title || "Select Track"}
          </div>
          <div style={{ fontSize: "0.65rem", color: "rgba(0,255,65,0.4)", marginBottom: "0.75rem" }}>
            {trackB?.dominantHz.toFixed(1)}Hz • {mixer.state.trackBStem}
          </div>

          <select
            value={mixer.state.trackBIndex}
            onChange={(e) =>
              mixer.setState((prev) => ({
                ...prev,
                trackBIndex: parseInt(e.target.value),
              }))
            }
            style={{
              width: "100%",
              padding: "0.5rem",
              marginBottom: "0.5rem",
              border: "1px solid rgba(0,255,65,0.2)",
              background: "rgba(0,255,65,0.02)",
              color: "#00ff41",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "0.7rem",
            }}
          >
            {mixer.tracks.map((t) => (
              <option key={t.index} value={t.index}>
                {t.title}
              </option>
            ))}
          </select>

          <select
            value={mixer.state.trackBStem}
            onChange={(e) =>
              mixer.setState((prev) => ({
                ...prev,
                trackBStem: e.target.value as any,
              }))
            }
            style={{
              width: "100%",
              padding: "0.5rem",
              border: "1px solid rgba(0,255,65,0.2)",
              background: "rgba(0,255,65,0.02)",
              color: "#00ff41",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "0.7rem",
            }}
          >
            <option value="vocals">Vocals</option>
            <option value="drums">Drums</option>
            <option value="bass">Bass</option>
            <option value="other">Other</option>
          </select>

          <div
            style={{
              marginTop: "0.75rem",
              fontSize: "0.65rem",
              color: "rgba(0,255,65,0.5)",
            }}
          >
            Volume: {mixer.crossfadeVolumes.volumeB.toFixed(0)}%
          </div>
        </div>
      </div>

      {/* Frequency Crossfader */}
      <div style={{ marginBottom: "1.5rem" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "0.65rem",
            marginBottom: "0.5rem",
          }}
        >
          <span style={{ color: "rgba(0,255,65,0.5)" }}>FREQUENCY CROSSFADER</span>
          <span style={{ color: "#00ff41" }}>
            {mixer.frequency.toFixed(1)}Hz • {mixer.state.crossfadePosition.toFixed(0)}%
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          step="1"
          value={mixer.state.crossfadePosition}
          onChange={(e) => mixer.updateCrossfade(parseFloat(e.target.value))}
          style={{
            width: "100%",
            accentColor: "#00ff41",
            cursor: "pointer",
            marginBottom: "0.75rem",
          }}
        />

        {/* Frequency Markers */}
        <div
          style={{
            display: "flex",
            gap: "0.25rem",
            fontSize: "0.55rem",
            color: "rgba(0,255,65,0.4)",
            flexWrap: "wrap",
          }}
        >
          {mixer.markers.map((marker) => (
            <div
              key={marker.label}
              style={{
                padding: "0.25rem 0.5rem",
                border: "1px solid rgba(0,255,65,0.1)",
                background: "rgba(0,255,65,0.02)",
              }}
            >
              {marker.label}: {marker.frequency.toFixed(0)}Hz
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginBottom: "1rem" }}>
        <button
          onClick={mixer.state.isPlaying ? mixer.stop : handlePlay}
          style={{
            padding: "0.75rem",
            border: mixer.state.isPlaying ? "1px solid #ff4444" : "1px solid #00ff41",
            background: mixer.state.isPlaying
              ? "rgba(255,68,68,0.05)"
              : "rgba(0,255,65,0.05)",
            color: mixer.state.isPlaying ? "#ff4444" : "#00ff41",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "0.75rem",
            cursor: "pointer",
            textTransform: "uppercase",
          }}
        >
          {mixer.state.isPlaying ? "▪ Stop Mix" : "▶ Play Mix"}
        </button>

        <button
          onClick={handleSaveMashup}
          disabled={!selectedMashupName || isSavingMashup}
          style={{
            padding: "0.75rem",
            border: "1px solid rgba(0,255,65,0.3)",
            background: "rgba(0,255,65,0.05)",
            color: "#00ff41",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "0.75rem",
            cursor: "pointer",
            textTransform: "uppercase",
            opacity: selectedMashupName ? 1 : 0.5,
          }}
        >
          {isSavingMashup ? "▪ Saving..." : "💾 Save Mashup"}
        </button>
      </div>

      {/* Save Mashup Input */}
      <input
        type="text"
        placeholder="Mashup name..."
        value={selectedMashupName}
        onChange={(e) => setSelectedMashupName(e.target.value)}
        style={{
          width: "100%",
          padding: "0.5rem",
          border: "1px solid rgba(0,255,65,0.2)",
          background: "rgba(0,255,65,0.02)",
          color: "#00ff41",
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "0.7rem",
        }}
      />

      {/* Audio Elements */}
      <audio ref={mixer.audioARef} crossOrigin="anonymous" style={{ display: "none" }} />
      <audio ref={mixer.audioBRef} crossOrigin="anonymous" style={{ display: "none" }} />
    </div>
  );
}
