import { DragRotate } from '../interactions/DragRotate';
import { HoverInfo } from '../interactions/HoverInfo';

/**
 * A rotary knob mounted on the workbench. Drag horizontally to scrub
 * its bound numeric value through `[min, max]`. The model rotation is
 * proportional to the value's position in the range.
 *
 * KEEP — agent-written simulations create one Dial per simConfig field,
 * passing `value` (current), `onChange` (writer), and `[min, max]`. The
 * dial's display unit comes from the simConfig's `unit` field.
 */
export interface DialProps {
  /** Display label, e.g. "Length". */
  label: string;
  /** Physical unit for the tooltip, e.g. "m" or "kg". */
  unit?: string;
  /** Current numeric value. */
  value: number;
  /** Min/max bounds for the dial range. */
  min: number;
  max: number;
  /** Called as the user drags. */
  onChange: (next: number) => void;
  /** World position [x, y, z] of the dial base. y is on the desk surface (0). */
  position?: [number, number, number];
  /** Display radius in metres. Default 0.08. */
  radius?: number;
  /** Number of decimals shown in the tooltip. Default 2. */
  decimals?: number;
}

const TURN_RANGE = Math.PI * 1.5; // -135° to +135°

export function Dial({
  label,
  unit,
  value,
  min,
  max,
  onChange,
  position = [0, 0, 0],
  radius = 0.08,
  decimals = 2,
}: DialProps) {
  // Map value ∈ [min, max] → rotation ∈ [-TURN_RANGE/2, +TURN_RANGE/2]
  const t = (value - min) / (max - min || 1);
  const rotation = -TURN_RANGE / 2 + t * TURN_RANGE;

  const handleRotate = (radians: number) => {
    const tt = (radians + TURN_RANGE / 2) / TURN_RANGE;
    const clamped = Math.max(0, Math.min(1, tt));
    onChange(min + clamped * (max - min));
  };

  const tooltipValue = `${value.toFixed(decimals)}${unit ? ' ' + unit : ''}`;

  return (
    <group position={position}>
      <HoverInfo label={label} value={tooltipValue}>
        {/* Base ring (fixed) */}
        <mesh position={[0, 0.005, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[radius * 1.15, radius * 1.15, 0.01, 32]} />
          <meshStandardMaterial color="#2a2f3a" roughness={0.6} />
        </mesh>
        {/* Rotating knob */}
        <DragRotate
          value={rotation}
          onChange={handleRotate}
          clamp={[-TURN_RANGE / 2, TURN_RANGE / 2]}
        >
          <mesh position={[0, 0.025, 0]} castShadow>
            <cylinderGeometry args={[radius, radius * 0.9, 0.04, 24]} />
            <meshStandardMaterial
              color="#3a4150"
              roughness={0.35}
              metalness={0.4}
            />
          </mesh>
          {/* Pointer marker on top */}
          <mesh position={[0, 0.046, radius * 0.65]} castShadow>
            <boxGeometry args={[0.012, 0.005, radius * 0.55]} />
            <meshStandardMaterial
              color="#7ee787"
              emissive="#3ddc84"
              emissiveIntensity={0.5}
            />
          </mesh>
        </DragRotate>
      </HoverInfo>
    </group>
  );
}
