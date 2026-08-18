// Verifies typed corner editing for 제한구역, and the button-row change that
// swapped 텍스트 배치 적용 for 전체 삭제.
//
// Zones were the last layout item with no typed editor — their table showed the
// extent as static text and the only way to resize one was dragging a corner
// handle on the canvas. They now get four inputs (X1,Y1 - X2,Y2) on the same
// two-phase contract as cranes and lifts.
//
// The 텍스트 배치 적용 button moved into the 현장 배치 텍스트 toggle rather
// than being deleted: 전체 삭제 took its slot in the main row, but applying a
// hand-edited CSV layout to the canvas is still a real capability.
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

const zone = (i = 0) => window.eval(
  `(z => ({id:z.id, x1:+z.x1, y1:+z.y1, x2:+z.x2, y2:+z.y2}))(planRestrictedZones[${i}])`
);
const seed = () => window.eval(`
  planCranes = [{ id: "C1", x: 10, y: 10 }];
  planLifts = [{ id: "L1", x: 20, y: 20, weightT: 5 }];
  planRestrictedZones = [
    { id: "RZ1", type: "rect", x1: 40, y1: 41, x2: 60, y2: 61 },
    { id: "RZ2", type: "rect", x1: 10, y1: 11, x2: 20, y2: 21 }
  ];
  _refreshPlanUI();
`);

seed();

// ── four editable corner inputs per zone ────────────────────────────────────
const zoneInputs = () => [...document.querySelectorAll("#planZoneBody .lift-xy-input")];
assert.equal(zoneInputs().length, 8, "expected 4 corner inputs for each of the 2 zones");
for (const el of zoneInputs()) {
  assert.equal(el.tagName, "INPUT");
  assert.equal(el.type, "number");
  assert.equal(el.readOnly, false, "zone corner inputs must be editable");
  assert.ok(el.getAttribute("aria-label"), "corner input needs an accessible label");
}
const [x1, y1, x2, y2] = zoneInputs();
assert.equal(x1.value, "40.0");
assert.equal(y1.value, "41.0");
assert.equal(x2.value, "60.0");
assert.equal(y2.value, "61.0");

// ── typing writes through to the right corner ───────────────────────────────
window.updatePlanZoneCorner(0, "x1", "33.5", false);
assert.equal(zone().x1, 33.5, "typed X1 did not reach the zone");
assert.equal(zone().x2, 60, "editing X1 must not disturb X2");
window.updatePlanZoneCorner(0, "y2", "77.25", false);
assert.equal(zone().y2, 77.25, "typed Y2 did not reach the zone");
assert.equal(zone(1).x1, 10, "editing one zone must not disturb another");

assert.ok(
  document.getElementById("planLayoutText").value.includes("restricted,RZ1,33.50,41.00,60.00,77.25"),
  "layout text was not resynced after a typed zone corner"
);

// ── two-phase render contract ───────────────────────────────────────────────
const before = zoneInputs();
window.updatePlanZoneCorner(0, "x1", "34", false);
assert.equal(zoneInputs()[0], before[0], "oninput must not re-render the zone table");
window.updatePlanZoneCorner(0, "x1", "35", true);
assert.notEqual(zoneInputs()[0], before[0], "onchange should re-render the zone table");
assert.equal(zoneInputs()[0].value, "35.0");

// ── clamping and invalid input ──────────────────────────────────────────────
const siteW = window.eval("W"), siteH = window.eval("H");
window.updatePlanZoneCorner(0, "x2", String(siteW + 400), true);
assert.equal(zone().x2, siteW, "X beyond the site should clamp to its width");
window.updatePlanZoneCorner(0, "y1", "-9", true);
assert.equal(zone().y1, 0, "negative Y should clamp to 0");
window.updatePlanZoneCorner(0, "x1", "", false);
assert.equal(zone().x1, 35, "blank input must not move the corner");
window.updatePlanZoneCorner(0, "x1", "??", false);
assert.equal(zone().x1, 35, "non-numeric input must not move the corner");
window.updatePlanZoneCorner(9, "x1", "1", false);
window.updatePlanZoneCorner(0, "nope", "1", false);
assert.equal(window.eval("planRestrictedZones.length"), 2, "bad calls must not corrupt the layout");

// Corners are stored as typed — an inverted rectangle is allowed, matching what
// dragging a handle past the opposite edge already produces.
window.updatePlanZoneCorner(0, "x1", "90", true);
window.updatePlanZoneCorner(0, "x2", "10", true);
assert.equal(zone().x1, 90, "x1 must not be reordered behind the user's back");
assert.equal(zone().x2, 10, "x2 must not be reordered behind the user's back");

// ── delete still works alongside the new inputs ─────────────────────────────
seed();
document.querySelectorAll("#planZoneBody .row-delete")[0].click();
assert.equal(window.eval("planRestrictedZones.map(z=>z.id).join(',')"), "RZ2", "zone delete broke");
assert.equal(zoneInputs().length, 4, "zone table did not re-render after delete");

// ── button row: 전체 삭제 replaced 텍스트 배치 적용 ─────────────────────────
const mainRowButtons = [...document.querySelectorAll("section[data-tab='plan'] .row button")]
  .map((b) => b.textContent.trim());
assert.ok(mainRowButtons.includes("전체 삭제"), "전체 삭제 button missing from the main row");
assert.ok(!mainRowButtons.includes("텍스트 배치 적용"), "텍스트 배치 적용 still in the main row");
// The old standalone 전체 비우기 row would now be a duplicate.
assert.ok(!html.includes("전체 비우기"), "전체 비우기 button should have been consolidated away");
assert.equal(typeof window.clearAllPlanItems, "function", "전체 삭제 must still be wired to clearAllPlanItems");

// Applying a hand-edited CSV layout is preserved, inside the 현장 배치 텍스트 toggle.
const applyBtn = [...document.querySelectorAll("button")]
  .find((b) => b.textContent.trim() === "텍스트 배치 적용");
assert.ok(applyBtn, "텍스트 배치 적용 should still exist somewhere");
assert.ok(
  applyBtn.closest("details")?.querySelector("#planLayoutText"),
  "텍스트 배치 적용 should sit in the 현장 배치 텍스트 toggle next to its textarea"
);
// Generating a plan re-applies the textarea regardless, so text edits are never
// silently dropped.
assert.ok(
  String(window.runPlanningAgent).includes("applyPlanText"),
  "runPlanningAgent must keep applying the layout text"
);

window.close();
console.log("PLAN_ZONE_EDIT_OK");
