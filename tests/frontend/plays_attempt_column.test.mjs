// Verifies the Plays panel "회차" (attempt-number) column: for each
// (user, scenario) group the plays are numbered N/M by submitted_at ascending,
// independent of the table's current sort/filter — so a user's repeated plays
// of the same scenario read 1/3, 2/3, 3/3 and score progression is visible.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { JSDOM, VirtualConsole } from "jsdom";

const here = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.resolve(here, "..", "..", "web", "index.html");
const html = readFileSync(htmlPath, "utf-8");
const virtualConsole = new VirtualConsole();

// user A plays D3_1 three times (rising scores) + D1_1 once; user B plays D3_1 once.
const mk = (n, uid, name, sid, ts, score) => ({
  path: "pg:" + n, user_id: uid, display_name: name, nickname: name,
  scenario_id: sid, tier: "general", client: "pc", submitted_at: ts,
  done: 3, total: 3, makespan: 100 - score, totalScore: score, grade: "B", undo_count: 0,
});
const PLAYS = [
  mk(1, "aaaa-A", "수미", "D3_1", "2026-07-06T10:00:00", 40),
  mk(2, "aaaa-A", "수미", "D3_1", "2026-07-06T11:00:00", 55),
  mk(3, "aaaa-A", "수미", "D3_1", "2026-07-06T12:00:00", 70),
  mk(4, "aaaa-A", "수미", "D1_1", "2026-07-06T13:00:00", 90),  // different scenario → resets
  mk(5, "bbbb-B", "정훈", "D3_1", "2026-07-06T09:30:00", 60),  // different user → own count
];

const dom = new JSDOM(html, {
  url: "https://dash.example.com/trainer",
  runScripts: "dangerously",
  pretendToBeVisual: true,
  virtualConsole,
  beforeParse(window) {
    window.fetch = (url) => {
      const body = String(url).includes("/api/game/plays") ? { ok: true, plays: PLAYS } : {};
      return Promise.resolve({ ok: true, status: 200, json: async () => body, text: async () => "" });
    };
    window.HTMLCanvasElement.prototype.getContext = () => null;
  },
});

const { window } = dom;
const doc = window.document;

await window.loadDataMgrPlays();

// Sort ascending by submit time so rows read chronologically for easy assertions.
doc.getElementById("dmPlaySort").value = "ts_asc";
window.renderDataMgrPlays();

// Column order: [0]ts [1]scenario [2]tier [3]platform [4]nick [5]회차 [6]score ...
const rows = [...doc.querySelectorAll("#dmPlaysBody tr")];
const read = r => {
  const c = r.querySelectorAll("td");
  return { sid: c[1].textContent.trim(), nick: c[4].textContent.trim(),
           attempt: c[5].textContent.trim(), score: c[6].textContent.trim() };
};
const got = rows.map(read);

// user B's single D3_1 play (09:30) is earliest overall
assert.deepEqual(got[0], { sid: "D3_1", nick: "정훈", attempt: "1/1", score: "60.0" });
// user A's three D3_1 plays number 1/3 → 2/3 → 3/3 with rising scores
assert.deepEqual(got[1], { sid: "D3_1", nick: "수미", attempt: "1/3", score: "40.0" });
assert.deepEqual(got[2], { sid: "D3_1", nick: "수미", attempt: "2/3", score: "55.0" });
assert.deepEqual(got[3], { sid: "D3_1", nick: "수미", attempt: "3/3", score: "70.0" });
// user A's D1_1 play is a fresh scenario → 1/1 (count does not leak across scenarios)
assert.deepEqual(got[4], { sid: "D1_1", nick: "수미", attempt: "1/1", score: "90.0" });

// Attempt numbering is stable under sort changes (still 3/3 for the last A/D3_1 play).
doc.getElementById("dmPlaySort").value = "score_desc";
window.renderDataMgrPlays();
const rowsByScore = [...doc.querySelectorAll("#dmPlaysBody tr")].map(read);
const topA = rowsByScore.find(r => r.sid === "D3_1" && r.score === "70.0");
assert.equal(topA.attempt, "3/3", "attempt number stays tied to the play, not the sort order");

// Filtering to one scenario must not change the attempt numbers either.
doc.getElementById("dmPlayScenario").value = "D3_1";
window.renderDataMgrPlays();
const filtered = [...doc.querySelectorAll("#dmPlaysBody tr")].map(read);
assert.ok(filtered.every(r => r.sid === "D3_1"), "scenario filter applied");
assert.equal(filtered.find(r => r.score === "40.0").attempt, "1/3",
  "attempt count is computed over the full cache, not the filtered view");

console.log("PLAYS_ATTEMPT_COLUMN_OK");
window.close();
process.exit(0);
