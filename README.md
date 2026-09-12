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
js/cities.js    # the dataset: 45 cities, hand-written
js/main.js      # picks a city, fetches photos, renders the page
check.js        # verifies the shape of the dataset and every gallery article
start.sh        # local static server
```

## How the photos work

No images are stored in this repo and no image URLs are hardcoded — those rot.
Instead each gallery entry names an **English Wikipedia article**:

```js
{ article: "Trevi Fountain", caption: "Trevi Fountain marks the end of an aqueduct…" }
```

At render time `main.js` asks the MediaWiki `pageimages` API for a city's six
articles and uses each one's lead photograph. It makes two requests, fired
together: the five grid shots at 1600px, and the hero on its own, because the
hero is full-bleed and the API takes one thumbnail size per request. The hero is
asked for at roughly the width of the viewport, capped at 2560 — a fixed 2560
looks no better on a laptop and costs three times the bytes, and on a phone it
would be three megabytes to paint four hundred points across.

Results are cached in memory, so shuffling back to a city you've already seen
costs nothing.

If the request fails — offline, blocked, rate-limited — every word on the page
still renders and the image slots fall back to a coloured wash. The site is never
blank.

All 270 image slots are checked against the live API by `check.js` — every one
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

The last two are advisory. A redirect that merely retitles — `Sultan Ahmed
Mosque` to `Blue Mosque, Istanbul` — is reported and is fine; the check cannot
tell that apart from `Malecón` becoming `Jetty`, so look at what it names.

One more advisory: accents within a CIELAB distance of 4 are reported as too
alike to read as different cities. Three pairs in the deck already are, Rome and
Amsterdam most of all, so pick a new colour by running the check rather than by
eye.

## Interaction

| | |
|---|---|
| `R` | new city |
| `#tokyo` | link straight to one city |
| Shuffle button | top right, and at the foot of the page |

## The shuffle

Cities are dealt from a shuffled deck rather than picked at random, so a pass
shows all 45 before any of them comes round again — picking uniformly repeated
after about nine presses. The pass is kept in `localStorage`, so it survives a
reload and is shared between tabs; the outro says how far through it you are and
offers to start it over. A city reached by `#fragment` counts as dealt.

## Credits

Photographs come from Wikimedia Commons via the Wikipedia API and belong to their
respective photographers. All descriptive text was written by hand.
