/* A stub browser, good enough to run js/main.js against.
   No dependencies; Node 18+.

   The site has no build step and no framework, so the real file is executed in
   a `vm` context with hand-written stand-ins for the handful of browser things
   it touches: document, window, localStorage, Image and fetch.

   Two details carry most of the value:

     - `setItem` dispatches a storage event to every *other* booted tab, which
       is the only way the cross-tab code in main.js ever executes. Several
       real bugs lived there and none was reachable by clicking.

     - the stub `Image` completes its load on the next tick. renderHero waits
       on a probe image decoding before it shows anything, so without this
       nothing is ever displayed and every assertion measures the stub instead
       of the site.

   What this cannot do is CSS. `hidden` here is a plain property with no
   stylesheet behind it, so a rule like `.index { display: grid }` overriding
   the hidden attribute is invisible to every test in this file. That is what
   test/browser.js is for. */

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..");

function makeElement(tag) {
  const el = {
    tag,
    children: [],
    attrs: {},
    handlers: [],
    style: { setProperty() {} },
    className: "",
    id: "",
    type: "",
    alt: "",
    src: "",
    href: "",
    hidden: false,
    focused: false,
    text: "",

    classList: {
      set: new Set(),
      add(...names) { names.forEach((n) => this.set.add(n)); },
      remove(...names) { names.forEach((n) => this.set.delete(n)); },
      contains(name) { return this.set.has(name); }
    },

    set textContent(value) { el.text = String(value); el.children = []; },
    get textContent() {
      return el.text + el.children.map((c) => c.textContent || c.text || "").join("");
    },

    append(...nodes) { nodes.forEach((n) => el.children.push(n)); },
    replaceChildren(...nodes) { el.children = []; el.text = ""; nodes.forEach((n) => el.children.push(n)); },
    setAttribute(name, value) { el.attrs[name] = value; },
    removeAttribute(name) { delete el.attrs[name]; },
    focus() { el.focused = true; },
    addEventListener(type, fn) { el.handlers.push({ type, fn }); },
    click() { el.handlers.filter((h) => h.type === "click").forEach((h) => h.fn({ target: el })); }
  };
  return el;
}

/** Every tab booted so far, so a write in one can reach the others. */
const tabs = [];

/**
 * Boot the site.
 *
 * @param store  a Map standing in for localStorage; share one between tabs
 * @param hash   the URL fragment to start on, as a deep link would
 * @param respond  optional fetch stand-in, for testing what the API returns
 */
function boot(store = new Map(), { hash = "", respond = null, connection = null, realTime = false } = {}) {
  /* shuffle() waits 220ms for the fade before it shows anything, and a full
     pass is fifty of those. Capping the site's timers makes the suite run in
     seconds instead of a minute without changing any ordering: everything
     still happens in the same sequence, just sooner. Pass realTime to keep the
     real delays where a test depends on their length. */
  const schedule = realTime
    ? setTimeout
    : (fn, ms) => setTimeout(fn, Math.min(Number(ms) || 0, 5));

  const elements = new Proxy({}, { get: (own, id) => (own[id] ||= makeElement("div")) });
  const listeners = {};
  const tab = { elements, imageLoads: [], requests: [] };

  const sandbox = {
    console, setTimeout: schedule, clearTimeout, Promise, Math, Object, Array, JSON,
    String, Number, RegExp, Error, Date, URLSearchParams, Set, Map,

    localStorage: {
      getItem: (key) => (store.has(key) ? store.get(key) : null),
      setItem: (key, value) => {
        store.set(key, value);
        tabs.forEach((other) => { if (other !== tab) other.receiveStorage(key, value); });
      }
    },

    document: {
      getElementById: (id) => elements[id],
      createElement: (tag) => makeElement(tag),
      createTextNode: (text) => ({ text: String(text), children: [] }),
      addEventListener: (type, fn) => { (listeners[type] ||= []).push(fn); },
      body: makeElement("body"),
      documentElement: makeElement("html"),
      title: ""
    },

    window: {
      innerWidth: 1440,
      devicePixelRatio: 1,
      matchMedia: () => ({ matches: false }),
      scrollTo() {},
      addEventListener: (type, fn) => { (listeners[type] ||= []).push(fn); }
    },

    navigator: connection ? { connection } : {},
    history: { replaceState() {} },
    location: { hash },

    Image: class {
      set src(value) {
        tab.imageLoads.push(value);
        this.value = value;
        if (this.onload) setTimeout(() => this.onload(), 0);
      }
      get src() { return this.value; }
    },

    fetch: async (url) => {
      const parsed = new URL(url);
      tab.requests.push(parsed);
      if (respond) return respond(parsed);

      const titles = parsed.searchParams.get("titles").split("|");
      const pages = {};
      titles.forEach((title, i) => {
        pages[i] = parsed.searchParams.get("prop") === "imageinfo"
          ? {
              title,
              imageinfo: [{
                descriptionurl: `https://commons.example/${title}`,
                extmetadata: {
                  Artist: { value: '<a href="//x">A Photographer</a>' },
                  LicenseShortName: { value: "CC BY 4.0" }
                }
              }]
            }
          : {
              title,
              thumbnail: { source: `https://img.example/${encodeURIComponent(title)}.jpg` },
              pageimage: `${encodeURIComponent(title)}.jpg`
            };
      });
      return { ok: true, status: 200, json: async () => ({ query: { pages } }) };
    }
  };

  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(path.join(ROOT, "js/cities.js"), "utf8"), sandbox);
  vm.runInContext(fs.readFileSync(path.join(ROOT, "js/main.js"), "utf8"), sandbox);

  tab.sandbox = sandbox;
  tab.read = (expression) => vm.runInContext(expression, sandbox);
  tab.run = (expression) => vm.runInContext(expression, sandbox);
  tab.press = (key) =>
    (listeners.keydown || []).forEach((fn) =>
      fn({ key, target: { tagName: "BODY" }, preventDefault() {} }));
  tab.receiveStorage = (key, value) =>
    (listeners.storage || []).forEach((fn) => fn({ key, newValue: value }));
  /** Deliver a record as another tab's write, without booting a second tab —
      a second tab takes paths of its own that mask what the first one does. */
  tab.otherTabWrote = (ids) => {
    const value = JSON.stringify(ids);
    store.set("atlas-shuffle:seen:v1", value);
    tab.receiveStorage("atlas-shuffle:seen:v1", value);
  };

  tabs.push(tab);
  return tab;
}

/** Forget previously booted tabs, so storage events do not leak between cases. */
const reset = () => { tabs.length = 0; };

const tick = (ms = 0) => new Promise((resolve) => setTimeout(resolve, ms));

/** Let boot settle: the first city renders through two awaits and a probe image. */
const settle = () => tick(400);

module.exports = { boot, reset, tick, settle, tabs, ROOT };
