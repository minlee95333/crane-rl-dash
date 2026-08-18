#!/usr/bin/env node
const { spawnSync } = require('child_process');
const path = require('path');

const root = path.resolve(__dirname, '..');
const code = [
  'import json, time',
  'from python_mappo.env import CraneSchedulingEnv',
  'from python_mappo.train import load_cfg',
  "cfg = load_cfg('python_mappo/config.yaml')",
  'env = CraneSchedulingEnv(cfg)',
  'rows = []',
  'for i in range(5):',
  '    t0 = time.perf_counter()',
  "    r = env.run_policy('nearest', seed=301+i)",
  "    rows.append({'seed': 301+i, 'elapsedMs': round((time.perf_counter()-t0)*1000, 3), 'done': r['done'], 'total': r['total'], 'makespan': r['makespan']})",
  'print(json.dumps(rows, indent=2))',
].join('\n');

const proc = spawnSync('python', ['-c', code], {
  cwd: root,
  stdio: 'inherit',
});
process.exit(proc.status ?? 1);
