// 서명 보충 게이트 + 실험 데이터 제출 + 관리자 "실험 참여 완료" 목록.
//
// 서명란은 동의서 v2 이후에 생겼다. 이미 동의하고 진행 중인 참여자에게
// 재동의(consent_version 상향)를 요구하면 실험이 통째로 멈추므로, 다음 시나리오를
// 시작하기 직전에 서명만 한 번 받는다. 여기서 고정하는 계약:
//   (1) 서명이 있으면 아무것도 묻지 않고 통과한다 (매번 뜨면 안 된다).
//   (2) 서명이 없으면 모달을 띄우고, 저장 전에는 시작을 진행하지 않는다.
//   (3) "나중에"를 누르면 false — 시나리오가 시작되지 않는다.
//   (4) 저장에 성공해야 true가 되고, 실패하면 모달이 닫히지 않는다.
//   (5) 완료 안내의 제출 버튼은 이미 제출한 참여자에게 비활성으로 보인다.
//   (6) 관리자 "실험 참여 완료" 표는 submitted_at 이 있는 참여자만 보여준다.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { JSDOM, VirtualConsole } from "jsdom";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..", "..");
const html = readFileSync(path.resolve(root, "web", "index.html"), "utf-8");
const mobileHtml = readFileSync(path.resolve(root, "web", "game-mobile.html"), "utf-8");

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

let fetchCalls = [];
let fetchImpl = () => Promise.resolve({ ok: true, status: 200, json: async () => ({ ok: true }) });

const dom = new JSDOM(html, {
  url: "https://dash.example.com/game",
  runScripts: "dangerously",
  pretendToBeVisual: true,
  virtualConsole: new VirtualConsole(),
  beforeParse(window) {
    // 페이지는 로드 직후 여러 API를 스스로 부른다. 여기서 검사하려는 것은
    // 서명/제출 호출뿐이므로 그 두 경로만 기록한다.
    window.fetch = (...args) => {
      if (/\/api\/game\/research\/(signature|submit)/.test(String(args[0]))) fetchCalls.push(args);
      return fetchImpl(...args);
    };
    window.HTMLCanvasElement.prototype.getContext = fakeContext;
    window.HTMLCanvasElement.prototype.toDataURL = () => "data:image/png;base64,STUBBED";
    window.HTMLCanvasElement.prototype.getBoundingClientRect = function () {
      return { left: 0, top: 0, width: 600, height: 180, right: 600, bottom: 180, x: 0, y: 0 };
    };
    window.Element.prototype.scrollIntoView = () => {};
  },
});

const { window } = dom;
const { document } = window;
const evalPage = (code) => window.eval(code);
const tick = (ms = 60) => new Promise((r) => setTimeout(r, ms));

const setParticipation = (fields) =>
  evalPage(`researchState = {study:{}, participation:${JSON.stringify(fields)}, progress:{scenario_sequence:['D1_1'],unlocked_index:0,completed_scenarios:['D1_1'],completed_count:1,total_count:1}, loaded:true};`);

const modal = () => document.querySelector(".app-modal-backdrop.research-signature-modal");

// ── (1) 서명이 있으면 묻지 않는다 ──────────────────────────────────────────
setParticipation({ participant_id: "p-1", active: true, has_signature: true });
assert.equal(await evalPage("ensureResearchSignature()"), true, "서명이 있으면 즉시 통과");
assert.equal(modal(), null, "모달을 띄우지 않는다");

// 참여 정보가 없어도(연구 모드가 아님) 막지 않는다.
evalPage("researchState = {study:{}, participation:null, progress:{}, loaded:true};");
assert.equal(await evalPage("ensureResearchSignature()"), true);

