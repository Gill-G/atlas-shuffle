/* Behaviour of js/main.js, run against the stub browser in harness.js.

   Most of these are regressions: a bug was found, fixed, and the case that
   caught it left here. Each was written against the commit before its fix and
   shown to fail there first — a test that has never failed has proved nothing.

   The cross-tab cases drive the storage handler directly with
   `otherTabWrote()` rather than booting a second tab. A second tab completes
   passes and resets them on its own, which hid two real faults. */

const { boot, reset, tick, settle } = require("./harness.js");

const cases = [];
const test = (name, fn) => cases.push({ name, fn });

test("a pass deals every city exactly once", async (t) => {
  const tab = boot();
  await settle();
  const total = tab.read("CITIES.length");
  const drawn = [tab.read("current.id")];
  for (let i = 0; i < total - 1; i++) {
    await tab.run("shuffle()");
    drawn.push(tab.read("current.id"));
    await tick(3);
  }
  t.equal(new Set(drawn).size, total, "distinct cities in one pass");
});

test("no city follows itself", async (t) => {
  const tab = boot();
  await settle();
  const drawn = [tab.read("current.id")];
  for (let i = 0; i < 60; i++) {
    await tab.run("shuffle()");
    drawn.push(tab.read("current.id"));
    await tick(3);
  }
  t.equal(drawn.filter((c, i) => i > 0 && drawn[i - 1] === c).length, 0, "back-to-back repeats");
});

test("the pass survives a reload", async (t) => {
  const store = new Map();
  const seen = [];
  for (let load = 0; load < 4; load++) {
    const tab = boot(store);
    await settle();
    seen.push(tab.read("current.id"));
    for (let i = 0; i < 4; i++) {
      await tab.run("shuffle()");
      seen.push(tab.read("current.id"));
      await tick(3);
    }
  }
  t.equal(new Set(seen).size, seen.length, `distinct across ${seen.length} draws in four loads`);
});

test("a city removed from the dataset stops being counted", async (t) => {
  // renderPass() once used seen.size while freshDeck() filtered against
  // CITIES, so a record holding ids of deleted cities made them disagree.
  const store = new Map();
  const probe = boot();
  await settle();
  // All but two, so the dead ids push the count past the size of the deck —
  // which is what made the page announce a finished pass with cities left.
  const real = probe.read("CITIES.slice(0, CITIES.length - 2).map(c => c.id)");
  reset();

  store.set("atlas-shuffle:seen:v1", JSON.stringify([...real, "atlantis", "narnia", "gotham"]));
  const tab = boot(store);
  await settle();

  // Not the deck's length: with two cities left, one is shown and one is in
  // hand, so an empty deck here is correct. What the bug did was count the
  // dead ids, overrun the deck and declare the pass finished.
  t.ok(tab.read("seen.size") <= tab.read("CITIES.length"), "seen never exceeds the deck");
  t.notMatch(tab.read('document.getElementById("pass-progress").textContent'),
    /all of them/, "does not claim the pass is finished");
});

test("storage that throws does not stop the site", async (t) => {
  const angry = {
    has() { throw new Error("blocked"); },
    get() { throw new Error("blocked"); },
    set() { throw new Error("blocked"); }
  };
  const tab = boot(angry);
  await settle();
  t.ok(typeof tab.read("current && current.id") === "string", "a city is still shown");
});

test("another tab's write never loses cities from the record", async (t) => {
  const store = new Map();
  const first = boot(store);
  await settle();
  const second = boot(store);
  await settle();
  for (let i = 0; i < 6; i++) { await first.run("shuffle()"); await tick(3); }

  const firstSaw = first.read("[...seen]");
  await second.run("shuffle()");
  await tick(20);

  const record = new Set(JSON.parse(store.get("atlas-shuffle:seen:v1")));
  t.equal(firstSaw.filter((id) => !record.has(id)).length, 0, "ids lost from the record");
});

