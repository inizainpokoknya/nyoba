"use client";

/**
 * page.tsx — Main entry point
 * ─────────────────────────────────────────────────────────────────
 * Section flow:
 *  1. Loading screen (2.5s)
 *  2. Hero: 3D flower bloom + title (Section 1)
 *  3. Letter: Typewriter romantic message (Section 2)
 *  4. Gallery: 3D tilt photo cards (Section 3)
 *  5. Finale: "I LOVE YOU" with neon bars + hearts (Section 4)
 *
 * All heavy 3D components are dynamically imported (no SSR)
 * to prevent hydration issues with Three.js.
 * ─────────────────────────────────────────────────────────────────
 */

import dynamic from "next/dynamic";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ── Dynamic imports — no SSR for Three.js components ────────────
const FlowerScene = dynamic(() => import("@/components/three/FlowerScene"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          fontSize: "3rem",
          animation: "float 2s ease-in-out infinite",
          filter: "drop-shadow(0 0 20px rgba(255,45,120,0.6))",
        }}
      >
        🌸
      </div>
    </div>
  ),
});

const HeartParticles = dynamic(
  () => import("@/components/three/HeartParticles"),
  { ssr: false }
);

const LoveTextScene = dynamic(
  () => import("@/components/three/LoveTextScene"),
  { ssr: false }
);

const LoadingScreen = dynamic(
  () => import("@/components/ui/LoadingScreen"),
  { ssr: false }
);

const CustomCursor = dynamic(
  () => import("@/components/ui/CustomCursor"),
  { ssr: false }
);

const MusicToggle = dynamic(
  () => import("@/components/ui/MusicToggle"),
  { ssr: false }
);

const PhotoGallery = dynamic(
  () => import("@/components/ui/PhotoGallery"),
  { ssr: false }
);

const LetterSection = dynamic(
  () => import("@/components/ui/LetterSection"),
  { ssr: false }
);

const ParticleBackground = dynamic(
  () => import("@/components/ui/ParticleBackground"),
  { ssr: false }
);

// ─────────────────────────────────────────────────────
// Section: Hero — 3D Flower bloom
// ─────────────────────────────────────────────────────
interface HeroSectionProps {
  onBloomComplete: () => void;
}

function HeroSection({ onBloomComplete }: HeroSectionProps) {
  const titleRef = useRef<HTMLDivElement>(null);
  const [showTitle, setShowTitle] = useState(false);

  const handleBloom = useCallback(() => {
    setShowTitle(true);
    onBloomComplete();
  }, [onBloomComplete]);

  return (
    <section
      id="hero"
      className="section-full"
      style={{
        position: "relative",
        background:
          "radial-gradient(ellipse 100% 80% at 50% 100%, rgba(30, 8, 20, 0.8) 0%, transparent 70%)",
      }}
    >
      {/* Title — above the flower */}
      <div
        style={{
          position: "absolute",
          top: "8%",
          left: 0,
          right: 0,
          textAlign: "center",
          zIndex: 5,
          padding: "0 1rem",
        }}
      >
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          style={{
            fontFamily: '"Dancing Script", cursive',
            fontSize: "clamp(2.8rem, 8vw, 5rem)",
            color: "#ffffff",
            lineHeight: 1.1,
            marginBottom: "0.5rem",
          }}
          className="neon-text-soft"
        >
          {/* ✏️  CUSTOMIZATION: Change your title here */}
          Special Gift
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{
            letterSpacing: "0.18em",
            fontSize: "0.72rem",
            textTransform: "uppercase",
            color: "#cc6f96",
          }}
        >
          {/* ✏️  CUSTOMIZATION: Change your subtitle here */}
          To someone special in my life ✦
        </motion.p>
      </div>

      {/* 3D Canvas — takes up most of the viewport */}
      <div
        className="three-container"
        style={{ zIndex: 2 }}
        aria-label="3D blooming flower animation"
      >
        <FlowerScene onBloomComplete={handleBloom} />
      </div>

      {/* "Open Letter" button — appears after bloom */}
      <AnimatePresence>
        {showTitle && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            style={{
              position: "absolute",
              bottom: "8%",
              left: 0,
              right: 0,
              display: "flex",
              justifyContent: "center",
              zIndex: 10,
            }}
          >
            <motion.a
              href="#letter"
              data-hoverable
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.97 }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.6rem",
                padding: "0.75rem 2rem",
                borderRadius: "100px",
                background: "rgba(255, 45, 120, 0.08)",
                border: "1px solid rgba(255, 45, 120, 0.35)",
                color: "rgba(255, 240, 250, 0.9)",
                textDecoration: "none",
                fontSize: "0.78rem",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                backdropFilter: "blur(10px)",
                boxShadow:
                  "0 0 20px rgba(255, 45, 120, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
                transition: "all 0.3s ease",
              }}
            >
              Open Letter
              <span style={{ fontSize: "1rem" }}>→</span>
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

