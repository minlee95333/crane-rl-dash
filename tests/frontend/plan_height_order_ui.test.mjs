// Verifies the height-order UI on the AI 양중계획 탭: the client-side precedence
// mirror (_planHeightOrder), the lift z round-trip through the layout text and
// /api/plan/run payload (liftPayload), and the report issue line built from
// result.heightOrder. The server rule lives in crane_core.env; this page must
// show the same "낮은 것 먼저" order it will impose.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { JSDOM, VirtualConsole } from "jsdom";

const here = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.resolve(here, "..", "..", "web", "index.html");
const html = readFileSync(htmlPath, "utf-8");
const virtualConsole = new VirtualConsole();

// A no-op 2D context so drawPlanEditor can run under jsdom (which has no canvas).
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

// planLifts is a top-level lexical `let`, so seed it through eval in the page
// realm. L-high(z=12) sits 5m from L-low(z=3) — inside the 10m rule; L-free is
// far away and unconstrained.
window.document.getElementById("planHeightOrderRadius").value = "10";
window.eval(`planLifts = [
  { id: "L-high", x: 20, y: 10, weightT: 1, z: 12 },
  { id: "L-low",  x: 25, y: 10, weightT: 1, z: 3 },
  { id: "L-free", x: 80, y: 80, weightT: 1, z: 20 },
];`);

// ── _planHeightOrder: reqs / rank / constrained set ─────────────────────────
let ho = window._planHeightOrder();
assert.ok(ho, "order info exists when radius > 0 and heights differ");
// Cross-realm arrays fail deepStrictEqual on prototype identity — compare JSON.
assert.equal(JSON.stringify(ho.reqs), "[[1],[],[]]", "L-high requires L-low; others free");
assert.equal(ho.rank[1], 1, "L-low is tier 1 (먼저)");
assert.equal(ho.rank[0], 2, "L-high is tier 2");
assert.equal(JSON.stringify([...ho.constrained].sort()), "[0,1]", "only the pair is badged");

// Radius 0 disables the overlay entirely.
window.document.getElementById("planHeightOrderRadius").value = "0";
assert.equal(window._planHeightOrder(), null, "radius 0 → no overlay");
window.document.getElementById("planHeightOrderRadius").value = "10";

// Equal heights impose no order even inside the radius — but the
// discoverability hint must flag the pair so the user learns why.
window.eval(`planLifts = [
  { id: "A", x: 20, y: 10, weightT: 1, z: 5 },
  { id: "B", x: 22, y: 10, weightT: 1, z: 5 },
];`);
assert.equal(window._planHeightOrder(), null, "equal z → no constraints");
assert.equal(
  JSON.stringify(window._planHeightOrderHintPairs()),
  "[[0,1]]",
  "equal-z pair inside the radius is surfaced as a hint"
);

// The hint stays silent when the pair is out of radius, heights differ, or
// the radius is off — no noise once the user has armed the constraint.
window.eval(`planLifts = [
  { id: "A", x: 20, y: 10, weightT: 1, z: 5 },
  { id: "B", x: 80, y: 80, weightT: 1, z: 5 },
];`);
assert.equal(window._planHeightOrderHintPairs(), null, "far pair → no hint");
window.eval(`planLifts = [
  { id: "A", x: 20, y: 10, weightT: 1, z: 5 },
  { id: "B", x: 22, y: 10, weightT: 1, z: 9 },
];`);
assert.equal(window._planHeightOrderHintPairs(), null, "differing z → arrows, not hint");
window.document.getElementById("planHeightOrderRadius").value = "0";
window.eval(`planLifts = [
  { id: "A", x: 20, y: 10, weightT: 1, z: 5 },
  { id: "B", x: 22, y: 10, weightT: 1, z: 5 },
];`);
assert.equal(window._planHeightOrderHintPairs(), null, "radius 0 → no hint");
window.document.getElementById("planHeightOrderRadius").value = "10";

// ── z round-trip: payload + layout text ─────────────────────────────────────
window.eval(`planLifts = [{ id: "L1", x: 20, y: 10, weightT: 2.5, z: 12 }];`);
assert.equal(window.liftPayload(window.eval("planLifts[0]")).z, 12, "payload carries z");
window.syncPlanText();
const text = window.document.getElementById("planLayoutText").value;
assert.ok(/^lift,L1,20\.00,10\.00,2\.50,12\.00$/m.test(text), `layout text keeps z: ${text}`);
window.applyPlanText();
assert.equal(window.eval("planLifts[0].z"), 12, "applyPlanText restores z");

// drawPlanEditor must run without throwing with the overlay active.
window.eval(`planLifts = [
  { id: "L-high", x: 20, y: 10, weightT: 1, z: 12 },
  { id: "L-low",  x: 25, y: 10, weightT: 1, z: 3 },
];`);
window.drawPlanEditor();

// ── report issue line from result.heightOrder ───────────────────────────────
window.eval(`currentPolicyResult = {
  done: 2, total: 2, makespan: 60, completeRate: 100,
  heightOrderRadius: 10, heightOrder: { "L-high": ["L-low"] },
  events: [
    { craneId: "C1", liftId: "L-low",  start: 0,  finish: 30, liftStart: 5,  liftFinish: 30, duration: 25, travel: 1 },
    { craneId: "C1", liftId: "L-high", start: 30, finish: 60, liftStart: 35, liftFinish: 60, duration: 25, travel: 1 },
  ],
  layout: { cranes: [{ id: "C1" }] },
};`);
const report = window.buildPlanReport();
const orderIssue = report.issues.find((i) => i.text.includes("높이 순서 제약"));
assert.ok(orderIssue, "report lists the height-order issue");
assert.ok(orderIssue.text.includes("L-low→L-high"), `issue names the pair: ${orderIssue.text}`);
assert.ok(orderIssue.text.includes("반경 10m"), "issue shows the radius");

console.log("PLAN_HEIGHT_ORDER_UI_OK");
window.close();
process.exit(0);
