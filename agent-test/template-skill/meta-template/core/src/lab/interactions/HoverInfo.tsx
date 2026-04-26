import { useState, type ReactNode } from 'react';
import { Html } from '@react-three/drei';

/**
 * Wraps children with a small DOM tooltip that follows the mesh while
 * the pointer hovers it. Useful for labelling instruments and showing
 * live measurement values without cluttering the 3D scene.
 *
 * KEEP — agent-written code passes a `label` and (optionally) a
 * dynamic `value` to surface measurement context.
 */
export interface HoverInfoProps {
  children: ReactNode;
  /** Static label, e.g. instrument name. */
  label: string;
  /** Optional live value, e.g. "1.50 m". */
  value?: string;
  /** Vertical offset of the tooltip in scene units. Default 0.18. */
  offsetY?: number;
}

export function HoverInfo({
  children,
  label,
  value,
  offsetY = 0.18,
}: HoverInfoProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <group
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      {children}
      {hovered && (
        <Html
          position={[0, offsetY, 0]}
          center
          distanceFactor={6}
          zIndexRange={[100, 0]}
          style={{ pointerEvents: 'none' }}
        >
          <div
            style={{
              background: 'rgba(15, 18, 28, 0.92)',
              border: '1px solid #30363d',
              color: '#e6edf3',
              padding: '4px 9px',
              borderRadius: 4,
              fontSize: 11,
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              whiteSpace: 'nowrap',
              userSelect: 'none',
            }}
          >
            <div style={{ color: '#9aa7b2' }}>{label}</div>
            {value && (
              <div style={{ color: '#7ee787', fontWeight: 600 }}>{value}</div>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}
