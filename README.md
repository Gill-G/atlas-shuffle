# Somewhere Else

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
js/cities.js    # the dataset: 24 cities, hand-written
js/main.js      # picks a city, fetches photos, renders the page
start.sh        # local static server
```

## How the photos work

No images are stored in this repo and no image URLs are hardcoded — those rot.
Instead each gallery entry names an **English Wikipedia article**:

```js
{ article: "Trevi Fountain", caption: "Trevi Fountain marks the end of an aqueduct…" }
```

At render time `main.js` makes one call to the MediaWiki `pageimages` API for all
six of a city's articles and uses each article's lead photograph. Results are
cached in memory, so shuffling back to a city you've already seen costs nothing.

If the request fails — offline, blocked, rate-limited — every word on the page
still renders and the image slots fall back to a coloured wash. The site is never
blank.

All 144 image slots were checked against the live API and resolve to a photo.

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
be an exact English Wikipedia title that has a lead photo. Check a new one with:

```bash
curl -s "https://en.wikipedia.org/w/api.php?action=query&format=json&redirects=1\
&prop=pageimages&piprop=thumbnail&pithumbsize=800&titles=Porto"
```

A `"missing"` key means the title is wrong; no `thumbnail` key means the article
has no lead image.

## Interaction

| | |
|---|---|
| `R` | new city |
| `#tokyo` | link straight to one city |
| Shuffle button | top right, and at the foot of the page |

## Credits

Photographs come from Wikimedia Commons via the Wikipedia API and belong to their
respective photographers. All descriptive text was written by hand.
