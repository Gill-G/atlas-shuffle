#!/usr/bin/env node
/* Runs the test suite.

     node test/run.js            everything
     node test/run.js --unit     the stub-browser tests only, no Chrome needed
     node test/run.js pass       only cases whose name contains "pass"

   `node check.js` is deliberately not part of this: it validates the dataset
   against live Wikipedia, so folding it in would mean the suite could not pass
   without a network. Run it separately before committing a city. */

const unit = require("./unit.js");
const browser = require("./browser.js");

/** One assertion. Nothing here a framework would do better. */
function makeAsserts(record) {
  const assert = (ok, message, detail) => record.push({ ok, message, detail });
  return {
    ok: (value, message) => assert(!!value, message, String(value)),
    equal: (actual, expected, message) =>
      assert(Object.is(actual, expected), message, `${actual} (wanted ${expected})`),
    notEqual: (actual, unwanted, message) =>
      assert(!Object.is(actual, unwanted), message, `${actual}`),
    match: (value, re, message) => assert(re.test(String(value)), message, String(value)),
    notMatch: (value, re, message) => assert(!re.test(String(value)), message, String(value))
  };
}

async function runGroup(title, cases, filter) {
  const chosen = filter ? cases.filter((c) => c.name.includes(filter)) : cases;
  if (chosen.length === 0) return { passed: 0, failed: 0, skipped: 0, matched: 0 };

  console.log(`\n${title}`);
  let passed = 0, failed = 0, skipped = 0;
  const matched = chosen.length;

  for (const testCase of chosen) {
    const record = [];
    const asserts = makeAsserts(record);
    unit.reset();
    let threw = null;
    try {
      const outcome = await testCase.fn(asserts);
      if (outcome && outcome.skip) {
        console.log(`  skip  ${testCase.name} — ${outcome.skip}`);
        skipped++;
        continue;
      }
    } catch (err) {
      threw = err;
    }

    const bad = record.filter((r) => !r.ok);
    if (threw || bad.length) {
      failed++;
      console.log(`  FAIL  ${testCase.name}`);
      if (threw) console.log(`          threw: ${threw.message}`);
      bad.forEach((r) => console.log(`          ${r.message}: ${r.detail}`));
    } else {
      passed++;
      console.log(`  ok    ${testCase.name}`);
    }
  }
  return { passed, failed, skipped, matched };
}

(async () => {
  const args = process.argv.slice(2);
  const unitOnly = args.includes("--unit");
  const filter = args.find((a) => !a.startsWith("--"));

  const results = [await runGroup("stub browser", unit.cases, filter)];
  if (!unitOnly) results.push(await runGroup("real browser", browser.cases, filter));

  const total = results.reduce(
    (sum, r) => ({
      passed: sum.passed + r.passed, failed: sum.failed + r.failed,
      skipped: sum.skipped + r.skipped, matched: sum.matched + r.matched
    }),
    { passed: 0, failed: 0, skipped: 0, matched: 0 }
  );

  // A filter that matches nothing once reported success, so a stale name in a
  // script passed silently. Running no tests is not the same as passing.
  if (filter && total.matched === 0) {
    console.error(`\nno test matches "${filter}"`);
    process.exit(2);
  }

  console.log(
    `\n${total.passed} passed, ${total.failed} failed` +
    (total.skipped ? `, ${total.skipped} skipped` : "")
  );
  process.exit(total.failed ? 1 : 0);
})().catch((err) => {
  console.error("the suite itself failed:", err);
  process.exit(2);
});
