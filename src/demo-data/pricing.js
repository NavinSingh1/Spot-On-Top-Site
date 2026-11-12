/**
 * Pricing products. `quotePreset` describes how "Customise this"
 * pre-fills the quote builder.
 */
export const PRODUCTS = [
  {
    id: 'banner-slot',
    name: 'Banner slot',
    price: 125000,
    per: '/ month',
    highlight: true,
    tag: 'Most chosen',
    features: ['Premium website placement', 'Traffic reporting', 'Sponsored label'],
    quotePreset: { slotId: 'home-top' },
  },
  {
    id: 'newsletter-mention',
    name: 'Newsletter mention',
    price: 28000,
    per: '',
    features: ['One newsletter issue', 'Brand link and copy', 'Delivery summary'],
    quotePreset: { addExtra: 'newsletter' },
  },
  {
    id: 'founder-story',
    name: 'Founder Story',
    price: 65000,
    per: '',
    features: ['Editorial profile', 'Homepage feature', 'Social preview'],
    quotePreset: { addExtra: 'founder' },
  },
];