// ─────────────────────────────────────────────────────
// Section: Finale — I LOVE YOU
// ─────────────────────────────────────────────────────
function FinaleSection() {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      ScrollTrigger.create({
        trigger: ref.current,
        start: "top 60%",
        once: true,
        onEnter: () => setIsVisible(true),
      });
    },
    { scope: ref }
  );

  return (
    <section
      id="finale"
      ref={ref}
      className="section-full"
      style={{
        position: "relative",
        minHeight: "100vh",
        background:
          "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(40, 5, 30, 0.95) 0%, var(--bg-deepest) 70%)",
        overflow: "hidden",
      }}
      aria-label="I Love You section"
    >
      {/* Full-screen heart particles */}
      <div className="three-container" style={{ zIndex: 1 }}>
        <HeartParticles />
      </div>

      {/* Neon text + bars + hearts */}
      <div className="three-container" style={{ zIndex: 5 }}>
        <LoveTextScene isVisible={isVisible} />
      </div>

      {/* Bottom caption */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 3.5, duration: 1 }}
            style={{
              position: "absolute",
              bottom: "12%",
              left: 0,
              right: 0,
              textAlign: "center",
              zIndex: 10,
              padding: "0 1rem",
            }}
          >
            <p
              style={{
                fontFamily: '"Dancing Script", cursive',
                fontSize: "clamp(1.2rem, 3vw, 1.8rem)",
                color: "rgba(255, 179, 209, 0.8)",
                textShadow: "0 0 20px rgba(255, 45, 120, 0.3)",
              }}
            >
              {/* ✏️  CUSTOMIZATION: Final message */}
              Always and forever, just for you ✦
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

// ─────────────────────────────────────────────────────
// Root page component
// ─────────────────────────────────────────────────────
export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [bloomDone, setBloomDone] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  // GSAP global setup
  useGSAP(() => {
    // Smooth scroll behavior across all sections
    gsap.config({ nullTargetWarn: false });
  });

  const handleLoadComplete = useCallback(() => {
    setIsLoaded(true);
    // Small delay before starting interactions
    setTimeout(() => {
      window.dispatchEvent(new Event("appLoaded"));
    }, 100);
  }, []);

  return (
    <>
      {/* Accessibility skip link */}
      <a
        href="#letter"
        className="sr-only"
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        Skip to main content
      </a>

      {/* Global background particles */}
      <ParticleBackground />

      {/* Loading screen */}
      <LoadingScreen onComplete={handleLoadComplete} />

      {/* Custom cursor (desktop only) */}
      <CustomCursor />

      {/* Music toggle */}
      <MusicToggle />

      {/* Main content */}
      <main
        ref={mainRef}
        style={{
          position: "relative",
          zIndex: 2,
          overflowX: "hidden",
        }}
      >
        {/* ── Section 1: Hero / Flower bloom ── */}
        <HeroSection onBloomComplete={() => setBloomDone(true)} />

        {/* ── Section 2: Romantic letter ── */}
        <div id="letter">
          <LetterSection />
        </div>

        {/* ── Section 3: Photo gallery ── */}
        <PhotoGallery />

        {/* ── Section 4: I LOVE YOU finale ── */}
        <FinaleSection />
      </main>
    </>
  );
}
