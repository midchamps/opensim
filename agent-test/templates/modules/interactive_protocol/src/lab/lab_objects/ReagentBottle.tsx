import { useMemo } from 'react';
import { Text, MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Generic reagent bottle — body + neck + cap, with a 3-line label that
 * the agent customises (chemical name, concentration, hazard).
 * LatheGeometry profile gives a proper bottle silhouette.
 *
 * Supports the same drag/pour pose props as `<Beaker>` so it can be
 * picked up and tipped over a target.
 *
 * KEEP — generic for any liquid reagent. Customise via labelTopLine /
 * labelMidLine / labelBottomLine + liquidColor + glassColor.
 */

const BOTTLE_PROFILE = [
  new THREE.Vector2(0.0, 0.0),
  new THREE.Vector2(0.045, 0.0),
  new THREE.Vector2(0.045, 0.005),
  new THREE.Vector2(0.045, 0.165),
  new THREE.Vector2(0.04, 0.18),
  new THREE.Vector2(0.025, 0.195),
  new THREE.Vector2(0.02, 0.21),
  new THREE.Vector2(0.02, 0.235),
  new THREE.Vector2(0.0, 0.235),
];

export interface ReagentBottleProps {
  position: [number, number, number];
  tilt?: number;
  lift?: number;
  horizontalNudge?: number;
  zNudge?: number;
  /** 0..1 fraction of bottle filled with liquid. */
  liquidLevel?: number;
  /** CSS colour for the liquid inside. Default pale ethanol-blue. */
  liquidColor?: string;
  /** CSS colour tint for the glass body. Default pale blue. */
  glassColor?: string;
  /** Cap colour. Default near-black. */
  capColor?: string;
  /** Text on the label, top line (large). */
  labelTopLine?: string;
  /** Text on the label, middle line (small). */
  labelMidLine?: string;
  /** Text on the label, bottom line (red, hazard). */
  labelBottomLine?: string;
  onClick?: () => void;
  onPointerDown?: (
    e: import('@react-three/fiber').ThreeEvent<PointerEvent>,
  ) => void;
}

export function ReagentBottle({
  position,
  tilt = 0,
  lift = 0,
  horizontalNudge = 0,
  zNudge = 0,
  liquidLevel = 1,
  liquidColor = '#e8f4ff',
  glassColor = '#9ec0ff',
  capColor = '#1a1f2a',
  labelTopLine = 'REAGENT',
  labelMidLine,
  labelBottomLine,
  onClick,
  onPointerDown,
}: ReagentBottleProps) {
  const interactive = !!onClick || !!onPointerDown;
  const cursor = interactive ? (onPointerDown ? 'grab' : 'pointer') : 'default';
  const bodyLathe = useMemo(
    () => new THREE.LatheGeometry(BOTTLE_PROFILE, 32),
    [],
  );
  const liqH = 0.15 * Math.max(0, Math.min(1, liquidLevel));

  return (
    <group
      position={[
        position[0] + horizontalNudge,
        position[1] + lift,
        position[2] + zNudge,
      ]}
      rotation={[0, 0, -tilt]}
      onPointerOver={(e) => {
        if (interactive) {
          e.stopPropagation();
          document.body.style.cursor = cursor;
        }
      }}
      onPointerOut={() => {
        if (interactive) document.body.style.cursor = 'default';
      }}
      onPointerDown={(e) => {
        if (onPointerDown) onPointerDown(e);
      }}
      onClick={(e) => {
        if (onClick) {
          e.stopPropagation();
          onClick();
        }
      }}
    >
      {/* Glass body */}
      <mesh geometry={bodyLathe} castShadow>
        <MeshTransmissionMaterial
          backside
          samples={6}
          thickness={0.1}
          roughness={0.05}
          transmission={1}
          color={glassColor}
          ior={1.45}
          attenuationDistance={0.4}
          attenuationColor="#a4bcef"
        />
      </mesh>
      {liqH > 0.001 && (
        <mesh position={[0, liqH / 2, 0]}>
          <cylinderGeometry args={[0.04, 0.04, liqH, 24]} />
          <meshStandardMaterial color={liquidColor} transparent opacity={0.7} />
        </mesh>
      )}
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.03, 24]} />
        <meshStandardMaterial
          color={capColor}
          roughness={0.55}
          metalness={0.3}
        />
      </mesh>
      <mesh position={[0, 0.26, 0]}>
        <torusGeometry args={[0.026, 0.0015, 8, 24]} />
        <meshStandardMaterial color="#0a0e14" roughness={0.7} />
      </mesh>
      {/* Label */}
      <mesh position={[0, 0.08, 0.046]}>
        <planeGeometry args={[0.06, 0.08]} />
        <meshStandardMaterial color="#fafafa" roughness={0.9} />
      </mesh>
      <Text position={[0, 0.105, 0.047]} fontSize={0.014} color="#1a1a1a">
        {labelTopLine}
      </Text>
      {labelMidLine && (
        <Text position={[0, 0.085, 0.047]} fontSize={0.008} color="#3a3a3a">
          {labelMidLine}
        </Text>
      )}
      {labelBottomLine && (
        <Text position={[0, 0.06, 0.047]} fontSize={0.007} color="#962b32">
          {labelBottomLine}
        </Text>
      )}
    </group>
  );
}
