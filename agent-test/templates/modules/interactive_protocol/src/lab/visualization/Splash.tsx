import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Splash droplets at a pour-impact point. Renders 8 small spheres that
 * cycle through an upward arc + outward expansion, looping continuously
 * while `active` is true.
 */
export interface SplashProps {
  at: [number, number, number];
  color: string;
  active: boolean;
}

export function Splash({ at, color, active }: SplashProps) {
  const groupRef = useRef<THREE.Group>(null);
  const droplets = useMemo(() => {
    const out: Array<{ ang: number; phase: number; rRing: number }> = [];
    for (let i = 0; i < 8; i++) {
      out.push({
        ang: (i / 8) * Math.PI * 2 + (i % 2) * 0.4,
        phase: i * 0.42,
        rRing: 0.014 + (i % 3) * 0.005,
      });
    }
    return out;
  }, []);

  useFrame((state) => {
    if (!groupRef.current || !active) return;
    const t = state.clock.elapsedTime;
    groupRef.current.children.forEach((child, i) => {
      const d = droplets[i % droplets.length]!;
      const life = (t * 3.2 + d.phase) % 1;
      const arch = Math.sin(life * Math.PI);
      const x = Math.cos(d.ang) * d.rRing * (1 + life * 1.4);
      const z = Math.sin(d.ang) * d.rRing * (1 + life * 1.4);
      const y = arch * 0.045;
      child.position.set(x, y, z);
      const s = arch;
      child.scale.set(s, s, s);
    });
  });

  if (!active) return null;
  return (
    <group ref={groupRef} position={at}>
      {droplets.map((_, i) => (
        <mesh key={i}>
          <sphereGeometry args={[0.005, 8, 8]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.55}
            transparent
            opacity={0.95}
          />
        </mesh>
      ))}
    </group>
  );
}
