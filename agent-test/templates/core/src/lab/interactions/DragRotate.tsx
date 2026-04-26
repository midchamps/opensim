import { useRef, type ReactNode } from 'react';
import { type ThreeEvent } from '@react-three/fiber';
import { type Group } from 'three';

/**
 * Wraps children in a group whose Y-axis rotation is driven by the
 * pointer's horizontal drag distance. Used by `Dial` to map drag → angle
 * → numeric value.
 *
 * KEEP — agent-written code mounts this and supplies an `onChange`
 * callback that maps the rotation to a simulation parameter.
 */
export interface DragRotateProps {
  children: ReactNode;
  /** Current rotation in radians. The component is fully controlled. */
  value: number;
  /** Called every time the user drags. Receives the new rotation in radians. */
  onChange: (radians: number) => void;
  /**
   * Pixels the pointer must move to rotate one full turn (2π).
   * Smaller = more sensitive. Default 360.
   */
  pixelsPerTurn?: number;
  /** Optional clamp `[min, max]` on the rotation in radians. */
  clamp?: [number, number];
}

export function DragRotate({
  children,
  value,
  onChange,
  pixelsPerTurn = 360,
  clamp,
}: DragRotateProps) {
  const groupRef = useRef<Group>(null);
  const dragState = useRef<{
    startX: number;
    startValue: number;
  } | null>(null);

  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    (event.target as Element).setPointerCapture?.(event.pointerId);
    dragState.current = { startX: event.clientX, startValue: value };
  };

  const handlePointerMove = (event: ThreeEvent<PointerEvent>) => {
    if (!dragState.current) return;
    const dx = event.clientX - dragState.current.startX;
    const radiansPerPixel = (Math.PI * 2) / pixelsPerTurn;
    let next = dragState.current.startValue + dx * radiansPerPixel;
    if (clamp) {
      next = Math.max(clamp[0], Math.min(clamp[1], next));
    }
    onChange(next);
  };

  const handlePointerUp = (event: ThreeEvent<PointerEvent>) => {
    (event.target as Element).releasePointerCapture?.(event.pointerId);
    dragState.current = null;
  };

  return (
    <group
      ref={groupRef}
      rotation={[0, value, 0]}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {children}
    </group>
  );
}
