import { cn } from '../../utils/cn';

const TONES = {
  open: 'bg-mint-deep/40 text-mint-ink',
  iris: 'bg-iris/20 text-iris-ink',
  gold: 'bg-gold text-navy',
  pending: 'bg-gold/10 text-accent',
  done: 'bg-mint-deep/40 text-mint-ink',
  live: 'bg-coral/10 text-coral-ink',
  neutral: 'bg-ink-750 text-fg-muted',
};

const BADGE_SIZES = {
  sm: 'px-2.5 py-1 text-[10px]',
  md: 'px-3 py-1 text-xs',
  lg: 'h-7 px-3 text-xs sm:text-sm xl:h-8 xl:px-3.5 xl:text-base',
  // Status pill on the "How it works" spot cards: slimmer at xl so three cards fit the fixed-height box.
  card: 'h-7 px-3 text-xs sm:text-sm xl:h-6 xl:text-[13px]',
};

const DOTS = {
  open: 'bg-mint',
  iris: 'bg-iris',
  gold: 'bg-navy',
  pending: 'bg-gold',
  done: 'bg-mint',
  live: 'bg-coral',
  neutral: 'bg-fg-subtle',
};

export function Badge({ tone = 'neutral', dot = false, pulse = false, size = 'md', className, children }) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full font-bold',
        BADGE_SIZES[size],
        TONES[tone],
        className,
      )}
    >
      {dot && <span className={cn('h-1.5 w-1.5 rounded-full', DOTS[tone], pulse && 'animate-pulse-dot')} />}
      {children}
    </span>
  );
}
