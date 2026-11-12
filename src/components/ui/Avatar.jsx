import { cn } from '../../utils/cn';

const TONES = {
  gold: 'bg-gold text-navy',
  iris: 'bg-iris text-navy',
  coral: 'bg-coral text-navy',
  mint: 'bg-mint text-navy',
  slate: 'bg-[#2D3F73] text-white',
  forest: 'bg-[#127A5E] text-white',
};

const SIZES = {
  sm: 'h-10 w-10 rounded-lg text-xs font-bold',
  md: 'h-12 w-12 rounded-xl text-base font-semibold',
  lg: 'h-14 w-14 rounded-full text-sm sm:h-16 sm:w-16',
};

export function Avatar({ initials, tone = 'slate', size = 'lg', className }) {
  return (
    <span
      aria-hidden="true"
      className={cn('inline-flex shrink-0 items-center justify-center font-display', TONES[tone], SIZES[size], className)}
    >
      {initials}
    </span>
  );
}

export function initialsFrom(name) {
  const words = String(name).replace(/&/g, ' ').trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '–';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}
