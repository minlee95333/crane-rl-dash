#!/usr/bin/env node
const { spawnSync } = require('child_process');
const path = require('path');

const root = path.resolve(__dirname, '..');
const code = [
  'import cProfile, io, pstats',
  'from python_mappo.env import CraneSchedulingEnv',
  'from python_mappo.train import load_cfg',
  "cfg = load_cfg('python_mappo/config.yaml')",
  'env = CraneSchedulingEnv(cfg)',
  'prof = cProfile.Profile()',
  "prof.enable(); env.run_policy('nearest', seed=301); prof.disable()",
  's = io.StringIO()',
  "pstats.Stats(prof, stream=s).sort_stats('cumtime').print_stats(20)",
  'print(s.getvalue())',
].join('\n');

const proc = spawnSync('python', ['-c', code], {
  cwd: root,
  stdio: 'inherit',
});
process.exit(proc.status ?? 1);
