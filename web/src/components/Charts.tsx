'use client';

import { useEffect, useRef, useState } from 'react';

// Dashboard and report charts, with no dependencies. The trend chart
// (`LineChart`) is plain SVG and shares the `ChartFrame` wrapper; the
// breakdown by status (`HBarChart`) is HTML, which for horizontal bars handles
// label flow and truncation on its own.

export const CHART = {
  width: 900,
  height: 230,
};

/** Honours the system's reduced-motion preference. */
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);
  return reduced;
}

/**
 * Flips from false to true on the first frame after mount (or after the data
 * changes): that gives the CSS transition an initial state to animate from.
 * With two rAFs, the browser paints the "at zero" state before starting.
 */
function useEntrance(signature: string, reduced: boolean) {
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    if (reduced) {
      setEntered(true);
      return;
    }
    setEntered(false);
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setEntered(true));
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [signature, reduced]);
  return entered;
}

// Grid and stroke of the trend chart: measured from the design reference
// (#e8e8e9 and #8db636), declared as tokens in globals.css. They go through
// `style` and not an attribute: `stroke="var(--x)"` as an SVG attribute does
// not resolve in every browser, in a CSS declaration it does.
const LINE_GRID = 'var(--chart-grid)';
const LINE_STROKE = 'var(--chart-line)';
const AXIS_TEXT = '#71717a';
const INK = '#18181b';

/**
 * On narrow screens the chart is not squeezed: it scrolls horizontally so
 * the SVG labels stay readable.
 */
export function ChartFrame({
  children,
  overlay,
}: {
  children: React.ReactNode;
  /** HTML layer over the SVG (tooltips). Positioned in % of the SVG area. */
  overlay?: React.ReactNode;
}) {
  return (
    <div className="overflow-x-auto">
      <div className="relative min-w-[520px]">
        <svg viewBox={`0 0 ${CHART.width} ${CHART.height}`} className="w-full h-auto">
          {children}
        </svg>
        {overlay}
      </div>
    </div>
  );
}

interface LineChartProps {
  points: { label: string; value: number }[];
  format: (n: number) => string;
}

// Own padding: without Y-axis labels the chart can breathe across its width.
const LINE_PAD = { top: 24, right: 18, bottom: 34, left: 18 };
const LINE_GRID_LINES = 5;

/**
 * Catmull-Rom converted to Bézier: the curve goes through every point and
 * smooths the segments in between. Control points are clamped to the drawing
 * area because in spiky series the curve overshoots above or below.
 */
