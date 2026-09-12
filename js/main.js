/* ============================================================
   Atlas Shuffle — picks a random city and builds the page.

   Photos are not stored in this repo. Each gallery entry names an
   English Wikipedia article; at render time we ask the MediaWiki
   pageimages API for that article's lead photo. If the request
   fails (offline, blocked, rate-limited) every word on the page
   still renders and the image slots fall back to a coloured wash.
   ============================================================ */

const API = "https://en.wikipedia.org/w/api.php";
const THUMB_PX = 1600;   // gallery grid: cells are a few hundred px wide
const HERO_MAX = 2560;   // the most we will ever ask for the full-bleed hero

/* The hero covers the whole viewport, so ask for what this screen can actually
   show. A fixed 2560 looks identical to 1600 on a laptop but costs three times
   the bytes, and on a phone it is three megabytes to paint four hundred points
   across. Never below the grid size, never above HERO_MAX — the point is a
   sharp photograph, not the largest file Wikimedia holds. */
function heroSize() {
  const px = (window.innerWidth || 1280) * (window.devicePixelRatio || 1);
  return Math.min(HERO_MAX, Math.max(THUMB_PX, Math.ceil(px / 320) * 320));
}

/** article title -> image url (or null if the API had none). Survives shuffles. */
const imageCache = new Map();

const el = (id) => document.getElementById(id);

/* ── Image fetching ──────────────────────────────────────── */

/** GET JSON, retrying once on a transient rate-limit or server hiccup. */
async function getJSON(url, attempt = 0) {
  const res = await fetch(url);
  if (res.ok) return res.json();
  const transient = res.status === 429 || res.status >= 500;
  if (transient && attempt < 2) {
    await new Promise((r) => setTimeout(r, 600 * (attempt + 1)));
    return getJSON(url, attempt + 1);
  }
  throw new Error(`Wikipedia API returned ${res.status}`);
}

/**
 * Resolve article titles to photo URLs in a single request.
 * Returns a Map of the ORIGINAL title -> url|null, so callers don't
 * have to care that the API normalises and follows redirects.
 */
async function fetchImages(titles, size = THUMB_PX) {
  const wanted = titles.filter((t) => !imageCache.has(t));
  if (wanted.length === 0) return;

  const params = new URLSearchParams({
    action: "query",
    format: "json",
    origin: "*",          // CORS
    redirects: "1",       // follow e.g. "The Bridge of Peace" -> "Bridge of Peace"
    prop: "pageimages",
    piprop: "thumbnail",
    pithumbsize: String(size),
    titles: wanted.join("|")
  });

  const data = await getJSON(`${API}?${params}`);
  const q = data.query || {};

  // Rebuild the title -> title mapping the API applied on the way in.
  const forward = new Map();
  (q.normalized || []).forEach((n) => forward.set(n.from, n.to));
  (q.redirects || []).forEach((r) => forward.set(r.from, r.to));
  const resolve = (t) => {
    let cur = t;
    for (let i = 0; i < 4 && forward.has(cur); i++) cur = forward.get(cur);
    return cur;
  };

  const byTitle = new Map();
  Object.values(q.pages || {}).forEach((p) => {
    byTitle.set(p.title, p.thumbnail ? p.thumbnail.source : null);
  });

  wanted.forEach((t) => {
    const hit = byTitle.get(resolve(t));
    imageCache.set(t, hit === undefined ? null : hit);
  });
}

/**
 * Ask for one city's photographs.
 *
 * The hero fills the viewport and the grid shots do not, so they are fetched
 * at different sizes — two requests rather than one, fired together, so this
 * costs a connection rather than a round trip. pageimages takes a single
 * thumbnail size per request, which is why it cannot be one call.
 */
function fetchCityImages(city) {
  const [hero, ...rest] = city.gallery.map((g) => g.article);
  return Promise.all([fetchImages([hero], heroSize()), fetchImages(rest, THUMB_PX)]);
}

/* ── Rendering ───────────────────────────────────────────── */

