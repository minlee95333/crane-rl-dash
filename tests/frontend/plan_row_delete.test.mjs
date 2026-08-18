// Verifies per-row delete buttons replaced the separate 삭제할 항목 dropdown.
//
// Deleting used to mean: find the item in a flat <select> mixing cranes, lifts
// and zones, then press 선택 삭제. The row you are editing now carries its own
// delete button.
//
// The dropdown was the only table-side way to remove a 제한구역 (they have no
// weight/coordinate row of their own), so dropping it without giving zones a
// table would have left right-click-on-canvas as the sole path. A 제한구역
// table is therefore part of this change.
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

// Spread into a Node-realm array: arrays built inside the jsdom realm have a
// different Array.prototype, which assert.deepEqual (strict) rejects even when
// the contents match.
const ids = (name) => [...window.eval(`${name}.map(o => o.id)`)];
const seed = () => window.eval(`
  planCranes = [{ id: "C1", x: 10, y: 10 }, { id: "C2", x: 20, y: 20 }];
  planLifts = [
    { id: "L1", x: 30, y: 30, weightT: 5 },
    { id: "L2", x: 40, y: 40, weightT: 6 },
    { id: "L3", x: 50, y: 50, weightT: 7 }
  ];
  planRestrictedZones = [
    { id: "RZ1", type: "rect", x1: 60, y1: 60, x2: 70, y2: 70 },
    { id: "RZ2", type: "rect", x1: 80, y1: 80, x2: 90, y2: 90 }
  ];
  _refreshPlanUI();
`);

seed();

// ── the dropdown pair is gone ───────────────────────────────────────────────
assert.equal(document.getElementById("planDeleteSelect"), null, "삭제할 항목 select should be removed");
assert.ok(!html.includes("planDeleteSelect"), "a planDeleteSelect reference survives");
assert.ok(!html.includes("deletePlanSelection"), "deletePlanSelection() survives");
assert.ok(!html.includes("refreshPlanDeleteSelect"), "refreshPlanDeleteSelect() survives");
assert.equal(typeof window.deletePlanSelection, "undefined");
// 전체 비우기 was not part of this change and must stay.
assert.equal(typeof window.clearAllPlanItems, "function", "전체 비우기 should survive");

// ── every row of every table carries a delete button ────────────────────────
const rowsOf = (bodyId) => [...document.querySelectorAll(`#${bodyId} tr`)];
const delBtns = (bodyId) => [...document.querySelectorAll(`#${bodyId} .row-delete`)];
for (const [bodyId, count] of [["planCraneBody", 2], ["planLiftWeightBody", 3], ["planZoneBody", 2]]) {
  assert.equal(rowsOf(bodyId).length, count, `${bodyId} should have ${count} rows`);
  assert.equal(delBtns(bodyId).length, count, `${bodyId} should have one delete button per row`);
  for (const b of delBtns(bodyId)) {
    assert.equal(b.tagName, "BUTTON");
    assert.ok(b.getAttribute("aria-label"), "delete button needs an accessible label");
  }
}
// The button belongs in the last cell of its row.
const firstCraneRow = rowsOf("planCraneBody")[0];
assert.ok(
  firstCraneRow.lastElementChild.contains(delBtns("planCraneBody")[0]),
  "delete button should sit in the rightmost column"
);

// ── clicking removes exactly that item ──────────────────────────────────────
delBtns("planLiftWeightBody")[1].click();
assert.deepEqual(ids("planLifts"), ["L1", "L3"], "clicking a lift's delete removed the wrong row");
assert.deepEqual(ids("planCranes"), ["C1", "C2"], "deleting a lift disturbed the cranes");
assert.equal(delBtns("planLiftWeightBody").length, 2, "table did not re-render after delete");

delBtns("planCraneBody")[0].click();
assert.deepEqual(ids("planCranes"), ["C2"], "clicking a crane's delete removed the wrong row");

// Zones were the reason the dropdown could not simply be dropped.
delBtns("planZoneBody")[0].click();
assert.deepEqual(ids("planRestrictedZones"), ["RZ2"], "zone delete removed the wrong row");

// Indices are rebuilt after each delete, so the remaining button still targets
// the right item rather than a stale position.
delBtns("planZoneBody")[0].click();
assert.deepEqual(ids("planRestrictedZones"), [], "second zone delete used a stale index");

// ── empty states ────────────────────────────────────────────────────────────
assert.ok(
  document.querySelector("#planZoneBody .note"),
  "an emptied table should show its placeholder row"
);
assert.equal(delBtns("planZoneBody").length, 0, "empty table must not render delete buttons");

// ── the layout text mirror keeps up ─────────────────────────────────────────
const text = document.getElementById("planLayoutText").value;
assert.ok(!text.includes("L2"), "deleted lift still present in the layout text");
assert.ok(!text.includes("restricted,"), "deleted zones still present in the layout text");
assert.ok(text.includes("crane,C2"), "surviving crane missing from the layout text");

// ── right-click delete on the canvas still works ────────────────────────────
seed();
window.installPlanCanvasHandlers();
assert.equal(typeof window._deletePlanItem, "function", "_deletePlanItem should remain the shared entry point");
window._deletePlanItem("zone", 0);
assert.deepEqual(ids("planRestrictedZones"), ["RZ2"], "programmatic delete path broke");

window.close();
console.log("PLAN_ROW_DELETE_OK");