test("the card in hand is dropped when another tab plays it", async (t) => {
  const tab = boot();
  await settle();
  for (let i = 0; i < 3; i++) { await tab.run("shuffle()"); await tick(3); }

  const held = tab.read("nextCity.id");
  tab.otherTabWrote([...tab.read("[...seen]"), held]);
  await tick(40);

  t.notEqual(tab.read("nextCity && nextCity.id"), held, "still holding the played card");
  const before = tab.read('document.getElementById("pass-progress").textContent');
  await tab.run("shuffle()");
  await tick(20);
  t.notEqual(tab.read("current.id"), held, "showed a city the pass had counted");
  t.notEqual(tab.read('document.getElementById("pass-progress").textContent'), before, "tally advanced");
});

test("a pass adopted from another tab is written back", async (t) => {
  // Without this the record lacks an id this tab holds, which is the exact
  // condition the handler reads as "the other tab started over" — so the
  // destructive branch fired again on every later write.
  const store = new Map();
  const tab = boot(store);
  await settle();
  for (let i = 0; i < 3; i++) { await tab.run("shuffle()"); await tick(3); }

  const theirs = [tab.read("CITIES[0].id")];
  tab.otherTabWrote(theirs);
  await tick(40);

  const held = tab.read("[...seen]");
  const stored = JSON.parse(store.get("atlas-shuffle:seen:v1"));
  t.equal(held.filter((id) => !stored.includes(id)).length, 0, "ids this tab holds that storage lacks");
});

test("a finished pass is not reset by another tab's write", async (t) => {
  const store = new Map();
  const tab = boot(store);
  await settle();
  while (tab.read("deck.length") > 0) { await tab.run("shuffle()"); await tick(2); }

  tab.otherTabWrote(tab.read("CITIES.map(c => c.id)"));
  await tick(40);

  t.equal(JSON.parse(store.get("atlas-shuffle:seen:v1")).length, tab.read("CITIES.length"),
    "ids left in the record");
  t.match(tab.read('document.getElementById("pass-progress").textContent'),
    /all of them/, "the completion state is shown");
});

test("the restart branch also drops a stale card", async (t) => {
  const tab = boot();
  await settle();
  for (let i = 0; i < 3; i++) { await tab.run("shuffle()"); await tick(3); }

  const held = tab.read("nextCity.id");
  // a record that drops ids this tab holds (so: a restart) but contains its card
  tab.otherTabWrote([held, tab.read(`CITIES.find(c => c.id !== "${held}").id`)]);
  await tick(40);

  t.notEqual(tab.read("nextCity && nextCity.id"), held, "still holding a counted card");
});

test("shuffle re-checks its choice after the fade", async (t) => {
  const tab = boot();
  await settle();
  for (let i = 0; i < 3; i++) { await tab.run("shuffle()"); await tick(3); }

  const about = tab.read("nextCity.id");
  const running = tab.run("shuffle()");          // starts the 220ms fade
  tab.otherTabWrote([...tab.read("[...seen]"), about]);   // ...and lands inside it
  await running;
  await tick(30);

  t.notEqual(tab.read("current.id"), about, "showed the city the other tab just showed");
});

test("starting the pass over moves focus and says so", async (t) => {
  const tab = boot();
  await settle();
  for (let i = 0; i < 4; i++) { await tab.run("shuffle()"); await tick(3); }

  tab.elements["pass-reset"].click();
  await tick(20);

  t.ok(tab.elements["shuffle-2"].focused, "focus moved off the button that hid itself");
  const tally = tab.read('document.getElementById("pass-progress").textContent');
  const spoken = tab.read('document.getElementById("announcer").textContent');
  t.match(spoken, /reset/i, "the reset is announced");
  t.equal((tally.match(/(\d+) to go/) || [])[1], (spoken.match(/(\d+) cities/) || [])[1],
    "the screen and the announcement quote the same number");
});

