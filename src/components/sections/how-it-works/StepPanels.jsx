import { ArrowRight, CheckCircle2, Mail, Phone } from 'lucide-react';
import { useQuote } from '../../../context/QuoteContext';
import { useSettings } from '../../../context/SettingsContext';
import { calculateQuote, gstLabel } from '../../../utils/quote';
import { cn } from '../../../utils/cn';
import { formatNumber } from '../../../utils/currency';
import { Avatar, initialsFrom } from '../../ui/Avatar';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { inputClasses, inputSurfaces } from '../../ui/Field';

/** Slots flagged `showInWalkthrough` by the API, or the first three quotable ones. */
export function walkthroughSlots(slots = []) {
  const flagged = slots.filter((slot) => slot.showInWalkthrough);
  return (flagged.length ? flagged : slots.filter((slot) => slot.quotable)).slice(0, 3);
}

export function ChooseSpotPanel({ slots, selectedSlotId, onSelect }) {
  const { formatPrice } = useSettings();
  return (
    <div role="radiogroup" aria-label="Demo placements" className="space-y-3 sm:space-y-4 xl:space-y-5">
      {walkthroughSlots(slots).map((slot) => {
        const selected = slot.id === selectedSlotId;
        const subtitle =
          slot.places > 1 ? `Rotating, ${slot.taken} of ${slot.places} places taken` : slot.description;
        return (
          <button
            key={slot.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onSelect(slot.id)}
            className={cn(
              // Figma: unselected cards sit one step lighter than the box; the selected
              // card drops to the box colour. Both share the same faint dashed outline.
              'group relative flex w-full flex-col gap-3 rounded-[10px] border border-transparent px-4 py-4 text-left transition-colors sm:flex-row sm:items-center sm:justify-between sm:px-6 xl:min-h-[108px] xl:py-5',
              selected ? 'bg-ink-900' : 'bg-ink-850',
            )}
          >
            {/* SVG outline reproduces Figma's 4px dash / 4px gap, which CSS border-dashed cannot. */}
            <svg aria-hidden="true" className="pointer-events-none absolute inset-[0.5px] h-[calc(100%-1px)] w-[calc(100%-1px)] overflow-visible">
              <rect
                width="100%"
                height="100%"
                rx="9.5"
                fill="none"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                className={cn('transition-colors', selected ? 'stroke-line' : 'stroke-line group-hover:stroke-line-strong')}
              />
            </svg>
            <span className="min-w-0">
              <span className="block font-display text-base font-bold leading-snug text-fg sm:text-lg xl:text-xl">
                {slot.name}
              </span>
              <span className="mt-0.5 block text-sm leading-snug text-fg-muted sm:text-base xl:mt-0 xl:text-lg">{subtitle}</span>
            </span>
            <span className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-end sm:gap-1.5">
              {selected ? (
                <Badge tone="gold" size="lg">
                  Selected
                </Badge>
              ) : (
                <Badge tone={slot.places > 1 ? 'iris' : 'open'} size="lg">
                  {slot.statusLabel}
                </Badge>
              )}
              <span className="whitespace-nowrap text-sm font-bold leading-snug text-fg-muted sm:text-base xl:text-lg">
                {formatPrice(slot.rate)} a month
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

function DemoInput({ id, label, ...props }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-semibold text-fg-muted">
        {label}
      </label>
      <input id={id} className={cn(inputClasses, inputSurfaces.default, 'h-11')} {...props} />
    </div>
  );
}

export function AddBrandPanel({ brand, onChange }) {
  const update = (field) => (event) => onChange({ ...brand, [field]: event.target.value });
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)]">
      <div className="grid gap-4">
        <DemoInput id="demo-brand" label="Brand name" value={brand.name} onChange={update('name')} maxLength={40} />
        <DemoInput id="demo-email" label="Work email" type="email" value={brand.email} onChange={update('email')} />
        <div className="grid gap-4 sm:grid-cols-2">
          <DemoInput id="demo-contact" label="Contact name" value={brand.contactName} onChange={update('contactName')} />
          <DemoInput id="demo-phone" label="Phone" type="tel" value={brand.phone} onChange={update('phone')} />
        </div>
      </div>
      <div className="rounded-xl border border-line bg-ink-800/70 p-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-fg-subtle">Contact card preview</p>
        <div className="mt-4 flex items-center gap-3">
          <Avatar initials={initialsFrom(brand.contactName || brand.name)} tone="gold" size="md" />
          <div className="min-w-0">
            <p className="truncate font-display font-semibold text-fg">{brand.contactName || 'Your name'}</p>
            <p className="truncate text-sm text-fg-muted">{brand.name || 'Your brand'}</p>
          </div>
        </div>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex items-center gap-2 text-fg-muted">
            <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
            <dt className="sr-only">Email</dt>
            <dd className="truncate">{brand.email || 'you@company.com'}</dd>
          </div>
          <div className="flex items-center gap-2 text-fg-muted">
            <Phone className="h-4 w-4 shrink-0" aria-hidden="true" />
            <dt className="sr-only">Phone</dt>
            <dd>{brand.phone || '+1 0000 00000'}</dd>
          </div>
        </dl>
        <p className="mt-5 border-t border-line pt-4 text-xs text-fg-subtle">We reply within one working day.</p>
      </div>
    </div>
  );
}

export function QuotePanel({ slotId, months, onMonthsChange, brand }) {
  const { formatPrice } = useSettings();
  const { openQuoteBuilder } = useQuote();
  const { catalog } = useQuote();
  // Base price only: first audience (×1 reach) and no extras.
  const quote = calculateQuote({ slotId, months, audienceId: catalog.audiences[0]?.id, extras: [] }, catalog);

  const rows = [
    ['Selected slot', quote.slot.name],
    ['Slot rate', `${formatPrice(quote.slot.rate)} / month`],
    ['Contact card', `${brand.contactName} ${brand.phone}`.trim() || 'Not added yet'],
  ];

  return (
    <div className="rounded-xl border border-line bg-ink-800/60">
      <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
        <div>
          <p className="font-display text-lg font-semibold text-fg">Draft quote</p>
          <p className="text-sm text-fg-subtle">QT-2026-001 · Advertising booking</p>
        </div>
        <Badge tone="pending">DRAFT</Badge>
      </div>
      <dl className="divide-y divide-line px-5 text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-4 py-3">
            <dt className="text-fg-muted">{label}</dt>
            <dd className="truncate text-right font-semibold text-fg">{value}</dd>
          </div>
        ))}
        <div className="flex flex-wrap items-center justify-between gap-3 py-3">
          <dt className="text-fg-muted">Campaign duration</dt>
          <dd className="flex gap-1">
            {catalog.durations.map((duration) => (
              <button
                key={duration.months}
                type="button"
                aria-pressed={months === duration.months}
                onClick={() => onMonthsChange(duration.months)}
                className={cn(
                  'h-7 rounded-md px-2.5 text-xs font-bold transition-colors',
                  months === duration.months ? 'bg-gold text-navy' : 'bg-ink-750 text-fg-muted hover:text-fg',
                )}
              >
                {duration.months}m
              </button>
            ))}
          </dd>
        </div>
        <div className="flex items-center justify-between py-3">
          <dt className="text-fg-muted">Subtotal</dt>
          <dd className="font-semibold tabular-nums text-fg">{formatPrice(quote.subtotal)}</dd>
        </div>
        <div className="flex items-center justify-between py-3">
          <dt className="text-fg-muted">{gstLabel(quote.gstRate)}</dt>
          <dd className="font-semibold tabular-nums text-fg">{formatPrice(quote.gst)}</dd>
        </div>
        <div className="flex items-end justify-between py-4">
          <dt>
            <span className="block font-semibold text-fg">Total</span>
            <span className="text-xs text-fg-subtle">Inclusive of all taxes</span>
          </dt>
          <dd className="font-sans text-2xl font-extrabold tabular-nums text-accent">{formatPrice(quote.total)}</dd>
        </div>
      </dl>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-4">
        <Badge tone="open" dot>
          READY TO BOOK
        </Badge>
        <Button size="sm" variant="outline" onClick={() => openQuoteBuilder({ slotId, brandName: brand.name })}>
          Open in quote builder <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}

