"use client";

/**
 * PhotoGallery.tsx
 * ─────────────────────────────────────────────────────────────────
 * 3D tilt photo gallery with:
 *  - CSS 3D perspective tilt on hover (Vanilla Tilt-style)
 *  - Shimmer gradient overlay that tracks mouse position
 *  - Floating animation between interactions
 *  - GSAP scroll-triggered entrance animation
 *  - Placeholder cards if no photos are provided
 *
 * ✏️  CUSTOMIZATION — Adding your photos:
 *   1. Place images in /public/photos/ (photo1.jpg, photo2.jpg, etc.)
 *   2. Update the PHOTOS array below with your image paths and captions
 * ─────────────────────────────────────────────────────────────────
 */

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// =====================================================
// ✏️  CUSTOMIZATION: Add your photos here
//    src: path relative to /public/ folder
//    caption: text shown below photo
//    span: "normal" | "wide" — wide takes 2 columns
// =====================================================
interface PhotoItem {
  id: number;
  src: string | null; // null = use placeholder
  alt: string;
  caption: string;
  span?: "normal" | "wide";
}

const PHOTOS: PhotoItem[] = [
  {
    id: 1,
    src: null, // Replace with: "/photos/photo1.jpg"
    alt: "Our first memory",
    caption: "The beginning of us ✨",
    span: "wide",
  },
  {
    id: 2,
    src: null,
    alt: "A beautiful moment",
    caption: "This smile 🌸",
  },
  {
    id: 3,
    src: null,
    alt: "Together always",
    caption: "Every second counts 💕",
  },
  {
    id: 4,
    src: null,
    alt: "Our story",
    caption: "My favorite chapter 🌹",
    span: "wide",
  },
  {
    id: 5,
    src: null,
    alt: "Cherished memory",
    caption: "Forever in my heart 🩷",
  },
];

