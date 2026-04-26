import { MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Lab funnel — glass cone + cheesecloth disc + stem. Optional `mashAmount`
 * shows accumulated solid (e.g. crushed sample) sitting on the cheesecloth
 * which drains over time.
 */
export interface FunnelProps {
  position: [number, number, number];
  /** 0 = clean cheesecloth, 1 = full lump on top draining through. */
  mashAmount?: number;
  /** CSS colour of the mash sitting on the filter. Default deep red. */
  mashColor?: string;
  onClick?: () => void;
}

export function Funnel({
  position,
  mashAmount = 0,
  mashColor = '#7a1424',
  onClick,
}: FunnelProps) {
  const cursor = onClick ? 'pointer' : 'default';
  return (
    <group
      position={position}
      onPointerOver={(e) => {
        if (onClick) {
          e.stopPropagation();
          document.body.style.cursor = cursor;
        }
      }}
      onPointerOut={() => {
        if (onClick) document.body.style.cursor = 'default';
      }}
      onClick={(e) => {
        if (onClick) {
          e.stopPropagation();
          onClick();
        }
      }}
    >
      {/* funnel cone */}
      <mesh position={[0, 0.06, 0]}>
        <coneGeometry args={[0.07, 0.1, 32, 1, true]} />
        <MeshTransmissionMaterial
          backside
          samples={4}
          thickness={0.06}
          roughness={0.1}
          transmission={1}
          color="#ecf3fa"
          ior={1.4}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* cheesecloth */}
      <mesh position={[0, 0.111, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.06, 32]} />
        <meshStandardMaterial
          color="#dccaa6"
          roughness={0.95}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* stem */}
      <mesh position={[0, 0.0, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.04, 16]} />
        <MeshTransmissionMaterial
          thickness={0.04}
          transmission={0.95}
          roughness={0.1}
          color="#ecf3fa"
        />
      </mesh>
      {mashAmount > 0.01 && (
        <mesh
          position={[0, 0.118, 0]}
          scale={[mashAmount, mashAmount, mashAmount]}
        >
          <cylinderGeometry args={[0.05, 0.04, 0.022, 24]} />
          <meshStandardMaterial color={mashColor} roughness={0.85} />
        </mesh>
      )}
    </group>
  );
}
