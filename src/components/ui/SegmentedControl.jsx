import { useRef } from 'react';
import { cn } from '../../utils/cn';

const SELECTED = {
  gold: 'bg-gold text-navy shadow-sm',
  light: 'bg-white text-navy shadow-sm',
  soft: 'bg-ink-750 text-fg',
};

/**
 * Single-choice control used for filters, tabs and toggles.
 * `mode="tabs"` exposes tab semantics; otherwise it behaves as a radio group.
 * Arrow keys move the selection, as with native radio buttons.
 */
export function SegmentedControl({
  options,
  value,
  onChange,
  label,
  mode = 'radio',
  tone = 'gold',
  size = 'md',
  shape = 'pill',
  stretch = false,
  idPrefix,
  className,
  itemClassName,
}) {
  const buttons = useRef([]);
  const isTabs = mode === 'tabs';
  const radius = shape === 'pill' ? 'rounded-full' : 'rounded-lg';

  const onKeyDown = (event, index) => {
    const keys = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    if (!(event.key in keys)) return;
    event.preventDefault();
    const nextIndex = (index + keys[event.key] + options.length) % options.length;
    onChange(options[nextIndex].value);
    buttons.current[nextIndex]?.focus();
  };

  return (
    <div
      role={isTabs ? 'tablist' : 'radiogroup'}
      aria-label={label}
      className={cn(
        'flex items-center gap-1 border border-line bg-ink-950/50 p-1',
        stretch ? 'w-full' : 'inline-flex max-w-full',
        shape === 'pill' ? 'rounded-full' : 'rounded-xl',
        className,
      )}
    >
      {options.map((option, index) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            ref={(node) => {
              buttons.current[index] = node;
            }}
            type="button"
            role={isTabs ? 'tab' : 'radio'}
            id={idPrefix ? `${idPrefix}-tab-${option.value}` : undefined}
            aria-controls={isTabs && idPrefix ? `${idPrefix}-panel` : undefined}
            aria-selected={isTabs ? selected : undefined}
            aria-checked={isTabs ? undefined : selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(option.value)}
            onKeyDown={(event) => onKeyDown(event, index)}
            className={cn(
              'inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition-colors duration-150',
              size === 'sm' ? 'h-8 px-3.5 text-xs' : 'h-9 px-4 text-[13px] sm:h-10 sm:px-5',
              radius,
              stretch && 'flex-1',
              selected ? SELECTED[tone] : 'text-fg-muted hover:text-fg',
              itemClassName,
            )}
          >
            {option.icon}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
