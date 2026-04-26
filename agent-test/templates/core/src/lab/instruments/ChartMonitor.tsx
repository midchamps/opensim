import { useMemo, useRef, useEffect } from 'react';
import { CanvasTexture, LinearFilter } from 'three';
import { Text } from '@react-three/drei';

/**
 * Wall-mounted chart screen. Takes a flat array of (x, y) data points
 * and renders them as a line plot on a 2D canvas, then maps that
 * canvas as a texture onto a flat plane mesh — giving the impression
 * of a CRT/LCD display hanging on the lab wall.
 *
 * Phase 2.3 implements a minimal time-series renderer (auto-scaling
 * Y, optional fixed X range). Phase 4 will reuse this for the
 * pendulum-angle plot. A fancier Plotly-canvas integration can drop
 * in here later without changing the prop surface.
 *
 * KEEP — agent-written simulations push fresh `data` each frame from
 * the BaseSolver's Observable history.
 */
export interface ChartMonitorProps {
  /** Title displayed at the top of the screen, e.g. "ANGLE vs TIME". */
  title: string;
  /** X-axis label, e.g. "t (s)". */
  xLabel?: string;
  /** Y-axis label, e.g. "θ (rad)". */
  yLabel?: string;
  /** Data points. The order is the order they're connected. */
  data: Array<{ x: number; y: number }>;
  /** Force a fixed X range; otherwise inferred from data. */
  xRange?: [number, number];
  /** Force a fixed Y range; otherwise inferred from data with 10% padding. */
  yRange?: [number, number];
  /** World position [x, y, z]. */
  position?: [number, number, number];
  /** Y rotation in radians (face the user). Default 0. */
  rotationY?: number;
  /** Width × height of the screen, in metres. Default 0.8 × 0.5. */
  size?: [number, number];
  /** Line colour on the LCD. Default green. */
  lineColor?: string;
}

const PIXELS_PER_METRE = 1024;

