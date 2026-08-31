// src/components/ClearableField.tsx
'use client';

interface Props {
  label: string;
  value: string;
  onChange: (value: string) => void;
  /** Clases del input, para que la pantalla mande en el estilo. */
  inputClassName: string;
  labelClassName: string;
  disabled?: boolean;
  placeholder?: string;
  multiline?: boolean;
  /** Alto del textarea cuando `multiline`. */
  heightClass?: string;
}

// Campo de texto con un botón pequeño para vaciarlo. Vaciar un campo a mano
// (seleccionar todo + borrar) es incómodo, y en los datos de emisor y cliente
// dejar un campo vacío es una decisión habitual: es la forma de que ese dato no
// salga en el PDF.
//
// El hueco del botón (`pr-9`) se reserva siempre, aunque el campo esté vacío y
// el botón no se vea, para que el texto no salte al escribir el primer carácter.
export default function ClearableField({
  label,
  value,
  onChange,
  inputClassName,
  labelClassName,
  disabled = false,
  placeholder,
  multiline = false,
  heightClass = 'h-16',
}: Props) {
  const showClear = !disabled && value.length > 0;

  return (
    <div>
      <label className={labelClassName}>{label}</label>
      <div className="relative">
        {multiline ? (
          <textarea
            disabled={disabled}
            className={`${inputClassName} resize-none pr-9 ${heightClass}`}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        ) : (
          <input
            disabled={disabled}
            className={inputClassName + ' pr-9'}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        )}
        {showClear && (
          <button
            type="button"
            onClick={() => onChange('')}
            aria-label={`Borrar ${label}`}
            title="Borrar"
            className={`absolute right-1.5 w-6 h-6 flex items-center justify-center rounded-full text-ink-400 hover:text-ink-900 hover:bg-ink-100 transition-colors ${
              multiline ? 'top-1.5' : 'top-1/2 -translate-y-1/2'
            }`}
          >
            <span aria-hidden className="text-base leading-none">
              ×
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
