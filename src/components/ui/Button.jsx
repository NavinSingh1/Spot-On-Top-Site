import { forwardRef } from 'react';
import { cn } from '../../utils/cn';

const VARIANTS = {
  primary:
    'bg-gold text-navy hover:bg-gold-hover active:bg-gold-deep shadow-[0_10px_30px_-14px_rgba(245,181,46,0.7)]',
  outline: 'border border-line-strong bg-transparent text-fg hover:border-fg-subtle hover:bg-ink-800/60',
  light: 'bg-white text-navy hover:bg-white/90 shadow-[0_10px_30px_-12px_rgba(255,255,255,0.35)]',
  ghost: 'text-fg-muted hover:bg-ink-800/70 hover:text-fg',
  subtle: 'border border-line bg-ink-800 text-fg hover:border-line-strong',
};

const SIZES = {
  xs: 'h-8 rounded-md px-3 text-xs',
  sm: 'h-10 rounded-lg px-4 text-[13px]',
  md: 'h-12 rounded-lg px-5 text-sm',
  lg: 'h-[52px] rounded-[10px] px-6 text-[15px]',
  icon: 'h-11 w-11 rounded-lg',
};

export const Button = forwardRef(function Button(
  { as: Component = 'button', variant = 'primary', size = 'md', className, type, children, ...props },
  ref,
) {
  return (
    <Component
      ref={ref}
      type={Component === 'button' ? type ?? 'button' : undefined}
      className={cn(
        'inline-flex select-none items-center justify-center gap-2 whitespace-nowrap font-bold transition-[background-color,border-color,color,box-shadow,transform] duration-150 active:translate-y-px disabled:pointer-events-none disabled:opacity-45',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
});
