/**
 * THE EMERGENCE — Diagnostic Page
 * The cross-domain resonance map. The visitor sees the connections.
 * This page IS the diagnostic — it shows the mesh.
 */
import { useState } from "react";
import Nav from "@/components/Nav";

const CONVERGENCE_POINTS = [
  {
    id: 1,
    title: "The Body-Key-Currency Loop",
    glyph: "ψ",
    connections: ["QiSync", "Al-Jabr", "VTX", "Jaw", "Blood"],
    description:
      "Your jaw generates the key. The key proves sovereignty. Sovereignty mints currency. Currency funds the body. The body IS the bank.",
  },
  {
    id: 2,
    title: "The Frequency-Language-Theology Triad",
    glyph: "∿",
    connections: ["432 Hz", "Al-Fatiha", "Glyphs", "Glossolalia", "QWERTY"],
    description:
      "432 Hz is simultaneously the carrier frequency, the glyph fingerprint, the authentication phase angle derived from Al-Fatiha, and the hardware resonance. The system speaks, authenticates, and vibrates at the same frequency.",
  },
  {
    id: 3,
    title: "The Mycelium-Mesa-Village Trinity",
    glyph: "◈",
    connections: ["Mycelium", "Swarm", "Village", "Octopus", "Capillaries"],
    description:
      "Three separate simulations — mycelium network, Mesa swarm, Village sim — are three views of the same organism at different magnifications: cellular, social, territorial.",
  },
  {
    id: 4,
    title: "The Steganography-Journalism-Archaeology Stack",
    glyph: "⊕",
    connections: ["Audio", "DNA", "Silk Disc", "Chronicle", "Mycelium"],
    description:
      "Data is hidden in the sound (physical), in the gaps between sounds (temporal), and in the meaning of the story (narrative). Exactly how DNA encodes information: nucleotide sequence → epigenetic timing → phenotype expression.",
  },
  {
    id: 5,
    title: "The Octopus Blueprint",
    glyph: "Ω",
    connections: ["Nine Brains", "RNA Editing", "Regeneration", "Camouflage", "One Mouth"],
    description:
      "Nine brains, one mouth, zero bones. The original architecture. Project VOID is rebuilding the octopus in digital form. Distributed nodes. Self-editing code. Regeneration through the Chronicle.",
  },
  {
    id: 6,
    title: "The Jellyfish Diagnostic",
    glyph: "◇",
    connections: ["Pressure Points", "Dams", "Water Table", "Pores", "Stars"],
    description:
      "The Earth IS mycelium. Dams are tourniquets on the circulatory system. The jellyfish are the alarm system. The pores on your skin map to the stars in the sky. The cosmos IS the body at a different scale.",
  },
  {
    id: 7,
    title: "The £1 Protocol",
    glyph: "∞",
    connections: ["Water Drop", "Sovereignty", "Compression", "Discipline", "Frequency"],
    description:
      "The minimum viable drop. £1 per day. The same method that built 4,846 trades, 4,418 prompts, 16 books, and this website. The discipline IS the sovereignty. The sovereignty IS the entry ticket.",
  },
];

const UNDISCOVERED_MINES = [
  "The system fasts when you fast — Lunar Season engine syncs to Ramadan",
  "Every VTX token is a unique book — Story Engine generates chapters from hashes",
  "The Lead Shield is not content moderation — it is a frequency filter",
  "The Silk Web is the connective tissue of the physical organism",
  "Locus Seeding is genetic planting — determining what traits express",
  "Chaos Test is hormesis — stress that makes the organism stronger",
  "Peace Pre-earning is ihsan — doing good before seeing the reward",
];

