import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../utils/cn';

const SURFACES = { default: 'bg-ink-950', transparent: 'bg-transparent' };

export { SURFACES as inputSurfaces };

export const inputClasses =
  'w-full rounded-lg border border-line px-3.5 text-sm text-fg placeholder:text-fg-subtle transition-[border-color,box-shadow] duration-150 hover:border-line-strong focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/25 focus-visible:ring-offset-0';

function FieldShell({ id, label, error, hint, counter, className, labelClassName, children }) {
  return (
    <div className={className}>
      {label && (
        <div className="mb-2 flex items-baseline justify-between gap-3">
          <label htmlFor={id} className={cn('text-[13px] font-semibold text-fg', labelClassName)}>
            {label}
          </label>
          {counter}
        </div>
      )}
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs font-semibold text-coral-ink">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="mt-1.5 text-xs text-fg-subtle">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

function describedBy(id, error, hint) {
  if (error) return `${id}-error`;
  if (hint) return `${id}-hint`;
  return undefined;
}

export const TextField = forwardRef(function TextField(
  { id, label, error, hint, counter, className, labelClassName, inputClassName, surface = 'default', ...props },
  ref,
) {
  return (
    <FieldShell {...{ id, label, error, hint, counter, className, labelClassName }}>
      <input
        ref={ref}
        id={id}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={describedBy(id, error, hint)}
        className={cn(inputClasses, SURFACES[surface], 'h-12', error && 'border-coral focus:border-coral focus:ring-coral/25', inputClassName)}
        {...props}
      />
    </FieldShell>
  );
});

export const TextArea = forwardRef(function TextArea(
  { id, label, error, hint, counter, className, labelClassName, inputClassName, surface = 'default', rows = 3, ...props },
  ref,
) {
  return (
    <FieldShell {...{ id, label, error, hint, counter, className, labelClassName }}>
      <textarea
        ref={ref}
        id={id}
        rows={rows}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={describedBy(id, error, hint)}
        className={cn(inputClasses, SURFACES[surface], 'resize-none py-3 leading-relaxed', error && 'border-coral focus:border-coral focus:ring-coral/25', inputClassName)}
        {...props}
      />
    </FieldShell>
  );
});

export const SelectField = forwardRef(function SelectField(
  { id, label, error, hint, options, placeholder, className, labelClassName, inputClassName, surface = 'default', ...props },
  ref,
) {
  return (
    <FieldShell {...{ id, label, error, hint, className, labelClassName }}>
      <div className="relative">
        <select
          ref={ref}
          id={id}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={describedBy(id, error, hint)}
          className={cn(
            inputClasses,
            SURFACES[surface],
            'h-12 cursor-pointer appearance-none pr-10',
            !props.value && 'text-fg-subtle',
            error && 'border-coral focus:border-coral focus:ring-coral/25',
            inputClassName,
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-muted"
        />
      </div>
    </FieldShell>
  );
});
