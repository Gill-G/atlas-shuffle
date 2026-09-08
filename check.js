#!/usr/bin/env node
/* Checks every gallery article in js/cities.js against the live MediaWiki API.
   No dependencies; needs Node 18+ for fetch.

     node check.js                 # check the whole deck
     node check.js havana hanoi    # check only these city ids

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
  const wanted = process.argv.slice(2);
  const cities = loadCities().filter((c) => !wanted.length || wanted.includes(c.id));
  if (!cities.length) {
    console.error(`No city matches ${wanted.join(", ")}`);
    process.exit(2);
  }

  const owner = new Map();   // article title -> city name
  cities.forEach((c) => c.gallery.forEach((g) => owner.set(g.article, c.name)));
  const titles = [...owner.keys()];

  const info = new Map();    // resolved title -> page
  const forward = new Map(); // original title -> resolved title

  for (let i = 0; i < titles.length; i += BATCH) {
    const q = await api(titles.slice(i, i + BATCH));
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

  console.log(`${titles.length} gallery slots across ${cities.length} cities`);
  if (!problems.length) {
    console.log("all resolve to photographs, no suspect redirects");
    return;
  }
  console.log(`${problems.length} to look at:\n`);
  for (const [city, title, why] of problems) {
    console.log(`  ${city} — "${title}"\n      ${why}`);
  }
  process.exit(1);
})().catch((err) => {
  console.error("check failed:", err.message);
  process.exit(2);
});
