/**
 * DEMO DATA · GET /stats/traffic
 * Seed numbers for the simulated live traffic board. The demo API ticks
 * these every second to imitate a real-time analytics feed.
 */
/** Share of traffic each market contributes. "all" is the full total. */
export const MARKET_SHARE = { all: 1, india: 0.59, usa: 0.29 };

export const BASE_TOTALS = {
  visitorsNow: 102,
  visitsToday: 4838,
  bannerViews: 10821,
  contactClicks: 410,
  enquiries: 38,
};

export const CITIES = [
  { name: 'Mumbai', market: 'india', share: 23 },
  { name: 'Delhi NCR', market: 'india', share: 17 },
  { name: 'Bengaluru', market: 'india', share: 13 },
  { name: 'Hyderabad', market: 'india', share: 6 },
  { name: 'New York', market: 'usa', share: 14 },
  { name: 'San Francisco', market: 'usa', share: 10 },
  { name: 'Dallas', market: 'usa', share: 5 },
];

export const LAST_SEVEN_DAYS = [
  { day: 'Thu', india: 2410, usa: 1180 },
  { day: 'Fri', india: 2650, usa: 1240 },
  { day: 'Sat', india: 1980, usa: 960 },
  { day: 'Sun', india: 1840, usa: 1010 },
  { day: 'Mon', india: 2890, usa: 1420 },
  { day: 'Tue', india: 3010, usa: 1530 },
  { day: 'Wed', india: 2854, usa: 1403 },
];

export const FEED_EVENTS = [
  'Brand profile opened',
  'Contact card viewed',
  'Banner clicked',
  'Enquiry sent',
  'Newsletter link opened',
];

export const FEED_BRANDS = [
  'Harlow & Pine',
  'Kaveri Silk House',
  'Veda Estates',
  'Northstar Labs',
  'Marlowe Denim',
  'Kaveri Studio',
];

export const FEED_CITIES = {
  india: ['Mumbai', 'Delhi NCR', 'Bengaluru', 'Hyderabad', 'Pune', 'Chennai'],
  usa: ['New York', 'San Francisco', 'Dallas', 'Seattle', 'Austin'],
};
