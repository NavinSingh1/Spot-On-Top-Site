import { findSlot } from './slots';

/**
 * Pure pricing function shared by the quote builder, the quote modal and the
 * "How it works" demo. All amounts are INR.
 *
 *   slot rate × months × (1 − duration discount) × reach multiplier + extras,
 *   then GST on the subtotal.
 *
 * Returns null until the catalog (slots and options) has loaded.
 */
export function calculateQuote({ slotId, months, audienceId, extras = [] }, catalog) {
  if (!catalog?.slots?.length || !catalog.durations?.length || !catalog.audiences?.length) return null;
  const slot = findSlot(catalog.slots, slotId) ?? catalog.slots[0];
  const duration = catalog.durations.find((item) => item.months === months) ?? catalog.durations[0];
  const audience = catalog.audiences.find((item) => item.id === audienceId) ?? catalog.audiences[0];
  const gstRate = catalog.gstRate ?? 0;

  const slotTotal = Math.round(slot.rate * duration.months * (1 - duration.discount) * audience.multiplier);
  const extraLines = (catalog.extras ?? []).filter((extra) => extras.includes(extra.id));
  const extrasTotal = extraLines.reduce((sum, extra) => sum + extra.price, 0);
  const subtotal = slotTotal + extrasTotal;
  const gst = Math.round(subtotal * gstRate);

  return { slot, duration, audience, slotTotal, extraLines, extrasTotal, subtotal, gst, gstRate, total: subtotal + gst };
}

export function gstLabel(gstRate) {
  return `GST (${Math.round((gstRate ?? 0) * 100)}%)`;
}
