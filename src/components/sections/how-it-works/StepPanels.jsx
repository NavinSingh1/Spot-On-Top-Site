import { CircleDollarSign, FileText, MessageSquareText, Radio } from 'lucide-react';
import { useQuote } from '../../../context/QuoteContext';
import { useSettings } from '../../../context/SettingsContext';
import { calculateQuote, gstLabel } from '../../../utils/quote';
import { cn } from '../../../utils/cn';
import { Badge } from '../../ui/Badge';
import { inputClasses, inputSurfaces } from '../../ui/Field';

/** Slots flagged `showInWalkthrough` by the API, or the first three quotable ones. */
export function walkthroughSlots(slots = []) {
  const flagged = slots.filter((slot) => slot.showInWalkthrough);
  return (flagged.length ? flagged : slots.filter((slot) => slot.quotable)).slice(0, 3);
}

/* ── Step 1 · Choose a spot ─────────────────────────────────────────────── */

export function ChooseSpotPanel({ slots, selectedSlotId, onSelect }) {
  const { formatPrice } = useSettings();
  return (
    <div role="radiogroup" aria-label="Demo placements" className="space-y-3 sm:space-y-4 xl:flex xl:h-full xl:flex-col xl:space-y-0 xl:gap-[15px]">
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
              // Design: unselected cards are one step lighter than the box with a faint
              // dashed outline; the selected card gets a gold tint and a gold dashed outline.
              'group relative flex w-full flex-col gap-3 rounded-[10px] border border-transparent px-4 py-4 text-left transition-colors sm:flex-row sm:items-center sm:justify-between sm:px-6 xl:flex-1 xl:py-1.5',
              selected ? 'bg-gold/15' : 'bg-ink-850',
            )}
          >
            {/* SVG outline reproduces the design's 4px dash / 4px gap, which CSS border-dashed cannot. */}
            <svg aria-hidden="true" className="pointer-events-none absolute inset-[0.5px] h-[calc(100%-1px)] w-[calc(100%-1px)] overflow-visible">
              <rect
                width="100%"
                height="100%"
                rx="9.5"
                fill="none"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                className={cn('transition-colors', selected ? 'stroke-gold' : 'stroke-line group-hover:stroke-line-strong')}
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
                <Badge tone="gold" size="card">
                  Selected
                </Badge>
              ) : (
                <Badge tone={slot.places > 1 ? 'iris' : 'open'} size="card">
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

/* ── Step 2 · Add your brand ────────────────────────────────────────────── */

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

/** Three fields only: brand name, work email and one combined contact card line. */
export function AddBrandPanel({ brand, onChange }) {
  const update = (field) => (event) => onChange({ ...brand, [field]: event.target.value });
  return (
    <div className="mx-auto grid w-full max-w-[460px] gap-4 xl:h-full xl:content-center">
      <DemoInput id="demo-brand" label="Brand name" value={brand.name} onChange={update('name')} maxLength={40} />
      <DemoInput id="demo-email" label="Work email" type="email" value={brand.email} onChange={update('email')} />
      <DemoInput id="demo-contact" label="Contact card" value={brand.contactCard} onChange={update('contactCard')} maxLength={60} />
    </div>
  );
}

/* ── Step 3 · Get quote ─────────────────────────────────────────────────── */

/** The walkthrough quote is for one month, so the rate, subtotal and total add up on screen. */
const WALKTHROUGH_MONTHS = 1;

function QuoteRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 py-[3px]">
      <dt className="text-fg-muted">{label}</dt>
      <dd className="truncate text-right font-semibold text-fg">{value}</dd>
    </div>
  );
}

export function QuotePanel({ slotId }) {
  const { formatPrice } = useSettings();
  const { catalog } = useQuote();
  // Base price only: first audience (×1 reach) and no extras.
  const quote = calculateQuote(
    { slotId, months: WALKTHROUGH_MONTHS, audienceId: catalog.audiences[0]?.id, extras: [] },
    catalog,
  );

  return (
    <div className="mx-auto w-full max-w-[340px] text-xs xl:flex xl:h-full xl:flex-col xl:justify-center">
      <div className="flex items-center justify-between gap-3">
        <p className="flex items-center gap-2 font-display text-base font-semibold text-fg">
          <FileText className="h-4 w-4 text-fg-muted" aria-hidden="true" />
          Draft quote
        </p>
        <Badge tone="neutral" size="sm">
          DRAFT
        </Badge>
      </div>
      <p className="mt-1 text-[11px] text-fg-subtle">QT-2026-001 · Advertising booking</p>

      <dl className="mt-3 border-t border-line pt-2.5">
        <QuoteRow label="Selected slot" value={quote.slot.name} />
        <QuoteRow
          label="Campaign duration"
          value={`${quote.duration.months} ${quote.duration.months === 1 ? 'month' : 'months'}`}
        />
        <QuoteRow label="Slot rate" value={`${formatPrice(quote.slot.rate)} / month`} />
      </dl>
      <dl className="mt-2.5 border-t border-line pt-2.5">
        <QuoteRow label="Subtotal" value={formatPrice(quote.subtotal)} />
        <QuoteRow label={gstLabel(quote.gstRate)} value={formatPrice(quote.gst)} />
      </dl>

      <div className="mt-2.5 flex items-center justify-between gap-3 rounded-lg border border-dashed border-gold/60 bg-gold/[0.12] px-3.5 py-2.5">
        <div>
          <p className="text-[13px] font-semibold text-fg">Quote total</p>
          <p className="text-[10px] text-fg-subtle">Inclusive of all taxes</p>
        </div>
        <p className="font-sans text-2xl font-extrabold tabular-nums leading-none text-accent">{formatPrice(quote.total)}</p>
      </div>
    </div>
  );
}

/* ── Step 4 · Go live & watch results ───────────────────────────────────── */

const TIMELINE = [
  { title: 'Request Received', note: 'We reply within one working day', Icon: MessageSquareText, circle: 'bg-[#14A17B]' },
  { title: 'Advance received', note: 'Go-live starts after the advance', Icon: CircleDollarSign, circle: 'bg-[#14A17B]' },
  { title: 'Banner live', note: 'Sponsored, with your contact card', Icon: Radio, circle: 'bg-[#B78418]', live: true },
];

/** Vertical timeline: three status circles joined by a teal line. */
export function LivePanel() {
  return (
    <div className="xl:flex xl:h-full xl:items-center xl:justify-center">
      <ol className="mx-auto w-fit sm:mx-auto xl:mx-0">
        {TIMELINE.map((item, index) => {
          const isLast = index === TIMELINE.length - 1;
          return (
            <li key={item.title} className={cn('relative flex min-h-[44px] items-center gap-4', !isLast && 'mb-[21px]')}>
              {!isLast && (
                <span aria-hidden="true" className="absolute left-[14.5px] top-[38px] h-[33px] w-[3px] rounded-full bg-[#2DD4A7]" />
              )}
              <span className={cn('relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white', item.circle)}>
                <item.Icon className="h-[18px] w-[18px]" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-2 font-display text-base font-bold leading-6 text-fg">
                  {item.title}
                  {item.live && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-fg/10 px-2.5 py-1 text-[11px] font-bold leading-none text-coral-ink">
                      <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-coral" aria-hidden="true" />
                      LIVE NOW
                    </span>
                  )}
                </p>
                <p className="text-sm leading-5 text-fg-muted">{item.note}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}