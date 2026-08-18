// Regression contract: pressing "IRL 재추정 실행" on the dashboard failed with
//   실패: Unexpected token 'u', "upstream error" is not valid JSON
// Two separate defects produced that message:
//
//   1. The endpoint ran the whole MaxEnt fit inside the HTTP request (>10 min
//      on the study cohort), so the connection timed out and the browser was
//      handed the plain text "upstream error". The page must now START a run
//      and poll for it.
//   2. The response was fed to r.json() unconditionally, so a non-JSON body
//      surfaced as a parser complaint naming neither the endpoint nor the HTTP
//      status — which is why the real cause stayed hidden.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.resolve(here, "..", "..", "web", "index.html");
const html = readFileSync(htmlPath, "utf8");

const runFn = html.match(/async function runIrlFromDataMgr\(\)[\s\S]*?\n}/);
assert.ok(runFn, "runIrlFromDataMgr must still exist");
const runBody = runFn[0];

// --- 1. The run is started, not awaited -------------------------------------
assert.doesNotMatch(
  runBody,
  /const\s+data\s*=\s*await\s+r\.json\(\)/,
  "the run response must not be parsed with a bare r.json()",
);
assert.match(
  runBody,
  /_jsonOrThrow\(r,/,
  "the run response must go through the non-JSON-aware reader",
);
assert.match(
  runBody,
  /_dmIrlStartPolling\(\)/,
  "starting a run must hand off to the poller instead of awaiting the fit",
);
assert.doesNotMatch(
  runBody,
  /data\.prior/,
  "the POST no longer carries the prior — it arrives via the status poll",
);

// A run already in flight must be attached to, not reported as a failure.
assert.match(
  runBody,
  /r\.status\s*===\s*409/,
  "a 409 (run already in flight) must reattach to the running job",
);

// --- 2. Non-JSON responses are reported honestly ----------------------------
const reader = html.match(/async function _jsonOrThrow\([\s\S]*?\n}/);
assert.ok(reader, "_jsonOrThrow helper must exist");
assert.match(
  reader[0],
  /await r\.text\(\)/,
  "the body must be read as text so a non-JSON payload can be shown",
);
assert.match(
  reader[0],
  /HTTP \$\{r\.status\}/,
  "a non-JSON response must report the HTTP status, not just a parser error",
);

// --- 3. Polling exists, is bounded, and stops -------------------------------
const poller = html.match(/function _dmIrlStartPolling\(\)[\s\S]*?\n}/);
assert.ok(poller, "_dmIrlStartPolling must exist");
assert.match(
  poller[0],
  /\/api\/game\/irl\/run\/status/,
  "the poller must read the dedicated status endpoint",
);
assert.match(
  poller[0],
  /clearInterval\(_dmIrlPollTimer\)/,
  "the poller must stop once the job is no longer running",
);
assert.match(
  poller[0],
  /if\(_dmIrlPollTimer\) return;/,
  "a second start must not stack a second interval",
);

// --- 4. A reload mid-run reattaches -----------------------------------------
assert.match(
  html,
  /async function resumeIrlRunIfActive\(\)/,
  "a run in flight must survive a page reload",
);
assert.match(
  html,
  /async function loadDmIrlAnalysis\(\)[\s\S]*?resumeIrlRunIfActive\(\)/,
  "opening the analysis panel must reattach to a run already in flight",
);

console.log("IRL_RUN_ASYNC_OK");
