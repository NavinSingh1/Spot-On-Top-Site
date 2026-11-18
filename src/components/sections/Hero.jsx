import { useState } from 'react';
import { Clock3, Play, ShieldCheck } from 'lucide-react';
import heroBillboard from '../../assets/images/hero-billboard.webp';
import flagIndia from '../../assets/images/flag-india.webp';
import flagUsa from '../../assets/images/flag-usa.webp';
import { useQuote } from '../../context/QuoteContext';
import { API_CONFIG } from '../../config/api.config';
import { useApiQuery } from '../../hooks/useApiQuery';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { formatAgo, useRelativeNow } from '../../hooks/useRelativeNow';
import { cn } from '../../utils/cn';
import { formatNumber, formatPercent } from '../../utils/currency';
import { scrollToSection } from '../../utils/scroll';
import { Skeleton } from '../ui/AsyncState';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Container } from '../ui/Container';
import { Flag, FlagPair } from '../ui/Flag';
import { KaveriSilkCreative } from './featured/Creatives';

const MODES = [
  { value: 'usa', label: 'USA brands entering India', flag: 'usa' },
  { value: 'india', label: 'Indian brands', flag: 'india' },
];

/** Dotted arc between the two markets, with a dot travelling in the selected direction. */
function MarketArc({ mode }) {
  const reduced = usePrefersReducedMotion();
  const path = 'M 30 62 Q 135 -18 240 62';
  return (
    <svg viewBox="0 0 270 112" className="h-auto w-[190px] shrink-0 sm:w-[270px]" role="img" aria-label={mode === 'usa' ? 'Traffic flowing from the USA to India' : 'Traffic flowing from India to the USA'}>
      <path d={path} fill="none" className="stroke-line-strong" strokeWidth="2" strokeDasharray="1 7" strokeLinecap="round" />
      <circle
        r="4.5"
        className="fill-gold"
        cx={reduced ? (mode === 'usa' ? 30 : 240) : 0}
        cy={reduced ? 62 : 0}
      >
        {!reduced && (
          <animateMotion
            key={mode}
            dur="2.6s"
            repeatCount="indefinite"
            path={path}
            keyPoints={mode === 'usa' ? '0;1' : '1;0'}
            keyTimes="0;1"
            calcMode="linear"
          />
        )}
      </circle>
      <image href={flagUsa} x="18" y="62" width="24" height="24" />
      <image href={flagIndia} x="228" y="62" width="24" height="24" />
      <text x="30" y="106" textAnchor="middle" className="fill-fg-muted text-[15px] font-medium">
        USA
      </text>
      <text x="240" y="106" textAnchor="middle" className="fill-fg-muted text-[15px] font-medium">
        India
      </text>
    </svg>
  );
}

/**
 * Sponsored image in the hero card. A real API can return { imageUrl, imageAlt };
 * the demo uses built-in creatives by `kind`.
 */
function HeroPreview({ preview }) {
  if (!preview) return <Skeleton className="h-full w-full rounded-none" />;
  if (preview.imageUrl || preview.kind === 'billboard') {
    return (
      <img
        key={preview.imageUrl ?? 'billboard'}
        src={preview.imageUrl ?? heroBillboard}
        alt={preview.imageAlt ?? 'Sponsored preview'}
        className="h-full w-full animate-fade-in object-cover object-[50%_46%]"
      />
    );
  }
  return (
    <div key={preview.kind} className="h-full w-full animate-fade-in">
      <KaveriSilkCreative compact />
    </div>
  );
}

function StatTile({ value, label }) {
  return (
    <div className="rounded-xl bg-ink-800 px-3 py-3 sm:px-4 sm:py-3.5">
      <p className="font-sans text-xl font-extrabold tabular-nums leading-none text-fg sm:text-[28px]">
        {value || <Skeleton className="h-[1em] w-16" />}
      </p>
      <p className="mt-1.5 text-xs text-fg-muted sm:text-base">{label}</p>
    </div>
  );
}