const TIMELINE = [
  { title: 'Request received', note: 'We reply within one working day' },
  { title: 'Advance received', note: 'Go live starts after the advance' },
  { title: 'Banner live', note: 'Sponsored, with your contact card', live: true },
];


/** `stats` come from GET /brand-profile → stats: { views, enquiries, weeklyViews }. */
export function LivePanel({ brand, stats }) {
  const week = stats?.weeklyViews?.length ? stats.weeklyViews : [0];
  const peak = Math.max(1, ...week);
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)]">
      <ol className="relative space-y-5 pl-1">
        {TIMELINE.map((item, index) => (
          <li key={item.title} className="relative flex gap-4">
            {index < TIMELINE.length - 1 && (
              <span aria-hidden="true" className="absolute left-[11px] top-7 h-[calc(100%-4px)] w-px bg-line-strong" />
            )}
            <CheckCircle2 className="relative h-6 w-6 shrink-0 fill-mint/15 text-mint" aria-hidden="true" />
            <div className="min-w-0">
              <p className="flex flex-wrap items-center gap-2 font-display font-semibold text-fg">
                {item.title}
                {item.live && (
                  <Badge tone="live" dot pulse size="sm">
                    LIVE NOW
                  </Badge>
                )}
              </p>
              <p className="mt-0.5 text-sm text-fg-muted">{item.note}</p>
            </div>
          </li>
        ))}
      </ol>
      <div className="rounded-xl border border-line bg-ink-800/70 p-5">
        <p className="font-display font-semibold text-fg">{brand.name || 'Your brand'}</p>
        <p className="text-xs text-fg-subtle">Weekly report, one per banner. Demo data.</p>
        <div className="mt-4 flex gap-6">
          <p>
            <span className="block font-sans text-2xl font-extrabold tabular-nums text-fg">{formatNumber(stats?.views ?? 0)}</span>
            <span className="text-xs text-fg-muted">profile views</span>
          </p>
          <p>
            <span className="block font-sans text-2xl font-extrabold tabular-nums text-mint-ink">{formatNumber(stats?.enquiries ?? 0)}</span>
            <span className="text-xs text-fg-muted">enquiries</span>
          </p>
        </div>
        <div className="mt-5 flex h-20 items-end gap-1.5" role="img" aria-label="Profile views over the last seven days, rising toward today">
          {week.map((value, index) => (
            <span
              key={index}
              className={cn('flex-1 rounded-t', index === week.length - 1 ? 'bg-gold' : 'bg-iris/50')}
              style={{ height: `${(value / peak) * 100}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
