#!/usr/bin/env node
/* Checks js/cities.js: the shape of every entry, and every gallery article
   against the live MediaWiki API. No dependencies; needs Node 18+ for fetch.

     node check.js                 # shape and articles, whole deck
     node check.js havana hanoi    # only these city ids
     node check.js --shape         # shape only, no network

   The shape rules are the ones the README documents — six gallery slots, four
   things to do, six facts — plus the invariants that keep the site coherent:
   ids and accent colours unique, no article used by two cities.

   Four things go wrong with an article title, and only the first is
   obvious enough to spot by eye:

     1. it stops existing, or its lead image is removed;
     2. its lead image is a map, a logo or a coat of arms rather than a
        photograph — common for city and region articles;
     3. it still resolves, but Wikipedia has retargeted the redirect to a
        generic concept: "Malecón" became "Jetty", "Temple of Literature"
        became "Temple of Confucius". The title works, the image is a real
        photograph, and the gallery shows the wrong place entirely;
     4. the lead image is too small to fill a gallery slot without
        looking soft.
*/

const fs = require("fs");
const path = require("path");

const API = "https://en.wikipedia.org/w/api.php";
const THUMB_PX = 1600;       // keep in step with THUMB_PX in js/main.js
const MIN_WIDTH = 700;       // below this a photo looks soft in a gallery slot
const BATCH = 40;            // titles per API request

/* Lead images that are diagrams rather than photographs. Matched on word
   boundaries against the percent-decoded filename, so "sémaphore" does not
   read as "map". */
const NOT_A_PHOTO =
  /(?:^|[_\-. ])(map|locator|logo|coat[_ ]of[_ ]arms|flag|seal|plan|diagram|quartiers)(?:$|[_\-. 0-9])/;

/* Words a redirect is allowed to lose without it meaning anything: these are
   ordinary retitlings, not a change of subject. */
const NOISE = /\b(the|of|at|in|on|and|a|an|st|saint|mount|city|national|museum|park|square|street|palace|mosque|cathedral|temple|tower|fort|market|garden|gardens)\b/g;

const words = (s) =>
  new Set(
    s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9\s]/g, " ").replace(NOISE, " ")
      .split(/\s+/).filter((w) => w.length > 2)
  );

const levenshtein = (a, b) => {
  const d = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = d[0]++;
    for (let j = 1; j <= b.length; j++) {
      const cur = d[j];
      d[j] = Math.min(d[j] + 1, d[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = cur;
    }
  }
  return d[b.length];
};

const skeleton = (w) => w.replace(/[aeiou]/g, "");

/* Two words name the same thing if they are spelt almost alike, share a stem,
   or share a consonant skeleton — the last covers transliteration, where
   "Koutoubia" and "Kutubiyya" are the same mosque. */
function sameThing(a, b) {
  if (a === b) return true;
  if (levenshtein(a, b) <= 2) return true;
  if (a.length >= 4 && b.length >= 4 && (a.startsWith(b.slice(0, 4)) || b.startsWith(a.slice(0, 4)))) return true;
  const [x, y] = [skeleton(a), skeleton(b)];
  return x.length >= 3 && y.length >= 3 && (x.startsWith(y) || y.startsWith(x));
}

/** Did the redirect drop the distinguishing part of the title? */
function dropsSubject(from, to) {
  const a = words(from), b = words(to);
  if (a.size === 0) return false;
  for (const w of a) for (const v of b) if (sameThing(w, v)) return false;
  return true;
}

/* Shape rules. The counts are not arbitrary: six gallery slots fill the grid
   with the first as the hero, four things to do read best, six facts fill the
   panel. A deck that drifts from them looks broken rather than varied. */
const SHAPE = {
  gallery: [6, 6],
  thingsToDo: [4, 4],
  facts: [6, 6],
  famousFor: [4, 6]
};

/* Two accents closer than this are indistinguishable in the hero, so a reader
   gets no sense that the colour belongs to the city. Advisory only. */
const MIN_ACCENT_DISTANCE = 4;

/** CIE L*a*b*, so colours are compared the way an eye compares them. */
function lab(hex) {
  const [r, g, b] = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v > 0.04045 ? ((v + 0.055) / 1.055) ** 2.4 : v / 12.92));
  const X = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
  const Y = r * 0.2126 + g * 0.7152 + b * 0.0722;
  const Z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;
  const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  return [116 * f(Y) - 16, 500 * (f(X) - f(Y)), 200 * (f(Y) - f(Z))];
}

