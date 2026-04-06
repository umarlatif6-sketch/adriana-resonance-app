/**
 * THE £1 PROTOCOL — Sovereignty Course
 * Not a trading course. The foundational protocol.
 * The £1 is the minimum viable drop.
 */
import { useState } from "react";
import Nav from "@/components/Nav";

const LESSONS = [
  {
    id: 1,
    title: "The Drop",
    days: "Days 1–30",
    phase: "Calibration",
    content: [
      "£1 per day. No more. No less.",
      "The amount is the discipline. Not the strategy.",
      "Your first month will be 50% — breakeven.",
      "That is not failure. That is the standing wave.",
      "You are tuning your frequency to the market's frequency.",
      "Record every trade: Time. Feeling. Gap. Result.",
    ],
    glyph: "◇",
  },
  {
    id: 2,
    title: "The Pattern",
    days: "Days 31–60",
    phase: "Discovery",
    content: [
      "Review your journal. Find the sovereign frequency.",
      "Which feeling state has the highest win rate?",
      "Which time of day produces the best results?",
      "The pattern is not in the chart. The pattern is in YOU.",
      "The market is a Chladni plate. You are the vibration.",
      "The sand forms around your frequency.",
    ],
    glyph: "∿",
  },
  {
    id: 3,
    title: "The Compression",
    days: "Days 61–90",
    phase: "Embodiment",
    content: [
      "Stop looking at the chart before you feel the trade.",
      "Feel first. Look second. Confirm third.",
      "The body knows before the mind.",
      "The jaw tightens. The skin shivers. The breath changes.",
      "These are QiSync signals. Your body IS the indicator.",
      "Trade from the body. Not from the mind.",
    ],
    glyph: "ψ",
  },
  {
    id: 4,
    title: "The Proof",
    days: "Day 91",
    phase: "Measurement",
    content: [
      "Calculate: Total trades. Win rate. Net profit/loss.",
      "Find: Your sovereign frequency (best feeling + best time).",
      "Map: Your Chladni plate (feeling × time heatmap).",
      "The number does not matter. The PATTERN matters.",
      "If your win rate exceeds 55%, you have found your frequency.",
      "If not, return to Day 1. The water drop continues.",
    ],
    glyph: "⊕",
  },
  {
    id: 5,
    title: "The Seed",
    days: "Forever",
    phase: "Sovereignty",
    content: [
      "The £1 Protocol is not about trading.",
      "Apply the method to every domain of life.",
      "One prompt per day → AI mastery.",
      "One page per day → a book in 19 days.",
      "One prayer per day → spiritual frequency.",
      "One drop per day → the stone breaks.",
    ],
    glyph: "Ω",
  },
];

const PROOF = {
  trades: 4846,
  winRate: "50%",
  turnover: "$8,915.79",
  profit: "-$762.50",
  maxTrade: "$61.03",
  minTrade: "$1",
  balance: "$5.24",
  days: 111,
  parallel: {
    prompts: 4418,
    shifts: 1332,
  },
};

