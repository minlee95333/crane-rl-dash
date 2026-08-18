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

window.eval(`
  renderGame = () => {};
  _gameFx = () => {};
  gameMode = 'pick';
  gameState = {
    step: 2,
    is_done: false,
    cranes: [
      {id:'C1', setup_x:10, setup_y:10},
      {id:'C2', setup_x:20, setup_y:20}
    ],
    candidates_by_crane: {
      C1: [
        {lift_id:'L1', auto_setup_x:11, auto_setup_y:12, lift_x:30, lift_y:30, max_radius:20},
        {lift_id:'L2', auto_setup_x:13, auto_setup_y:14, lift_x:40, lift_y:40, max_radius:20}
      ],
      C2: [
        {lift_id:'L2', auto_setup_x:21, auto_setup_y:22, lift_x:40, lift_y:40, max_radius:20}
      ]
    },
    raw_counters: {done:3, total:5, makespan:42.5, soft_interference_count:2}
  };
  gameSelections = {};
  _gameEvents = [];
  _gameSessStart = Date.now() - 1000;
  _gameStepT0 = Date.now() - 500;
  _gameFirstActionAt = 0;
  _gameSwitchCount = {};
`);

window.gamePick("C1", "L1", "lift_tap");
window.gamePick("C1", "L2", "card");
window.gamePick("C2", "L2", "crane_drag");
window.gamePick("C2", "L2", "crane_drag");

let events = JSON.parse(window.eval("JSON.stringify(_gameEvents)"));
const assignEvents = events.filter((event) => event.type === "assign");
assert.equal(assignEvents[0].action, "set");
assert.equal(assignEvents[0].source, "lift_tap");
assert.equal(assignEvents[1].action, "change");
assert.equal(assignEvents[1].from_lift, "L1");
assert.equal(assignEvents[2].action, "reassign");
assert.equal(assignEvents[2].from_crane, "C1");
assert.equal(assignEvents[2].source, "crane_drag");
assert.equal(events.at(-1).type, "unassign");
assert.equal(events.at(-1).lift, "L2");

window.eval(`
  _gameRecordSetupMove(
    'setup_move',
    {crane:'C1', lift:'L1', x:10, y:20},
    {x:13, y:24},
    'pointer'
  );
`);
events = JSON.parse(window.eval("JSON.stringify(_gameEvents)"));
const setupMove = events.at(-1);
assert.equal(setupMove.type, "setup_move");
assert.equal(setupMove.from_x, 10);
assert.equal(setupMove.to_y, 24);
assert.equal(setupMove.distance, 5);

const commitPayload = JSON.parse(window.eval(`
  gameSelections = {C1:{lift_id:'L1'}, C2:'__idle__'};
  _gameUndoFromSig = 'C1=L2|C2=-';
  JSON.stringify(_gameCommitEventPayload(_gameDecisionSignature(), {done:false}))
`));
assert.equal(commitPayload.decision_sig, "C1=L1|C2=-");
assert.equal(commitPayload.undo_from, "C1=L2|C2=-");
assert.equal(commitPayload.undo_used, false);
assert.ok(commitPayload.decision_ms >= commitPayload.first_action_ms);

const finalPayload = JSON.parse(window.eval(`
  gameState.is_done = true;
  JSON.stringify(_gameFinalEventPayload())
`));
assert.equal(finalPayload.completed, true);
assert.equal(finalPayload.done_count, 3);
assert.equal(finalPayload.total_count, 5);
assert.equal(finalPayload.makespan, 42.5);
assert.equal(finalPayload.soft_interference, 2);

dom.window.close();
console.log("GAME_EVENT_LOGGING_OK");