function smoothPath(pts: { x: number; y: number }[], minY: number, maxY: number) {
  if (pts.length === 0) return '';
  if (pts.length < 3) {
    return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  }
  const clamp = (v: number) => Math.min(maxY, Math.max(minY, v));
  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = clamp(p1.y + (p2.y - p0.y) / 6);
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = clamp(p2.y - (p3.y - p1.y) / 6);
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

/**
 * Stroke props for each drawing state. Pulled out of the component so a test
 * can pin it down: the order matters and it already broke once.
 *
 *  - Not measured (length 0): nothing to animate and the stroke hidden.
 *  - Measured, not started: the whole stroke offset out of view and WITHOUT a
 *    transition. With a transition here, the jump to the length itself would
 *    animate backwards and the real drawing would start almost at its end.
 *  - Started: target 0 with the transition on, which is what draws the line.
 *  - Reduced motion: final state, no transition.
 */
export function strokeDrawProps(length: number, on: boolean, reduced: boolean) {
  const drawing = length > 0 && !reduced;
  return {
    dashArray: drawing ? length : undefined,
    dashOffset: drawing && !on ? length : 0,
    visible: reduced || length > 0,
    animated: drawing && on,
  };
}

export function LineChart({ points, format }: LineChartProps) {
  const { width, height } = CHART;
  const pad = LINE_PAD;
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const baseline = pad.top + innerH;
  const max = Math.max(1, ...points.map((p) => p.value));
  const step = points.length > 1 ? innerW / (points.length - 1) : innerW;

  const coords = points.map((p, i) => ({
    x: pad.left + step * i,
    y: pad.top + innerH - (p.value / max) * innerH,
    ...p,
  }));
  const path = smoothPath(coords, pad.top, baseline);

  // The stroke is drawn left to right with dashoffset, so its real length is
  // needed, and only the browser knows it. Measuring and starting share one
  // effect on purpose: with two, the stroke could reach `on` before having a
  // length and the drawing would be skipped.
  const pathRef = useRef<SVGPathElement | null>(null);
  const reduced = usePrefersReducedMotion();
  const [draw, setDraw] = useState({ length: 0, on: false });

  useEffect(() => {
    const el = pathRef.current;
    if (!el) return;
    const length = el.getTotalLength();
    if (reduced) {
      setDraw({ length, on: true });
      return;
    }
    setDraw({ length, on: false });
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setDraw({ length, on: true }));
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [path, reduced]);

  const stroke = strokeDrawProps(draw.length, draw.on, reduced);

  // Point under the cursor. Computed from the real width of the hit area, not
  // from viewBox coordinates, so it does not matter at what scale the SVG is
  // being painted.
  const [hover, setHover] = useState<number | null>(null);
  const pickNearest = (clientX: number, target: SVGRectElement) => {
    const box = target.getBoundingClientRect();
    if (box.width === 0 || points.length === 0) return;
    const ratio = Math.min(1, Math.max(0, (clientX - box.left) / box.width));
    setHover(Math.round(ratio * (points.length - 1)));
  };

  const active = hover !== null ? coords[hover] : null;
  // The tooltip is centred over the point, except at the ends, where it would
  // stick out of the card.
  const anchor =
    hover === null
      ? ''
      : hover === 0
        ? 'translate(0, -100%)'
        : hover === points.length - 1
          ? 'translate(-100%, -100%)'
          : 'translate(-50%, -100%)';

  return (
    <ChartFrame
      overlay={
        <>
          {/* Each month's amount only shows on hover, so for screen readers it
              is also rendered as a list. */}
          <ul className="sr-only">
            {points.map((p, i) => (
              <li key={i}>{`${p.label}: ${format(p.value)}`}</li>
            ))}
          </ul>
          {active ? (
          <div
            className="pointer-events-none absolute z-10"
            style={{
              left: `${(active.x / width) * 100}%`,
              top: `${(active.y / height) * 100}%`,
              transform: anchor,
            }}
          >
            <div className="mb-2 whitespace-nowrap rounded-lg bg-paper px-2.5 py-2 shadow-pop">
              <div className="text-xs text-ink-900">{active.label}</div>
              <div className="mt-1 flex items-center gap-2">
                <span
                  aria-hidden
                  className="h-2.5 w-2.5 shrink-0 rounded-sm"
                  style={{ backgroundColor: LINE_STROKE }}
                />
                <span className="text-xs text-ink-500">Total</span>
                <span className="ml-3 font-mono-tight num-dot text-xs font-semibold text-ink-900">
                  {format(active.value)}
                </span>
              </div>
            </div>
          </div>
          ) : null}
        </>
      }
    >
      {Array.from({ length: LINE_GRID_LINES }, (_, i) => {
        const y = pad.top + (innerH / (LINE_GRID_LINES - 1)) * i;
        return (
          <line
            key={i}
            x1={pad.left}
            x2={width - pad.right}
            y1={y}
            y2={y}
            strokeDasharray="3 3"
            style={{ stroke: LINE_GRID }}
          />
        );
      })}

      {path && (
        <path
          ref={pathRef}
          d={path}
          fill="none"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={stroke.dashArray}
          strokeDashoffset={stroke.dashOffset}
          style={{
            stroke: LINE_STROKE,
            visibility: stroke.visible ? 'visible' : 'hidden',
            transition: stroke.animated ? 'stroke-dashoffset 1100ms cubic-bezier(0.2, 0, 0, 1)' : undefined,
          }}
        />
      )}

      {coords.map((c, i) => (
        <text
          key={i}
          x={c.x}
          y={height - 12}
          textAnchor="middle"
          fontSize="12"
          fill={i === hover ? INK : AXIS_TEXT}
        >
          {c.label}
        </text>
      ))}

      {active && (
        <>
          <line
            x1={active.x}
            x2={active.x}
            y1={pad.top}
            y2={baseline}
            strokeDasharray="3 3"
            style={{ stroke: LINE_GRID }}
          />
          {/* Paper-coloured ring so the dot reads against the stroke. */}
          <circle
            cx={active.x}
            cy={active.y}
            r={5}
            strokeWidth={2.5}
            style={{ fill: LINE_STROKE, stroke: 'var(--surface)' }}
          />
        </>
      )}

      {/* Hit area: covers the drawing area and goes last so it sits on top of
          everything else and receives the events. */}
      <rect
        x={pad.left}
        y={pad.top}
        width={innerW}
        height={innerH}
        fill="transparent"
        style={{ pointerEvents: 'all' }}
        onMouseMove={(e) => pickNearest(e.clientX, e.currentTarget)}
        onMouseLeave={() => setHover(null)}
        onTouchStart={(e) => pickNearest(e.touches[0].clientX, e.currentTarget)}
        onTouchMove={(e) => pickNearest(e.touches[0].clientX, e.currentTarget)}
        onTouchEnd={() => setHover(null)}
      />
    </ChartFrame>
  );
}

interface HBarChartProps {
  bars: { key: string; label: string; value: number; color?: string }[];
  format: (n: number) => string;
  /** Adds the share of the total next to the value. */
  showShare?: boolean;
}

/**
 * Horizontal bars for breakdowns with few categories (the four invoice
 * statuses). HTML rather than SVG: labels flow and truncate on their own, and
 * the bar animates with a width transition.
 *
 * Length is relative to the HIGHEST value, not the total: that way the largest
 * category fills the bar and magnitudes compare at a glance. The share of the
 * total goes separately, in the percentage.
 */
export function HBarChart({ bars, format, showShare = false }: HBarChartProps) {
  const max = Math.max(1, ...bars.map((b) => b.value));
  const total = bars.reduce((a, b) => a + b.value, 0);
  const reduced = usePrefersReducedMotion();
  const entered = useEntrance(bars.map((b) => `${b.key}:${b.value}`).join('|'), reduced);

  return (
    <div className="space-y-3">
      {bars.map((b, i) => {
        // A value > 0 never shrinks to an invisible sliver.
        const width = b.value > 0 ? Math.max(2, (b.value / max) * 100) : 0;
        const share = total > 0 ? Math.round((b.value / total) * 100) : 0;
        return (
          <div key={b.key} className="flex items-center gap-3">
            <span className="w-20 sm:w-24 shrink-0 text-xs text-ink-600 truncate">{b.label}</span>
            <div className="relative flex-1 h-2.5 rounded-full bg-ink-100 overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{
                  width: entered ? `${width}%` : '0%',
                  backgroundColor: b.color || INK,
                  transition: 'width 700ms cubic-bezier(0.2, 0, 0, 1)',
                  transitionDelay: `${i * 80}ms`,
                }}
              />
            </div>
            <span className="w-12 shrink-0 text-right font-mono-tight num-dot text-sm text-ink-900">
              {format(b.value)}
            </span>
            {showShare && (
              <span className="w-9 shrink-0 text-right text-xs text-ink-500">{share}%</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
