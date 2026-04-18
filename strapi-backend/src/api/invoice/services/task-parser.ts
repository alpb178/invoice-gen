// src/api/invoice/services/task-parser.ts
// Parser heurístico de tareas a partir de texto plano. Sin dependencias externas.

export interface ParsedTask {
  code?: string;
  description: string;
  amount: number;
  hours?: number;
}

const SKIP_PATTERNS: RegExp[] = [
  /^\s*$/,
  /^n[º°]?$/i,
  /^tarea$/i,
  /^descripci[oó]n$/i,
  /^c[oó]digo$/i,
  /^estimaci[oó]n.*$/i,
  /^precio.*$/i,
  /^monto.*$/i,
  /^horas?$/i,
  /^mes$/i,
  /^done$|^todo$|^in\s*progress$|^ready$|^backlog$/i,
  /^subtotal.*$/i,
  /^total.*$/i,
  /^factura.*$/i,
  /^emitido a favor.*$/i,
  /^iban:?/i,
  /^swift.*$/i,
  /^cif:?/i,
  /^tareas de desarrollo/i,
  /^gastos de/i,
];

const CODE_REGEX = /\b([A-Z]{2,6})[\s\-_]?(\d{2,6})\b/;
const NUMBER_REGEX = /-?\d+(?:[.,]\d+)?/g;

function parseNumber(raw: string): number {
  return parseFloat(raw.replace(/,/g, '.'));
}

function shouldSkip(line: string): boolean {
  const t = line.trim();
  if (!t) return true;
  return SKIP_PATTERNS.some((r) => r.test(t));
}

function stripCommonNoise(line: string): string {
  return line
    .replace(/\bDONE\b|\bTODO\b|\bIN\s*PROGRESS\b|\bREADY\b|\bBACKLOG\b/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

// Pre-procesa líneas huérfanas típicas de extracción de PDF donde una celda
// de tabla aparece repartida en varias líneas:
//   "1" / "Descripción" / "70.00"  ->  "1 Descripción 70.00"
// Reglas conservadoras para no pegar líneas independientes:
//  - si la línea es SOLO un número, se une al buffer (probable celda de monto).
//  - si el buffer es SOLO un número y la línea empieza por letra, se une.
//  - en el resto de casos, flush y empieza un nuevo buffer.
function coalesceOrphanedLines(lines: string[]): string[] {
  const out: string[] = [];
  let buffer = '';

  const flush = () => {
    if (buffer.trim()) out.push(buffer.trim());
    buffer = '';
  };

  const isLoneNumber = (s: string) => /^-?\d+(?:[.,]\d+)?$/.test(s);

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flush();
      continue;
    }

    if (!buffer) {
      buffer = line;
      continue;
    }

    if (isLoneNumber(line)) {
      // Si el buffer ya tiene texto y TERMINA con un número (hemos visto importe),
      // la siguiente línea suelta probablemente sea el índice de la próxima fila.
      const bufferEndsWithNumber = /[A-Za-zÁÉÍÓÚÑáéíóúñ]/.test(buffer) && /\s-?\d+(?:[.,]\d+)?$/.test(buffer);
      if (bufferEndsWithNumber) {
        flush();
        buffer = line;
        continue;
      }
      buffer += ' ' + line;
      continue;
    }

    if (isLoneNumber(buffer) && /^[A-Za-zÁÉÍÓÚÑáéíóúñ]/.test(line)) {
      buffer += ' ' + line;
      continue;
    }

    flush();
    buffer = line;
  }
  flush();
  return out;
}

function parseLine(line: string): ParsedTask | null {
  const cleaned = stripCommonNoise(line);
  if (shouldSkip(cleaned)) return null;

  // captura código TF-123 / TIK-456 / etc.
  const codeMatch = cleaned.match(CODE_REGEX);
  const code = codeMatch ? `${codeMatch[1]}-${codeMatch[2]}` : undefined;

  // extrae todos los números de la línea
  const numbers: { raw: string; index: number; value: number }[] = [];
  let m: RegExpExecArray | null;
  NUMBER_REGEX.lastIndex = 0;
  while ((m = NUMBER_REGEX.exec(cleaned)) !== null) {
    numbers.push({ raw: m[0], index: m.index, value: parseNumber(m[0]) });
  }

  if (numbers.length === 0) return null;

  // descartar un posible índice de fila al inicio: "1 Tarea 70.00"
  const first = numbers[0];
  const startsWithRowIndex =
    first.index <= 3 && /^\d{1,3}$/.test(first.raw) && numbers.length >= 2;
  const amountCandidates = startsWithRowIndex ? numbers.slice(1) : numbers;
  if (amountCandidates.length === 0) return null;

  const last = amountCandidates[amountCandidates.length - 1];
  const amount = last.value;

  // hours: si hay al menos 2 candidatos, el penúltimo
  let hours: number | undefined;
  if (amountCandidates.length >= 2) {
    const penult = amountCandidates[amountCandidates.length - 2];
    // solo si es razonable (<= 500 para no capturar importes grandes)
    if (penult.value > 0 && penult.value < 500) hours = penult.value;
  }

  // build description: quitar código, los números de amount (y opcional hours), y el índice inicial
  let description = cleaned;
  if (code) description = description.replace(CODE_REGEX, '').trim();
  // quitar el último número (amount) de la cadena
  description = description.replace(new RegExp(`${escapeRegex(last.raw)}\\s*(USD|EUR|GBP)?\\s*$`, 'i'), '').trim();
  if (startsWithRowIndex) {
    description = description.replace(new RegExp(`^${escapeRegex(first.raw)}\\s*`), '');
  }
  description = description.replace(/[|·•]+\s*$/, '').trim();
  description = description.replace(/\s{2,}/g, ' ');

  if (!description) return null;
  // descripción "basura" sin letras (solo dígitos/puntuación/espacios)
  if (!/[A-Za-zÁÉÍÓÚÑáéíóúñ]/.test(description)) return null;

  return { code, description, amount, hours };
}

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function parseTasksFromText(raw: string): ParsedTask[] {
  if (!raw) return [];
  const lines = coalesceOrphanedLines(raw.split(/\r?\n/));
  const tasks: ParsedTask[] = [];
  for (const line of lines) {
    const t = parseLine(line);
    if (t) tasks.push(t);
  }
  return tasks;
}
