// Verifies the tutorial's final "플레이 예시 영상" step: walking Next to the last
// step renders a <video> pointing at the /assets/ demo clip inside a widened
// card, earlier steps render no video, and the last button reads 시작하기.
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
    // jsdom has no media playback; stub play() so autoplay doesn't throw.
    window.HTMLMediaElement.prototype.play = () => Promise.resolve();
  },
});

const { window } = dom;
const doc = window.document;

window.startTutorial();

// TUTORIAL_STEPS is a top-level `const` (lexical binding, not a window
// property) — read it through eval in the page realm.
const steps = window.eval("TUTORIAL_STEPS");
assert.ok(steps.length >= 2, "tutorial has steps");
assert.ok(steps[steps.length - 1].video, "last step carries a video");
assert.ok(
  steps.slice(0, -1).every(s => !s.video),
  "only the last step carries a video"
);

// first step: no video, normal-width card
assert.equal(doc.querySelector(".tutorial-card video"), null, "no video on step 1");
assert.ok(
  !doc.querySelector(".tutorial-overlay").classList.contains("tutorial-wide"),
  "step 1 overlay is not widened"
);

// walk Next to the last step
for (let i = 0; i < steps.length - 1; i++) {
  doc.querySelector(".tutorial-next").click();
}

const overlay = doc.querySelector(".tutorial-overlay");
const video = doc.querySelector(".tutorial-card video");
assert.ok(video, "last step renders a <video>");
assert.ok(
  video.getAttribute("src").includes("/assets/tutorial-play.mp4"),
  "video points at the /assets/ demo clip"
);
assert.ok(video.hasAttribute("controls") && video.hasAttribute("muted"),
  "video is controllable and muted (autoplay policy)");
assert.ok(overlay.classList.contains("tutorial-wide"), "video step widens the card");
assert.equal(
  doc.querySelector(".tutorial-next").textContent.trim(),
  "시작하기",
  "last step button reads 시작하기"
);

// finishing the tutorial removes the overlay
doc.querySelector(".tutorial-next").click();
assert.equal(doc.querySelector(".tutorial-overlay"), null, "overlay closes after finish");

console.log("TUTORIAL_VIDEO_OK");
window.close();
process.exit(0);
