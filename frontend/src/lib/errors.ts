// src/lib/errors.ts
//
// Error translation into the UI language. Everything shown to the user goes
// through here, so an English backend message (Strapi sends things like
// "Invalid identifier or password") or a technical network error never leaks
// through as is.
//
// The backend's own messages come in Spanish and are passed through untouched
// in every locale (a known limitation: the English UI shows them in Spanish).
// Only the ones detected as English or technical are replaced, with the text of
// the current UI locale.

import type { Locale } from '@/i18n/config';
import { currentLocale } from '@/i18n/client-locale';

type MessageId =
  | 'network'
  | 'generic'
  | 'sessionExpired'
  | 'invalidCredentials'
  | 'emailTaken'
  | 'usernameTaken'
  | 'emailNotConfirmed'
  | 'accountBlocked'
  | 'invalidLink'
  | 'noSuchEmail'
  | 'wrongCode'
  | 'forbidden'
  | 'notFound'
  | 'badRequest'
  | 'serverError'
  | 'fileTooLarge'
  | 'tooManyRequests'
  | 'invalidForm'
  | 'alreadyExists'
  | 'valueTaken'
  | 'invalidEmail'
  | 'timeout';

const TEXT: Record<Locale, Record<MessageId, string>> = {
  es: {
    network: 'No hay conexión con el servidor. Revisa tu internet e inténtalo de nuevo.',
    generic: 'Algo salió mal. Inténtalo de nuevo.',
    sessionExpired: 'Tu sesión ha caducado. Vuelve a iniciar sesión.',
    invalidCredentials: 'Email o contraseña incorrectos.',
    emailTaken: 'Ese email ya tiene una cuenta. Inicia sesión.',
    usernameTaken: 'Ese nombre de usuario ya está en uso.',
    emailNotConfirmed: 'Tu cuenta aún no está confirmada. Revisa tu correo.',
    accountBlocked: 'Tu cuenta está bloqueada. Ponte en contacto con soporte.',
    invalidLink: 'El enlace ya no es válido. Pide uno nuevo.',
    noSuchEmail: 'No existe ninguna cuenta con ese email.',
    wrongCode: 'El código no es correcto.',
    forbidden: 'No tienes permisos para hacer esto.',
    notFound: 'No encontramos lo que buscabas.',
    badRequest: 'La solicitud no es válida. Revisa los datos e inténtalo de nuevo.',
    serverError: 'El servidor tuvo un problema. Inténtalo de nuevo en unos minutos.',
    fileTooLarge: 'El archivo es demasiado grande.',
    tooManyRequests: 'Demasiados intentos. Espera un momento e inténtalo de nuevo.',
    invalidForm: 'Hay datos incorrectos en el formulario. Revísalos e inténtalo de nuevo.',
    alreadyExists: 'Ese registro ya existe.',
    valueTaken: 'Ese valor ya está en uso.',
    invalidEmail: 'Introduce un email válido.',
    timeout: 'El servidor tardó demasiado en responder. Inténtalo de nuevo.',
  },
  en: {
    network: "Can't reach the server. Check your internet connection and try again.",
    generic: 'Something went wrong. Please try again.',
    sessionExpired: 'Your session has expired. Please sign in again.',
    invalidCredentials: 'Incorrect email or password.',
    emailTaken: 'That email already has an account. Sign in instead.',
    usernameTaken: 'That username is already taken.',
    emailNotConfirmed: "Your account isn't confirmed yet. Check your email.",
    accountBlocked: 'Your account is blocked. Please contact support.',
    invalidLink: 'This link is no longer valid. Request a new one.',
    noSuchEmail: 'There is no account with that email.',
    wrongCode: 'That code is not correct.',
    forbidden: "You don't have permission to do this.",
    notFound: "We couldn't find what you were looking for.",
    badRequest: 'The request is not valid. Check the details and try again.',
    serverError: 'The server ran into a problem. Please try again in a few minutes.',
    fileTooLarge: 'The file is too large.',
    tooManyRequests: 'Too many attempts. Wait a moment and try again.',
    invalidForm: 'Some fields in the form are incorrect. Check them and try again.',
    alreadyExists: 'That record already exists.',
    valueTaken: 'That value is already in use.',
    invalidEmail: 'Enter a valid email.',
    timeout: 'The server took too long to respond. Please try again.',
  },
};

const text = (id: MessageId, locale: Locale = currentLocale()) => (TEXT[locale] ?? TEXT.es)[id];

// Stable exports for callers outside React. They resolve the locale when read.
export const networkMessage = (locale?: Locale) => text('network', locale);
export const genericMessage = (locale?: Locale) => text('generic', locale);
export const sessionExpiredMessage = (locale?: Locale) => text('sessionExpired', locale);

// Known messages (compared lowercased and without trailing punctuation). The
// keys are Strapi's own English messages and must stay exactly as Strapi sends
// them.
const EXACT: Record<string, MessageId> = {
  // — Strapi users-permissions plugin (login / sign-up) —
  'invalid identifier or password': 'invalidCredentials',
  'email or username are already taken': 'emailTaken',
  'email already taken': 'emailTaken',
  'username already taken': 'usernameTaken',
  'your account email is not confirmed': 'emailNotConfirmed',
  'your account has been blocked by an administrator': 'accountBlocked',
  'invalid token': 'invalidLink',
  'missing or invalid credentials': 'sessionExpired',
  'identifier or password invalid': 'invalidCredentials',
  'this email does not exist': 'noSuchEmail',
  'incorrect code provided': 'wrongCode',
  'auth.form.error.invalid': 'invalidCredentials',
  'auth.form.error.email.taken': 'emailTaken',

  // — generic Strapi HTTP responses (ctx.forbidden() and friends with no text) —
  unauthorized: 'sessionExpired',
  forbidden: 'forbidden',
  'not found': 'notFound',
  'bad request': 'badRequest',
  'internal server error': 'serverError',
  'method not allowed': 'generic',
  'payload too large': 'fileTooLarge',
  'too many requests': 'tooManyRequests',
  validationerror: 'invalidForm',
  'validation error': 'invalidForm',

  // — browser network errors —
  'failed to fetch': 'network',
  'load failed': 'network',
  'network request failed': 'network',
  'the internet connection appears to be offline': 'network',
};

