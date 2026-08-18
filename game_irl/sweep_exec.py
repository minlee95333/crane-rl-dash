"""Sweep-step execution, shared by the human game and the IRL trajectory sampler.

A 'sweep' step is the action the collected study data is actually made of: the
player places each crane's setup coordinates, and every reachable lift is then
assigned to its nearest feasible crane and worked nearest-first from that fixed
spot. 1020 of the 1024 plays collected in this study are sweep steps.

This module exists because MaxEnt IRL has to sample its partition function over
the SAME action space the demonstrations live in. Estimating Z from lift-by-lift
'pick' rollouts while the demonstrations are sweeps put the human plays outside
the sampled support entirely — measured on 2026-08-04, 0 of 200 rollouts
reached the median human busy time on 23 of 25 scenarios, and the importance
weights collapsed to an effective sample size of ~1.5. Sharing one executor is
the point: a second implementation that drifts from this one would silently
change what the fitted coefficients mean.

``HumanPlaySession`` delegates to these functions; it does not keep a copy.
"""
from __future__ import annotations

import math
from typing import Dict, Iterable, Optional


def hard_conflict_finish(env, out) -> Optional[float]:
    """Latest liftFinish among already-applied events that HARD-interfere with
    `out` (time overlap + setup-center distance < sum of actual lift radii).
    Used by the sweep to delay a crane past conflicting work. None = no conflict."""
    os_ = out.get('liftStart', out['start'])
    of_ = out.get('liftFinish', out['finish'])
    latest = None
    for e in env.events:
        es = e.get('liftStart', e.get('start', 0.0))
        ef = e.get('liftFinish', e.get('finish', 0.0))
        if not (os_ < ef and es < of_):   # no time overlap
            continue
        cx, cy = e.get('radiusCenterX'), e.get('radiusCenterY')
        if cx is None or cy is None:
            continue
        cd = math.hypot(out['sx'] - cx, out['sy'] - cy)
        if cd < out['actual'] + float(e.get('actualLiftRadius', 0.0)) - 1e-9:
            latest = ef if latest is None else max(latest, ef)
    return latest


def execute_sweep(env, setups: Dict, locked: Optional[Iterable[str]] = None) -> Dict:
    """Assign every reachable not-done lift to the nearest feasible crane (by
    distance from that crane's parked setup, using the 2.5D max_radius +
    rated capacity), then each crane works its lifts nearest-first from the
    fixed setup (so consecutive lifts at the same spot pay no extra travel/
    setup — env's same-radius path). Mutates env; returns the resolved
    per-crane setups actually used, for persistence/replay.

    Skips any lift that would be restricted (e.g. the drag-to-setup path
    crosses a zone) or hard-interfere — those stay not-done for a later step,
    mirroring the RL env's rule of never executing a hard-overlap lift.

    ``locked`` carries the erection-precedence gate. The human session passes
    its ``_locked_ids()``; a caller on a scenario without precedence passes
    nothing.
    """
    targets = {}
    resolved: Dict[str, Dict] = {}
    for ci, c in enumerate(env.cranes):
        s = (setups or {}).get(c.id) or {}
        try:
            sx = float(s.get('setup_x', c.setup_x))
            sy = float(s.get('setup_y', c.setup_y))
        except (TypeError, ValueError):
            sx, sy = c.setup_x, c.setup_y
        targets[ci] = (sx, sy)
        resolved[c.id] = {'setup_x': sx, 'setup_y': sy}
    # nearest feasible crane per lift
    locked = set(locked or ())
    assign = {ci: [] for ci in range(env.nC)}
    for li, l in enumerate(env.lifts):
        if l.done:
            continue
        # Erection precedence: skip members whose prerequisites aren't done
        # yet — they become available in a later sweep wave.
        if l.id in locked:
            continue
        w = float(getattr(l, 'weight_t', 0.0))
        best_ci = None
        best_d = float('inf')
        for ci, (sx, sy) in targets.items():
            c = env.cranes[ci]
            d = math.hypot(sx - l.x, sy - l.y)
            mr = env._lift_max_radius(c, l)
            if mr < -1e-9 or d > mr + 1e-6:
                continue
            # Reach/height infeasibility is already filtered by the mr check
            # above (it derives from the chart). Here only reject a KNOWN rated
            # capacity that's insufficient; cap is None when no curve/chart is
            # configured, which env treats as unconstrained (feasible).
            cap = env._capacity_at(d, env._delta_z(c, l), c)
            if cap is not None and cap + 1e-9 < w:
                continue
            if d < best_d:
                best_d = d
                best_ci = ci
        if best_ci is not None:
            assign[best_ci].append((best_d, li))
    # execute per crane, nearest-first
    for ci in range(env.nC):
        ordered = [li for _, li in sorted(assign[ci], key=lambda t: t[0])]
        if not ordered:
            if env.done_count() < env.nL:
                env.record_idle_step(ci)
            continue
        sx, sy = targets[ci]
        for li in ordered:
            out = env.outcome_for_setup(ci, li, sx, sy)
            if out.get('restricted'):
                continue
            # Resolve hard interference by DELAYING this crane past the conflicting
            # events (two cranes with overlapping swing radii take turns) instead of
            # silently dropping the lift. Bounded retry; each pass clears one overlap.
            tries = 0
            while tries < 16:
                hard, soft = env.risk_counts(out)
                if hard <= 0:
                    break
                cf = hard_conflict_finish(env, out)
                if cf is None or cf <= env.cranes[ci].available + 1e-9:
                    break  # can't resolve by waiting → leave for a later step
                env.cranes[ci].available = cf
                out = env.outcome_for_setup(ci, li, sx, sy)
                tries += 1
            hard, soft = env.risk_counts(out)
            if hard > 0:
                continue
            env.apply_planned_event(ci, li, out, soft=int(soft), hard=0)
    if env.done_count() >= env.nL:
        env._apply_final_teardowns(rewards=None)
    env.step_count += 1
    return resolved
