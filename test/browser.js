/* What a stub cannot check: whether markup, CSS and script agree.

   The index dialog once shipped permanently covering the site because
   `.index { display: grid }` overrode the `hidden` attribute — which hides by
   applying `display: none` from the user-agent stylesheet, so any author rule
   setting display beats it. Sixteen stub tests passed and none could have
   failed, because a stub models `hidden` as a plain property.

   So: drive the real page in a real browser and read *computed* style.

   The site is copied to a temp directory and the driver script appended
   there, so the repo is never modified. If no browser is found the cases skip
   with a visible note rather than failing — this must stay useful on a machine
   that has no Chrome. */

const { execFileSync, spawn } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { ROOT } = require("./harness.js");

const CANDIDATES = [
  process.env.CHROME,
  "/mnt/c/Program Files/Google/Chrome/Application/chrome.exe",
  "/mnt/c/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser"
].filter(Boolean);

const findBrowser = () => CANDIDATES.find((p) => { try { return fs.statSync(p).isFile(); } catch { return false; } });

/**
 * Where the browser should look for the server.
 *
 * A Windows Chrome driven from WSL does not share WSL's loopback: reaching it
 * by "localhost" relies on port forwarding that is not always up by the time
 * the page loads, which made one run in three load a "refused to connect"
 * page instead. Curl from inside WSL succeeds either way and proves nothing.
 * So address the WSL machine by its own address first, and keep localhost as
 * the fallback for an ordinary Linux browser.
 */
function hostsFor(browser) {
  const hosts = [];
  if (/\.exe$/i.test(browser)) {
    try {
      const addresses = execFileSync("hostname", ["-I"], { encoding: "utf8" }).trim().split(/\s+/);
      if (addresses[0]) hosts.push(addresses[0]);
    } catch { /* not WSL, or no hostname tool */ }
  }
  hosts.push("localhost");
  return hosts;
}

/* A one-pixel PNG, so the hero's probe image actually completes and the page
   reaches its rendered state. */
const PIXEL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

/* Answer the API from inside the page. Without this the test depends on live
   Wikipedia, and when those calls stall the virtual-time budget expires before
   the driver can report — which made one run in three fail for reasons that
   had nothing to do with the site. Whether the articles are real is check.js's
   question, not this one. */
const STUB_API = `
window.fetch = async (url) => {
  const parsed = new URL(url);
  const titles = parsed.searchParams.get("titles").split("|");
  const pages = {};
  titles.forEach((title, i) => {
    pages[i] = parsed.searchParams.get("prop") === "imageinfo"
      ? { title, imageinfo: [{ descriptionurl: "https://example.invalid/" + title,
          extmetadata: { Artist: { value: "A Photographer" },
                         LicenseShortName: { value: "CC BY 4.0" } } }] }
      : { title, thumbnail: { source: "${PIXEL}" }, pageimage: title.replace(/ /g, "_") + ".jpg" };
  });
  return { ok: true, status: 200, json: async () => ({ query: { pages } }) };
};
`;

/** Copy the site somewhere disposable, stub the API, and append the driver. */
function stage(driver) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "atlas-test-"));
  for (const entry of ["css", "js", "index.html"]) {
    fs.cpSync(path.join(ROOT, entry), path.join(dir, entry), { recursive: true });
  }
  const page = fs.readFileSync(path.join(dir, "index.html"), "utf8");
  const stubbed = page.replace(
    '<script src="js/main.js"></script>',
    `<script>${STUB_API}</script>\n<script src="js/main.js"></script>`
  );
  if (stubbed === page) throw new Error("could not stub the API: index.html no longer loads js/main.js as expected");
  fs.writeFileSync(
    path.join(dir, "index.html"),
    stubbed.replace("</body>", `<script>\n${driver}\n</script>\n</body>`)
  );
  return dir;
}

/**
 * Serve the staged copy, load it, and return whatever the driver wrote into
 * #results. The driver reports findings as `NAME :: ok|fail :: detail` lines.
 */
