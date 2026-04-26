import { useCallback, useEffect, useRef, useState } from "react";
import { trpc } from "@/lib/trpc";

export interface DJMixerState {
  trackAIndex: number;
  trackAStem: "vocals" | "drums" | "bass" | "other";
  trackBIndex: number;
  trackBStem: "vocals" | "drums" | "bass" | "other";
  crossfadePosition: number; // 0-100
  isPlaying: boolean;
  currentTime: number;
}

export function useDJMixer() {
  const [state, setState] = useState<DJMixerState>({
    trackAIndex: 0,
    trackAStem: "vocals",
    trackBIndex: 1,
    trackBStem: "drums",
    crossfadePosition: 50,
    isPlaying: false,
    currentTime: 0,
  });

  const audioARef = useRef<HTMLAudioElement | null>(null);
  const audioBRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const gainARef = useRef<GainNode | null>(null);
  const gainBRef = useRef<GainNode | null>(null);
  const animFrameRef = useRef<number>(0);

  const [barLevels, setBarLevels] = useState<number[]>(new Array(12).fill(0));
  const [frequency, setFrequency] = useState<number>(432);

  // Queries
  const { data: tracks } = trpc.djMixer.listTracks.useQuery();
  const { data: crossfadeData } = trpc.djMixer.calculateCrossfade.useQuery({
    position: state.crossfadePosition,
  });
  const { data: markers } = trpc.djMixer.generateMarkers.useQuery({
    baseFrequency: 432,
  });

  // Mutations
  const createMashupMutation = trpc.djMixer.createMashup.useMutation();

  // Setup audio context
  const setupAudioContext = useCallback(() => {
    if (audioCtxRef.current) return;

    const ctx = new AudioContext();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;

    const gainA = ctx.createGain();
    const gainB = ctx.createGain();

    if (audioARef.current && audioBRef.current) {
      const sourceA = ctx.createMediaElementSource(audioARef.current);
      const sourceB = ctx.createMediaElementSource(audioBRef.current);

      sourceA.connect(gainA);
      sourceB.connect(gainB);

      gainA.connect(analyser);
      gainB.connect(analyser);

      analyser.connect(ctx.destination);

      audioCtxRef.current = ctx;
      analyserRef.current = analyser;
      gainARef.current = gainA;
      gainBRef.current = gainB;
    }
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

  // Update crossfade
  const updateCrossfade = useCallback((position: number) => {
    setState((prev) => ({ ...prev, crossfadePosition: position }));

    if (crossfadeData && gainARef.current && gainBRef.current) {
      gainARef.current.gain.setValueAtTime(
        crossfadeData.volumeA / 100,
        (audioCtxRef.current?.currentTime || 0) + 0.01
      );
      gainBRef.current.gain.setValueAtTime(
        crossfadeData.volumeB / 100,
        (audioCtxRef.current?.currentTime || 0) + 0.01
      );
      setFrequency(crossfadeData.frequency);
    }
  }, [crossfadeData]);

  // Play both tracks
  const play = useCallback(
    (trackAUrl: string, trackBUrl: string) => {
      if (!audioARef.current || !audioBRef.current) return;

      setupAudioContext();

      audioARef.current.src = trackAUrl;
      audioBRef.current.src = trackBUrl;

      audioARef.current.load();
      audioBRef.current.load();

      audioARef.current.play().catch(() => {});
      audioBRef.current.play().catch(() => {});

      setState((prev) => ({ ...prev, isPlaying: true }));
      animFrameRef.current = requestAnimationFrame(animateBars);
    },
    [setupAudioContext, animateBars]
  );

  // Stop both tracks
  const stop = useCallback(() => {
    if (audioARef.current) {
      audioARef.current.pause();
      audioARef.current.currentTime = 0;
    }
    if (audioBRef.current) {
      audioBRef.current.pause();
      audioBRef.current.currentTime = 0;
    }
    setState((prev) => ({ ...prev, isPlaying: false }));
    setBarLevels(new Array(12).fill(0));
    cancelAnimationFrame(animFrameRef.current);
  }, []);

  // Create mashup
  const createMashup = useCallback(
    async (name: string) => {
      return await createMashupMutation.mutateAsync({
        name,
        trackAIndex: state.trackAIndex,
        trackAStem: state.trackAStem,
        trackBIndex: state.trackBIndex,
        trackBStem: state.trackBStem,
      });
    },
    [state, createMashupMutation]
  );

  // Cleanup
  useEffect(() => {
    return () => {
      if (audioARef.current) audioARef.current.pause();
      if (audioBRef.current) audioBRef.current.pause();
      cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return {
    // State
    state,
    barLevels,
    frequency,
    crossfadeVolumes: crossfadeData
      ? { volumeA: crossfadeData.volumeA, volumeB: crossfadeData.volumeB }
      : { volumeA: 50, volumeB: 50 },

    // Data
    tracks: tracks || [],
    markers: markers || [],

    // Actions
    setState,
    updateCrossfade,
    play,
    stop,
    createMashup,

    // Refs
    audioARef,
    audioBRef,
  };
}
