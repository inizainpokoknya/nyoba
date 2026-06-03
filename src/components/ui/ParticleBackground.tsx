"use client";

/**
 * ParticleBackground.tsx
 * ─────────────────────────────────────────────────────────────────
 * Lightweight canvas-based particle system for the page background.
 * Renders on a fixed canvas behind all content.
 *
 * Two particle types:
 *  - Stars: tiny white dots, slow drift
 *  - Petals: slightly larger pink specks, diagonal float
 *
 * Performance: Single canvas, single RAF loop.
 *  ~200 particles at 60fps ≈ negligible GPU load.
 * ─────────────────────────────────────────────────────────────────
 */

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  maxOpacity: number;
  type: "star" | "petal";
  hue: number; // Random pink shade variation
}

const STAR_COUNT = 120;
const PETAL_COUNT = 40;

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const sizeRef = useRef({ w: 0, h: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // ── Resize handler ────────────────────────────────
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      sizeRef.current = { w, h };
      canvas.width = w;
      canvas.height = h;
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    // ── Initialize particles ──────────────────────────
    const initParticles = (): Particle[] => {
      const { w, h } = sizeRef.current;
      const particles: Particle[] = [];

      // Stars
      for (let i = 0; i < STAR_COUNT; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.2,
          vy: -0.1 - Math.random() * 0.2, // Slowly drift upward
          size: 0.5 + Math.random() * 1.5,
          opacity: 0,
          maxOpacity: 0.3 + Math.random() * 0.5,
          type: "star",
          hue: 0, // White stars
        });
      }

      // Pink petals
      for (let i = 0; i < PETAL_COUNT; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.4 + 0.2, // Slight right drift
          vy: -0.3 - Math.random() * 0.5,
          size: 2 + Math.random() * 3,
          opacity: 0,
          maxOpacity: 0.15 + Math.random() * 0.25,
          type: "petal",
          hue: 330 + Math.floor(Math.random() * 30), // Pink-rose hues
        });
      }

      return particles;
    };

    particlesRef.current = initParticles();

    // ── Animation loop ────────────────────────────────
    let frameCount = 0;

    const render = () => {
      const { w, h } = sizeRef.current;
      frameCount++;

      ctx.clearRect(0, 0, w, h);

      particlesRef.current.forEach((p) => {
        // Update position
        p.x += p.vx;
        p.y += p.vy;

        // Fade in
        p.opacity = Math.min(p.maxOpacity, p.opacity + 0.003);

        // Twinkle — stars fluctuate in opacity
        if (p.type === "star") {
          p.opacity = p.maxOpacity * (0.6 + 0.4 * Math.sin(frameCount * 0.02 + p.x));
        }

        // Wrap around edges
        if (p.y < -10) p.y = h + 10;
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;

        // Draw
        ctx.save();
        ctx.globalAlpha = p.opacity;

        if (p.type === "star") {
          // Star: white dot with soft glow
          ctx.shadowColor = "rgba(255, 255, 255, 0.5)";
          ctx.shadowBlur = p.size * 2;
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Petal: pink ellipse rotated slightly
          ctx.shadowColor = `hsla(${p.hue}, 90%, 70%, 0.6)`;
          ctx.shadowBlur = p.size * 3;
          ctx.fillStyle = `hsl(${p.hue}, 80%, 65%)`;

          // Slight diagonal rotation for natural petal feel
          ctx.translate(p.x, p.y);
          ctx.rotate(0.3);
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size, p.size * 0.6, 0, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      });

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="particle-canvas"
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
        opacity: 0.7,
      }}
    />
  );
}
