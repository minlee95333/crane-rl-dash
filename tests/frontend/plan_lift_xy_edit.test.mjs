// Verifies typed X/Y editing for lifts in the 양중물 무게 설정 table.
//
// The coordinate column used to be a static "(x, y)" label — the only way to
// move a lift was dragging it on the 2D canvas, which cannot hit an exact
// value. It is now two number inputs writing the same planLifts entry, so both
// gestures stay valid.
//
// The two-phase contract matters: `oninput` updates the model and repaints the
// canvas but must NOT re-render the table (rebuilding the <input> mid-keystroke
// drops focus), while `onchange` commits and re-renders so the 정격 허용반경
// column catches up.
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

const lifts = () => window.eval("planLifts.map(l => ({id:l.id, x:+l.x, y:+l.y}))");
const seed = () => window.eval(`
  planCranes = [{ id: "C1", x: 10, y: 10 }];
  planLifts = [
    { id: "L1", x: 20, y: 30, weightT: 10 },
    { id: "L2", x: 60, y: 70, weightT: 20 }
  ];
  planRestrictedZones = [];
  refreshPlanLiftWeightTable();
`);

seed();

// ── the column renders editable inputs, one pair per lift ───────────────────
const xyInputs = () => [...document.querySelectorAll("#planLiftWeightBody .lift-xy-input")];
assert.equal(xyInputs().length, 4, "expected an X and a Y input for each of the 2 lifts");
for (const el of xyInputs()) {
  assert.equal(el.tagName, "INPUT", "coordinate cell should hold real inputs");
  assert.equal(el.readOnly, false, "coordinate inputs must be editable");
  assert.equal(el.type, "number");
}
const [x0, y0] = xyInputs();
assert.equal(x0.value, "20.0", "X input should show the current coordinate");
assert.equal(y0.value, "30.0", "Y input should show the current coordinate");

// ── typing writes through to the layout ─────────────────────────────────────
window.updatePlanLiftPosition(0, "x", "44.5", false);
assert.equal(lifts()[0].x, 44.5, "typed X did not reach planLifts");
window.updatePlanLiftPosition(0, "y", "12.25", false);
assert.equal(lifts()[0].y, 12.25, "typed Y did not reach planLifts");
assert.equal(lifts()[1].x, 60, "editing one lift must not disturb another");

// The layout text mirror is what 계획 생성 ultimately serializes.
assert.ok(
  document.getElementById("planLayoutText").value.includes("lift,L1,44.50,12.25"),
  "the layout text was not resynced after a typed coordinate"
);

// ── live typing must not rebuild the table (focus would be lost) ────────────
const beforeNodes = xyInputs();
window.updatePlanLiftPosition(0, "x", "50", false);
assert.equal(xyInputs()[0], beforeNodes[0], "oninput must not re-render the table mid-keystroke");
// Committing re-renders so derived columns refresh.
window.updatePlanLiftPosition(0, "x", "51", true);
assert.notEqual(xyInputs()[0], beforeNodes[0], "onchange should re-render the table");
assert.equal(xyInputs()[0].value, "51.0", "committed value should be reflected back");

// ── out-of-site values are clamped to the site bounds ──────────────────────
const siteW = window.eval("W"), siteH = window.eval("H");
window.updatePlanLiftPosition(0, "x", String(siteW + 500), true);
assert.equal(lifts()[0].x, siteW, "X beyond the site should clamp to its width");
window.updatePlanLiftPosition(0, "y", "-40", true);
assert.equal(lifts()[0].y, 0, "negative Y should clamp to 0");

// ── partial / invalid input is left alone rather than rewritten ─────────────
window.updatePlanLiftPosition(0, "x", "", false);
assert.equal(lifts()[0].x, siteW, "blank input must not move the lift");
window.updatePlanLiftPosition(0, "x", "abc", false);
assert.equal(lifts()[0].x, siteW, "non-numeric input must not move the lift");
window.updatePlanLiftPosition(99, "x", "10", false);   // out-of-range index
window.updatePlanLiftPosition(0, "z", "10", false);    // bogus axis
assert.equal(lifts().length, 2, "bad calls must not corrupt the layout");

// ── canvas dragging still works ─────────────────────────────────────────────
// nearestPlanItem is what the drag handler uses to grab an item; typed editing
// must not have replaced that path.
seed();
const hit = window.nearestPlanItem({ x: 20, y: 30 });
assert.equal(hit?.type, "lift", "canvas picking should still find the lift");
assert.equal(hit?.idx, 0);
assert.equal(typeof window.drawPlanEditor, "function", "canvas editor should still exist");

window.close();
console.log("PLAN_LIFT_XY_EDIT_OK");
