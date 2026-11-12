import { cn } from '../../utils/cn';

/** Spot On Top wordmark: ascending bars with the "i" dot, as in the design file. */
export function Logo({ className, showTagline = true }) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <svg viewBox="0 0 34 30" aria-hidden="true" className="h-[26px] w-auto shrink-0">
        <rect x="0" y="19" width="7.5" height="10" rx="1.6" className="fill-fg-subtle" />
        <rect x="10.5" y="13" width="7.5" height="16" rx="1.6" className="fill-fg-muted" />
        <rect x="21.5" y="9" width="8" height="20" rx="1.6" className="fill-fg" />
        <circle cx="25.5" cy="3.4" r="3.4" className="fill-gold" />
      </svg>
      <span className="flex flex-col">
        <span className="font-display text-[21px] font-semibold leading-none tracking-[-0.02em] text-fg">
          Spot<span className="text-accent">On</span>Top
        </span>
        {showTagline && (
          <span className="mt-[3px] text-[6.5px] font-semibold uppercase leading-none tracking-[0.42em] text-fg-muted">
            Be seen on top.
          </span>
        )}
      </span>
      <span className="sr-only">Spot On Top</span>
    </span>
  );
}
