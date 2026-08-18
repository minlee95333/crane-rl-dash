// Mobile client parity with the desktop change: the submit-completion popup
// (showWin in game-mobile.html) must show the total score + grade but NOT the
// per-category weighted-score bars — that breakdown is admin-only via Plays 상세.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { JSDOM, VirtualConsole } from "jsdom";

const here = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.resolve(here, "..", "..", "web", "game-mobile.html");
const html = readFileSync(htmlPath, "utf-8");
const virtualConsole = new VirtualConsole();

const dom = new JSDOM(html, {
  url: "https://dash.example.com/game/mobile",
  runScripts: "dangerously",
  pretendToBeVisual: true,
  virtualConsole,
  beforeParse(window) {
    // game-mobile.html reads matchMedia at top level (REDUCED) and boot() fetches
    // /api/auth/me — stub both so the page script initializes cleanly in jsdom.
    window.matchMedia = () => ({ matches: true, addListener() {}, removeListener() {} });
    window.fetch = () =>
      Promise.resolve({ ok: true, status: 200, json: async () => ({}), text: async () => "" });
    window.HTMLCanvasElement.prototype.getContext = () => null;
  },
});

const { window } = dom;
const doc = window.document;

// No scenario in play → showWin skips the live-rank fetch path. `G` is a
// top-level const (lexical binding, not a window property) so clear scen via
// eval in the page realm.
window.eval("G.scen = null");
window.showWin({
  scorer_snapshot: {
    totalScore: 72.3,
    grade: "A",
    categories: {
      completion:       { score: 100, weight: 0.4, weighted: 40 },
      makespan:         { score: 70,  weight: 0.25, weighted: 17.5 },
      softInterference: { score: 80,  weight: 0.15, weighted: 12 },
      jobBalance:       { score: 60,  weight: 0.1,  weighted: 6 },
      timeBalance:      { score: 55,  weight: 0.1,  weighted: 5.5 },
    },
  },
});

// Category bars gone: container emptied + hidden, no .score-cat elements.
const catsHost = doc.getElementById("winScoreCats");
assert.ok(catsHost, "winScoreCats container still exists");
assert.equal(catsHost.querySelectorAll(".score-cat").length, 0,
  "no per-category bars in the mobile completion popup");
assert.equal(catsHost.innerHTML.trim(), "", "category container is emptied");
assert.equal(catsHost.style.display, "none", "category container is hidden");

// Total score + grade still shown to the user.
assert.equal(doc.getElementById("winScore").textContent, "72.3", "총점 still shown");
assert.equal(doc.getElementById("winGrade").textContent, "A", "등급 still shown");

console.log("MOBILE_WIN_NO_CATEGORY_BARS_OK");
window.close();
process.exit(0);