// ── (3) 서명이 없으면 모달 — "나중에"는 false ──────────────────────────────
setParticipation({ participant_id: "p-1", active: true, has_signature: false });
fetchCalls = [];
let pending = evalPage("ensureResearchSignature()");
await tick();
const card = modal();
assert.ok(card, "서명이 없으면 모달을 띄운다");
assert.match(card.textContent, /이미 하신 참여 동의는/, "재동의가 아니라는 안내를 준다");
assert.match(card.textContent, /서명만 한 번/);
assert.ok(document.getElementById("researchTopupPad"), "서명 캔버스가 있다");

card.querySelector('[data-act="cancel"]').click();
assert.equal(await pending, false, "'나중에'는 시작을 진행하지 않는다");
assert.equal(modal(), null, "모달이 닫힌다");
assert.equal(fetchCalls.length, 0, "취소는 서버를 호출하지 않는다");

// ── (2) 빈 서명으로는 저장되지 않는다 ──────────────────────────────────────
// 페이지가 배경에서 research/status를 다시 읽어 researchState를 덮어쓰므로
// (fetch 스텁이 빈 응답을 준다) 단계마다 상태를 다시 세운다.
setParticipation({ participant_id: "p-1", active: true, has_signature: false });
pending = evalPage("ensureResearchSignature()");
await tick();
let live = modal();
live.querySelector('[data-act="save"]').click();
await tick();
assert.match(live.querySelector('[data-role="status"]').textContent, /직접 서명/);
assert.equal(fetchCalls.length, 0, "빈 서명은 서버로 보내지 않는다");
assert.ok(modal(), "모달이 열린 채로 남는다");

// 서명을 그린다 (pointer 이벤트는 jsdom에 없으므로 코드가 쓰는 필드만 채운다).
const drawOn = (canvasId) => {
  const cv = document.getElementById(canvasId);
  cv.setPointerCapture = () => {};
  const ev = (type, x, y) => {
    const e = new window.Event(type, { bubbles: true, cancelable: true });
    e.clientX = x; e.clientY = y; e.pointerId = 1;
    return e;
  };
  cv.dispatchEvent(ev("pointerdown", 10, 20));
  cv.dispatchEvent(ev("pointermove", 60, 70));
  cv.dispatchEvent(ev("pointerup", 60, 70));
};
drawOn("researchTopupPad");
assert.equal(evalPage("signaturePadIsEmpty('researchTopupPad')"), false);

// ── (4) 저장 실패면 모달이 닫히지 않는다 ───────────────────────────────────
fetchCalls = [];
fetchImpl = () => Promise.resolve({ ok: true, status: 200, json: async () => ({ ok: false, message: "서버 거부" }) });
live.querySelector('[data-act="save"]').click();
await tick();
assert.equal(fetchCalls.length, 1);
assert.equal(fetchCalls[0][0], "/api/game/research/signature");
assert.equal(fetchCalls[0][1].method, "POST");
assert.match(JSON.parse(fetchCalls[0][1].body).signature, /^data:image\/png;base64,/);
assert.match(live.querySelector('[data-role="status"]').textContent, /서버 거부/);
assert.ok(modal(), "저장 실패면 모달을 닫지 않는다");

// 성공하면 true + 모달 종료 + 상태 갱신.
fetchImpl = () => Promise.resolve({
  ok: true, status: 200,
  json: async () => ({ ok: true, study: {}, participation: { participant_id: "p-1", active: true, has_signature: true }, progress: {} }),
});
live.querySelector('[data-act="save"]').click();
assert.equal(await pending, true, "저장에 성공해야 시작을 진행한다");
assert.equal(modal(), null);
assert.equal(evalPage("researchState.participation.has_signature"), true);

// 갱신된 뒤에는 다시 묻지 않는다.
assert.equal(await evalPage("ensureResearchSignature()"), true);
assert.equal(modal(), null);

// gameStart가 이 게이트를 실제로 거치는지 — 잠금 검사와 세션 시작 사이여야 한다.
const startSrc = html.slice(html.indexOf("async function gameStart"));
const startBody = startSrc.slice(0, startSrc.indexOf("/api/game/session/start"));
assert.match(startBody, /await ensureResearchSignature\(\)/, "gameStart가 서명 게이트를 거친다");
assert.match(mobileHtml, /await ensureResearchSignature\(\)/, "모바일 startScenario도 게이트를 거친다");

