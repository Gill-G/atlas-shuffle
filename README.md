# Atlas Shuffle

A single-page site that picks a **random city** each time it loads and showcases it:
photographs with captions, what the city is famous for, things to do there, and a
panel of fast facts.

Static site — no build step, no framework, no dependencies.

## Run it

```bash
./start.sh          # serves on http://localhost:8000
./start.sh 3000     # or pick a port
```

Opening `index.html` straight off disk mostly works, but Chrome blocks the image
request from a `file://` origin, so the photos come up blank. Serving over http
avoids that.

## Structure

```
index.html      # page skeleton — sections are filled in by JS
css/style.css   # all styling; per-city accent colour is a CSS variable
js/cities.js    # the dataset: 50 cities, hand-written
js/main.js      # picks a city, fetches photos, renders the page
check.js        # verifies the shape of the dataset and every gallery article
test/           # the behaviour of main.js, and of the page in a real browser
start.sh        # local static server
```

## Tests

```bash
node test/run.js           # everything
node test/run.js --unit    # the stub-browser tests only, no browser needed
node test/run.js pass      # only cases whose name contains "pass"
```

No framework and no dependencies. `test/harness.js` runs the real `js/main.js`
in a `vm` against a stub browser, where `setItem` delivers storage events
between tabs — the only way the cross-tab code executes, and where several real
bugs lived. `test/unit.js` holds the behaviour, most of it regressions: each was
written against the commit before its fix and shown to fail there, because a
test that has never failed has proved nothing.

`test/browser.js` drives the real page in headless Chrome and reads **computed**
style, which the stub cannot do. That distinction is not academic: the index
dialog once shipped covering the whole site because `.index { display: grid }`
overrode the `hidden` attribute, and sixteen stub tests passed because a stub
models `hidden` as a plain property. It stubs the API inside the page, so it
tests the site rather than Wikipedia, and skips with a note if no browser is
found — set `CHROME` to point at one.

`node check.js` is deliberately separate: it checks the dataset against live
Wikipedia, so folding it in would mean the suite could not pass offline.

## How the photos work

No images are stored in this repo and no image URLs are hardcoded — those rot.
Instead each gallery entry names an **English Wikipedia article**:

```js
{ article: "Trevi Fountain", caption: "Trevi Fountain marks the end of an aqueduct…" }
```

At render time `main.js` asks the MediaWiki `pageimages` API for a city's six
articles and uses each one's lead photograph. Every photograph is asked for at
the size it will actually be drawn, which takes two or three requests, fired
together, because the API takes one thumbnail size per request.

The hero is full-bleed, so it gets roughly the width of the viewport, capped at
2560 — a fixed 2560 looks no better on a laptop and costs three times the bytes,
and on a phone it would be three megabytes to paint four hundred points across.
The five grid tiles are much smaller and the grid lays them out three different
ways, so `shotSizes()` mirrors those breakpoints: on a 1440px laptop the tiles
are drawn around 510 and 330 CSS px and are fetched at 640, where they used to
be fetched at 1600 — about 230KB each rather than 800KB.

Results are cached in memory, so shuffling back to a city you've already seen
costs nothing.

If the request fails — offline, blocked, rate-limited — every word on the page
still renders and the image slots fall back to a coloured wash. The site is never
blank.

All 300 image slots are checked against the live API by `check.js` — every one
resolves, and every one is an actual photograph. That second check matters:
plenty of articles lead with a locator map, a logo or a coat of arms instead
(`Old Havana` and `Van Gogh Museum` both did), which looks broken in a gallery.

The check is worth re-running now and then, not just when adding a city, because
an entry that was correct can silently stop being correct. Wikipedia retargeted
`Malecón` to the generic article `Jetty`, and `Temple of Literature` to
`Temple of Confucius`; both titles still resolved, and both still led with a real
photograph, so Havana showed an anonymous breakwater and Hanoi a temple in the
wrong country until `check.js` learned to look at redirects.

## Adding a city

Append an entry to `CITIES` in `js/cities.js`. Everything else is automatic —
the count in the footer, the shuffle pool, the accent colour.

```js
{
  id: "porto",              // also the URL fragment: /#porto
  name: "Porto",
  country: "Portugal",
  region: "Western Europe",
  accent: "#a8703f",        // drives headings, numerals, rules, the loading wash
  tagline: "…",
  intro: "…",               // one paragraph; gets a drop cap
  famousFor: ["…"],         // 4–6 short chips
  thingsToDo: [{ title: "…", text: "…" }],     // 4 reads best
  gallery: [{ article: "…", caption: "…" }],   // 6 — the first is the hero
  facts: { Population: "…", Founded: "…" }     // any keys; 6 fills the grid
}
```

