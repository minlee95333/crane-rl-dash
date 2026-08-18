// 실험 전 회차 완료 안내 (모바일) — PC와 같은 규칙이 폰에서도 지켜지는지.
// 참여자가 폰으로 마지막 회차를 끝낼 수 있으므로, 종료 신호가 기기마다 달라지면
// 안 된다. 규칙: 마지막 제출 이후에만, 사용자·study_version 당 한 번만, 철회한
// 참여자에게는 뜨지 않는다.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { JSDOM, VirtualConsole } from "jsdom";

const here = path.dirname(fileURLToPath(import.meta.url));
const html = readFileSync(path.resolve(here, "..", "..", "web", "game-mobile.html"), "utf8");

const SEQUENCE = ["D1_1", "D1_2", "D1_3"];
const researchPayload = (completed, version = "v1") => ({
  study: {
    study_version: version,
    withdrawal: "계정 화면에서 철회할 수 있습니다.",
    research_contact: "연구책임자 010-0000-0000",
  },
  participation: { participant_id: "abcdef12-3456-7890-abcd-ef1234567890", active: true, consent_version: "v1" },
  progress: {
    study_version: version,
    scenario_sequence: SEQUENCE,
    unlocked_index: Math.min(completed, SEQUENCE.length - 1),
    completed_scenarios: SEQUENCE.slice(0, completed),
    completed_count: completed,
    total_count: SEQUENCE.length,
  },
  loaded: true,
});

const dom = new JSDOM(html, {
  url: "https://dash.example.com/game/mobile",
  runScripts: "dangerously",
  pretendToBeVisual: true,
  virtualConsole: new VirtualConsole(),
  beforeParse(window) {
    window.matchMedia = () => ({ matches: true, addListener() {}, removeListener() {} });
    window.HTMLCanvasElement.prototype.getContext = () => null;
    window.fetch = async (url) => {
      const u = String(url);
      let data = { ok: true };
      if (u.includes("/api/auth/me")) {
        data = { ok: true, user: { id: "user-1", display_name: "student" } };
      } else if (u.includes("/api/game/research/status")) {
        data = { ok: true, study: {}, participation: null, progress: null };
      } else if (u.endsWith("/api/game/scenarios")) {
        data = { ok: true, scenarios: [
          { id: "D1_1", name: "첫 단계", difficulty: 1, num_lifts: 1, num_cranes: 1 },
        ] };
      }
      return { ok: true, status: 200, json: async () => data, text: async () => JSON.stringify(data) };
    };
  },
});

const { window } = dom;
const { document } = window;
const waitFor = async predicate => {
  for (let i = 0; i < 50; i += 1) {
    if (predicate()) return;
    await new Promise(resolve => setTimeout(resolve, 10));
  }
  throw new Error("timed out waiting for mobile UI");
};
// 부팅이 끝난 뒤에만 상태를 주입한다 — 아직 진행 중이면 window.close() 이후에
// 부트 콜백이 깨어나 죽은 document를 만진다.
await waitFor(() => document.getElementById("scrLevels").classList.contains("active"));

const setState = (completed, version = "v1") => {
  window.eval(`G.user = {id:'user-1', display_name:'student'};
    G.research = ${JSON.stringify(researchPayload(completed, version))};
    G.researchMode = true;
    renderResearch();`);
};
const sheetOpen = () => document.getElementById("ovResearchDone").classList.contains("show");

// ── 진행 중 ────────────────────────────────────────────────────────────────
setState(1);
const progress = document.getElementById("mobileResearchProgress").textContent;
assert.match(progress, /1\/3단계 완료/);
assert.match(progress, /남은 2단계/);
const dots = [...document.querySelectorAll("#mobileResearchSteps .research-step")];
assert.equal(dots.length, SEQUENCE.length);
assert.ok(dots[0].classList.contains("done"));
assert.ok(dots[1].classList.contains("current"));
// 항상 한 줄 — 폭에 따라 접히면 단계 수를 눈으로 셀 수 없다.
assert.doesNotMatch(html, /\.research-steps\{[^}]*flex-wrap:wrap/);
assert.match(html, /\.research-step\{[^}]*flex:1 1 0/, "칸이 폭을 나눠 갖고 줄어든다");

