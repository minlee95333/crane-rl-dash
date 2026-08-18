// 동의서 자필 서명 패드 (PC).
//
// 서명은 동의 취득 절차의 일부라 "그린 것이 그대로 저장되는가"보다 앞서
// 지켜야 할 계약이 있다:
//   (1) 빈 서명으로는 제출할 수 없다 — 클라이언트가 먼저 막고, 서버도 막는다.
//   (2) 획을 좌표로 들고 있어 리사이즈(모바일 회전)에도 서명이 살아남는다.
//   (3) 저장본은 화면 잉크색이 아니라 흰 배경·검은 잉크다 — 다크 테마 색으로
//       저장하면 인쇄·보관본에서 보이지 않는다.
//   (4) 재동의 때 이전 서명을 프리필하지 않는다.
//   (5) touch-action:none 이 없으면 모바일에서 서명 중 페이지가 스크롤된다.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { JSDOM, VirtualConsole } from "jsdom";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..", "..");
const html = readFileSync(path.resolve(root, "web", "index.html"), "utf-8");
const mobileHtml = readFileSync(path.resolve(root, "web", "game-mobile.html"), "utf-8");

// 서명 캔버스는 실제로 그려져야 하므로 no-op 프록시가 아니라 호출을 기록하는
// 가짜 2D 컨텍스트를 쓴다 (경로 명령과 색을 검사한다).
const makeCtx = () => {
  const calls = [];
  const state = { strokeStyle: "", fillStyle: "" };
  const rec = (name) => (...args) => calls.push({ name, args, strokeStyle: state.strokeStyle, fillStyle: state.fillStyle });
  const ctx = {
    calls,
    beginPath: rec("beginPath"), moveTo: rec("moveTo"), lineTo: rec("lineTo"),
    stroke: rec("stroke"), fill: rec("fill"), arc: rec("arc"),
    fillRect: rec("fillRect"), clearRect: rec("clearRect"),
    setTransform: rec("setTransform"), save: rec("save"), restore: rec("restore"),
  };
  Object.defineProperty(ctx, "strokeStyle", {
    get: () => state.strokeStyle, set: (v) => { state.strokeStyle = v; }, enumerable: true,
  });
  Object.defineProperty(ctx, "fillStyle", {
    get: () => state.fillStyle, set: (v) => { state.fillStyle = v; }, enumerable: true,
  });
  return ctx;
};

const contexts = new Map();
const dom = new JSDOM(html, {
  url: "https://dash.example.com/game",
  runScripts: "dangerously",
  pretendToBeVisual: true,
  virtualConsole: new VirtualConsole(),
  beforeParse(window) {
    window.fetch = () =>
      Promise.resolve({ ok: true, status: 200, json: async () => ({ ok: true }), text: async () => "" });
    window.HTMLCanvasElement.prototype.getContext = function () {
      if (!contexts.has(this)) contexts.set(this, makeCtx());
      return contexts.get(this);
    };
    window.HTMLCanvasElement.prototype.toDataURL = () => "data:image/png;base64,STUBBED";
    window.Element.prototype.scrollIntoView = () => {};
    // jsdom은 레이아웃을 하지 않아 getBoundingClientRect가 0을 준다. 패드가
    // 크기 0이면 아무것도 못 그리므로 캔버스에만 실제 크기를 부여한다.
    window.HTMLCanvasElement.prototype.getBoundingClientRect = function () {
      return { left: 0, top: 0, width: 600, height: 180, right: 600, bottom: 180, x: 0, y: 0 };
    };
    window.devicePixelRatio = 2;
  },
});

const { window } = dom;
const { document } = window;
const evalPage = (code) => window.eval(code);

// jsdom에는 PointerEvent가 없다 — 코드가 쓰는 필드만 갖춘 이벤트로 대신한다.
const pointer = (type, x, y) => {
  const e = new window.Event(type, { bubbles: true, cancelable: true });
  e.clientX = x; e.clientY = y; e.pointerId = 1;
  return e;
};
const draw = (canvasId, points) => {
  const cv = document.getElementById(canvasId);
  cv.setPointerCapture = () => {};
  cv.dispatchEvent(pointer("pointerdown", points[0][0], points[0][1]));
  for (const [x, y] of points.slice(1)) cv.dispatchEvent(pointer("pointermove", x, y));
  cv.dispatchEvent(pointer("pointerup", ...points[points.length - 1]));
};

const PAD = "researchSignaturePad";
assert.ok(document.getElementById(PAD), "동의 모달에 서명 캔버스가 있어야 한다");

