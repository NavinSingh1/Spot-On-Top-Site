import { ArrowRight, Bookmark, Check, Heart, Mail, MessageCircle, MoreHorizontal, Send } from 'lucide-react';
import instagramPantry from '../../../assets/images/instagram-pantry.webp';
import { formatNumber, formatPercent } from '../../../utils/currency';
import { Avatar, initialsFrom } from '../../ui/Avatar';

export function monogramFor(name) {
  const parts = String(name).split(/\s+/).filter((word) => word && word !== '&');
  if (parts.length === 0) return 'yb';
  if (name.includes('&') && parts.length >= 2) return `${parts[0][0]}&${parts[1][0]}`.toLowerCase();
  return parts
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toLowerCase();
}

export function handleFor(name) {
  return String(name).toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]/g, '') || 'yourbrand';
}

/** Instagram feed post. Fixed cream palette: it is a creative, not themed UI. */
export function InstagramPreview({ brand }) {
  return (
    <figure className="mx-auto w-full max-w-[420px] overflow-hidden rounded-xl bg-[#FBF8F1] text-[#1F2A1F] shadow-card">
      <div className="flex items-center gap-2.5 px-3.5 py-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#2F3B2C] font-serif text-[11px] text-[#F4EBDD]">
          {monogramFor(brand.name)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-bold">{handleFor(brand.name)}</p>
          <p className="truncate text-[11px] text-[#6B6B5E]">{brand.location ? `${brand.location} · ` : ''}Example account</p>
        </div>
        <MoreHorizontal className="h-4 w-4 text-[#3B3B33]" aria-hidden="true" />
      </div>
      <div className="bg-[#EFE6D3] px-5 pb-5 pt-6">
        <div className="flex items-start justify-between gap-3">
          <p className="min-w-0 break-words font-serif text-xl">{brand.name}</p>
          <p className="mt-1.5 shrink-0 text-[9px] font-bold uppercase tracking-[0.18em]">{brand.region}</p>
        </div>
        <p className="mt-3 font-serif text-[28px] leading-[1.06] sm:text-[32px]">
          Good things.
          <br />
          Worth passing around.
        </p>
        <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.14em]">Small batches. Now shipping to India.</p>
      </div>
      <img
        src={instagramPantry}
        alt="Olive oil, honey jars, bread and oranges on a wooden table"
        className="aspect-[1100/614] w-full object-cover"
        loading="lazy"
      />
      <div className="flex items-center gap-3 px-3.5 pt-3 text-[#1F2A1F]" aria-hidden="true">
        <Heart className="h-5 w-5" />
        <MessageCircle className="h-5 w-5" />
        <Send className="h-5 w-5" />
        <Bookmark className="ml-auto h-5 w-5" />
      </div>
      <figcaption className="px-3.5 pb-3.5 pt-2 text-xs leading-relaxed">
        <strong>{brand.name}</strong> · {brand.pitch}
      </figcaption>
    </figure>
  );
}

export function ListingPreview({ brand }) {
  return (
    <article className="mx-auto w-full max-w-[360px] rounded-[22px] border border-line bg-ink-800 p-6 shadow-card">
      <Avatar initials={initialsFrom(brand.name)} tone="mint" />
      <div className="mt-6 flex items-start justify-between gap-3">
        <h4 className="min-w-0 break-words font-display text-lg font-medium text-fg">{brand.name}</h4>
        <span className="mt-1 inline-flex shrink-0 items-center gap-1 text-xs font-medium text-mint-ink">
          <Check className="h-3.5 w-3.5" aria-hidden="true" /> Verified demo
        </span>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-fg-muted">{brand.pitch}</p>
      <dl className="mt-5 grid grid-cols-3 gap-2">
        {[
          ['Views', formatNumber(brand.stats?.views ?? 0)],
          ['Clicks', formatNumber(brand.stats?.clicks ?? 0)],
          ['Rate', formatPercent(brand.stats?.views ? brand.stats.clicks / brand.stats.views : 0)],
        ].map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs text-fg-muted">{label}</dt>
            <dd className="mt-1 text-lg font-bold tabular-nums text-fg">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-5 flex items-center gap-2 border-t border-line pt-4 text-sm text-fg-muted">
        <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span className="truncate">{brand.email}</span>
      </p>
    </article>
  );
}

export function HomeBannerPreview({ brand }) {
  return (
    <div className="mx-auto w-full max-w-[640px] [container-type:inline-size]">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#2A1670] via-[#4B2CA8] to-[#6D46D8] p-[6cqw] text-white shadow-card">
        <div aria-hidden="true" className="absolute -right-[10cqw] -top-[14cqw] h-[48cqw] w-[48cqw] rounded-full bg-white/10" />
        <div aria-hidden="true" className="absolute -bottom-[18cqw] right-[12cqw] h-[36cqw] w-[36cqw] rounded-full bg-gold/20" />
        <span className="relative inline-flex items-center gap-2 rounded-full bg-black/25 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em]">
          Sponsored <span className="h-1 w-1 rounded-full bg-gold" aria-hidden="true" /> {brand.name}
        </span>
        <p className="relative mt-[4cqw] max-w-[80%] break-words font-sans text-[length:6.4cqw] font-bold leading-[1.05] tracking-tight">{brand.name}</p>
        <p className="relative mt-[2.5cqw] max-w-[78%] text-[length:2.6cqw] leading-snug text-white/85">{brand.pitch}</p>
        <div className="relative mt-[5cqw] flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-[13px] font-bold text-navy">
            See contact <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="truncate text-xs text-white/75">{brand.email}</span>
        </div>
      </div>
      <p className="mt-3 text-center text-xs text-fg-subtle">Home top banner, desktop. Rotates with three other brands.</p>
    </div>
  );
}
