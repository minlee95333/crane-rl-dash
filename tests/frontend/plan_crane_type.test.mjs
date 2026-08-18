// Verifies the 100t crane-type UI on the AI 양중계획 탭: type selection when
// adding a crane, type round-trip through the layout text, the tonnage toggle,
// the crane_types payload (capacity curve + trainer-tab reward overrides), the
// per-lift second rated-radius judgement, and the fleet-aware over-rating flag.
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

// ── add a 100t crane via the type select ────────────────────────────────────
window.eval(`planCranes = []; planLifts = []; planRestrictedZones = [];`);
$("planCraneTypeSelect").value = "mobile_100t";
window.addPlanCrane();
$("planCraneTypeSelect").value = "";
window.addPlanCrane();
assert.equal(window.eval("planCranes[0].type"), "mobile_100t", "first crane typed 100t");
assert.equal(window.eval("planCranes[1].type"), undefined, "second crane untyped");

// ── layout text round-trip keeps the type ───────────────────────────────────
window.syncPlanText();
const text = $("planLayoutText").value;
assert.ok(/^crane,C1,\d+\.\d\d,\d+\.\d\d,mobile_100t$/m.test(text), `text carries type: ${text}`);
window.applyPlanText();
assert.equal(window.eval("planCranes[0].type"), "mobile_100t", "applyPlanText restores type");

// ── per-row tonnage toggle (crane table 톤급 button) ────────────────────────
window.togglePlanCraneType(1);
assert.equal(window.eval("planCranes[1].type"), "mobile_100t", "toggle sets 100t");
window.togglePlanCraneType(1);
assert.equal(window.eval("planCranes[1].type"), undefined, "toggle clears back to default");
window.refreshPlanCraneTable();
assert.ok(
  $("planCraneBody").innerHTML.includes("crane-type-toggle"),
  "crane table renders a per-row tonnage toggle"
);

// ── crane_types payload: curve always, trainer reward overrides merged ──────
window.eval(`_craneTypes = [{ id: "ct_1", name: "mobile_100t", isDefault: false,
  reward: { p_move: "-0.05" } }];`);
const ct = window._buildPlanCraneTypesPayload();
assert.ok(ct && ct.mobile_100t, "payload has the 100t type");
assert.equal(ct.mobile_100t.capacity_curve.length, 7, "representative 7-point curve attached");
assert.equal(ct.mobile_100t.reward.p_move, -0.05, "trainer-tab reward override merged");

// Per-type operation times / radius from the trainer card flow into the plan
// payload so each crane schedules with its own setup/teardown/hoist/radius.
window.eval(`_craneTypes = [{ id: "ct_1", name: "mobile_100t", isDefault: false,
  reward: {}, setupTime: "20", teardownTime: "8", fixedDuration: "40", craneRadius: "30" }];`);
const ctTimes = window._buildPlanCraneTypesPayload();
assert.equal(ctTimes.mobile_100t.setup_time, 20, "per-type setup_time forwarded to plan");
assert.equal(ctTimes.mobile_100t.teardown_time, 8, "per-type teardown_time forwarded to plan");
assert.equal(ctTimes.mobile_100t.fixed_duration, 40, "per-type fixed_duration forwarded to plan");
assert.equal(ctTimes.mobile_100t.crane_radius, 30, "per-type crane_radius forwarded to plan");
window.eval(`_craneTypes = [{ id: "ct_1", name: "mobile_100t", isDefault: false,
  reward: { p_move: "-0.05" } }];`);
const payload = window._planPayloadFor("nearest");
assert.ok(payload.crane_types && payload.crane_types.mobile_100t, "plan payload carries crane_types");

// ── trainer-card custom types are usable in the plan tab ────────────────────
window.eval(`_craneTypes = [{ id: "ct_c", name: "tower_120t", isDefault: false, active: false,
  reward: { p_move: "-0.08" }, setupTime: "30",
  capacityCurve: [ { radius: "4", capacityT: "120" }, { radius: "25", capacityT: "20" } ] }];`);
const reg = window.planTypeRegistry();
assert.ok(reg.tower_120t, "custom card registered for planning");
assert.equal(reg.tower_120t.capacity_curve.length, 2, "card curve carried into the registry");
window.refreshPlanCraneTypeSelect();
assert.ok([...$("planCraneTypeSelect").options].some(o => o.value === "tower_120t"),
  "add-crane select lists the custom type");