assert.equal(window.eval("maybeShowResearchDone()"), false, "미완료 상태에서는 시트 없음");
assert.equal(sheetOpen(), false);

// ── 전체 완료: 한 번만 ─────────────────────────────────────────────────────
setState(3);
const doneText = document.getElementById("mobileResearchProgress").textContent;
assert.match(doneText, /3\/3단계 전체 완료/);
assert.match(doneText, /감사/);
assert.ok([...document.querySelectorAll("#mobileResearchSteps .research-step")]
  .every(d => d.classList.contains("done")));

assert.equal(window.eval("maybeShowResearchDone()"), true, "마지막 제출 직후 1회");
assert.equal(sheetOpen(), true);
const sheet = document.getElementById("ovResearchDone");
assert.match(sheet.textContent, /감사합니다|끝났습니다/);
assert.match(sheet.textContent, /3\/3/);
assert.match(sheet.textContent, /abcdef12/);
assert.match(sheet.textContent, /연구책임자 010-0000-0000/);

window.eval("ovHide('ovResearchDone')");
assert.equal(window.eval("maybeShowResearchDone()"), false, "사용자·study_version 당 1회");
assert.equal(sheetOpen(), false);

// 새 study_version이면 다시 안내한다.
setState(3, "v2");
assert.equal(window.eval("maybeShowResearchDone()"), true, "새 study_version은 별도 안내");
window.eval("ovHide('ovResearchDone')");

// 철회한 참여자에게는 뜨지 않는다.
setState(3, "v3");
window.eval("G.research.participation.active = false;");
assert.equal(window.eval("maybeShowResearchDone()"), false);

// 완료 안내는 점수 시트를 닫은 뒤에 뜬다 (PC와 같은 순서). showWin 안에서 바로
// 띄우면 두 시트가 겹쳐 아래쪽 제출 버튼을 누를 수 없다.
const winFn = html.slice(html.indexOf("function showWin(r)"));
const winBody = winFn.slice(0, winFn.indexOf("async function loadWinRank"));
assert.match(winBody, /_pendingResearchDone=!!isResearch/,
  "showWin 은 완료 안내를 예약만 한다");
assert.doesNotMatch(winBody, /if\(isResearch\)maybeShowResearchDone\(\)/,
  "점수 시트와 완료 안내를 동시에 띄우지 않는다");
assert.match(winBody, /function closeWin\(\)\{[\s\S]*maybeShowResearchDone\(\)/,
  "점수 시트를 닫을 때 예약된 완료 안내가 뜬다");
// 시트를 닫는 경로가 늘어나면 그 경로도 closeWin 을 거쳐야 한다 — 직접
// ovHide('ovWin') 을 부르면 완료 안내가 영영 뜨지 않는다.
const winCloseCalls = html.match(/ovHide\('ovWin'\)/g) || [];
assert.equal(winCloseCalls.length, 1, "ovWin 을 닫는 곳은 closeWin 하나뿐");

// 축하 연출은 제출 목적과 무관하게 붙는다 — PC(_celebrateResult)와 동일한 규칙.
// 2026-07-30 이전에는 실험 플레이에서 뺐지만(회차별 피드백이 IRL 추정을 흔들
// 수 있다는 우려), 참여자가 제출 결과를 확인하지 못하는 문제가 더 커서 켰다.
assert.match(winBody, /if\(!REDUCED\)setTimeout\(confetti/,
  "축하 연출을 실험 여부로 가르지 않는다");
assert.equal(winBody.split("confetti").length - 1, 1, "축하 연출 호출 지점은 하나");

console.log("RESEARCH_COMPLETION_NOTICE_MOBILE_OK");
window.close();
