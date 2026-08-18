// 관리자 화면의 실험 참여자 / 실험 데이터 표.
//
// 두 표는 성격이 다르다. 참여자 표는 research_participations의 PII(실명·학번·
// 전화번호)를 보여주므로 개요 그룹에서 'Auth 가입자' 바로 뒤에 놓이고, 실험
// 데이터 표는 데이터셋 그룹에서 'Plays' 바로 뒤에 놓여 play_purpose=research
// 플레이만 추린다. 여기서 고정하는 계약:
//   (1) 두 아코디언의 위치와 소속 그룹
//   (2) 실험 데이터 표에 일반/legacy 플레이가 절대 섞이지 않는다
//   (3) participant_id → 실명 매핑, 매핑이 없으면 id 앞자리로 대체
//   (4) scenario_order(0-base)는 화면에서 1-base로 표시된다
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
const evalPage = (code) => window.eval(code);

// ── (1) 아코디언 위치와 그룹 ────────────────────────────────────────────────
const sections = [...document.querySelectorAll("details.section[data-dm-group]")];
const titleOf = (el) => el.querySelector("summary").textContent.trim();
const idx = (needle) => sections.findIndex((s) => titleOf(s).startsWith(needle));

const authIdx = idx("Auth 가입자");
const partIdx = idx("실험 참여자");
const playsIdx = idx("Plays");
const researchIdx = idx("실험 데이터");

assert.ok(authIdx >= 0 && partIdx >= 0 && playsIdx >= 0 && researchIdx >= 0,
  "네 아코디언이 모두 있어야 한다");
assert.equal(partIdx, authIdx + 1, "실험 참여자는 Auth 가입자 바로 다음");
assert.equal(researchIdx, playsIdx + 1, "실험 데이터는 Plays 바로 다음");
assert.equal(sections[partIdx].dataset.dmGroup, "overview", "참여자 표는 개요 그룹");
assert.equal(sections[researchIdx].dataset.dmGroup, "datasets", "실험 데이터는 데이터셋 그룹");

// 참여자 표는 Auth 가입자 표와 같은 구성 — 검색 + 새로고침 + 표 + 페이저.
for (const id of ["dmPartSearch", "dmPartStatus", "dmPartTable", "dmPartBody", "dmPartPager"]) {
  assert.ok(document.getElementById(id), `${id} 가 있어야 한다`);
}
for (const id of ["dmRpScenario", "dmRpTier", "dmRpClient", "dmRpParticipant",
                  "dmRpNick", "dmRpDone", "dmRpSort", "dmRpStatus", "dmRpBody", "dmRpPager"]) {
  assert.ok(document.getElementById(id), `${id} 가 있어야 한다`);
}

// Tier 필터는 Plays 표와 같은 선택지를 가져야 한다. 실험 플레이도 tier=general로
// 제출되므로(운영 데이터 30건 전부) general이 빠지면 필터가 헛돈다.
const rpTiers = [...document.querySelectorAll("#dmRpTier option")].map((o) => o.value);
const playTiers = [...document.querySelectorAll("#dmPlayTier option")].map((o) => o.value);
assert.deepEqual(rpTiers, playTiers, "실험 데이터 Tier 필터는 Plays와 같은 선택지");