window.eval(`planCranes = [{ id: "C1", x: 10, y: 10 }];`);
window.togglePlanCraneType(0); // 기본 → mobile_100t
window.togglePlanCraneType(0); // → tower_120t
assert.equal(window.eval("planCranes[0].type"), "tower_120t", "row toggle cycles through custom types");
const ctCustom = window._buildPlanCraneTypesPayload();
assert.equal(ctCustom.tower_120t.capacity_curve.length, 2, "custom curve sent to the plan API");
assert.equal(ctCustom.tower_120t.reward.p_move, -0.08, "custom reward sent despite 보관 존 (inactive) card");
assert.equal(ctCustom.tower_120t.setup_time, 30, "custom per-type setup_time sent");
window.togglePlanCraneType(0); // → back to 기본
assert.equal(window.eval("planCranes[0].type"), undefined, "cycle returns to default");
window.eval(`_craneTypes = [{ id: "ct_1", name: "mobile_100t", isDefault: false,
  reward: { p_move: "-0.05" } }];`);

// ── model crane_types readout + hidden K/max in the 모델 학습 조건 panel ─────
assert.equal($("planCandidateK").closest("label").style.display, "none", "Candidate K hidden from readout");
assert.equal($("planMaxSteps").closest("label").style.display, "none", "Max steps hidden from readout");
window.renderPlanModelCraneTypes({ crane_types: { mobile_100t: {
  reward: {}, count: 1, count_max: 3, crane_radius: 30,
  capacity_curve: [ { radius: 3, capacityT: 100 }, { radius: 30, capacityT: 12 } ] } } });
const ctBox = $("planModelCraneTypes");
assert.equal(ctBox.style.display, "block", "readout shown when model has crane_types");
assert.ok(ctBox.textContent.includes("mobile_100t"), "type name listed");
assert.ok(ctBox.textContent.includes("1~3대"), "randomized count range shown");
assert.ok(ctBox.textContent.includes("30m"), "per-type radius shown");
assert.ok(ctBox.textContent.includes("50t 계수 상속"), "empty reward marked as inherited");
window.renderPlanModelCraneTypes(null);
assert.equal(ctBox.style.display, "none", "readout hidden without a model");

// No typed crane → no crane_types key.
window.eval(`planCranes = [{ id: "C1", x: 10, y: 10 }];`);
assert.equal(window._buildPlanCraneTypesPayload(), null, "untyped fleet sends no crane_types");

// ── per-lift table judgement + fleet-aware over-rating ──────────────────────
// Base curve caps at 40t; the 45t lift is over-rated for default cranes but
// liftable by the 100t class (100t curve rates 50t at 10m).
window.eval(`_modelCache = [{ path: "m/base.pt", meta: { crane_capacity_curve: [
  { radius: 3, capacityT: 40 }, { radius: 18, capacityT: 10 } ] } }];`);
$("planModelPath").innerHTML = '<option value="m/base.pt"></option>';
$("planModelPath").value = "m/base.pt";
window.eval(`planCranes = [
  { id: "C1", x: 10, y: 10 },
  { id: "C2", x: 90, y: 10, type: "mobile_100t" },
];
planLifts = [{ id: "L-heavy", x: 50, y: 10, weightT: 45, z: 0 }];`);
window.refreshPlanLiftWeightTable();
const row = $("planLiftWeightBody").innerHTML;
assert.ok(row.includes("정격 초과"), "base-curve judgement shows 정격 초과 for 45t");
assert.ok(row.includes("100t: R ≤"), `100t judgement appended: ${row}`);
window.drawPlanEditor(); // dual circles + caption must not throw

// 100t comparison stays visible even with no 100t crane in the fleet.
window.eval(`planCranes = [{ id: "C1", x: 10, y: 10 }];`);
window.refreshPlanLiftWeightTable();
assert.ok(
  $("planLiftWeightBody").innerHTML.includes("100t:"),
  "100t judgement listed for comparison without a 100t crane"
);
window.drawPlanEditor(); // always-on 100t circles must not throw

// ── weight cap raised to 100t with the 100t class ───────────────────────────
assert.equal(window.clampLiftWeight(80), 80, "80t survives the clamp");
assert.equal(window.clampLiftWeight(150), 100, "cap is now 100t");
window.eval(`planLifts = [{ id: "L1", x: 50, y: 10, weightT: 10 }];`);
window.updatePlanLiftWeight(0, "80", false);
assert.equal(window.eval("planLifts[0].weightT"), 80, "table input accepts 80t");

console.log("PLAN_CRANE_TYPE_OK");
window.close();
process.exit(0);
