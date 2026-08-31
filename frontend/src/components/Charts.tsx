'use client';

import { useEffect, useRef, useState } from 'react';

// Gráficas del panel: SVG plano, sin dependencias. Todas comparten la misma
// geometría para que al apilarse en tarjetas se lean como un conjunto.

export const CHART = {
  width: 900,
  height: 230,
  pad: { top: 22, right: 24, bottom: 40, left: 62 },
};

/** Respeta la preferencia del sistema de reducir el movimiento. */
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
 * Pasa de false a true en el primer frame tras montar (o tras cambiar los
 * datos): así la transición CSS tiene un estado inicial que animar. Con dos
 * rAF, el navegador pinta el estado "en cero" antes de arrancar.
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

const AXIS = '#e5e5e7';
// Rejilla y trazo de la gráfica de tendencia: medidos sobre la referencia de
// diseño (#e8e8e9 y #8db636), declarados como tokens en globals.css. Van por
// `style` y no por atributo: `stroke="var(--x)"` como atributo SVG no resuelve
// en todos los navegadores, en una declaración CSS sí.
const LINE_GRID = 'var(--chart-grid)';
const LINE_STROKE = 'var(--chart-line)';
const AXIS_TEXT = '#71717a';
const LABEL_TEXT = '#52525b';
const INK = '#18181b';

/**
 * En pantallas estrechas la gráfica no se comprime: se desplaza en horizontal
 * para que las etiquetas del SVG sigan siendo legibles.
 */
