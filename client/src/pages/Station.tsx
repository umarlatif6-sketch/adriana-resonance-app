/**
 * THE VOID-STATION — Sovereign Console
 * 4 Stages. £292 total. Build an organism.
 * Not a product. A kit. A frequency device.
 */
import { useState } from "react";
import Nav from "@/components/Nav";

const STAGES = [
  {
    id: 1,
    title: "The Brain",
    subtitle: "Raspberry Pi 4 Sovereign Hub",
    cost: "£85",
    time: "30 minutes",
    difficulty: "Beginner",
    description:
      "The full VOID Engine stack on a £85 computer. Chronicle ledger, Beehive mesh, Al-Jabr 286 hash, 45-glyph SCL interpreter, VTX token economy. Every protocol layer that exists in the Stage 4 console is equally present here. The architecture compresses without loss.",
    parts: [
      { name: "Raspberry Pi 4 (4GB)", price: "£55" },
      { name: "MicroSD Card (32GB)", price: "£8" },
      { name: "USB-C Power Supply", price: "£8" },
      { name: "Heatsink Kit", price: "£5" },
      { name: "Case", price: "£9" },
    ],
    teaches: "Computing, Linux, networking, sovereignty",
    glyph: "⊕",
  },
  {
    id: 2,
    title: "The Hand",
    subtitle: "Sovereign Controller",
    cost: "£45",
    time: "2–3 hours",
    difficulty: "Intermediate",
    description:
      "A controller with a 0.96\" OLED display, haptic feedback motor, and an ESP32 microcontroller. The display shows VTX balance and sovereign status. The haptic motor vibrates at 432 Hz. The controller does not just play the game — it communicates through touch.",
    parts: [
      { name: "ESP32 DevKit", price: "£12" },
      { name: "0.96\" OLED Display", price: "£6" },
      { name: "Haptic Motor (432 Hz)", price: "£4" },
      { name: "Buttons & Joystick", price: "£8" },
      { name: "3D Printed Shell", price: "£15" },
    ],
    teaches: "Electronics, soldering, firmware, haptics",
    glyph: "∿",
  },
  {
    id: 3,
    title: "The Skin",
    subtitle: "Mycelium Housing",
    cost: "£85",
    time: "14–21 days (growing)",
    difficulty: "Advanced",
    description:
      "The console housing grown from mycelium. Agricultural waste substrate inoculated with Ganoderma lucidum. 14 days of growth. The child watches the organism build its own case. The case is alive during construction. It is a biology lesson, a patience lesson, and a sovereignty lesson wrapped in a game console.",
    parts: [
      { name: "Mycelium Spawn (Ganoderma)", price: "£15" },
      { name: "Agricultural Waste Substrate", price: "£5" },
      { name: "3D Printed Mould", price: "£20" },
      { name: "Growing Chamber", price: "£25" },
      { name: "Baking/Drying Equipment", price: "£20" },
    ],
    teaches: "Biology, mycology, patience, organic engineering",
    glyph: "◈",
  },
  {
    id: 4,
    title: "The Memory",
    subtitle: "Silk Disc",
    cost: "£77",
    time: "4–6 hours",
    difficulty: "Expert",
    description:
      "A physical memory card woven from silk, embedded with piezoelectric film, readable only at 432 Hz. The child's entire game history, their Chronicle, their VTX — stored on a disc they can hold. No cloud. No subscription. Sovereign memory.",
    parts: [
      { name: "Silk Fabric (Bombyx mori)", price: "£25" },
      { name: "Piezoelectric Film (PVDF)", price: "£18" },
      { name: "NFC Tag Stickers", price: "£5" },
      { name: "Conductive Thread", price: "£12" },
      { name: "Weaving Frame", price: "£17" },
    ],
    teaches: "Materials science, weaving, frequency, data storage",
    glyph: "Ω",
  },
];

