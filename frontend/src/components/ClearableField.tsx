// src/components/ClearableField.tsx
'use client';

interface Props {
  value: string;
  onChange: (value: string) => void;
  /** Clases del campo, para que cada pantalla mande en su estilo. */
  inputClassName: string;
  /** Sin `label` no se pinta etiqueta: usa `ariaLabel` (buscador, celdas de tabla). */
  label?: string;
  labelClassName?: string;
  ariaLabel?: string;
  disabled?: boolean;
  placeholder?: string;
  type?: 'text' | 'email';
  required?: boolean;
  autoComplete?: string;
  multiline?: boolean;
  /** Alto del textarea cuando `multiline`. */
  heightClass?: string;
  /** Hueco y botón más estrechos, para celdas de tabla. */
  dense?: boolean;
}

// Campo de texto con un botón pequeño para vaciarlo. Vaciar a mano
// (seleccionar todo y borrar) es incómodo, y en varios campos dejarlo vacío es
// una decisión habitual: en emisor y cliente es la forma de que ese dato no
// salga en el PDF.
//
// Detalles que no son casuales:
//  - El hueco del botón (`pr-9`) se reserva siempre, aunque el campo esté vacío
//    y el botón no se vea, para que el texto no salte al escribir la primera
//    letra.
//  - El área de pulsación ocupa todo el alto del campo (`inset-y-0 w-9`) con un
//    círculo de 24px dentro, el mismo patrón que el botón de mostrar contraseña
//    en el login: en móvil un botón de 24px es un blanco demasiado pequeño.
//
// No se usa en contraseñas (el botón del ojo ya ocupa ese sitio), en importes,
// horas y números de tarea (van en mono alineados a la derecha y el hueco
// rompería la alineación) ni en fechas (el control nativo pone ahí su icono).
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
            aria-label={accessibleName ? `Borrar ${accessibleName}` : 'Borrar'}
            title="Borrar"
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
