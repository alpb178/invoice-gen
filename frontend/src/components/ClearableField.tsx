// src/components/ClearableField.tsx
'use client';

import { useTranslations } from 'next-intl';

interface Props {
  value: string;
  onChange: (value: string) => void;
  /** Field classes, so each screen stays in charge of its own style. */
  inputClassName: string;
  /** Without `label` no label is rendered: use `ariaLabel` (search box, table cells). */
  label?: string;
  labelClassName?: string;
  ariaLabel?: string;
  disabled?: boolean;
  placeholder?: string;
  type?: 'text' | 'email';
  required?: boolean;
  autoComplete?: string;
  multiline?: boolean;
  /** Textarea height when `multiline`. */
  heightClass?: string;
  /** Narrower gutter and button, for table cells. */
  dense?: boolean;
}

// Text field with a small button to clear it. Clearing by hand (select all
// and delete) is awkward, and in several fields leaving it empty is a common
// choice: for issuer and client it is how that detail stays out of the PDF.
//
// Details that are not accidental:
//  - The button gutter (`pr-9`) is always reserved, even when the field is
//    empty and the button is hidden, so the text does not jump when the first
//    letter is typed.
//  - The hit area spans the full field height (`inset-y-0 w-9`) with a 24px
//    circle inside, the same pattern as the show-password button on login: on
//    mobile a 24px button is too small a target.
//
// Not used for passwords (the eye button already sits there), amounts, hours
// and task numbers (they are monospaced and right-aligned, and the gutter would
// break the alignment), or dates (the native control puts its icon there).
export default function ClearableField({
  value,
  onChange,
  inputClassName,
  label,
  labelClassName,
  ariaLabel,
  disabled = false,
  placeholder,
  type = 'text',
  required = false,
  autoComplete,
  multiline = false,
  heightClass = 'h-16',
  dense = false,
}: Props) {
  const t = useTranslations('clearableField');
  const showClear = !disabled && value.length > 0;
  const accessibleName = ariaLabel || label;
  const gutter = dense ? 'pr-7' : 'pr-9';
  const hitArea = dense ? 'w-7' : 'w-9';
  const circle = dense ? 'w-5 h-5 text-sm' : 'w-6 h-6 text-base';

  return (
    <div>
      {label && <label className={labelClassName}>{label}</label>}
      <div className="relative">
        {multiline ? (
          <textarea
            disabled={disabled}
            required={required}
            aria-label={label ? undefined : accessibleName}
            className={`${inputClassName} resize-none ${gutter} ${heightClass}`}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        ) : (
          <input
            type={type}
            disabled={disabled}
            required={required}
            autoComplete={autoComplete}
            aria-label={label ? undefined : accessibleName}
            className={`${inputClassName} ${gutter}`}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        )}
        {showClear && (
          <button
            type="button"
            onClick={() => onChange('')}
            aria-label={accessibleName ? t('clearNamed', { name: accessibleName }) : t('clear')}
            title={t('clear')}
            className={`absolute right-0 flex justify-center text-ink-400 hover:text-ink-900 ${hitArea} ${
              multiline ? 'top-0 h-10 items-center' : 'inset-y-0 items-center'
            }`}
          >
            <span
              aria-hidden
              className={`${circle} flex items-center justify-center rounded-full hover:bg-ink-100 leading-none transition-colors`}
            >
              ×
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
