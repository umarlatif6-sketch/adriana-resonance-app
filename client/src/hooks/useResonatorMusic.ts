import { useCallback, useEffect, useRef, useState } from "react";
import { trpc } from "@/lib/trpc";

interface Track {
  index: number;
  title: string;
  dominantHz: number;
  cdnUrl: string;
  tuning: string;
}

export function useResonatorMusic() {
  const { data: tracks } = trpc.music.library.useQuery();
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [barLevels, setBarLevels] = useState<number[]>(new Array(12).fill(0));
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const animFrameRef = useRef<number>(0);

  // Find closest track to frequency
  const getTrackByFrequency = useCallback((freq: number): Track | null => {
    if (!tracks || tracks.length === 0) return null;
    let closest = tracks[0] as Track;
    let minDiff = Math.abs(closest.dominantHz - freq);
    
    for (const track of tracks) {
      const t = track as Track;
      const diff = Math.abs(t.dominantHz - freq);
      if (diff < minDiff) {
        minDiff = diff;
        closest = t;
      }
    }
    return closest;
  }, [tracks]);

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

  const playTrack = useCallback((track: Track) => {
    if (!audioRef.current) return;
    
    if (currentTrack?.index === track.index && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      cancelAnimationFrame(animFrameRef.current);
      return;
    }

    audioRef.current.src = track.cdnUrl;
    audioRef.current.load();
    setupAnalyser();
    
    audioRef.current.play().then(() => {
      setIsPlaying(true);
      setCurrentTrack(track);
      animFrameRef.current = requestAnimationFrame(animateBars);
    }).catch(() => {});
  }, [currentTrack, isPlaying, setupAnalyser, animateBars]);

  const stopPlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setBarLevels(new Array(12).fill(0));
    setCurrentTrack(null);
    cancelAnimationFrame(animFrameRef.current);
  }, []);

  useEffect(() => {
    return () => {
      if (audioRef.current) audioRef.current.pause();
      cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return {
    audioRef,
    currentTrack,
    isPlaying,
    barLevels,
    getTrackByFrequency,
    playTrack,
    stopPlayback,
  };
}