`country` is what a traveller would say, not a sovereign state, and it is not
checked against anything — it exists to be read under the city name. So
Edinburgh is in Scotland and London in England rather than both in the United
Kingdom, and Hong Kong, New Caledonia and Monaco stand as their own answers.
Nothing groups or counts by it; `region` is the field with rules, because the
index groups by that one.

Two rules worth keeping: `gallery[0]` is the hero image, and every `article` must
be an exact English Wikipedia title that has a lead photo. Check the new entry
before committing it:

```bash
node check.js            # the whole deck
node check.js porto      # just the city you added
node check.js --shape    # structure only, no network
```

It checks the **shape** of every entry first — the counts above, plus the things
that keep the deck coherent: ids kebab-case and unique, accents valid hex and
unique, no article used by two cities, no empty strings. That part needs no
network, so `--shape` works offline and a failed API call still reports it.

It then checks every **article**, and names the city and article for each of:

| | |
|---|---|
| no such article | the title is wrong, or was renamed |
| no lead image | nothing to show in the slot |
| looks like a diagram | the lead image is a map, logo, coat of arms or SVG |
| different subject? | the title now redirects somewhere unrelated |
| only N px wide | too small to fill a gallery slot cleanly |
| hero source is N px | `gallery[0]` is smaller than the width it is displayed at |
| region is not one the index knows | `region` must come from the closed set in `check.js` |

The last two are advisory. A redirect that merely retitles — `Sultan Ahmed
Mosque` to `Blue Mosque, Istanbul` — is reported and is fine; the check cannot
tell that apart from `Malecón` becoming `Jetty`, so look at what it names.

The diagram test reads the filename, and filenames do not always separate their
words: `vitilevu_topo.jpg` and `aucklandmaphochstetter1859.jpg` were both maps
that a boundary-matched "map" could not see, and both were caught by eye first.
It now also matches, anywhere in the name, a few distinctive words and any run of
letters ending in "map" — which is what catches `aucklandmaphochstetter1859`
without a separator in sight, while leaving `mapo_bridge_seoul` alone, since that
rule wants four letters before the "map". Measured against 202 random Wikipedia
lead images it flags seventeen, all of them genuinely logos, flags, coats of arms
or maps.

Treat a clean run as evidence, not proof — look at the picture.

One more advisory: accents within a CIELAB distance of 4 are reported as too
alike to read as different cities. Three pairs in the deck already are, Rome and
Amsterdam most of all, so pick a new colour by running the check rather than by
eye.

## Interaction

| | |
|---|---|
| `R` | new city |
| `Esc` | close the index |
| `#tokyo` | link straight to one city |
| Shuffle button | top right, and at the foot of the page |
| All cities | opens the index |

## The index

Fifty cities reachable only by shuffling or by knowing a fragment is a deck with
no lid, so "All cities" opens one, grouped by region — the first thing that field
has ever been used for, and the reason `region` had to be normalised into the
closed set `check.js` now enforces. Cities the current pass has already dealt are
dimmed and ticked, so the list answers "what have I not seen yet" rather than
merely listing what exists. It is built on first open, not at load.

Each region heading carries a **shuffle here**, which narrows the deck to that
region until it is pressed again — the index is where you are already reading
the deck by region, so it is where you are most likely to want less of it. The
choice outlives the tab, so it is said out loud in the index note and in the
tally under the city; a filter you cannot see is just a site that has lost
cities.

The pass keeps its own counting straight underneath. Running a region dry
reshuffles that region and leaves the rest of the record alone, so a look at
Oceania does not throw away a pass across the other forty-four, and "start over"
under the tally clears only what the tally was counting. The card already
prefetched is dropped when the region changes, or the first city after narrowing
to East Asia would be whatever was queued before it.

## The shuffle

Cities are dealt from a shuffled deck rather than picked at random, so a pass
shows all 50 before any of them comes round again — picking uniformly repeated
after about nine presses. The pass is kept in `localStorage`, so it survives a
reload and is shared between tabs; the outro says how far through it you are and
offers to start it over. A city reached by `#fragment` counts as dealt.

## Credits

Photographs come from Wikimedia Commons via the Wikipedia API and belong to their
respective photographers, who are named under each one: `main.js` asks
`imageinfo` for `Artist` and `LicenseShortName` after the city is on screen and
fills the credit lines in. Most of these photographs are CC-BY or CC-BY-SA,
where naming the author is a condition of the licence and not a courtesy.

The lookup never blocks a photograph, and where Commons records no author — some
files carry only a date and a category — the credit links to the file page,
which is where the licence lives.

All descriptive text was written by hand.