function renderHero(city) {
  const hero = el("hero");
  hero.classList.remove("has-img");

  el("hero-country").textContent = city.country;
  el("hero-region").textContent = city.region;
  el("hero-name").textContent = city.name;
  el("hero-tagline").textContent = city.tagline;

  const lead = city.gallery[0];
  const src = imageCache.get(lead.article);
  const img = el("hero-img");

  img.removeAttribute("src");
  img.alt = `${city.name}: ${lead.caption}`;

  if (!src) return; // keep the accent wash
  const probe = new Image();
  probe.onload = () => {
    img.src = src;
    hero.classList.add("has-img");
  };
  probe.src = src;
}

function renderIntro(city) {
  el("intro-text").textContent = city.intro;

  const list = el("famous-for");
  list.replaceChildren(
    ...city.famousFor.map((f) => {
      const li = document.createElement("li");
      li.textContent = f;
      return li;
    })
  );
}

function renderThingsToDo(city) {
  el("things-to-do").replaceChildren(
    ...city.thingsToDo.map((item) => {
      const li = document.createElement("li");
      const h3 = document.createElement("h3");
      const p = document.createElement("p");
      h3.textContent = item.title;
      p.textContent = item.text;
      li.append(h3, p);
      return li;
    })
  );
}

function renderGallery(city) {
  // Slot 0 is the hero; the grid shows the rest.
  const shots = city.gallery.slice(1);

  el("gallery").replaceChildren(
    ...shots.map((shot) => {
      const figure = document.createElement("figure");

      const frame = document.createElement("div");
      frame.className = "shot";

      const img = document.createElement("img");
      img.alt = shot.caption;
      img.loading = "lazy";
      img.decoding = "async";
      img.addEventListener("load", () => img.classList.add("loaded"), { once: true });

      const fallback = document.createElement("span");
      fallback.className = "shot__fallback";
      fallback.textContent = "photo unavailable";

      const src = imageCache.get(shot.article);
      if (src) img.src = src;

      const caption = document.createElement("figcaption");
      caption.textContent = shot.caption;

      frame.append(img, fallback);
      figure.append(frame, caption);
      return figure;
    })
  );
}

function renderFacts(city) {
  el("facts").replaceChildren(
    ...Object.entries(city.facts).map(([term, value]) => {
      const row = document.createElement("div");
      const dt = document.createElement("dt");
      const dd = document.createElement("dd");
      dt.textContent = term;
      dd.textContent = value;
      row.append(dt, dd);
      return row;
    })
  );
}

/* How far through the current pass we are. Deliberately not a live region:
   the announcer already speaks each city, and a running tally repeated after
   every shuffle would be noise. */
function renderPass() {
  const total = CITIES.length;
  const n = seen.size;

  el("pass-progress").textContent =
    n >= total
      ? `That was all of them — the deck reshuffles from here.`
      : `${n} seen this time round, ${total - n} to go.`;

  // Nothing to start over from until a pass is actually under way.
  el("pass-reset").hidden = n < 2 || n >= total;
}

/* ── Orchestration ───────────────────────────────────────── */

async function show(city, { scroll = true, warmed = null } = {}) {
  dealtWith(city.id);   // a deep link counts as playing that card
  document.body.classList.add("is-loading");
  document.documentElement.style.setProperty("--accent", city.accent);
  document.title = `${city.name}, ${city.country} — Atlas Shuffle`;
  el("foot-hash").textContent = `#${city.id}`;

  // Ask for every photo this city needs in one round trip. If this city was
  // warmed up in the background, that promise has already done the work and
  // fetchImages() below is a no-op; if the warm-up failed, it retries here.
  try {
    if (warmed) await warmed;
    await fetchCityImages(city);
  } catch (err) {
    console.warn("Could not load photos — showing text only.", err);
    city.gallery.forEach((g) => {
      if (!imageCache.has(g.article)) imageCache.set(g.article, null);
    });
  }

  renderHero(city);
  renderIntro(city);
  renderThingsToDo(city);
  renderGallery(city);
  renderFacts(city);
  renderPass();

  if (scroll) window.scrollTo({ top: 0, behavior: "instant" });

  document.body.classList.remove("is-loading", "is-swapping");
  el("announcer").textContent = `Now showing ${city.name}, ${city.country}. ${city.tagline}.`;

  queueNext(city.id);
}

