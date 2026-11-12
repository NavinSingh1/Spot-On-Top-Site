/**
 * Mock REST API for local testing of "real API" mode.
 *
 *   npm run mock-api                     → http://localhost:8787
 *   PORT=9000 npm run mock-api
 *   FAIL=faqs,pricing npm run mock-api   → those endpoints return HTTP 500
 *
 * Then in .env:  VITE_API_BASE_URL=http://localhost:8787
 *                VITE_USE_DEMO_DATA=false
 *
 * Responses use the same shapes as src/demo-data, so this file doubles as a
 * reference for what your real backend should return.
 */
import { createServer } from 'node:http';
import * as demo from '../src/demo-data/index.js';

const PORT = Number(process.env.PORT || 8787);
const FAIL = new Set((process.env.FAIL || '').split(',').map((s) => s.trim()).filter(Boolean));
const DAY = 24 * 60 * 60 * 1000;

let brandProfile = { ...demo.BRAND_PROFILE };
let userVotes = { ...demo.DEFAULT_USER_VOTES };
const drift = (n, spread) => n + Math.round((Math.random() - 0.5) * spread);
const pick = (list) => list[Math.floor(Math.random() * list.length)];

function feed(market, count) {
  const now = Date.now();
  return Array.from({ length: count }, (_, i) => {
    const m = market === 'all' ? pick(['india', 'usa']) : market;
    return { id: `m-${now}-${i}`, market: m, city: pick(demo.FEED_CITIES[m]), label: pick(demo.FEED_EVENTS), brand: pick(demo.FEED_BRANDS), at: new Date(now - i * 6000).toISOString() };
  });
}

function votes() {
  return {
    userVotes,
    categories: demo.VOTE_CATEGORIES.map((c) => ({ ...c, entries: c.entries.map((e) => ({ ...e, votes: e.votes + (userVotes[c.id] === e.id ? 1 : 0) })) })),
  };
}

const routes = {
  'GET /settings': () => demo.SETTINGS,
  'GET /stats/hero': (q) => {
    const market = q.get('market') === 'india' ? 'india' : 'usa';
    const seed = demo.HERO_SEED[market];
    return { market, peopleNow: drift(seed.peopleNow, 6), visitsToday: drift(seed.visitsToday, 10), contactClicks: seed.contactClicks, clickRate: seed.clickRate, feed: feed(market, 2), preview: demo.HERO_PREVIEWS[market] };
  },
  'GET /stats/traffic': (q) => {
    const market = ['india', 'usa'].includes(q.get('market')) ? q.get('market') : 'all';
    const share = demo.MARKET_SHARE[market];
    const cities = market === 'all' ? demo.CITIES : demo.CITIES.filter((c) => c.market === market);
    const sum = cities.reduce((t, c) => t + c.share, 0);
    return {
      market,
      totals: Object.fromEntries(Object.entries(demo.BASE_TOTALS).map(([k, v]) => [k, Math.round(drift(v, 4) * share)])),
      history: Array.from({ length: 60 }, (_, i) => Math.round((96 + Math.sin(i / 5) * 9) * share)),
      cities: market === 'all' ? cities : cities.map((c) => ({ ...c, share: Math.round((c.share / sum) * 100) })),
      otherShare: market === 'all' ? 100 - sum : 0,
      feed: feed(market, 8),
      weekly: demo.LAST_SEVEN_DAYS.map((d) => ({ day: d.day, india: market === 'usa' ? 0 : d.india, usa: market === 'india' ? 0 : d.usa })),
    };
  },
  'GET /slots': () => demo.SLOTS,
  'GET /brands': () => demo.BRANDS.map(({ updatedDaysAgo, ...b }) => ({ ...b, updatedAt: new Date(Date.now() - updatedDaysAgo * DAY).toISOString() })),
  'GET /featured': () => ({ slides: demo.FEATURED_SLIDES, spotOfTheWeek: demo.SPOT_OF_THE_WEEK, comparison: demo.COMPARISON }),
  'GET /votes': votes,
  'GET /pricing': () => demo.PRODUCTS,
  'GET /quote-options': () => ({ placements: demo.QUOTE_PLACEMENTS, durations: demo.DURATIONS, audiences: demo.AUDIENCES, extras: demo.EXTRAS, defaults: demo.QUOTE_DEFAULTS }),
  'GET /faqs': () => demo.FAQS,
  'GET /brand-profile': () => brandProfile,
  'GET /waitlist/options': () => ({ roles: demo.WAITLIST_ROLES, perks: demo.WAITLIST_PERKS }),
  'POST /quotes': (_, body) => ({ reference: `QT-2026-${100 + Math.floor(Math.random() * 900)}`, status: 'received', brandName: body.brandName }),
  'PUT /brand-profile': (_, body) => (brandProfile = { ...brandProfile, name: body.name, pitch: body.pitch, email: body.email }),
  'POST /votes': (_, body) => {
    userVotes = { ...userVotes, [body.categoryId]: body.entryId ?? null };
    return votes();
  },
  'POST /waitlist': () => ({ ok: true }),
};

createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') return res.writeHead(204).end();

  const url = new URL(req.url, `http://localhost:${PORT}`);
  let key = `${req.method} ${url.pathname.replace(/\/+$/, '') || '/'}`;
  if (/^POST \/brands\/[^/]+\/contact-views$/.test(key)) key = 'POST /brands/:brandId/contact-views';
  const handler = key === 'POST /brands/:brandId/contact-views' ? () => ({ ok: true }) : routes[key];
  const failName = url.pathname.split('/').filter(Boolean).pop();

  let body = {};
  if (req.method !== 'GET') {
    let raw = '';
    for await (const chunk of req) raw += chunk;
    try { body = raw ? JSON.parse(raw) : {}; } catch { body = {}; }
  }

  res.setHeader('Content-Type', 'application/json');
  if (!handler) return res.writeHead(404).end(JSON.stringify({ message: `No mock for ${key}` }));
  if (FAIL.has(failName)) return res.writeHead(500).end(JSON.stringify({ message: `Mock failure for ${url.pathname}` }));
  console.log(key);
  res.writeHead(200).end(JSON.stringify(handler(url.searchParams, body)));
}).listen(PORT, () => console.log(`Mock API on http://localhost:${PORT}${FAIL.size ? ` (failing: ${[...FAIL].join(', ')})` : ''}`));
