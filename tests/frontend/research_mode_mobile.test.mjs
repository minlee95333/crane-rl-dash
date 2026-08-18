import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { JSDOM, VirtualConsole } from "jsdom";

const here = path.dirname(fileURLToPath(import.meta.url));
const html = readFileSync(path.resolve(here, "..", "..", "web", "game-mobile.html"), "utf8");
const starts = [];
const STATE = {
  session_id: "research-session",
  cranes: [{ id: "C1", x: 10, y: 10, setup_x: 10, setup_y: 10 }],
  candidates_by_crane: { C1: [] },
  lifts: [],
  restricted_zones: [],
  site_width: 100,
  site_height: 100,
  raw_counters: { done: 0, total: 1, soft_interference_count: 0 },
  is_done: false,
  step: 0,
};

const dom = new JSDOM(html, {
  url: "https://dash.example.com/game/mobile",
  runScripts: "dangerously",
  pretendToBeVisual: true,
  virtualConsole: new VirtualConsole(),
  beforeParse(window) {
    window.matchMedia = () => ({ matches: true, addListener() {}, removeListener() {} });
    window.HTMLCanvasElement.prototype.getContext = () => null;
    window.fetch = async (url, init = {}) => {
      const u = String(url);
      let body = {};
      if (init.body) body = JSON.parse(init.body);
      if (u.includes("/api/auth/me")) {
        return response({ ok: true, user: { id: "user-1", display_name: "student", role: "대학생·3학년" } });
      }
      if (u.includes("/api/game/research/status")) {
        return response({
          ok: true,
          study: { eligibility: "대학생" },
          // has_signature: 서명 보충 게이트(ensureResearchSignature)가 시나리오
          // 시작을 가로채지 않도록 서명을 마친 참여자로 둔다. 그 게이트 자체는
          // tests/frontend/research_signature_topup.test.mjs가 검증한다.
          participation: {
            participant_id: "part-1", active: true, consent_version: "draft-v0",
            profile: {}, has_signature: true,
          },
          progress: {
            scenario_sequence: ["D1_1", "FLEET_1"],
            unlocked_index: 0,
            completed_scenarios: [],
            completed_count: 0,
            total_count: 2,
          },
        });
      }
      if (u.endsWith("/api/game/scenarios")) {
        return response({ ok: true, scenarios: [
          { id: "D1_1", name: "첫 단계", difficulty: 1, num_lifts: 1, num_cranes: 1 },
          { id: "FLEET_1", name: "장비 단계", difficulty: 4, num_lifts: 2, num_cranes: 2, crane_choice: {} },
        ] });
      }
      if (u.includes("/api/game/session/start")) {
        starts.push(body);
        return response({ ok: true, state: STATE, play_purpose: "research" });
      }
      return response({ ok: true });
    };
  },
});

function response(data) {
  return { ok: true, status: 200, json: async () => data, text: async () => JSON.stringify(data) };
}
const waitFor = async predicate => {
  for (let i = 0; i < 50; i += 1) {
    if (predicate()) return;
    await new Promise(resolve => setTimeout(resolve, 10));
  }
  throw new Error("timed out waiting for mobile UI");
};

const { window } = dom;
await waitFor(() => window.document.getElementById("scrLevels").classList.contains("active"));
window.eval("setMobileResearchMode(true)");

const cards = [...window.document.querySelectorAll("#lvGrid .lv-card")];
assert.equal(cards.length, 2, "research sequence includes the normally hidden FLEET stage");
assert.equal(cards[0].disabled, false);
assert.equal(cards[1].disabled, true, "later adventure stage stays locked");
assert.match(cards[0].textContent, /현재/);
assert.match(cards[1].textContent, /잠김/);

await window.startScenario(window.eval("G.levels[0]"));
assert.equal(starts.length, 1);
assert.equal(starts[0].research_mode, true, "only the enabled future session is marked research");
assert.equal(window.eval("G.playPurpose"), "research", "client trusts server-confirmed purpose");

console.log("RESEARCH_MODE_MOBILE_OK");
window.close();