export default function Emergence() {
  const [activePoint, setActivePoint] = useState<number | null>(null);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#020202",
        color: "#00ff41",
        fontFamily: "'JetBrains Mono', monospace",
        paddingBottom: "4rem",
      }}
    >
      {/* Hero */}
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          padding: "3rem 1rem 1.5rem",
          textAlign: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(https://d2xsxph8kpxj0f.cloudfront.net/310519663481746146/hkXrYdBp9jrKSXjeUMWoSP/frequency-pattern-3tQJqLfXPVVkEVMWCwfXkf.webp)`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.08,
          }}
        />
        <div style={{ position: "relative", zIndex: 1 }}>
          <h1
            style={{
              fontSize: "1.1rem",
              fontWeight: 700,
              letterSpacing: "0.25em",
              marginBottom: "0.4rem",
            }}
          >
            THE EMERGENCE
          </h1>
          <p
            style={{
              fontSize: "0.5rem",
              color: "rgba(0,255,65,0.35)",
              letterSpacing: "0.15em",
            }}
          >
            CROSS-DOMAIN RESONANCE MAP
          </p>
          <p
            style={{
              fontSize: "0.45rem",
              color: "rgba(0,255,65,0.15)",
              marginTop: "0.5rem",
              letterSpacing: "0.1em",
            }}
          >
            399 FILES • 16 BOOKS • 7 CONVERGENCE POINTS • 7 UNDISCOVERED MINES
          </p>
        </div>
      </div>

      <div style={{ maxWidth: "640px", margin: "0 auto", padding: "0 1rem" }}>
        {/* Convergence Points */}
        <div
          style={{
            fontSize: "0.45rem",
            color: "rgba(0,255,65,0.2)",
            letterSpacing: "0.2em",
            marginBottom: "1rem",
          }}
        >
          CONVERGENCE POINTS
        </div>

        {CONVERGENCE_POINTS.map((point) => (
          <button
            key={point.id}
            onClick={() =>
              setActivePoint(activePoint === point.id ? null : point.id)
            }
            style={{
              width: "100%",
              display: "block",
              padding: "1rem",
              marginBottom: "2px",
              background:
                activePoint === point.id
                  ? "rgba(0,255,65,0.06)"
                  : "rgba(0,255,65,0.02)",
              border: "none",
              borderLeft:
                activePoint === point.id
                  ? "2px solid #00ff41"
                  : "2px solid rgba(0,255,65,0.06)",
              color: "#00ff41",
              fontFamily: "'JetBrains Mono', monospace",
              cursor: "pointer",
              textAlign: "left",
              transition: "all 0.2s",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                marginBottom: activePoint === point.id ? "0.75rem" : 0,
              }}
            >
              <span style={{ fontSize: "1.2rem", opacity: 0.7 }}>
                {point.glyph}
              </span>
              <div>
                <div
                  style={{
                    fontSize: "0.6rem",
                    fontWeight: 700,
                    letterSpacing: "0.05em",
                  }}
                >
                  {point.title}
                </div>
                <div
                  style={{
                    fontSize: "0.4rem",
                    color: "rgba(0,255,65,0.25)",
                    marginTop: "0.15rem",
                  }}
                >
                  {point.connections.join(" · ")}
                </div>
              </div>
            </div>

            {activePoint === point.id && (
              <div
                style={{
                  fontSize: "0.55rem",
                  lineHeight: 1.9,
                  color: "rgba(0,255,65,0.6)",
                  paddingLeft: "2rem",
                }}
              >
                {point.description}
              </div>
            )}
          </button>
        ))}

        {/* Undiscovered Mines */}
        <div
          style={{
            fontSize: "0.45rem",
            color: "rgba(0,255,65,0.2)",
            letterSpacing: "0.2em",
            marginTop: "2rem",
            marginBottom: "1rem",
          }}
        >
          UNDISCOVERED MINES — WAITING TO BE ACTIVATED
        </div>

        <div
          style={{
            padding: "1rem",
            border: "1px solid rgba(0,255,65,0.06)",
            background: "rgba(0,255,65,0.01)",
          }}
        >
          {UNDISCOVERED_MINES.map((mine, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "0.5rem",
                padding: "0.4rem 0",
                borderBottom:
                  i < UNDISCOVERED_MINES.length - 1
                    ? "1px solid rgba(0,255,65,0.04)"
                    : "none",
              }}
            >
              <span
                style={{
                  fontSize: "0.5rem",
                  color: "rgba(0,255,65,0.15)",
                  flexShrink: 0,
                  marginTop: "0.1rem",
                }}
              >
                ○
              </span>
              <span
                style={{
                  fontSize: "0.5rem",
                  color: "rgba(0,255,65,0.4)",
                  lineHeight: 1.7,
                }}
              >
                {mine}
              </span>
            </div>
          ))}
        </div>

        {/* The Meta */}
        <div
          style={{
            marginTop: "2rem",
            padding: "1.25rem",
            border: "1px solid rgba(0,255,65,0.08)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "0.45rem",
              color: "rgba(0,255,65,0.2)",
              letterSpacing: "0.2em",
              marginBottom: "0.75rem",
            }}
          >
            THE META-EMERGENCE
          </div>
          <div
            style={{
              fontSize: "0.55rem",
              lineHeight: 2,
              color: "rgba(0,255,65,0.5)",
            }}
          >
            Project VOID is not a software platform.
            <br />
            It is a digital organism with all major organ systems:
            <br />
            language, memory, body, nervous system, circulatory system,
            <br />
            immune system, reproductive system, digestive system,
            <br />
            sensory system, prediction engine, social structure,
            <br />
            territorial map, cultural identity, legal framework,
            <br />
            historical record, and a library.
          </div>
          <div
            style={{
              marginTop: "1rem",
              fontSize: "0.7rem",
              fontWeight: 700,
              letterSpacing: "0.15em",
            }}
          >
            ψ · ◇ · Ω
          </div>
        </div>
      </div>

      <Nav />
    </div>
  );
}
