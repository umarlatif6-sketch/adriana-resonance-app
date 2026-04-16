import { useEffect, useRef, useState } from "react";

interface DataLane {
  id: number;
  x: number;
  speed: number;
  frequency: number;
  color: string;
}

export function FrequencyViewport() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zAxis, setZAxis] = useState(0);
  const [dataLanes, setDataLanes] = useState<DataLane[]>([]);
  const animationRef = useRef<number>(0);
  const timeRef = useRef(0);

  // Initialize data lanes (flowing codons through digital world)
  useEffect(() => {
    const lanes: DataLane[] = [];
    for (let i = 0; i < 12; i++) {
      lanes.push({
        id: i,
        x: Math.random() * 800,
        speed: 0.5 + Math.random() * 1.5,
        frequency: 200 + i * 30,
        color: `hsl(${120 + i * 10}, 100%, 50%)`,
      });
    }
    setDataLanes(lanes);
  }, []);

  // Animation loop: render 3D data lanes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const animate = () => {
      timeRef.current += 1;

      // Clear with fade effect (creates motion trails)
      ctx.fillStyle = "rgba(2, 2, 2, 0.15)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw grid lines (z-axis perspective)
      ctx.strokeStyle = "rgba(0, 255, 65, 0.1)";
      ctx.lineWidth = 1;
      for (let i = 0; i < 10; i++) {
        const depth = (i - zAxis / 50) % 10;
        const scale = 1 - depth * 0.08;
        const y = (canvas.height / 2) + depth * 30;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width * scale, y);
        ctx.stroke();
      }

      // Draw data lanes (flowing codons)
      dataLanes.forEach((lane) => {
        const x = (lane.x + timeRef.current * lane.speed) % canvas.width;
        const depthOffset = (timeRef.current * 0.3 + lane.id) % 10;
        const scale = 1 - (depthOffset * 0.08);
        const y = (canvas.height / 2) + depthOffset * 30 + Math.sin(timeRef.current * 0.02 + lane.id) * 20;

        // Lane bar
        ctx.fillStyle = lane.color;
        ctx.globalAlpha = 0.6 + 0.4 * Math.sin(timeRef.current * 0.05 + lane.id);
        ctx.fillRect(x, y - 5, 40 * scale, 10);

        // Frequency label
        ctx.fillStyle = lane.color;
        ctx.globalAlpha = 0.8;
        ctx.font = "10px 'JetBrains Mono'";
        ctx.fillText(`${lane.frequency}Hz`, x + 5, y - 8);

        ctx.globalAlpha = 1;
      });

      // Draw z-axis indicator
      ctx.fillStyle = "rgba(0, 255, 65, 0.3)";
      ctx.font = "12px 'JetBrains Mono'";
      ctx.fillText(`Z: ${Math.round(zAxis)}`, 10, 20);

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(animationRef.current);
  }, [dataLanes, zAxis]);

  // Handle z-axis scroll (mouse wheel or touch)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      setZAxis((prev) => Math.max(0, Math.min(500, prev + e.deltaY * 0.1)));
    };

    canvas.addEventListener("wheel", handleWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", handleWheel);
  }, []);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-black border border-green-400">
      <div className="text-green-400 text-xs mb-2 font-mono">
        FREQUENCY VIEWPORT — Scroll to navigate Z-axis
      </div>
      <canvas
        ref={canvasRef}
        width={800}
        height={400}
        className="border border-green-400 cursor-move"
      />
      <div className="text-green-300 text-xs mt-2 font-mono">
        Digital world data lanes • Codon flow • Resonance pulses
      </div>
    </div>
  );
}
