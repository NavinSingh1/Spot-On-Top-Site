/**
 * DEMO API · a stand-in backend that answers every endpoint in
 * src/config/api.config.js from src/demo-data, with simulated latency.
 * Live numbers (hero, traffic) drift over time to imitate a real feed.
 */
import { API_CONFIG } from '../../config/api.config';
import * as demo from '../../demo-data';
import { readStorage, writeStorage } from '../../utils/storage';
import { clamp, pick, randomBetween, randomInt } from '../../utils/random';

const DAY_MS = 24 * 60 * 60 * 1000;
const VOTES_KEY = 'sot:votes';

const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));
const clone = (value) => JSON.parse(JSON.stringify(value));

let eventId = 0;
function makeEvent(market, at = Date.now()) {
  const resolved = market === 'all' || !market ? (Math.random() < 0.62 ? 'india' : 'usa') : market;
  eventId += 1;
  return {
    id: `evt-${eventId}`,
    market: resolved,
    city: pick(demo.FEED_CITIES[resolved]),
    label: pick(demo.FEED_EVENTS),
    brand: pick(demo.FEED_BRANDS),
    at,
  };
}

/* ── Traffic: one global stream, sliced per market on read ─────────────── */
function createTraffic() {
  const history = Array.from({ length: 60 }, (_, index) =>
    Math.round(demo.BASE_TOTALS.visitorsNow - 8 + Math.sin(index / 5) * 9 + randomBetween(-5, 5)),
  );
  history[history.length - 1] = demo.BASE_TOTALS.visitorsNow;
  const now = Date.now();
  return {
    totals: { ...demo.BASE_TOTALS },
    history,
    feed: Array.from({ length: 10 }, (_, index) => makeEvent('all', now - index * randomInt(4000, 9000))),
    cities: demo.CITIES.map((city) => ({ ...city })),
    lastTick: now,
  };
}

function stepTraffic(state, burst = false) {
  const last = state.history[state.history.length - 1];
  const visitorsNow = Math.round(clamp(last + (burst ? randomBetween(-2, 9) : randomBetween(-5, 5)), 74, 148));
  state.totals = {
    visitorsNow,
    visitsToday: state.totals.visitsToday + randomInt(0, 3),
    bannerViews: state.totals.bannerViews + randomInt(1, 6),
    contactClicks: state.totals.contactClicks + (Math.random() < 0.3 ? 1 : 0),
    enquiries: state.totals.enquiries + (Math.random() < 0.04 ? 1 : 0),
  };
  state.history = [...state.history.slice(1), visitorsNow];
  if (burst || Math.random() < 0.4) state.feed = [makeEvent('all'), ...state.feed].slice(0, 24);
  if (burst) {
    state.cities = state.cities.map((city) => ({ ...city, share: clamp(city.share + randomInt(-1, 1), 3, 30) }));
  }
}

/** Advances the stream by the whole seconds elapsed since the last read. */
function advance(state, step, now = Date.now()) {
  const ticks = Math.min(5, Math.floor((now - state.lastTick) / 1000));
  for (let i = 0; i < ticks; i += 1) step(state);
  if (ticks > 0) state.lastTick += ticks * 1000;
}

function trafficSnapshot({ market = 'all', refresh = false }) {
  advance(traffic, (s) => stepTraffic(s));
  if (refresh) stepTraffic(traffic, true);
  const share = demo.MARKET_SHARE[market] ?? 1;
  const scale = (value) => Math.round(value * share);

  const marketCities = market === 'all' ? traffic.cities : traffic.cities.filter((city) => city.market === market);
  const citySum = marketCities.reduce((sum, city) => sum + city.share, 0);
  const cities =
    market === 'all'
      ? marketCities
      : marketCities.map((city) => ({ ...city, share: Math.round((city.share / citySum) * 100) }));

  return {
    market,
    totals: Object.fromEntries(Object.entries(traffic.totals).map(([key, value]) => [key, scale(value)])),
    history: traffic.history.map((value) => Math.max(1, scale(value))),
    cities,
    otherShare: market === 'all' ? Math.max(0, 100 - citySum) : 0,
    feed: (market === 'all' ? traffic.feed : traffic.feed.filter((event) => event.market === market)).slice(0, 12),
    weekly: demo.LAST_SEVEN_DAYS.map((day) => ({
      day: day.day,
      india: market === 'usa' ? 0 : day.india,
      usa: market === 'india' ? 0 : day.usa,
    })),
  };
}

/* ── Hero card: one drifting counter set per market ────────────────────── */
function createHero(market) {
  const now = Date.now();
  const other = market === 'usa' ? 'india' : 'usa';
  return {
    ...demo.HERO_SEED[market],
    feed: [
      { ...makeEvent(market, now), label: 'Brand profile opened' },
      { ...makeEvent(other, now - 4000), label: 'Brand profile opened' },
    ],
    lastTick: now,
    lastEvent: now,
  };
}

