import { useCallback, useEffect, useRef, useState } from 'react';
import { useThree, type ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { useLabStore } from '../lab/interactions/labStore';

/**
 * Drag-on-plane hook — pick up a 3D object and drag it across an invisible
 * horizontal plane at world y = `planeY`. The pointer's screen position is
 * raycast onto the plane to give a clean world-space (x, z) cursor location.
 *
 * Returns:
 *   - `bind.onPointerDown` — attach to the draggable mesh's onPointerDown.
 *   - `isDragging` — whether currently being dragged.
 *   - `dragOffset` — Vector3 offset from the mesh's home position.
 *
 * While dragging, OrbitControls is disabled via the lab store so the
 * camera doesn't spin underneath the user's cursor.
 */
export function useDragOnPlane({
  planeY = 0.3,
  enabled = true,
  homePosition,
  onDrop,
}: {
  planeY?: number;
  enabled?: boolean;
  homePosition: [number, number, number];
  onDrop?: (worldPosition: THREE.Vector3) => void;
}) {
  const { camera, gl } = useThree();
  const beginInteraction = useLabStore((s) => s.beginInstrumentInteraction);
  const endInteraction = useLabStore((s) => s.endInstrumentInteraction);

  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<THREE.Vector3>(
    new THREE.Vector3(0, 0, 0),
  );
  const startWorldRef = useRef(new THREE.Vector3());
  const planeRef = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), -planeY));
  const raycasterRef = useRef(new THREE.Raycaster());

  useEffect(() => {
    planeRef.current.set(new THREE.Vector3(0, 1, 0), -planeY);
  }, [planeY]);

  const computeWorld = useCallback(
    (clientX: number, clientY: number): THREE.Vector3 | null => {
      const canvas = gl.domElement;
      const rect = canvas.getBoundingClientRect();
      const ndcX = ((clientX - rect.left) / rect.width) * 2 - 1;
      const ndcY = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycasterRef.current.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera);
      const hit = new THREE.Vector3();
      const intersected = raycasterRef.current.ray.intersectPlane(
        planeRef.current,
        hit,
      );
      return intersected ? hit : null;
    },
    [camera, gl],
  );

  useEffect(() => {
    if (!isDragging) return;
    const canvas = gl.domElement;

    const onMove = (e: PointerEvent) => {
      const w = computeWorld(e.clientX, e.clientY);
      if (!w) return;
      const offset = w.clone().sub(startWorldRef.current);
      offset.y = 0;
      setDragOffset(offset);
    };

    const finish = (e: PointerEvent) => {
      const w = computeWorld(e.clientX, e.clientY);
      const dropAt = w
        ? new THREE.Vector3(
            homePosition[0] + (w.x - startWorldRef.current.x),
            homePosition[1],
            homePosition[2] + (w.z - startWorldRef.current.z),
          )
        : new THREE.Vector3(...homePosition);
      setIsDragging(false);
      setDragOffset(new THREE.Vector3(0, 0, 0));
      endInteraction();
      if (onDrop) onDrop(dropAt);
    };

    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', finish);
    canvas.addEventListener('pointercancel', finish);
    return () => {
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', finish);
      canvas.removeEventListener('pointercancel', finish);
    };
  }, [isDragging, gl, computeWorld, homePosition, onDrop, endInteraction]);

  return {
    bind: {
      onPointerDown: (e: ThreeEvent<PointerEvent>) => {
        if (!enabled) return;
        e.stopPropagation();
        const w = computeWorld(e.nativeEvent.clientX, e.nativeEvent.clientY);
        if (!w) return;
        startWorldRef.current.copy(w);
        setDragOffset(new THREE.Vector3(0, 0, 0));
        setIsDragging(true);
        beginInteraction();
      },
    },
    isDragging,
    dragOffset,
  };
}