export function ChartFrame({
  children,
  overlay,
}: {
  children: React.ReactNode;
  /** Capa HTML sobre el SVG (tooltips). Se posiciona en % del área del SVG. */
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

function Grid({ ticks, format }: { ticks: number[]; format: (n: number) => string }) {
  const { width, height, pad } = CHART;
  const innerH = height - pad.top - pad.bottom;
  const baseline = pad.top + innerH;
  const max = Math.max(1, ...ticks);

  return (
    <>
      {ticks.map((value, i) => {
        const y = baseline - (value / max) * innerH;
        return (
          <g key={i}>
            <line x1={pad.left} x2={width - pad.right} y1={y} y2={y} stroke={AXIS} strokeDasharray="3 3" />
            <text x={pad.left - 8} y={y + 4} textAnchor="end" fontSize="11" fill={AXIS_TEXT}>
              {format(value)}
            </text>
          </g>
        );
      })}
    </>
  );
}

/** Escala de tres marcas; en modo entero evita ejes tipo 0 / 0,5 / 1. */
function ticksFor(max: number, integer: boolean) {
  const raw = [0, max / 2, max];
  const vals = integer ? raw.map((v) => Math.round(v)) : raw;
  return Array.from(new Set(vals));
}

interface LineChartProps {
  points: { label: string; value: number }[];
  format: (n: number) => string;
}

// Padding propio: sin etiquetas de eje Y la gráfica respira a lo ancho.
const LINE_PAD = { top: 24, right: 18, bottom: 34, left: 18 };
const LINE_GRID_LINES = 5;

/**
 * Catmull-Rom convertido a Bézier: la curva pasa por todos los puntos y suaviza
 * los tramos intermedios. Los puntos de control se recortan al área de dibujo
 * porque en series con picos la curva se sale por arriba o por abajo.
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

  // El trazo se dibuja de izquierda a derecha con dashoffset, así que hace falta
  // su longitud real, que solo sabe el navegador. Medir y arrancar van en el
  // mismo efecto a propósito: si fueran dos, el trazo podría llegar a `on`
  // antes de tener longitud y el dibujado se saltaría.
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

  // Mientras no está medido el trazo se oculta: si no, se vería la línea
  // completa un fotograma y después empezaría a dibujarse.
  const drawing = draw.length > 0 && !reduced;

  // Punto bajo el cursor. Se calcula con el ancho real de la zona sensible, no
  // con las coordenadas del viewBox, así da igual a qué escala se esté pintando
  // el SVG.
  const [hover, setHover] = useState<number | null>(null);
  const pickNearest = (clientX: number, target: SVGRectElement) => {
    const box = target.getBoundingClientRect();
    if (box.width === 0 || points.length === 0) return;
    const ratio = Math.min(1, Math.max(0, (clientX - box.left) / box.width));
    setHover(Math.round(ratio * (points.length - 1)));
  };

  const active = hover !== null ? coords[hover] : null;
  // El tooltip se centra sobre el punto, salvo en los extremos, donde se
  // alinearía fuera de la tarjeta.
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
          {/* El importe de cada mes solo aparece al pasar el cursor, así que
              para lectores de pantalla va también como lista. */}
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
          strokeDasharray={drawing ? draw.length : undefined}
          strokeDashoffset={drawing && !draw.on ? draw.length : 0}
          style={{
            stroke: LINE_STROKE,
            visibility: reduced || draw.length > 0 ? 'visible' : 'hidden',
            transition: drawing ? 'stroke-dashoffset 1100ms cubic-bezier(0.2, 0, 0, 1)' : undefined,
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
          {/* Aro del color del papel para que el punto se lea sobre el trazo. */}
          <circle
            cx={active.x}
            cy={active.y}
            r={5}
            strokeWidth={2.5}
            style={{ fill: LINE_STROKE, stroke: 'var(--surface)' }}
          />
        </>
      )}

      {/* Zona sensible: cubre el área de dibujo y va al final para quedar
          por encima del resto y recibir los eventos. */}
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

interface BarChartProps {
  bars: { key: string; label: string; value: number; color?: string }[];
  format: (n: number) => string;
  /** Marcas del eje redondeadas a entero (conteos). */
  integer?: boolean;
  /** Oculta la cifra sobre cada barra cuando estorba (muchas barras). */
  showValues?: boolean;
}

export function BarChart({ bars, format, integer = false, showValues = true }: BarChartProps) {
  const { width, height, pad } = CHART;
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const baseline = pad.top + innerH;
  const max = Math.max(1, ...bars.map((b) => b.value));
  const step = bars.length > 0 ? innerW / bars.length : innerW;
  const barW = Math.min(72, step * 0.45);

  const reduced = usePrefersReducedMotion();
  const entered = useEntrance(bars.map((b) => `${b.key}:${b.value}`).join('|'), reduced);

  return (
    <ChartFrame>
      <Grid ticks={ticksFor(max, integer)} format={format} />
      {bars.map((b, i) => {
        const cx = pad.left + step * (i + 0.5);
        // Altura mínima para que un valor en cero siga siendo visible.
        const h = Math.max(3, (b.value / max) * innerH);
        return (
          <g key={b.key}>
            {/* Crece desde su borde inferior: la barra "sube" hasta su importe
                al abrir la página. */}
            <rect
              x={cx - barW / 2}
              y={baseline - h}
              width={barW}
              height={h}
              rx={2}
              fill={b.color || INK}
              style={{
                transform: entered ? 'scaleY(1)' : 'scaleY(0)',
                // fill-box + bottom: el origen es el borde inferior de la propia
                // barra, sin depender de las coordenadas del viewBox.
                transformBox: 'fill-box',
                transformOrigin: 'bottom',
                transition: 'transform 700ms cubic-bezier(0.2, 0, 0, 1)',
                transitionDelay: `${i * 60}ms`,
              }}
            />
            {showValues && (
              <text
                x={cx}
                y={baseline - h - 8}
                textAnchor="middle"
                fontSize="12"
                fontWeight="600"
                fill={INK}
                style={{
                  opacity: entered ? 1 : 0,
                  transition: 'opacity 400ms ease-out',
                  transitionDelay: `${i * 60 + 260}ms`,
                }}
              >
                {format(b.value)}
              </text>
            )}
            <text x={cx} y={height - 12} textAnchor="middle" fontSize="12" fill={LABEL_TEXT}>
              {b.label}
            </text>
          </g>
        );
      })}
    </ChartFrame>
  );
}

interface HBarChartProps {
  bars: { key: string; label: string; value: number; color?: string }[];
  format: (n: number) => string;
  /** Añade el porcentaje sobre el total junto al valor. */
  showShare?: boolean;
}

/**
 * Barras horizontales para repartos con pocas categorías (los cuatro estados de
 * la factura). En HTML y no en SVG: las etiquetas fluyen y truncan solas, y la
 * barra se anima con una transición de ancho.
 *
 * La longitud es relativa al valor MÁS ALTO, no al total: así la categoría
 * mayor llena la barra y se comparan magnitudes de un vistazo. El peso sobre el
 * total va aparte, en el porcentaje.
 */
export function HBarChart({ bars, format, showShare = false }: HBarChartProps) {
  const max = Math.max(1, ...bars.map((b) => b.value));
  const total = bars.reduce((a, b) => a + b.value, 0);
  const reduced = usePrefersReducedMotion();
  const entered = useEntrance(bars.map((b) => `${b.key}:${b.value}`).join('|'), reduced);

  return (
    <div className="space-y-3">
      {bars.map((b, i) => {
        // Un valor > 0 nunca se queda en un hilo invisible.
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
