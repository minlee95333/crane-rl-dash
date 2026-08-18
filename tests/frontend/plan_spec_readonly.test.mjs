// Verifies the 계획 설정 environment fields are presented as a read-only spec of
// the selected model rather than as editable inputs.
//
// runPlanningAgent() calls applySelectedModelPlanConfig() before building the
// payload, so any value typed into Candidate K / max_steps / 시간 / 반경 / 현장
// 크기 was overwritten by the model's training config and silently discarded.
// The fields now render as a locked readout with a per-field provenance chip
// (모델 vs 기본값), plus an opt-in "직접 편집" unlock so the capability is not
// removed outright.
//
// The inputs are intentionally kept in the DOM (readonly) instead of being
// replaced by plain text: the canvas renderer, the payload builder and the
// trainer-tab teardown sync all read them by id.
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

const SPEC_IDS = [
  "planCandidateK", "planMaxSteps", "planFixedDuration",
  "planSetupTime", "planTeardownTime", "planCraneRadius", "planSiteSize",
];
// The only genuine user choice left on this screen.
const CONTROL_IDS = ["planModelPath"];

// ── the environment fields ship locked ──────────────────────────────────────
for (const id of SPEC_IDS) {
  const el = document.getElementById(id);
  assert.ok(el, `#${id} should still exist (read by canvas/payload/sync code)`);
  assert.equal(el.readOnly, true, `#${id} should be readonly by default`);
}

// ── the real controls are untouched ─────────────────────────────────────────
for (const id of CONTROL_IDS) {
  const el = document.getElementById(id);
  assert.ok(el, `#${id} missing`);
  assert.notEqual(el.disabled, true, `#${id} must stay usable`);
}

// ── they live in the spec group, not the control grid ───────────────────────
const panel = document.getElementById("planSpec");
assert.ok(panel, "#planSpec group missing");

// It must sit inside the 계획 설정 <details>, as a subgroup rather than its own
// card — boxing it made it outshout 사용 모델 and violated the project's
// no-card-inside-a-card rule.
const details = panel.closest("details");
assert.ok(details, "#planSpec must live inside the 계획 설정 toggle");
assert.ok(
  details.querySelector("summary")?.textContent.includes("계획 설정"),
  "#planSpec is inside the wrong <details>"
);
assert.ok(details.contains(document.getElementById("planModelPath")),
  "사용 모델 and the spec group should share one toggle");
const specCss = (html.match(/\.plan-spec\{[^}]*\}/) || [""])[0];
for (const chrome of ["border:", "background:", "box-shadow:"]) {
  assert.ok(!specCss.includes(chrome),
    `.plan-spec should carry no card chrome, found ${chrome} in: ${specCss}`);
}
for (const id of SPEC_IDS) {
  assert.ok(panel.contains(document.getElementById(id)), `#${id} should sit inside #planSpec`);
}
for (const id of CONTROL_IDS) {
  assert.ok(!panel.contains(document.getElementById(id)), `#${id} must NOT be inside #planSpec`);
}

// ── no per-field provenance chips, no unlock affordance ─────────────────────
// The panel is a pure readout now: the 모델/기본값 chips and the 직접 편집
// checkbox were removed, so nothing may reintroduce an editable affordance.
for (const id of SPEC_IDS) {
  assert.equal(document.getElementById("src-" + id), null,
    `provenance chip for #${id} should be removed`);
}
assert.equal(document.getElementById("planSpecUnlock"), null, "직접 편집 checkbox should be removed");
assert.equal(typeof window.setPlanSpecUnlocked, "undefined", "setPlanSpecUnlocked() should be gone");
for (const dead of ["planSpecUnlock", "setPlanSpecUnlocked", "_markPlanSpecSource", "plan-spec-src"]) {
  assert.ok(!html.includes(dead), `dead reference survives in the page source: ${dead}`);
}

// ── model selection drives the readout and the chips ────────────────────────
// `_modelCache` is a top-level `let` in the page script — a lexical binding,
// not a window property — so it has to be assigned inside the page realm.
// teardown_time is deliberately absent: that field must report 기본값, not 모델.
const MODEL_PATH = "rl_trainer/dashboard_runs/run_20260720_090000/pytorch_mappo_model.pt";
window.eval(`_modelCache = [{
  path: ${JSON.stringify(MODEL_PATH)},
  name: "pytorch_mappo_model.pt",
  mtime: 1780000000,
  file_present: true,
  meta: {
    kind: "single", candidate_k: 7, max_steps: 333, fixed_duration: 22.5,
    setup_time: 9.5, crane_radius: 21.0, site_width: 120
  }
}];`);
const sel = document.getElementById("planModelPath");
sel.innerHTML = `<option value="${MODEL_PATH}"></option>`;
sel.value = MODEL_PATH;

const applied = window.applySelectedModelPlanConfig();
assert.ok(Array.isArray(applied) && applied.length, "model config was not applied");

assert.equal(document.getElementById("planCandidateK").value, "7", "K not taken from model");
assert.equal(document.getElementById("planMaxSteps").value, "333", "max_steps not taken from model");
assert.equal(document.getElementById("planCraneRadius").value, "21", "radius not taken from model");
assert.equal(document.getElementById("planSiteSize").value, "120", "site size not taken from model");

// teardown_time is absent from the fixture, so the note is the only place that
// can admit some values are defaults rather than the model's.
assert.ok(
  document.getElementById("planSpecNote").textContent.includes("기본값"),
  "the note should warn that some fields fell back to defaults"
);

// ── the readout stays locked; there is no way to unlock it ──────────────────
for (const id of SPEC_IDS) {
  assert.equal(document.getElementById(id).readOnly, true, `#${id} must remain readonly`);
}

