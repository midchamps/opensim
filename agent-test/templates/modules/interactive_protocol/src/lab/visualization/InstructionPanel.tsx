import { Text } from '@react-three/drei';

/**
 * Wall-mounted instruction panel that displays the current protocol
 * step's title + instruction body + progress counter. The agent passes
 * a `BaseProtocol`-derived step object that has at minimum an `id`,
 * `title`, `instruction`, and `required` field.
 */
export interface InstructionPanelStep {
  id: string;
  title: string;
  instruction: string;
  required: number;
}

export interface InstructionPanelProps {
  step: InstructionPanelStep;
  progress: number;
  position: [number, number, number];
}

export function InstructionPanel({
  step,
  progress,
  position,
}: InstructionPanelProps) {
  const w = 1.4;
  const h = 0.42;
  const showProgress = step.required > 0 && step.id !== 'done';
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[w + 0.04, h + 0.04, 0.02]} />
        <meshStandardMaterial color="#1a1f2a" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0, 0.012]}>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial
          color="#0a1020"
          emissive="#0a1424"
          emissiveIntensity={0.5}
          roughness={0.3}
        />
      </mesh>
      <Text
        position={[0, 0.13, 0.022]}
        fontSize={0.06}
        color="#5fdbff"
        anchorX="center"
        anchorY="middle"
        maxWidth={w - 0.1}
      >
        {step.title}
      </Text>
      <Text
        position={[0, -0.02, 0.022]}
        fontSize={0.034}
        color="#dfeaf7"
        anchorX="center"
        anchorY="middle"
        maxWidth={w - 0.12}
        textAlign="center"
      >
        {step.instruction}
      </Text>
      {showProgress && (
        <Text
          position={[0, -0.16, 0.022]}
          fontSize={0.028}
          color="#9be36b"
          anchorX="center"
        >
          {`progress: ${Math.min(progress, step.required)} / ${step.required}`}
        </Text>
      )}
    </group>
  );
}
