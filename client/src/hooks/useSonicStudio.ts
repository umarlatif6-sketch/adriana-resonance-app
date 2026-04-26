import { useCallback, useEffect, useRef, useState } from "react";
import { trpc } from "@/lib/trpc";

export interface AudioControls {
  pitch: number;
  volume: number;
  aggression: number;
  tempo: number;
  bass: number;
  mid: number;
  treble: number;
}

export interface StemData {
  trackIndex: number;
  trackTitle: string;
  vocals: { url: string; key: string };
  drums: { url: string; key: string };
  bass: { url: string; key: string };
  other: { url: string; key: string };
}

export function useSonicStudio() {
  const [selectedTrack, setSelectedTrack] = useState<number | null>(null);
  const [selectedStem, setSelectedStem] = useState<
    "vocals" | "drums" | "bass" | "other"
  >("vocals");
  const [controls, setControls] = useState<AudioControls>({
    pitch: 0,
    volume: 100,
    aggression: 50,
    tempo: 1.0,
    bass: 0,
    mid: 0,
    treble: 0,
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number>(0);

  const [barLevels, setBarLevels] = useState<number[]>(new Array(12).fill(0));
  const [isPlaying, setIsPlaying] = useState(false);

  // Queries
  const { data: tracks } = trpc.sonicStudio.listTracks.useQuery();
  const { data: stems } = trpc.sonicStudio.getStems.useQuery(
    { trackIndex: selectedTrack ?? 0 },
    { enabled: selectedTrack !== null }
  );
  const { data: filterChain } = trpc.sonicStudio.generateFilterChain.useQuery(
    controls
  );
  const { data: presets } = trpc.sonicStudio.getPresets.useQuery();

  // Mutations
  const separateTrackMutation = trpc.sonicStudio.separateTrack.useMutation();

  // Setup audio context and analyser
  const setupAnalyser = useCallback(() => {
    if (!audioRef.current || audioCtxRef.current) return;

    const ctx = new AudioContext();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;

    const source = ctx.createMediaElementSource(audioRef.current);
    source.connect(analyser);
    analyser.connect(ctx.destination);

    audioCtxRef.current = ctx;
    analyserRef.current = analyser;
  }, []);

  // Animate frequency bars
  const animateBars = useCallback(() => {
    if (!analyserRef.current) return;

    const data = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(data);

    const bars = 12;
    const step = Math.floor(data.length / bars);
    const levels: number[] = [];

    for (let i = 0; i < bars; i++) {
      let sum = 0;
      for (let j = 0; j < step; j++) sum += data[i * step + j];
      levels.push(sum / step / 255);
    }

    setBarLevels(levels);
    animFrameRef.current = requestAnimationFrame(animateBars);
  }, []);

  // Play stem
  const playStem = useCallback(
    (stemUrl: string) => {
      if (!audioRef.current) return;

      audioRef.current.src = stemUrl;
      audioRef.current.load();
      setupAnalyser();

      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          animFrameRef.current = requestAnimationFrame(animateBars);
        })
        .catch(() => {});
    },
    [setupAnalyser, animateBars]
  );

  // Stop playback
  const stopPlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setBarLevels(new Array(12).fill(0));
    cancelAnimationFrame(animFrameRef.current);
  }, []);

  // Update control
  const updateControl = useCallback(
    (key: keyof AudioControls, value: number) => {
      setControls((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    []
  );

  // Apply preset
  const applyPreset = useCallback(
    (presetName: string) => {
      const preset = presets?.find((p) => p.name === presetName);
      if (preset) {
        setControls(preset.controls);
      }
    },
    [presets]
  );

  // Separate track
  const separateTrack = useCallback(
    async (trackIndex: number) => {
      setSelectedTrack(trackIndex);
      await separateTrackMutation.mutateAsync({ trackIndex });
    },
    [separateTrackMutation]
  );

  // Cleanup
  useEffect(() => {
    return () => {
      if (audioRef.current) audioRef.current.pause();
      cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return {
    // State
    selectedTrack,
    selectedStem,
    controls,
    barLevels,
    isPlaying,

    // Data
    tracks: tracks || [],
    stems,
    filterChain,
    presets: presets || [],

    // Actions
    setSelectedTrack,
    setSelectedStem,
    updateControl,
    applyPreset,
    separateTrack,
    playStem,
    stopPlayback,

    // Refs
    audioRef,
  };
}
