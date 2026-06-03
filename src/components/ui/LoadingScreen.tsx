"use client";

/**
 * LoadingScreen.tsx
 * ─────────────────────────────────────────────────────────────────
 * Pink-themed animated loading screen.
 * Fades out once all 3D assets are ready.
 *
 * Animation sequence:
 *  1. Pulsing neon heart SVG
 *  2. Script font "Loading..." text with shimmer
 *  3. Pink progress bar that fills over 2.5s
 *  4. Entire screen fades out on `onComplete`
 * ─────────────────────────────────────────────────────────────────
 */

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Simulate asset loading progress — fill to 100% in ~2.5s
    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        const next = prev + Math.random() * 8;
        if (next >= 100) {
          clearInterval(intervalRef.current!);

          // Small pause at 100% before fade-out
          setTimeout(() => {
            setVisible(false);
            setTimeout(onComplete, 800); // Wait for exit animation
          }, 400);

          return 100;
        }
        return next;
      });
    }, 80);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="loading-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          role="progressbar"
          aria-label="Loading romantic experience"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          {/* Radial background glow */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(255,45,120,0.1) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />

          {/* Heart SVG — pulsing */}
          <motion.div
            animate={{
              scale: [1, 1.12, 1, 1.08, 1],
            }}
            transition={{
              duration: 1.4,
              ease: "easeInOut",
              repeat: Infinity,
            }}
            style={{ marginBottom: "2rem" }}
          >
            <svg
              width="80"
              height="72"
              viewBox="0 0 80 72"
              fill="none"
              aria-hidden="true"
            >
              <defs>
                <radialGradient id="heartGrad" cx="50%" cy="30%" r="70%">
                  <stop offset="0%" stopColor="#ff6ea8" />
                  <stop offset="60%" stopColor="#ff2d78" />
                  <stop offset="100%" stopColor="#8c0043" />
                </radialGradient>
                <filter id="heartGlow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <path
                d="M40 68C40 68 6 46 6 22C6 12.059 13.059 4 22 4C28.627 4 34.373 7.627 37.373 13C38.51 14.909 39.49 14.909 40.627 13C43.627 7.627 49.373 4 56 4C64.941 4 72 12.059 72 22C72 46 40 68 40 68Z"
                fill="url(#heartGrad)"
                filter="url(#heartGlow)"
              />
            </svg>
          </motion.div>

          {/* Script font title */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            style={{
              fontFamily: '"Dancing Script", cursive',
              fontSize: "1.8rem",
              color: "#ff2d78",
              textShadow: "0 0 20px rgba(255,45,120,0.6)",
              marginBottom: "0.5rem",
              letterSpacing: "0.02em",
            }}
          >
            Preparing something special...
          </motion.p>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            style={{
              fontSize: "0.8rem",
              color: "#cc6f96",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              marginBottom: "2.5rem",
            }}
          >
            just for you ✦
          </motion.p>

          {/* Progress bar track */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0.6 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            style={{
              width: "240px",
              height: "2px",
              background: "rgba(255,45,120,0.15)",
              borderRadius: "1px",
              overflow: "hidden",
              position: "relative",
            }}
          >
            {/* Filled portion */}
            <motion.div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                height: "100%",
                borderRadius: "1px",
                background:
                  "linear-gradient(90deg, #ff2d78, #ff6ea8, #ff2d78)",
                backgroundSize: "200% 100%",
                animation: "shimmer 1.5s linear infinite",
                boxShadow: "0 0 8px rgba(255,45,120,0.8)",
              }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.1, ease: "linear" }}
            />
          </motion.div>

          {/* Percentage */}
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ delay: 0.5 }}
            style={{
              fontSize: "0.7rem",
              color: "#cc6f96",
              letterSpacing: "0.1em",
              marginTop: "0.75rem",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {Math.round(progress)}%
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
