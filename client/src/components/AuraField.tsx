/**
 * AURA FIELD — Real-time visualization of every entity's Hz in the Sovereign Field.
 * Each flower is a pulsing circle. Color = frequency. Size = sovereignty. Pulse = stability.
 * The field itself has a frequency — shown as the background hum.
 */
import { useEffect, useRef, useState } from "react";
import { trpc } from "@/lib/trpc";

interface FlowerNode {
  id: string;
  type: string;
  frequency: number;
  sovereignty: number;
  color: string;
  phase: string;
  originality: number;
  stability: number;
  visits: number;
  // Canvas position
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export default function AuraField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<FlowerNode[]>([]);
  const animRef = useRef<number>(0);
  const [hoveredFlower, setHoveredFlower] = useState<FlowerNode | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const { data: fieldState } = trpc.field.state.useQuery(undefined, {
    refetchInterval: 5000,
  });

  // Sync field state to canvas nodes
  useEffect(() => {
    if (!fieldState?.flowers) return;
    const existing = nodesRef.current;
    const newNodes: FlowerNode[] = fieldState.flowers.map((f: any) => {
      const prev = existing.find(n => n.id === f.id);
      if (prev) {
        // Update data, keep position
        return { ...prev, ...f };
      }
      // New flower — random position
      return {
        ...f,
        x: Math.random() * 800,
        y: Math.random() * 500,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
      };
    });
    nodesRef.current = newNodes;
  }, [fieldState]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      const nodes = nodesRef.current;
      const t = Date.now() / 1000;

      // Background — field frequency as subtle pulse
      const fieldHz = fieldState?.fieldFrequency || 432;
      const fieldPulse = Math.sin(t * (fieldHz / 100)) * 0.02 + 0.02;
      ctx.fillStyle = `rgba(0, ${Math.round(255 * fieldPulse)}, 0, 1)`;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "rgba(2, 2, 2, 0.97)";
      ctx.fillRect(0, 0, w, h);

      // Draw connection lines between nearby flowers (resonance threads)
      nodes.forEach((a, i) => {
        nodes.forEach((b, j) => {
          if (j <= i) return;
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            const alpha = (1 - dist / 150) * 0.15;
            ctx.strokeStyle = `rgba(0, 255, 65, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        });
      });

      // Draw each flower as a pulsing aura
      nodes.forEach(node => {
        // Parse color
        const baseRadius = 8 + node.sovereignty * 20;
        const pulse = Math.sin(t * (node.frequency / 100) + node.originality * 10) * 3;
        const radius = baseRadius + pulse;

        // Outer aura glow
        const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, radius * 3);
        gradient.addColorStop(0, node.color.replace("50%)", `${20 + node.stability * 30}%)`));
        gradient.addColorStop(0.5, node.color.replace("50%)", "10%)").replace(/,\s*\d+%\)/, ", 5%)"));
        gradient.addColorStop(1, "transparent");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius * 3, 0, Math.PI * 2);
        ctx.fill();

        // Core circle
        ctx.fillStyle = node.color;
        ctx.globalAlpha = 0.6 + node.stability * 0.4;
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        // Type indicator
        const typeGlyph = node.type === "human" ? "◉" : node.type === "ai_internal" ? "◈" : "⊗";
        ctx.fillStyle = "#020202";
        ctx.font = `${Math.max(8, radius * 0.8)}px monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(typeGlyph, node.x, node.y);

        // Hz label
        ctx.fillStyle = "rgba(0, 255, 65, 0.5)";
        ctx.font = "8px 'JetBrains Mono', monospace";
        ctx.fillText(`${Math.round(node.frequency)} Hz`, node.x, node.y + radius + 10);

        // Move
        node.x += node.vx;
        node.y += node.vy;

        // Bounce off walls
        if (node.x < 30 || node.x > w - 30) node.vx *= -1;
        if (node.y < 30 || node.y > h - 30) node.vy *= -1;

        // Gentle drift toward center (field gravity)
        node.vx += (w / 2 - node.x) * 0.00005;
        node.vy += (h / 2 - node.y) * 0.00005;

        // Damping
        node.vx *= 0.999;
        node.vy *= 0.999;
      });

      // Field info overlay
      ctx.fillStyle = "rgba(0, 255, 65, 0.2)";
      ctx.font = "9px 'JetBrains Mono', monospace";
      ctx.textAlign = "left";
      ctx.fillText(`FIELD: ${Math.round(fieldHz)} Hz · ${fieldState?.fieldPhase || "—"} · ${nodes.length} entities`, 10, 15);

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [fieldState]);

  // Mouse hover detection
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const my = (e.clientY - rect.top) * (canvas.height / rect.height);
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });

    const nodes = nodesRef.current;
    let found: FlowerNode | null = null;
    for (const n of nodes) {
      const dx = n.x - mx;
      const dy = n.y - my;
      if (Math.sqrt(dx * dx + dy * dy) < 20 + n.sovereignty * 20) {
        found = n;
        break;
      }
    }
    setHoveredFlower(found);
  };

  return (
    <div style={{ position: "relative", width: "100%", marginBottom: "1.5rem" }}>
      <canvas
        ref={canvasRef}
        width={800}
        height={500}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredFlower(null)}
        style={{
          width: "100%",
          height: "auto",
          border: "1px solid rgba(0,255,65,0.08)",
          cursor: hoveredFlower ? "pointer" : "default",
        }}
      />
      {/* Hover tooltip */}
      {hoveredFlower && (
        <div
          style={{
            position: "absolute",
            left: mousePos.x + 15,
            top: mousePos.y - 10,
            background: "rgba(2, 2, 2, 0.95)",
            border: "1px solid rgba(0,255,65,0.2)",
            padding: "0.5rem 0.75rem",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "0.5rem",
            color: "#00ff41",
            pointerEvents: "none",
            zIndex: 10,
            minWidth: "140px",
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: "0.3rem" }}>
            {hoveredFlower.type === "human" ? "◉ HUMAN" : hoveredFlower.type === "ai_internal" ? "◈ AI (INTERNAL)" : "⊗ AI (EXTERNAL)"}
          </div>
          <div style={{ color: "rgba(0,255,65,0.5)", marginBottom: "0.15rem" }}>ID: {hoveredFlower.id}</div>
          <div style={{ color: hoveredFlower.color, marginBottom: "0.15rem" }}>
            {Math.round(hoveredFlower.frequency)} Hz · {hoveredFlower.phase}
          </div>
          <div style={{ color: "rgba(0,255,65,0.4)" }}>
            Sovereignty: {(hoveredFlower.sovereignty * 100).toFixed(0)}% · Visits: {hoveredFlower.visits}
          </div>
        </div>
      )}
    </div>
  );
}