export function ChartMonitor({
  title,
  xLabel,
  yLabel,
  data,
  xRange,
  yRange,
  position = [0, 0, 0],
  rotationY = 0,
  size = [0.8, 0.5],
  lineColor = '#7ee787',
}: ChartMonitorProps) {
  const [width, height] = size;
  const pxW = Math.round(width * PIXELS_PER_METRE);
  const pxH = Math.round(height * PIXELS_PER_METRE);

  // Stable canvas + texture across renders. Width/height changes do
  // recreate the canvas (rare in practice).
  const { canvas, texture } = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = pxW;
    c.height = pxH;
    const t = new CanvasTexture(c);
    t.minFilter = LinearFilter;
    t.magFilter = LinearFilter;
    return { canvas: c, texture: t };
  }, [pxW, pxH]);

  // Clean up the texture on unmount to avoid GPU leaks.
  useEffect(() => () => texture.dispose(), [texture]);

  const dataRef = useRef(data);
  dataRef.current = data;

  // Re-render the canvas every time data, ranges, or labels change.
  useEffect(() => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const padL = 56;
    const padR = 16;
    const padT = 64;
    const padB = 48;
    const plotW = pxW - padL - padR;
    const plotH = pxH - padT - padB;

    // Background (LCD green-black)
    ctx.fillStyle = '#06241a';
    ctx.fillRect(0, 0, pxW, pxH);
    ctx.fillStyle = '#0a3d2a';
    ctx.fillRect(padL, padT, plotW, plotH);

    // Title bar
    ctx.fillStyle = '#5fdca0';
    ctx.font = 'bold 22px "Share Tech Mono", monospace';
    ctx.textBaseline = 'top';
    ctx.fillText(title, padL, 18);

    // Axis labels
    ctx.fillStyle = '#5fdca0';
    ctx.font = '14px "Share Tech Mono", monospace';
    if (xLabel) {
      ctx.textAlign = 'right';
      ctx.fillText(xLabel, pxW - padR - 4, pxH - padB + 8);
    }
    if (yLabel) {
      ctx.save();
      ctx.translate(20, padT + plotH / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.textAlign = 'center';
      ctx.fillText(yLabel, 0, 0);
      ctx.restore();
    }
    ctx.textAlign = 'left';

    if (data.length === 0) {
      ctx.fillStyle = '#3a8a6a';
      ctx.font = '16px "Share Tech Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('— no data —', padL + plotW / 2, padT + plotH / 2);
      texture.needsUpdate = true;
      return;
    }

    // Compute bounds
    let xMin: number;
    let xMax: number;
    let yMin: number;
    let yMax: number;
    if (xRange) {
      [xMin, xMax] = xRange;
    } else {
      xMin = data[0].x;
      xMax = data[0].x;
      for (const p of data) {
        if (p.x < xMin) xMin = p.x;
        if (p.x > xMax) xMax = p.x;
      }
    }
    if (yRange) {
      [yMin, yMax] = yRange;
    } else {
      yMin = data[0].y;
      yMax = data[0].y;
      for (const p of data) {
        if (p.y < yMin) yMin = p.y;
        if (p.y > yMax) yMax = p.y;
      }
      const pad = (yMax - yMin) * 0.1 || 1;
      yMin -= pad;
      yMax += pad;
    }
    const xSpan = xMax - xMin || 1;
    const ySpan = yMax - yMin || 1;

    // Grid
    ctx.strokeStyle = 'rgba(95, 220, 160, 0.15)';
    ctx.lineWidth = 1;
    for (let i = 1; i < 4; i++) {
      const yy = padT + (plotH * i) / 4;
      ctx.beginPath();
      ctx.moveTo(padL, yy);
      ctx.lineTo(padL + plotW, yy);
      ctx.stroke();
    }
    for (let i = 1; i < 6; i++) {
      const xx = padL + (plotW * i) / 6;
      ctx.beginPath();
      ctx.moveTo(xx, padT);
      ctx.lineTo(xx, padT + plotH);
      ctx.stroke();
    }

    // Zero line if 0 in range
    if (yMin < 0 && yMax > 0) {
      const zeroY = padT + plotH - ((0 - yMin) / ySpan) * plotH;
      ctx.strokeStyle = 'rgba(95, 220, 160, 0.4)';
      ctx.beginPath();
      ctx.moveTo(padL, zeroY);
      ctx.lineTo(padL + plotW, zeroY);
      ctx.stroke();
    }

    // Trace
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i < data.length; i++) {
      const p = data[i];
      const px = padL + ((p.x - xMin) / xSpan) * plotW;
      const py = padT + plotH - ((p.y - yMin) / ySpan) * plotH;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Y bounds labels
    ctx.fillStyle = '#5fdca0';
    ctx.font = '13px "Share Tech Mono", monospace';
    ctx.textAlign = 'right';
    ctx.fillText(yMax.toFixed(2), padL - 6, padT + 8);
    ctx.fillText(yMin.toFixed(2), padL - 6, padT + plotH - 8);
    ctx.textAlign = 'left';

    texture.needsUpdate = true;
  }, [
    canvas,
    texture,
    pxW,
    pxH,
    data,
    title,
    xLabel,
    yLabel,
    xRange,
    yRange,
    lineColor,
  ]);

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Frame */}
      <mesh position={[0, height / 2, -0.01]} castShadow receiveShadow>
        <boxGeometry args={[width + 0.04, height + 0.04, 0.02]} />
        <meshStandardMaterial color="#1c2330" roughness={0.6} />
      </mesh>
      {/* Screen */}
      <mesh position={[0, height / 2, 0.001]}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
      {/* Title fallback (in case the canvas font doesn't load) */}
      {data.length === 0 && (
        <Text
          position={[0, height + 0.04, 0.005]}
          fontSize={0.022}
          color="#5fdca0"
          anchorX="center"
        >
          {title}
        </Text>
      )}
    </group>
  );
}