const accentDistance = (a, b) => {
  const [p, q] = [lab(a), lab(b)];
  return Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]);
};

const filled = (v) => typeof v === "string" && v.trim().length > 0;
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

/**
 * Check the dataset's shape. Runs against whatever subset was asked for, but
 * uniqueness is judged across the whole deck — a duplicate id is a duplicate
 * whether or not both cities were named on the command line.
 */
function checkShape(cities, all) {
  const problems = [];
  const say = (city, why) => problems.push([city, why]);

  for (const c of cities) {
    const where = c.name || c.id || "(unnamed entry)";

    if (!filled(c.id)) say(where, "no id");
    else if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(c.id)) say(where, `id "${c.id}" is not kebab-case, so it makes an awkward #fragment`);

    for (const key of ["name", "country", "region", "tagline", "intro"]) {
      if (!filled(c[key])) say(where, `${key} is missing or empty`);
    }

    if (!/^#[0-9a-fA-F]{6}$/.test(c.accent || "")) say(where, `accent "${c.accent}" is not a six-digit hex colour`);

    for (const [key, [min, max]] of Object.entries(SHAPE)) {
      const list = c[key];
      const n = key === "facts" ? Object.keys(list || {}).length : (list || []).length;
      if (!list) { say(where, `${key} is missing`); continue; }
      if (n < min || n > max) {
        say(where, min === max ? `${n} ${key}, expected ${min}` : `${n} ${key}, expected ${min}-${max}`);
      }
    }

    (c.thingsToDo || []).forEach((t, i) => {
      if (!filled(t.title) || !filled(t.text)) say(where, `thingsToDo[${i}] needs both a title and text`);
    });
    (c.gallery || []).forEach((g, i) => {
      if (!filled(g.article) || !filled(g.caption)) say(where, `gallery[${i}] needs both an article and a caption`);
    });
    Object.entries(c.facts || {}).forEach(([k, v]) => {
      if (!filled(v)) say(where, `fact "${k}" has no value`);
    });
  }

  // Uniqueness, judged over the whole deck.
  const seenIds = new Map();
  const seenAccents = new Map();
  const seenArticles = new Map();
  for (const c of all) {
    if (seenIds.has(c.id)) say(c.name, `id "${c.id}" is already used by ${seenIds.get(c.id)}`);
    else seenIds.set(c.id, c.name);

    const accent = (c.accent || "").toLowerCase();
    if (seenAccents.has(accent)) say(c.name, `accent ${accent} is already used by ${seenAccents.get(accent)}`);
    else seenAccents.set(accent, c.name);

    for (const g of c.gallery || []) {
      if (seenArticles.has(g.article)) say(c.name, `"${g.article}" is already in ${seenArticles.get(g.article)}'s gallery`);
      else seenArticles.set(g.article, c.name);
    }
  }

  return problems;
}