// ─────────────────────────────────────────────────────
// Placeholder card (when no image provided)
// ─────────────────────────────────────────────────────
function PlaceholderPhoto({
  caption,
  index,
}: {
  caption: string;
  index: number;
}) {
  const hues = ["340", "320", "350", "330", "310"]; // Pink hue variations
  const hue = hues[index % hues.length];

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: `
          radial-gradient(ellipse at 30% 30%, hsl(${hue}, 60%, 15%) 0%, transparent 60%),
          radial-gradient(ellipse at 70% 70%, hsl(${hue}, 40%, 10%) 0%, transparent 60%),
          hsl(${hue}, 20%, 8%)
        `,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1rem",
        padding: "1.5rem",
      }}
    >
      {/* Heart icon */}
      <div
        style={{
          fontSize: "3rem",
          filter: "drop-shadow(0 0 20px rgba(255,45,120,0.6))",
          animation: "float 3s ease-in-out infinite",
          animationDelay: `${index * 0.4}s`,
        }}
      >
        🩷
      </div>

      {/* Guide text */}
      <p
        style={{
          color: "rgba(255, 179, 209, 0.5)",
          fontSize: "0.7rem",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          textAlign: "center",
        }}
      >
        Add your photo here
      </p>

      {/* Caption */}
      <p
        style={{
          fontFamily: '"Dancing Script", cursive',
          fontSize: "1.1rem",
          color: "rgba(255, 45, 120, 0.7)",
          textAlign: "center",
          lineHeight: 1.4,
        }}
      >
        {caption}
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// Individual photo card with 3D tilt
// ─────────────────────────────────────────────────────
function PhotoCard({ photo, index }: { photo: PhotoItem; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);
  const raf = useRef<number>(0);

  // Current transform state — lerped for smooth motion
  const current = useRef({ rotX: 0, rotY: 0, scale: 1 });
  const target = useRef({ rotX: 0, rotY: 0, scale: 1 });

  useEffect(() => {
    const card = cardRef.current;
    const glare = glareRef.current;
    if (!card) return;

    // ── Pointer enter/leave ────────────────────────────
    const handleEnter = () => {
      target.current.scale = 1.04;
    };

    const handleLeave = () => {
      target.current.rotX = 0;
      target.current.rotY = 0;
      target.current.scale = 1;

      if (glare) {
        glare.style.opacity = "0";
      }
    };

    // ── Pointer move: compute rotation from cursor pos ─
    const handleMove = (e: PointerEvent) => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      // Normalized position: -1 to +1
      const nx = (e.clientX - cx) / (rect.width / 2);
      const ny = (e.clientY - cy) / (rect.height / 2);

      // Max tilt: ±15 degrees
      target.current.rotX = -ny * 15;
      target.current.rotY = nx * 15;

      // Glare: follows cursor, more intense at edges
      if (glare) {
        const glareX = ((e.clientX - rect.left) / rect.width) * 100;
        const glareY = ((e.clientY - rect.top) / rect.height) * 100;
        const intensity = Math.sqrt(nx * nx + ny * ny) * 0.3;

        glare.style.background = `radial-gradient(
          circle at ${glareX}% ${glareY}%,
          rgba(255, 255, 255, ${intensity}) 0%,
          transparent 60%
        )`;
        glare.style.opacity = "1";
      }
    };

    card.addEventListener("pointerenter", handleEnter);
    card.addEventListener("pointerleave", handleLeave);
    card.addEventListener("pointermove", handleMove);

    // RAF: lerp current → target transforms
    const LERP = 0.1;
    const tick = () => {
      current.current.rotX +=
        (target.current.rotX - current.current.rotX) * LERP;
      current.current.rotY +=
        (target.current.rotY - current.current.rotY) * LERP;
      current.current.scale +=
        (target.current.scale - current.current.scale) * LERP;

      card.style.transform = `
        perspective(600px)
        rotateX(${current.current.rotX}deg)
        rotateY(${current.current.rotY}deg)
        scale(${current.current.scale})
        translateZ(0)
      `;

      raf.current = requestAnimationFrame(tick);
    };

    raf.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf.current);
      card.removeEventListener("pointerenter", handleEnter);
      card.removeEventListener("pointerleave", handleLeave);
      card.removeEventListener("pointermove", handleMove);
    };
  }, []);

  const isWide = photo.span === "wide";

  return (
    <motion.div
      initial={{ opacity: 0, y: 60, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{
        duration: 0.8,
        delay: index * 0.12,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="photo-card"
      style={{
        gridColumn: isWide ? "span 2" : "span 1",
        borderRadius: "12px",
        overflow: "hidden",
        aspectRatio: isWide ? "16/9" : "4/5",
        border: "1px solid rgba(255, 45, 120, 0.2)",
        position: "relative",
        willChange: "transform",
        cursor: "pointer",
      }}
      ref={cardRef}
      data-hoverable
    >
      {/* Photo or placeholder */}
      {photo.src ? (
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          style={{ objectFit: "cover" }}
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      ) : (
        <PlaceholderPhoto caption={photo.caption} index={index} />
      )}

      {/* Glare overlay */}
      <div
        ref={glareRef}
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0,
          transition: "opacity 0.2s ease",
          pointerEvents: "none",
          borderRadius: "12px",
          mixBlendMode: "screen",
        }}
      />

      {/* Bottom caption gradient */}
      {photo.src && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "2rem 1.5rem 1.2rem",
            background:
              "linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
          }}
        >
          <p
            style={{
              fontFamily: '"Dancing Script", cursive',
              fontSize: "1rem",
              color: "rgba(255, 179, 209, 0.9)",
              textShadow: "0 1px 4px rgba(0,0,0,0.5)",
            }}
          >
            {photo.caption}
          </p>
        </div>
      )}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────
// Main gallery export
// ─────────────────────────────────────────────────────
export default function PhotoGallery() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  // GSAP: title entrance animation
  useGSAP(
    () => {
      gsap.from(titleRef.current, {
        opacity: 0,
        y: 40,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: titleRef.current,
          start: "top 85%",
          once: true,
        },
      });
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="section-full" style={{ padding: "6rem 2rem" }}>
      {/* Section header */}
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
        }}
      >
        ✦ Our Memories ✦
      </motion.p>

      <h2
        ref={titleRef}
        style={{
          fontFamily: '"Dancing Script", cursive',
          fontSize: "clamp(2.5rem, 6vw, 4rem)",
          color: "#ffffff",
          textAlign: "center",
          marginBottom: "3rem",
          textShadow: "0 0 30px rgba(255, 45, 120, 0.3)",
        }}
      >
        Every Moment With You
      </h2>

      {/* Masonry-style grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "1.25rem",
          width: "100%",
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        {PHOTOS.map((photo, i) => (
          <PhotoCard key={photo.id} photo={photo} index={i} />
        ))}
      </div>
    </section>
  );
}
