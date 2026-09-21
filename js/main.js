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

const TILE_MIN = 640;    // small enough tiles still survive a window being widened

/** Round to a step the thumbnailer is likely to have made before. */
const bucket = (px, min) => Math.min(HERO_MAX, Math.max(min, Math.ceil(px / 320) * 320));

/**
 * What each grid tile is actually drawn at, in the shots' own order.
 *
 * This mirrors the grid in css/style.css, which lays the five tiles out three
 * different ways, and the widths differ by a factor of three between them:
 *
 *   under 620px   one column, every tile the full width
 *   620 to 999    two columns, the fifth tile spanning both
 *   1000 and up   six columns, the first two spanning three and the rest two
 *
 * Asking for one size for all five was wrong in both directions — on a desktop
 * the narrow tiles are drawn around 330px and were fetched at 1600.
 */
function shotSizes() {
  const vw = window.innerWidth || 1280;
  const dpr = window.devicePixelRatio || 1;
  const gut = Math.min(Math.max(20, vw * 0.05), 64);          // --gut
  const gap = Math.min(Math.max(20, vw * 0.025), 32);         // .gallery gap
  const content = Math.min(vw, 1180) - gut * 2;               // --wrap, padded

  if (vw >= 1000) {
    const col = (content - gap * 5) / 6;
    const wide = bucket((col * 3 + gap * 2) * dpr, TILE_MIN);
    const narrow = bucket((col * 2 + gap) * dpr, TILE_MIN);
    return [wide, wide, narrow, narrow, narrow];
  }
  if (vw >= 620) {
    const half = bucket(((content - gap) / 2) * dpr, TILE_MIN);
    const full = bucket(content * dpr, TILE_MIN);
    return [half, half, half, half, full];
  }
  const full = bucket(content * dpr, TILE_MIN);
  return [full, full, full, full, full];
}

/** article title -> image url (or null if the API had none). Survives shuffles. */
const imageCache = new Map();

/** article title -> the file the photograph lives in, e.g. "Djemaa_el_Fna.jpg". */
const fileOf = new Map();

/** file name -> { author, licence, page } once looked up. */
const creditCache = new Map();

const COMMONS_FILE = "https://commons.wikimedia.org/wiki/File:";

/* MediaWiki treats spaces and underscores in a title as the same character and
   hands titles back with spaces, while pageimages reports the file with
   underscores. Key on one form or every lookup misses. */
const fileKey = (name) => String(name || "").replace(/^File:/, "").replace(/ /g, "_");

/** The credit line nodes on screen, so filling them needs no DOM query. */
let creditNodes = [];

