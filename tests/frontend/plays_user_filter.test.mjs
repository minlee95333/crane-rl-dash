// Verifies the Plays panel user filter (#dmPlayUser): the dropdown is built
// from distinct users in the loaded plays (account user_id first, legacy
// no-account plays keyed by display name, duplicate display names
// disambiguated with a uid prefix), and selecting a user filters the table
// rows by that key — independently of the nickname substring search.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { JSDOM, VirtualConsole } from "jsdom";

const here = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.resolve(here, "..", "..", "web", "index.html");
const html = readFileSync(htmlPath, "utf-8");
const virtualConsole = new VirtualConsole();

// Plays fixture: two accounts (one with 2 plays), one legacy no-account play,
// and a second account sharing the display name "이수미" to exercise dedup.
const PLAYS = [
  { path: "pg:1", user_id: "aaaa1111-0000", display_name: "이수미", nickname: "sumi",
    scenario_id: "D1_1", tier: "general", client: "pc", submitted_at: "2026-07-06T10:00:00",
    done: 3, total: 3, makespan: 100.0, totalScore: 70.0, grade: "B", undo_count: 0 },
  { path: "pg:2", user_id: "aaaa1111-0000", display_name: "이수미", nickname: "sumi",
    scenario_id: "D1_2", tier: "general", client: "pc", submitted_at: "2026-07-06T11:00:00",
    done: 3, total: 3, makespan: 90.0, totalScore: 75.0, grade: "B", undo_count: 1 },
  { path: "pg:3", user_id: "bbbb2222-0000", display_name: "이수미", nickname: "sumi2",
    scenario_id: "D1_1", tier: "expert", client: "mobile", submitted_at: "2026-07-06T12:00:00",
    done: 3, total: 3, makespan: 95.0, totalScore: 72.0, grade: "B", undo_count: 0 },
  { path: "pg:4", user_id: null, display_name: "게스트", nickname: "guest",
    scenario_id: "D1_1", tier: "general", client: "unknown", submitted_at: "2026-07-05T09:00:00",
    done: 1, total: 3, makespan: 40.0, totalScore: 30.0, grade: "D", undo_count: 2 },
];

const dom = new JSDOM(html, {
  url: "https://dash.example.com/trainer",
  runScripts: "dangerously",
  pretendToBeVisual: true,
  virtualConsole,
  beforeParse(window) {
    window.fetch = (url) => {
      const u = String(url);
      const body = u.includes("/api/game/plays") ? { ok: true, plays: PLAYS } : {};
      return Promise.resolve({ ok: true, status: 200, json: async () => body, text: async () => "" });
    };
    window.HTMLCanvasElement.prototype.getContext = () => null;
  },
});

const { window } = dom;
const doc = window.document;

await window.loadDataMgrPlays();

// ── dropdown population ──────────────────────────────────────────────────────
const usel = doc.getElementById("dmPlayUser");
assert.ok(usel, "user filter select must exist");
const opts = [...usel.options].map(o => ({ value: o.value, label: o.textContent }));
assert.equal(opts[0].value, "", "first option is 전체");
assert.equal(opts.length, 4, "전체 + 3 distinct users (2 plays collapse into 1 account)");

const uidA = opts.find(o => o.value === "uid:aaaa1111-0000");
const uidB = opts.find(o => o.value === "uid:bbbb2222-0000");
const guest = opts.find(o => o.value === "nick:게스트");
assert.ok(uidA && uidB && guest, "account keys use uid:, legacy no-account uses nick:");
assert.ok(uidA.label.includes("(2)"), "play count shown per user");
// duplicate display name across two accounts → uid prefix disambiguates
assert.ok(uidA.label.includes("aaaa") && uidB.label.includes("bbbb"),
  "same display name on two accounts gets uid disambiguation");
assert.ok(guest.label.includes("게스트"), "legacy play labeled by display name");

// ── filtering ────────────────────────────────────────────────────────────────
const rowCount = () => {
  const rows = [...doc.querySelectorAll("#dmPlaysBody tr")];
  return (rows.length === 1 && rows[0].textContent.includes("필터 결과 없음")) ? 0 : rows.length;
};

assert.equal(rowCount(), 4, "no filter → all plays listed");

usel.value = "uid:aaaa1111-0000";
window.renderDataMgrPlays();
assert.equal(rowCount(), 2, "account filter keeps only that user's plays");

usel.value = "nick:게스트";
window.renderDataMgrPlays();
assert.equal(rowCount(), 1, "legacy display-name key matches the no-account play");

// user filter + nickname search compose (AND)
usel.value = "uid:aaaa1111-0000";
doc.getElementById("dmPlayNick").value = "없는닉네임";
window.renderDataMgrPlays();
assert.equal(rowCount(), 0, "user filter AND nickname search compose");
doc.getElementById("dmPlayNick").value = "";

// reload keeps the current selection when the user still exists
usel.value = "uid:bbbb2222-0000";
await window.loadDataMgrPlays();
assert.equal(usel.value, "uid:bbbb2222-0000", "selection survives a refresh");

console.log("PLAYS_USER_FILTER_OK");
window.close();
process.exit(0);