function stepHero(state) {
  state.peopleNow = clamp(state.peopleNow + randomInt(-3, 3), 48, 96);
  state.visitsToday += randomInt(0, 4);
  state.contactClicks += Math.random() < 0.3 ? 1 : 0;
  state.clickRate = clamp(state.clickRate + randomInt(-1, 1) / 1000, 0.06, 0.09);
}

function heroStats({ market = 'usa' }) {
  const key = market === 'india' ? 'india' : 'usa';
  const state = hero[key];
  const now = Date.now();
  const ticks = Math.min(5, Math.floor((now - state.lastTick) / 2500));
  for (let i = 0; i < ticks; i += 1) stepHero(state);
  if (ticks > 0) state.lastTick += ticks * 2500;
  if (now - state.lastEvent >= 4500) {
    const eventMarket = Math.random() < 0.6 ? (key === 'usa' ? 'india' : 'usa') : key;
    state.feed = [makeEvent(eventMarket, now), ...state.feed].slice(0, 2);
    state.lastEvent = now;
  }
  const { peopleNow, visitsToday, contactClicks, clickRate, feed } = state;
  return { market: key, peopleNow, visitsToday, contactClicks, clickRate, feed, preview: demo.HERO_PREVIEWS[key] };
}

/* ── Votes: totals include the visitor's own vote, persisted locally ──── */
function loadUserVotes() {
  const stored = readStorage(VOTES_KEY, null);
  const valid = stored && typeof stored === 'object' && demo.VOTE_CATEGORIES.every((category) => category.id in stored);
  return valid ? stored : { ...demo.DEFAULT_USER_VOTES };
}

function votesResponse() {
  return {
    userVotes: { ...userVotes },
    categories: demo.VOTE_CATEGORIES.map((category) => ({
      id: category.id,
      label: category.label,
      entries: category.entries.map((entry) => ({
        ...entry,
        votes: entry.votes + (userVotes[category.id] === entry.id ? 1 : 0),
      })),
    })),
  };
}

/* ── State ─────────────────────────────────────────────────────────────── */
const traffic = createTraffic();
const hero = { usa: createHero('usa'), india: createHero('india') };
let userVotes = loadUserVotes();
let brandProfile = clone(demo.BRAND_PROFILE);

const handlers = {
  appSettings: () => demo.SETTINGS,
  heroStats,
  trafficSnapshot,
  slots: () => demo.SLOTS,
  brands: () => {
    const now = Date.now();
    return demo.BRANDS.map(({ updatedDaysAgo, ...brand }) => ({
      ...brand,
      updatedAt: new Date(now - updatedDaysAgo * DAY_MS).toISOString(),
    }));
  },
  featured: () => ({ slides: demo.FEATURED_SLIDES, spotOfTheWeek: demo.SPOT_OF_THE_WEEK, comparison: demo.COMPARISON }),
  votes: votesResponse,
  pricing: () => demo.PRODUCTS,
  quoteOptions: () => ({
    placements: demo.QUOTE_PLACEMENTS,
    durations: demo.DURATIONS,
    audiences: demo.AUDIENCES,
    extras: demo.EXTRAS,
    defaults: demo.QUOTE_DEFAULTS,
  }),
  faqs: () => demo.FAQS,
  brandProfile: () => brandProfile,
  waitlistOptions: () => ({ roles: demo.WAITLIST_ROLES, perks: demo.WAITLIST_PERKS }),

  requestQuote: (payload) => ({
    reference: `QT-2026-${randomInt(100, 999)}`,
    status: 'draft',
    brandName: payload.brandName,
    receivedAt: new Date().toISOString(),
  }),
  saveBrandProfile: ({ name, pitch, email }) => {
    brandProfile = { ...brandProfile, name, pitch, email };
    return brandProfile;
  },
  castVote: ({ categoryId, entryId }) => {
    userVotes = { ...userVotes, [categoryId]: entryId ?? null };
    writeStorage(VOTES_KEY, userVotes);
    return votesResponse();
  },
  joinWaitlist: () => ({ ok: true, position: randomInt(120, 480) }),
  recordContactView: ({ brandId }) => ({ ok: true, brandId }),
};

export const demoApi = {
  async handle(name, params = {}) {
    const handler = handlers[name];
    if (!handler) throw new Error(`No demo data for endpoint "${name}". Add a handler in src/services/demo/demoApi.js.`);
    await wait(API_CONFIG.demoLatencyMs);
    return clone(handler(params));
  },
};
