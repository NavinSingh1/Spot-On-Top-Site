import flagIndia from '../../assets/images/flag-india.webp';
import flagUsa from '../../assets/images/flag-usa.webp';
import { cn } from '../../utils/cn';

const FLAGS = {
  india: { src: flagIndia, label: 'India' },
  usa: { src: flagUsa, label: 'USA' },
};

/** Round country flag. Decorative by default because a text label usually sits beside it. */
export function Flag({ country, className, decorative = true }) {
  const flag = FLAGS[country];
  if (!flag) return null;
  return (
    <img
      src={flag.src}
      alt={decorative ? '' : `${flag.label} flag`}
      width="20"
      height="20"
      loading="lazy"
      className={cn('inline-block h-5 w-5 shrink-0 rounded-full object-cover', className)}
    />
  );
}

export function FlagPair({ className, flagClassName }) {
  return (
    <span className={cn('inline-flex items-center', className)}>
      <Flag country="india" className={flagClassName} />
      <Flag country="usa" className={cn('-ml-1.5 ring-2 ring-ink-950', flagClassName)} />
    </span>
  );
}
