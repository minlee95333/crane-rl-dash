#!/usr/bin/env node
const path = require('path');

const root = path.resolve(__dirname, '..');

console.error([
  'run_eval.js is a retired browser-engine evaluation helper.',
  '',
  'The legacy JSON model format in curriculum_runs/model_stage*.json is not compatible',
  'with the maintained PyTorch MAPPO evaluator. Evaluate a .pt checkpoint instead:',
  '',
  `  cd ${root}`,
  '  python -m python_mappo.evaluate --model python_mappo/final_baseline/curriculum_mappo_model.pt --seed-start 201 --seed-count 30',
].join('\n'));
process.exit(2);
