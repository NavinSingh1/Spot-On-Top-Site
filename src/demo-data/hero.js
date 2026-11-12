/**
 * DEMO DATA · GET /stats/hero?market=usa|india
 * Starting numbers for the hero card. The demo API drifts them over time.
 * `preview` decides the sponsored image: a real API can return
 * { imageUrl, imageAlt } instead of a built-in `kind`.
 */
export const HERO_SEED = {
  usa: { peopleNow: 72, visitsToday: 2917, contactClicks: 80, clickRate: 0.075 },
  india: { peopleNow: 64, visitsToday: 3402, contactClicks: 96, clickRate: 0.082 },
};

export const HERO_PREVIEWS = {
  usa: { kind: 'billboard', imageAlt: 'Street billboard in a city at dusk advertising Spot On Top placements in the USA' },
  india: { kind: 'silk', imageAlt: 'Sponsored banner for Kaveri Silk House' },
};
