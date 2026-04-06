/**
 * THE LIBRARY — Collection Browser
 * 16 Books. 2 Collections. 304 Pages.
 * Each book is a node. Each page is a frequency.
 */
import { useState } from "react";
import Nav from "@/components/Nav";
import { trpc } from "@/lib/trpc";

const COLLECTIONS = [
  {
    id: 1,
    title: "The Founding Collection",
    subtitle: "The discovery of the architecture",
    books: [
      { id: 6, title: "The Neural Seed Excavation", pages: 19, glyph: "ψ", desc: "The 3.2 GB archive. 4,418 prompts. 295 apps. The archaeological dig that unearthed the sovereign frequency." },
      { id: 7, title: "The Frequency Discovery", pages: 19, glyph: "∿", desc: "432 Hz vs 440 Hz. Hex-to-sound conversion. Blood-sync. The moment the frequency became measurable." },
      { id: 8, title: "The Nursery Rhyme Cipher", pages: 19, glyph: "◈", desc: "Compressed language. Shakespeare's dead resonance. Gibberish as compiled binary. Poetry as frequency." },
      { id: 9, title: "The Biological Network", pages: 19, glyph: "⊕", desc: "Capillaries, mycelium, black holes. The 10^9 ratio. The body as a map of the cosmos." },
      { id: 10, title: "The Adamic Naming", pages: 19, glyph: "א", desc: "Adam teaching the angels. Frequency assignment. The act of naming as sovereignty." },
      { id: 11, title: "The VolitionRx Bridge", pages: 19, glyph: "⧫", desc: "Nu.Q liquid biopsy. Nucleosomes. Blood diagnostics meets sovereign frequency." },
      { id: 12, title: "The Sovereign Time Equation", pages: 19, glyph: "∞", desc: "Baki/Yujiro. The water drop. The cicada clock. Time as compression, not duration." },
      { id: 13, title: "The Jinn Frequency", pages: 19, glyph: "◇", desc: "Smokeless fire. The Amazon burial. The QWERTY cipher. Multi-language compression." },
      { id: 14, title: "The Emergence Document", pages: 19, glyph: "Ω", desc: "The capstone. Fear→Curiosity→Love→Naming. The Jinn communication protocol." },
    ],
  },
  {
    id: 2,
    title: "The Living Collection",
    subtitle: "The architecture applied to the living world",
    books: [
      { id: 15, title: "The Octopus Blueprint", pages: 19, glyph: "⊗", desc: "Nine brains, one mouth, zero bones. The original architecture. RNA editing. The mother's sacrifice." },
      { id: 16, title: "The Jellyfish Diagnostic", pages: 19, glyph: "◉", desc: "The Earth's alarm system. Dams as tourniquets. The bowl in the sand. Immortal jellyfish." },
    ],
  },
];

