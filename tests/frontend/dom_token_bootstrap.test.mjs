// Real-DOM test (jsdom): load web/index.html the way a browser would and assert
// the one-time ?token bootstrap behaviour for real, instead of grepping source.
// The inline app script is executed; jsdom-unsupported APIs (fetch/canvas) are
// stubbed in beforeParse so the load-time code runs cleanly.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { JSDOM, VirtualConsole } from "jsdom";

const here = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.resolve(here, "..", "..", "web", "index.html");
const html = readFileSync(htmlPath, "utf-8");

const virtualConsole = new VirtualConsole(); // swallow page console/runtime noise

const dom = new JSDOM(html, {
  url: "https://dash.example.com/trainer?token=s3cr3t-boot&keep=1",
  runScripts: "dangerously",
  pretendToBeVisual: true,
  virtualConsole,
  beforeParse(window) {
    window.fetch = () =>
      Promise.resolve({ ok: true, status: 200, json: async () => ({}), text: async () => "" });
    // Canvas 2D isn't implemented in jsdom; the page only touches it inside
    // render functions, never at load, so a no-op getContext is enough.
    window.HTMLCanvasElement.prototype.getContext = () => null;
  },
});

const { window } = dom;

// 1) The token is persisted for subsequent admin calls.
assert.equal(
  window.localStorage.getItem("craneDashboardToken"),
  "s3cr3t-boot",
  "token should be persisted to localStorage",
);

// 2) It is scrubbed from the visible URL/history so it can't leak via the
//    address bar, referrer, or proxy logs — while unrelated params survive.
assert.ok(!window.location.search.includes("token"), "token must be removed from the URL");
assert.ok(window.location.search.includes("keep=1"), "unrelated query params must be preserved");

// 3) Sanity: the inline app script actually parsed and ran as real JS.
assert.equal(typeof window.gameStart, "function", "gameStart should be defined after load");

dom.window.close();
console.log("DOM_TOKEN_BOOTSTRAP_OK");