/* ── Looking ahead ───────────────────────────────────────── */

/* Shuffling used to block on a Wikipedia round trip every time. Since the
   next city is picked at random anyway, we may as well pick it early and
   resolve its photos while the current one is still being read — by the time
   anyone presses R the work is usually already done. */

let nextCity = null;   // the city shuffle() will show next
let nextWarm = null;   // promise resolving when that city's photos are cached

const whenIdle = (fn) =>
  window.requestIdleCallback ? window.requestIdleCallback(fn, { timeout: 2000 }) : setTimeout(fn, 400);

/** Don't spend someone else's data plan guessing what they'll do next. */
function prefetchAllowed() {
  const c = navigator.connection;
  return !c || (!c.saveData && !/(^|-)2g$/.test(c.effectiveType || ""));
}

/**
 * Choose the city after this one and warm its photos in the background.
 * Never rejects: a failed warm-up just leaves the cache empty and show()
 * fetches again in the foreground, exactly as it did before.
 */
function queueNext(afterId) {
  // If the queued city was never shown — a deep link got in first — it has
  // already left the deck, so put it back rather than lose it from the pass.
  if (nextCity && nextCity.id !== afterId) returnToDeck(nextCity);

  nextCity = pickCity(afterId);
  nextWarm = null;
  if (!prefetchAllowed()) return;

  const city = nextCity;
  whenIdle(() => {
    if (nextCity !== city) return; // a deep link overtook us

    nextWarm = fetchCityImages(city)
      .then(() => {
        // The hero is the one photo shown at full size straight away, and
        // renderHero waits on it decoding, so pull the bytes down too.
        const lead = imageCache.get(city.gallery[0].article);
        if (lead) new Image().src = lead;
      })
      .catch(() => {});
  });
}

/* ── The deck ────────────────────────────────────────────── */

/* Picking uniformly at random repeats badly: across 40 cities you see one
   come round twice long before you have seen them all. So deal from a
   shuffled deck and only reshuffle when it runs out — every city comes up
   once per pass, which is what the name of the site promises.

   `deck` holds the cities not yet shown in the current pass. */

/* The pass outlives the tab. Without this a reload would start a new pass, so
   anyone who refreshes rather than pressing R would still meet repeats — which
   is most of what the deck was meant to fix.

   What gets stored is the ids already shown, not the cards still to come. That
   way a city added to the dataset joins the pass in progress instead of sitting
   out until the next one, and a city removed from it simply stops matching. */

const PASS_KEY = "atlas-shuffle:seen:v1";

/** Reading storage throws outright in some privacy modes, so never assume. */
function loadSeen() {
  try {
    const raw = JSON.parse(localStorage.getItem(PASS_KEY));
    return new Set(Array.isArray(raw) ? raw.filter((id) => typeof id === "string") : []);
  } catch (err) {
    return new Set();
  }
}

/**
 * Write the pass back.
 *
 * Two tabs of the site share one record but keep their own copy of it in
 * memory, so a plain write means whichever tab saves last erases the other's
 * progress and those cities come round again. Fold in what is stored first.
 * Starting a fresh pass is the one case that must overwrite, since it is
 * deliberately dropping everything.
 */
function saveSeen({ merge = true } = {}) {
  try {
    if (merge) for (const id of loadSeen()) seen.add(id);
    localStorage.setItem(PASS_KEY, JSON.stringify([...seen]));
  } catch (err) {
    /* Storage full, blocked or unavailable: the pass just won't survive the tab. */
  }
}

let seen = loadSeen();
let deck = freshDeck();