/** extmetadata values arrive as HTML — usually a link to the author's page. */
function textFrom(html) {
  return String(html || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Look up who took these photographs.
 *
 * Attribution is a condition of most of the licences here, not a courtesy, so
 * this runs for every photograph shown. It is deliberately separate from
 * fetchImages and never awaited by it: a credit arriving a moment after the
 * picture is fine, a picture waiting on a credit is not.
 *
 * Two shapes to beware of. MediaWiki serialises an empty extmetadata as [],
 * not {}, so anything indexing into it blindly will throw. And a file hosted
 * on Commons is reported as "missing" by the English Wikipedia while still
 * returning its imageinfo, so that flag says nothing about whether the file
 * exists.
 */
async function fetchCredits(files) {
  const wanted = [...new Set(files.filter(Boolean).map(fileKey).filter((f) => !creditCache.has(f)))];
  if (wanted.length === 0) return;

  const params = new URLSearchParams({
    action: "query",
    format: "json",
    origin: "*",
    prop: "imageinfo",
    iiprop: "extmetadata|url",
    iiextmetadatafilter: "Artist|LicenseShortName|Credit",
    titles: wanted.map((f) => `File:${f}`).join("|")
  });

  const data = await getJSON(`${API}?${params}`);
  const pages = Object.values((data.query || {}).pages || {});

  pages.forEach((p) => {
    const file = fileKey(p.title);
    const info = (p.imageinfo || [])[0] || {};
    const meta = info.extmetadata;
    const field = (name) =>
      meta && !Array.isArray(meta) && meta[name] ? textFrom(meta[name].value) : "";

    creditCache.set(file, {
      author: field("Artist") || field("Credit"),
      licence: field("LicenseShortName"),
      page: info.descriptionurl || COMMONS_FILE + encodeURIComponent(file)
    });
  });

  // Anything the API did not answer for still gets a link to its file page,
  // which is where the licence and the author are recorded.
  wanted.forEach((f) => {
    if (!creditCache.has(f)) {
      creditCache.set(f, { author: "", licence: "", page: COMMONS_FILE + encodeURIComponent(f) });
    }
  });
}

/** Fill in one credit line, or leave it empty if there is nothing to say. */
function renderCredit(el_, article) {
  const file = fileOf.get(article);
  const credit = file && creditCache.get(fileKey(file));
  el_.replaceChildren();
  if (!credit) return;

  const link = document.createElement("a");
  link.href = credit.page;
  link.target = "_blank";
  link.rel = "noopener";
  link.textContent = credit.author || "Wikimedia Commons";

  el_.append(document.createTextNode("Photo: "), link);
  if (credit.licence) el_.append(document.createTextNode(` · ${credit.licence}`));
}

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
    piprop: "thumbnail|name",   // the file name is what credits are looked up by
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
    if (p.pageimage) fileOf.set(p.title, p.pageimage);
  });

  wanted.forEach((t) => {
    const resolved = resolve(t);
    const hit = byTitle.get(resolved);
    imageCache.set(t, hit === undefined ? null : hit);
    if (fileOf.has(resolved)) fileOf.set(t, fileOf.get(resolved));
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
  const sizes = shotSizes();

  // pageimages takes one thumbnail size per request, so tiles drawn at the
  // same size share a request. There are at most two distinct sizes, which
  // makes three requests for a city — all fired together.
  const bySize = new Map();
  rest.forEach((article, i) => {
    const px = sizes[i];
    if (!bySize.has(px)) bySize.set(px, []);
    bySize.get(px).push(article);
  });

  return Promise.all([
    fetchImages([hero], heroSize()),
    ...[...bySize].map(([px, articles]) => fetchImages(articles, px))
  ]);
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
  el("hero-credit").replaceChildren();
  creditNodes = [{ node: el("hero-credit"), article: lead.article }];

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
  // Slot 0 is the hero; the grid shows the rest. renderHero runs first and has
  // already reset creditNodes to the hero's line, so these append to it.
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

      const credit = document.createElement("span");
      credit.className = "credit";
      caption.append(credit);
      creditNodes.push({ node: credit, article: shot.article });

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
/** Cities not yet shown in this pass. The one number both the tally and the
    announcement are allowed to quote, so they cannot disagree. */
function remaining() {
  return CITIES.length - seen.size;
}

function renderPass() {
  const total = CITIES.length;
  const n = seen.size;

  el("pass-progress").textContent =
    n >= total
      ? `That was all of them — the deck reshuffles from here.`
      : `${n} seen this time round, ${remaining()} to go.`;

  // Nothing to start over from until a pass is actually under way.
  el("pass-reset").hidden = n < 2 || n >= total;
}

/* ── The index ───────────────────────────────────────────── */

/* Fifty cities reachable only by shuffling or by knowing a #fragment is a
   deck with no lid. The index opens it, grouped by region — which is the
   first thing that field has ever been used for — and marks what the current
   pass has already dealt, so it answers "what have I not seen yet". */

let indexBuilt = false;
let openerBeforeIndex = null;

/** city id -> the row's button and tick, so marking needs no DOM query. */
const indexNodes = new Map();

function buildIndex() {
  const byRegion = new Map();
  CITIES.forEach((c) => {
    if (!byRegion.has(c.region)) byRegion.set(c.region, []);
    byRegion.get(c.region).push(c);
  });

  const regions = [...byRegion.keys()].sort((a, b) => a.localeCompare(b));
  el("index-body").replaceChildren(
    ...regions.map((region) => {
      const section = document.createElement("section");
      section.className = "index__region";

      const heading = document.createElement("h3");
      heading.textContent = region;

      const list = document.createElement("ul");
      list.className = "index__list";

      byRegion
        .get(region)
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name))
        .forEach((city) => {
          const item = document.createElement("li");
          const button = document.createElement("button");
          button.type = "button";
          button.className = "index__city";
          button.id = `index-city-${city.id}`;

          const tick = document.createElement("span");
          tick.className = "tick";
          tick.setAttribute("aria-hidden", "true");

          const name = document.createElement("span");
          name.textContent = city.name;

          const where = document.createElement("span");
          where.className = "where";
          where.textContent = city.country;

          button.append(tick, name, where);
          indexNodes.set(city.id, { button, tick });
          button.addEventListener("click", () => {
            closeIndex();
            if (current && current.id === city.id) return;
            current = city;
            history.replaceState(null, "", `#${city.id}`);
            show(city);
          });

          item.append(button);
          list.append(item);
        });

      section.append(heading, list);
      return section;
    })
  );
  indexBuilt = true;
}