// ── (5) 완료 안내의 제출 버튼 ──────────────────────────────────────────────
evalPage(`researchState = {study:{withdrawal:'철회 안내', research_contact:'연구자 010-0000-0000'},
  participation:{participant_id:'abcdef12-0000', active:true, has_signature:true, submitted_at:null},
  progress:{scenario_sequence:['D1_1','D1_2'], unlocked_index:1, completed_scenarios:['D1_1','D1_2'], completed_count:2, total_count:2},
  loaded:true};
showResearchCompleteModal();`);
const done = document.querySelector(".app-modal-backdrop.research-done-modal");
assert.ok(done, "완료 안내가 열린다");
const submitBtn = done.querySelector('[data-act="submit"]');
assert.ok(submitBtn, "제출 버튼이 있다");
assert.equal(submitBtn.textContent.trim(), "실험 데이터 제출");
assert.equal(submitBtn.disabled, false);
// 버튼은 제출 하나뿐이다 — 참여자가 마지막에 할 일이 하나여야 오클릭이 없다.
// (닫기/일반 모드 버튼을 지울 때 그 버튼을 참조하던 focus 호출이 남아 카드가
//  통째로 안 뜨는 회귀가 있었다. 개수를 고정해 같은 실수를 막는다.)
assert.equal(done.querySelectorAll("button").length, 1, "완료 카드의 버튼은 제출 하나뿐");
assert.equal(document.activeElement, submitBtn, "열리면 제출 버튼에 포커스가 간다");

fetchCalls = [];
fetchImpl = () => Promise.resolve({
  ok: true, status: 200,
  json: async () => ({ ok: true, study: {}, participation: { participant_id: "abcdef12-0000", active: true, has_signature: true, submitted_at: "2026-07-30T12:00:00+09:00" }, progress: {} }),
});
submitBtn.click();
await tick();
assert.equal(fetchCalls.length, 1);
assert.equal(fetchCalls[0][0], "/api/game/research/submit");
assert.equal(fetchCalls[0][1].method, "POST");
assert.equal(submitBtn.disabled, true, "제출 후에는 다시 누를 수 없다");
assert.equal(submitBtn.textContent.trim(), "제출 완료");
assert.match(done.querySelector('[data-role="submit-status"]').textContent, /제출 완료/);
done.remove();

// 이미 제출한 참여자가 안내를 다시 열면 처음부터 비활성이다.
evalPage(`researchState.participation.submitted_at = '2026-07-30T12:00:00+09:00';
  showResearchCompleteModal();`);
const reopened = document.querySelector(".app-modal-backdrop.research-done-modal");
assert.equal(reopened.querySelector('[data-act="submit"]').disabled, true);
reopened.remove();

// ── 동의 직후 실험 모드 자동 ON ─────────────────────────────────────────────
// 동의 직후 OFF면 참여자가 토글을 따로 켜야 하고, 모르고 시작한 첫 판이 일반
// 데이터로 저장된다. 반대로 강제로 켜 두기만 하면 끌 수 없으므로 토글은 남긴다.
const consentSrc = html.slice(html.indexOf("async function submitResearchParticipation"));
const consentBody = consentSrc.slice(0, consentSrc.indexOf("async function withdrawResearchParticipation"));
assert.match(consentBody, /setResearchMode\(true\)/, "동의 직후 실험 모드를 켠다");
assert.doesNotMatch(consentBody, /setResearchMode\(false\)/, "동의 직후 끄지 않는다");
// 철회는 반대로 꺼야 한다 — 이후 플레이가 실험 데이터로 새면 안 된다.
const withdrawSrc = html.slice(html.indexOf("async function withdrawResearchParticipation"));
assert.match(withdrawSrc.slice(0, 600), /setResearchMode\(false\)/, "철회하면 실험 모드를 끈다");
// 토글은 그대로 남아 있어야 한다 (끄는 경로 유지).
assert.match(html, /id="researchModeToggle"[^>]*onchange="setResearchMode\(this\.checked\)"/,
  "실험 모드 토글로 직접 끌 수 있다");

