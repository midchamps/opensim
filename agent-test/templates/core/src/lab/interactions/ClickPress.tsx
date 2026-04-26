import { useRef, useState, type ReactNode } from 'react';
import { type ThreeEvent } from '@react-three/fiber';
import { useLabStore } from './labStore';

/**
 * Wraps a child mesh in a group that handles click presses with
 * visual depress feedback. Pointer capture ensures the eventual
 * pointer-up always reaches us even after the press shifts the
 * geometry out of raycast range.
 *
 * KEEP — agent-written code passes `onPress` to bind a simulation
 * action (Run / Pause / Reset / Step / Export).
 */
export interface ClickPressProps {
  children: ReactNode;
  /** Fires once per complete press (pointer-down then -up while armed). */
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
  // `armedRef` is the source of truth for "a press is in flight".
  // We *don't* clear it on pointer-leave — the press shifts the cap
  // mesh down by `pressDepth`, which can knock the cursor off the
  // raycast hit and would otherwise spuriously cancel the click.
  // Pointer capture guarantees we still receive the final pointer-up.
  const armedRef = useRef(false);

  const beginInteraction = useLabStore((s) => s.beginInstrumentInteraction);
  const endInteraction = useLabStore((s) => s.endInstrumentInteraction);

  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    if (disabled) return;
    event.stopPropagation();
    (event.target as Element).setPointerCapture?.(event.pointerId);
    armedRef.current = true;
    setPressed(true);
    beginInteraction();
  };

  const handlePointerUp = (event: ThreeEvent<PointerEvent>) => {
    if (disabled) return;
    (event.target as Element).releasePointerCapture?.(event.pointerId);
    const fired = armedRef.current;
    armedRef.current = false;
    setPressed(false);
    if (fired) {
      onPress();
      endInteraction();
    }
  };

  // Safety net: if the pointer is cancelled (e.g. browser captured it
  // for something else), bail out cleanly so OrbitControls is re-
  // enabled even though no click fires.
  const handlePointerCancel = () => {
    if (armedRef.current) {
      armedRef.current = false;
      setPressed(false);
      endInteraction();
    }
  };

  return (
    <group
      position-y={pressed ? -pressDepth : 0}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
    >
      {children}
    </group>
  );
}