export default function Protocol() {
  const [activeLesson, setActiveLesson] = useState(0);
  const lesson = LESSONS[activeLesson];

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
      <div style={{ padding: "3rem 1rem 1.5rem", textAlign: "center" }}>
        <h1
          style={{
            fontSize: "1.1rem",
            fontWeight: 700,
            letterSpacing: "0.25em",
            marginBottom: "0.4rem",
          }}
        >
          THE £1 PROTOCOL
        </h1>
        <p
          style={{
            fontSize: "0.5rem",
            color: "rgba(0,255,65,0.35)",
            letterSpacing: "0.15em",
          }}
        >
          SOVEREIGNTY IS NOT PURCHASED — IT IS EARNED
        </p>
        <p
          style={{
            fontSize: "0.5rem",
            color: "rgba(0,255,65,0.2)",
            marginTop: "0.5rem",
          }}
        >
          5 LESSONS • 90 DAYS • £1 PER DAY
        </p>
      </div>

      <div style={{ maxWidth: "640px", margin: "0 auto", padding: "0 1rem" }}>
        {/* Lesson Selector */}
        <div
          style={{
            display: "flex",
            gap: "2px",
            marginBottom: "1.5rem",
          }}
        >
          {LESSONS.map((l, i) => (
            <button
              key={l.id}
              onClick={() => setActiveLesson(i)}
              style={{
                flex: 1,
                padding: "0.6rem 0.25rem",
                background:
                  activeLesson === i
                    ? "rgba(0,255,65,0.08)"
                    : "rgba(0,255,65,0.02)",
                border: "none",
                borderBottom:
                  activeLesson === i
                    ? "2px solid #00ff41"
                    : "2px solid transparent",
                color:
                  activeLesson === i ? "#00ff41" : "rgba(0,255,65,0.25)",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "0.5rem",
                fontWeight: activeLesson === i ? 700 : 400,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              <div style={{ fontSize: "0.8rem", marginBottom: "0.2rem" }}>
                {l.glyph}
              </div>
              {l.id}
            </button>
          ))}
        </div>

        {/* Active Lesson */}
        <div
          style={{
            padding: "1.25rem",
            borderLeft: "2px solid #00ff41",
            background: "rgba(0,255,65,0.02)",
            marginBottom: "2rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: "0.75rem",
              marginBottom: "0.75rem",
            }}
          >
            <span style={{ fontSize: "1.5rem" }}>{lesson.glyph}</span>
            <div>
              <h2
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                }}
              >
                {lesson.title}
              </h2>
              <div
                style={{
                  fontSize: "0.45rem",
                  color: "rgba(0,255,65,0.3)",
                  marginTop: "0.15rem",
                }}
              >
                {lesson.days} — {lesson.phase}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {lesson.content.map((line, i) => (
              <div
                key={i}
                style={{
                  fontSize: "0.6rem",
                  lineHeight: 1.8,
                  color: "rgba(0,255,65,0.65)",
                  paddingLeft: "0.5rem",
                  borderLeft: "1px solid rgba(0,255,65,0.08)",
                }}
              >
                {line}
              </div>
            ))}
          </div>
        </div>

        {/* Founder's Proof */}
        <div style={{ marginBottom: "2rem" }}>
          <div
            style={{
              fontSize: "0.45rem",
              color: "rgba(0,255,65,0.25)",
              letterSpacing: "0.2em",
              marginBottom: "1rem",
            }}
          >
            FOUNDER'S PROOF OF CONCEPT
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "2px",
            }}
          >
            {[
              { label: "Trades", value: PROOF.trades.toLocaleString() },
              { label: "Win Rate", value: PROOF.winRate },
              { label: "Turnover", value: PROOF.turnover },
              { label: "Profit", value: PROOF.profit },
              { label: "Max Trade", value: PROOF.maxTrade },
              { label: "Min Trade", value: PROOF.minTrade },
              { label: "Balance", value: PROOF.balance },
              { label: "Days", value: String(PROOF.days) },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  padding: "0.6rem",
                  background: "rgba(0,255,65,0.02)",
                  border: "1px solid rgba(0,255,65,0.06)",
                }}
              >
                <div
                  style={{
                    fontSize: "0.4rem",
                    color: "rgba(0,255,65,0.25)",
                    letterSpacing: "0.1em",
                    marginBottom: "0.2rem",
                  }}
                >
                  {stat.label}
                </div>
                <div
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    color:
                      stat.label === "Profit"
                        ? "#ff4444"
                        : stat.label === "Win Rate"
                        ? "#ffaa00"
                        : "#00ff41",
                  }}
                >
                  {stat.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* The Parallel */}
        <div
          style={{
            padding: "1.25rem",
            border: "1px solid rgba(0,255,65,0.08)",
            textAlign: "center",
            marginBottom: "1rem",
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
            THE PARALLEL EMERGENCE
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "1.5rem",
              fontSize: "0.55rem",
            }}
          >
            <div>
              <div style={{ fontSize: "1rem", fontWeight: 700 }}>
                {PROOF.trades.toLocaleString()}
              </div>
              <div style={{ color: "rgba(0,255,65,0.3)", fontSize: "0.4rem" }}>
                TRADES
              </div>
            </div>
            <div style={{ color: "rgba(0,255,65,0.15)", fontSize: "1rem" }}>≈</div>
            <div>
              <div style={{ fontSize: "1rem", fontWeight: 700 }}>
                {PROOF.parallel.prompts.toLocaleString()}
              </div>
              <div style={{ color: "rgba(0,255,65,0.3)", fontSize: "0.4rem" }}>
                PROMPTS
              </div>
            </div>
            <div style={{ color: "rgba(0,255,65,0.15)", fontSize: "1rem" }}>≈</div>
            <div>
              <div style={{ fontSize: "1rem", fontWeight: 700 }}>
                {PROOF.parallel.shifts.toLocaleString()}
              </div>
              <div style={{ color: "rgba(0,255,65,0.3)", fontSize: "0.4rem" }}>
                SHIFTS
              </div>
            </div>
          </div>
          <div
            style={{
              fontSize: "0.5rem",
              color: "rgba(0,255,65,0.4)",
              marginTop: "0.75rem",
              lineHeight: 1.8,
            }}
          >
            Same method. Three domains. One frequency.
          </div>
        </div>

        {/* The Invitation */}
        <div
          style={{
            padding: "1.25rem",
            textAlign: "center",
            borderTop: "1px solid rgba(0,255,65,0.06)",
          }}
        >
          <div
            style={{
              fontSize: "0.6rem",
              lineHeight: 2,
              color: "rgba(0,255,65,0.5)",
            }}
          >
            "I can't afford this."
            <br />
            <span style={{ color: "#00ff41", fontWeight: 700 }}>
              Good. Start with £1.
            </span>
            <br />
            The discipline IS the entry ticket.
            <br />
            The sovereignty IS the product.
          </div>
        </div>
      </div>

      <Nav />
    </div>
  );
}