/** Mark what this pass has dealt. Recomputed on open, since it keeps changing. */
function markIndex() {
  const left = remaining();
  el("index-note").textContent =
    left === 0
      ? `All ${CITIES.length} seen this time round — the next shuffle starts a new pass.`
      : `${CITIES.length} in the deck · ${left} you have not seen this time round.`;

  CITIES.forEach((city) => {
    const row = indexNodes.get(city.id);
    if (!row) return;
    const { button, tick } = row;
    const isCurrent = !!current && current.id === city.id;
    if (seen.has(city.id)) button.classList.add("is-seen");
    else button.classList.remove("is-seen");
    if (isCurrent) button.classList.add("is-current");
    else button.classList.remove("is-current");
    tick.textContent = seen.has(city.id) ? "✓" : "";
    button.setAttribute(
      "aria-label",
      `${city.name}, ${city.country}${isCurrent ? " — on screen now" : seen.has(city.id) ? " — already seen this time round" : ""}`
    );
  });
}

function openIndex() {
  if (!indexBuilt) buildIndex();
  markIndex();
  openerBeforeIndex = el("index-open");   // where focus goes back to on close
  el("index").hidden = false;
  document.body.classList.add("is-indexing");
  el("index-close").focus();
}

function closeIndex() {
  if (el("index").hidden) return;
  el("index").hidden = true;
  document.body.classList.remove("is-indexing");
  if (openerBeforeIndex && openerBeforeIndex.focus) openerBeforeIndex.focus();
  openerBeforeIndex = null;
}

/* ── Orchestration ───────────────────────────────────────── */

/* Only one city may be on its way to the screen. Three places start a show —
   the shuffle button, a picked row in the index, and a pasted #fragment — and
   only the shuffle checked whether one was already running, so two could wait
   on their photographs at once and finish in whichever order the network
   decided. The slower one rendered last and won the hero while the faster one
   had already set the title: one page, two cities. */
let showToken = 0;

async function show(city, { scroll = true, warmed = null } = {}) {
  const token = ++showToken;
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

  if (token !== showToken) {
    // A newer show started while this one waited, so the page belongs to it.
    // Put this city back if it had been dealt but never seen, or the pass
    // loses a card nobody looked at.
    //
    // Drop it from the hand first. shuffle() takes its card out of nextCity
    // without clearing it, so without this the card is handed back here and
    // then handed back a second time by queueNext(), whose own guard returns
    // whatever nextCity still holds — leaving the deck with two of it, and a
    // pass that shows one city twice.
    if (nextCity && nextCity.id === city.id) {
      nextCity = null;
      nextWarm = null;
    }
    if (!seen.has(city.id) && !deck.some((c) => c.id === city.id)) returnToDeck(city);
    return;
  }

  dealtWith(city.id);   // shown at last — a deep link counts as playing that card

  renderHero(city);
  renderIntro(city);
  renderThingsToDo(city);
  renderGallery(city);
  renderFacts(city);
  renderPass();

  if (scroll) window.scrollTo({ top: 0, behavior: "instant" });

  document.body.classList.remove("is-loading", "is-swapping");
  el("announcer").textContent = `Now showing ${city.name}, ${city.country}. ${city.tagline}.`;

  showCredits(city);
  if (indexBuilt) markIndex();

  queueNext(city.id);
}

/**
 * Name the photographers, once the city is up.
 *
 * Deliberately after the render and never awaited: the pictures must not wait
 * on this. If the lookup fails the credits stay empty rather than showing
 * something wrong, and the footer still points at Commons.
 */
