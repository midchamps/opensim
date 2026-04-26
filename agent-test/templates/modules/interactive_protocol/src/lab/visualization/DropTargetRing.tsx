import * as THREE from 'three';

/**
 * Glowing ring on the desk surface that shows the user where to drop a
 * source container they're currently dragging. Should be rendered only
 * while a drag is in progress (e.g. `useDragOnPlane().isDragging`).
 */
export interface DropTargetRingProps {
  position: [number, number, number];
  /** Outer radius of the ring (matches the drop-zone hit radius). */
  radius: number;
  /** CSS colour. Default cyan. */
  color?: string;
}

export function DropTargetRing({
  position,
  radius,
  color = '#5fdbff',
}: DropTargetRingProps) {
  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius * 0.9, radius, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.8}
          transparent
          opacity={0.7}
          side={THREE.DoubleSide}
        />
      </mesh>
      <pointLight
        position={[0, 0.05, 0]}
        intensity={0.5}
        distance={0.4}
        color={color}
      />
    </group>
  );
}
