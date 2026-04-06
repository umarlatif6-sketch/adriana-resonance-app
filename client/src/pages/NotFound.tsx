import { useLocation } from "wouter";

export default function NotFound() {
  const [, navigate] = useLocation();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#020202",
        color: "#00ff41",
        fontFamily: "'JetBrains Mono', monospace",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "2rem",
      }}
    >
      <div style={{ fontSize: "2rem", marginBottom: "1rem", opacity: 0.6 }}>◇</div>
      <div style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.2em", marginBottom: "0.5rem" }}>
        404 — NODE NOT FOUND
      </div>
      <div style={{ fontSize: "0.5rem", color: "rgba(0,255,65,0.3)", marginBottom: "1.5rem", lineHeight: 1.8 }}>
        The frequency you are looking for does not exist in this mesh.
      </div>
      <button
        onClick={() => navigate("/")}
        style={{
          padding: "0.6rem 1.5rem",
          border: "1px solid rgba(0,255,65,0.3)",
          background: "rgba(0,255,65,0.05)",
          color: "#00ff41",
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "0.55rem",
          fontWeight: 700,
          letterSpacing: "0.1em",
          cursor: "pointer",
        }}
      >
        RETURN TO RESONATOR
      </button>
    </div>
  );
}