test("the next city's photograph waits for a connection that can afford it", async (t) => {
  const cases = [
    ["no information", null, true],
    ["4g, 10 Mbps", { effectiveType: "4g", downlink: 10 }, true],
    ["4g, 1.5 Mbps", { effectiveType: "4g", downlink: 1.5 }, false],
    ["3g", { effectiveType: "3g", downlink: 10 }, false]
  ];
  for (const [label, connection, shouldPrefetch] of cases) {
    reset();
    const tab = boot(new Map(), { connection });
    await tick(600);
    // one probe image is the city on screen; more than that is the prefetch
    t.equal(tab.imageLoads.length > 1, shouldPrefetch, `prefetched the photograph on ${label}`);
    const shown = tab.read("current.gallery.map(g => g.article)");
    t.ok(tab.requests.some((r) => r.searchParams.get("titles").split("|").some((a) => !shown.includes(a))),
      `still resolved the next city's addresses on ${label}`);
  }
});

test("photographs are asked for at the size they are drawn", async (t) => {
  const tab = boot();
  await settle();
  const sizes = tab.requests
    .filter((r) => r.searchParams.get("prop") === "pageimages")
    .map((r) => Number(r.searchParams.get("pithumbsize")));
  t.ok(sizes.length >= 2, "the hero is fetched separately from the grid");
  t.ok(Math.max(...sizes) > Math.min(...sizes), "the hero is asked for larger than the tiles");
});

test("every photograph is credited", async (t) => {
  const tab = boot();
  await settle();
  await tick(200);
  t.equal(tab.read("creditNodes.length"), 6, "credit lines on screen");
  t.equal(tab.read("creditNodes.filter(c => c.node.children.length > 0).length"), 6, "credit lines filled");
  t.match(tab.read("creditNodes[0].node.textContent"), /A Photographer/, "the photographer is named");
});

test("a credit that cannot be found does not stop the city", async (t) => {
  const tab = boot(new Map(), {
    respond: async (url) => {
      if (url.searchParams.get("prop") === "imageinfo") throw new Error("no credits today");
      const titles = url.searchParams.get("titles").split("|");
      const pages = {};
      titles.forEach((title, i) => {
        pages[i] = { title, thumbnail: { source: "https://img.example/x.jpg" }, pageimage: "x.jpg" };
      });
      return { ok: true, status: 200, json: async () => ({ query: { pages } }) };
    }
  });
  await settle();
  await tick(200);
  t.ok(tab.read("current && current.name"), "the city still rendered");
  t.equal(tab.read("creditNodes[0].node.children.length"), 0, "the credit is left empty, not wrong");
});

