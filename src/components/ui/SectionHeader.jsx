import { cn } from '../../utils/cn';

export function SectionHeader({ eyebrow, badge, title, titleId, description, aside, className }) {
  return (
    <div className={cn('mb-10 flex flex-col gap-6 lg:mb-16 lg:flex-row lg:items-end lg:justify-between', className)}>
      <div className="max-w-[78rem]">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-accent sm:text-[13px]">{eyebrow}</p>
          {badge}
        </div>
        <h2
          id={titleId}
          className="mt-4 font-display text-[34px] font-medium leading-[1.12] tracking-[-0.02em] text-fg sm:text-[44px] lg:text-[56px]"
        >
          {title}
        </h2>
        {description && (
          <p className="mt-5 max-w-[76rem] text-base leading-relaxed text-fg-muted sm:text-lg lg:text-xl">
            {description}
          </p>
        )}
      </div>
      {aside}
    </div>
  );
}

/** Small uppercase label used inside cards ("SPOT OF THE WEEK", "YOUR ESTIMATE"). */
export function Kicker({ as: Component = 'p', className, children }) {
  return (
    <Component className={cn('text-[11px] font-bold uppercase tracking-[0.14em] text-accent sm:text-xs', className)}>
      {children}
    </Component>
  );
}
