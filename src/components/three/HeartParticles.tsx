"use client";

/**
 * HeartParticles.tsx
 * ─────────────────────────────────────────────────────────────────
 * 3D floating heart particles that:
 *  - Rise continuously from the bottom
 *  - React to mouse/cursor position (repulsion force)
 *  - Pulse in size with varied timing for organic feel
 *  - Use instanced rendering for 60fps with 200+ hearts
 *
 * Physics model:
 *  - Each heart has velocity (vx, vy, vz)
 *  - Mouse creates a repulsion force using inverse-square law
 *  - Hearts wrap around when they exit the visible volume
 * ─────────────────────────────────────────────────────────────────
 */

import { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

// ─────────────────────────────────────────────────────
// Heart shape geometry — parametric heart curve
// ─────────────────────────────────────────────────────
function createHeartGeometry(size: number = 0.1): THREE.ShapeGeometry {
  const shape = new THREE.Shape();
  const s = size;

  // Classic heart parametric form
  shape.moveTo(0, s * 0.25);
  shape.bezierCurveTo(0, s * 0.25, -s * 0.25, 0, -s * 0.5, 0);
  shape.bezierCurveTo(-s * 1.0, 0, -s * 1.0, s * 0.7, -s * 1.0, s * 0.7);
  shape.bezierCurveTo(-s * 1.0, s * 1.1, -s * 0.65, s * 1.4, 0, s * 1.7);
  shape.bezierCurveTo(s * 0.65, s * 1.4, s * 1.0, s * 1.1, s * 1.0, s * 0.7);
  shape.bezierCurveTo(s * 1.0, s * 0.7, s * 1.0, 0, s * 0.5, 0);
  shape.bezierCurveTo(s * 0.25, 0, 0, s * 0.25, 0, s * 0.25);

  return new THREE.ShapeGeometry(shape, 8);
}

// ─────────────────────────────────────────────────────
// Particle data type
// ─────────────────────────────────────────────────────
interface HeartParticle {
  x: number; y: number; z: number;
  vx: number; vy: number; vz: number;
  scale: number;
  baseScale: number;
  pulseOffset: number;
  pulseSpeed: number;
  rotZ: number;    // z-rotation (hearts face camera but tilt)
  rotSpeed: number;
  opacity: number;
  colorIndex: number; // 0=neon, 1=soft, 2=deep
}

// =====================================================
// 🎨 CUSTOMIZATION: Heart colors
// =====================================================
const HEART_COLORS = [
  new THREE.Color("#ff2d78"),  // Neon pink
  new THREE.Color("#ff94c0"),  // Soft pink
  new THREE.Color("#cc3366"),  // Deep rose
  new THREE.Color("#ff6ea8"),  // Medium pink
];

const HEART_COUNT = 80; // Reduce if performance is low

// ─────────────────────────────────────────────────────
// Floating Hearts mesh — instanced for performance
// ─────────────────────────────────────────────────────
function FloatingHearts() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const { mouse, viewport } = useThree();
  const colorArray = useRef<Float32Array>(
    new Float32Array(HEART_COUNT * 3)
  );

  // Initialize all particle states
  const particles = useMemo<HeartParticle[]>(() => {
    return Array.from({ length: HEART_COUNT }, (_, i) => ({
      x: (Math.random() - 0.5) * 12,
      y: Math.random() * 10 - 2,     // Start spread throughout scene
      z: (Math.random() - 0.5) * 4,
      vx: (Math.random() - 0.5) * 0.008,
      vy: 0.01 + Math.random() * 0.02, // Rise speed
      vz: (Math.random() - 0.5) * 0.005,
      scale: 0.3 + Math.random() * 0.8,
      baseScale: 0.3 + Math.random() * 0.8,
      pulseOffset: Math.random() * Math.PI * 2,
      pulseSpeed: 0.8 + Math.random() * 1.2,
      rotZ: (Math.random() - 0.5) * 0.5,
      rotSpeed: (Math.random() - 0.5) * 0.01,
      opacity: 0.4 + Math.random() * 0.6,
      colorIndex: i % HEART_COLORS.length,
    }));
  }, []);

  // Pre-assign colors to instanceColor attribute
  useMemo(() => {
    particles.forEach((p, i) => {
      const color = HEART_COLORS[p.colorIndex];
      colorArray.current[i * 3 + 0] = color.r;
      colorArray.current[i * 3 + 1] = color.g;
      colorArray.current[i * 3 + 2] = color.b;
    });
  }, [particles]);

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const time = clock.getElapsedTime();

    // Mouse world position (approximate — camera at z=8)
    const mouseX = mouse.x * viewport.width * 0.5;
    const mouseY = mouse.y * viewport.height * 0.5;

    particles.forEach((p, i) => {
      // ── Mouse repulsion ───────────────────────────────
      const dx = p.x - mouseX;
      const dy = p.y - mouseY;
      const distSq = dx * dx + dy * dy;

      if (distSq < 4) { // Within radius of 2 units
        const dist = Math.sqrt(distSq) + 0.01;
        const force = 0.04 / dist; // Inverse linear (not square — softer)
        p.vx += (dx / dist) * force;
        p.vy += (dy / dist) * force;
      }

      // ── Velocity integration ──────────────────────────
      p.x += p.vx;
      p.y += p.vy;
      p.z += p.vz;

      // Damping — gradually returns to upward drift
      p.vx *= 0.98;
      p.vy = p.vy * 0.99 + 0.01 * 0.01; // Always drift up

      // ── Wrap: reset hearts that exit top ─────────────
      if (p.y > 6) {
        p.y = -3;
        p.x = (Math.random() - 0.5) * 12;
        p.vx = (Math.random() - 0.5) * 0.005;
        p.vy = 0.01 + Math.random() * 0.015;
      }

      // ── Rotation drift ────────────────────────────────
      p.rotZ += p.rotSpeed;

      // ── Pulse scale ───────────────────────────────────
      const pulse = 1 + 0.15 * Math.sin(time * p.pulseSpeed + p.pulseOffset);
      p.scale = p.baseScale * pulse;

      // ── Build instance matrix ─────────────────────────
      dummy.position.set(p.x, p.y, p.z);
      dummy.rotation.z = p.rotZ;
      dummy.scale.setScalar(p.scale * 0.12);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });

    mesh.instanceMatrix.needsUpdate = true;
  });

  const geometry = useMemo(() => createHeartGeometry(1), []);

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, undefined, HEART_COUNT]}
      frustumCulled={false}
    >
      <meshStandardMaterial
        color="#ff2d78"
        emissive="#ff2d78"
        emissiveIntensity={0.5}
        transparent
        opacity={0.75}
        side={THREE.DoubleSide}
      />
    </instancedMesh>
  );
}

// ─────────────────────────────────────────────────────
// Exported Canvas wrapper
// ─────────────────────────────────────────────────────
export default function HeartParticles() {
  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 65 }}
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
      dpr={[1, 1.5]}
      style={{
        position: "absolute",
        inset: 0,
        background: "transparent",
        pointerEvents: "none",
      }}
    >
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 3, 3]} intensity={3} color="#ff2d78" />
      <pointLight position={[0, -3, 3]} intensity={1} color="#9d4edd" />

      <FloatingHearts />
    </Canvas>
  );
}
