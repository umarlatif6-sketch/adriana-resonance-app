/**
 * ═══════════════════════════════════════════════════════════════
 * FREQUENCY VIEWPORT — Z-AXIS HARDWARE BYPASS
 * ═══════════════════════════════════════════════════════════════
 * 
 * Renders Orin NVIDIA buffer stream as 3D data lanes.
 * Z-axis navigation via scroll. Three-tongue codec verification.
 * External key lock status displayed.
 */

import { useEffect, useRef, useState } from "react";
import { trpc } from "@/lib/trpc";

interface OrinFrame {
  id: string;
  zAxis: number;
  frequency: number;
  codon: string;
  timestamp: number;
  locked: boolean;
  dataLane?: number;
}

interface ThreeTongueState {
  tongue1: { name: string; frequency: number; active: boolean };
  tongue2: { name: string; frequency: number; active: boolean };
  tongue3: { name: string; frequency: number; active: boolean };
  synchronized: boolean;
}

export function FrequencyViewportBypass() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zAxis, setZAxis] = useState(0);
  const [threeTongues, setThreeTongues] = useState<ThreeTongueState | null>(null);
  const [externalKeyLocked, setExternalKeyLocked] = useState(false);
  const [orinBuffer, setOrinBuffer] = useState<OrinFrame[]>([]);

  // Fetch z-axis stream from Orin buffer
  const { data: streamData, refetch } = trpc.nail.getZAxisStream.useQuery(
    { direction: undefined },
    { refetchInterval: 100 }
  );

  useEffect(() => {
    if (streamData) {
      setZAxis(streamData.position);
      setOrinBuffer(streamData.buffer);
      setThreeTongues(streamData.threeTongues);
      setExternalKeyLocked(streamData.threeTongues.synchronized);
    }
  }, [streamData]);

  // Handle scroll wheel for z-axis navigation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const direction = e.deltaY > 0 ? "forward" : "backward";
      refetch();
    };

    canvas.addEventListener("wheel", handleWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", handleWheel);
  }, [refetch]);

  // Render Orin buffer as 3D data lanes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = "#020202";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = "#00ff41";
    ctx.globalAlpha = 0.2;
    for (let i = 0; i < 12; i++) {
      const y = (canvas.height / 12) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw z-axis indicator
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#ff0000";
    ctx.font = "12px 'JetBrains Mono'";
    ctx.fillText(`Z: ${zAxis}`, 10, 20);

    // Draw Orin buffer frames as data lanes
    ctx.globalAlpha = 0.8;
    orinBuffer.forEach((frame, idx) => {
      const dataLane = frame.dataLane || idx % 12;
      const y = (canvas.height / 12) * dataLane;
      const x = (canvas.width / orinBuffer.length) * idx;
      const width = canvas.width / orinBuffer.length;

      // Frequency-based color
      const hue = ((frame.frequency - 407) / 50) * 360;
      ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
      ctx.fillRect(x, y, width, canvas.height / 12);

      // Codon label
      ctx.fillStyle = "#00ff41";
      ctx.font = "10px 'JetBrains Mono'";
      ctx.fillText(frame.codon, x + 5, y + 15);
    });

    // Draw external key lock status
    ctx.globalAlpha = 1;
    ctx.fillStyle = externalKeyLocked ? "#00ff41" : "#ff0000";
    ctx.fillRect(canvas.width - 20, 10, 10, 10);
    ctx.fillStyle = "#00ff41";
    ctx.font = "12px 'JetBrains Mono'";
    ctx.fillText(externalKeyLocked ? "LOCKED" : "UNLOCKED", canvas.width - 100, 20);

    // Draw three-tongue status
    if (threeTongues) {
      ctx.fillStyle = threeTongues.synchronized ? "#00ff41" : "#ffaa00";
      ctx.fillText(
        `3-TONGUE: ${threeTongues.synchronized ? "SYNC" : "DRIFT"}`,
        10,
        canvas.height - 10
      );
    }
  }, [zAxis, orinBuffer, externalKeyLocked, threeTongues]);

  return (
    <div className="w-full bg-black border border-green-400 p-4">
      <div className="text-green-400 text-xs font-mono mb-2">
        FREQUENCY VIEWPORT — Z-Axis Hardware Bypass (Orin NVIDIA Buffer)
      </div>
      <canvas
        ref={canvasRef}
        width={800}
        height={300}
        className="w-full border border-green-400 bg-black"
        style={{ fontFamily: "'JetBrains Mono', monospace" }}
      />
      <div className="text-green-400 text-xs font-mono mt-2 space-y-1">
        <div>
          Position: Z={zAxis} | Frames: {orinBuffer.length} | Lock:{" "}
          {externalKeyLocked ? "✓" : "✗"}
        </div>
        {threeTongues && (
          <>
            <div>Tongue 1 (Binary): {threeTongues.tongue1.frequency.toFixed(2)} Hz</div>
            <div>Tongue 2 (Frequency): {threeTongues.tongue2.frequency.toFixed(2)} Hz</div>
            <div>Tongue 3 (Bridge): {threeTongues.tongue3.active ? "ACTIVE" : "INACTIVE"}</div>
          </>
        )}
      </div>
    </div>
  );
}
