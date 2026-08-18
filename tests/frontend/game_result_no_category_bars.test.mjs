// Verifies the submit-completion screen (showGameResult) no longer renders the
// per-category weighted-score bar graph — that breakdown is admin-only via the
// Plays 상세 scorer_snapshot. The raw metrics (완료·Makespan·soft 간섭) and the
// post-hoc total/grade must still render. A partial-clear fixture avoids the
// full-clear fireworks path so the check stays jsdom-safe.
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
      Promise.resolve({ ok: true, status: 200, json: async () => ({ ok: true, plays: [] }), text: async () => "" });
    window.HTMLCanvasElement.prototype.getContext = () => null;
    // jsdom doesn't implement scrollIntoView; showGameResult calls it at the end.
    window.Element.prototype.scrollIntoView = () => {};
  },
});

const { window } = dom;
const doc = window.document;

// Fully-populated scorer_snapshot with category scores — the exact data that
// previously drove the bar graph. done < total → partial clear (no fireworks).
const RESULT = {
  path: "pg:demo",
  meta: { scenario_id: "D3_1", tier: "general", play_seconds: 42, undo_count: 1 },
  outcome: { done: 2, total: 3, makespan: 123.4, raw: { soft_interference_count: 1 } },
  scorer_snapshot: {
    totalScore: 68.5,
    grade: "B",
    categories: {
      completion:       { score: 66.7, weight: 40, detail: "2/3 완료" },
      makespan:         { score: 70.0, weight: 25, detail: "makespan 123.4" },
      softInterference: { score: 80.0, weight: 15, detail: "soft 1" },
      jobBalance:       { score: 90.0, weight: 10, detail: "균형 양호" },
      timeBalance:      { score: 60.0, weight: 10, detail: "시간 편차" },
    },
  },
};

window.showGameResult(RESULT);

// The category bar container must be present but emptied and hidden.
const catsHost = doc.getElementById("gameResultCats");
assert.ok(catsHost, "gameResultCats container still exists");
assert.equal(catsHost.querySelectorAll(".game-cat-bar").length, 0,
  "no per-category bar graph on the completion screen");
assert.equal(catsHost.innerHTML.trim(), "", "category container is emptied");
assert.equal(catsHost.style.display, "none", "category container is hidden");

// Raw metrics and the total still render (only the weighted breakdown is gone).
assert.equal(doc.getElementById("gameRDone").textContent, "2/3", "완료 still shown");
assert.equal(doc.getElementById("gameRMakespan").textContent, "123.4", "Makespan still shown");
assert.equal(doc.getElementById("gameRSoft").textContent, "1", "soft 간섭 still shown");
// 총점·등급 요소는 그대로 존재해야 한다 (값은 _animateScore/스탬프가 비동기로
// 채우므로 존재 여부만 확인 — 제거된 것은 카테고리 막대뿐임을 못박는다).
assert.ok(doc.getElementById("gameRScore"), "총점(사후 참고) 요소 유지");
assert.ok(doc.getElementById("gameRGrade"), "등급(사후 참고) 요소 유지");

console.log("GAME_RESULT_NO_CATEGORY_BARS_OK");
window.close();
process.exit(0);
