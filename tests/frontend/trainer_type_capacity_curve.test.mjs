// Verifies the per-type rated-load curve editor on the RL Trainer tab:
// each crane type card renders its own 정격하중 곡선 editor, curve rows
// round-trip into the train-start crane_types payload as capacity_curve,
// an empty curve omits the key (type falls back to the global 50t curve),
// and the plan payload prefers the trainer-defined curve over the
// hardcoded CRANE_TYPE_SPECS one.
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

// ── first visit seeds a mobile_100t type: 50t rewards inherited, 100t curve ──
window.eval(`localStorage.removeItem('craneTypesV1'); _loadCraneTypes();`);
assert.equal(window.eval("_craneTypes.length"), 1, "fresh load seeds one type");
assert.equal(window.eval("_craneTypes[0].name"), "mobile_100t", "seeded type is mobile_100t");
assert.equal(window.eval("_craneTypes[0].isDefault"), false, "fleet default stays the 50t class");
assert.equal(window.eval("Object.keys(_craneTypes[0].reward).length"), 0, "rewards empty → inherit all 50t coefficients");
assert.equal(window.eval("_craneTypes[0].capacityCurve.length"), 7, "seeded with the 7-point 100t curve");

// ── active-zone gate: 보관 존 카드는 값이 있어도 payload에서 제외 ────────────
assert.equal(window.eval("_craneTypes[0].active"), false, "seed starts in the 보관 존 (inactive)");
let seeded = window._buildCraneTypesPayload();
assert.equal(seeded.crane_types, null, "inactive card sends no crane_types despite full curve");
window.ctSetActive(window.eval("_craneTypes[0].id"), true);
seeded = window._buildCraneTypesPayload();
assert.equal(seeded.crane_types.mobile_100t.capacity_curve[0].capacityT, 100, "activated card rates 100t at closest radius");
assert.equal(seeded.crane_types.mobile_100t.count, 1, "activation auto-sets count to 1");
assert.equal(seeded.crane_types.mobile_100t.count_max, 3, "activation defaults to a 1~Crane수 random range");
assert.equal(seeded.default_crane_type, null, "no default_crane_type sent");
window.ctSetActive(window.eval("_craneTypes[0].id"), false);
assert.equal(window._buildCraneTypesPayload().crane_types, null, "drag back below the divider excludes it again");
assert.ok(window.document.getElementById("ctActiveZone") && window.document.getElementById("ctInactiveZone"),
  "both drop zones render");
// Active zone renders above the 보관함 divider (inside its own host).
assert.ok($("ctActiveZoneHost").innerHTML.includes("ctActiveZone"), "active zone lives in the pre-divider host");
assert.ok($("craneTypesContainer").innerHTML.includes("ctInactiveZone"), "storage zone lives below the divider");
// Drop-highlight helper toggles background/border and restores the base color.
const az = window.document.getElementById("ctActiveZone");
window.ctZoneHover(az, true);
assert.ok(az.style.background.length > 0, "dragover highlights the zone");
window.ctZoneHover(az, false, "#f59e0b66");
assert.equal(az.style.background, "", "dragleave clears the highlight");
// A user who deletes every type persists '[]' and is NOT re-seeded.
window.eval(`localStorage.setItem('craneTypesV1','[]'); _craneTypes=['sentinel']; _loadCraneTypes();`);
assert.equal(window.eval("_craneTypes.length"), 0, "stored empty list is respected, no re-seed");

// ── a new type renders its own curve editor ─────────────────────────────────
window.eval(`_craneTypes = [];`);
window.addCraneType();
window.eval(`_craneTypes[0].name = "mobile_100t";`);
window.renderCraneTypes();
const typeId = window.eval("_craneTypes[0].id");
window.ctSetActive(typeId, true); // move into the 학습 반영 존 for the payload checks below
window.updateCraneTypeField(typeId, "count", "");    // clear the auto range; count tests set it explicitly
window.updateCraneTypeField(typeId, "countMax", "");
const container = $("ctActiveZoneHost").innerHTML + $("craneTypesContainer").innerHTML;
assert.ok(container.includes("정격하중 곡선"), "type card renders a curve editor");
assert.ok(container.includes(`ctCurvePreview_${typeId}`), "type card has its own preview canvas");
assert.ok(container.includes("곡선 없음"), "empty curve shows the 50t-fallback placeholder");

// ── 기본값 채우기 seeds the matching CRANE_TYPE_SPECS curve ─────────────────
window.resetCraneTypeCurveRows(typeId);
assert.equal(window.eval("_craneTypes[0].capacityCurve.length"), 7, "mobile_100t seeds the 7-point 100t curve");
assert.equal(window.eval("_craneTypes[0].capacityCurve[0].capacityT"), "100", "first point rates 100t");

// ── row edit + add/remove ───────────────────────────────────────────────────
window.updateCraneTypeCurveCell(typeId, 0, "capacityT", "95");
assert.equal(window.eval("_craneTypes[0].capacityCurve[0].capacityT"), "95", "cell edit updates the model");
window.addCraneTypeCurveRow(typeId);
assert.equal(window.eval("_craneTypes[0].capacityCurve.length"), 8, "행 추가 appends a row");
window.removeCraneTypeCurveRow(typeId, 7);
assert.equal(window.eval("_craneTypes[0].capacityCurve.length"), 7, "삭제 removes the row");

