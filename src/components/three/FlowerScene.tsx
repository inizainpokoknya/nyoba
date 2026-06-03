"use client";

/**
 * FlowerScene.tsx — FIXED VERSION
 * 
 * Fixes applied:
 *  1. Camera moved MUCH closer (z: 2.2 → 1.4) so flower fills screen
 *  2. Petal sizes doubled (lengths & widths) — was tiny on widescreen
 *  3. Particle radius reduced (flower was hidden behind particles)
 *  4. bloomSpeed increased 0.006 → 0.012 (6s → 3s total)
 *  5. onBloomComplete wrapped in useCallback + stable ref to prevent
 *     stale closure issue in R3F's useFrame loop
 *  6. Fallback: auto-trigger after 5s regardless of bloom state
 *  7. Float removed from Flower wrapper (was scaling geometry unpredictably)
 *  8. Flower scale increased via group.scale
 */

import { useRef, useMemo, Suspense, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import * as THREE from "three";

const PETAL_COLORS = {
  inner: "#ff6ea8",
  mid: "#ff2d78",
  outer: "#cc3366",
  center: "#fff0a0",
  glow: "#ff2d78",
};

function createPetalShape(length: number, width: number): THREE.Shape {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.bezierCurveTo(-width * 0.5, length * 0.2, -width * 0.6, length * 0.6, 0, length);
  shape.bezierCurveTo(width * 0.6, length * 0.6, width * 0.5, length * 0.2, 0, 0);
  return shape;
}

interface PetalProps {
  index: number;
  totalInRing: number;
  ring: number;
  bloomProgress: React.MutableRefObject<number>;
}

function Petal({ index, totalInRing, ring, bloomProgress }: PetalProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  const geometry = useMemo(() => {
    // FIX: sizes doubled vs original
    const lengths = [0.7, 1.0, 1.3];
    const widths   = [0.36, 0.48, 0.6];
    const shape = createPetalShape(lengths[ring], widths[ring]);
    return new THREE.ShapeGeometry(shape, 12);
  }, [ring]);

  const material = useMemo(() => {
    const colors = [PETAL_COLORS.inner, PETAL_COLORS.mid, PETAL_COLORS.outer];
    return new THREE.MeshStandardMaterial({
      color: colors[ring],
      emissive: PETAL_COLORS.glow,
      emissiveIntensity: 0.15,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.93,
      roughness: 0.4,
      metalness: 0.05,
    });
  }, [ring]);

  const angleOffset = (Math.PI * 2 * index) / totalInRing;
  const closedX = -1.4 + ring * 0.2;
  const openX   =  0.2 + ring * 0.15;
  // FIX: radii doubled to match bigger petals
  const radii  = [0.16, 0.36, 0.6];
  const radius = radii[ring];

  useFrame(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const t = bloomProgress.current;
    const delay  = ring * 0.2;
    const localT = Math.max(0, Math.min(1, (t - delay) / (1 - delay + 0.001)));
    const eased  = easeOutElastic(localT);
    mesh.rotation.x = THREE.MathUtils.lerp(closedX, openX, eased);
    mesh.rotation.z = Math.sin(mesh.rotation.x) * 0.05;
  });

  return (
    <group rotation={[0, angleOffset, 0]}>
      <group position={[0, 0, radius]}>
        <mesh ref={meshRef} geometry={geometry} material={material} rotation={[closedX, 0, 0]} castShadow />
      </group>
    </group>
  );
}

function Stamen({ bloomProgress }: { bloomProgress: React.MutableRefObject<number> }) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    mesh.scale.setScalar(THREE.MathUtils.lerp(0, 1, easeOutElastic(bloomProgress.current)));
    mesh.rotation.y += 0.01;
  });
  return (
    <mesh ref={meshRef} scale={0}>
      <sphereGeometry args={[0.14, 16, 16]} />
      <meshStandardMaterial color={PETAL_COLORS.center} emissive={PETAL_COLORS.center} emissiveIntensity={1.2} roughness={0.2} />
    </mesh>
  );
}

const PARTICLE_COUNT = 80;

