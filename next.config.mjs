/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },

  // Coba tanpa basePath dulu
  // basePath: '/nyoba',
  // assetPrefix: '/nyoba',

  transpilePackages: [
    "three",
    "@react-three/fiber",
    "@react-three/drei",
    "maath"
  ],

  experimental: {
    optimizePackageImports: ["framer-motion", "gsap"],
  },
};

export default nextConfig;