export function Hero() {
  const { openQuoteBuilder } = useQuote();
  const [mode, setMode] = useState('usa');
  const now = useRelativeNow(1000);
  // GET /stats/hero?market=… — polled so the counter stays live.
  const heroQuery = useApiQuery('heroStats', { market: mode }, { pollInterval: API_CONFIG.polling.heroStats });
  const stats = heroQuery.data;
  const feed = stats?.feed ?? [];

  return (
    <section id="top" className="relative overflow-hidden bg-ink-950 pb-16 pt-28 sm:pt-32 lg:pb-24 lg:pt-40">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 w-full bg-[radial-gradient(ellipse_at_85%_35%,rgb(var(--ink-800)/0.75),transparent_60%)] lg:w-3/4"
      />
      <Container className="relative grid grid-cols-1 items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,540px)] xl:grid-cols-[minmax(0,1fr)_minmax(0,600px)] xl:gap-14 2xl:grid-cols-[minmax(0,720px)_minmax(0,820px)] 2xl:justify-between">
        <div className="max-w-[720px]">
          <p className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-[0.14em] text-fg-muted sm:text-[13px]">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-gold/15" aria-hidden="true">
              <span className="h-2 w-2 rounded-full bg-gold" />
            </span>
            Interactive advertising marketplace
          </p>
          <h1 className="mt-5 font-sans text-[56px] font-extrabold leading-[0.98] tracking-[-0.045em] text-fg sm:text-[76px] lg:text-[84px] 2xl:text-[100px]">
            Be Seen <span className="whitespace-nowrap text-accent">On Top</span>
          </h1>
          <p className="mt-6 max-w-[40rem] text-lg leading-[1.55] text-fg-muted sm:text-xl 2xl:text-[22px]">
            A premium billboard for brands that want the attention of founders, CEOs and serious buyers in India and the USA. Every banner shows its own live views and clicks.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button size="lg" onClick={() => openQuoteBuilder()}>
              Get a Banner Quote
            </Button>
            <Button size="lg" variant="outline" onClick={() => scrollToSection('live-traffic')}>
              Watch Live Traffic
              <Play className="h-3 w-3 fill-current" aria-hidden="true" />
            </Button>
          </div>

          <hr className="my-9 border-line lg:my-10" />

          <div className="flex flex-col gap-2 rounded-xl border border-line p-2 2xl:flex-row 2xl:items-center">
            <p id="hero-show-me" className="px-3 pt-1 text-xs font-bold uppercase tracking-[0.08em] text-fg-muted 2xl:pt-0 2xl:text-sm">
              Show me
            </p>
            <div role="radiogroup" aria-labelledby="hero-show-me" className="grid flex-1 gap-2 sm:grid-cols-2">
              {MODES.map((option) => {
                const selected = mode === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setMode(option.value)}
                    className={cn(
                      'flex h-12 items-center justify-center gap-2.5 whitespace-nowrap rounded-lg border px-3 text-sm font-medium transition-colors 2xl:px-4 2xl:text-[15px]',
                      selected
                        ? 'border-transparent bg-ink-800 text-fg'
                        : 'border-line text-fg-muted hover:border-line-strong hover:text-fg',
                    )}
                  >
                    <Flag country={option.flag} />
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-3 text-sm text-fg-muted 2xl:text-[15px]">
            <li className="flex items-center gap-2">
              <ShieldCheck className="h-[18px] w-[18px] fill-gold text-ink-950" aria-hidden="true" />
              Verified Demo Brands
            </li>
            <li className="flex items-center gap-2">
              <FlagPair flagClassName="h-4 w-4" />
              Two Markets, One Audience
            </li>
            <li className="flex items-center gap-2">
              <Clock3 className="h-[18px] w-[18px] fill-gold text-ink-950" aria-hidden="true" />
              24 Hours to Change any Contact
            </li>
          </ul>
        </div>

        <div className="relative rounded-[28px] border border-line-strong/80 bg-ink-850/90 shadow-card">
          <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3.5 sm:px-6 sm:py-4">
            <div className="flex gap-1.5" aria-hidden="true">
              <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
              <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
              <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
            </div>
            <p className="truncate text-sm tracking-wide text-fg-muted sm:text-base">spotontop.example / live</p>
            <Badge tone="live" dot pulse>
              LIVE NOW
            </Badge>
          </div>

          <div
            aria-busy={heroQuery.isPreviousData || undefined}
            className={cn('p-4 transition-opacity duration-200 sm:p-6', heroQuery.isPreviousData && 'opacity-60')}
          >
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="font-sans text-[64px] font-extrabold leading-[0.9] tracking-[-0.04em] text-accent tabular-nums sm:text-[96px]" aria-live="off">
                  {stats ? stats.peopleNow : <Skeleton className="inline-block h-[0.8em] w-[1.6em] align-baseline" />}
                </p>
                <p className="mt-2 text-sm text-fg-muted sm:text-base">people on Spot On Top right now</p>
              </div>
              <MarketArc mode={mode} />
            </div>

            <div className="relative mt-5 aspect-[2.3/1] overflow-hidden rounded-2xl bg-ink-800 sm:aspect-[2.58/1]">
              <HeroPreview preview={stats?.preview} />
              <span className="absolute right-3 top-3 rounded-md bg-black/60 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-white backdrop-blur sm:right-4 sm:top-4 sm:text-[11px]">
                Sponsored preview
              </span>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
              <StatTile value={stats && formatNumber(stats.visitsToday)} label="visits today" />
              <StatTile value={stats && formatNumber(stats.contactClicks)} label="contact clicks" />
              <StatTile value={stats && formatPercent(stats.clickRate)} label="click rate" />
            </div>

            <ul className="mt-3 space-y-2.5" aria-label="Latest activity">
              {!stats &&
                [0, 1].map((index) => (
                  <li key={index} className="rounded-xl bg-ink-800 px-4 py-3">
                    <Skeleton className="h-5 w-2/3" />
                  </li>
                ))}
              {feed.map((event, index) => (
                <li
                  key={event.id}
                  className={cn('flex items-center gap-3 rounded-xl bg-ink-800 px-4 py-3', index === 0 && 'animate-rise-in')}
                >
                  <span
                    className={cn(
                      'w-11 shrink-0 text-[11px] font-extrabold tracking-wide',
                      event.market === 'usa' ? 'text-iris-ink' : 'text-coral-ink',
                    )}
                  >
                    {event.market === 'usa' ? 'USA' : 'INDIA'}
                  </span>
                  <span className="flex-1 truncate text-sm font-semibold text-fg sm:text-[15px]">{event.label}</span>
                  <span className={cn('text-xs font-medium', index === 0 ? 'text-accent' : 'text-fg-subtle')}>
                    {formatAgo(event.at, now)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}
