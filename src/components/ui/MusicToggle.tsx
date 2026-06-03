"use client";

/**
 * MusicToggle.tsx
 * ─────────────────────────────────────────────────────────────────
 * Floating music toggle button — bottom-right corner.
 *
 * Uses Web Audio API to generate a simple soft ambient tone since
 * we have no audio file. You can replace `initAudio()` with a real
 * <audio> element pointing to an MP3.
 *
 * ✏️  CUSTOMIZATION: Replace with real audio file:
 *    const audio = new Audio('/music/romantic-bgm.mp3');
 *    audio.loop = true;
 *    audio.volume = 0.4;
 * ─────────────────────────────────────────────────────────────────
 */

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

export default function MusicToggle() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const initRef = useRef(false);

  /**
   * initAudio()
   * Creates a soft ambient tone using Web Audio API oscillators.
   * Two detuned sine waves create a gentle "warm pad" sound.
   *
   * ✏️  REPLACE THIS with a real audio file for production:
   *   audioRef.current = new Audio('/music/your-song.mp3');
   *   audioRef.current.loop = true;
   *   audioRef.current.volume = 0.3;
   */
  const initAudio = () => {
    if (initRef.current) return;
    initRef.current = true;

    try {
      const ctx = new (window.AudioContext ||
        (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      ctxRef.current = ctx;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.connect(ctx.destination);
      gainRef.current = gain;

      // Primary tone — A3 (220 Hz)
      const osc1 = ctx.createOscillator();
      osc1.type = "sine";
      osc1.frequency.value = 220;
      osc1.connect(gain);
      osc1.start();

      // Detune — slight detuning for warmth
      const osc2 = ctx.createOscillator();
      osc2.type = "sine";
      osc2.frequency.value = 221.5; // 1.5Hz detune = gentle beating
      osc2.connect(gain);
      osc2.start();

      // Sub-harmonic for depth
      const osc3 = ctx.createOscillator();
      osc3.type = "sine";
      osc3.frequency.value = 110; // A2 — sub
      const subGain = ctx.createGain();
      subGain.gain.value = 0.3;
      osc3.connect(subGain);
      subGain.connect(gain);
      osc3.start();

      oscRef.current = osc1;
    } catch (e) {
      console.warn("Web Audio API unavailable:", e);
    }
  };

  const toggleMusic = () => {
    initAudio();
    const gain = gainRef.current;
    const ctx = ctxRef.current;
    if (!gain || !ctx) return;

    if (isPlaying) {
      // Fade out gracefully (0.5s)
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
      setIsPlaying(false);
    } else {
      // Fade in gracefully
      gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.5);
      setIsPlaying(true);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      ctxRef.current?.close();
    };
  }, []);

  return (
    <motion.button
      className={`music-btn ${isPlaying ? "playing" : ""}`}
      onClick={toggleMusic}
      aria-label={isPlaying ? "Pause background music" : "Play background music"}
      title={isPlaying ? "Pause music" : "Play music"}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 2, duration: 0.6 }}
    >
      {isPlaying ? (
        // Pause icon — animated bars
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
        >
          <motion.rect
            x="4"
            y="3"
            width="4"
            height="14"
            rx="1"
            fill="#ff2d78"
            animate={{ scaleY: [1, 0.5, 1, 0.8, 1] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformOrigin: "center" }}
          />
          <motion.rect
            x="12"
            y="3"
            width="4"
            height="14"
            rx="1"
            fill="#ff2d78"
            animate={{ scaleY: [1, 0.8, 1, 0.5, 1] }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.3,
            }}
            style={{ transformOrigin: "center" }}
          />
        </svg>
      ) : (
        // Play icon
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M6 4L16 10L6 16V4Z"
            fill="#ff2d78"
            stroke="#ff2d78"
            strokeWidth="1"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </motion.button>
  );
}