// ── train-start payload carries capacity_curve, sorted numeric points ───────
let payload = window._buildCraneTypesPayload();
assert.ok(payload.crane_types.mobile_100t.capacity_curve, "payload has capacity_curve");
assert.equal(payload.crane_types.mobile_100t.capacity_curve.length, 7, "all 7 points sent");
assert.equal(payload.crane_types.mobile_100t.capacity_curve[0].capacityT, 95, "edited point sent as number");

// ── 학습 투입 대수 round-trips as count; 0/blank omits it ───────────────────
assert.ok(container.includes("학습 투입 대수"), "type card renders a count input");
window.updateCraneTypeField(typeId, "count", "2");
payload = window._buildCraneTypesPayload();
assert.equal(payload.crane_types.mobile_100t.count, 2, "count sent as integer");

// ── count_max (플릿 랜덤화) round-trips; only when above count ──────────────
window.updateCraneTypeField(typeId, "countMax", "3");
payload = window._buildCraneTypesPayload();
assert.equal(payload.crane_types.mobile_100t.count_max, 3, "count_max sent when > count");
window.updateCraneTypeField(typeId, "countMax", "2");
payload = window._buildCraneTypesPayload();
assert.equal(payload.crane_types.mobile_100t.count_max, undefined, "count_max ≤ count omitted");
window.updateCraneTypeField(typeId, "countMax", "3");
window.updateTrainSummary();
assert.ok($("sumFleet").textContent.includes("mobile_100t×2~3"), `fleet chip shows the range: ${$("sumFleet").textContent}`);
window.updateCraneTypeField(typeId, "countMax", "");

// ── summary chips reflect fleet composition and scenario/train values ───────
window.updateTrainSummary();
assert.equal($("sumFleet").textContent, "3C = 50t×1 + mobile_100t×2", "fleet chip shows mixed composition");
assert.ok($("sumScenario").textContent.includes("100m"), "scenario chip shows site size");
assert.ok($("sumScenario").textContent.includes("제한구역 OFF"), "scenario chip shows restricted state");
assert.ok($("sumTrain").textContent.includes("150ep"), "train chip shows episodes");
assert.ok($("sumTrain").textContent.includes("새 모델"), "train chip shows init mode");
window.updateCraneTypeField(typeId, "count", "");
payload = window._buildCraneTypesPayload();
assert.equal(payload.crane_types.mobile_100t.count, undefined, "blank count omitted");

// ── per-type setup/teardown times round-trip; blank omits ───────────────────
assert.ok(container.includes("setup_time") && container.includes("teardown_time"),
  "type card renders setup/teardown override inputs");
window.updateCraneTypeField(typeId, "setupTime", "20");
window.updateCraneTypeField(typeId, "teardownTime", "8.5");
window.updateCraneTypeField(typeId, "fixedDuration", "40");
window.updateCraneTypeField(typeId, "craneRadius", "30");
payload = window._buildCraneTypesPayload();
assert.equal(payload.crane_types.mobile_100t.crane_radius, 30, "crane_radius sent");
window.updateCraneTypeField(typeId, "craneRadius", "");
payload = window._buildCraneTypesPayload();
assert.equal(payload.crane_types.mobile_100t.crane_radius, undefined, "blank crane_radius omitted");
payload = window._buildCraneTypesPayload();
assert.equal(payload.crane_types.mobile_100t.setup_time, 20, "setup_time sent");
assert.equal(payload.crane_types.mobile_100t.teardown_time, 8.5, "teardown_time sent");
assert.equal(payload.crane_types.mobile_100t.fixed_duration, 40, "fixed_duration sent");
window.updateCraneTypeField(typeId, "setupTime", "");
window.updateCraneTypeField(typeId, "teardownTime", "");
window.updateCraneTypeField(typeId, "fixedDuration", "");
payload = window._buildCraneTypesPayload();
assert.equal(payload.crane_types.mobile_100t.setup_time, undefined, "blank setup omitted");
assert.equal(payload.crane_types.mobile_100t.teardown_time, undefined, "blank teardown omitted");
assert.equal(payload.crane_types.mobile_100t.fixed_duration, undefined, "blank duration omitted");

// ── empty curve omits the key (fallback to global 50t curve) ────────────────
window.eval(`_craneTypes[0].capacityCurve = [];`);
payload = window._buildCraneTypesPayload();
assert.equal(payload.crane_types.mobile_100t.capacity_curve, undefined, "empty curve omits capacity_curve");

// ── plan payload prefers the trainer-defined curve over CRANE_TYPE_SPECS ────
window.eval(`_craneTypes[0].capacityCurve = [
  { radius: "5", capacityT: "90" }, { radius: "20", capacityT: "30" } ];
planCranes = [{ id: "C1", x: 10, y: 10, type: "mobile_100t" }];`);
const planCt = window._buildPlanCraneTypesPayload();
assert.equal(planCt.mobile_100t.capacity_curve.length, 2, "plan payload uses the trainer curve");
assert.equal(planCt.mobile_100t.capacity_curve[0].capacityT, 90, "trainer curve point wins over spec");
window.eval(`_craneTypes[0].capacityCurve = [];`);
const planCtFallback = window._buildPlanCraneTypesPayload();
assert.equal(planCtFallback.mobile_100t.capacity_curve.length, 7, "no trainer curve → CRANE_TYPE_SPECS fallback");

console.log("TRAINER_TYPE_CAPACITY_CURVE_OK");
window.close();
process.exit(0);
