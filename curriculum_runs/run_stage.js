#!/usr/bin/env node
const path = require('path');

const root = path.resolve(__dirname, '..');

console.error([
  'run_stage.js is a retired browser-engine training helper.',
  '',
  'The in-browser MAPPO trainer it depended on has been removed from crane_script.js.',
  'Use the maintained PyTorch curriculum trainer instead:',
  '',
  `  cd ${root}`,
  '  python -m python_mappo.curriculum --episodes 60 90 120 --outdir python_mappo/outputs_curriculum',
].join('\n'));
process.exit(2);
