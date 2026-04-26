import { Text } from '@react-three/drei';

/**
 * A row of small spheres, one per step, lit according to status:
 *   - green: completed
 *   - cyan glow: currently active
 *   - dark gray: pending
 *
 * `intro` and `done` steps (if present) are filtered out by id so the
 * dots only show the user-action steps.
 */
export interface StepIndicatorEntry {
  id: string;
  title: string;
}

export interface StepIndicatorProps {
  steps: ReadonlyArray<StepIndicatorEntry>;
  /** Index into `steps` of the current step (including intro/done). */
  currentIndex: number;
  position: [number, number, number];
  /** Optional set of step ids to hide from the indicator (default: ['intro', 'done']). */
  hide?: string[];
}

export function StepIndicator({
  steps,
  currentIndex,
  position,
  hide = ['intro', 'done'],
}: StepIndicatorProps) {
  const visible = steps.filter((s) => !hide.includes(s.id));
  // Adjust currentIndex to skip hidden steps before it (for the active dot).
  const hiddenBefore = steps
    .slice(0, currentIndex)
    .filter((s) => hide.includes(s.id)).length;
  const adjustedCurrent = currentIndex - hiddenBefore;
  return (
    <group position={position}>
      {visible.map((s, i) => {
        const isDone = i < adjustedCurrent;
        const isActive = i === adjustedCurrent;
        const x = (i - (visible.length - 1) / 2) * 0.1;
        const color = isDone ? '#9be36b' : isActive ? '#5fdbff' : '#3a4150';
        const emissive = isDone ? '#3a8a3a' : isActive ? '#1d5a78' : '#000';
        return (
          <group key={s.id} position={[x, 0, 0]}>
            <mesh>
              <sphereGeometry args={[0.018, 16, 16]} />
              <meshStandardMaterial
                color={color}
                emissive={emissive}
                emissiveIntensity={isActive ? 0.8 : 0.3}
              />
            </mesh>
            <Text
              position={[0, -0.04, 0]}
              fontSize={0.018}
              color={isActive ? '#5fdbff' : '#7a8696'}
              anchorX="center"
            >
              {String(i + 1)}
            </Text>
          </group>
        );
      })}
    </group>
  );
}