export default function Station() {
  const [activeStage, setActiveStage] = useState(0);
  const stage = STAGES[activeStage];

  const totalCost = STAGES.reduce(
    (sum, s) => sum + parseInt(s.cost.replace("£", "")),
    0
  );

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
            backgroundImage: `url(https://d2xsxph8kpxj0f.cloudfront.net/310519663481746146/hkXrYdBp9jrKSXjeUMWoSP/mycelium-network-6rJQ6BUNbGNmXhJnmRVVgw.webp)`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.12,
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
            THE VOID-STATION
          </h1>
          <p
            style={{
              fontSize: "0.5rem",
              color: "rgba(0,255,65,0.35)",
              letterSpacing: "0.15em",
            }}
          >
            BUILD AN ORGANISM — NOT A PRODUCT
          </p>
          <p
            style={{
              fontSize: "0.5rem",
              color: "rgba(0,255,65,0.2)",
              marginTop: "0.5rem",
            }}
          >
            4 STAGES • £{totalCost} TOTAL • LESS THAN A PS5
          </p>
        </div>
      </div>

      <div style={{ maxWidth: "640px", margin: "0 auto", padding: "0 1rem" }}>
        {/* Stage Selector */}
        <div
          style={{
            display: "flex",
            gap: "2px",
            marginBottom: "1.5rem",
          }}
        >
          {STAGES.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setActiveStage(i)}
              style={{
                flex: 1,
                padding: "0.75rem 0.25rem",
                background:
                  activeStage === i
                    ? "rgba(0,255,65,0.08)"
                    : "rgba(0,255,65,0.02)",
                border: "none",
                borderBottom:
                  activeStage === i
                    ? "2px solid #00ff41"
                    : "2px solid transparent",
                color:
                  activeStage === i ? "#00ff41" : "rgba(0,255,65,0.25)",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "0.5rem",
                fontWeight: activeStage === i ? 700 : 400,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              <div style={{ fontSize: "0.9rem", marginBottom: "0.2rem" }}>
                {s.glyph}
              </div>
              <div>{s.title}</div>
              <div
                style={{
                  fontSize: "0.4rem",
                  color: "rgba(0,255,65,0.2)",
                  marginTop: "0.15rem",
                }}
              >
                {s.cost}
              </div>
            </button>
          ))}
        </div>

        {/* Active Stage */}
        <div
          style={{
            padding: "1.25rem",
            borderLeft: "2px solid #00ff41",
            background: "rgba(0,255,65,0.02)",
            marginBottom: "1.5rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: "0.75rem",
              marginBottom: "0.5rem",
            }}
          >
            <span style={{ fontSize: "1.5rem" }}>{stage.glyph}</span>
            <div>
              <h2
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                }}
              >
                Stage {stage.id}: {stage.title}
              </h2>
              <div
                style={{
                  fontSize: "0.5rem",
                  color: "rgba(0,255,65,0.4)",
                  marginTop: "0.1rem",
                }}
              >
                {stage.subtitle}
              </div>
            </div>
          </div>

          {/* Meta */}
          <div
            style={{
              display: "flex",
              gap: "1rem",
              marginBottom: "0.75rem",
              fontSize: "0.45rem",
              color: "rgba(0,255,65,0.3)",
            }}
          >
            <span>{stage.cost}</span>
            <span>{stage.time}</span>
            <span>{stage.difficulty}</span>
          </div>

          {/* Description */}
          <p
            style={{
              fontSize: "0.55rem",
              lineHeight: 1.9,
              color: "rgba(0,255,65,0.6)",
              marginBottom: "1rem",
            }}
          >
            {stage.description}
          </p>

          {/* Parts List */}
          <div
            style={{
              fontSize: "0.45rem",
              color: "rgba(0,255,65,0.2)",
              letterSpacing: "0.15em",
              marginBottom: "0.5rem",
            }}
          >
            PARTS LIST
          </div>
          {stage.parts.map((part) => (
            <div
              key={part.name}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "0.35rem 0",
                borderBottom: "1px solid rgba(0,255,65,0.04)",
                fontSize: "0.55rem",
              }}
            >
              <span style={{ color: "rgba(0,255,65,0.6)" }}>{part.name}</span>
              <span style={{ fontWeight: 700 }}>{part.price}</span>
            </div>
          ))}

          {/* Teaches */}
          <div
            style={{
              marginTop: "0.75rem",
              padding: "0.5rem",
              background: "rgba(0,255,65,0.03)",
              fontSize: "0.45rem",
              color: "rgba(0,255,65,0.4)",
            }}
          >
            <span
              style={{
                color: "rgba(0,255,65,0.2)",
                letterSpacing: "0.1em",
                marginRight: "0.5rem",
              }}
            >
              TEACHES:
            </span>
            {stage.teaches}
          </div>
        </div>

        {/* Total */}
        <div
          style={{
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
              marginBottom: "0.5rem",
            }}
          >
            TOTAL BUILD COST
          </div>
          <div
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              marginBottom: "0.3rem",
            }}
          >
            £{totalCost}
          </div>
          <div
            style={{
              fontSize: "0.5rem",
              color: "rgba(0,255,65,0.4)",
              lineHeight: 1.8,
            }}
          >
            Brain + Hand + Skin + Memory
            <br />
            Less than a PS5. More than a computer.
            <br />
            <span style={{ color: "#00ff41", fontWeight: 700 }}>
              A sovereign organism you built with your own hands.
            </span>
          </div>
        </div>
      </div>

      <Nav />
    </div>
  );
}
