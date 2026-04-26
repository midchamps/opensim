/**
 * Root React component for an OpenSim simulation.
 *
 * Phase 1 Commit 1 — this is intentionally a minimal stub. Commit 3 will
 * replace the body with `<BaseLabScene>` from `lab/scenes/`, which mounts
 * a react-three-fiber Canvas containing the workbench, lighting, and
 * OrbitControls camera. For now we just verify the React + r3f deps
 * compile and the page loads.
 */
export function App() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        textAlign: 'center',
        fontFamily: 'inherit',
      }}
    >
      <div>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>OpenSim</h1>
        <p style={{ color: '#9aa7b2' }}>
          Lab scene not yet implemented. Phase 1 Commit 3 wires the workbench.
        </p>
      </div>
    </div>
  );
}