function Particles() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() => Array.from({ length: PARTICLE_COUNT }, () => ({
    phi:    Math.acos(1 - 2 * Math.random()),
    theta:  Math.random() * Math.PI * 2,
    // FIX: radius range reduced so particles orbit AROUND flower, not hiding it
    radius: 1.4 + Math.random() * 1.2,
    speed:  0.003 + Math.random() * 0.004,
    offset: Math.random() * Math.PI * 2,
    orbitY: (Math.random() - 0.5) * 0.6,
  })), []);

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const time = clock.getElapsedTime();
    particles.forEach((p, i) => {
      const angle = time * p.speed * 60 + p.offset;
      dummy.position.set(
        Math.cos(angle) * p.radius * Math.sin(p.phi),
        p.orbitY + Math.sin(time * 0.5 + p.offset) * 0.3,
        Math.sin(angle) * p.radius * Math.sin(p.phi)
      );
      const twinkle = 0.5 + 0.5 * Math.sin(time * 3 + p.offset);
      dummy.scale.setScalar(0.008 + twinkle * 0.008);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, PARTICLE_COUNT]}>
      <sphereGeometry args={[1, 4, 4]} />
      <meshStandardMaterial color="#ff6ea8" emissive="#ff2d78" emissiveIntensity={3} transparent opacity={0.9} />
    </instancedMesh>
  );
}

interface FlowerProps {
  bloomProgress: React.MutableRefObject<number>;
}

function Flower({ bloomProgress }: FlowerProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { mouse } = useThree();

  useFrame(() => {
    const group = groupRef.current;
    if (!group) return;
    const targetX = -mouse.y * 0.25;
    const targetY =  mouse.x * 0.25;
    group.rotation.x = THREE.MathUtils.lerp(group.rotation.x, targetX, 0.05);
    group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, targetY, 0.05);
  });

  const rings = [
    { count: 5, ring: 0 },
    { count: 7, ring: 1 },
    { count: 9, ring: 2 },
  ];

  return (
    // FIX: explicit scale=1.2 so flower is big and visible
    <group ref={groupRef} scale={1.2}>
      <mesh position={[0, -1.1, 0]}>
        <cylinderGeometry args={[0.025, 0.035, 1.4, 8]} />
        <meshStandardMaterial color="#2d5a27" roughness={0.7} />
      </mesh>

      {rings.map(({ count, ring }) =>
        Array.from({ length: count }, (_, i) => (
          <Petal key={`${ring}-${i}`} index={i} totalInRing={count} ring={ring} bloomProgress={bloomProgress} />
        ))
      )}

      <Stamen bloomProgress={bloomProgress} />
      <Particles />
    </group>
  );
}

interface SceneContentProps {
  onBloomComplete: () => void;
}

function SceneContent({ onBloomComplete }: SceneContentProps) {
  const bloomProgress = useRef(0);
  const isComplete    = useRef(false);
  // FIX: store callback in a stable ref so stale closure in useFrame won't miss it
  const callbackRef   = useRef(onBloomComplete);
  useEffect(() => { callbackRef.current = onBloomComplete; }, [onBloomComplete]);

  useFrame(() => {
    if (bloomProgress.current < 1) {
      // FIX: speed doubled (0.006→0.012) = ~3s at 60fps instead of 6s
      bloomProgress.current = Math.min(1, bloomProgress.current + 0.012);
    } else if (!isComplete.current) {
      isComplete.current = true;
      setTimeout(() => callbackRef.current(), 600);
    }
  });

  return (
    <>
      {/* FIX: ambientLight intensity raised so petals are properly lit */}
      <ambientLight intensity={0.8} color="#ffffff" />
      <pointLight position={[0, 2, 3]}  intensity={4}   color="#ff2d78" />
      <pointLight position={[-2, 1, 2]} intensity={2}   color="#9d4edd" />
      <pointLight position={[2, -1, 2]} intensity={1.5} color="#ff6ea8" />

      <Stars radius={8} depth={4} count={500} factor={0.3} saturation={0.5} fade speed={0.3} />

      <Flower bloomProgress={bloomProgress} />
    </>
  );
}

interface FlowerSceneProps {
  onBloomComplete: () => void;
}

export default function FlowerScene({ onBloomComplete }: FlowerSceneProps) {
  // FIX: safety fallback — if R3F stalls for any reason, force-complete after 6s
  useEffect(() => {
    const timer = setTimeout(() => onBloomComplete(), 6000);
    return () => clearTimeout(timer);
  }, [onBloomComplete]);

  return (
    <Canvas
      // FIX: camera much closer (z 2.2→1.4), slightly higher FOV
      camera={{ position: [0, 0.3, 1.4], fov: 60 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      dpr={[1, 2]}
      style={{ background: "transparent" }}
    >
      <Suspense fallback={null}>
        <SceneContent onBloomComplete={onBloomComplete} />
      </Suspense>
    </Canvas>
  );
}

function easeOutElastic(t: number): number {
  if (t === 0 || t === 1) return t;
  const c4 = (2 * Math.PI) / 3;
  return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
}
