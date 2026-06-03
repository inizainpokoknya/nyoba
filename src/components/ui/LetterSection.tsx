"use client";

/**
 * LetterSection.tsx
 * ─────────────────────────────────────────────────────────────────
 * Romantic letter reveal section with:
 *  - Typing animation (character-by-character reveal)
 *  - Glassmorphism card with pink glow border
 *  - Floating hearts in the background
 *  - GSAP scroll-triggered reveal
 *
 * ✏️  CUSTOMIZATION: Edit the LETTER_TEXT below to change the
 *    romantic message. Use \n for line breaks.
 * ─────────────────────────────────────────────────────────────────
 */

import { useRef, useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// =====================================================
// ✏️  CUSTOMIZATION: Your romantic message
// =====================================================
const LETTER_TEXT = `Thank you for being such a strong and amazing person. 
I'm really proud of you. You've done so well until 
this very moment — chasing your dreams and fighting 
your own battles with grace and beauty.

Every day with you feels like the universe decided 
to be generous. You make ordinary moments feel like 
scenes from a movie I never want to end.

You are my favorite reason to smile. My favorite 
distraction, my favorite adventure, my favorite 
everything.

I love you — more than yesterday, less than tomorrow.`;

// Sender signature
const SIGNATURE = "From me, with all my heart 🌹";

// ─────────────────────────────────────────────────────
// Typewriter hook
// ─────────────────────────────────────────────────────
function useTypewriter(text: string, isActive: boolean, speed: number = 28) {
  const [displayText, setDisplayText] = useState("");
  const [isDone, setIsDone] = useState(false);
  const indexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const type = useCallback(() => {
    if (!isActive) return;

    if (indexRef.current < text.length) {
      setDisplayText(text.slice(0, indexRef.current + 1));
      indexRef.current++;
      timerRef.current = setTimeout(type, speed + Math.random() * 20);
    } else {
      setIsDone(true);
    }
  }, [text, isActive, speed]);

  useEffect(() => {
    if (isActive) {
      indexRef.current = 0;
      setDisplayText("");
      setIsDone(false);
      timerRef.current = setTimeout(type, 400); // Small initial delay
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isActive, type]);

  return { displayText, isDone };
}

// ─────────────────────────────────────────────────────
// Floating heart decorations
// ─────────────────────────────────────────────────────
function FloatingHeartDecos() {
  const hearts = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    left: `${10 + Math.random() * 80}%`,
    animDuration: `${4 + Math.random() * 4}s`,
    delay: `${Math.random() * 3}s`,
    size: `${0.8 + Math.random() * 1.2}rem`,
    opacity: 0.15 + Math.random() * 0.25,
  }));

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      {hearts.map((h) => (
        <div
          key={h.id}
          style={{
            position: "absolute",
            left: h.left,
            bottom: "-10%",
            fontSize: h.size,
            opacity: h.opacity,
            color: "#ff2d78",
            animation: `floatUp ${h.animDuration} ${h.delay} ease-in infinite`,
            filter: "blur(0.5px)",
          }}
        >
          ♥
        </div>
      ))}

      {/* Inject float-up keyframes once */}
      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 0.5; }
          100% { transform: translateY(-110vh) rotate(360deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// Main export
// ─────────────────────────────────────────────────────
export default function LetterSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);
  const { displayText, isDone } = useTypewriter(LETTER_TEXT, isTyping, 25);

  // GSAP: trigger typing when card scrolls into view
  useGSAP(
    () => {
      ScrollTrigger.create({
        trigger: cardRef.current,
        start: "top 65%",
        once: true,
        onEnter: () => {
          // First animate card in, then start typing
          gsap.fromTo(
            cardRef.current,
            { opacity: 0, y: 60, scale: 0.95 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.9,
              ease: "power3.out",
              onComplete: () => setIsTyping(true),
            }
          );
        },
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      className="section-full"
      style={{
        padding: "6rem 1.5rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Floating hearts background */}
      <FloatingHeartDecos />

      {/* Radial glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 70% 70% at 50% 50%, rgba(255,45,120,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Section label */}
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        style={{
          color: "#ff2d78",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          fontSize: "0.75rem",
          marginBottom: "0.75rem",
          textAlign: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        ✦ A Love Letter ✦
      </motion.p>

      {/* Letter card */}
      <div
        ref={cardRef}
        className="glass-card"
        style={{
          maxWidth: "640px",
          width: "100%",
          padding: "2.5rem",
          position: "relative",
          zIndex: 1,
          opacity: 0, // GSAP animates this in
        }}
      >
        {/* Top decoration line */}
        <div
          style={{
            width: "60px",
            height: "2px",
            background: "linear-gradient(90deg, transparent, #ff2d78, transparent)",
            margin: "0 auto 2rem",
          }}
        />

        {/* Letter body — typed text */}
        <div
          style={{
            fontFamily: '"Playfair Display", serif',
            fontSize: "1.05rem",
            lineHeight: 1.85,
            color: "rgba(255, 240, 250, 0.88)",
            minHeight: "320px",
            whiteSpace: "pre-wrap",
            position: "relative",
          }}
        >
          {displayText}
          {/* Blinking cursor while typing */}
          {isTyping && !isDone && (
            <span
              style={{
                display: "inline-block",
                width: "2px",
                height: "1.1em",
                background: "#ff2d78",
                verticalAlign: "text-bottom",
                marginLeft: "2px",
                boxShadow: "0 0 8px #ff2d78",
                animation: "blink-cursor 0.75s step-end infinite",
              }}
            />
          )}
        </div>

        {/* Signature — appears after typing completes */}
        {isDone && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            style={{
              marginTop: "2rem",
              borderTop: "1px solid rgba(255, 45, 120, 0.2)",
              paddingTop: "1.5rem",
              textAlign: "right",
            }}
          >
            <p
              style={{
                fontFamily: '"Dancing Script", cursive',
                fontSize: "1.4rem",
                color: "#ff6ea8",
                textShadow: "0 0 10px rgba(255, 45, 120, 0.3)",
              }}
            >
              {SIGNATURE}
            </p>
          </motion.div>
        )}

        {/* Corner decorations */}
        {["top-left", "top-right", "bottom-left", "bottom-right"].map(
          (corner) => (
            <div
              key={corner}
              style={{
                position: "absolute",
                [corner.includes("top") ? "top" : "bottom"]: "12px",
                [corner.includes("left") ? "left" : "right"]: "12px",
                width: "20px",
                height: "20px",
                borderTop: corner.includes("top")
                  ? "1px solid rgba(255,45,120,0.4)"
                  : "none",
                borderBottom: corner.includes("bottom")
                  ? "1px solid rgba(255,45,120,0.4)"
                  : "none",
                borderLeft: corner.includes("left")
                  ? "1px solid rgba(255,45,120,0.4)"
                  : "none",
                borderRight: corner.includes("right")
                  ? "1px solid rgba(255,45,120,0.4)"
                  : "none",
                pointerEvents: "none",
              }}
            />
          )
        )}
      </div>
    </section>
  );
}