// ── clearing the selection resets the note ──────────────────────────────────
sel.value = "";
window.applySelectedModelPlanConfig();
assert.ok(
  document.getElementById("planSpecNote").textContent.includes("모델을 선택하면"),
  "note should reset when no model is selected"
);

// ── 계획 정책 select is gone; this screen always plans with the model ───────
// The heuristic baselines must stay reachable through 비용 비교, which sweeps
// the policies itself rather than reading the removed control.
assert.equal(document.getElementById("planPolicy"), null, "계획 정책 select should be removed");
assert.ok(!html.includes("planPolicy"), "a planPolicy reference survives in the page source");
assert.ok(
  /policy:\s*'mappo'/.test(html),
  "runPlanningAgent should pin the policy to mappo now that the select is gone"
);
const sweptPolicies = window.eval("COST_CMP_POLICIES.map(p => p[0])");
for (const pol of ["mappo", "nearest", "radiusPriority", "random"]) {
  assert.ok(sweptPolicies.includes(pol), `비용 비교 lost the ${pol} baseline`);
}

// ── the redundant #planModelInfo readout is gone ───────────────────────────
// It restated the dropdown label + the 모델 학습 조건 readout + the 하중/곡선
// box. Removing the element must NOT strand its side effects: updatePlanModelInfo
// used to bail out early when the box was absent, which would have killed both
// the model->fields sync and the load/curve panel.
assert.equal(document.getElementById("planModelInfo"), null, "#planModelInfo should be removed");
// The element and every lookup of it must be gone; the explanatory comment
// naming it is allowed to stay.
assert.ok(!html.includes('id="planModelInfo"'), "the planModelInfo element survives");
assert.ok(!/\$\(\s*['"]planModelInfo['"]\s*\)/.test(html), "a planModelInfo lookup survives");
assert.ok(!html.includes("계획 설정에 적용"), "the '계획 설정에 적용' line should be gone");
const updateBody = String(window.updatePlanModelInfo);
assert.ok(updateBody.includes("applySelectedModelPlanConfig"),
  "updatePlanModelInfo must still sync the model's config into the fields");
assert.ok(updateBody.includes("updatePlanModelLoadInfo"),
  "updatePlanModelInfo must still refresh the 하중/정격곡선 panel");

// Selecting a model through the real entry point must still populate the spec.
document.getElementById("planCandidateK").value = "1";
sel.value = MODEL_PATH;
window.updatePlanModelInfo();
assert.equal(document.getElementById("planCandidateK").value, "7",
  "updatePlanModelInfo no longer applies the model config after the box removal");

// ── a model with no rated curve must not render one ────────────────────────
// The preview used to fall back to the live editor curve, drawing a limit that
// planning.py never applies — directly under a '정격하중 곡선 없음' caption.
const canvas = document.getElementById("planCapacityCurvePreview");
assert.ok(canvas, "#planCapacityCurvePreview missing");
window.drawPlanCapacityCurvePreview(null);
assert.equal(canvas.style.display, "none", "no-curve model must hide the curve preview");
window.drawPlanCapacityCurvePreview([{ radius: 3, capacityT: 50 }, { radius: 18, capacityT: 10 }]);
assert.notEqual(canvas.style.display, "none", "a real curve should still render");

// ── the manual 모델 목록 새로고침 buttons are gone ──────────────────────────
// Every moment that needs a fresh list already refreshes itself, so the button
// was redundant. loadModelList() itself must stay — these call sites are the
// reason the button could be dropped, and losing any of them would strand the
// dropdowns on stale data with no way to recover short of a page reload.
assert.ok(!html.includes("모델 목록 새로고침"), "a 모델 목록 새로고침 button survives");
assert.equal(typeof window.loadModelList, "function", "loadModelList() must remain");
const autoRefreshers = [
  "notifyTrainedModelReady",   // training finished -> list + auto-select
  "refreshModelManager",       // model manager tab
];
for (const fn of autoRefreshers) {
  assert.equal(typeof window[fn], "function", `${fn}() should still exist`);
  const body = String(window[fn]);
  assert.ok(body.includes("loadModelList"), `${fn}() no longer refreshes the model list`);
}
// Boot must populate the pickers, otherwise a fresh page has no models at all.
assert.ok(/loadModelList\(\);\s*updateInitModelUI\(\)/.test(html),
  "boot sequence should still call loadModelList()");

// ── 편집 대상 select is gone, and the canvas picker still hits every type ────
// It only ever fed nearestPlanItem()'s filter, which defaulted to 'all'.
// Removing the control must leave every item type selectable, not none.
assert.equal(document.getElementById("planEditTarget"), null,
  "편집 대상 select should be removed");
assert.ok(!html.includes("planEditTarget"), "a planEditTarget reference survives in the page source");

window.eval(`
  planCranes = [{ id: "C1", x: 10, y: 10 }];
  planLifts = [{ id: "L1", x: 50, y: 50 }];
  planRestrictedZones = [{ id: "RZ1", x1: 80, y1: 80, x2: 95, y2: 95 }];
`);
const pick = (x, y) => window.nearestPlanItem({ x, y });
assert.equal(pick(10, 10)?.type, "crane", "crane should still be pickable");
assert.equal(pick(50, 50)?.type, "lift", "lift should still be pickable");
assert.equal(pick(80, 80)?.type, "zoneCorner", "zone corner should still be pickable");
assert.equal(pick(87, 87)?.type, "zoneMove", "zone body should still be pickable");
assert.equal(pick(30, 70), null, "empty space should still select nothing");

window.close();
console.log("PLAN_SPEC_READONLY_OK");
