import { ClickPress } from '../interactions/ClickPress';
import { HoverInfo } from '../interactions/HoverInfo';

/**
 * A pressable button on the workbench. Used for Run / Pause / Reset /
 * Step / Export controls. The agent passes a `kind` to pick a stock
 * colour scheme; custom colours are also accepted.
 *
 * KEEP — agent-written simulations mount one Button3D per action and
 * wire `onPress` to the simulation runner.
 */
export type Button3DKind = 'run' | 'pause' | 'reset' | 'step' | 'export' | 'custom';

const KIND_COLORS: Record<Button3DKind, { face: string; emissive: string }> = {
  run: { face: '#3ddc84', emissive: '#1f6b3f' },
  pause: { face: '#f0883e', emissive: '#7a4520' },
  reset: { face: '#bc8cff', emissive: '#5e438a' },
  step: { face: '#58a6ff', emissive: '#2e567f' },
  export: { face: '#9aa7b2', emissive: '#3a4150' },
  custom: { face: '#9aa7b2', emissive: '#3a4150' },
};

export interface Button3DProps {
  /** Visible label below the cap (also used in HoverInfo). */
  label: string;
  /** Which canned colour scheme to use. */
  kind?: Button3DKind;
  /** Override the cap colour (only used when `kind === "custom"`). */
  color?: string;
  /** Called once on a complete press cycle while pointer stays over the button. */
  onPress: () => void;
  /** Disables the button visually and functionally. */
  disabled?: boolean;
  /** World position of the button base. y is on the desk surface (0). */
  position?: [number, number, number];
  /** Cap radius in metres. Default 0.06. */
  radius?: number;
}

export function Button3D({
  label,
  kind = 'custom',
  color,
  onPress,
  disabled = false,
  position = [0, 0, 0],
  radius = 0.06,
}: Button3DProps) {
  const palette = KIND_COLORS[kind];
  const faceColor = kind === 'custom' && color ? color : palette.face;

  return (
    <group position={position}>
      <HoverInfo label={label} value={disabled ? 'disabled' : undefined}>
        {/* Base socket */}
        <mesh position={[0, 0.008, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[radius * 1.25, radius * 1.25, 0.016, 24]} />
          <meshStandardMaterial color="#1c2330" roughness={0.7} />
        </mesh>
        {/* Cap (the part that depresses) */}
        <ClickPress onPress={onPress} disabled={disabled}>
          <mesh position={[0, 0.028, 0]} castShadow>
            <cylinderGeometry args={[radius, radius, 0.024, 24]} />
            <meshStandardMaterial
              color={disabled ? '#3a4150' : faceColor}
              emissive={disabled ? '#000' : palette.emissive}
              emissiveIntensity={disabled ? 0 : 0.45}
              roughness={0.3}
              metalness={0.2}
            />
          </mesh>
        </ClickPress>
      </HoverInfo>
    </group>
  );
}
