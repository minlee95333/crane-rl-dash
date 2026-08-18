// Verifies the 크레인 table added to the 배치 상세 편집 toggle, and that the
// 현재 배치로 학습 feature was removed from the AI 양중계획 생성 screen.
//
// Cranes previously had no tabular editor at all — they could only be dragged
// on the 2D canvas or typed into the raw layout textarea. They now get the same
// X/Y editing contract as lifts, sharing one toggle with them.
//
// It also pins the drag/type round trip: dragging must refresh the tables on
// mouseup, otherwise the coordinate inputs keep showing where the item used to
// be, which is far worse now that those cells are editable values rather than
// static text.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { JSDOM, VirtualConsole } from "jsdom";

const here = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.resolve(here, "..", "..", "web", "index.html");
const html = readFileSync(htmlPath, "utf-8");
const virtualConsole = new VirtualConsole();

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
    set: (t, k, v) => { t[k] = v; return true; },
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

const cranes = () => window.eval("planCranes.map(c => ({id:c.id, x:+c.x, y:+c.y, sx:c.setup_x, sy:c.setup_y}))");
const seed = () => window.eval(`
  planCranes = [
    { id: "C1", x: 15, y: 20, setup_x: 15, setup_y: 20 },
    { id: "C2", x: 75, y: 25 }
  ];
  planLifts = [{ id: "L1", x: 40, y: 40, weightT: 10 }];
  planRestrictedZones = [];
  _refreshPlanUI();
`);

seed();

// ── 현재 배치로 학습 is gone ────────────────────────────────────────────────
assert.ok(!html.includes("현재 배치로 학습"), "현재 배치로 학습 section survives");
assert.ok(!html.includes("trainFromCurrentLayout"), "trainFromCurrentLayout() survives");
assert.equal(document.getElementById("planTrainJitter"), null, "the jitter input should be removed");
assert.equal(typeof window.trainFromCurrentLayout, "undefined", "trainFromCurrentLayout should be undefined");
// Ordinary training must still be reachable.
assert.equal(typeof window.trainingPayload, "function", "trainingPayload() should survive");

// ── crane table shares the lift toggle ──────────────────────────────────────
const craneBody = document.getElementById("planCraneBody");
assert.ok(craneBody, "#planCraneBody missing");
const liftBody = document.getElementById("planLiftWeightBody");
assert.ok(liftBody, "#planLiftWeightBody missing");
assert.equal(
  craneBody.closest("details"), liftBody.closest("details"),
  "크레인 and 양중물 tables should share one toggle"
);

// ── one editable X/Y pair per crane, same control as lifts ──────────────────
const craneInputs = () => [...craneBody.querySelectorAll(".lift-xy-input")];
assert.equal(craneInputs().length, 4, "expected an X and a Y input for each of the 2 cranes");
for (const el of craneInputs()) {
  assert.equal(el.tagName, "INPUT");
  assert.equal(el.type, "number");
  assert.equal(el.readOnly, false, "crane coordinate inputs must be editable");
}
assert.equal(craneInputs()[0].value, "15.0");
assert.equal(craneInputs()[1].value, "20.0");

// ── typing writes through ───────────────────────────────────────────────────
window.updatePlanCranePosition(0, "x", "33.5", false);
assert.equal(cranes()[0].x, 33.5, "typed X did not reach planCranes");
window.updatePlanCranePosition(1, "y", "88", false);
assert.equal(cranes()[1].y, 88, "typed Y did not reach planCranes");
assert.equal(cranes()[0].y, 20, "editing one axis must not disturb the other");

// setup_x/setup_y are what the env actually reads; a typed move must not be
// silently reverted by a stale setup coordinate.
assert.equal(cranes()[0].sx, 33.5, "setup_x should follow a typed x");
window.updatePlanCranePosition(0, "y", "44", false);
assert.equal(cranes()[0].sy, 44, "setup_y should follow a typed y");
// A crane without setup_* must not gain them.
assert.equal(cranes()[1].sx, undefined, "setup_x should not be invented");

assert.ok(
  document.getElementById("planLayoutText").value.includes("crane,C1,33.50,44.00"),
  "layout text was not resynced after a typed crane coordinate"
);

// ── two-phase render contract, same as lifts ────────────────────────────────
const before = craneInputs();
window.updatePlanCranePosition(0, "x", "34", false);
assert.equal(craneInputs()[0], before[0], "oninput must not re-render the crane table");
window.updatePlanCranePosition(0, "x", "35", true);
assert.notEqual(craneInputs()[0], before[0], "onchange should re-render the crane table");
assert.equal(craneInputs()[0].value, "35.0");

// ── clamping and invalid input ──────────────────────────────────────────────
const siteW = window.eval("W"), siteH = window.eval("H");
window.updatePlanCranePosition(0, "x", String(siteW + 1000), true);
assert.equal(cranes()[0].x, siteW, "X beyond the site should clamp");
window.updatePlanCranePosition(0, "y", "-5", true);
assert.equal(cranes()[0].y, 0, "negative Y should clamp to 0");
window.updatePlanCranePosition(0, "x", "", false);
assert.equal(cranes()[0].x, siteW, "blank input must not move the crane");
window.updatePlanCranePosition(0, "x", "nope", false);
assert.equal(cranes()[0].x, siteW, "non-numeric input must not move the crane");
window.updatePlanCranePosition(99, "x", "1", false);
window.updatePlanCranePosition(0, "z", "1", false);
assert.equal(cranes().length, 2, "bad calls must not corrupt the layout");

// ── dragging still works and refreshes the tables ───────────────────────────
seed();
const hit = window.nearestPlanItem({ x: 15, y: 20 });
assert.equal(hit?.type, "crane", "canvas picking should still find the crane");
// The page's boot sequence doesn't run under jsdom, so install the real drag
// handlers explicitly — this exercises the shipped listener, not a stand-in.
window.installPlanCanvasHandlers();
assert.ok(document.getElementById("planCanvas")._installed, "drag handlers were not installed");
// Simulate what the drag handler does, then the mouseup commit.
window.eval(`
  planDrag = { type:'crane', item: planCranes[0], idx: 0 };
  planCranes[0].x = 61; planCranes[0].y = 62;
  planLifts[0].x = 71; planLifts[0].y = 72;
`);
window.dispatchEvent(new window.Event("mouseup"));
assert.equal(craneInputs()[0].value, "61.0", "drag did not refresh the crane X input");
assert.equal(craneInputs()[1].value, "62.0", "drag did not refresh the crane Y input");
// The same commit must refresh the lift table — its coordinate cells are
// editable inputs now, so stale values there are just as wrong.
const liftInputs = [...liftBody.querySelectorAll(".lift-xy-input")];
assert.equal(liftInputs[0].value, "71.0", "drag did not refresh the lift X input");
assert.equal(liftInputs[1].value, "72.0", "drag did not refresh the lift Y input");

window.close();
console.log("PLAN_CRANE_TABLE_OK");
