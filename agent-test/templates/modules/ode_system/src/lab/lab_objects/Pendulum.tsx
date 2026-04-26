import { useMemo } from 'react';

/**
 * 3D pendulum — pivot + rod + bob. The angle is fully controlled by
 * the parent: pass `angle` (radians, 0 = straight down) every frame
 * and the geometry rotates accordingly. Bob radius scales with the
 * cube root of `mass` (volume-proportional), rod length matches
 * `length`.
 *
 * Convention: pivot is fixed in world space (default just above the
 * desk surface). The rod hangs from pivot along -Y when angle = 0;
 * positive angle swings counter-clockwise looking down -Z.
 *
 * KEEP — the agent never modifies this file. Mount it as a child of
 * `<BaseLabScene>` and feed it the current `[theta, omega]` state.
 */
export interface PendulumProps {
  /** Length from pivot to bob centre, metres. */
  length: number;
  /** Mass of the bob in kg (drives bob visual radius). */
  mass: number;
  /** Current angular displacement in radians (0 = straight down, +CCW). */
  angle: number;
  /** Optional pivot position [x, y, z] in scene units. Default `[0, 1.4, 0]`. */
  pivot?: [number, number, number];
  /** Optional override for the bob colour (purple by default). */
  bobColor?: string;
  /** Optional override for the rod colour. */
  rodColor?: string;
}

export function Pendulum({
  length,
  mass,
  angle,
  pivot = [0, 1.4, 0],
  bobColor = '#bc8cff',
  rodColor = '#5b6779',
}: PendulumProps) {
  // Radius scales with mass^(1/3) so volume tracks mass linearly.
  // Clamp to avoid degenerate visuals at extreme masses.
  const bobRadius = useMemo(() => {
    const r = 0.04 * Math.cbrt(Math.max(mass, 1e-6));
    return Math.max(0.02, Math.min(r, 0.25));
  }, [mass]);

  // Clamp length defensively in case the user drags a slider to 0.
  const rodLength = Math.max(length, 1e-3);

  return (
    <group position={pivot}>
      {/* Pivot stud */}
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[0.025, 16, 16]} />
        <meshStandardMaterial color="#3a4150" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Rotating rod + bob group. r3f maps `rotation={[x, y, z]}`
          directly to the underlying Object3D, so this is fully
          imperative-friendly even when angle changes 60 times/sec. */}
      <group rotation={[0, 0, angle]}>
        {/* Rod — cylinder centred between pivot (y=0) and bob (y=-rodLength). */}
        <mesh position={[0, -rodLength / 2, 0]} castShadow>
          <cylinderGeometry args={[0.005, 0.005, rodLength, 12]} />
          <meshStandardMaterial color={rodColor} metalness={0.4} roughness={0.5} />
        </mesh>
        {/* Bob */}
        <mesh position={[0, -rodLength, 0]} castShadow>
          <sphereGeometry args={[bobRadius, 24, 24]} />
          <meshStandardMaterial color={bobColor} metalness={0.3} roughness={0.4} />
        </mesh>
      </group>
    </group>
  );
}
