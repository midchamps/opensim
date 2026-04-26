import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { BaseSolver } from '../../solvers';
import type { Agent } from '../../solvers';

/**
 * 3D swarm visualization — a single InstancedMesh with one instance
 * per agent. Reads `solver.state` every frame via `useFrame` and
 * writes per-instance matrices directly. Bypasses React reconciliation
 * for the per-tick position/velocity update so the visual cost stays
 * O(N) per frame regardless of which solver is driving it.
 *
 * Each instance is oriented along the agent's velocity (only when
 * `orient = true` and the velocity is non-trivially non-zero) and can
 * use either a sphere (default) or cone shape for boid-like
 * directionality. `count` MUST be ≥ the maximum agent count the
 * solver will hold; unused instances get scaled to zero so they
 * disappear.
 *
 * KEEP — the agent never modifies this file. Mount it as a child of
 * `<BaseLabScene>` and pass the live solver instance.
 */
export interface AgentSwarmProps<A extends Agent> {
  /** Source of truth — the solver whose `state` is the agent list. */
  solver: BaseSolver<A[]>;
  /** Maximum number of instances. Must be ≥ peak agent count. */
  count: number;
  /** Visual shape per agent. Default `'sphere'`. */
  shape?: 'sphere' | 'cone';
  /** Visual size in scene units. Default `0.06`. */
  size?: number;
  /** Mesh colour. Default `'#ff9a3c'` (warm orange). */
  color?: string;
  /** When `true` (default), each instance points along its velocity. */
  orient?: boolean;
}

const _dummy = new THREE.Object3D();
const _vel = new THREE.Vector3();
const _up = new THREE.Vector3(0, 1, 0);
const _quat = new THREE.Quaternion();

export function AgentSwarm<A extends Agent>({
  solver,
  count,
  shape = 'sphere',
  size = 0.06,
  color = '#ff9a3c',
  orient = true,
}: AgentSwarmProps<A>) {
  const ref = useRef<THREE.InstancedMesh>(null);

  // Pick geometry once. Drei's `<Instances>` could do this too, but
  // a raw InstancedMesh keeps the dependency surface smaller.
  const geometry = useMemo(() => {
    if (shape === 'cone') {
      // Cone of length `size`, base radius half. Default Three cone
      // points along +Y with apex at +size/2.
      return new THREE.ConeGeometry(size * 0.45, size, 8);
    }
    return new THREE.SphereGeometry(size * 0.5, 12, 12);
  }, [shape, size]);

  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({ color, metalness: 0.2, roughness: 0.5 }),
    [color],
  );

  useFrame(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const agents = solver.state;
    const n = agents.length;
    for (let i = 0; i < count; i++) {
      if (i < n) {
        const a = agents[i];
        _dummy.position.set(a.position[0], a.position[1], a.position[2]);
        if (orient) {
          _vel.set(a.velocity[0], a.velocity[1], a.velocity[2]);
          if (_vel.lengthSq() > 1e-8) {
            _vel.normalize();
            _quat.setFromUnitVectors(_up, _vel);
            _dummy.quaternion.copy(_quat);
          } else {
            _dummy.quaternion.identity();
          }
        } else {
          _dummy.quaternion.identity();
        }
        _dummy.scale.set(1, 1, 1);
      } else {
        _dummy.scale.set(0, 0, 0);
      }
      _dummy.updateMatrix();
      mesh.setMatrixAt(i, _dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={ref}
      args={[geometry, material, count]}
      castShadow
      receiveShadow
    />
  );
}
