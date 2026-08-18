// Verifies the rated-load-curve overlay on the AI 양중계획 편집 뷰:
// planAppliedCapacityCurve must mirror /api/plan/run's rule (curve applies only
// for policy=mappo + a checkpoint with crane_capacity_curve meta), the per-lift
// rated radius / over-rating judgement must follow env.py's step semantics, and
// drawPlanEditor must render with the overlay active.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { JSDOM, VirtualConsole } from "jsdom";

const here = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.resolve(here, "..", "..", "web", "index.html");
const html = readFileSync(htmlPath, "utf-8");
const virtualConsole = new VirtualConsole();

const noopCtx = new Proxy(
  {},
  {
    get: (t, prop) => {
      if (prop === "canvas") return null;
      return typeof prop === "string" ? () => noopCtx : undefined;
    },
    set: () => true,
  }
);

const dom = new JSDOM(html, {
  url: "https://dash.example.com/trainer",
  runScripts: "dangerously",
  pretendToBeVisual: true,
  virtualConsole,
  beforeParse(window) {
    window.fetch = () =>
      Promise.resolve({ ok: true, status: 200, json: async () => ({}), text: async () => "" });
    window.HTMLCanvasElement.prototype.getContext = () => noopCtx;
  },
});

const { window } = dom;
const $ = (id) => window.document.getElementById(id);

// Register a fake checkpoint (with curve meta) in the lexical _modelCache and
// select it. The curve rates 40t at 3m down to 10t at 18m — the 40t cap lets a
// 50t lift (liftWeight clamps at 50) exceed the whole curve.
window.eval(`_modelCache = [{
  path: "m/with_curve.pt",
  meta: { crane_capacity_curve: [
    { radius: 3, capacityT: 40 }, { radius: 10, capacityT: 25 }, { radius: 18, capacityT: 10 },
  ] },
}, { path: "m/no_curve.pt", meta: {} }];`);
const sel = $("planModelPath");
sel.innerHTML = '<option value="m/with_curve.pt"></option><option value="m/no_curve.pt"></option>';
sel.value = "m/with_curve.pt";

// ── planAppliedCapacityCurve mirrors the server's applicability rule ─────────
// (the policy selector was removed upstream — MAPPO only, no policy gate)
assert.equal(window.planAppliedCapacityCurve().length, 3, "curve meta → applied");
sel.value = "m/no_curve.pt";
assert.equal(window.planAppliedCapacityCurve(), null, "model without curve meta → no curve");
sel.value = "m/with_curve.pt";

// ── rated radius / over-rating judgement (step semantics like env.py) ────────
const curve = window.planAppliedCapacityCurve();
assert.equal(window.ratedMaxRadiusForWeight(10, curve, 18), 18, "10t allowed out to 18m");
assert.equal(window.ratedMaxRadiusForWeight(25, curve, 18), 10, "25t allowed out to 10m");
assert.equal(window.ratedMaxRadiusForWeight(45, curve, 18), -1, "45t exceeds the whole curve");

// ── the editor view renders with curve + over-rated lift + height order ──────
$("planHeightOrderRadius").value = "10";
window.eval(`planLifts = [
  { id: "L-ok",   x: 20, y: 10, weightT: 10, z: 3 },
  { id: "L-over", x: 25, y: 10, weightT: 50, z: 12 },
];
planCranes = [{ id: "C1", x: 10, y: 10 }];`);
window.drawPlanEditor(); // must not throw with overlay + caption active
window.refreshPlanLiftWeightTable();
const tableHtml = $("planLiftWeightBody").innerHTML;
assert.ok(tableHtml.includes("정격 초과"), "table flags the over-rated lift");
assert.ok(tableHtml.includes("R ≤"), "table shows the rated radius for liftable weights");

// A model without curve meta removes the judgement (single working radius).
sel.value = "m/no_curve.pt";
window.refreshPlanLiftWeightTable();
assert.ok(
  $("planLiftWeightBody").innerHTML.includes("단일 작업반경"),
  "model without curve meta → table reports single working radius"
);
window.drawPlanEditor(); // caption path without curve must not throw
sel.value = "m/with_curve.pt";

console.log("PLAN_CAPACITY_VIEW_OK");
window.close();
process.exit(0);