// ── (2)(3)(4) 렌더링 계약 ──────────────────────────────────────────────────
const PID = "11111111-2222-3333-4444-555555555555";
const OTHER = "99999999-8888-7777-6666-555555555555";
evalPage(`
// 실제 로더(loadDmParticipants)는 캐시와 함께 이 두 값을 세운다. 캐시를 직접
// 주입하는 테스트도 같은 상태를 만들어야 렌더가 '아직 로드 전'으로 오해하지 않는다.
_dmParticipantsLoaded = true; _dmParticipantsError = '';
_dmParticipantsCache = [
  {participant_id:'${PID}', user_id:'u-1', full_name:'홍길동', university:'인천대학교',
   college:'도시과학대학', department:'도시건축학부', student_number:'202012345',
   grade:'3학년', phone:'010-1234-5678', email:'a@example.com', active:true,
   open_data_consent:true, consented_at:'2026-07-01T10:00:00+09:00', withdrawn_at:null,
   unlocked_index:1, completed_count:1, total_count:3, play_count:2, has_signature:true},
  {participant_id:'${OTHER}', user_id:'u-2', full_name:'김철수', university:'인천대학교',
   college:'공과대학', department:'기계공학과', student_number:'202154321',
   grade:'2학년', phone:'010-9999-0000', email:'b@example.com', active:false,
   open_data_consent:false, consented_at:'2026-06-20T09:00:00+09:00',
   withdrawn_at:'2026-06-25T09:00:00+09:00',
   unlocked_index:0, completed_count:0, total_count:3, play_count:0, has_signature:false}
];
_dmPlaysCache = [
  {path:'pg:1', play_purpose:'research', participant_id:'${PID}', scenario_id:'D1_1',
   tier:'standard', client:'pc', nickname:'닉A', scenario_order:0, submitted_at:'2026-07-02T10:00:00',
   done:2, total:2, totalScore:80, grade:'B', makespan:12.5, undo_count:1, think_ms:2000, interactions:30},
  {path:'pg:2', play_purpose:'research', participant_id:'unknown-pid', scenario_id:'D1_2',
   tier:'standard', client:'mobile', nickname:'닉B', scenario_order:2, submitted_at:'2026-07-03T10:00:00',
   done:1, total:2, totalScore:50, grade:'D', makespan:20, undo_count:0, think_ms:900, interactions:10},
  {path:'pg:3', play_purpose:'general', user_id:'u-1', scenario_id:'D1_1',
   tier:'standard', client:'pc', nickname:'닉A', submitted_at:'2026-07-04T10:00:00',
   done:2, total:2, totalScore:90, grade:'A', makespan:11, undo_count:0},
  {path:'pg:4', play_purpose:'legacy', scenario_id:'D1_3', tier:'general', nickname:'옛날',
   submitted_at:'2026-07-05T10:00:00', done:2, total:2, totalScore:70, grade:'C', makespan:15}
];
renderDmParticipants();
_dmFillResearchPlayFilters();
renderDmResearchPlays();
`);

// 참여자 표 — PII 컬럼이 실제로 렌더된다.
const partRows = [...document.querySelectorAll("#dmPartBody tr")];
assert.equal(partRows.length, 2);
const firstPart = partRows[0].textContent;
assert.match(firstPart, /홍길동/);
assert.match(firstPart, /202012345/, "학번");
assert.match(firstPart, /010-1234-5678/, "전화번호");
assert.match(firstPart, /인천대학교 · 도시과학대학 · 도시건축학부/, "소속은 한 칸에 합쳐 보여준다");
assert.match(firstPart, /참여 중/);
assert.match(partRows[1].textContent, /철회/, "철회한 참여자도 목록에 남는다");

// '플레이'(판 수)와 '최종 제출'(제출 버튼)은 다른 개념이다. 예전에는 판 수 컬럼
// 이름이 '제출'이라 최종 제출로 오해를 샀다 — 두 칸이 나란히 있어야 한다.
const partHeaders = [...document.querySelectorAll("#dmPartTable thead th")].map((t) => t.textContent.trim());
assert.ok(partHeaders.includes("플레이"), "판 수 컬럼은 '플레이'");
assert.ok(partHeaders.includes("최종 제출"), "제출 버튼 여부는 '최종 제출'");
assert.ok(!partHeaders.includes("제출"), "'제출' 단독 라벨은 쓰지 않는다 (판 수와 혼동)");
assert.equal(partHeaders.length,
  [...document.querySelectorAll("#dmPartBody tr")][0].querySelectorAll("td").length,
  "헤더 수와 셀 수가 같다");
// 진행 중인 참여자(1/3)는 '최종 제출' 이 '진행 중'
const finalIdx = partHeaders.indexOf("최종 제출");
assert.match([...partRows[0].querySelectorAll("td")][finalIdx].textContent, /진행 중/);

