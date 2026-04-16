import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Camera, Upload, Eye, EyeOff } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { FrequencyViewport } from "@/components/FrequencyViewport";

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
  const [viewMode, setViewMode] = useState<"capture" | "frequency">("capture");
  const [showFrequencyViewport, setShowFrequencyViewport] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = trpc.nail.upload.useMutation();
  const mutation = trpc.nail.analyze.useMutation();

  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      // First, upload the nail photo
      const { id: readingId } = await uploadMutation.mutateAsync({
        sessionId: "nail-session-" + Date.now(),
        imageBase64: imageData.split(",")[1] || imageData,
        mimeType: "image/jpeg",
        nailType: nailType as "pinky" | "thumb" | "toe" | "other",
        hand: hand as "left" | "right",
      });
      
      // Then analyze it
      const response = await mutation.mutateAsync({ readingId });
      setResult(response as unknown as DiagnosticResult);
    } catch (error) {
      console.error("Analysis failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-black text-green-400" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8 border border-green-400 p-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold mb-2">NAIL READING DIAGNOSTIC</h1>
              <p className="text-sm text-green-300">16-Field Analysis Across Traditional Doctrines</p>
            </div>
            {!imageData && !result && (
              <Button
                onClick={() => setShowFrequencyViewport(!showFrequencyViewport)}
                className="bg-green-400 text-black hover:bg-green-300 flex items-center gap-2"
              >
                {showFrequencyViewport ? (
                  <>
                    <EyeOff size={16} /> Hide Portal
                  </>
                ) : (
                  <>
                    <Eye size={16} /> View Portal
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Frequency Viewport Portal */}
        {showFrequencyViewport && !imageData && !result && (
          <div className="mb-6 border border-green-400 p-4">
            <FrequencyViewport />
          </div>
        )}

        {/* Upload Section */}
        {!imageData && (
          <div className="border border-green-400 p-6 mb-6">
            <div className="flex gap-4">
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="bg-green-400 text-black hover:bg-green-300 flex items-center gap-2"
              >
                <Upload size={16} /> Upload Photo
              </Button>
              <Button
                onClick={() => cameraInputRef.current?.click()}
                className="bg-green-400 text-black hover:bg-green-300 flex items-center gap-2"
              >
                <Camera size={16} /> Take Photo
              </Button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageCapture}
              className="hidden"
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="user"
              onChange={handleImageCapture}
              className="hidden"
            />
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
                    <option value="left">Left</option>
                    <option value="right">Right</option>
                  </select>
                </div>
                <Button
                  onClick={analyzeNail}
                  disabled={mutation.isPending}
                  className="bg-green-400 text-black hover:bg-green-300 mt-auto"
                >
                  {mutation.isPending ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={16} />
                      Analyzing...
                    </>
                  ) : (
                    "ANALYZE NAIL"
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Overall Reading */}
            <div className="border border-green-400 p-4">
              <h2 className="text-lg font-bold mb-2">OVERALL READING</h2>
              <p className="text-green-300 italic mb-4">{result.overall_reading}</p>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-green-300">Dominant Frequency:</span>
                  <div className="text-green-400 font-bold">{result.dominant_frequency} Hz</div>
                </div>
                <div>
                  <span className="text-green-300">Archetype:</span>
                  <div className="text-green-400 font-bold">{result.archetype}</div>
                </div>
                <div>
                  <span className="text-green-300">Confidence:</span>
                  <div className="text-green-400 font-bold">{(result.confidence * 100).toFixed(1)}%</div>
                </div>
              </div>
            </div>

            {/* 16 Categories */}
            <div className="border border-green-400 p-4">
              <h2 className="text-lg font-bold mb-4">16-FIELD DIAGNOSTIC</h2>
              <div className="grid grid-cols-2 gap-4">
                {result.categories.map((cat) => (
                  <div key={cat.id} className="border border-green-400 p-3 text-sm">
                    <div className="font-bold text-green-400">{cat.name}</div>
                    <div className="text-green-300 text-xs mt-1">
                      Score: {(cat.score * 100).toFixed(0)}%
                    </div>
                    <div className="text-green-300 text-xs mt-1">{cat.observation}</div>
                    <div className="text-green-500 text-xs mt-1 italic">Freq: {cat.frequency_note}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reset Button */}
            <Button
              onClick={() => {
                setImageData(null);
                setResult(null);
              }}
              className="bg-green-400 text-black hover:bg-green-300 w-full"
            >
              Analyze Another Nail
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