function showCredits(city) {
  const articles = city.gallery.map((g) => g.article);
  fetchCredits(articles.map((a) => fileOf.get(a)))
    .then(() => {
      // Shuffled on while we were asking. Belt and braces as the code stands:
      // renderHero and renderGallery rebuild creditNodes for whatever is on
      // screen, so a late answer would only re-render the current city's
      // credits from the cache and produce the same lines again. It is kept
      // because that is an accident of ordering, not a promise — the day
      // credit nodes outlive a render, this is what stops one city's
      // photographers appearing under another's photographs.
      if (current !== city) return;
      creditNodes.forEach(({ node, article }) => renderCredit(node, article));
    })
    .catch(() => {});
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
 * Whether to pull down the next city's hero photograph, as opposed to merely
 * resolving where it lives.
 *
 * The two are not comparable. Resolving is one JSON response of a few
 * kilobytes; the photograph is asked for at the width of the viewport and
 * measures two to three megabytes — spent on a city nobody has asked to see.
 * So the bytes wait for a connection that can clearly afford them, while the
 * addresses are fetched either way and still save a round trip.
 *
 * Note this cannot be solved by prefetching a smaller image: imageCache keys
 * on the article title, so a smaller URL cached here would be the one shown.
 */
function prefetchPhotoAllowed() {
  const c = navigator.connection;
  if (!c) return true;                                   // nothing known: assume a desktop
  if (c.saveData) return false;
  if (c.effectiveType && c.effectiveType !== "4g") return false;
  return c.downlink === undefined || c.downlink >= 5;    // Mbps
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
        // renderHero waits on it decoding, so pull the bytes down too — where
        // the connection can stand it. Where it cannot, the addresses are
        // still cached and the photograph simply loads when it is wanted.
        if (!prefetchPhotoAllowed()) return;
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
    if (!Array.isArray(raw)) return new Set();
    // Keep only cities that still exist. A record written before an entry was
    // removed would otherwise be counted by renderPass() but ignored by
    // freshDeck(), which filters against CITIES — and the two would disagree
    // about whether the pass was finished.
    const known = new Set(CITIES.map((c) => c.id));
    return new Set(raw.filter((id) => known.has(id)));
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
  let next = nextCity || pickCity(current && current.id);
  let warmed = next === nextCity ? nextWarm : null;
  // Let the fade-out land before the DOM changes underneath it.
  await new Promise((r) => setTimeout(r, 220));

  // A fifth of a second is long enough for another tab to have shown this very
  // city. Showing it now would repeat it inside the pass, and dealtWith() would
  // have nothing to add, so the tally would not move. The storage handler has
  // already put a fresh card in hand by this point; take that, or deal.
  if (seen.has(next.id)) {
    next = nextCity && !seen.has(nextCity.id) ? nextCity : pickCity(current && current.id);
    warmed = next === nextCity ? nextWarm : null;
  }

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

  // renderPass() has just hidden this button — a fresh pass has nothing to
  // start over from — so it cannot be left holding focus, or the next Tab
  // starts again from the top of the page. Hand focus to the obvious next
  // action, and say what happened, since the tally itself is not announced.
  // The city on screen still counts as seen, so this is one short of the whole
  // deck — and it has to be the number the tally shows, not a rounder one.
  el("announcer").textContent = `Pass reset. ${remaining()} cities still to see.`;
  el("shuffle-2").focus();
});

/* Another tab of the site is browsing the same pass. Merging on write stops
   them erasing each other, but this tab's deck would still deal cities the
   other has already shown, so follow along as they happen. */
/**
 * Put the card in hand back on a sound footing after the record has changed.
 *
 * It must be one this pass has not already counted — dealing a city the other
 * tab has shown would display it twice and leave the tally stuck, since
 * dealtWith() would have nothing to add. And it must not also be sitting in
 * the deck, or it gets dealt a second time later.
 *
 * Dealing a replacement goes through freshDeck(), which starts a new pass once
 * nothing is left, so it is only safe while the deck still holds something.
 * Empty-handed, shuffle() deals for itself, which is the right moment.
 */
function reconcileCardInHand() {
  if (!nextCity) return;
  if (seen.has(nextCity.id)) {
    nextCity = null;
    nextWarm = null;
    if (deck.length > 0) queueNext(current ? current.id : null);
  } else {
    takeFromDeck(nextCity.id);
  }
}

window.addEventListener("storage", (e) => {
  if (e.key !== PASS_KEY) return;
  const theirs = loadSeen();

  // Ids we hold that the record no longer has mean the other tab started over.
  const restarted = [...seen].some((id) => !theirs.has(id));
  if (restarted) {
    seen = new Set(theirs);
    if (current) seen.add(current.id);   // still on screen here, so still seen
    saveSeen();                          // ...so the other tab must be told
    deck = freshDeck();
  } else {
    theirs.forEach((id) => {
      seen.add(id);
      takeFromDeck(id);
    });
  }
  // The deck is not the only place a card can be, and either branch can leave
  // the one in hand stale. Both need the same rule, so neither depends on the
  // other having run first.
  reconcileCardInHand();
  renderPass();
});

el("index-open").addEventListener("click", openIndex);
el("index-close").addEventListener("click", closeIndex);
el("index").addEventListener("click", (e) => {
  if (e.target === el("index")) closeIndex();   // the backdrop, not the sheet
});

document.addEventListener("keydown", (e) => {
  const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.isContentEditable;
  if (typing || e.metaKey || e.ctrlKey || e.altKey) return;
  if (e.key === "Escape") {
    closeIndex();
    return;
  }
  // The index is a dialog: shuffling underneath it would be a surprise.
  if (!el("index").hidden) return;
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
