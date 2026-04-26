import { MeshTransmissionMaterial } from '@react-three/drei';

/**
 * Glass stirring rod — a thin glass cylinder. `dipping` ∈ [-1, 1]
 * controls vertical offset (-1 = lifted above origin, 1 = fully dipped
 * down). `twist` is rotation around Y in radians (or any continuous
 * scalar; the rod's group rotates by `twist * 1.5`).
 */
export interface GlassRodProps {
  position: [number, number, number];
  /** -1 = lifted high above origin, 0 = at origin, 1 = dipped fully down. */
  dipping: number;
  /** Continuous rotation accumulator (multiplied by 1.5 for radians). */
  twist: number;
  onClick?: () => void;
  onPointerDown?: (
    e: import('@react-three/fiber').ThreeEvent<PointerEvent>,
  ) => void;
}

export function GlassRod({
  position,
  dipping,
  twist,
  onClick,
  onPointerDown,
}: GlassRodProps) {
  const interactive = !!onClick || !!onPointerDown;
  const cursor = interactive ? (onPointerDown ? 'grab' : 'pointer') : 'default';
  const yOffset = -0.07 * dipping;
  return (
    <group
      position={[position[0], position[1] + yOffset, position[2]]}
      rotation={[0, twist * 1.5, 0]}
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
      <mesh position={[0, 0.13, 0]}>
        <cylinderGeometry args={[0.006, 0.006, 0.3, 16]} />
        <MeshTransmissionMaterial
          thickness={0.04}
          transmission={1}
          roughness={0.05}
          color="#f0f5ff"
          ior={1.5}
        />
      </mesh>
    </group>
  );
}
