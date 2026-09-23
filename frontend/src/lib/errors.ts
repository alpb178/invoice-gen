// src/lib/errors.ts
//
// Error translation into Spanish. Everything shown to the user goes through
// here, so an English backend message (Strapi sends things like "Invalid
// identifier or password") or a technical network error never leaks through.
//
// The backend's own messages already come in Spanish and are left as they are;
// only the ones detected as English or technical are replaced.

export const NETWORK_MESSAGE =
  'No hay conexión con el servidor. Revisa tu internet e inténtalo de nuevo.';
export const GENERIC_MESSAGE = 'Algo salió mal. Inténtalo de nuevo.';
export const SESSION_EXPIRED_MESSAGE = 'Tu sesión ha caducado. Vuelve a iniciar sesión.';

// Known messages (compared lowercased and without trailing punctuation).
const EXACT: Record<string, string> = {
  // — Strapi users-permissions plugin (login / sign-up) —
  'invalid identifier or password': 'Email o contraseña incorrectos.',
  'email or username are already taken': 'Ese email ya tiene una cuenta. Inicia sesión.',
  'email already taken': 'Ese email ya tiene una cuenta. Inicia sesión.',
  'username already taken': 'Ese nombre de usuario ya está en uso.',
  'your account email is not confirmed': 'Tu cuenta aún no está confirmada. Revisa tu correo.',
  'your account has been blocked by an administrator':
    'Tu cuenta está bloqueada. Ponte en contacto con soporte.',
  'invalid token': 'El enlace ya no es válido. Pide uno nuevo.',
  'missing or invalid credentials': SESSION_EXPIRED_MESSAGE,
  'identifier or password invalid': 'Email o contraseña incorrectos.',
  'this email does not exist': 'No existe ninguna cuenta con ese email.',
  'incorrect code provided': 'El código no es correcto.',
  'auth.form.error.invalid': 'Email o contraseña incorrectos.',
  'auth.form.error.email.taken': 'Ese email ya tiene una cuenta. Inicia sesión.',

  // — generic Strapi HTTP responses (ctx.forbidden() and friends with no text) —
  unauthorized: SESSION_EXPIRED_MESSAGE,
  forbidden: 'No tienes permisos para hacer esto.',
  'not found': 'No encontramos lo que buscabas.',
  'bad request': 'La solicitud no es válida. Revisa los datos e inténtalo de nuevo.',
  'internal server error': 'El servidor tuvo un problema. Inténtalo de nuevo en unos minutos.',
  'method not allowed': GENERIC_MESSAGE,
  'payload too large': 'El archivo es demasiado grande.',
  'too many requests': 'Demasiados intentos. Espera un momento e inténtalo de nuevo.',
  validationerror: 'Hay datos incorrectos en el formulario. Revísalos e inténtalo de nuevo.',
  'validation error': 'Hay datos incorrectos en el formulario. Revísalos e inténtalo de nuevo.',

  // — browser network errors —
  'failed to fetch': NETWORK_MESSAGE,
  'load failed': NETWORK_MESSAGE,
  'network request failed': NETWORK_MESSAGE,
  'the internet connection appears to be offline': NETWORK_MESSAGE,
};

// Field names Strapi returns in English inside its validation messages.
const FIELDS: Record<string, string> = {
  email: 'el email',
  password: 'la contraseña',
  username: 'el usuario',
  name: 'el nombre',
  identifier: 'el email',
  number: 'el número',
  date: 'la fecha',
  currency: 'la moneda',
  amount: 'el importe',
  description: 'la descripción',
  team: 'el equipo',
  title: 'el título',
};

const field = (raw: string) => FIELDS[raw.toLowerCase()] || `el campo «${raw}»`;

