import { type ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import simConfig from '../../simConfig.json';
import { useLabStore } from '../interactions/labStore';

const SHADOWS_ENABLED = simConfig.renderConfig.shadows.value;
const ANTIALIAS_ENABLED = simConfig.renderConfig.antialias.value;
const SHOW_GRID = simConfig.debugConfig.showGrid.value;
const SHOW_AXES = simConfig.debugConfig.showAxes.value;

const DESK_WIDTH = 4; // metres
const DESK_DEPTH = 2.4;
const DESK_THICKNESS = 0.08;
const DESK_HEIGHT_FROM_FLOOR = 0; // top surface at y = 0 by convention
const FLOOR_OFFSET = -1.0; // floor sits well below the desk so OrbitControls feel right

/**
 * Standard 3D environment for every OpenSim simulation.
 *
 * Renders a wooden lab workbench centred at origin, ceiling spotlight
 * + soft ambient fill, a contact-shadow puddle under the desk, and an
 * OrbitControls camera that lets the user inspect anything the agent
 * places on the desktop. Children passed in are mounted in a group
 * sitting on the desk surface (y = 0), so a `<Pendulum />` or
 * `<Beaker />` need not worry about the room's coordinate system —
 * just place themselves relative to the desktop.
 *
 * KEEP — never modify this file from inside an agent run. To customise
 * a simulation, mount this component from `App.tsx` and pass the
 * archetype-specific scene graph as children.
 */
export interface BaseLabSceneProps {
  /** Lab objects + instruments rendered on top of the desk surface (y=0). */
  children?: ReactNode;
  /** Optional override for the desk colour (sandalwood by default). */
  deskColor?: string;
  /** Optional override for the floor colour (slate by default). */
  floorColor?: string;
}

export function BaseLabScene({
  children,
  deskColor = '#8b6f4e',
  floorColor = '#1a1a26',
}: BaseLabSceneProps) {
  // Disable OrbitControls while any instrument is being dragged or
  // pressed, so the camera doesn't spin when the user is trying to
  // rotate a Dial. DragRotate / ClickPress maintain the counter.
  const orbitEnabled = !useLabStore((s) => s.isInstrumentActive);
  return (
    <Canvas
      shadows={SHADOWS_ENABLED}
      gl={{ antialias: ANTIALIAS_ENABLED }}
      camera={{
        position: [3.2, 2.4, 4.2],
        fov: 45,
        near: 0.1,
        far: 100,
      }}
      style={{ width: '100vw', height: '100vh' }}
    >
      {/* --- Lighting --- */}
      <color attach="background" args={['#0a0a14']} />
      <ambientLight intensity={0.35} />
      <hemisphereLight args={['#dfe7ff', '#1a1a26', 0.4]} />
      <directionalLight
        position={[3, 6, 4]}
        intensity={1.1}
        castShadow={SHADOWS_ENABLED}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.5}
        shadow-camera-far={20}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
      />
      <spotLight
        position={[0, 5, 0]}
        angle={0.6}
        penumbra={0.6}
        intensity={0.8}
        castShadow={SHADOWS_ENABLED}
        target-position={[0, 0, 0]}
      />

      {/* --- Floor --- */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, FLOOR_OFFSET, 0]}
        receiveShadow={SHADOWS_ENABLED}
      >
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color={floorColor} roughness={0.95} />
      </mesh>

      {/* --- Desk (workbench) --- */}
      <group position={[0, DESK_HEIGHT_FROM_FLOOR - DESK_THICKNESS / 2, 0]}>
        <mesh castShadow={SHADOWS_ENABLED} receiveShadow={SHADOWS_ENABLED}>
          <boxGeometry args={[DESK_WIDTH, DESK_THICKNESS, DESK_DEPTH]} />
          <meshStandardMaterial
            color={deskColor}
            roughness={0.6}
            metalness={0.05}
          />
        </mesh>
        {/* Four legs — kept simple, just enough to look like a real desk */}
        {[
          [DESK_WIDTH / 2 - 0.1, DESK_DEPTH / 2 - 0.1],
          [-DESK_WIDTH / 2 + 0.1, DESK_DEPTH / 2 - 0.1],
          [DESK_WIDTH / 2 - 0.1, -DESK_DEPTH / 2 + 0.1],
          [-DESK_WIDTH / 2 + 0.1, -DESK_DEPTH / 2 + 0.1],
        ].map(([x, z], i) => (
          <mesh
            key={i}
            position={[x, -(Math.abs(FLOOR_OFFSET) - DESK_THICKNESS) / 2, z]}
            castShadow={SHADOWS_ENABLED}
          >
            <boxGeometry
              args={[
                0.08,
                Math.abs(FLOOR_OFFSET) - DESK_THICKNESS,
                0.08,
              ]}
            />
            <meshStandardMaterial color={deskColor} roughness={0.7} />
          </mesh>
        ))}
      </group>

      {/* Soft contact shadow under everything on the desk */}
      <ContactShadows
        position={[0, 0.001, 0]}
        opacity={0.45}
        scale={DESK_WIDTH}
        blur={2}
        far={1.2}
      />

      {/* --- Optional debug helpers --- */}
      {SHOW_GRID && (
        <gridHelper args={[DESK_WIDTH, 16, '#5b6779', '#34384a']} />
      )}
      {SHOW_AXES && <axesHelper args={[1]} />}

      {/* --- User content (lab_objects, instruments, visualization) --- */}
      <group position={[0, 0, 0]}>{children}</group>

      {/* --- Camera controls (auto-paused during instrument drags) --- */}
      <OrbitControls
        enabled={orbitEnabled}
        enablePan
        enableZoom
        enableRotate
        target={[0, 0.4, 0]}
        minDistance={2}
        maxDistance={12}
        minPolarAngle={0.1}
        maxPolarAngle={Math.PI / 2 - 0.05}
      />
    </Canvas>
  );
}
