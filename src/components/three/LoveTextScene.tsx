"use client";

/**
 * LoveTextScene.tsx
 * ─────────────────────────────────────────────────────────────────
 * The grand finale — animated "I LOVE YOU" with:
 *  - Neon pink glow text (rendered as HTML with CSS 3D transform)
 *  - Dual vertical neon bars (like in reference images 4 & 5)
 *  - Strong mouse-reactive 3D rotation and glow pulse
 *  - Heart that pulses between bars before text reveals
 *  - Background particle glow orbs in R3F canvas
 *
 * Two-phase animation:
 *  Phase 1 (first 2s): Large pulsing heart between neon bars
 *  Phase 2 (after 2s): Heart fades, "I LOVE YOU" slides in
 * ─────────────────────────────────────────────────────────────────
 */

import { useRef, useState, useEffect, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";

// ─────────────────────────────────────────────────────
// Background glow orbs (R3F)
// ─────────────────────────────────────────────────────
function GlowOrbs() {
  const orbs = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!orbs.current) return;
    orbs.current.rotation.y = clock.getElapsedTime() * 0.08;
  });

  const orbPositions = [
    [-3, 2, -2, "#ff2d78"],
    [3, -1, -3, "#9d4edd"],
    [-1, -3, -1, "#ff6ea8"],
    [2, 3, -2, "#cc3366"],
    [-4, 0, -2, "#ff2d78"],
    [4, 1, -3, "#9d4edd"],
  ] as const;

  return (
    <group ref={orbs}>
      {orbPositions.map(([x, y, z, color], i) => (
        <mesh key={i} position={[x, y, z]}>
          <sphereGeometry args={[0.5, 8, 8]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={1.5}
            transparent
            opacity={0.15}
          />
        </mesh>
      ))}
    </group>
  );
}

// ─────────────────────────────────────────────────────
// HTML overlay: Neon bars + heart + text
// ─────────────────────────────────────────────────────
interface NeonTextDisplayProps {
  isVisible: boolean;
}

function NeonTextDisplay({ isVisible }: NeonTextDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const heartRef = useRef<HTMLDivElement>(null);
  const leftBarRef = useRef<HTMLDivElement>(null);
  const rightBarRef = useRef<HTMLDivElement>(null);
  const [showText, setShowText] = useState(false);
  const [showHeart, setShowHeart] = useState(false);

  // Track mouse for 3D tilt effect
  const mouse = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!isVisible) return;

    // Phase 1: Show heart
    setTimeout(() => setShowHeart(true), 200);

    // Phase 2: Replace with text
    setTimeout(() => {
      setShowHeart(false);
      setTimeout(() => setShowText(true), 400);
    }, 2400);
  }, [isVisible]);

  // Mouse tracking for 3D tilt
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      mouse.current = {
        x: (e.clientX - cx) / cx,
        y: (e.clientY - cy) / cy,
      };
    };

    window.addEventListener("mousemove", handleMove);

    const tick = () => {
      const container = containerRef.current;
      if (container) {
        const rotX = -mouse.current.y * 12;
        const rotY = mouse.current.x * 12;
        container.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      {/* 3D-tiltable container */}
      <div
        ref={containerRef}
        style={{
          position: "relative",
          display: "inline-flex",
          alignItems: "center",
          gap: "0",
          transformStyle: "preserve-3d",
          transition: "transform 0.05s linear",
        }}
      >
        {/* Left neon bar */}
        <AnimatePresence>
          {isVisible && (
            <motion.div
              ref={leftBarRef}
              initial={{ scaleY: 0, opacity: 0 }}
              animate={{ scaleY: 1, opacity: 1 }}
              exit={{ scaleY: 0, opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              style={{
                width: "3px",
                height: "120px",
                background: "linear-gradient(to bottom, transparent, #ffffff, transparent)",
                boxShadow: "0 0 12px rgba(255,255,255,0.8), 0 0 24px rgba(255,255,255,0.4)",
                borderRadius: "1.5px",
                marginRight: "24px",
                transformOrigin: "center",
              }}
            />
          )}
        </AnimatePresence>

        {/* Center content: heart or text */}
        <div style={{ position: "relative", minWidth: "260px", textAlign: "center" }}>
          {/* Pulsing heart — phase 1 */}
          <AnimatePresence>
            {showHeart && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: [0.8, 1.1, 0.9, 1.05, 1],
                  opacity: 1,
                }}
                exit={{ scale: 0, opacity: 0, transition: { duration: 0.3 } }}
                transition={{ duration: 1, ease: "easeOut" }}
                style={{
                  fontSize: "80px",
                  filter:
                    "drop-shadow(0 0 20px rgba(255,45,120,0.8)) drop-shadow(0 0 40px rgba(255,45,120,0.4))",
                  userSelect: "none",
                  display: "block",
                }}
              >
                ♥
              </motion.div>
            )}
          </AnimatePresence>

          {/* "I LOVE YOU" text — phase 2 */}
          <AnimatePresence>
            {showText && (
              <motion.div
                ref={textRef}
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
                style={{
                  fontFamily: '"Inter", sans-serif',
                  fontWeight: 700,
                  fontSize: "clamp(2.5rem, 6vw, 4rem)",
                  letterSpacing: "0.08em",
                  color: "#ff2d78",
                  textShadow:
                    "0 0 7px #ff2d78, 0 0 10px #ff2d78, 0 0 21px #ff2d78, 0 0 42px #ff0054, 0 0 82px #ff0054",
                  whiteSpace: "nowrap",
                  userSelect: "none",
                }}
              >
                I LOVE YOU
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right neon bar */}
        <AnimatePresence>
          {isVisible && (
            <motion.div
              ref={rightBarRef}
              initial={{ scaleY: 0, opacity: 0 }}
              animate={{ scaleY: 1, opacity: 1 }}
              exit={{ scaleY: 0, opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
              style={{
                width: "3px",
                height: "120px",
                background: "linear-gradient(to bottom, transparent, #ffffff, transparent)",
                boxShadow: "0 0 12px rgba(255,255,255,0.8), 0 0 24px rgba(255,255,255,0.4)",
                borderRadius: "1.5px",
                marginLeft: "24px",
                transformOrigin: "center",
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// Exported component
// ─────────────────────────────────────────────────────
interface LoveTextSceneProps {
  isVisible: boolean;
}

export default function LoveTextScene({ isVisible }: LoveTextSceneProps) {
  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {/* R3F background glow */}
      <Canvas
        camera={{ position: [0, 0, 6], fov: 60 }}
        gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
        dpr={[1, 1.5]}
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      >
        <ambientLight intensity={0.2} />
        <Suspense fallback={null}>
          <GlowOrbs />
        </Suspense>
      </Canvas>

      {/* HTML overlay — neon display */}
      <NeonTextDisplay isVisible={isVisible} />
    </div>
  );
}