// 실제로 켜고 끌 수 있는지 — 상태를 만들어 토글을 돌려본다.
evalPage(`researchState = {study:{}, participation:{participant_id:'p-1', active:true, has_signature:true, submitted_at:null},
  progress:{scenario_sequence:['D1_1','D1_2'], unlocked_index:0, completed_scenarios:[], completed_count:0, total_count:2}, loaded:true};
setResearchMode(true);`);
assert.equal(evalPage("researchMode"), true, "동의 상태에서 켜진다");
evalPage("setResearchMode(false);");
assert.equal(evalPage("researchMode"), false, "참여자가 끌 수 있다");
evalPage("setResearchMode(true);");
assert.equal(evalPage("researchMode"), true, "다시 켤 수 있다");

// 기존 참여자도 자동 ON — 동의 직후 OFF로 저장하던 시절의 '0'을 한 번만 걷어낸다.
// 그 값은 참여자가 끈 것이 아니라 동의 처리가 남긴 것이다.
const modeKey = "craneResearchModeV1:u-legacy";
evalPage(`authUser = {id:'u-legacy', display_name:'기존'};
  researchState = {study:{}, participation:{participant_id:'p-legacy', active:true, has_signature:true, submitted_at:null},
    progress:{scenario_sequence:['D1_1','D1_2'], unlocked_index:0, completed_scenarios:[], completed_count:0, total_count:2}, loaded:true};
  localStorage.setItem('${modeKey}', '0');
  localStorage.removeItem('${modeKey}:autoOnV1');`);
assert.equal(evalPage("_researchReadMode()"), false, "마이그레이션 전에는 저장된 '0'을 따른다");
evalPage("_researchModeAutoOnOnce();");
assert.equal(evalPage(`localStorage.getItem('${modeKey}')`), null, "옛 '0'이 걷어진다");
assert.equal(evalPage("_researchReadMode()"), true, "기존 참여자도 자동으로 켜진다");

// 저장값이 없는 새 기기에서도 ON.
evalPage(`localStorage.removeItem('${modeKey}');`);
assert.equal(evalPage("_researchReadMode()"), true, "저장값이 없으면 기본 ON");

// 참여자가 직접 끈 선택은 유지된다 — 마이그레이션은 1회만 돈다.
evalPage("setResearchMode(false); _researchModeAutoOnOnce();");
assert.equal(evalPage(`localStorage.getItem('${modeKey}')`), "0", "직접 끈 값은 지워지지 않는다");
assert.equal(evalPage("_researchReadMode()"), false, "끈 선택이 새로고침 후에도 유지된다");

// 참여자가 아니면 켜지지 않는다.
evalPage(`researchState.participation.active = false;`);
assert.equal(evalPage("_researchReadMode()"), false, "철회·미동의 상태에서는 켜지지 않는다");

// 모바일도 같은 규칙.
for (const needle of ["function researchModeAutoOnOnce()", "saved===null?true:saved==='1'", "researchModeAutoOnOnce()"]) {
  assert.ok(mobileHtml.includes(needle), `모바일에 ${needle} 이 있어야 한다`);
}
const mConsent = mobileHtml.slice(mobileHtml.indexOf("$('mrSubmit').addEventListener"));
const mConsentBody = mConsent.slice(0, mConsent.indexOf("$('mobileResearchWithdraw')"));
assert.match(mConsentBody, /setMobileResearchMode\(true\)/, "모바일도 동의 직후 켠다");
assert.doesNotMatch(mConsentBody, /setMobileResearchMode\(false\)/, "모바일도 동의 직후 끄지 않는다");
// renderResearch 안에도 같은 id 참조가 있으므로 리스너 등록 지점을 집어야 한다.
const mWithdraw = mobileHtml.slice(mobileHtml.indexOf("$('mobileResearchWithdraw').addEventListener"));
assert.match(mWithdraw.slice(0, 700), /setMobileResearchMode\(false\)/, "모바일도 철회하면 끈다");
assert.ok(mobileHtml.includes('id="mobileResearchToggle"'), "모바일 토글 유지");

