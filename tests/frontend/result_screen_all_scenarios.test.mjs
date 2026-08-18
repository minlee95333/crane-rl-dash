// 모든 시나리오의 제출 결과 화면이 끝까지 렌더되는지.
//
// 배경: 사용자가 27개 시나리오를 전부 플레이했더니 "어떤 시나리오는 완료 후
// 폭죽·점수 카드가 안 뜬다"는 보고가 있었다. PC의 제출 흐름은
//   submit → showGameResult(data) → (일반 플레이면) _celebrateResult(...)
// 인데, showGameResult 안에서 예외가 나면 축하 카드까지 도달하지 못하고 호출부의
// catch가 "제출 실패"로 표시한다 — 서버에는 이미 저장된 뒤인데도. 시나리오마다
// 분기하는 렌더 코드(장비 투입 맵의 비용 명세 등)가 있어 페이로드 모양이 달라지므로,
// 손으로 쓴 픽스처가 아니라 27개 시나리오를 실제로 완주시켜 받은 submit 응답
// (tests/fixtures/submit_payloads.json, scripts/gen_submit_payloads.py로 재생성)을
// 그대로 흘려 넣는다.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { JSDOM, VirtualConsole } from "jsdom";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..", "..");
const html = readFileSync(path.join(root, "web", "index.html"), "utf-8");
const payloads = JSON.parse(
  readFileSync(path.join(root, "tests", "fixtures", "submit_payloads.json"), "utf-8"),
);

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

const errors = [];
const dom = new JSDOM(html, {
  url: "https://dash.example.com/game",
  runScripts: "dangerously",
  pretendToBeVisual: true,
  virtualConsole: new VirtualConsole(),
  beforeParse(window) {
    window.fetch = async (url) => {
      const u = String(url);
      const data = u.includes("/api/game/plays") || u.includes("/api/game/leaderboard")
        ? { ok: true, plays: [], leaderboard: [] }
        : { ok: true };
      return { ok: true, status: 200, json: async () => data, text: async () => JSON.stringify(data) };
    };
    window.HTMLCanvasElement.prototype.getContext = fakeContext;
    window.Element.prototype.scrollIntoView = () => {};
    window.matchMedia = () => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} });
  },
});

const { window } = dom;
const { document } = window;

const ids = Object.keys(payloads);
assert.ok(ids.length >= 27, `시나리오 페이로드가 ${ids.length}개뿐 — 전 시나리오를 덮지 못한다`);

for (const sid of ids) {
  const data = payloads[sid];
  document.getElementById("celebrateOverlay")?.remove();
  try {
    window.showGameResult(data);
  } catch (e) {
    errors.push(`${sid}: showGameResult 예외 — ${e && e.message}`);
    continue;
  }
  const o = data.outcome || {};
  const isFullClear = +(o.total || 0) > 0 && +(o.done || 0) >= +(o.total || 0);
  assert.ok(isFullClear, `${sid}: 픽스처가 완주 상태가 아니다 (${o.done}/${o.total})`);

  // 결과 패널의 핵심 숫자
  assert.equal(document.getElementById("gameRDone").textContent, `${o.done}/${o.total}`,
    `${sid}: 완료 카운트`);
  assert.notEqual(document.getElementById("gameRMakespan").textContent, "-",
    `${sid}: makespan 미표시`);

  // 축하 카드 — 일반 플레이에서는 시나리오 종류와 무관하게 항상 떠야 한다.
  const card = document.getElementById("celebrateOverlay");
  if (!card) {
    errors.push(`${sid}: 축하 카드(celebrateOverlay)가 뜨지 않음`);
    continue;
  }
  assert.match(card.textContent, /양중 완료/, `${sid}: 완주인데 완료 문구가 없다`);
  assert.ok(document.getElementById("celScore"), `${sid}: 점수 카운터 없음`);
}

// 장비 투입 맵만 비용 명세를 노출하는지 (다른 맵에 잘못 남지 않는지)
const fleetId = ids.find(id => (payloads[id].outcome || {}).cost);
assert.ok(fleetId, "비용(cost)을 포함한 시나리오 페이로드가 없다 — FLEET 맵 확인 필요");
window.showGameResult(payloads[fleetId]);
assert.notEqual(document.getElementById("gameResultCost").style.display, "none",
  `${fleetId}: 투입 비용 패널이 숨겨져 있다`);
const plainId = ids.find(id => !(payloads[id].outcome || {}).cost);
window.showGameResult(payloads[plainId]);
assert.equal(document.getElementById("gameResultCost").style.display, "none",
  `${plainId}: 비용 패널이 남아 있다`);

assert.deepEqual(errors, [], `결과 화면 실패:\n  ${errors.join("\n  ")}`);
console.log(`RESULT_SCREEN_ALL_SCENARIOS_OK (${ids.length} scenarios)`);
// _celebrateFillRank가 await 뒤에 document를 만지므로, 닫기 전에 한 틱 넘긴다.
await new Promise(resolve => setTimeout(resolve, 60));
window.close();
