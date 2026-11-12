import { useMemo } from 'react';
import { Download } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { gstLabel } from '../../utils/quote';
import { usesDemoData } from '../../config/api.config';
import { Button } from '../ui/Button';
import { CopyButton } from '../ui/CopyButton';
import { Modal } from '../ui/Modal';

function buildSummary({ reference, brandName, breakdown, formatPrice }) {
  const lines = [
    `Spot On Top quote ${reference}`,
    `Brand: ${brandName}`,
    `Placement: ${breakdown.slot.name}`,
    `Duration: ${breakdown.duration.label} (${breakdown.duration.note})`,
    `Audience: ${breakdown.audience.label} (x${breakdown.audience.multiplier} reach)`,
    '',
    `${breakdown.slot.shortName} · ${breakdown.duration.label}: ${formatPrice(breakdown.slotTotal)}`,
    ...breakdown.extraLines.map((extra) => `${extra.label}: ${formatPrice(extra.price)}`),
    `${gstLabel(breakdown.gstRate)}: ${formatPrice(breakdown.gst)}`,
    `Estimated total: ${formatPrice(breakdown.total)}`,
    '',
    usesDemoData('requestQuote') ? 'Demo only. No inventory is reserved and nothing is sent.' : 'Estimate only. Final pricing is confirmed by our team.',
  ];
  return lines.join('\n');
}

export function QuoteRequestModal({ open, onClose, reference, brandName, breakdown }) {
  const { formatPrice } = useSettings();
  const summary = useMemo(
    () => (open ? buildSummary({ reference, brandName, breakdown, formatPrice }) : ''),
    [open, reference, brandName, breakdown, formatPrice],
  );

  const download = () => {
    const blob = new Blob([summary], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${reference}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const rows = [
    [`${breakdown.slot.shortName} · ${breakdown.duration.label}`, breakdown.slotTotal],
    ...breakdown.extraLines.map((extra) => [extra.label, extra.price]),
    [gstLabel(breakdown.gstRate), breakdown.gst],
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Your draft quote is ready"
      description={`${reference} for ${brandName}. ${usesDemoData('requestQuote') ? 'Nothing has been sent or reserved.' : 'Our team will reply within one working day.'}`}
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
          <CopyButton text={summary} label="Copy summary" className="h-10 justify-center px-3.5" />
          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <Button variant="outline" onClick={download}>
              <Download className="h-4 w-4" aria-hidden="true" />
              Download summary
            </Button>
            <Button onClick={onClose}>Done</Button>
          </div>
        </div>
      }
    >
      <div className="rounded-xl border border-line bg-ink-900 p-4">
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          <dt className="text-fg-muted">Placement</dt>
          <dd className="text-right font-semibold">{breakdown.slot.name}</dd>
          <dt className="text-fg-muted">Duration</dt>
          <dd className="text-right font-semibold">{breakdown.duration.label}</dd>
          <dt className="text-fg-muted">Audience</dt>
          <dd className="text-right font-semibold">{breakdown.audience.label}</dd>
        </dl>
      </div>
      <dl className="mt-4 divide-y divide-line text-sm">
        {rows.map(([label, amount]) => (
          <div key={label} className="flex items-center justify-between py-2.5">
            <dt className="text-fg-muted">{label}</dt>
            <dd className="font-semibold tabular-nums">{formatPrice(amount)}</dd>
          </div>
        ))}
        <div className="flex items-center justify-between pt-3">
          <dt className="font-semibold">Estimated total</dt>
          <dd className="font-sans text-2xl font-extrabold tabular-nums text-accent">{formatPrice(breakdown.total)}</dd>
        </div>
      </dl>
    </Modal>
  );
}
