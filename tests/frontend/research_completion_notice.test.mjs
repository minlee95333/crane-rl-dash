// 실험 전 회차 완료 안내 (PC) — 회차마다 뜨는 축하가 아니라 "종료 통지"라는
// 성질을 고정한다.
//
// 실험 플레이는 판마다 축하 오버레이를 띄우지 않는다: 회차별로 피드백이 달라지면
// MaxEnt IRL이 역추정하려는 의사결정 자체에 개입하기 때문이다. 그래서 완료 모달은
// (1) 마지막 회차 제출 이후에만, (2) 사용자·study_version 당 한 번만, (3) 일반
// 플레이에서는 절대 뜨면 안 된다. 진행도 미터는 단계 수만큼 점을 그리고 완료/현재
// 상태를 색과 함께 텍스트로도 알린다.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { JSDOM, VirtualConsole } from "jsdom";

const here = path.dirname(fileURLToPath(import.meta.url));
const html = readFileSync(path.resolve(here, "..", "..", "web", "index.html"), "utf-8");

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
  url: "https://dash.example.com/game",
  runScripts: "dangerously",
  pretendToBeVisual: true,
  virtualConsole: new VirtualConsole(),
  beforeParse(window) {
    window.fetch = () =>
      Promise.resolve({ ok: true, status: 200, json: async () => ({ ok: true }), text: async () => "" });
    window.HTMLCanvasElement.prototype.getContext = fakeContext;
    window.Element.prototype.scrollIntoView = () => {};
  },
});

const { window } = dom;
const { document } = window;

const SEQUENCE = ["D1_1", "D1_2", "D1_3"];
// authUser / researchState are top-level `let` bindings — script-scoped, not
// window properties — so they can only be reached through eval in page scope.
const evalPage = (code) => window.eval(code);
const setState = (completed, version = "v1") => {
  const state = {
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
  };
  evalPage(`authUser = {id:'user-1', display_name:'학생'};
    researchState = ${JSON.stringify(state)};
    researchMode = true;
    renderResearchState();`);
};
const modal = () => document.querySelector(".app-modal-backdrop.research-done-modal");

// ── 진행 중: 남은 단계와 단계 미터 ──────────────────────────────────────────
setState(1);
const progressText = document.getElementById("researchProgressText").textContent;
assert.match(progressText, /1\/3단계 완료/);
assert.match(progressText, /남은 2단계/, "남은 단계 수를 숫자로 알려준다");
const dots = [...document.querySelectorAll("#researchProgressSteps .research-step")];
assert.equal(dots.length, SEQUENCE.length, "단계 수만큼 점이 그려진다");
assert.ok(dots[0].classList.contains("done"));
assert.ok(dots[1].classList.contains("current"));
assert.equal(dots[2].className.trim(), "research-step", "미도달 단계는 빈 점");
// 27단계가 폭에 따라 24+3처럼 접히면 개수를 눈으로 셀 수 없으므로 항상 한 줄.
assert.doesNotMatch(html, /\.research-steps\{[^}]*flex-wrap:wrap/, "단계 미터는 접히지 않는다");
assert.match(html, /\.research-step\{[^}]*flex:1 1 0/, "칸이 폭을 나눠 갖고 줄어든다");

// 마지막 회차 전에는 종료 안내가 뜨지 않는다.
assert.equal(evalPage("maybeShowResearchComplete()"), false, "미완료 상태에서는 모달 없음");
assert.equal(modal(), null);

// ── 전체 완료: 딱 한 번만 ──────────────────────────────────────────────────
setState(3);
const doneText = document.getElementById("researchProgressText").textContent;
assert.match(doneText, /3\/3단계 전체 완료/);
assert.match(doneText, /감사/, "색이 아니라 문구로도 완료를 알린다");
const doneDots = [...document.querySelectorAll("#researchProgressSteps .research-step")];
assert.ok(doneDots.every(d => d.classList.contains("done")));
assert.equal(doneDots.filter(d => d.classList.contains("current")).length, 0);

assert.equal(evalPage("maybeShowResearchComplete()"), true, "마지막 제출 직후 1회 표시");
const card = modal();
assert.ok(card, "완료 모달이 열린다");
assert.match(card.textContent, /감사합니다/);
assert.match(card.textContent, /3\/3/);
assert.match(card.textContent, /abcdef12/, "문의용 참여자 번호를 보여준다");
assert.match(card.textContent, /철회/);
assert.match(card.textContent, /연구책임자 010-0000-0000/);
assert.doesNotMatch(card.textContent, /점|등급|순위/, "실험 화면에 점수·순위 피드백을 붙이지 않는다");

// 두 번째 호출은 무시 — 재방문 때마다 다시 뜨면 안 된다.
card.remove();
assert.equal(evalPage("maybeShowResearchComplete()"), false, "사용자·study_version 당 1회");
assert.equal(modal(), null);

// study_version이 바뀌면 새 연구이므로 다시 안내한다.
setState(3, "v2");
assert.equal(evalPage("maybeShowResearchComplete()"), true, "새 study_version은 별도 안내");
document.querySelector(".app-modal-backdrop.research-done-modal").remove();

// ── 참여 철회 상태에서는 뜨지 않는다 ────────────────────────────────────────
setState(3, "v3");
evalPage("researchState.participation.active = false;");
assert.equal(evalPage("maybeShowResearchComplete()"), false, "철회한 참여자에게는 안내하지 않는다");

// ── 축하 오버레이는 제출 목적과 무관하게 뜬다 ───────────────────────────────
// 2026-07-30 이전에는 실험 플레이에서 이 카드를 숨겼다(회차별 보상 피드백이
// IRL이 역추정하려는 판단 기준을 흔들 수 있다는 우려). 참여자가 자기 제출
// 결과를 확인하지 못하는 쪽이 더 큰 문제여서 켜기로 했다.
const source = html.slice(html.indexOf("function showGameResult"));
const branch = source.slice(0, source.indexOf("function hideGameResult"));
assert.doesNotMatch(branch, /if\s*\(\s*!isResearchPlay\s*\)\s*\{[\s\S]*_celebrateResult/,
  "축하 오버레이를 일반 플레이로 한정하지 않는다");
assert.match(branch, /_celebrateResult\(/, "축하 오버레이는 계속 호출된다");
// 완료 안내는 점수 카드를 닫은 뒤에 이어서 뜬다. 동시에 띄우면 축하
// 오버레이(z-index 1600)가 완료 카드(1000)를 덮어 제출 버튼을 누를 수 없다.
assert.match(branch, /onClose:\s*isResearchPlay\s*\?\s*maybeShowResearchComplete\s*:\s*null/,
  "완료 안내는 점수 카드의 onClose 로 이어진다 (실험 플레이에서만)");
assert.doesNotMatch(branch, /maybeShowResearchComplete\(\)/,
  "완료 안내를 점수 카드와 동시에 호출하지 않는다");

console.log("RESEARCH_COMPLETION_NOTICE_OK");
window.close();
