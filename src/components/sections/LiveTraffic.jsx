import { useRef, useState } from 'react';
import { RotateCw } from 'lucide-react';
import { useUI } from '../../context/UIContext';
import { API_CONFIG } from '../../config/api.config';
import { TRAFFIC_MARKETS } from '../../config/filters';
import { useInView } from '../../hooks/useInView';
import { useApiQuery } from '../../hooks/useApiQuery';
import { formatAgo } from '../../hooks/useRelativeNow';
import { cn } from '../../utils/cn';
import { formatNumber } from '../../utils/currency';
import { ErrorState, Skeleton } from '../ui/AsyncState';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { LiveDot } from '../ui/LiveDot';
import { Section } from '../ui/Section';
import { Kicker, SectionHeader } from '../ui/SectionHeader';
import { SegmentedControl } from '../ui/SegmentedControl';

const PANEL_TABS = [
  { value: 'where', label: 'Where visitors are' },
  { value: 'feed', label: 'Live feed' },
  { value: 'week', label: 'Last 7 days' },
];

const MARKET_BAR = { india: 'bg-gold', usa: 'bg-iris', other: 'bg-fg-subtle' };

function StatCard({ label, value, tone = 'default', live = false }) {
  return (
    <div className="rounded-2xl border border-line bg-ink-900 px-5 py-4 sm:px-6 sm:py-5">
      <p className="flex items-center gap-2 text-xs font-medium text-fg-muted sm:text-[13px]">
        {live && <LiveDot />}
        {label}
      </p>
      <p
        className={cn(
          'mt-2 font-sans text-3xl font-extrabold tabular-nums tracking-tight sm:text-[40px] sm:leading-[1.1]',
          tone === 'gold' && 'text-accent',
          tone === 'mint' && 'text-mint-ink',
          tone === 'default' && 'text-fg',
        )}
      >
        {value === undefined ? <Skeleton className="h-[1em] w-24" /> : formatNumber(value)}
      </p>
    </div>
  );
}

