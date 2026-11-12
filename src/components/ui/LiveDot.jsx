import { cn } from '../../utils/cn';

export function LiveDot({ className }) {
  return (
    <span className={cn('relative inline-flex h-2 w-2', className)} aria-hidden="true">
      <span className="absolute inset-0 animate-ping rounded-full bg-coral opacity-60" />
      <span className="relative h-2 w-2 rounded-full bg-coral" />
    </span>
  );
}
