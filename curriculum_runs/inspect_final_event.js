#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const resultPath = path.resolve(__dirname, '..', 'python_mappo', 'final_baseline', 'curriculum_mappo_result.json');
const result = JSON.parse(fs.readFileSync(resultPath, 'utf8'));
const levels = result.levels || [];
const last = levels[levels.length - 1] || {};
const sample = last.representative?.mappo?.events?.find((e) =>
  Number.isFinite(+e.actualLiftRadius) &&
  Number.isFinite(+e.radiusCenterX) &&
  Number.isFinite(+e.liftX) &&
  Math.hypot((+e.radiusCenterX) - (+e.liftX), (+e.radiusCenterY) - (+e.liftY)) > 1e-6
);

console.log(JSON.stringify({
  resultPath: path.relative(path.resolve(__dirname, '..'), resultPath),
  level: last.level?.name || last.level?.level?.name || null,
  foundEventWithDistinctRadiusCenter: Boolean(sample),
  sample: sample ? {
    craneId: sample.craneId,
    liftId: sample.liftId,
    radiusCenter: [sample.radiusCenterX, sample.radiusCenterY],
    lift: [sample.liftX, sample.liftY],
    actualLiftRadius: sample.actualLiftRadius,
    craneRadius: sample.craneRadius,
  } : null,
}, null, 2));
