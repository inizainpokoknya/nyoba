/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',           // ← PENTING BANGET
  trailingSlash: true,        // ← PENTING
  images: {
    unoptimized: true         // ← PENTING untuk GitHub Pages
  },

  transpilePackages: [
    "three",
    "@react-three/fiber",
    "@react-three/drei",
    "maath"
  ],

  // Optimized imports
  optimizePackageImports: ["framer-motion", "gsap"],
};

export default nextConfig;