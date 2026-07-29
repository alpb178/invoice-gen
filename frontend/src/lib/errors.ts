// src/lib/errors.ts
//
// Traducción de errores a español. Todo lo que se le muestra al usuario pasa
// por aquí, así nunca se filtra un mensaje en inglés del backend (Strapi manda
// cosas como "Invalid identifier or password") ni un error técnico de red.
//
// Los mensajes propios del backend ya vienen en español y se dejan tal cual;
// solo se reemplazan los que se detectan como inglés o técnicos.

export const NETWORK_MESSAGE =
  'No hay conexión con el servidor. Revisa tu internet e inténtalo de nuevo.';
export const GENERIC_MESSAGE = 'Algo salió mal. Inténtalo de nuevo.';
export const SESSION_EXPIRED_MESSAGE = 'Tu sesión ha caducado. Vuelve a iniciar sesión.';

// Mensajes conocidos (comparación en minúsculas y sin puntuación final).
const EXACT: Record<string, string> = {
  // — plugin users-permissions de Strapi (login / registro) —
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

  // — respuestas HTTP genéricas de Strapi (ctx.forbidden() y compañía sin texto) —
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

  // — errores de red del navegador —
  'failed to fetch': NETWORK_MESSAGE,
  'load failed': NETWORK_MESSAGE,
  'network request failed': NETWORK_MESSAGE,
  'the internet connection appears to be offline': NETWORK_MESSAGE,
};

// Nombres de campo que Strapi devuelve en inglés dentro de sus validaciones.
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

// Heurística para no dejar pasar un mensaje en inglés que no esté en el
// diccionario: los mensajes del backend propio están en español (llevan tildes,
// eñes o palabras castellanas frecuentes).
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
 * Traduce un mensaje suelto. `status` se usa como respaldo cuando el texto
 * viene en inglés y no está en el diccionario.
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

  // Español (o algo que no parece inglés): se muestra tal cual.
  if (SPANISH_HINT.test(text) || !ENGLISH_HINT.test(text)) return text;

  // Inglés desconocido o traza técnica: no se le enseña al usuario.
  if (typeof console !== 'undefined') {
    console.debug('[errores] mensaje sin traducción:', text);
  }
  return messageForStatus(status);
}

/** Traduce cualquier cosa que llegue a un `catch` o a un handler global. */
export function translateError(err: unknown, status?: number): string {
  if (err == null) return messageForStatus(status);
  if (typeof err === 'string') return translateMessage(err, status);

  if (err instanceof Error) {
    // Un fetch caído lanza TypeError («Failed to fetch», «Load failed»…).
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

/** Error de API que conserva el código HTTP para poder decidir en el `catch`. */
export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/** ¿Se está sin conexión? Se usa para no culpar al servidor. */
export function isOffline() {
  return typeof navigator !== 'undefined' && navigator.onLine === false;
}