test("two cities cannot be on their way to the screen at once", async (t) => {
  // The shuffle button, a row in the index and a pasted #fragment all start a
  // show. Two at once used to finish in whatever order the network decided:
  // the slower one won the hero while the faster had set the title.
  //
  // The gap matters. shuffle() calls show() only after its fade, so a click
  // that lands before that gets the earlier token and the shuffle wins
  // harmlessly. The damage needs the click to land after the fade and before
  // the photographs arrive, which is when the shuffle's own show is the one
  // abandoned — and its card is still in nextCity.
  // Read from the tab under test, not a probe: every boot shuffles its own
  // deck, so a card queued in one tab says nothing about the next.
  let slow = [], medium = [];
  const respond = () => async (url) => {
    const titles = url.searchParams.get("titles").split("|");
    await tick(titles.some((x) => slow.includes(x)) ? 240 : titles.some((x) => medium.includes(x)) ? 30 : 1);
    const pages = {};
    titles.forEach((title, i) => {
      pages[i] = url.searchParams.get("prop") === "imageinfo"
        ? { title, imageinfo: [{ descriptionurl: "x", extmetadata: {} }] }
        : { title, thumbnail: { source: "https://img.example/x.jpg" }, pageimage: "x.jpg" };
    });
    return { ok: true, status: 200, json: async () => ({ query: { pages } }) };
  };

  // 2g keeps the card queued but unwarmed, so the shuffle really waits
  const tab = boot(new Map(), { respond: respond(), connection: { effectiveType: "2g" } });
  await settle();

  const pickedId = tab.read("CITIES.find(c => c.id !== current.id && c.id !== nextCity.id).id");
  medium = tab.read("nextCity.gallery.map(g => g.article)");
  slow = tab.read(`CITIES.find(c => c.id === "${pickedId}").gallery.map(g => g.article)`);

  const shuffling = tab.run("shuffle()");
  await tick(12);
  tab.run(`(() => { const c = CITIES.find(x => x.id === "${pickedId}"); current = c; show(c); })()`);
  await shuffling;
  await tick(700);

  const onScreen = new Set([
    tab.read("current.name"),
    tab.read('document.getElementById("hero-name").textContent'),
    tab.read('document.getElementById("hero-img").alt').split(":")[0],
    tab.read("document.title").split(",")[0],
    tab.read('document.getElementById("announcer").textContent').split(",")[0].replace("Now showing ", "")
  ]);
  t.equal(onScreen.size, 1, `cities on the page at once: ${[...onScreen].join(" / ")}`);

  // And the pass must still add up. An abandoned show once handed its card
  // back while nextCity still held it, so the deck ended with two of it.
  const deck = tab.read("deck.map(c => c.id)");
  const seen = tab.read("[...seen]");
  const hand = tab.read("nextCity && nextCity.id");
  const duplicated = deck.filter((id, i) => deck.indexOf(id) !== i);
  t.equal(duplicated.length, 0, `cards duplicated in the deck: ${duplicated.join(", ")}`);
  t.equal(deck.filter((id) => seen.includes(id)).length, 0, "cards in the deck already counted as seen");
  t.equal(hand && deck.includes(hand) ? 1 : 0, 0, "the card in hand is also in the deck");
  t.equal(deck.length + seen.length + (hand ? 1 : 0), tab.read("CITIES.length"),
    `cards accounted for (deck ${deck.length} + seen ${seen.length} + hand ${hand ? 1 : 0})`);
});

test("the card in hand is never also in the deck", async (t) => {
  // When another tab starts a new pass, freshDeck() rebuilds from every city
  // it has not seen — which includes the one already dealt into this tab's
  // hand. Without taking it back out, that card gets dealt a second time.
  const tab = boot();
  await settle();
  for (let i = 0; i < 3; i++) { await tab.run("shuffle()"); await tick(3); }

  const held = tab.read("nextCity.id");
  // a record that drops what this tab holds — a restart — and does not
  // mention the card in hand, so it stays unseen and lands in the new deck
  tab.otherTabWrote([tab.read(`CITIES.find(c => c.id !== "${held}" && c.id !== current.id).id`)]);
  await tick(40);

  const hand = tab.read("nextCity && nextCity.id");
  const deck = tab.read("deck.map(c => c.id)");
  t.ok(hand, "a card is still in hand");
  t.equal(hand && deck.includes(hand) ? 1 : 0, 0, `${hand} is in the deck as well as in hand`);
  t.equal(deck.filter((id, i) => deck.indexOf(id) !== i).length, 0, "duplicates in the deck");
});

test("the index lists every city, grouped, and marks the pass", async (t) => {
  const tab = boot();
  await settle();
  for (let i = 0; i < 4; i++) { await tab.run("shuffle()"); await tick(3); }

  tab.elements["index-open"].click();
  await tick(20);

  const total = tab.read("CITIES.length");
  t.equal(tab.read("indexNodes.size"), total, "rows built");
  t.equal(tab.read('document.getElementById("index-body").children.length'),
    tab.read("new Set(CITIES.map(c => c.region)).size"), "region groups");
  t.equal(tab.read("[...indexNodes.values()].filter(r => r.button.classList.contains('is-seen')).length"),
    5, "cities ticked after five shown");
  t.ok(tab.elements["index-close"].focused, "focus moved into the dialog");

  tab.press("r");
  const before = tab.read("current.id");
  await tick(300);
  t.equal(tab.read("current.id"), before, "R shuffled the page underneath the dialog");

  tab.press("Escape");
  await tick(10);
  t.equal(tab.read('document.getElementById("index").hidden'), true, "Escape sets hidden");
  t.ok(tab.elements["index-open"].focused, "focus returned to the opener");
});

module.exports = { cases, reset };
