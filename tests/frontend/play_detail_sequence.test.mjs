import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { JSDOM, VirtualConsole } from "jsdom";

const here = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.resolve(here, "..", "..", "web", "index.html");
const html = readFileSync(htmlPath, "utf-8");
const virtualConsole = new VirtualConsole();

const dom = new JSDOM(html, {
  url: "https://dash.example.com/trainer",
  runScripts: "dangerously",
  pretendToBeVisual: true,
  virtualConsole,
  beforeParse(window) {
    window.fetch = () =>
      Promise.resolve({ ok: true, status: 200, json: async () => ({}), text: async () => "" });
    window.HTMLCanvasElement.prototype.getContext = () => null;
  },
});

const { window } = dom;
const doc = {
  meta: { user_id: "u1", scenario_id: "D1_2", play_seconds: 25, undo_count: 1 },
  config: {
    setup_time: 10,
    crane_capacity_chart: [{ boom_len: 22, curve: [[3, 46], [21, 10]] }],
  },
  layout: {
    cranes: [{ id: "C1", x: 10, y: 20 }],
    lifts: [{ id: "L2", x: 30, y: 40, weight_t: 10 }],
    restrictedZones: [],
  },
  actions: [
    { C1: { lift_id: "L2" }, C2: null },
    {
      __mode__: "sweep",
      setups: {
        C1: { setup_x: 12, setup_y: 18 },
        C2: { setup_x: 72.25, setup_y: 30.5 },
      },
    },
  ],
  behavior: {
    steps: [
      { mode: "pick", dt_ms: 1200, interactions: 4 },
      { mode: "sweep", dt_ms: 800, interactions: 2, undo_used: true },
    ],
    session: { pointer_events: 6, mode_switches: 1, zoom_events: 0, undos: [500] },
    events: [{ t: 100, type: "assign", crane: "C1", lift: "L2" }],
  },
  outcome: {
    makespan: 65,
    done: 3,
    total: 3,
    raw: { completion: 1, per_crane_jobs: { C1: 3 } },
    events: [
      {
        craneId: "C2", liftId: "L3", liftStart: 40, liftFinish: 65,
        capacityMarginT: 3, movePath: [{ x: 1, y: 2 }, { x: 3, y: 4 }],
      },
      { craneId: "C1", liftId: "L2", liftStart: 10, liftFinish: 35 },
      { craneId: "C1", liftId: "L1", liftStart: 20, liftFinish: 45 },
    ],
  },
  scorer_snapshot: {
    totalScore: 91.1,
    grade: "A+",
    weights: { completion: 25 },
    categories: { completion: { score: 100, weighted: 25, detail: "완료 3/3" } },
  },
  future_metrics: { custom_signal: 7 },
};

const detailHtml = window._behaviorSummaryHtml(doc);
assert.ok(detailHtml.includes("플레이 모드"));
assert.ok(detailHtml.includes("양중 클릭"));
assert.ok(detailHtml.includes("직접 배치"));
assert.ok(detailHtml.includes("양중 클릭 → 직접 배치"));
assert.ok(detailHtml.includes("C1 → L2"));
assert.ok(detailHtml.includes("C2 idle"));
assert.ok(detailHtml.includes("C1 @ (12.0, 18.0)"));
assert.ok(detailHtml.includes("실제 양중 순서"));

const l2Index = detailHtml.indexOf("<td>L2</td>");
const l1Index = detailHtml.indexOf("<td>L1</td>");
const l3Index = detailHtml.indexOf("<td>L3</td>");
assert.ok(l2Index >= 0 && l1Index > l2Index && l3Index > l1Index, "execution rows must be time-sorted");

const legacyHtml = window._behaviorSummaryHtml({
  actions: [{ C1: "L1" }],
  outcome: { events: [{ craneId: "C1", liftId: "L1", start: 0, finish: 25 }] },
});
assert.ok(legacyHtml.includes("양중 클릭"));
assert.ok(legacyHtml.includes("C1 → L1"));