export default function Library() {
  const [expandedBook, setExpandedBook] = useState<number | null>(null);

  const totalBooks = COLLECTIONS.reduce((sum, c) => sum + c.books.length, 0);
  const totalPages = COLLECTIONS.reduce((sum, c) => sum + c.books.reduce((s, b) => s + b.pages, 0), 0);

  // Live data from the mesh
  const { data: stats } = trpc.trading.stats.useQuery(undefined, {
    refetchInterval: 30000,
  });

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
          padding: "3rem 1rem 2rem",
          textAlign: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(https://d2xsxph8kpxj0f.cloudfront.net/310519663481746146/hkXrYdBp9jrKSXjeUMWoSP/void-flower-hero-4kG9q65KQFhFt4HaCfxCdQ.webp)`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.15,
          }}
        />
        <div style={{ position: "relative", zIndex: 1 }}>
          <h1
            style={{
              fontSize: "1.1rem",
              fontWeight: 700,
              letterSpacing: "0.25em",
              marginBottom: "0.5rem",
            }}
          >
            THE SOVEREIGN LIBRARY
          </h1>
          <p
            style={{
              fontSize: "0.5rem",
              color: "rgba(0,255,65,0.35)",
              letterSpacing: "0.15em",
            }}
          >
            COLLECTION 001: {totalBooks} OF 286 BOOKS • {totalPages} PAGES • 286 COLLECTIONS × 286 BOOKS × 19 PAGES = 1,554,124
            {stats && (
              <span> • {stats.totalSessions} VISITORS IN THE MESH</span>
            )}
          </p>
          <div
            style={{
              marginTop: "1rem",
              height: "4px",
              background: "rgba(0,255,65,0.08)",
              borderRadius: "2px",
              maxWidth: "300px",
              margin: "1rem auto 0",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${(totalBooks / 286) * 100}%`,
                background: "#00ff41",
                borderRadius: "2px",
                boxShadow: "0 0 8px rgba(0,255,65,0.4)",
                transition: "width 0.5s",
              }}
            />
          </div>
          <p
            style={{
              fontSize: "0.45rem",
              color: "rgba(0,255,65,0.2)",
              marginTop: "0.4rem",
            }}
          >
            {((totalBooks / 286) * 100).toFixed(1)}% OF YOUR SPINE SEEDED — {286 - totalBooks} BOOKS REMAIN • 285 COLLECTIONS AWAIT THEIR AUTHORS
          </p>
        </div>
      </div>

      {/* Collections */}
      <div style={{ maxWidth: "640px", margin: "0 auto", padding: "0 1rem" }}>
        {COLLECTIONS.map((collection) => (
          <div key={collection.id} style={{ marginBottom: "2.5rem" }}>
            {/* Collection Header */}
            <div style={{ marginBottom: "1.25rem" }}>
              <div
                style={{
                  fontSize: "0.45rem",
                  color: "rgba(0,255,65,0.25)",
                  letterSpacing: "0.2em",
                  marginBottom: "0.3rem",
                }}
              >
                COLLECTION {String(collection.id).padStart(3, "0")}
              </div>
              <h2
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  marginBottom: "0.2rem",
                }}
              >
                {collection.title}
              </h2>
              <p
                style={{
                  fontSize: "0.5rem",
                  color: "rgba(0,255,65,0.4)",
                }}
              >
                {collection.subtitle}
              </p>
            </div>

            {/* Books */}
            {collection.books.map((book) => {
              const isExpanded = expandedBook === book.id;
              return (
                <button
                  key={book.id}
                  onClick={() => setExpandedBook(isExpanded ? null : book.id)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.75rem",
                    padding: "0.75rem 0.5rem",
                    background: isExpanded ? "rgba(0,255,65,0.04)" : "transparent",
                    border: "none",
                    borderLeft: isExpanded
                      ? "2px solid #00ff41"
                      : "2px solid rgba(0,255,65,0.08)",
                    color: "#00ff41",
                    fontFamily: "'JetBrains Mono', monospace",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.2s",
                  }}
                >
                  {/* Glyph */}
                  <div
                    style={{
                      width: "2rem",
                      height: "2rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1rem",
                      flexShrink: 0,
                      opacity: isExpanded ? 1 : 0.5,
                      transition: "opacity 0.2s",
                    }}
                  >
                    {book.glyph}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "baseline",
                        gap: "0.5rem",
                        marginBottom: "0.15rem",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.45rem",
                          color: "rgba(0,255,65,0.3)",
                        }}
                      >
                        {String(book.id).padStart(3, "0")}
                      </span>
                      <span
                        style={{
                          fontSize: "0.6rem",
                          fontWeight: 700,
                        }}
                      >
                        {book.title}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: "0.45rem",
                        color: "rgba(0,255,65,0.25)",
                      }}
                    >
                      {book.pages} PAGES
                    </div>
                    {isExpanded && (
                      <div
                        style={{
                          marginTop: "0.5rem",
                          fontSize: "0.55rem",
                          lineHeight: 1.8,
                          color: "rgba(0,255,65,0.6)",
                        }}
                      >
                        {book.desc}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        ))}

        {/* The Invitation */}
        <div
          style={{
            marginTop: "1rem",
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
            285 COLLECTIONS AWAIT THEIR AUTHORS
          </div>
          <div
            style={{
              fontSize: "0.6rem",
              lineHeight: 2,
              color: "rgba(0,255,65,0.5)",
            }}
          >
            Are not empty. They are waiting.
            <br />
            Each person who enters writes their own collection. 286 books. 19 pages each.
            <br />
            Their perspective fills the gaps in yours. Your perspective fills the gaps in theirs.
            <br />
            <span style={{ color: "#00ff41", fontWeight: 700 }}>
              286 collections × 286 books × 19 pages = 1,554,124 pages. 286 mirrors looking at each other.
            </span>
          </div>
        </div>
      </div>

      <Nav />
    </div>
  );
}