// 서명란은 흰 종이다 — 잉크가 검정이라 다크 배경 위에서는 보이지 않는다.
assert.match(html, /\.sig-pad\{[^}]*background:#ffffff/, "PC 서명란 배경은 흰 종이");

// (5) 스크롤 방지 — CSS 계약. 이게 빠지면 모바일에서 획이 끊긴다.
assert.match(html, /\.sig-pad\{[^}]*touch-action:none/, "PC: sig-pad에 touch-action:none");
assert.match(mobileHtml, /\.sig-pad\{[^}]*touch-action:none/, "모바일: sig-pad에 touch-action:none");

// ── (1) 빈 서명 ────────────────────────────────────────────────────────────
evalPage(`initSignaturePad('${PAD}', _syncResearchSignatureHint);`);
assert.equal(evalPage(`signaturePadIsEmpty('${PAD}')`), true, "그리기 전에는 비어 있다");
assert.equal(evalPage(`signaturePadDataUrl('${PAD}')`), "", "빈 서명은 빈 문자열");
assert.match(document.getElementById("researchSignatureHint").textContent, /아직 서명하지 않았습니다/);

// ── (2) 그리기 → 좌표 보존 → 리사이즈 후에도 남아 있다 ─────────────────────
draw(PAD, [[10, 20], [40, 60], [90, 30]]);
assert.equal(evalPage(`signaturePadIsEmpty('${PAD}')`), false, "그린 뒤에는 비어 있지 않다");

// 화면 잉크도 검정 — 저장본과 같아야 서명한 사람이 본 대로 보관된다.
const screenStroke = contexts.get(document.getElementById(PAD)).calls
  .filter((c) => c.name === "stroke").at(-1);
assert.ok(screenStroke, "화면 캔버스에도 획을 그린다");
assert.equal(screenStroke.strokeStyle, "#111111", "화면 잉크는 검정 (테마색이 아니다)");
assert.match(document.getElementById("researchSignatureHint").textContent, /서명이 입력되었습니다/);
assert.ok(document.getElementById(PAD).classList.contains("is-signed"), "서명 상태가 테두리로도 보인다");

const strokeCount = () => evalPage(`_sigPads['${PAD}'].strokes.length`);
const pointCount = () => evalPage(`_sigPads['${PAD}'].strokes[0].length`);
assert.equal(strokeCount(), 1);
assert.equal(pointCount(), 3, "pointerdown 1 + pointermove 2");

// 리사이즈는 캔버스 백버퍼를 지우지만, 획이 좌표로 남아 있으므로 서명은 유지된다.
evalPage(`_sigResize(_sigPads['${PAD}']);`);
assert.equal(evalPage(`signaturePadIsEmpty('${PAD}')`), false, "리사이즈해도 서명이 살아남는다");
assert.equal(pointCount(), 3);

// 두 번째 획도 누적된다.
draw(PAD, [[120, 40], [160, 80]]);
assert.equal(strokeCount(), 2);

// ── (3) 저장본은 흰 배경 · 검은 잉크 ───────────────────────────────────────
const before = new Set(contexts.keys());
const url = evalPage(`signaturePadDataUrl('${PAD}')`);
assert.equal(url, "data:image/png;base64,STUBBED", "저장은 PNG data URL");
const exportCanvas = [...contexts.keys()].find((c) => !before.has(c));
assert.ok(exportCanvas, "저장은 화면 캔버스가 아니라 별도 캔버스에 렌더한다");
const exportCalls = contexts.get(exportCanvas).calls;
const bg = exportCalls.find((c) => c.name === "fillRect");
assert.ok(bg, "저장본에는 배경을 채운다");
assert.equal(bg.fillStyle, "#ffffff", "저장 배경은 흰색");
const inkCall = exportCalls.find((c) => c.name === "stroke");
assert.ok(inkCall, "저장본에 획을 그린다");
assert.equal(inkCall.strokeStyle, "#111111", "저장 잉크는 검은색 (다크 테마 색으로 저장하면 인쇄 시 안 보인다)");
assert.equal(inkCall.strokeStyle, screenStroke.strokeStyle, "화면과 저장본의 잉크가 같다");

// ── 다시 쓰기 ──────────────────────────────────────────────────────────────
evalPage(`clearSignaturePad('${PAD}');`);
assert.equal(evalPage(`signaturePadIsEmpty('${PAD}')`), true, "다시 쓰기로 비워진다");
assert.equal(strokeCount(), 0);
assert.ok(!document.getElementById(PAD).classList.contains("is-signed"));

// ── (4) 재동의 때 이전 서명을 프리필하지 않는다 ────────────────────────────
// 서버 응답에 서명 원본이 없고(has_signature 뿐), 모달을 열 때 캔버스를 비운다.
const openSrc = html.slice(html.indexOf("function openResearchModal"));
const openBody = openSrc.slice(0, openSrc.indexOf("function closeResearchModal"));
assert.match(openBody, /clearSignaturePad\('researchSignaturePad'\)/,
  "모달을 열 때 서명란을 비운다");
assert.doesNotMatch(openBody, /profile\.signature/, "이전 서명을 프리필하지 않는다");

// ── (1) 제출 경로: 빈 서명이면 서버로 보내지 않는다 ────────────────────────
const submitSrc = html.slice(html.indexOf("async function submitResearchParticipation"));
const submitBody = submitSrc.slice(0, submitSrc.indexOf("async function withdrawResearchParticipation"));
assert.match(submitBody, /signaturePadIsEmpty\('researchSignaturePad'\)/,
  "제출 전에 빈 서명을 막는다");
assert.ok(
  submitBody.indexOf("signaturePadIsEmpty") < submitBody.indexOf("fetch("),
  "빈 서명 검사는 fetch 이전에 온다",
);
assert.match(submitBody, /signature:signaturePadDataUrl\('researchSignaturePad'\)/,
  "payload에 서명을 싣는다");

// 모바일도 같은 계약 — 같은 위젯이 별도 파일에 복제되어 있다.
for (const [needle, why] of [
  ["signaturePadIsEmpty('mrSignaturePad')", "모바일도 빈 서명을 막는다"],
  ["signature:signaturePadDataUrl('mrSignaturePad')", "모바일도 payload에 서명을 싣는다"],
  ["clearSignaturePad('mrSignaturePad')", "모바일도 열 때 서명란을 비운다"],
  ["const SIGNATURE_INK='#111111'", "모바일 잉크도 검정"],
  ["const SIGNATURE_PAPER='#ffffff'", "모바일 종이도 흰색"],
]) {
  assert.ok(mobileHtml.includes(needle), why);
}
assert.match(mobileHtml, /\.sig-pad\{[^}]*background:#ffffff/, "모바일 서명란 배경은 흰 종이");

console.log("CONSENT_SIGNATURE_PAD_OK");
window.close();
