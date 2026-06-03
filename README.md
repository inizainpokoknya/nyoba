# 💕 Romantic Love Site — Premium 3D Interactive Love Letter

A stunning, immersive single-page romantic website built with **Next.js 15**, **React Three Fiber**, **GSAP**, and **Framer Motion**.

---

## ✨ Features

| Feature | Technology |
|---|---|
| 3D Flower Bloom | React Three Fiber + Three.js |
| Floating Heart Particles | InstancedMesh (80 hearts, 1 draw call) |
| Typewriter Love Letter | Custom hook + Framer Motion |
| 3D Photo Gallery | CSS Perspective + Pointer Events |
| Neon "I LOVE YOU" bars | CSS Neon + 3D tilt |
| Custom Neon Cursor | Pointer Events API + RAF lerp |
| Pink Particle Background | Canvas 2D API |
| Music Toggle | Web Audio API oscillators |
| Scroll Animations | GSAP ScrollTrigger |
| Cinematic Loading Screen | Framer Motion AnimatePresence |

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Run development server
npm run dev

# 3. Open http://localhost:3000
```

### Production build:
```bash
npm run build
npm run start
```

---

## 📁 Project Structure

```
romantic-love-site/
├── src/
│   ├── app/
│   │   ├── layout.tsx          ← Root layout, metadata, fonts
│   │   └── page.tsx            ← Main page orchestrator
│   │
│   ├── components/
│   │   ├── three/              ← 3D WebGL components (no SSR)
│   │   │   ├── FlowerScene.tsx ← 3D cherry blossom bloom
│   │   │   ├── HeartParticles.tsx ← 80 floating 3D hearts
│   │   │   └── LoveTextScene.tsx  ← "I LOVE YOU" neon reveal
│   │   │
│   │   └── ui/                 ← 2D/hybrid UI components
│   │       ├── CustomCursor.tsx   ← Neon cursor + click hearts
│   │       ├── LetterSection.tsx  ← Typewriter love letter
│   │       ├── LoadingScreen.tsx  ← Pink loading animation
│   │       ├── MusicToggle.tsx    ← Web Audio music button
│   │       ├── ParticleBackground.tsx ← Canvas starfield/petals
│   │       └── PhotoGallery.tsx   ← 3D tilt photo cards
│   │
│   └── styles/
│       └── globals.css         ← Design tokens + global styles
│
├── public/
│   └── photos/                 ← ← ← YOUR PHOTOS GO HERE
│       ├── photo1.jpg
│       ├── photo2.jpg
│       └── ...
│
├── tailwind.config.ts          ← Color palette + animations
├── next.config.mjs             ← Three.js transpile config
└── README.md
```

---

## 🎨 Customization Guide

### 1. Change the Message / Title

**Hero title** — `src/app/page.tsx` line ~65:
```tsx
// ✏️ Change "Special Gift" to your title
<h1>Special Gift</h1>

// And the subtitle:
"To someone special in my life ✦"
```

**Love letter text** — `src/components/ui/LetterSection.tsx` line ~55:
```tsx
// ✏️ Edit this entire string
const LETTER_TEXT = `Your message here...`;

