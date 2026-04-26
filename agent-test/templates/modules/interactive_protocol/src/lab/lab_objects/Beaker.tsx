import { useMemo } from 'react';
import { Text, MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Lab Beaker — LatheGeometry profile (rounded base, slight rim flare)
 * with MeshTransmissionMaterial for real glass refraction. Supports two
 * stacked liquid layers (e.g. filtrate + ethanol on top), label, and the
 * three-axis "pour" pose: tilt + lift + horizontal/depth nudge so it can
 * be picked up and tipped over a target by drag-to-pour.
 *
 * KEEP — agent-written code mounts this as a child of `<BaseLabScene>`
 * and feeds drag/pour state from a `BaseProtocol`-driven controller.
 */

const BEAKER_PROFILE = [
  new THREE.Vector2(0.075, 0.0),
  new THREE.Vector2(0.075, 0.005),
  new THREE.Vector2(0.075, 0.15),
  new THREE.Vector2(0.078, 0.165),
  new THREE.Vector2(0.078, 0.18),
  new THREE.Vector2(0.073, 0.18),
  new THREE.Vector2(0.07, 0.165),
  new THREE.Vector2(0.07, 0.005),
  new THREE.Vector2(0.0, 0.005),
];

export interface BeakerProps {
  position: [number, number, number];
  /** Primary liquid level 0..1 (0 = empty, 1 = full to rim). */
  liquidHeight: number;
  /** Primary liquid CSS colour. */
  liquidColor: string;
  /** Optional second layer (e.g. ethanol on top of filtrate). */
  ethanolHeight?: number;
  /** Optional CSS colour for the second layer. Defaults to a pale ethanol blue. */
  ethanolColor?: string;
  /** Optional rim label rendered above the beaker. */
  label?: string;
  /** Tilt around Z axis in radians (sign convention: +ve tips RIGHT, -ve tips LEFT). */
  tilt?: number;
  /** Vertical lift in scene units (peer-pickup height). */
  lift?: number;
  /** Additional X translation (drag offset or animation nudge). */
  horizontalNudge?: number;
  /** Additional Z translation (drag offset). */
  zNudge?: number;
  onClick?: () => void;
  onPointerDown?: (
    e: import('@react-three/fiber').ThreeEvent<PointerEvent>,
  ) => void;
}

export function Beaker({
  position,
  liquidHeight,
  liquidColor,
  ethanolHeight,
  ethanolColor = '#e8f4ff',
  label,
  tilt = 0,
  lift = 0,
  horizontalNudge = 0,
  zNudge = 0,
  onClick,
  onPointerDown,
}: BeakerProps) {
  const lathe = useMemo(() => new THREE.LatheGeometry(BEAKER_PROFILE, 48), []);
  const liquidH = 0.18 * Math.max(0, Math.min(1, liquidHeight));
  const ethH = ethanolHeight
    ? 0.18 * Math.max(0, Math.min(1, ethanolHeight))
    : 0;
  const interactive = !!onClick || !!onPointerDown;
  const cursor = interactive ? (onPointerDown ? 'grab' : 'pointer') : 'default';

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
      <mesh geometry={lathe}>
        <MeshTransmissionMaterial
          backside
          samples={6}
          thickness={0.12}
          roughness={0.05}
          chromaticAberration={0.02}
          anisotropy={0.1}
          transmission={1}
          color="#f3faff"
          ior={1.45}
          attenuationDistance={0.5}
          attenuationColor="#dbeaff"
        />
      </mesh>
      {liquidHeight > 0 && (
        <mesh position={[0, 0.005 + liquidH / 2, 0]}>
          <cylinderGeometry args={[0.068, 0.068, liquidH, 32]} />
          <meshStandardMaterial
            color={liquidColor}
            roughness={0.2}
            transparent
            opacity={0.88}
          />
        </mesh>
      )}
      {ethH > 0 && (
        <mesh position={[0, 0.005 + liquidH + ethH / 2, 0]}>
          <cylinderGeometry args={[0.068, 0.068, ethH, 32]} />
          <meshStandardMaterial
            color={ethanolColor}
            roughness={0.05}
            transparent
            opacity={0.55}
          />
        </mesh>
      )}
      {label && (
        <Text
          position={[0, 0.22, 0.08]}
          fontSize={0.024}
          color="#cfeaff"
          anchorX="center"
        >
          {label}
        </Text>
      )}
    </group>
  );
}
