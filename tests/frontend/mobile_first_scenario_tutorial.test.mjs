// The first mobile scenario (the tutorial walkthrough map, level 1) must ALWAYS
// show the tutorial overlay on start — even after the player has dismissed it
// before (TUT_KEY set). Other scenarios keep the first-play-only behavior.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { JSDOM, VirtualConsole } from "jsdom";

const here = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.resolve(here, "..", "..", "web", "game-mobile.html");
const html = readFileSync(htmlPath, "utf-8");
const virtualConsole = new VirtualConsole();

// Minimal but valid session state so applyState + renderPlay run without throwing.
const STATE = {
  session_id: "sess-1",
  cranes: [{ id: "C1", x: 50, y: 50, setup_x: 50, setup_y: 50 }],
  candidates_by_crane: { C1: [] },
  lifts: [],
  restricted_zones: [],
  site_width: 100, site_height: 100,
  raw_counters: { done: 0, total: 3, soft_interference_count: 0 },
  is_done: false, step: 0, undo_count: 0,
};

const dom = new JSDOM(html, {
  url: "https://dash.example.com/game/mobile",
  runScripts: "dangerously",
  pretendToBeVisual: true,
  virtualConsole,
  beforeParse(window) {
    window.matchMedia = () => ({ matches: true, addListener() {}, removeListener() {} });
    window.fetch = (url) => {
      const u = String(url);
      const body = u.includes("/api/game/session/start") ? { ok: true, state: STATE } : { ok: true };
      return Promise.resolve({ ok: true, status: 200, json: async () => body, text: async () => "" });
    };
    window.HTMLCanvasElement.prototype.getContext = () => null;
  },
});

const { window } = dom;
const doc = window.document;
const tutShown = () => doc.getElementById("ovTut").classList.contains("show");

// Simulate a returning player who already dismissed the tutorial.
window.localStorage.setItem("liftops_mobile_tut_v3", "1");

// --- Level 1 (scenIdx 0, walkthrough map): tutorial must ALWAYS show ---
window.eval(`
  G.scenarios = [
    { id: "D1_1", name: "튜토리얼", difficulty: 1, walkthrough: true, num_lifts: 3, num_cranes: 1 },
    { id: "D2_1", name: "표준",   difficulty: 2, walkthrough: false, num_lifts: 5, num_cranes: 2 },
  ];
  G.scen = G.scenarios[0]; G.scenIdx = 0;
`);
await window.startScenario(window.eval("G.scen"));
assert.ok(tutShown(), "level 1 (walkthrough) must show tutorial even after TUT_KEY set");

// --- A later scenario, TUT_KEY already set: tutorial must NOT show ---
window.eval("ovHide('ovTut');");
assert.ok(!tutShown(), "sanity: overlay hidden before second start");
window.eval("G.scen = G.scenarios[1]; G.scenIdx = 1;");
await window.startScenario(window.eval("G.scen"));
assert.ok(!tutShown(), "non-first scenario keeps first-play-only behavior (stays hidden)");

console.log("MOBILE_FIRST_SCENARIO_TUTORIAL_OK");
window.close();
process.exit(0);