// Edit the signature:
const SIGNATURE = "From me, with all my heart 🌹";
```

**Final caption** — `src/app/page.tsx` in `FinaleSection`:
```tsx
// ✏️ Change this line
"Always and forever, just for you ✦"
```

---

### 2. Add Your Photos

1. Place images in `/public/photos/`
2. Edit the `PHOTOS` array in `src/components/ui/PhotoGallery.tsx`:

```tsx
const PHOTOS = [
  {
    id: 1,
    src: "/photos/photo1.jpg",    // ← Your image path
    alt: "Us at the beach",       // ← Alt text (for accessibility)
    caption: "Our first vacation 🌊",  // ← Shown on hover
    span: "wide",                 // "wide" = takes 2 columns
  },
  {
    id: 2,
    src: "/photos/photo2.jpg",
    alt: "Date night",
    caption: "My favorite evening 🕯️",
  },
  // Add up to 6 photos...
];
```

Supported formats: `.jpg`, `.jpeg`, `.png`, `.webp`

---

### 3. Change Colors (The Whole Site)

All colors are CSS variables in `src/styles/globals.css`:

```css
:root {
  /* === CHANGE THESE to retheme everything === */
  --pink-neon: #ff2d78;    /* Main neon accent */
  --pink-soft: #ffb3d1;    /* Soft dreamy pink */
  --pink-muted: #cc6f96;   /* Muted rose */
  --pink-deep: #8c0043;    /* Deep rose */

  /* === Background darkness === */
  --bg-deepest: #050308;   /* Absolute black — main bg */
  --bg-main: #0d0a10;      /* Page background */
  --bg-card: #1e1525;      /* Cards / panels */
}
```

**Example: Purple theme**
```css
:root {
  --pink-neon: #9d4edd;
  --pink-soft: #c77dff;
  --pink-muted: #7b2fd4;
  --bg-deepest: #050310;
}
```

---

### 4. Change Flower Colors

Edit `src/components/three/FlowerScene.tsx`:

```tsx
const PETAL_COLORS = {
  inner: "#ff6ea8",   // ← Lightest petals (innermost ring)
  mid: "#ff2d78",     // ← Main petal color
  outer: "#cc3366",   // ← Outer petals
  center: "#fff0a0",  // ← Stamen (center)
  glow: "#ff2d78",    // ← Emissive glow color
};
```

---

### 5. Add Real Background Music

Replace the Web Audio oscillators in `src/components/ui/MusicToggle.tsx`:

```tsx
// In the initAudio() function, replace with:
const audio = new Audio('/music/your-romantic-song.mp3');
audio.loop = true;
audio.volume = 0.35;
audioRef.current = audio;

// Then toggle:
audio.play();  // or audio.pause();
```

Place the audio file at `/public/music/your-romantic-song.mp3`.

Recommended: Instrumental pieces ≤ 5MB for fast load.

---

### 6. Heart Particle Count / Density

`src/components/three/HeartParticles.tsx`:

```tsx
const HEART_COUNT = 80;  // ← Increase for more hearts (performance cost)
                         //   Decrease for better mobile performance
```

---

## 📱 Mobile Optimization

The site is fully responsive:
- Custom cursor is **hidden on mobile** (standard cursor shown)
- Three.js `dpr` is capped at 1.5 (not 2) for mobile GPUs
- `antialias: false` on the hearts canvas for performance
- Photo grid collapses to single column on mobile

---

## ⚡ Performance Architecture

| Technique | Where | Impact |
|---|---|---|
| `InstancedMesh` | Heart particles | 80 hearts → 1 draw call |
| `useMemo` geometry | All Three.js shapes | Create once, reuse forever |
| `useRef` transforms | Cursor, flower tilt | Zero React re-renders |
| `dynamic()` + SSR:false | All Three.js | No hydration errors |
| `dpr={[1, 2]}` | Flower canvas | Auto DPR throttle |
| Canvas 2D (not R3F) | Starfield bg | Minimal overhead |

Target: **60fps** on mid-range hardware. For very low-end mobile, reduce `HEART_COUNT` to 40 and `PARTICLE_COUNT` to 80 in `ParticleBackground.tsx`.

---

## 🛠 Tech Stack

```
Next.js 15 (App Router)     — Framework + SSR
TypeScript                   — Type safety
Tailwind CSS                 — Utility styling
React Three Fiber            — Three.js in React
Three.js                     — 3D WebGL engine
@react-three/drei            — Three.js helpers (Stars, Float, Env)
GSAP + @gsap/react          — Scroll animations + ScrollTrigger
Framer Motion                — Layout animations + AnimatePresence
Web Audio API                — Programmatic ambient music
Canvas 2D API                — Background particles
Pointer Events API           — Cross-device cursor tracking
```

---

## 🔧 Troubleshooting

**"Three.js doesn't render"**
→ All Three.js components use `dynamic(() => import(...), { ssr: false })`.
  If you add new R3F components, ensure they're dynamically imported.

**"Fonts look wrong"**
→ Google Fonts requires internet access. On localhost offline, fonts fall back gracefully to system cursive/serif.

**"Loading takes too long"**
→ Reduce `HEART_COUNT` and `PARTICLE_COUNT`. For production, consider serving fonts self-hosted via `next/font`.

**"Music doesn't play"**
→ Browsers require user interaction before audio plays. The music button handles this — audio context is created on first click.

---

Made with 💕 and a lot of Three.js
