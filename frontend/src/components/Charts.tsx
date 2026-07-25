'use client';

// Gráficas del panel: SVG plano, sin dependencias. Todas comparten la misma
// geometría para que al apilarse en tarjetas se lean como un conjunto.

export const CHART = {
  width: 900,
  height: 230,
  pad: { top: 22, right: 24, bottom: 40, left: 62 },
};

const AXIS = '#e5e5e7';
const AXIS_TEXT = '#71717a';
const LABEL_TEXT = '#52525b';
const INK = '#18181b';

/**
 * En pantallas estrechas la gráfica no se comprime: se desplaza en horizontal
 * para que las etiquetas del SVG sigan siendo legibles.
 */
export function ChartFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${CHART.width} ${CHART.height}`} className="w-full h-auto min-w-[520px]">
        {children}
      </svg>
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

export function LineChart({ points, format }: LineChartProps) {
  const { width, height, pad } = CHART;
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const max = Math.max(1, ...points.map((p) => p.value));
  const step = points.length > 1 ? innerW / (points.length - 1) : innerW;

  const coords = points.map((p, i) => ({
    x: pad.left + step * i,
    y: pad.top + innerH - (p.value / max) * innerH,
    ...p,
  }));

  const path = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(' ');
  const area =
    coords.length > 0
      ? `${path} L ${coords[coords.length - 1].x} ${pad.top + innerH} L ${coords[0].x} ${pad.top + innerH} Z`
      : '';

  return (
    <ChartFrame>
      <Grid ticks={ticksFor(max, false)} format={format} />
      {area && <path d={area} fill={INK} fillOpacity="0.06" />}
      {path && <path d={path} fill="none" stroke={INK} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />}
      {coords.map((c, i) => (
        <g key={i}>
          <circle cx={c.x} cy={c.y} r={4.5} fill={INK} />
          <text x={c.x} y={height - 12} textAnchor="middle" fontSize="12" fill={LABEL_TEXT}>
            {c.label}
          </text>
        </g>
      ))}
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

  return (
    <ChartFrame>
      <Grid ticks={ticksFor(max, integer)} format={format} />
      {bars.map((b, i) => {
        const cx = pad.left + step * (i + 0.5);
        // Altura mínima para que un valor en cero siga siendo visible.
        const h = Math.max(3, (b.value / max) * innerH);
        return (
          <g key={b.key}>
            <rect x={cx - barW / 2} y={baseline - h} width={barW} height={h} rx={2} fill={b.color || INK} />
            {showValues && (
              <text x={cx} y={baseline - h - 8} textAnchor="middle" fontSize="12" fontWeight="600" fill={INK}>
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