/** Line + area chart of the last 60 one-second samples. Hover, tap or use arrow keys to inspect. */
function VisitorsChart({ history }) {
  const chartRef = useRef(null);
  const [inspected, setInspected] = useState(null);
  const latestIndex = history.length - 1;
  const shownIndex = inspected ?? latestIndex;
  const secondsAgo = latestIndex - shownIndex;

  // Fit the line to the data: the lowest sample sits near the floor, the highest near the top.
  const min = Math.min(...history);
  const range = Math.max(...history) - min || 1;
  const xOf = (index) => (index / latestIndex) * 100;
  const yOf = (value) => 12 + (1 - (value - min) / range) * 78;
  const points = history.map((value, index) => `${xOf(index).toFixed(2)},${yOf(value).toFixed(2)}`);
  const linePath = `M${points.join(' L')}`;
  const areaPath = `${linePath} L100,100 L0,100 Z`;

  const inspectAt = (clientX) => {
    const rect = chartRef.current?.getBoundingClientRect();
    if (!rect || !rect.width) return;
    const ratio = (clientX - rect.left) / rect.width;
    setInspected(Math.min(latestIndex, Math.max(0, Math.round(ratio * latestIndex))));
  };

  const onKeyDown = (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      setInspected(Math.max(0, shownIndex - 1));
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      setInspected(Math.min(latestIndex, shownIndex + 1));
    } else if (event.key === 'Escape') {
      setInspected(null);
    }
  };

  const shownX = xOf(shownIndex);
  const shownY = yOf(history[shownIndex]);

  return (
    <div className="flex h-full flex-col rounded-2xl border border-line bg-ink-900 p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <Kicker className="sm:text-[13px]">Visitors, last 60 seconds</Kicker>
        <p className="text-xs text-fg-muted sm:text-sm">Hover the chart to inspect any second</p>
      </div>
      <p className="sr-only" aria-live="polite">
        {history[shownIndex]} visitors {secondsAgo === 0 ? 'right now' : `${secondsAgo} seconds ago`}
      </p>

      <div
        ref={chartRef}
        tabIndex={0}
        role="img"
        aria-label={`Visitors per second over the last minute. Ranges from ${min} to ${Math.max(...history)}. Use left and right arrow keys to inspect.`}
        onKeyDown={onKeyDown}
        onPointerMove={(event) => inspectAt(event.clientX)}
        onPointerDown={(event) => inspectAt(event.clientX)}
        onPointerLeave={() => setInspected(null)}
        onBlur={() => setInspected(null)}
        className="relative mt-7 min-h-[13rem] flex-1 cursor-crosshair rounded-sm sm:min-h-[16rem]"
      >
        {/* Faint guide lines: top, middle and the baseline under the area. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex flex-col justify-between">
          {[0, 1, 2].map((line) => (
            <span key={line} className="border-t border-line/60" />
          ))}
        </div>

        <svg
          aria-hidden="true"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
        >
          <path d={areaPath} className="fill-gold/[0.13]" />
          <path
            d={linePath}
            fill="none"
            className="stroke-gold"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {/* Vertical guide + readout while inspecting a second. */}
        {inspected !== null && (
          <>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 w-px bg-line-strong"
              style={{ left: `${shownX}%` }}
            />
            <span
              aria-hidden="true"
              className={cn(
                'pointer-events-none absolute -top-1 -translate-y-full whitespace-nowrap rounded-md border border-line-strong bg-ink-800 px-2.5 py-1 text-xs font-semibold text-fg shadow-card',
                shownX < 15 ? 'translate-x-0' : shownX > 85 ? '-translate-x-full' : '-translate-x-1/2',
              )}
              style={{ left: `${shownX}%` }}
            >
              {history[shownIndex]} visitors · {secondsAgo === 0 ? 'now' : `${secondsAgo}s ago`}
            </span>
          </>
        )}

        {/* The point being shown: the newest sample by default, with a soft gold halo. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold shadow-glow"
          style={{ left: `${shownX}%`, top: `${shownY}%` }}
        />
      </div>

      <div className="mt-3 flex justify-between text-xs text-fg-muted" aria-hidden="true">
        <span>60 s ago</span>
        <span>now</span>
      </div>
    </div>
  );
}

/** `cities` arrive already filtered for the market, with shares in percent. */
function CityBreakdown({ cities, otherShare = 0, market }) {
  const rows = cities;

  return (
    <div>
      <ul className="space-y-3.5">
        {rows.map((city) => (
          <li key={city.name} className="grid grid-cols-[96px_minmax(0,1fr)_40px] items-center gap-3 text-[13px] sm:grid-cols-[110px_minmax(0,1fr)_44px]">
            <span className="truncate font-semibold text-fg">{city.name}</span>
            <span className="h-2 overflow-hidden rounded-full bg-line" aria-hidden="true">
              <span
                className={cn('block h-full rounded-full transition-[width] duration-700', MARKET_BAR[city.market])}
                style={{ width: `${Math.min(100, city.share * (market === 'all' ? 3.2 : 1.6))}%` }}
              />
            </span>
            <span className="text-right font-bold tabular-nums text-fg">{city.share}%</span>
          </li>
        ))}
      </ul>
      <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-fg-muted">
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-gold" aria-hidden="true" />India</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-iris" aria-hidden="true" />USA</span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm bg-fg-subtle" aria-hidden="true" />
          Other{otherShare > 0 && ` ${otherShare}%`}
        </span>
      </div>
    </div>
  );
}

/** `feed` arrives already filtered for the market, newest first. */
function LiveFeed({ feed, now }) {
  const visible = feed;
  if (visible.length === 0) {
    return <p className="py-8 text-center text-sm text-fg-muted">Waiting for the next visit from this market.</p>;
  }
  return (
    <ul className="max-h-[300px] space-y-2 overflow-y-auto pr-1" aria-label="Live visitor activity">
      {visible.slice(0, 8).map((event, index) => (
        <li key={event.id} className={cn('flex items-center gap-3 rounded-xl bg-ink-800 px-3.5 py-2.5', index === 0 && 'animate-rise-in')}>
          <span className={cn('w-11 shrink-0 text-[10px] font-extrabold tracking-wide', event.market === 'usa' ? 'text-iris-ink' : 'text-coral-ink')}>
            {event.market === 'usa' ? 'USA' : 'INDIA'}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-semibold text-fg">{event.label}</span>
            <span className="block truncate text-xs text-fg-subtle">
              {event.brand}, from {event.city}
            </span>
          </span>
          <span className={cn('text-xs', index === 0 ? 'text-accent' : 'text-fg-subtle')}>{formatAgo(event.at, now)}</span>
        </li>
      ))}
    </ul>
  );
}

/** `weekly` is [{ day, india, usa }] for the selected market (others zeroed). */
function WeeklyChart({ weekly }) {
  const rows = weekly;
  const max = Math.max(...rows.map((day) => day.india + day.usa));
  const total = rows.reduce((sum, day) => sum + day.india + day.usa, 0);

  return (
    <div>
      <p className="text-sm text-fg-muted">
        <span className="font-sans text-2xl font-extrabold tabular-nums text-fg">{formatNumber(total)}</span> visits this week
      </p>
      <div className="mt-4 flex h-48 items-end gap-2 sm:gap-3" role="img" aria-label={`Daily visits for the last seven days, ${formatNumber(total)} in total.`}>
        {rows.map((day) => {
          const sum = day.india + day.usa;
          return (
            <div key={day.day} className="flex h-full flex-1 flex-col items-center justify-end gap-2" title={`${day.day}: ${formatNumber(sum)} visits`}>
              <div className="flex w-full flex-col justify-end overflow-hidden rounded-t-md" style={{ height: `${(sum / max) * 100}%` }}>
                <span className="block w-full bg-iris" style={{ height: `${(day.usa / sum) * 100}%` }} />
                <span className="block w-full bg-gold" style={{ height: `${(day.india / sum) * 100}%` }} />
              </div>
              <span className="text-[11px] font-semibold text-fg-subtle">{day.day}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function LiveTraffic() {
  const { showToast } = useUI();
  const [sectionRef, inView] = useInView({ threshold: 0.05, once: false });
  const [market, setMarket] = useState('all');
  // GET /stats/traffic?market=… — polled while the section is on screen.
  const traffic = useApiQuery(
    'trafficSnapshot',
    { market },
    { pollInterval: inView ? API_CONFIG.polling.trafficSnapshot : null },
  );
  const snapshot = traffic.data;
  const totals = snapshot?.totals ?? {};
  const [tab, setTab] = useState('where');
  const [spinning, setSpinning] = useState(false);

  const onRefresh = () => {
    traffic.refetch({ refresh: true }).catch(() => { });
    setSpinning(true);
    window.setTimeout(() => setSpinning(false), 700);
    showToast('Live numbers refreshed.', { tone: 'info', duration: 2400 });
  };

  return (
    <Section id="live-traffic" tone={900} aria-labelledby="traffic-title">
      <div ref={sectionRef}>
        <SectionHeader
          eyebrow="Proof"
          badge={
            <Badge tone="live" dot pulse size="sm" className="uppercase tracking-wide">
              Updating every second
            </Badge>
          }
          title="Live traffic, in the open"
          titleId="traffic-title"
          description="We show our numbers so brands can judge us. This demo simulates them. In the live product they come from verified human visits only."
        />

        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-fg-muted">Show</span>
            <SegmentedControl label="Market" options={TRAFFIC_MARKETS} value={market} onChange={setMarket} size="sm" />
          </div>
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RotateCw className={cn('h-4 w-4', spinning && 'animate-spin')} aria-hidden="true" />
            Refresh live updates
          </Button>
        </div>

        <div
          aria-busy={traffic.isPreviousData || undefined}
          className={cn('grid grid-cols-2 gap-3 transition-opacity duration-200 sm:gap-4 lg:grid-cols-5', traffic.isPreviousData && 'opacity-50')}
        >
          <div className="col-span-2 lg:col-span-1">
            <StatCard label="Visitors right now" value={totals.visitorsNow} tone="gold" live />
          </div>
          <StatCard label="Visits today" value={totals.visitsToday} />
          <StatCard label="Banner views today" value={totals.bannerViews} />
          <StatCard label="Contact clicks today" value={totals.contactClicks} />
          <StatCard label="Enquiries today" value={totals.enquiries} tone="mint" />
        </div>

        <div
          aria-busy={traffic.isPreviousData || undefined}
          className={cn('mt-4 grid gap-4 transition-opacity duration-200 lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]', traffic.isPreviousData && 'opacity-50')}
        >
          {snapshot ? (
            <VisitorsChart history={snapshot.history} />
          ) : traffic.error ? (
            <ErrorState error={traffic.error} onRetry={traffic.refetch} title="Couldn’t load live traffic." />
          ) : (
            <Skeleton className="min-h-[20rem] rounded-2xl" />
          )}
          <div className="rounded-2xl border border-line bg-ink-900 p-5 sm:p-6">
            <div role="tablist" aria-label="Traffic detail" className="flex flex-wrap gap-2">
              {PANEL_TABS.map((option) => {
                const selected = tab === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    aria-controls="traffic-panel"
                    id={`traffic-tab-${option.value}`}
                    onClick={() => setTab(option.value)}
                    className={cn(
                      'h-9 rounded-full px-4 text-[13px] font-semibold transition-colors',
                      selected ? 'bg-gold text-navy' : 'border border-line-strong text-fg hover:border-fg-subtle',
                    )}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
            <div id="traffic-panel" role="tabpanel" aria-labelledby={`traffic-tab-${tab}`} className="mt-6">
              {!snapshot && <Skeleton className="h-56 w-full" />}
              {snapshot && tab === 'where' && (
                <CityBreakdown cities={snapshot.cities} otherShare={snapshot.otherShare} market={market} />
              )}
              {snapshot && tab === 'feed' && <LiveFeed feed={snapshot.feed} now={Date.now()} />}
              {snapshot && tab === 'week' && <WeeklyChart weekly={snapshot.weekly} />}
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
