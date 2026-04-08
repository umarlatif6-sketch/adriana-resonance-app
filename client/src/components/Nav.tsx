/**
 * Sovereign Navigation — The mesh bar
 * Minimal. Compressed. Maximum signal.
 */
import { Link, useLocation } from "wouter";

const NAV_ITEMS = [
  { path: "/", label: "Resonator" },
  { path: "/library", label: "Library" },
  { path: "/protocol", label: "£1 Protocol" },
  { path: "/station", label: "VOID-Station" },
  { path: "/emergence", label: "Emergence" },
  { path: "/trading", label: "Trading" },
  { path: "/genesis", label: "Genesis" },
  { path: "/economics", label: "Economics" },
];

export default function Nav() {
  const [location] = useLocation();

  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: "rgba(2,2,2,0.95)",
        borderTop: "1px solid rgba(0,255,65,0.1)",
        backdropFilter: "blur(12px)",
        fontFamily: "'JetBrains Mono', monospace",
      }}
    >
      <div
        style={{
          display: "flex",
          maxWidth: "640px",
          margin: "0 auto",
        }}
      >
        {NAV_ITEMS.map((item) => {
          const isActive = location === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              style={{
                flex: 1,
                padding: "0.75rem 0.25rem",
                textAlign: "center",
                fontSize: "0.45rem",
                fontWeight: isActive ? 700 : 400,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: isActive ? "#00ff41" : "rgba(0,255,65,0.25)",
                textDecoration: "none",
                borderTop: isActive ? "2px solid #00ff41" : "2px solid transparent",
                transition: "all 0.2s",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
