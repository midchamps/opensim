import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Animated falling-liquid stream from `from` to `to`, with a parabolic
 * arc (Quadratic Bezier with control point above target at source's height).
 * Renders TWO parts:
 *   - subtle static tube backdrop along the curve
 *   - animated FlowDrops particles travelling along the curve (the
 *     visible "flow" that makes it look like real liquid)
 *
 * `extend` and `retract` ∈ [0, 1] together define the visible portion of
 * the curve as `[retract, extend]`. During pour ramp-up: extend grows
 * 0→1. During pour ramp-down: retract grows 0→1.
 */

function makeCurve(
  from: [number, number, number],
  to: [number, number, number],
): THREE.QuadraticBezierCurve3 {
  const fromV = new THREE.Vector3(...from);
  const toV = new THREE.Vector3(...to);
  // Control point directly above target at source's height —
  // gives a horizontal-start, vertical-end pour arc.
  const cpV = new THREE.Vector3(to[0], from[1], to[2]);
  return new THREE.QuadraticBezierCurve3(fromV, cpV, toV);
}

function FlowDrops({
  curve,
  color,
  active,
  count = 8,
  speed = 1.4,
  thickness = 0.011,
  uMin = 0,
  uMax = 1,
}: {
  curve: THREE.QuadraticBezierCurve3;
  color: string;
  active: boolean;
  count?: number;
  speed?: number;
  thickness?: number;
  uMin?: number;
  uMax?: number;
}) {
  const refs = useRef<THREE.Mesh[]>([]);
  useFrame((state) => {
    if (!active) return;
    const t = state.clock.elapsedTime;
    refs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const phase = (t * speed + i / count) % 1;
      const u = uMin + (uMax - uMin) * phase;
      const p = curve.getPoint(u);
      mesh.position.copy(p);
      const s = 1 - 0.35 * phase;
      mesh.scale.set(s, s, s);
    });
  });
  if (!active) return null;
  return (
    <group>
      {Array.from({ length: count }, (_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            if (el) refs.current[i] = el;
          }}
        >
          <sphereGeometry args={[thickness, 10, 10]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.6}
            transparent
            opacity={0.95}
          />
        </mesh>
      ))}
    </group>
  );
}

export interface PouringStreamProps {
  from: [number, number, number];
  to: [number, number, number];
  color: string;
  /** 0..1, how far the stream tip has reached from source */
  extend: number;
  /** 0..1, how much from source has been pulled back */
  retract: number;
  thickness?: number;
}

export function PouringStream({
  from,
  to,
  color,
  extend,
  retract,
  thickness = 0.014,
}: PouringStreamProps) {
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  useFrame((state) => {
    if (!matRef.current) return;
    matRef.current.emissiveIntensity =
      0.4 + 0.25 * Math.sin(state.clock.elapsedTime * 14);
  });

  const span = extend - retract;
  if (span <= 0.005) return null;

  const fullCurve = makeCurve(from, to);
  const N = 28;
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= N; i++) {
    const u = retract + span * (i / N);
    pts.push(fullCurve.getPoint(u));
  }
  const subCurve = new THREE.CatmullRomCurve3(pts);

  return (
    <group>
      <mesh>
        <tubeGeometry args={[subCurve, N, thickness * 0.55, 10, false]} />
        <meshStandardMaterial
          ref={matRef}
          color={color}
          emissive={color}
          emissiveIntensity={0.45}
          transparent
          opacity={0.55}
          side={THREE.DoubleSide}
        />
      </mesh>
      <FlowDrops
        curve={fullCurve}
        color={color}
        active
        count={8}
        thickness={thickness * 0.85}
        uMin={retract}
        uMax={extend}
      />
    </group>
  );
}
