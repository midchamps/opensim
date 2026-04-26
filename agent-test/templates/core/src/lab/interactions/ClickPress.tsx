import { useState, type ReactNode } from 'react';
import { type ThreeEvent } from '@react-three/fiber';

/**
 * Wraps a child mesh in a group that handles click presses with
 * visual depress feedback (scales down on pointer-down, hover halo
 * via callback prop). Used by `Button3D` and any other clickable
 * lab control.
 *
 * KEEP — agent-written code passes `onPress` to bind a simulation
 * action (Run / Pause / Reset / Step / Export).
 */
export interface ClickPressProps {
  children: ReactNode;
  /** Fires once per complete press (pointer-down + pointer-up while still hovering). */
  onPress: () => void;
  /** How far to depress on click, in scene units. Default 0.012. */
  pressDepth?: number;
  /** Disable pointer events entirely. */
  disabled?: boolean;
}

export function ClickPress({
  children,
  onPress,
  pressDepth = 0.012,
  disabled = false,
}: ClickPressProps) {
  const [pressed, setPressed] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    if (disabled) return;
    event.stopPropagation();
    (event.target as Element).setPointerCapture?.(event.pointerId);
    setPressed(true);
  };

  const handlePointerUp = (event: ThreeEvent<PointerEvent>) => {
    if (disabled) return;
    (event.target as Element).releasePointerCapture?.(event.pointerId);
    if (pressed && hovered) onPress();
    setPressed(false);
  };

  return (
    <group
      position-y={pressed ? -pressDepth : 0}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerEnter={() => !disabled && setHovered(true)}
      onPointerLeave={() => {
        setHovered(false);
        setPressed(false);
      }}
    >
      {children}
    </group>
  );
}
