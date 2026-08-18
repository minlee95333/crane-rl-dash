// Verifies the in-play restricted-zone guidance box: geometry detection
// (_gameZoneViolation) and the show/hide DOM wiring (#gameZoneWarn). The crane
// puzzle blocks — never auto-detours — moves that enter or cross a 제한구역, so
// this box pre-warns the user before the server rejects the move.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { JSDOM, VirtualConsole } from "jsdom";

const here = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.resolve(here, "..", "..", "web", "index.html");
const html = readFileSync(htmlPath, "utf-8");
const virtualConsole = new VirtualConsole();

const dom = new JSDOM(html, {
  url: "https://dash.example.com/trainer",
  runScripts: "dangerously",
  pretendToBeVisual: true,
  virtualConsole,
  beforeParse(window) {
    window.fetch = () =>
      Promise.resolve({ ok: true, status: 200, json: async () => ({}), text: async () => "" });
    window.HTMLCanvasElement.prototype.getContext = () => null;
  },
});

const { window } = dom;

// `gameState` is a top-level `let` in the page script (a lexical binding, not a
// window property), so assign it through eval in the page realm so the helpers
// close over the same binding. A single 20×20 restricted zone sits mid-site with
// C1 parked at a corner so a straight run to the far corner must cross it.
const setZones = (zonesJson) =>
  window.eval(
    `gameState = { restricted_zones: ${zonesJson}, cranes: [{ id: "C1", setup_x: 10, setup_y: 10 }] };`
  );
setZones(`[{ id: "RZ1", x1: 40, y1: 40, x2: 60, y2: 60 }]`);

// ── geometry: _gameZoneViolation(fromX, fromY, toX, toY) ────────────────────
// setup point dropped INSIDE the zone → 'inside'
assert.equal(window._gameZoneViolation(10, 10, 50, 50), "inside");
// straight path from the parked corner crosses the zone diagonally → 'cross'
assert.equal(window._gameZoneViolation(10, 10, 90, 90), "cross");
// path that stays clear of the zone (up the left edge) → null
assert.equal(window._gameZoneViolation(10, 10, 10, 90), null);
// endpoint outside and segment misses the zone entirely → null
assert.equal(window._gameZoneViolation(10, 10, 30, 10), null);
// no "from" point (e.g. unknown crane) but endpoint inside still flags 'inside'
assert.equal(window._gameZoneViolation(null, null, 50, 50), "inside");

// With no zones configured, never warns.
setZones("[]");
assert.equal(window._gameZoneViolation(10, 10, 90, 90), null);
setZones(`[{ id: "RZ1", x1: 40, y1: 40, x2: 60, y2: 60 }]`);

// ── DOM wiring: #gameZoneWarn box show/hide ─────────────────────────────────
const box = window.document.getElementById("gameZoneWarn");
const title = window.document.getElementById("gameZoneWarnTitle");
assert.ok(box, "guidance box element must exist");
assert.ok(!box.classList.contains("show"), "box starts hidden");

window._showGameZoneWarn("inside");
assert.ok(box.classList.contains("show"), "box visible after inside violation");
// Computed display must actually flip to flex — guards the CSS specificity bug
// where the base `display:none` rule outranks a too-weak `.show` selector.
assert.equal(
  window.getComputedStyle(box).display,
  "flex",
  "shown box must compute display:flex (CSS specificity must let .show win)"
);
assert.ok(title.textContent.includes("설치할 수 없습니다"), "inside copy shown");

window._showGameZoneWarn("cross");
assert.ok(title.textContent.includes("가로지르는"), "cross copy shown");

window._hideGameZoneWarn();
assert.ok(!box.classList.contains("show"), "box hidden after _hideGameZoneWarn");

// _updateGameZoneWarn drives the box straight from coordinates.
window._updateGameZoneWarn(10, 10, 50, 50); // inside
assert.ok(box.classList.contains("show"), "update shows box on violation");
window._updateGameZoneWarn(10, 10, 10, 90); // clear
assert.ok(!box.classList.contains("show"), "update hides box when path is clear");

console.log("RESTRICTED_ZONE_WARN_OK");
// Tear down the jsdom realm so its deferred page timers (which draw to a
// stubbed null canvas context) can't fire an async crash after the checks pass.
window.close();
process.exit(0);
