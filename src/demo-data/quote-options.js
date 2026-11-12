/**
 * DEMO DATA · GET /quote-options
 * Choices offered in the quote builder. Prices are INR before GST.
 * `defaults` is the configuration the builder opens with.
 */
export const QUOTE_PLACEMENTS = ['home-top', 'home-middle', 'category', 'article-inline'];

export const DURATIONS = [
  { months: 1, label: '1 month', note: 'Standard rate', discount: 0 },
  { months: 3, label: '3 months', note: 'Save 5%', discount: 0.05 },
  { months: 6, label: '6 months', note: 'Save 10%', discount: 0.1 },
  { months: 12, label: '12 months', note: 'Save 18%', discount: 0.18 },
];

export const AUDIENCES = [
  { id: 'india', label: 'India', multiplier: 1, flags: ['india'] },
  { id: 'usa', label: 'USA', multiplier: 1.1, flags: ['usa'] },
  { id: 'both', label: 'India and USA', multiplier: 1.7, flags: ['india', 'usa'] },
];

export const EXTRAS = [
  { id: 'newsletter', label: 'Newsletter mention', price: 28000 },
  { id: 'founder', label: 'Founder story', price: 65000 },
  { id: 'report', label: 'Monthly traffic report', price: 12000 },
];

export const QUOTE_DEFAULTS = {
  slotId: 'home-top',
  months: 12,
  audienceId: 'india',
  extras: ['newsletter'],
};
