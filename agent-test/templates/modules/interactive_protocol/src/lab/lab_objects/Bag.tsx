/**
 * Generic transparent bag — clear box around contents (e.g. sample to be
 * crushed). Has a visible rim outline so the container is recognizable.
 *
 * Drag/pour pose props (tilt + lift + nudge) are not on the bag itself;
 * wrap it in a `<group>` whose transform you control.
 */
export interface BagProps {
  position: [number, number, number];
  /** 0 = empty, 1 = full to top (interior height). */
  contentLevel: number;
  /** CSS colour of the contents inside the bag. */
  contentColor: string;
  onClick?: () => void;
  onPointerDown?: (
    e: import('@react-three/fiber').ThreeEvent<PointerEvent>,
  ) => void;
}

export function Bag({
  position,
  contentLevel,
  contentColor,
  onClick,
  onPointerDown,
}: BagProps) {
  const liqH = 0.16 * Math.max(0, Math.min(1, contentLevel));
  const interactive = !!onClick || !!onPointerDown;
  const cursor = interactive ? (onPointerDown ? 'grab' : 'pointer') : 'default';
  return (
    <group
      position={position}
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
      {/* Bag shell */}
      <mesh position={[0, 0.08, 0]}>
        <boxGeometry args={[0.22, 0.16, 0.16]} />
        <meshPhysicalMaterial
          color="#aebbcd"
          transparent
          opacity={0.22}
          roughness={0.06}
          metalness={0}
          transmission={0.82}
          thickness={0.4}
        />
      </mesh>
      {/* Bag rim outline so the container shape is visible */}
      <mesh position={[0, 0.16, 0]}>
        <torusGeometry args={[0.105, 0.0035, 8, 24]} />
        <meshStandardMaterial color="#566275" roughness={0.7} />
      </mesh>
      {liqH > 0.001 && (
        <mesh position={[0, liqH / 2 + 0.005, 0]}>
          <boxGeometry args={[0.2, liqH, 0.14]} />
          <meshStandardMaterial
            color={contentColor}
            transparent
            opacity={0.9}
            roughness={0.4}
          />
        </mesh>
      )}
    </group>
  );
}
