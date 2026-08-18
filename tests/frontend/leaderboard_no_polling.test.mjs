// Regression contract for read volume: the PC leaderboard must never
// schedule a periodic refresh. It still refreshes once on page boot, after a
// submitted play, and when the user presses the explicit refresh button.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.resolve(here, "..", "..", "web", "index.html");
const html = readFileSync(htmlPath, "utf8");

assert.doesNotMatch(
  html,
  /_startLeaderboardPolling|_lbPollTimer|_isLeaderboardTabVisible/,
  "leaderboard polling state and scheduler must stay removed",
);
assert.doesNotMatch(
  html,
  /loadGameLeaderboard\s*\(\s*\/\*silent\*\/\s*true\s*\)/,
  "no silent timer-driven leaderboard refresh may remain",
);
assert.doesNotMatch(
  html,
  /async function loadGameLeaderboard\([^)]*silent|if\s*\(\s*!silent\s*\)/,
  "the removed polling-only silent state must not leak into error handling",
);
assert.match(
  html,
  /renderGameStatsBar\(\);\s*loadGameScenarios\(\);\s*loadGameLeaderboard\(\)/,
  "page boot still performs one leaderboard refresh",
);
assert.match(
  html,
  /async function _celebrateFillRank[\s\S]*?await loadGameLeaderboard\(\);/,
  "a completed general play still refreshes its rank once",
);
assert.match(
  html,
  /onclick="loadGameLeaderboard\(\)"/,
  "the explicit leaderboard refresh button remains available",
);

console.log("LEADERBOARD_NO_POLLING_OK");