/** Accent pairs too close to tell apart. Advisory, and whole-deck by nature. */
function closeAccents(all) {
  const out = [];
  const valid = all.filter((c) => /^#[0-9a-fA-F]{6}$/.test(c.accent || ""));
  for (let i = 0; i < valid.length; i++) {
    for (let j = i + 1; j < valid.length; j++) {
      const d = accentDistance(valid[i].accent, valid[j].accent);
      if (d < MIN_ACCENT_DISTANCE) out.push([d, valid[i], valid[j]]);
    }
  }
  return out.sort((a, b) => a[0] - b[0]);
}

function loadCities() {
  const src = fs.readFileSync(path.join(__dirname, "js", "cities.js"), "utf8");
  const sandbox = {};
  new Function("globalThis", src + "\nglobalThis.CITIES = CITIES;")(sandbox);
  return sandbox.CITIES;
}

async function api(titles) {
  const params = new URLSearchParams({
    action: "query", format: "json", redirects: "1", prop: "pageimages",
    piprop: "thumbnail|original", pithumbsize: String(THUMB_PX), titles: titles.join("|")
  });
  for (let attempt = 0; ; attempt++) {
    try {
      const res = await fetch(`${API}?${params}`, {
        headers: { "User-Agent": "atlas-shuffle-check/1.0 (repo tooling)" }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return (await res.json()).query || {};
    } catch (err) {
      if (attempt >= 4) throw err;
      await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt));
    }
  }
}

(async () => {
  const args = process.argv.slice(2);
  const shapeOnly = args.includes("--shape");
  const wanted = args.filter((a) => !a.startsWith("--"));

  const all = loadCities();
  const cities = all.filter((c) => !wanted.length || wanted.includes(c.id));
  if (!cities.length) {
    console.error(`No city matches ${wanted.join(", ")}`);
    process.exit(2);
  }

  /* ── Shape ─────────────────────────────────────────────── */

  const shape = checkShape(cities, all);
  const near = wanted.length ? [] : closeAccents(all);

  console.log(plural(cities.length, "city", "cities"));
  if (shape.length) {
    console.log(`${shape.length} shape problem${shape.length > 1 ? "s" : ""}:\n`);
    for (const [city, why] of shape) console.log(`  ${city} — ${why}`);
  } else {
    console.log("shape is sound: ids, accents and articles all unique, counts as documented");
  }
  if (near.length) {
    console.log(`\n${near.length} accent pair${near.length > 1 ? "s" : ""} close enough to look alike (advisory):`);
    for (const [d, a, b] of near) {
      console.log(`  ${a.name} ${a.accent} and ${b.name} ${b.accent} — ${d.toFixed(1)} apart`);
    }
  }

  if (shapeOnly) process.exit(shape.length ? 1 : 0);
  console.log("");

  /* ── Articles ──────────────────────────────────────────── */

  const owner = new Map();   // article title -> city name
  cities.forEach((c) => c.gallery.forEach((g) => owner.set(g.article, c.name)));
  const titles = [...owner.keys()];

  const info = new Map();    // resolved title -> page
  const forward = new Map(); // original title -> resolved title

  for (let i = 0; i < titles.length; i += BATCH) {
    let q;
    try {
      q = await api(titles.slice(i, i + BATCH));
    } catch (err) {
      // The shape check above still stands and is worth keeping.
      console.log(`could not reach Wikipedia (${err.message}) — articles not checked`);
      process.exit(shape.length ? 1 : 2);
    }
    (q.normalized || []).forEach((n) => forward.set(n.from, n.to));
    (q.redirects || []).forEach((r) => forward.set(r.from, r.to));
    Object.values(q.pages || {}).forEach((p) => info.set(p.title, p));
  }

  const resolve = (t) => {
    let cur = t;
    for (let i = 0; i < 4 && forward.has(cur); i++) cur = forward.get(cur);
    return cur;
  };

  const problems = [];
  for (const title of titles) {
    const final = resolve(title);
    const page = info.get(final);
    const where = owner.get(title);

    if (!page || page.missing !== undefined) {
      problems.push([where, title, "no such article"]);
      continue;
    }
    const thumb = page.thumbnail && page.thumbnail.source;
    if (!thumb) {
      problems.push([where, title, "article has no lead image"]);
      continue;
    }
    if (final !== title && dropsSubject(title, final)) {
      problems.push([where, title, `redirects to "${final}" — different subject?`]);
    }
    const file = decodeURIComponent(thumb.split("/").pop().split("?")[0]);
    if (NOT_A_PHOTO.test(file.toLowerCase()) || file.toLowerCase().endsWith(".svg")) {
      problems.push([where, title, `lead image looks like a diagram: ${file}`]);
    }
    const w = page.thumbnail.width || 0;
    if (w && w < MIN_WIDTH) {
      problems.push([where, title, `lead image is only ${w}px wide`]);
    }
  }

  console.log(`${plural(titles.length, "gallery slot", "gallery slots")} across ${plural(cities.length, "city", "cities")}`);
  if (!problems.length) {
    console.log("all resolve to photographs, no suspect redirects");
  } else {
    console.log(`${problems.length} to look at:\n`);
    for (const [city, title, why] of problems) {
      console.log(`  ${city} — "${title}"\n      ${why}`);
    }
  }
  process.exit(problems.length || shape.length ? 1 : 0);
})().catch((err) => {
  console.error("check failed:", err.message);
  process.exit(2);
});