const PATTERNS: Array<[RegExp, (m: RegExpMatchArray) => string]> = [
  [
    /^(\w+) must be at least (\d+) characters?$/i,
    (m) => `${capitalize(field(m[1]))} debe tener al menos ${m[2]} caracteres.`,
  ],
  [
    /^(\w+) must be at most (\d+) characters?$/i,
    (m) => `${capitalize(field(m[1]))} no puede pasar de ${m[2]} caracteres.`,
  ],
  [/^(\w+) is a required field$/i, (m) => `Falta rellenar ${field(m[1])}.`],
  [/^(\w+) must be a valid email$/i, () => 'Introduce un email válido.'],
  [/^(\w+) cannot be empty$/i, (m) => `Falta rellenar ${field(m[1])}.`],
  [/must be unique/i, () => 'Ese valor ya está en uso.'],
  [/^network\b/i, () => NETWORK_MESSAGE],
  [/\bfailed to fetch\b/i, () => NETWORK_MESSAGE],
  [/\btimeout\b|\btimed out\b/i, () => 'El servidor tardó demasiado en responder. Inténtalo de nuevo.'],
];

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// Heuristic so an English message missing from the dictionary does not slip
// through: the backend's own messages are in Spanish (they carry accents, ñ or
// common Spanish words).
const SPANISH_HINT =
  /[áéíóúñü¿¡]|\b(el|la|los|las|de|del|no|que|para|con|una|este|esta|solo|tu|tus|ya|debe|falta|puedes|perteneces|equipo|factura|sección|tarea|invitación|correo|enlace|servidor|inténtalo|revisa)\b/i;
const ENGLISH_HINT =
  /\b(the|is|are|was|be|must|not|your|this|that|invalid|already|required|cannot|does|has|have|failed|error|unexpected|undefined|null|token|forbidden|unauthorized|found|request|server|property|function|object|string|number)\b/i;

export function messageForStatus(status?: number): string {
  if (!status) return GENERIC_MESSAGE;
  if (status === 400) return 'La solicitud no es válida. Revisa los datos e inténtalo de nuevo.';
  if (status === 401) return SESSION_EXPIRED_MESSAGE;
  if (status === 403) return 'No tienes permisos para hacer esto.';
  if (status === 404) return 'No encontramos lo que buscabas.';
  if (status === 409) return 'Ese registro ya existe.';
  if (status === 413) return 'El archivo es demasiado grande.';
  if (status === 429) return 'Demasiados intentos. Espera un momento e inténtalo de nuevo.';
  if (status >= 500) return 'El servidor tuvo un problema. Inténtalo de nuevo en unos minutos.';
  return GENERIC_MESSAGE;
}

/**
 * Translates a single message. `status` is the fallback when the text is in
 * English and not in the dictionary.
 */
export function translateMessage(raw?: string | null, status?: number): string {
  const text = (raw || '').trim();
  if (!text) return messageForStatus(status);

  const key = text.toLowerCase().replace(/[.!]+$/, '');
  if (EXACT[key]) return EXACT[key];

  for (const [re, build] of PATTERNS) {
    const m = text.match(re);
    if (m) return build(m);
  }

  // Spanish (or something that does not look English): shown as is.
  if (SPANISH_HINT.test(text) || !ENGLISH_HINT.test(text)) return text;

  // Unknown English or a technical trace: never shown to the user.
  if (typeof console !== 'undefined') {
    console.debug('[errors] untranslated message:', text);
  }
  return messageForStatus(status);
}

/** Translates anything that reaches a `catch` or a global handler. */
export function translateError(err: unknown, status?: number): string {
  if (err == null) return messageForStatus(status);
  if (typeof err === 'string') return translateMessage(err, status);

  if (err instanceof Error) {
    // A failed fetch throws TypeError ("Failed to fetch", "Load failed"…).
    if (err instanceof TypeError && /fetch|network|load failed/i.test(err.message)) {
      return NETWORK_MESSAGE;
    }
    const withStatus = err as Error & { status?: number };
    return translateMessage(err.message, status ?? withStatus.status);
  }

  const anyErr = err as any;
  if (typeof anyErr?.message === 'string') {
    return translateMessage(anyErr.message, status ?? anyErr?.status);
  }
  if (typeof anyErr?.error?.message === 'string') {
    return translateMessage(anyErr.error.message, status ?? anyErr?.error?.status);
  }
  return messageForStatus(status);
}

/** API error that keeps the HTTP status so the `catch` can decide on it. */
export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/** Are we offline? Used to avoid blaming the server. */
export function isOffline() {
  return typeof navigator !== 'undefined' && navigator.onLine === false;
}
