// 크레인이 특정 양중물을 "인식 못하는" 것처럼 보일 때 사유를 말해 주는지.
//
// 배경: candidate_actions는 hard 간섭 후보를 통째로 버린다(`feasible if feasible
// else blocked`). 그래서 다른 크레인이 근처에서 작업 중이면 그 양중물이 이 크레인의
// 목록에서 사라지고, 목록이 비면 화면에는 "남은 양중 없음"이라고 떴다 — 양중물이
// 남아 있는데도. 서버가 state.blocked_by_crane {crane_id:{lift_id:reason}}를 내려주고
// 패널이 그 사유를 표시해야 한다.
//
// 픽스처는 실제 플레이 중 캡처한 state (scripts/gen_submit_payloads.py).
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { JSDOM, VirtualConsole } from "jsdom";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..", "..");
const html = readFileSync(path.join(root, "web", "index.html"), "utf-8");
const states = JSON.parse(readFileSync(path.join(root, "tests", "fixtures", "blocked_states.json"), "utf-8"));

assert.ok(states.empty, "후보가 0인 실제 상태 픽스처가 없다");
assert.ok(states.partial, "일부만 가려진 실제 상태 픽스처가 없다");

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
  return new Proxy(target, { get: (t, k) => (k in t ? t[k] : noop), set: (t, k, v) => { t[k] = v; return true; } });
};

const dom = new JSDOM(html, {
  url: "https://dash.example.com/game",
  runScripts: "dangerously",
  pretendToBeVisual: true,
  virtualConsole: new VirtualConsole(),
  beforeParse(window) {
    window.fetch = async () => ({ ok: true, status: 200, json: async () => ({ ok: true }), text: async () => "{}" });
    window.HTMLCanvasElement.prototype.getContext = fakeContext;
    window.Element.prototype.scrollIntoView = () => {};
    window.matchMedia = () => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} });
  },
});
const { window } = dom;
const { document } = window;

const render = (entry) => {
  window.eval(`gameState = ${JSON.stringify(entry.state)}; gameSelections = {}; renderGame();`);
  const cards = [...document.querySelectorAll("#gameCraneCards .game-crane-card")];
  const card = cards.find(c => c.querySelector("h3").textContent.includes(`크레인 ${entry.crane_id} `));
  assert.ok(card, `${entry.crane_id} 카드를 찾지 못함`);
  return card;
};

// ── 후보가 하나도 없는 크레인 ───────────────────────────────────────────────
const emptyCard = render(states.empty);
const emptyState = states.empty.state;
const remaining = emptyState.lifts.filter(l => !l.done).length;
assert.ok(remaining > 0, "픽스처에 남은 양중물이 있어야 의미가 있다");
assert.doesNotMatch(emptyCard.textContent, /남은 양중 없음/,
  "양중물이 남아 있는데 '남은 양중 없음'이라고 하면 안 된다");
assert.match(emptyCard.textContent, /맡을 수 있는 양중물이 없습니다/);
const emptyReasons = new Set(Object.values(emptyState.blocked_by_crane[states.empty.crane_id]));
if (emptyReasons.has("interference")) assert.match(emptyCard.textContent, /다른 크레인 작업과 반경 충돌/);
if (emptyReasons.has("order")) assert.match(emptyCard.textContent, /양중 순서 대기/);
assert.match(emptyCard.textContent, /idle로 넘기거나/, "다음 행동을 알려준다");

// ── 일부만 가려진 크레인 ────────────────────────────────────────────────────
const partialCard = render(states.partial);
const partialBlocked = states.partial.state.blocked_by_crane[states.partial.crane_id];
const nBlocked = Object.keys(partialBlocked).length;
assert.ok(partialCard.querySelectorAll(".game-cand-btn").length > 1, "후보 버튼이 남아 있어야 한다");
assert.match(partialCard.textContent, new RegExp(`선택 불가 ${nBlocked}건`),
  "가려진 양중물 수를 알려준다");
assert.match(partialCard.textContent, /다른 크레인 작업과 반경 충돌/);

// ── 정말로 남은 양중물이 없을 때는 기존 문구 그대로 ─────────────────────────
const doneState = JSON.parse(JSON.stringify(states.partial.state));
doneState.lifts.forEach(l => { l.done = true; });
Object.keys(doneState.candidates_by_crane).forEach(k => { doneState.candidates_by_crane[k] = []; });
Object.keys(doneState.blocked_by_crane).forEach(k => { doneState.blocked_by_crane[k] = {}; });
window.eval(`gameState = ${JSON.stringify(doneState)}; gameSelections = {}; renderGame();`);
assert.match(document.getElementById("gameCraneCards").textContent, /남은 양중 없음/);

console.log("CRANE_BLOCKED_REASON_OK");
window.close();
