// Verifies the 결과/Replay 탭 no longer ships the "Baseline 비교" section.
// It compared the MAPPO policy against nearest / radiusPriority / random on the
// same split — useful while tuning the trainer, noise on the results screen.
//
// Removal had to take the renderCompare() helper and both of its call sites with
// it: the function wrote straight into $('compareRows').innerHTML with no null
// guard, so leaving either call behind would throw a TypeError on every result
// load and on every AI 양중계획 생성 run — killing the replay, gantt and report
// rendering that follow it in the same statement chain.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { JSDOM, VirtualConsole } from "jsdom";

const here = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.resolve(here, "..", "..", "web", "index.html");
const html = readFileSync(htmlPath, "utf-8");
const virtualConsole = new VirtualConsole();

// jsdom ships no canvas backend. Returning null (as the older DOM tests do)
// isn't enough here: the page's load handler paints the replay frame, so we
// need a context that absorbs any call and returns plausible shapes for the
// few getters the drawing code reads back.
const fakeContext = () => {
  const noop = () => {};
  const target = {
    measureText: () => ({ width: 0 }),
    createLinearGradient: () => ({ addColorStop: noop }),
    createRadialGradient: () => ({ addColorStop: noop }),
    createPattern: () => null,
    getImageData: () => ({ data: [] }),
    canvas: { width: 0, height: 0 },
  };
  return new Proxy(target, {
    get: (t, k) => (k in t ? t[k] : noop),
    set: (t, k, v) => {
      t[k] = v;
      return true;
    },
  });
};

const dom = new JSDOM(html, {
  url: "https://dash.example.com/trainer",
  runScripts: "dangerously",
  pretendToBeVisual: true,
  virtualConsole,
  beforeParse(window) {
    window.fetch = () =>
      Promise.resolve({ ok: true, status: 200, json: async () => ({ ok: true }), text: async () => "" });
    window.HTMLCanvasElement.prototype.getContext = fakeContext;
    window.Element.prototype.scrollIntoView = () => {};
  },
});

const { window } = dom;
const { document } = window;

// ── the section and its table are gone ──────────────────────────────────────
assert.equal(
  document.getElementById("compareRows"),
  null,
  "#compareRows still present — the Baseline 비교 table was not removed"
);
const headings = [...document.querySelectorAll("h2")].map((h) => h.textContent.trim());
assert.ok(
  !headings.some((t) => t.includes("Baseline 비교")),
  `Baseline 비교 heading still present: ${JSON.stringify(headings)}`
);

// ── no dangling references that would throw at runtime ──────────────────────
assert.equal(
  typeof window.renderCompare,
  "undefined",
  "renderCompare() still defined — dead code referencing a removed element"
);
assert.ok(
  !html.includes("renderCompare"),
  "a renderCompare call site survives in the page source"
);
assert.ok(
  !html.includes("compareRows"),
  "a compareRows reference survives in the page source"
);

// ── results sections stay sequentially numbered (no gap where 6 used to be) ──
const numbered = headings
  .map((t) => /^(\d+)\./.exec(t))
  .filter(Boolean)
  .map((m) => Number(m[1]));
const expected = [...new Set(numbered)].sort((a, b) => a - b);
assert.deepEqual(
  expected,
  Array.from({ length: expected.length }, (_, i) => i + 2),
  `section numbering has a gap: ${JSON.stringify(headings.filter((t) => /^\d+\./.test(t)))}`
);

// ── the pipeline that used to run alongside renderCompare still works ───────
// renderCompare was called inline by renderSelection() and by the plan-run
// handler. The whole result-JSON loader (renderSelection included) and the
// 사용 모델 readout that briefly replaced it have since been removed, leaving
// runPlanningAgent as the sole feeder of the results sections; every render
// step it calls must survive.
for (const fn of ["renderMetrics", "renderSchedule", "renderPlanReport", "runPlanningAgent"]) {
  assert.equal(typeof window[fn], "function", `${fn}() should still exist`);
}
for (const gone of ["renderSelection", "loadDefaultResult", "importPyTorchResult",
                    "refreshResultModelInfo"]) {
  assert.equal(typeof window[gone], "undefined", `${gone}() should be removed`);
  assert.ok(!html.includes(gone), `${gone} still referenced in the page source`);
}
for (const id of ["resultPath", "levelSelect", "splitSelect", "policySelect",
                  "resultModelSpec", "resultModelFacts"]) {
  assert.equal(document.getElementById(id), null, `#${id} should be removed`);
}
// Exporting the displayed schedule outlived both removals; it acts on the
// current result, not on any loader, so it moved to 7. Crane Schedule.
assert.equal(typeof window.downloadCurrentEventsCsv, "function", "CSV export should survive");
const csvBtn = [...document.querySelectorAll("button")]
  .find((b) => b.textContent.includes("CSV 내보내기"));
assert.ok(csvBtn, "CSV export button missing");
assert.ok(
  csvBtn.closest("section")?.querySelector("#scheduleText"),
  "CSV export should sit with the Crane Schedule it exports"
);

// The page keeps a requestAnimationFrame loop and polling timers alive; without
// tearing the window down node never exits and the run hangs.
window.close();
console.log("RESULTS_NO_BASELINE_COMPARE_OK");