// ── 상시 제출 경로 (참여 패널) ─────────────────────────────────────────────
// 완료 안내 카드는 사용자·study_version 당 한 번만 뜬다. 그 카드를 놓친
// 참여자가 영영 제출하지 못하는 일이 없도록 참여 패널에도 버튼을 둔다.
const submitRow = () => document.getElementById("researchSubmitRow");
const submitAllBtn = () => document.getElementById("researchSubmitAllBtn");

// 미완료 상태에서는 자격이 없다 — 행 자체가 숨는다.
evalPage(`researchState = {study:{}, participation:{participant_id:'p-1', active:true, has_signature:true, submitted_at:null},
  progress:{scenario_sequence:['D1_1','D1_2'], unlocked_index:0, completed_scenarios:['D1_1'], completed_count:1, total_count:2}, loaded:true};
renderResearchState();`);
assert.equal(submitRow().style.display, "none", "전 단계를 마치기 전에는 제출 버튼이 없다");

// 전 시나리오 완료 → 자격이 생긴다.
evalPage(`researchState.progress = {scenario_sequence:['D1_1','D1_2'], unlocked_index:1, completed_scenarios:['D1_1','D1_2'], completed_count:2, total_count:2};
renderResearchState();`);
assert.equal(submitRow().style.display, "flex", "전 단계를 마치면 제출 버튼이 보인다");
assert.equal(submitAllBtn().disabled, false);
assert.equal(submitAllBtn().textContent.trim(), "실험 데이터 제출");
assert.match(document.getElementById("researchSubmitHint").textContent, /계속 플레이/,
  "제출 후에도 반복 플레이가 가능함을 알린다");

// 제출하면 잠긴다.
fetchCalls = [];
fetchImpl = () => Promise.resolve({
  ok: true, status: 200,
  json: async () => ({ ok: true, study: {}, participation: { participant_id: "p-1", active: true, has_signature: true, submitted_at: "2026-07-30T03:00:00+09:00" },
    progress: { scenario_sequence: ["D1_1", "D1_2"], unlocked_index: 1, completed_scenarios: ["D1_1", "D1_2"], completed_count: 2, total_count: 2 } }),
});
await evalPage("submitResearchData(document.getElementById('researchSubmitAllBtn'))");
await tick();
assert.equal(fetchCalls.length, 1);
assert.equal(fetchCalls[0][0], "/api/game/research/submit");
assert.equal(submitAllBtn().disabled, true, "제출 후에는 다시 누를 수 없다");
assert.equal(submitAllBtn().textContent.trim(), "제출 완료");
assert.match(document.getElementById("researchSubmitHint").textContent, /제출 완료/);

// 제출을 마쳐도 실험 모드는 유지된다 — 높은 점수를 위한 반복 플레이가 가능해야 한다.
assert.equal(evalPage("_researchIsActive()"), true, "제출해도 참여 상태는 유지된다");
assert.equal(evalPage("_researchAccess('D1_1').locked"), false, "완료한 시나리오도 다시 플레이할 수 있다");
assert.equal(evalPage("_researchAccess('D1_2').locked"), false);