function shuffled(list) {
  const out = list.slice();
  for (let i = out.length - 1; i > 0; i--) {      // Fisher–Yates
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** What is left of the current pass, or a whole new one once it is spent. */
function freshDeck() {
  const left = CITIES.filter((c) => !seen.has(c.id));
  if (left.length > 0) return shuffled(left);
  seen = new Set();
  saveSeen({ merge: false });   // a new pass has to be able to clear the old one
  return shuffled(CITIES);
}

/** Take a card out of the deck without judging why. */
function takeFromDeck(id) {
  const at = deck.findIndex((c) => c.id === id);
  if (at !== -1) deck.splice(at, 1);
}

/** Drop a city from the current pass — it has just been shown. */
function dealtWith(id) {
  takeFromDeck(id);
  if (!seen.has(id)) {
    seen.add(id);
    saveSeen();
  }
}

/** Put a city back into the pass at a random point — it was queued, then never shown. */
function returnToDeck(city) {
  deck.splice(Math.floor(Math.random() * (deck.length + 1)), 0, city);
}

/** Deal the next city, reshuffling when the pass is over. */
function pickCity(exceptId) {
  if (deck.length === 0) deck = freshDeck();
  // A fresh pass can open with the city already on screen; play the card
  // under it instead, so nothing repeats back to back.
  if (deck.length > 1 && deck[0].id === exceptId) [deck[0], deck[1]] = [deck[1], deck[0]];
  return deck.shift();
}

let current = null;

async function shuffle() {
  if (document.body.classList.contains("is-loading")) return;
  document.body.classList.add("is-swapping");
  const next = nextCity || pickCity(current && current.id);
  const warmed = next === nextCity ? nextWarm : null;
  // Let the fade-out land before the DOM changes underneath it.
  await new Promise((r) => setTimeout(r, 220));
  current = next;
  history.replaceState(null, "", `#${next.id}`);
  await show(next, { warmed });
}

/* ── Boot ────────────────────────────────────────────────── */

function initialCity() {
  const requested = decodeURIComponent(location.hash.slice(1));
  return CITIES.find((c) => c.id === requested) || pickCity();
}

el("city-count").textContent = CITIES.length;
el("shuffle").addEventListener("click", shuffle);
el("shuffle-2").addEventListener("click", shuffle);

// A button rather than <a href="#top">: the fragment holds the current city,
// so an anchor would overwrite #toronto and break the deep link.
el("to-top").addEventListener("click", () => {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: 0, behavior: reduced ? "instant" : "smooth" });
});

// Starting over keeps the city on screen — you are looking at it, so it counts
// as seen — and keeps the card already in hand, which is the next one up.
el("pass-reset").addEventListener("click", () => {
  seen = new Set(current ? [current.id] : []);
  saveSeen({ merge: false });
  deck = freshDeck();
  if (nextCity) takeFromDeck(nextCity.id);
  renderPass();
});

/* Another tab of the site is browsing the same pass. Merging on write stops
   them erasing each other, but this tab's deck would still deal cities the
   other has already shown, so follow along as they happen. */
window.addEventListener("storage", (e) => {
  if (e.key !== PASS_KEY) return;
  const theirs = loadSeen();

  // Ids we hold that the record no longer has mean the other tab started over.
  const restarted = [...seen].some((id) => !theirs.has(id));
  if (restarted) {
    seen = new Set(theirs);
    if (current) seen.add(current.id);   // still on screen here, so still seen
    deck = freshDeck();
    if (nextCity) takeFromDeck(nextCity.id);
  } else {
    theirs.forEach((id) => {
      seen.add(id);
      takeFromDeck(id);
    });
  }
  renderPass();
});

document.addEventListener("keydown", (e) => {
  const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.isContentEditable;
  if (typing || e.metaKey || e.ctrlKey || e.altKey) return;
  if (e.key === "r" || e.key === "R") {
    e.preventDefault();
    shuffle();
  }
});

// Support pasting a #city link into an already-open tab.
window.addEventListener("hashchange", () => {
  const target = CITIES.find((c) => c.id === decodeURIComponent(location.hash.slice(1)));
  if (target && (!current || target.id !== current.id)) {
    current = target;
    show(target);
  }
});

current = initialCity();
history.replaceState(null, "", `#${current.id}`);
show(current, { scroll: false });