const fullDetailHtml = window._playFullDetailHtml(doc);
assert.ok(fullDetailHtml.includes("사용자·세션 정보"));
// config/layout are scenario-defined and now live only in the 시나리오 토글, so
// the play detail references the scenario instead of re-rendering them. The
// value-labels that only appear when those sections render must be absent.
assert.ok(fullDetailHtml.includes("‘시나리오’ 토글"), "play detail must point to the scenario toggle");
assert.ok(!fullDetailHtml.includes("게임 설정"), "config section must not render in play detail");
assert.ok(!fullDetailHtml.includes("현장 배치"), "layout section must not render in play detail");
assert.ok(!fullDetailHtml.includes("정격하중 차트"), "config contents must not render in play detail");
assert.ok(fullDetailHtml.includes("허용하중 여유(t)"));
assert.ok(fullDetailHtml.includes("이동 경로"));
assert.ok(fullDetailHtml.includes("원시 결과 요약"));
assert.ok(fullDetailHtml.includes("점수·등급"));
assert.ok(fullDetailHtml.includes("완료 3/3"));
assert.ok(fullDetailHtml.includes("기타 저장 정보"));
assert.ok(fullDetailHtml.includes("future metrics"));
assert.ok(fullDetailHtml.includes("custom signal"));

window._showPlayDetailModal(doc, "pg:plays:1");
const modal = window.document.querySelector(".app-modal");
assert.ok(modal, "play detail modal should render");
assert.equal(modal.querySelector("pre"), null, "play detail must not show raw JSON");
assert.ok(modal.textContent.includes("사용자·세션 정보"));
assert.ok(modal.textContent.includes("시뮬레이션 결과"));
// modal 재구성 이후: behavior는 독립 섹션이 아니라 "원본 데이터 (JSON)" 그룹의
// "행동 로그 (behavior)"로 들어간다.
assert.ok(modal.textContent.includes("원본 데이터"));
assert.ok(modal.textContent.includes("행동 로그"));
assert.ok(modal.querySelector("[data-act=replay]"), "play with events must offer a 3D replay button");
modal.closest(".app-modal-backdrop").remove();

// A doc with no executed lifts must NOT offer replay.
window._showPlayDetailModal(
  { meta: { scenario_id: "D1_2" }, outcome: { events: [] }, layout: { cranes: [{ id: "C1" }] } },
  "pg:plays:2",
);
const emptyModal = window.document.querySelector(".app-modal");
assert.equal(emptyModal.querySelector("[data-act=replay]"), null, "play without events must hide replay");
emptyModal.closest(".app-modal-backdrop").remove();

// _repFromPlayDoc reconstructs the 3D viewer shape: ≤1 event per crane per step,
// bucketed by execution time across cranes.
const rep = window._repFromPlayDoc(doc);
assert.equal(rep.scenario_id, "D1_2");
assert.equal(rep.steps.length, 2, "two C1 picks → two steps");
assert.equal(rep.steps[0].events.map((e) => e.liftId).sort().join(","), "L2,L3");
assert.equal(rep.steps[1].events.map((e) => e.liftId).join(","), "L1");
rep.steps.forEach((s) => {
  const ids = s.events.map((e) => e.craneId);
  assert.equal(new Set(ids).size, ids.length, "no crane repeats within a step");
});
assert.equal(rep.lifts[0].w, 10, "weight_t maps to w for the 3D crate sizing");
assert.equal(window._repFromPlayDoc({ outcome: { events: [] } }), null);

// _result2dFromPlayDoc feeds the 2D engine straight from the doc's layout/outcome.
const r2d = window._result2dFromPlayDoc(doc);
assert.equal(r2d.makespan, 65);
assert.equal(r2d.events.length, 3);
assert.equal(r2d.layout.cranes[0].id, "C1");
assert.equal(r2d.appliedConfig.setup_time, 10);

dom.window.close();
console.log("PLAY_DETAIL_SEQUENCE_OK");
