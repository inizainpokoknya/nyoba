"use client";

/**
 * CustomCursor.tsx — FIXED
 * FIX: cursor trail no longer uses left/top CSS transitions
 *      which were causing the scrollbar to appear on the right edge.
 *      Now uses transform: translate() only — GPU composited, no layout.
 */

import { useEffect, useRef } from "react";

interface Vec2 { x: number; y: number; }

export default function CustomCursor() {
  const mainRef  = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);
  const rafRef   = useRef<number>(0);
  const pos      = useRef<Vec2>({ x: -100, y: -100 });
  const trailPos = useRef<Vec2>({ x: -100, y: -100 });

  useEffect(() => {
    const main  = mainRef.current;
    const trail = trailRef.current;
    if (!main || !trail) return;

    const handleMove = (e: PointerEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
    };

    const handleEnter = () => main.classList.add("hovering");
    const handleLeave = () => main.classList.remove("hovering");
    const handleClick = (e: PointerEvent) => burstHearts(e.clientX, e.clientY);

    const interactives = document.querySelectorAll<HTMLElement>("a, button, [data-hoverable]");
    interactives.forEach(el => {
      el.addEventListener("mouseenter", handleEnter);
      el.addEventListener("mouseleave", handleLeave);
    });

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerdown", handleClick);

    const LERP = 0.12;
    const tick = () => {
      trailPos.current.x += (pos.current.x - trailPos.current.x) * LERP;
      trailPos.current.y += (pos.current.y - trailPos.current.y) * LERP;

      // FIX: use transform instead of left/top to avoid triggering layout
      main.style.transform  = `translate(calc(${pos.current.x}px - 50%), calc(${pos.current.y}px - 50%))`;
      trail.style.transform = `translate(calc(${trailPos.current.x}px - 50%), calc(${trailPos.current.y}px - 50%))`;

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerdown", handleClick);
      interactives.forEach(el => {
        el.removeEventListener("mouseenter", handleEnter);
        el.removeEventListener("mouseleave", handleLeave);
      });
    };
  }, []);

  return (
    <>
      <div
        ref={mainRef}
        className="cursor-main"
        aria-hidden="true"
        style={{ position: "fixed", top: 0, left: 0, pointerEvents: "none", zIndex: 9999 }}
      />
      <div
        ref={trailRef}
        className="cursor-trail"
        aria-hidden="true"
        style={{ position: "fixed", top: 0, left: 0, pointerEvents: "none", zIndex: 9998 }}
      />
    </>
  );
}

function burstHearts(x: number, y: number) {
  const count = 6;
  if (!document.getElementById("heart-burst-kf")) {
    const style = document.createElement("style");
    style.id = "heart-burst-kf";
    style.textContent = `
      @keyframes heart-burst {
        0%   { opacity:1; transform:translate(-50%,-50%) scale(1); }
        100% { opacity:0; transform:translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(0.3); }
      }`;
    document.head.appendChild(style);
  }
  for (let i = 0; i < count; i++) {
    const angle    = (360 / count) * i;
    const distance = 40 + Math.random() * 30;
    const size     = 10 + Math.random() * 8;
    const duration = 600 + Math.random() * 400;
    const heart    = document.createElement("div");
    heart.textContent = "♥";
    heart.style.cssText = `
      position:fixed; left:${x}px; top:${y}px; font-size:${size}px;
      color:#ff2d78; pointer-events:none; z-index:9997;
      text-shadow:0 0 6px #ff2d78;
      animation:heart-burst ${duration}ms ease-out forwards;
      --dx:${Math.cos((angle * Math.PI) / 180) * distance}px;
      --dy:${Math.sin((angle * Math.PI) / 180) * distance}px;`;
    document.body.appendChild(heart);
    setTimeout(() => heart.remove(), duration + 50);
  }
}
