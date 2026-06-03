import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // ===========================================
      // 🎨 CUSTOMIZATION: Change color palette here
      // ===========================================
      colors: {
        pink: {
          50: "#fff0f6",
          100: "#ffe0ed",
          200: "#ffc0db",
          300: "#ff94c0",
          400: "#ff5e9f",   // Main accent
          500: "#ff2d78",   // Primary neon pink
          600: "#e0006a",   // Deep pink
          700: "#b80057",
          800: "#8c0043",
          900: "#5c002c",
          neon: "#ff2d78",  // Neon glow color
          soft: "#ffb3d1",  // Soft dreamy pink
          muted: "#cc6f96", // Muted romantic pink
        },
        dark: {
          base: "#050308",    // Deepest background
          800: "#0d0a10",     // Main background
          700: "#150f1a",     // Section background
          600: "#1e1525",     // Card background
          500: "#2a1d36",     // Elevated surfaces
          400: "#3d2b4d",     // Borders/dividers
        },
        purple: {
          glow: "#9d4edd",    // Purple accent
          soft: "#c77dff",    // Soft purple
        },
      },
      // Custom fonts
      fontFamily: {
        script: ["var(--font-script)", "Dancing Script", "cursive"],
        sans: ["var(--font-sans)", "Inter", "sans-serif"],
        mono: ["var(--font-mono)", "Fira Code", "monospace"],
      },
      // Glow animations
      keyframes: {
        "neon-pulse": {
          "0%, 100%": {
            textShadow:
              "0 0 4px #ff2d78, 0 0 11px #ff2d78, 0 0 19px #ff2d78, 0 0 40px #ff2d78",
          },
          "50%": {
            textShadow:
              "0 0 2px #ff2d78, 0 0 5px #ff2d78, 0 0 8px #ff2d78, 0 0 20px #ff2d78",
          },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        "heart-beat": {
          "0%, 100%": { transform: "scale(1)" },
          "14%": { transform: "scale(1.1)" },
          "28%": { transform: "scale(1)" },
          "42%": { transform: "scale(1.1)" },
          "70%": { transform: "scale(1)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(40px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "typewriter": {
          from: { width: "0" },
          to: { width: "100%" },
        },
        "blink-cursor": {
          "50%": { borderColor: "transparent" },
        },
      },
      animation: {
        "neon-pulse": "neon-pulse 2s ease-in-out infinite",
        "float": "float 4s ease-in-out infinite",
        "heart-beat": "heart-beat 1.5s ease-in-out infinite",
        "shimmer": "shimmer 3s linear infinite",
        "fade-in-up": "fade-in-up 0.8s ease-out forwards",
        "typewriter": "typewriter 4s steps(44, end) 1s forwards",
        "blink-cursor": "blink-cursor 0.75s step-end infinite",
      },
      backgroundImage: {
        // Pink gradient backgrounds
        "pink-radial": "radial-gradient(ellipse at center, #2a0a1e 0%, #050308 70%)",
        "pink-glow": "radial-gradient(ellipse 80% 80% at 50% 50%, rgba(255,45,120,0.15) 0%, transparent 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