// 모바일도 같은 상시 경로를 갖는다.
for (const needle of ["mobileResearchSubmitRow", "mobileResearchSubmitAll", "function syncResearchSubmitRow"]) {
  assert.ok(mobileHtml.includes(needle), `모바일에 ${needle} 이 있어야 한다`);
}
// 제출 호출은 한 곳으로 모은다 — 카드와 패널이 갈라지면 한쪽만 고쳐지는 버그가 난다.
assert.equal((html.match(/fetch\('\/api\/game\/research\/submit'/g) || []).length, 1,
  "PC: 제출 fetch 지점은 submitResearchData 하나뿐");
assert.equal((mobileHtml.match(/api\('\/api\/game\/research\/submit'/g) || []).length, 1,
  "모바일: 제출 호출 지점은 submitResearchData 하나뿐");

// ── (6) 관리자 "실험 참여 완료" 표 ─────────────────────────────────────────
const sections = [...document.querySelectorAll("details.section[data-dm-group]")];
const titleOf = (el) => el.querySelector("summary").textContent.trim();
const partIdx = sections.findIndex((s) => titleOf(s).startsWith("실험 참여자"));
const doneIdx = sections.findIndex((s) => titleOf(s).startsWith("실험 참여 완료"));
assert.ok(partIdx >= 0 && doneIdx >= 0);
assert.equal(doneIdx, partIdx + 1, "실험 참여 완료는 실험 참여자 바로 다음");
assert.equal(sections[doneIdx].dataset.dmGroup, "overview", "개요 그룹에 있다");

// 실제 로더(loadDmParticipants)는 캐시와 함께 loaded/error 를 세운다. 캐시를 직접
// 주입하는 테스트도 같은 상태를 만들어야 렌더가 "아직 로드 전"으로 보지 않는다.
evalPage(`_dmParticipantsLoaded = true; _dmParticipantsError = '';
_dmParticipantsCache = [
  {participant_id:'p-1', full_name:'제출한사람', university:'인천대학교', college:'도시과학대학',
   department:'도시건축학부', student_number:'202011111', phone:'010-1111-1111', email:'a@example.com',
   active:true, has_signature:true, submitted_at:'2026-07-30T12:00:00+09:00',
   completed_count:27, total_count:27, play_count:27},
  {participant_id:'p-2', full_name:'안누른사람', university:'인천대학교', college:'공과대학',
   department:'기계공학과', student_number:'202022222', phone:'010-2222-2222', email:'b@example.com',
   active:true, has_signature:false, submitted_at:null,
   completed_count:27, total_count:27, play_count:27}
];
renderDmSubmitted();`);
const doneRows = [...document.querySelectorAll("#dmDoneBody tr")];
assert.equal(doneRows.length, 1, "제출을 누른 참여자만 나온다");
assert.match(doneRows[0].textContent, /제출한사람/);
assert.doesNotMatch(document.getElementById("dmDoneBody").textContent, /안누른사람/,
  "끝까지 풀었어도 제출을 누르지 않았으면 목록에 없다");
assert.match(document.getElementById("dmDoneStatus").textContent, /제출 완료 1명/);

// 검색.
evalPage(`document.getElementById('dmDoneSearch').value='안누른'; renderDmSubmitted();`);
assert.equal(document.querySelectorAll("#dmDoneBody tr").length, 1, "제출자가 아니면 검색해도 안 나온다");
assert.match(document.getElementById("dmDoneBody").textContent, /검색 결과 없음/);
evalPage(`document.getElementById('dmDoneSearch').value=''; renderDmSubmitted();`);

// 모바일도 같은 제출 계약.
assert.ok(mobileHtml.includes("'/api/game/research/submit'"), "모바일도 제출 API를 호출한다");
assert.ok(mobileHtml.includes("id=\"researchSubmitBtn\""), "모바일 완료 안내에 제출 버튼이 있다");
// 모바일도 제출 버튼 하나만. 지운 버튼에 addEventListener를 걸면 그 자리에서
// 스크립트가 멈춰 페이지 전체가 죽으므로 잔존 참조가 없어야 한다.
for (const gone of ["researchDoneCloseBtn", "researchDoneGeneralBtn"]) {
  assert.ok(!mobileHtml.includes(gone), `${gone} 참조가 남아 있으면 안 된다`);
}
assert.ok(mobileHtml.includes("id=\"ovSignature\""), "모바일에 서명 보충 시트가 있다");

console.log("RESEARCH_SIGNATURE_TOPUP_OK");
window.close();