// Field names Strapi returns in English inside its validation messages.
const FIELDS: Record<Locale, Record<string, string>> = {
  es: {
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
  },
  en: {
    email: 'the email',
    password: 'the password',
    username: 'the username',
    name: 'the name',
    identifier: 'the email',
    number: 'the number',
    date: 'the date',
    currency: 'the currency',
    amount: 'the amount',
    description: 'the description',
    team: 'the team',
    title: 'the title',
  },
};

const field = (raw: string, locale: Locale) =>
  FIELDS[locale][raw.toLowerCase()] || (locale === 'en' ? `the “${raw}” field` : `el campo «${raw}»`);

type Builder = (m: RegExpMatchArray, locale: Locale) => string;

const PATTERNS: Array<[RegExp, Builder]> = [
  [
    /^(\w+) must be at least (\d+) characters?$/i,
    (m, l) =>
      l === 'en'
        ? `${capitalize(field(m[1], l))} must be at least ${m[2]} characters long.`
        : `${capitalize(field(m[1], l))} debe tener al menos ${m[2]} caracteres.`,
  ],
  [
    /^(\w+) must be at most (\d+) characters?$/i,
    (m, l) =>
      l === 'en'
        ? `${capitalize(field(m[1], l))} can't be longer than ${m[2]} characters.`
        : `${capitalize(field(m[1], l))} no puede pasar de ${m[2]} caracteres.`,
  ],
  [
    /^(\w+) is a required field$/i,
    (m, l) => (l === 'en' ? `Please fill in ${field(m[1], l)}.` : `Falta rellenar ${field(m[1], l)}.`),
  ],
  [/^(\w+) must be a valid email$/i, (_m, l) => text('invalidEmail', l)],
  [
    /^(\w+) cannot be empty$/i,
    (m, l) => (l === 'en' ? `Please fill in ${field(m[1], l)}.` : `Falta rellenar ${field(m[1], l)}.`),
  ],
  [/must be unique/i, (_m, l) => text('valueTaken', l)],
  [/^network\b/i, (_m, l) => text('network', l)],
  [/\bfailed to fetch\b/i, (_m, l) => text('network', l)],
  [/\btimeout\b|\btimed out\b/i, (_m, l) => text('timeout', l)],
];

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// Heuristic so an English message missing from the dictionary does not slip
// through: the backend's own messages are in Spanish (they carry accents, ñ or
// common Spanish words).
const SPANISH_HINT =
  /[áéíóúñü¿¡]|\b(el|la|los|las|de|del|no|que|para|con|una|este|esta|solo|tu|tus|ya|debe|falta|puedes|perteneces|equipo|factura|sección|tarea|invitación|correo|enlace|servidor|inténtalo|revisa)\b/i;
const ENGLISH_HINT =
  /\b(the|is|are|was|be|must|not|your|this|that|invalid|already|required|cannot|does|has|have|failed|error|unexpected|undefined|null|token|forbidden|unauthorized|found|request|server|property|function|object|string|number)\b/i;

export function messageForStatus(status?: number, locale: Locale = currentLocale()): string {
  if (!status) return text('generic', locale);
  if (status === 400) return text('badRequest', locale);
  if (status === 401) return text('sessionExpired', locale);
  if (status === 403) return text('forbidden', locale);
  if (status === 404) return text('notFound', locale);
  if (status === 409) return text('alreadyExists', locale);
  if (status === 413) return text('fileTooLarge', locale);
  if (status === 429) return text('tooManyRequests', locale);
  if (status >= 500) return text('serverError', locale);
  return text('generic', locale);
}

/**
 * Translates a single message. `status` is the fallback when the text is in
 * English and not in the dictionary.
 */
export function translateMessage(
  raw?: string | null,
  status?: number,
  locale: Locale = currentLocale(),
): string {
  const input = (raw || '').trim();
  if (!input) return messageForStatus(status, locale);

  const key = input.toLowerCase().replace(/[.!]+$/, '');
  const known = EXACT[key];
  if (known) return text(known, locale);

  for (const [re, build] of PATTERNS) {
    const m = input.match(re);
    if (m) return build(m, locale);
  }

  // Spanish (or something that does not look English): shown as is.
  if (SPANISH_HINT.test(input) || !ENGLISH_HINT.test(input)) return input;

  // Unknown English or a technical trace: never shown to the user.
  if (typeof console !== 'undefined') {
    console.debug('[errors] untranslated message:', input);
  }
  return messageForStatus(status, locale);
}

/** Translates anything that reaches a `catch` or a global handler. */
export function translateError(err: unknown, status?: number): string {
  if (err == null) return messageForStatus(status);
  // Thrown by lib/api.ts and lib/auth.ts, already translated for the UI locale.
  if (err instanceof ApiError) return err.message;
  if (typeof err === 'string') return translateMessage(err, status);

  if (err instanceof Error) {
    // A failed fetch throws TypeError ("Failed to fetch", "Load failed"…).
    if (err instanceof TypeError && /fetch|network|load failed/i.test(err.message)) {
      return networkMessage();
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
