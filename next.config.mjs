/** @type {import('next').NextConfig} */
const nextConfig = {
  // Transpile Three.js and related 3D libs for Next.js compatibility
  transpilePackages: ["three", "@react-three/fiber", "@react-three/drei", "maath"],
  experimental: {
    // Enable optimized package imports
    optimizePackageImports: ["framer-motion", "gsap"],
  },
};

export default nextConfig;
