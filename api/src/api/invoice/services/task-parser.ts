// src/api/invoice/services/task-parser.ts
// Heuristic task parser for plain text. No external dependencies.

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

// Pre-processes orphan lines typical of PDF text extraction, where a table
// cell ends up split across several lines:
//   "1" / "Descripción" / "70.00"  ->  "1 Descripción 70.00"
// Conservative rules so independent lines are not glued together:
//  - if the line is ONLY a number, it joins the buffer (likely an amount cell).
//  - if the buffer is ONLY a number and the line starts with a letter, it joins.
//  - otherwise, flush and start a new buffer.
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
      // If the buffer already has text and ENDS with a number (we saw an amount),
      // the next loose line is probably the index of the next row.
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

  // capture a code like TF-123 / TIK-456 / etc.
  const codeMatch = cleaned.match(CODE_REGEX);
  const code = codeMatch ? `${codeMatch[1]}-${codeMatch[2]}` : undefined;

  // extract every number on the line
  const numbers: { raw: string; index: number; value: number }[] = [];
  let m: RegExpExecArray | null;
  NUMBER_REGEX.lastIndex = 0;
  while ((m = NUMBER_REGEX.exec(cleaned)) !== null) {
    numbers.push({ raw: m[0], index: m.index, value: parseNumber(m[0]) });
  }

  if (numbers.length === 0) return null;

  // drop a possible leading row index: "1 Tarea 70.00"
  const first = numbers[0];
  const startsWithRowIndex =
    first.index <= 3 && /^\d{1,3}$/.test(first.raw) && numbers.length >= 2;
  const amountCandidates = startsWithRowIndex ? numbers.slice(1) : numbers;
  if (amountCandidates.length === 0) return null;

  const last = amountCandidates[amountCandidates.length - 1];
  const amount = last.value;

  // hours: if there are at least 2 candidates, the second to last
  let hours: number | undefined;
  if (amountCandidates.length >= 2) {
    const penult = amountCandidates[amountCandidates.length - 2];
    // only if it is reasonable (<= 500, so large amounts are not captured)
    if (penult.value > 0 && penult.value < 500) hours = penult.value;
  }

  // build description: strip the code, the amount number (and optional hours), and the leading index
  let description = cleaned;
  if (code) description = description.replace(CODE_REGEX, '').trim();
  // strip the last number (amount) from the string
  description = description.replace(new RegExp(`${escapeRegex(last.raw)}\\s*(USD|EUR|GBP)?\\s*$`, 'i'), '').trim();
  if (startsWithRowIndex) {
    description = description.replace(new RegExp(`^${escapeRegex(first.raw)}\\s*`), '');
  }
  description = description.replace(/[|·•]+\s*$/, '').trim();
  description = description.replace(/\s{2,}/g, ' ');

  if (!description) return null;
  // "junk" description with no letters (only digits/punctuation/spaces)
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
