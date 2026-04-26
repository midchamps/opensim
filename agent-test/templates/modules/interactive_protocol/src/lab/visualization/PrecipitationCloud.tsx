import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Wispy translucent cloud — useful for rendering reaction precipitates
 * at a phase boundary (e.g. DNA precipitate at the filtrate/ethanol
 * interface, or any white wispy turbidity).
 *
 * Internally 16 small overlapping spheres with subtle drift via useFrame.
 */
export interface PrecipitationCloudProps {
  position: [number, number, number];
  /** 0 = invisible, 1 = full intensity. */
  amount: number;
  /** CSS colour of the cloud. Default off-white. */
  color?: string;
}

export function PrecipitationCloud({
  position,
  amount,
  color = '#f2f4ff',
}: PrecipitationCloudProps) {
  const groupRef = useRef<THREE.Group>(null);
  const wisps = useMemo(() => {
    const out: Array<{
      base: [number, number, number];
      r: number;
      seed: number;
    }> = [];
    let s = 41;
    const rand = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
    for (let i = 0; i < 16; i++) {
      const ang = rand() * Math.PI * 2;
      const dist = rand() * 0.045;
      out.push({
        base: [
          Math.cos(ang) * dist,
          (rand() - 0.5) * 0.018,
          Math.sin(ang) * dist,
        ],
        r: 0.006 + rand() * 0.01,
        seed: i,
      });
    }
    return out;
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.children.forEach((child, i) => {
      const w = wisps[i % wisps.length]!;
      const drift = Math.sin(t * 0.6 + w.seed) * 0.005;
      child.position.set(
        w.base[0] + Math.cos(w.seed) * drift,
        w.base[1] + drift * 0.4,
        w.base[2] + Math.sin(w.seed) * drift,
      );
    });
  });

  if (amount <= 0.01) return null;
  return (
    <group ref={groupRef} position={position}>
      {wisps.map((w, i) => (
        <mesh key={i}>
          <sphereGeometry args={[w.r, 10, 10]} />
          <meshStandardMaterial
            color={color}
            emissive="#ffffff"
            emissiveIntensity={0.15 * amount}
            transparent
            opacity={0.35 * amount}
          />
        </mesh>
      ))}
    </group>
  );
}