// 서명은 표에 이미지를 깔지 않고 "보기" 버튼으로만 연다 — 목록 응답에 서명
// 원본이 실리지 않으므로(has_signature 뿐) 여러 명을 볼 때 통째로 노출되지 않는다.
const sigBtn = partRows[0].querySelector("button");
assert.ok(sigBtn, "서명이 있으면 보기 버튼이 나온다");
assert.equal(sigBtn.textContent.trim(), "보기");
assert.match(sigBtn.getAttribute("onclick"), /showParticipantSignature\('11111111-/);
assert.equal(partRows[0].querySelector("img"), null, "표에는 서명 이미지를 직접 넣지 않는다");
assert.equal(partRows[1].querySelector("button"), null, "서명이 없으면 버튼도 없다");
assert.match(partRows[1].textContent, /없음/);

// 참여 상태 필터.
evalPage(`document.getElementById('dmPartActive').value='withdrawn'; renderDmParticipants();`);
assert.equal(document.querySelectorAll("#dmPartBody tr").length, 1);
assert.match(document.querySelector("#dmPartBody tr").textContent, /김철수/);
evalPage(`document.getElementById('dmPartActive').value=''; renderDmParticipants();`);

// 실험 데이터 표 — research 플레이만.
const rpRows = [...document.querySelectorAll("#dmRpBody tr")];
assert.equal(rpRows.length, 2, "general/legacy 플레이는 섞이지 않는다");
const rpText = document.getElementById("dmRpBody").textContent;
assert.doesNotMatch(rpText, /옛날/, "legacy 플레이 제외");
assert.doesNotMatch(rpText, /90\.0/, "general 플레이 제외");

// participant_id → 실명, 매핑 없으면 id 앞자리.
assert.match(rpText, /홍길동/, "참여자 실명을 보여준다");
assert.match(rpText, /unknown-/, "매핑이 없으면 participant_id 앞자리로 대체");

// scenario_order 는 0-base 저장 → 1-base 표시.
const newest = rpRows[0].textContent;  // 기본 정렬 = 제출시각 ↓
assert.match(newest, /닉B/);
const orderCells = [...rpRows[1].querySelectorAll("td")].map((td) => td.textContent.trim());
assert.ok(orderCells.includes("1"), "scenario_order=0 은 '1'로 표시된다");

// 상태 문구는 전체 건수와 표시 건수를 함께 알린다.
assert.match(document.getElementById("dmRpStatus").textContent, /실험 데이터 2건 중 2건/);

// 참여자 필터 — 드롭다운은 research 플레이의 참여자만 채운다.
const partOpts = [...document.querySelectorAll("#dmRpParticipant option")].map((o) => o.textContent);
assert.equal(partOpts.length, 3, "전체 + 참여자 2명");
assert.ok(partOpts.some((t) => t.startsWith("홍길동 (1)")));
evalPage(`document.getElementById('dmRpParticipant').value='${PID}'; renderDmResearchPlays();`);
assert.equal(document.querySelectorAll("#dmRpBody tr").length, 1);
assert.match(document.getElementById("dmRpBody").textContent, /닉A/);
assert.match(document.getElementById("dmRpStatus").textContent, /2건 중 1건/);

// 한 판도 안 푼 참여자는 드롭다운에 없다 — 참여자 표에서만 확인된다.
assert.ok(!partOpts.some((t) => t.startsWith("김철수")), "제출이 없는 참여자는 필터에 없다");

// ── 실험 참여자 순위 ───────────────────────────────────────────────────────
// 계약: (1) 배정된 전 시나리오를 완료한 참여자만 순위에 든다
//       (2) 같은 시나리오를 여러 번 풀면 최고 점수 하나만 평균에 들어간다
//       (3) 배정 수(total_count)를 모르면 순위를 매기지 않는다
const rankSection = sections.findIndex((s) => titleOf(s).startsWith("실험 참여자 순위"));
const rpIdx2 = sections.findIndex((s) => titleOf(s).startsWith("실험 데이터"));
assert.ok(rankSection >= 0, "순위 아코디언이 있다");
assert.equal(rankSection, rpIdx2 + 1, "순위는 실험 데이터 바로 다음");
assert.equal(sections[rankSection].dataset.dmGroup, "datasets");

// User Scenarios 아코디언은 삭제됐다 — 잔존 참조가 있으면 스크립트가 죽는다.
assert.ok(!sections.some((s) => titleOf(s).startsWith("User Scenarios")), "User Scenarios 토글 제거");
for (const gone of ["dmAdminScenBody", "loadDmAdminScenarios", "renderDmAdminScenarios", "setDmAdminScenPage"]) {
  assert.ok(!html.includes(gone), `${gone} 참조가 남아 있으면 안 된다`);
}

const P1 = "aaaaaaaa-0000-0000-0000-000000000001";
const P2 = "bbbbbbbb-0000-0000-0000-000000000002";
const P3 = "cccccccc-0000-0000-0000-000000000003";
const rp = (pid, sid, score, makespan) => ({
  path: `pg:${pid}:${sid}:${score}`, play_purpose: "research", participant_id: pid,
  scenario_id: sid, tier: "general", client: "pc", nickname: "n", submitted_at: "2026-07-30T01:00:00",
  done: 2, total: 2, totalScore: score, grade: "B", makespan, undo_count: 0,
});
evalPage(`
// 실제 로더(loadDmParticipants)는 캐시와 함께 이 두 값을 세운다. 캐시를 직접
// 주입하는 테스트도 같은 상태를 만들어야 렌더가 '아직 로드 전'으로 오해하지 않는다.
_dmParticipantsLoaded = true; _dmParticipantsError = '';
_dmParticipantsCache = [
  {participant_id:'${P1}', full_name:'완주자A', university:'인천대학교', college:'도시과학대학',
   department:'도시건축학부', student_number:'202011111', active:true, has_signature:true,
   submitted_at:'2026-07-30T02:00:00+09:00', completed_count:2, total_count:2, play_count:3},
  {participant_id:'${P2}', full_name:'완주자B', university:'인천대학교', college:'공과대학',
   department:'기계공학과', student_number:'202022222', active:true, has_signature:true,
   submitted_at:null, completed_count:2, total_count:2, play_count:2},
  {participant_id:'${P3}', full_name:'미완주자', university:'인천대학교', college:'공과대학',
   department:'전자공학과', student_number:'202033333', active:true, has_signature:true,
   submitted_at:null, completed_count:1, total_count:2, play_count:1}
];
_dmPlaysCache = [
  ${JSON.stringify(rp(P1, "D1_1", 60, 100))},
  ${JSON.stringify(rp(P1, "D1_1", 90, 80))},
  ${JSON.stringify(rp(P1, "D1_2", 70, 120))},
  ${JSON.stringify(rp(P2, "D1_1", 80, 50))},
  ${JSON.stringify(rp(P2, "D1_2", 80, 60))},
  ${JSON.stringify(rp(P3, "D1_1", 99, 10))}
];
renderDmResearchRanking();
`);
const rankRows = [...document.querySelectorAll("#dmRankBody tr")];
assert.equal(rankRows.length, 2, "전 시나리오를 완료한 2명만 순위에 든다");
assert.doesNotMatch(document.getElementById("dmRankBody").textContent, /미완주자/,
  "한 시나리오라도 빠뜨리면 점수가 높아도 제외된다");

const cellsOf = (tr) => [...tr.querySelectorAll("td")].map((td) => td.textContent.trim());
// 두 참여자 모두 평균 80.0 (A = max(60,90)=90 과 70 의 평균, B = 80 과 80).
// 기본 동점 정렬은 Makespan 짧은 순이므로 B(평균 55.0)가 A(평균 100.0)보다 앞선다.
const first = cellsOf(rankRows[0]);
const second = cellsOf(rankRows[1]);
assert.match(first[1], /완주자B/, "동점이면 평균 Makespan 이 짧은 쪽이 1위");
assert.match(first[0], /^1/);
// 평균 점수는 소수점 5자리 — 1자리면 서로 다른 평균이 같아 보인다.
assert.equal(first[4], "80.00000");
assert.equal(first[6], "55.00000", "B 평균 Makespan = (50+60)/2");

// (2) 중복 플레이는 최고 점수만 — A의 60점 플레이는 평균에서 무시된다.
assert.match(second[1], /완주자A/);
assert.equal(second[4], "80.00000", "중복 플레이는 최고 점수만 평균에 반영 (60점은 무시)");
assert.equal(second[5].replace(/\s/g, ""), "2/2", "반영 시나리오 / 배정 시나리오");
assert.equal(second[6], "100.00000", "평균 Makespan 은 반영된 최고 기록 기준 (80+120)/2");
assert.equal(second[7], "3", "플레이 건수는 중복 포함 전체");
assert.match(document.getElementById("dmRankStatus").textContent, /전 시나리오 완료 2명/);

// 동점 정렬을 이름순으로 바꾸면 A가 앞선다 — 정렬 기준이 실제로 적용된다.
evalPage(`document.getElementById('dmRankTiebreak').value='name'; renderDmResearchRanking();`);
const byName = [...document.querySelectorAll("#dmRankBody tr")].map((tr) => cellsOf(tr)[1]);
assert.match(byName[0], /완주자A/, "이름순 동점 정렬");
evalPage(`document.getElementById('dmRankTiebreak').value='makespan'; renderDmResearchRanking();`);

// (3) 참여자 목록이 없으면 배정 수를 몰라 순위를 매기지 않는다.
evalPage(`_dmParticipantsCache = []; _dmParticipantsLoaded = false; _dmParticipantsError = ''; renderDmResearchRanking();`);
assert.equal(document.querySelectorAll("#dmRankBody tr").length, 1);
assert.match(document.getElementById("dmRankStatus").textContent, /참여자 목록을 불러오는 중/);

// ── 조회 실패는 "0명"이 아니다 ──────────────────────────────────────────────
// 실패를 0으로 표시하면 데이터가 사라진 것처럼 읽힌다 (2026-07-30에 실제로
// 그렇게 오해를 샀다). 세 표 모두 실패를 실패라고 말해야 한다.
evalPage(`_dmParticipantsCache = []; _dmParticipantsLoaded = false;
  _dmParticipantsError = 'API disabled for non-loopback hosts';
  renderDmParticipants(); renderDmSubmitted(); renderDmResearchRanking();`);
for (const [statusId, bodyId] of [
  ["dmPartStatus", "dmPartBody"],
  ["dmDoneStatus", "dmDoneBody"],
  ["dmRankStatus", "dmRankBody"],
]) {
  const body = document.getElementById(bodyId).textContent;
  assert.match(body, /불러오지 못했습니다/, `${bodyId}: 실패를 명시한다`);
  assert.doesNotMatch(body, /없습니다\.$/, `${bodyId}: "없다"로 단정하지 않는다`);
  assert.ok(document.getElementById(bodyId).querySelector(".warn"),
    `${bodyId}: 실패는 경고 스타일로 눈에 띈다`);
}
// 집계 문구에 0명이라는 숫자를 쓰지 않는다.
assert.doesNotMatch(document.getElementById("dmDoneStatus").textContent, /제출 완료 0명/);
assert.match(document.getElementById("dmDoneStatus").textContent, /불러오지 못해/);
assert.doesNotMatch(document.getElementById("dmRankStatus").textContent, /완료 0명/);
assert.match(document.getElementById("dmRankStatus").textContent, /불러오지 못해/);

// 실패해도 이미 받아 둔 데이터는 지우지 않는다 — 최신이 아닐 뿐이다.
evalPage(`_dmParticipantsCache = [
  {participant_id:'${P1}', full_name:'완주자A', university:'인천대학교', college:'도시과학대학',
   department:'도시건축학부', student_number:'202011111', active:true, has_signature:true,
   submitted_at:'2026-07-30T02:00:00+09:00', completed_count:2, total_count:2, play_count:3}];
  _dmParticipantsLoaded = true; _dmParticipantsError = '조회 실패';
  renderDmSubmitted();`);
assert.equal(document.querySelectorAll("#dmDoneBody tr").length, 1,
  "실패해도 남아 있는 제출자는 계속 보여준다");
assert.match(document.getElementById("dmDoneStatus").textContent, /불러오지 못해/,
  "다만 최신이 아님을 알린다");

// 상태 초기화 (뒤 단계에 영향 주지 않도록)
evalPage(`_dmParticipantsError = ''; _dmParticipantsLoaded = true;`);

console.log("ADMIN_RESEARCH_VIEWS_OK");
window.close();