async function drive(driver, { port = 9000 + Math.floor(Math.random() * 900) } = {}) {
  const browser = findBrowser();
  if (!browser) return { skip: "no browser found (set CHROME to one)" };

  const dir = stage(driver);
  const server = spawn("python3", ["-m", "http.server", String(port)], { cwd: dir, stdio: "ignore" });
  // Without this a missing python3 raises an unhandled 'error' event, which
  // takes the whole run down before the message below can be printed and
  // before the temp directory is cleaned up. The suite is meant to degrade.
  let serverFailed = null;
  server.on("error", (err) => { serverFailed = err; });
  try {
    // A fixed port fails to bind when runs follow each other closely enough
    // that the last one is still in TIME_WAIT, so the port is chosen at
    // random — and if the server never answers, say so rather than letting
    // the browser load nothing and blaming the page for reporting nothing.
    let serving = false;
    for (let i = 0; i < 40; i++) {
      try { execFileSync("curl", ["-sf", "-o", "/dev/null", `http://localhost:${port}/`]); serving = true; break; }
      catch { await new Promise((r) => setTimeout(r, 250)); }
    }
    if (serverFailed) return { skip: `no server to test with (${serverFailed.message})` };
    if (!serving) return { failed: `the test server never answered on port ${port}` };

    /* A profile of its own: --headless=new otherwise uses the default one,
       which the reader's everyday Chrome is usually holding open, and the
       launch then hands off or refuses and dumps nothing at all.

       A Windows Chrome cannot use a WSL path for this — it simply fails to
       start — so the directory is handed over in the form that Windows can
       see. If that conversion is not available, go without a profile rather
       than pass a path the browser will choke on. */
    const profile = fs.mkdtempSync(path.join(os.tmpdir(), "atlas-profile-"));
    let profileArg = profile;
    if (/\.exe$/i.test(browser)) {
      try {
        profileArg = execFileSync("wslpath", ["-w", profile], { encoding: "utf8" }).trim();
      } catch {
        profileArg = null;
      }
    }
    const profileFlags = profileArg
      ? [`--user-data-dir=${profileArg}`, "--no-first-run", "--no-default-browser-check"]
      : [];
    let found = null;
    try {
      for (const host of hostsFor(browser)) {
        let dom = "";
        try {
          dom = execFileSync(browser, [
            "--headless=new", "--disable-gpu", "--window-size=1440,900",
            ...profileFlags,
            "--virtual-time-budget=60000", "--dump-dom", `http://${host}:${port}/`
          ], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024, stdio: ["ignore", "pipe", "ignore"] });
        } catch (err) {
          continue;   // this address did not work; try the next one
        }
        found = /<pre id="results">([\s\S]*?)<\/pre>/.exec(dom);
        if (found) break;
      }
    } finally {
      fs.rmSync(profile, { recursive: true, force: true });
    }
    if (!found) return { lines: [], missing: true };
    return {
      lines: found[1]
        .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"')
        .split("\n").map((l) => l.trim()).filter(Boolean)
        .map((line) => {
          const [name, verdict, detail = ""] = line.split(" :: ");
          return { name, ok: verdict === "ok", detail };
        })
    };
  } finally {
    server.kill();
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

/* The driver runs inside the page. It has no access to anything here. */
const DRIVER = `
const found = [];
// The detail must never be empty: trimming the line would leave a trailing
// "::" that the separator no longer matches, and the verdict would parse wrong.
const report = (name, ok, detail) => found.push(name + " :: " + (ok ? "ok" : "fail") + " :: " + (detail || "-"));
const displayOf = (id) => getComputedStyle(document.getElementById(id)).display;

/* Wait for the page to be ready rather than guessing a delay. Under
   --virtual-time-budget the clock races ahead but pauses for real network, so
   a fixed timeout long enough for the credits to arrive can exhaust the budget
   before it ever fires. Polling costs nothing and finishes as soon as it can. */
async function ready() {
  for (let i = 0; i < 80; i++) {
    const credited = /Photo:/.test(document.getElementById("hero-credit").textContent);
    if (credited && typeof CITIES !== "undefined") return;
    await new Promise((r) => setTimeout(r, 100));
  }
}

addEventListener("load", async () => {
  await ready();
  try {
    report("index is hidden on load", displayOf("index") === "none", "display=" + displayOf("index"));

    document.getElementById("index-open").click();
    report("opens when asked", displayOf("index") !== "none", "display=" + displayOf("index"));
    report("every city has a row",
      document.querySelectorAll(".index__city").length === CITIES.length,
      document.querySelectorAll(".index__city").length + " rows");
    report("the count is filled in", /deck/.test(document.getElementById("index-note").textContent),
      document.getElementById("index-note").textContent);

    document.getElementById("index-close").click();
    report("closes again", displayOf("index") === "none", "display=" + displayOf("index"));

    document.getElementById("index-open").click();
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    report("Escape closes it", displayOf("index") === "none", "display=" + displayOf("index"));

    // The reset control sits inside a sentence of muted prose and must not be
    // the least visible text in it, which it was until it got its own colour.
    const linkish = document.querySelector(".linkish");
    const prose = getComputedStyle(document.querySelector(".outro__count")).color;
    report("the reset control outreads the prose around it",
      linkish && getComputedStyle(linkish).color !== prose,
      linkish ? getComputedStyle(linkish).color + " vs " + prose : "no control found");

    const hero = document.getElementById("hero-img");
    report("the hero photograph is shown", !!hero.getAttribute("src"), hero.getAttribute("src") || "no src");
    report("photographs are credited",
      /Photo:/.test(document.getElementById("hero-credit").textContent),
      document.getElementById("hero-credit").textContent);
    report("the driver ran to the end", true, "no exception");
  } catch (err) {
    report("the driver ran to the end", false, err.message);
  }

  const out = document.createElement("pre");
  out.id = "results";
  out.textContent = found.join("\\n");
  document.body.append(out);
});
`;

let outcome = null;
const once = async () => (outcome ||= await drive(DRIVER));

/* Each finding from the page becomes a case here, so a failure names itself. */
const NAMES = [
  // first, so that a driver that threw says why instead of every other case
  // failing with "no result" and the one line carrying the reason discarded
  "the driver ran to the end",
  "index is hidden on load",
  "opens when asked",
  "every city has a row",
  "the count is filled in",
  "closes again",
  "Escape closes it",
  "the reset control outreads the prose around it",
  "the hero photograph is shown",
  "photographs are credited"
];

const cases = NAMES.map((name) => ({
  name,
  fn: async (t) => {
    const result = await once();
    if (result.skip) return { skip: result.skip };
    if (result.failed) { t.ok(false, result.failed); return; }
    if (result.missing) { t.ok(false, "the page never reported results"); return; }
    const finding = result.lines.find((l) => l.name === name);
    if (!finding) { t.ok(false, `no result for "${name}"`); return; }
    t.ok(finding.ok, finding.detail);
  }
}));

module.exports = { cases, findBrowser };
