// src/utils/theme.js
export const COLORS = {
  bg: '#0a0a0f',
  surface: '#12121a',
  card: '#16161f',
  border: '#1e1e2a',
  accent: '#10b981',
  text: '#e4e4e7',
  textDim: '#a1a1aa',
  textMuted: '#71717a',
  textFaint: '#52525b',
  red: '#ef4444',
  yellow: '#eab308',
  blue: '#3b82f6',
  inputBg: '#0f0f17',
};

export const STATUS_COLORS = {
  draft: { bg: 'rgba(234,179,8,0.1)', text: '#eab308' },
  sent: { bg: 'rgba(59,130,246,0.1)', text: '#3b82f6' },
  paid: { bg: 'rgba(16,185,129,0.1)', text: '#10b981' },
  cancelled: { bg: 'rgba(239,68,68,0.1)', text: '#ef4444' },
};

export const STATUS_LABELS = {
  draft: 'Borrador',
  sent: 'Enviada',
  paid: 'Pagada',
  cancelled: 'Cancelada',
};

export const formatMoney = (n, currency = 'USD') => {
  return `$${(n || 0).toFixed(2)} ${currency}`;
};
