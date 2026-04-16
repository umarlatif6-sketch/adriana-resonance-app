import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Camera, Upload } from "lucide-react";
import { trpc } from "@/lib/trpc";

const NAIL_CATEGORIES = [
  "STRUCTURAL INTEGRITY",
  "COLOUR SPECTRUM",
  "SURFACE TEXTURE",
  "LUNULA PRESENCE",
  "HYDRATION LEVEL",
  "GROWTH PATTERN",
  "STRESS MARKERS",
  "NUTRITIONAL SIGNATURE",
  "CIRCULATORY READING",
  "NERVOUS SYSTEM ECHO",
  "ENVIRONMENTAL EXPOSURE",
  "IMMUNE RESPONSE",
  "HORMONAL BALANCE",
  "ENERGETIC FLOW",
  "EMOTIONAL RESONANCE",
  "SOVEREIGN POTENTIAL",
];

interface DiagnosticResult {
  categories: Array<{
    id: number;
    name: string;
    score: number;
    observation: string;
    frequency_note: string;
  }>;
  overall_reading: string;
  dominant_frequency: number;
  archetype: string;
  confidence: number;
}

export default function NailReading() {
  const [imageData, setImageData] = useState<string | null>(null);
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const [nailType, setNailType] = useState("pinky");
  const [hand, setHand] = useState("right");
  const [cameraActive, setCameraActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mutation = trpc.nail.analyze.useMutation();

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (err) {
      console.error("Camera access denied:", err);
      alert("Camera access required. Please enable camera permissions.");
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
        const photoData = canvasRef.current.toDataURL("image/jpeg");
        setImageData(photoData);
        setCameraActive(false);
        if (videoRef.current.srcObject) {
          (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
        }
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageData(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeNail = async () => {
    if (!imageData) return;
    try {
      const response = await mutation.mutateAsync({
        readingId: 1,
      });
      setResult(response as DiagnosticResult);
    } catch (error) {
      console.error("Analysis failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-black text-green-400" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8 border border-green-400 p-4">
          <h1 className="text-2xl font-bold mb-2">NAIL READING DIAGNOSTIC</h1>
          <p className="text-sm text-green-300">16-Field Analysis Across Traditional Doctrines</p>
        </div>

        {/* Camera or Upload Section */}
        {!imageData && !cameraActive && (
          <div className="border border-green-400 p-6 mb-6">
            <div className="flex gap-4">
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="bg-green-400 text-black hover:bg-green-300 flex items-center gap-2"
              >
                <Upload size={16} /> Upload Photo
              </Button>
              <Button
                onClick={startCamera}
                className="bg-green-400 text-black hover:bg-green-300 flex items-center gap-2"
              >
                <Camera size={16} /> Take Photo
              </Button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
        )}

        {/* Camera View */}
        {cameraActive && (
          <div className="border border-green-400 p-6 mb-6">
            <div className="flex flex-col gap-4">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full border border-green-400"
                style={{ maxHeight: "400px", objectFit: "cover" }}
              />
              <canvas
                ref={canvasRef}
                width={640}
                height={480}
                className="hidden"
              />
              <div className="flex gap-4">
                <Button
                  onClick={capturePhoto}
                  className="bg-green-400 text-black hover:bg-green-300 flex-1"
                >
                  Capture
                </Button>
                <Button
                  onClick={() => {
                    setCameraActive(false);
                    if (videoRef.current?.srcObject) {
                      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
                    }
                  }}
                  className="bg-red-600 text-white hover:bg-red-500 flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Image Preview & Options */}
        {imageData && !result && (
          <div className="border border-green-400 p-6 mb-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <img
                  src={imageData}
                  alt="Nail"
                  className="w-full border border-green-400 p-2"
                  style={{ maxHeight: "300px", objectFit: "contain" }}
                />
              </div>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm mb-2">NAIL TYPE</label>
                  <select
                    value={nailType}
                    onChange={(e) => setNailType(e.target.value)}
                    className="w-full bg-black border border-green-400 text-green-400 p-2"
                  >
                    <option value="pinky">Pinky</option>
                    <option value="thumb">Thumb</option>
                    <option value="toe">Toe</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-2">HAND</label>
                  <select
                    value={hand}
                    onChange={(e) => setHand(e.target.value)}
                    className="w-full bg-black border border-green-400 text-green-400 p-2"
                  >
                    <option value="right">Right</option>
                    <option value="left">Left</option>
                  </select>
                </div>
                <Button
                  onClick={analyzeNail}
                  disabled={mutation.isPending}
                  className="bg-green-400 text-black hover:bg-green-300 w-full"
                >
                  {mutation.isPending ? <Loader2 className="animate-spin" /> : "Analyze"}
                </Button>
                <Button
                  onClick={() => setImageData(null)}
                  className="bg-gray-600 text-white hover:bg-gray-500 w-full"
                >
                  Retake
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="border border-green-400 p-6">
            <h2 className="text-xl font-bold mb-4">DIAGNOSTIC RESULTS</h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="border border-green-400 p-3">
                <p className="text-xs text-green-300">DOMINANT FREQUENCY</p>
                <p className="text-lg font-bold">{result.dominant_frequency}Hz</p>
              </div>
              <div className="border border-green-400 p-3">
                <p className="text-xs text-green-300">ARCHETYPE</p>
                <p className="text-lg font-bold">{result.archetype}</p>
              </div>
              <div className="border border-green-400 p-3">
                <p className="text-xs text-green-300">CONFIDENCE</p>
                <p className="text-lg font-bold">{(result.confidence * 100).toFixed(1)}%</p>
              </div>
            </div>
            <div className="border border-green-400 p-4 mb-4">
              <p className="text-xs text-green-300 mb-2">OVERALL READING</p>
              <p className="text-sm">{result.overall_reading}</p>
            </div>
            <div className="space-y-2">
              {result.categories.map((cat) => (
                <div key={cat.id} className="border border-green-400 p-3">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-bold">{cat.name}</span>
                    <span className="text-xs">{(cat.score * 100).toFixed(0)}%</span>
                  </div>
                  <p className="text-xs text-green-300">{cat.observation}</p>
                  <p className="text-xs text-green-200 mt-1">{cat.frequency_note}</p>
                </div>
              ))}
            </div>
            <Button
              onClick={() => {
                setImageData(null);
                setResult(null);
              }}
              className="bg-green-400 text-black hover:bg-green-300 w-full mt-6"
            >
              New Reading
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
