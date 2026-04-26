import { Text } from '@react-three/drei';

/**
 * LCD-style numeric / text display for showing a live measurement
 * (period, amplitude, energy, FPS, etc.). Renders a flat plate with
 * a dark green LCD face and monospace digits. Pure presentation —
 * the agent supplies the formatted value string.
 *
 * KEEP — agent-written simulations bind one DigitalReadout per
 * Observable in Protocol Section 6.
 */
export interface DigitalReadoutProps {
  /** Static label above the digits, e.g. "PERIOD". */
  label: string;
  /** Pre-formatted value string, e.g. "2.01 s" or "—". */
  value: string;
  /** World position [x, y, z] of the readout base. */
  position?: [number, number, number];
  /** Display width in metres. Default 0.32. */
  width?: number;
  /** Display height in metres. Default 0.12. */
  height?: number;
  /** Optional Y rotation in radians (face the camera). Default 0. */
  rotationY?: number;
}

export function DigitalReadout({
  label,
  value,
  position = [0, 0, 0],
  width = 0.32,
  height = 0.12,
  rotationY = 0,
}: DigitalReadoutProps) {
  const FRAME_THICKNESS = 0.012;
  const SCREEN_INSET = 0.014;

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Frame */}
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, FRAME_THICKNESS]} />
        <meshStandardMaterial color="#1c2330" roughness={0.7} />
      </mesh>
      {/* LCD face */}
      <mesh position={[0, height / 2, FRAME_THICKNESS / 2 + 0.0005]}>
        <planeGeometry
          args={[width - SCREEN_INSET * 2, height - SCREEN_INSET * 2]}
        />
        <meshStandardMaterial
          color="#0a3d2a"
          emissive="#0a3d2a"
          emissiveIntensity={0.35}
          roughness={0.4}
        />
      </mesh>
      {/* Label */}
      <Text
        position={[
          0,
          height - SCREEN_INSET - 0.018,
          FRAME_THICKNESS / 2 + 0.001,
        ]}
        fontSize={0.018}
        color="#5fdca0"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
      {/* Value — uses drei's bundled default font (loading an external
          font URL here would crash the whole React tree if the network
          request fails, which is what happened on the first Gate-2
          attempt). A bundled monospace LCD font can be added later via
          /public/fonts and the `font={}` prop. */}
      <Text
        position={[0, height / 2 - 0.005, FRAME_THICKNESS / 2 + 0.001]}
        fontSize={0.04}
        color="#7ee787"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.06}
      >
        {value}
      </Text>
    </group>
  );
}
