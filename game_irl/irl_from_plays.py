"""Standard MaxEnt IRL on human crane-game demonstrations.

Reads submitted human plays and fits the 7 training reward coefficients used
by ``CraneSchedulingEnv``:

    r_single, r_all, r_same, p_idle, p_inter_soft, p_time, p_move

Model (Ziebart et al. 2008, trajectory formulation): each submitted play is an
expert demonstration tau with feature vector phi(tau), and the expert is
assumed soft-optimal over the SAME action space MAPPO trains on:

    P(tau) = exp(theta . phi(tau)) / Z_s,   Z_s = sum over ALL trajectories
                                                  of scenario s

Unlike the previous *conditional* variant, the normalizer is not a small
per-demonstration candidate pool — it runs over the scenario's full trajectory
space. Because that space is combinatorial (up to 3 cranes x 17 lifts), Z_s is
estimated by self-normalized importance sampling: M rollouts are drawn from
the uniform-random policy q (each free crane picks uniformly among its feasible
candidates), whose trajectory probability q(tau) = prod_t prod_c 1/|A_{t,c}| is
recorded exactly during the rollout, giving

    Z_s ~= (1/M) sum_i exp(theta . phi_i) / q_i.

The gradient is then the textbook feature-matching residual
E_demo[phi] - E_theta[phi]. Dynamics are deterministic, so the model is a
distribution over joint action sequences. Bootstrap resampling of
demonstrations gives confidence intervals, which ``auto_reward_opt`` can use
to narrow its Optuna search bounds.

Known limitation: the uniform proposal thins out around very high-reward
trajectories, so Z is noisier there; the L2 prior around the current reward
scale keeps the fit anchored. Per-scenario effective sample sizes are reported
so low-coverage fits are visible.
"""
from __future__ import annotations

import argparse
import json
import math
import random
import sys
import time
import zlib
from pathlib import Path
from typing import Callable, Dict, Iterable, List, Optional, Sequence, Tuple

import numpy as np

try:
    from crane_core.env import CraneSchedulingEnv
    from crane_core.scenarios import get_scenario
    from .human_play import PLAYS_DIR, ROOT, load_play, load_plays, list_plays
except ImportError:
    from crane_core.env import CraneSchedulingEnv
    from crane_core.scenarios import get_scenario
    from human_play import PLAYS_DIR, ROOT, load_play, load_plays, list_plays


FEATURE_NAMES = [
    "r_single",
    "r_all",
    "r_same",
    "p_idle",
    "p_inter_soft",
    "p_time",
    "p_move",
]

# Same defaults as rl_trainer/config.yaml. Kept local so game IRL still works in
# lightweight deployments where PyTorch/rl_trainer imports may be unavailable.
DEFAULT_REWARD_COEFS = {
    "r_single": 10.0,
    "r_all": 100.0,
    "r_same": 3.0,
    "p_idle": -0.5,
    "p_inter_soft": -3.0,
    "p_time": -0.1,
    "p_move": -0.02,
}

# Fit dimensionless multipliers around the current reward scale, then convert
# back to raw reward coefficients. This preserves reward-space units while
# keeping the optimizer well-conditioned across count/time/distance features.
COEF_SCALE = {k: max(abs(v), 1e-9) for k, v in DEFAULT_REWARD_COEFS.items()}
PRIOR_THETA = np.array(
    [DEFAULT_REWARD_COEFS[k] / COEF_SCALE[k] for k in FEATURE_NAMES],
    dtype=np.float64,
)
SCALE_VEC = np.array([COEF_SCALE[k] for k in FEATURE_NAMES], dtype=np.float64)


# ---------------------------------------------------------------------------
# Feature extraction

def _event_busy_time(e: Dict) -> float:
    return (
        float(e.get("teardown", 0.0) or 0.0)
        + float(e.get("travel", 0.0) or 0.0)
        + float(e.get("setup", 0.0) or 0.0)
        + float(e.get("duration", 0.0) or 0.0)
        + float(e.get("finalTeardown", 0.0) or 0.0)
    )


def _infer_idle_from_actions(doc: Dict) -> int:
    """Best-effort legacy fallback for plays saved before idle counters existed."""
    actions = doc.get("actions") or []
    if not isinstance(actions, list):
        return 0
    idle = 0
    for step in actions:
        if not isinstance(step, dict):
            continue
        for decision in step.values():
            if decision in (None, "", "__idle__"):
                idle += 1
            elif isinstance(decision, dict) and not (decision.get("lift_id") or decision.get("liftId")):
                idle += 1
    return idle


def _phi_from_result(result: Dict, fallback_doc: Optional[Dict] = None) -> np.ndarray:
    """7-dim raw reward feature vector for one trajectory.

    The vector is the coefficient-free part of the environment reward:

      reward = coef · phi

    Costs are represented as positive magnitudes; their coefficients are
    expected to be negative if the demonstrations avoid them.
    """
    events = result.get("events") or []
    total = int(result.get("total") or len(result.get("lifts") or []))
    done = int(result.get("done") or len({e.get("liftId") for e in events if e.get("liftId") is not None}))
    soft = result.get("softInter")
    if soft is None:
        soft = result.get("soft")
    if soft is None:
        soft = sum(int(e.get("softConflict", 0) or 0) for e in events)
    idle = result.get("idleStepsTotal")
    if idle is None:
        raw = result.get("raw") if isinstance(result.get("raw"), dict) else {}
        idle = raw.get("idle_steps_total") if raw else None
    if idle is None and fallback_doc is not None:
        outcome = fallback_doc.get("outcome") or {}
        raw = outcome.get("raw") if isinstance(outcome.get("raw"), dict) else {}
        idle = raw.get("idle_steps_total")
    if idle is None and fallback_doc is not None:
        idle = _infer_idle_from_actions(fallback_doc)
    if idle is None:
        idle = 0

    vec = np.array([
        float(len(events) or done),
        1.0 if total > 0 and done >= total else 0.0,
        float(sum(1 for e in events if e.get("sameRadius"))),
        float(idle or 0.0),
        float(soft or 0.0),
        float(sum(_event_busy_time(e) for e in events)),
        float(sum(float(e.get("move", 0.0) or 0.0) for e in events)),
    ], dtype=np.float64)
    vec[~np.isfinite(vec)] = 0.0
    return vec


def _result_from_play_doc(doc: Dict) -> Dict:
    outcome = doc.get("outcome") or {}
    raw = outcome.get("raw") if isinstance(outcome.get("raw"), dict) else {}
    layout = doc.get("layout") or {}
    return {
        "events": outcome.get("events") or [],
        "makespan": outcome.get("makespan", 0.0),
        "done": outcome.get("done", 0),
        "total": outcome.get("total", 0),
        "softInter": raw.get("soft_interference_count", 0),
        "idleStepsTotal": raw.get("idle_steps_total"),
        "idleStepsPerCrane": raw.get("idle_steps_per_crane") or [],
        "cranes": [{"id": c.get("id")} for c in layout.get("cranes") or []],
        "lifts": layout.get("lifts") or [],
        "restrictedZones": layout.get("restrictedZones") or [],
    }


def _params_from_scenario(scenario_id: str, fallback_doc: Optional[Dict] = None) -> Dict:
    scen = get_scenario(scenario_id)
    if scen and scen.get("config"):
        cfg = scen["config"]
    elif fallback_doc and fallback_doc.get("config"):
        cfg = fallback_doc["config"]
    else:
        cfg = {}
    return {
        "fixed_duration": cfg.get("fixed_duration", 25.0),
        "setup_time": cfg.get("setup_time", 10.0),
        "teardown_time": cfg.get("teardown_time", 5.0),
        "num_cranes": len(scen["layout"]["cranes"]) if scen else None,
        "num_lifts": len(scen["layout"]["lifts"]) if scen else None,
    }


# ---------------------------------------------------------------------------
# Trajectory sources

def _load_play_entries(plays_dir: Path, tier: Optional[str] = None) -> List[Tuple[Dict, Dict]]:
    """Load summaries and docs from storage or an explicitly supplied directory."""
    requested = Path(plays_dir).resolve()
    if requested == Path(PLAYS_DIR).resolve():
        out: List[Tuple[Dict, Dict]] = []
        # The live unified store may also contain ordinary and legacy plays.
        # Only explicitly consented research submissions are eligible for IRL.
        summaries = list_plays(tier=tier, play_purpose="research")
        # Fetch the docs in one batched pass. Asking per play cost one round trip
        # each — 159 s of pure network wait for this study's 829 research plays,
        # which is most of why the dashboard's re-estimate button never returned.
        docs = load_plays([s.get("path") for s in summaries if s.get("path")])
        for summary in summaries:
            doc = docs.get(summary.get("path"))
            if doc:
                out.append((summary, doc))
        return out

    if not requested.exists() or not requested.is_dir():
        return []
    out = []
    for path in sorted(requested.rglob("*.json")):
        try:
            doc = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            continue
        if not isinstance(doc, dict):
            continue
        meta = doc.get("meta") if isinstance(doc.get("meta"), dict) else {}
        play_tier = meta.get("tier") or "unknown"
        if tier and play_tier != tier:
            continue
        summary = {
            "path": str(path),
            "scenario_id": meta.get("scenario_id") or "unknown",
            "tier": play_tier,
            # Carried so an explicit directory behaves like the live store for
            # participant attribution (repeat-attempt collapsing, cohort stats).
            "user_id": meta.get("user_id"),
            "participant_id": meta.get("participant_id"),
            "attempt_no": meta.get("attempt_no"),
            "play_seconds": meta.get("play_seconds"),
            "submitted_at": meta.get("submitted_at"),
        }
        out.append((summary, doc))
    return out


def _is_fleet_choice_scenario(scenario_id: str) -> bool:
    """True for fleet-sizing maps (spec carries ``crane_choice`` — the player
    picks the crane count before starting). Built-in registry lookup only:
    user (usr_) scenarios never carry the flag, so no storage round-trip."""
    try:
        from crane_core.scenarios import SCENARIOS
        s = SCENARIOS.get(str(scenario_id))
    except Exception:
        return False
    return bool(s and s.get("crane_choice"))


def _participant_key(summary: Dict) -> str:
    """Stable per-person id, or '' when the play cannot be attributed."""
    return str(summary.get("user_id") or summary.get("participant_id") or "").strip()


def _attempt_rank(summary: Dict):
    """Sort key picking the latest attempt: attempt_no first, then submit time."""
    try:
        attempt = int(summary.get("attempt_no") or 0)
    except (TypeError, ValueError):
        attempt = 0
    return (attempt, str(summary.get("submitted_at") or ""), str(summary.get("path") or ""))


def _collapse_repeat_attempts(entries: List[Tuple[Dict, Dict]]) -> Tuple[List[Tuple[Dict, Dict]], int]:
    """Keep one demonstration per (participant, scenario) — the latest attempt.

    A participant may replay a scenario as often as they like (the study lock
    only requires the *previous* stage to be complete). Feeding every retry to
    MaxEnt weights that one person's preference by how stubborn they were,
    which is a property of the participant, not of the coefficients we want.
    Plays without an identifiable participant are all kept: they may well come
    from different people and collapsing them would silently discard data.
    """
    best: Dict[Tuple[str, str], Tuple[Dict, Dict]] = {}
    kept: List[Tuple[Dict, Dict]] = []
    dropped = 0
    for summary, doc in entries:
        person = _participant_key(summary)
        if not person:
            kept.append((summary, doc))
            continue
        key = (person, str(summary.get("scenario_id") or "unknown"))
        prev = best.get(key)
        if prev is None:
            best[key] = (summary, doc)
            continue
        dropped += 1
        if _attempt_rank(summary) > _attempt_rank(prev[0]):
            best[key] = (summary, doc)
    kept.extend(best.values())
    return kept, dropped


def cohort_summary(rows: List[Dict]) -> Dict:
    """Who the demonstrations actually came from.

    ``n_human`` alone cannot distinguish 40 plays from 40 people versus 40 plays
    from 3 very keen ones — and only the first supports a population claim.
    """
    people = [str(r.get("user_id") or "") for r in rows]
    identified = [p for p in people if p]
    per_person: Dict[str, int] = {}
    for p in identified:
        per_person[p] = per_person.get(p, 0) + 1
    seconds = sorted(
        float(r["play_seconds"]) for r in rows
        if isinstance(r.get("play_seconds"), (int, float))
    )
    def pct(q: float):
        """Nearest-rank percentile; None when no play carries a duration."""
        if not seconds:
            return None
        idx = min(len(seconds) - 1, max(0, int(round(q * (len(seconds) - 1)))))
        return round(seconds[idx], 1)

    # Percentiles, not just the median: the --min-play-seconds floor is chosen by
    # looking for the gap between the speed-run tail and the honest bulk, which
    # only shows up in the low quantiles.
    return {
        "n_demos": len(rows),
        "n_participants": len(per_person),
        "n_unattributed_demos": len(people) - len(identified),
        "max_demos_per_participant": max(per_person.values()) if per_person else 0,
        "n_repeat_attempts_dropped": int(rows[0].get("_repeat_dropped", 0)) if rows else 0,
        "median_play_seconds": pct(0.5),
        "min_play_seconds": pct(0.0),
        "play_seconds_p05": pct(0.05),
        "play_seconds_p10": pct(0.10),
        "play_seconds_p25": pct(0.25),
        "n_timed_demos": len(seconds),
    }


def load_human_trajectories(plays_dir: Path, tier: Optional[str] = None,
                            min_play_seconds: float = 0.0,
                            collapse_repeats: bool = True) -> List[Dict]:
    """Human demonstrations eligible for MaxEnt fitting.

    ``min_play_seconds`` optionally drops speed-run submissions (a bot or a
    bored visitor clicking the first candidate). It defaults to 0 — off —
    because the honest floor depends on the scenario set, and silently
    discarding participant data is the researcher's call, not the loader's.

    ``collapse_repeats`` keeps the default one-demo-per-(participant, scenario)
    rule. Turning it off fits every attempt, which raises n but lets the most
    persistent participants carry proportionally more weight — a property of
    the participant, not of the coefficients. It is exposed so that trade-off
    can be measured rather than assumed; ``cohort`` reports the resulting
    per-participant load either way.
    """
    out = []
    skipped_fleet = 0
    skipped_incomplete = 0
    skipped_fast = 0
    entries = _load_play_entries(plays_dir, tier=tier)
    if collapse_repeats:
        entries, repeat_dropped = _collapse_repeat_attempts(entries)
    else:
        repeat_dropped = 0
    for summary, doc in entries:
        ref = summary.get("path")
        scen_id = summary.get("scenario_id") or "unknown"
        # Fleet-sizing (crane_choice) plays are EXCLUDED from IRL fitting: the
        # crane count varies per play, while the Z-estimate trajectory space is
        # sampled on the scenario's DEFAULT fleet (sample_trajectory_space
        # reads get_scenario's layout). Comparing e.g. a 1-crane human phi
        # against a 2-crane partition function mismatches idle/time/move
        # features systematically and would bias the coefficient estimate.
        # Skipping here also keeps the scenario out of scenarios_seen, so no
        # rollouts are sampled for it. The play docs still record the
        # count/placement choice (outcome.cost, layout.cranes) for future
        # dedicated fitting.
        if _is_fleet_choice_scenario(scen_id):
            skipped_fleet += 1
            continue
        result = _result_from_play_doc(doc)
        # Aborted plays (done < total) live OUTSIDE the model's trajectory
        # space: every sampled rollout runs to completion, so the completion
        # features (r_single/r_all) are constant in the Z estimate and an
        # incomplete demo would push those coefficients to the prior-limited
        # extreme instead of expressing a real preference. Exclude them.
        total_lifts = int(result.get("total") or 0)
        if total_lifts > 0 and int(result.get("done") or 0) < total_lifts:
            skipped_incomplete += 1
            continue
        play_seconds = summary.get("play_seconds")
        if min_play_seconds > 0 and isinstance(play_seconds, (int, float)) \
                and float(play_seconds) < min_play_seconds:
            skipped_fast += 1
            continue
        phi = _phi_from_result(result, fallback_doc=doc)
        out.append({
            "scenario_id": scen_id,
            "source": "human",
            "tier": summary.get("tier") or "unknown",
            "path": ref,
            "user_id": _participant_key(summary),
            "attempt_no": summary.get("attempt_no"),
            "play_seconds": play_seconds,
            "phi": phi,
            "outcome": result,
            # Loader-level diagnostic, not a trajectory feature: cohort_summary
            # reads it so the count survives without a second return value.
            "_repeat_dropped": repeat_dropped,
        })
    if repeat_dropped:
        print(f"[irl_from_plays] 동일 참가자의 같은 시나리오 재도전 {repeat_dropped}건을 "
              f"IRL 적합에서 제외했습니다 (참가자·시나리오당 최신 1건만 사용)",
              file=sys.stderr)
    if skipped_fast:
        print(f"[irl_from_plays] play_seconds < {min_play_seconds:g}s 인 play "
              f"{skipped_fast}건을 제외했습니다 (무성의 제출 필터)", file=sys.stderr)
    if skipped_fleet:
        print(f"[irl_from_plays] fleet-choice(crane_choice) play {skipped_fleet}건을 "
              f"IRL 적합에서 제외했습니다 (대수 가변 — 기본 fleet 궤적 공간과 비교 불가)",
              file=sys.stderr)
    if skipped_incomplete:
        print(f"[irl_from_plays] 미완료(done < total) play {skipped_incomplete}건을 "
              f"IRL 적합에서 제외했습니다 (완주 궤적 공간 밖의 시연)",
              file=sys.stderr)
    return out


def _rank_softmax_weights(n: int, temperature: float) -> List[float]:
    """Normalized exp(-rank / T) over n candidates, best rank first.

    ``candidate_actions`` already returns the crane's candidates ordered by the
    environment's own quality ranking, so the slot index *is* a quality rank.
    Weighting by rank rather than re-deriving a score keeps this proposal from
    duplicating (and drifting away from) the env's ranking formula.
    """
    w = [math.exp(-k / temperature) for k in range(n)]
    total = sum(w)
    return [x / total for x in w]


def _sweep_setup_region(scen: Dict, margin_frac: float = 0.15) -> Tuple[float, float, float, float]:
    """Rectangle the sweep proposal draws crane setups from.

    The lifts' bounding box expanded by ``margin_frac``, clipped to the site.
    Drawing over the whole site wastes most samples on corners no player would
    park in; drawing over the lift extent keeps the proposal broad but relevant,
    and a rectangle keeps the density constant so log q stays exact.
    """
    lifts = scen["layout"]["lifts"]
    xs = [float(l["x"]) for l in lifts]
    ys = [float(l["y"]) for l in lifts]
    cfg = scen.get("config") or {}
    site_w = float(cfg.get("site_width", max(xs) if xs else 1.0))
    site_h = float(cfg.get("site_height", max(ys) if ys else 1.0))
    mx = (max(xs) - min(xs)) * margin_frac if xs else 0.0
    my = (max(ys) - min(ys)) * margin_frac if ys else 0.0
    x0 = max(0.0, min(xs) - mx) if xs else 0.0
    x1 = min(site_w, max(xs) + mx) if xs else site_w
    y0 = max(0.0, min(ys) - my) if ys else 0.0
    y1 = min(site_h, max(ys) + my) if ys else site_h
    # Degenerate extents (single-row layouts) would give zero area.
    if x1 - x0 < 1e-6:
        x0, x1 = 0.0, site_w
    if y1 - y0 < 1e-6:
        y0, y1 = 0.0, site_h
    return x0, x1, y0, y1


def _locked_lift_ids(env, requires: Dict[str, List[str]]) -> set:
    """Lift ids whose erection prerequisites are not all done — same gate the
    human session applies via ``_locked_ids``."""
    if not any(requires.values()):
        return set()
    done = {l.id for l in env.lifts if l.done}
    return {lid for lid, reqs in requires.items() if reqs and not set(reqs) <= done}


def _lift_mixture_logpdf(x: float, y: float, lifts_xy: List[Tuple[float, float]],
                         sigma: float) -> float:
    """log density of the equal-weight Gaussian mixture centred on the lifts.

    q(s) = (1/L) * sum_j N(s; lift_j, sigma^2 I). Closed form, so log q stays
    exact — which is the only reason the proposal may be tilted at all.
    """
    inv2s2 = 1.0 / (2.0 * sigma * sigma)
    terms = [-((x - lx) ** 2 + (y - ly) ** 2) * inv2s2 for lx, ly in lifts_xy]
    m = max(terms)
    lse = m + math.log(sum(math.exp(t - m) for t in terms))
    return lse - math.log(len(lifts_xy)) - math.log(2.0 * math.pi * sigma * sigma)


def _sample_sweep_rollouts(
    sid: str,
    scen: Dict,
    cfg: Dict,
    n_samples: int,
    seed: int,
    max_waves: int = 60,
    setup_proposal: str = "uniform",
    setup_sigma_frac: float = 0.12,
) -> Optional[Dict]:
    """Roll out in the DEMONSTRATIONS' action space: draw crane setups, sweep.

    Each wave draws every crane's setup uniformly from ``_sweep_setup_region``
    and runs the shared ``execute_sweep``, exactly as a player's sweep step
    does. The proposal density is constant over that rectangle, so

        log q(tau) = -(waves * n_cranes) * log(area)

    is exact. Rollouts that fail to finish within ``max_waves`` are discarded:
    the demonstrations are all complete plays, so the model's support is the
    completed-trajectory space, and the discarded mass is a per-scenario
    constant that cancels in the self-normalized IS weights.
    """
    try:
        from .sweep_exec import execute_sweep
    except ImportError:
        from sweep_exec import execute_sweep

    x0, x1, y0, y1 = _sweep_setup_region(scen)
    log_area = math.log(max((x1 - x0) * (y1 - y0), 1e-12))
    requires = {str(l["id"]): [str(r) for r in (l.get("requires") or [])]
                for l in scen["layout"]["lifts"]}
    lifts_xy = [(float(l["x"]), float(l["y"])) for l in scen["layout"]["lifts"]]
    # Spread relative to the layout, so one fraction works on a 3-lift map and a
    # 120-lift one alike.
    sigma = max(setup_sigma_frac * max(x1 - x0, y1 - y0), 1e-6)
    zs: List[np.ndarray] = []
    logqs: List[float] = []
    for i in range(int(n_samples)):
        rng = random.Random((zlib.crc32(("sweep:" + str(sid)).encode("utf-8")) * 1000003
                             + int(seed) * 7919 + i) & 0x7FFFFFFF)
        env = CraneSchedulingEnv(cfg)
        try:
            env.reset_layout(
                scen["layout"]["cranes"],
                scen["layout"]["lifts"],
                restricted_zones=scen["layout"].get("restrictedZones") or [],
            )
            logq = 0.0
            waves = 0
            while not env.is_done() and waves < max_waves:
                setups = {}
                for c in env.cranes:
                    if setup_proposal == "lift_mixture":
                        lx, ly = lifts_xy[rng.randrange(len(lifts_xy))]
                        sx = rng.gauss(lx, sigma)
                        sy = rng.gauss(ly, sigma)
                        logq += _lift_mixture_logpdf(sx, sy, lifts_xy, sigma)
                    else:
                        sx = rng.uniform(x0, x1)
                        sy = rng.uniform(y0, y1)
                        logq -= log_area
                    setups[c.id] = {"setup_x": sx, "setup_y": sy}
                execute_sweep(env, setups, _locked_lift_ids(env, requires))
                waves += 1
            if not env.is_done():
                continue  # incomplete: outside the demonstrations' support
            result = env.summary()
        except Exception:
            continue
        zs.append(_phi_from_result(result) * SCALE_VEC)
        logqs.append(logq)
    if not zs:
        return None
    return {"z": np.stack(zs, axis=0), "logq": np.asarray(logqs, dtype=np.float64)}


def sample_trajectory_space(
    scenario_ids: Iterable[str],
    n_samples: int = 200,
    seed: int = 0,
    proposal: str = "uniform",
    temperature: float = 1.0,
    action_space: str = "pick",
    setup_proposal: str = "uniform",
    progress_cb: Optional[Callable[[str, int, int], None]] = None,
) -> Dict[str, Dict]:
    """Draw M rollouts per scenario for the importance-sampled Z estimate.

    Each free crane picks among its feasible (masked) candidates and the exact
    proposal log-probability log q(tau) = sum_t sum_c log q(a_{t,c}) is
    accumulated during the rollout (a crane with no feasible candidate is a
    forced idle: probability 1). Returns per scenario:

        {"z": (M, 7) scaled feature matrix, "logq": (M,) proposal log-probs}

    ``proposal`` selects how a crane picks:

      "uniform"      — 1/|A_{t,c}| over feasible candidates. The original
                       proposal, kept as the default so existing callers and
                       stored priors stay reproducible.
      "rank_softmax" — probability proportional to exp(-rank / temperature)
                       over the env's quality-ordered candidate slots.

    Measured result on this study's data (2026-08-04, 200 rollouts/scenario):
    tilting the proposal does NOT fix the coverage failure it was added for.
    Human plays sit outside the sampled support entirely — on CORRIDOR_1 the
    best of 200 rollouts spent 433 busy-time units against a human median of
    373, and 0/200 rollouts beat that median at any temperature tried
    (3.0 / 1.5 / 0.7 / 0.3). Greedier settings made it worse (best 462 at
    T=0.3), because the candidate ranking optimizes same-radius continuity
    rather than makespan. ESS stayed at 1.0-4.3 of 200.

    The reason is an action-space mismatch, not a proposal problem: 1020 of the
    1024 collected plays are 'sweep' steps, where the player places each crane's
    setup coordinates and every reachable lift is then worked from that fixed
    spot. These rollouts instead pick one lift per crane per step from the
    scenario's default setups, paying travel and setup repeatedly. Reaching
    human-quality trajectories requires sampling in the demonstrations' action
    space (setup placement), not reweighting this one.

    The option is kept because log q is exact for either proposal and the
    temperature sweep is worth reproducing, but "uniform" remains the default
    and neither mode currently yields a defensible Z on sweep-mode data.

    Rollouts are seeded per (scenario, sample index), so the sampled trajectory
    space is reproducible across runs and bootstrap iterations.
    """
    if proposal not in ("uniform", "rank_softmax"):
        raise ValueError(f"unsupported proposal: {proposal}")
    if proposal == "rank_softmax" and not (temperature > 0):
        raise ValueError("temperature must be > 0 for rank_softmax")
    if action_space not in ("pick", "sweep"):
        raise ValueError(f"unsupported action_space: {action_space}")
    if setup_proposal not in ("uniform", "lift_mixture"):
        raise ValueError(f"unsupported setup_proposal: {setup_proposal}")
    out: Dict[str, Dict] = {}
    # Materialized so a caller-supplied progress callback can report "i of N"
    # rather than an open-ended count. This loop is the run's dominant cost
    # (26 scenarios x 200 rollouts of full simulation), so it is the only place
    # a long run has anything useful to say about how far along it is.
    sids = list(scenario_ids)
    for done, sid in enumerate(sids):
        if progress_cb is not None:
            progress_cb("sample", done, len(sids))
        scen = get_scenario(sid)
        if not scen:
            continue
        cfg = dict(scen["config"])
        cfg["num_cranes"] = len(scen["layout"]["cranes"])
        cfg["num_lifts"] = len(scen["layout"]["lifts"])
        nL = cfg["num_lifts"]
        cfg["candidate_k"] = max(int(cfg.get("candidate_k", nL)), nL)
        if action_space == "sweep":
            part = _sample_sweep_rollouts(sid, scen, cfg, n_samples, seed,
                                          setup_proposal=setup_proposal)
            if part is not None:
                out[str(sid)] = part
            continue
        zs: List[np.ndarray] = []
        logqs: List[float] = []
        for i in range(int(n_samples)):
            # str hash is process-randomized; crc32 keeps rollouts reproducible.
            rng = random.Random((zlib.crc32(str(sid).encode("utf-8")) * 1000003 + int(seed) * 7919 + i) & 0x7FFFFFFF)
            env = CraneSchedulingEnv(cfg)
            env.rng = rng
            try:
                env.reset_layout(
                    scen["layout"]["cranes"],
                    scen["layout"]["lifts"],
                    restricted_zones=scen["layout"].get("restrictedZones") or [],
                )
                logq = 0.0
                while not env.is_done():
                    _, masks, _ = env.observe()
                    actions = []
                    for ci in range(env.nC):
                        feas = [k for k, m in enumerate(masks[ci]) if m]
                        if not feas:
                            actions.append(0)  # forced idle: probability 1
                            continue
                        if proposal == "uniform":
                            actions.append(rng.choice(feas))
                            logq -= math.log(len(feas))
                        else:
                            probs = _rank_softmax_weights(len(feas), temperature)
                            # Inverse-CDF draw off the same seeded rng, so a
                            # rollout stays reproducible per (scenario, index).
                            r = rng.random()
                            acc = 0.0
                            j = len(probs) - 1
                            for idx, p in enumerate(probs):
                                acc += p
                                if r <= acc:
                                    j = idx
                                    break
                            actions.append(feas[j])
                            logq += math.log(probs[j])
                    env.step(actions)
                # Match run_policy_layout / human outcomes: closing teardowns are
                # part of the busy-time feature (guarded against double apply).
                env._apply_final_teardowns(rewards=None)
                result = env.summary()
            except Exception:
                continue
            zs.append(_phi_from_result(result) * SCALE_VEC)
            logqs.append(logq)
        if zs:
            out[str(sid)] = {
                "z": np.stack(zs, axis=0),
                "logq": np.asarray(logqs, dtype=np.float64),
            }
    if progress_cb is not None:
        progress_cb("sample", len(sids), len(sids))
    return out


# ---------------------------------------------------------------------------
# Standard MaxEnt model

def _logsumexp(x: np.ndarray) -> float:
    m = float(np.max(x))
    return m + math.log(float(np.sum(np.exp(x - m))))


def _maxent_loss_grad(
    theta: np.ndarray,
    demos: Sequence[Dict],
    samples_by_scenario: Dict[str, Dict],
    l2: float,
) -> Tuple[float, np.ndarray]:
    """Negative mean log-likelihood of the demos under standard MaxEnt.

    Per scenario s: log Z_s ~= logsumexp(u_i - log q_i) - log M (self-normalized
    importance sampling), and grad log Z_s = E_theta[z] with weights
    softmax(u_i - log q_i). The demo term is the plain linear utility, so the
    gradient is the feature-matching residual E_theta[z] - z_demo.
    """
    if not demos:
        return 0.0, np.zeros_like(theta)
    loss = 0.0
    grad = np.zeros_like(theta)
    logz_cache: Dict[str, Tuple[float, np.ndarray]] = {}
    for sid, part in samples_by_scenario.items():
        z = part["z"]
        a = z @ theta - part["logq"]
        lse = _logsumexp(a)
        w = np.exp(a - lse)
        logz_cache[sid] = (lse - math.log(len(a)), w @ z)
    for d in demos:
        logz, ez = logz_cache[d["scenario_id"]]
        loss += -float(d["z"] @ theta) + logz
        grad += -d["z"] + ez
    n = float(len(demos))
    loss /= n
    grad /= n
    if l2 > 0:
        delta = theta - PRIOR_THETA
        loss += 0.5 * float(l2) * float(np.dot(delta, delta))
        grad += float(l2) * delta
    return loss, grad


def _maxent_fit(
    demos: Sequence[Dict],
    samples_by_scenario: Dict[str, Dict],
    l2: float = 1.0,
    lr: float = 0.05,
    max_iter: int = 2500,
    tol: float = 1e-8,
    record_history: bool = False,
) -> Tuple[np.ndarray, Dict]:
    """Fit dimensionless reward multipliers with Adam.

    ``record_history`` additionally returns the per-iteration loss and the
    max-abs gradient in the diagnostic, so a convergence curve can be reported
    without re-running the optimizer. It is off by default: bootstrap does
    thousands of fits and the history is pure overhead there.
    """
    theta = PRIOR_THETA.astype(np.float64).copy()
    m = np.zeros_like(theta)
    v = np.zeros_like(theta)
    prev_loss: Optional[float] = None
    best_theta = theta.copy()
    best_loss = float("inf")
    beta1, beta2, eps = 0.9, 0.999, 1e-8
    loss_history: List[float] = []
    grad_history: List[float] = []
    for it in range(1, max_iter + 1):
        loss, grad = _maxent_loss_grad(theta, demos, samples_by_scenario, l2=l2)
        if record_history:
            loss_history.append(float(loss))
            grad_history.append(float(np.max(np.abs(grad))))
        if loss < best_loss:
            best_loss = loss
            best_theta = theta.copy()
        if prev_loss is not None and abs(prev_loss - loss) < tol:
            break
        prev_loss = loss
        m = beta1 * m + (1.0 - beta1) * grad
        v = beta2 * v + (1.0 - beta2) * (grad * grad)
        m_hat = m / (1.0 - beta1 ** it)
        v_hat = v / (1.0 - beta2 ** it)
        theta = theta - lr * m_hat / (np.sqrt(v_hat) + eps)
        theta = np.clip(theta, -1000.0, 1000.0)
    diag = {"loss": best_loss, "iterations": it}
    if record_history:
        diag["loss_history"] = loss_history
        diag["grad_inf_norm_history"] = grad_history
    return best_theta, diag


def _coef_from_theta(theta: np.ndarray) -> np.ndarray:
    return np.asarray(theta, dtype=np.float64) * SCALE_VEC


def _ess_per_scenario(theta: np.ndarray, samples_by_scenario: Dict[str, Dict]) -> Dict[str, float]:
    """Effective sample size of the self-normalized IS weights at theta."""
    out = {}
    for sid, part in samples_by_scenario.items():
        a = part["z"] @ theta - part["logq"]
        w = np.exp(a - _logsumexp(a))
        out[sid] = float(1.0 / max(float(np.sum(w * w)), 1e-300))
    return out


def fit_maxent(
    demos: Sequence[Dict],
    samples_by_scenario: Dict[str, Dict],
    l2: float = 1.0,
    bootstrap: int = 0,
    seed: int = 0,
    record_history: bool = False,
) -> Dict:
    demos = [d for d in demos if d["scenario_id"] in samples_by_scenario]
    if not demos:
        return {
            "coef": [DEFAULT_REWARD_COEFS[k] for k in FEATURE_NAMES],
            "std": [0.0] * len(FEATURE_NAMES),
            "ci_low": [DEFAULT_REWARD_COEFS[k] for k in FEATURE_NAMES],
            "ci_high": [DEFAULT_REWARD_COEFS[k] for k in FEATURE_NAMES],
            "n_demos": 0,
            "diagnostic": "no demonstrations with a sampled trajectory space",
        }
    theta, diag = _maxent_fit(demos, samples_by_scenario, l2=l2,
                              record_history=record_history)
    coef_main = _coef_from_theta(theta)
    diag["ess_per_scenario"] = _ess_per_scenario(theta, samples_by_scenario)
    if bootstrap <= 0:
        return {
            "coef": coef_main.tolist(),
            "std": [0.0] * len(FEATURE_NAMES),
            "ci_low": coef_main.tolist(),
            "ci_high": coef_main.tolist(),
            "n_demos": int(len(demos)),
            "diagnostic": diag,
        }

    # Bootstrap resamples demonstrations only; the sampled trajectory spaces
    # (Z estimates) stay fixed, so the CI reflects demo variability.
    rng = np.random.default_rng(seed)
    samples = np.zeros((bootstrap, len(FEATURE_NAMES)), dtype=np.float64)
    n = len(demos)
    for i in range(bootstrap):
        idx = rng.integers(0, n, size=n)
        boot = [demos[int(j)] for j in idx]
        theta_i, _ = _maxent_fit(boot, samples_by_scenario, l2=l2)
        samples[i] = _coef_from_theta(theta_i)
    std = samples.std(axis=0)
    ci_low = np.percentile(samples, 2.5, axis=0)
    ci_high = np.percentile(samples, 97.5, axis=0)
    return {
        "coef": coef_main.tolist(),
        "std": std.tolist(),
        "ci_low": ci_low.tolist(),
        "ci_high": ci_high.tolist(),
        "n_demos": int(n),
        "diagnostic": diag,
    }


# ---------------------------------------------------------------------------
# Orchestration

def run_irl(
    plays_dir: Path,
    auto_reward_root: Optional[Path] = None,
    tier: Optional[str] = None,
    labeler: str = "maxent",
    bootstrap: int = 0,
    heuristic_seeds: int = 5,
    include_heuristic: bool = True,
    l2: float = 1.0,
    n_samples: int = 200,
    sample_seed: int = 0,
    min_play_seconds: float = 0.0,
    progress_cb: Optional[Callable[[str, int, int], None]] = None,
) -> Dict:
    """End-to-end run.

    `labeler`, `auto_reward_root`, `heuristic_seeds`, `include_heuristic` are
    kept for API compatibility with older callers; the standard MaxEnt model
    normalizes over sampled trajectory spaces only, so the baseline-pool
    arguments are ignored.

    ``progress_cb(phase, done, total)`` is optional and lets a caller surface
    how far a multi-minute run has got. Phases are "load", "sample" and "fit";
    ``total`` is 0 where the phase has no countable unit of work.
    """
    if progress_cb is not None:
        progress_cb("load", 0, 0)
    human = load_human_trajectories(plays_dir, tier=tier,
                                    min_play_seconds=min_play_seconds)
    if not human:
        all_plays = [summary for summary, _ in _load_play_entries(plays_dir)]
        if tier and all_plays:
            tier_counts: Dict[str, int] = {}
            for s in all_plays:
                t = s.get("tier") or "unknown"
                tier_counts[t] = tier_counts.get(t, 0) + 1
            avail = ", ".join(f"{t}={n}" for t, n in sorted(tier_counts.items()))
            msg = (f"플레이 기록이 tier='{tier}'에는 0건입니다. "
                   f"사용 가능한 tier 분포: {avail}.")
        else:
            msg = f"저장된 사람 플레이 기록이 없습니다 (tier={tier or '전체'})."
        return {"ok": False, "message": msg, "feature_names": FEATURE_NAMES}

    scenarios_seen = sorted({h["scenario_id"] for h in human})
    samples_by_scenario = sample_trajectory_space(
        scenarios_seen, n_samples=n_samples, seed=sample_seed,
        progress_cb=progress_cb,
    )
    if not samples_by_scenario:
        return {
            "ok": False,
            "message": "시나리오 궤적 공간을 샘플링할 수 없어 MaxEnt 분배함수(Z)를 추정할 수 없습니다.",
            "feature_names": FEATURE_NAMES,
            "n_human": len(human),
            "n_samples": int(n_samples),
        }

    demos = [
        {"scenario_id": h["scenario_id"], "z": h["phi"] * SCALE_VEC, "human": h}
        for h in human
    ]
    if progress_cb is not None:
        progress_cb("fit", 0, int(bootstrap))
    fit = fit_maxent(demos, samples_by_scenario, l2=l2, bootstrap=bootstrap, seed=sample_seed)

    diag = fit.get("diagnostic") or {}
    ess = diag.get("ess_per_scenario", {}) if isinstance(diag, dict) else {}
    diag_per_scenario: Dict[str, Dict] = {}
    for sid in scenarios_seen:
        h_n = sum(1 for h in human if h["scenario_id"] == sid)
        part = samples_by_scenario.get(sid)
        diag_per_scenario[sid] = {
            "human": h_n,
            "z_samples": int(len(part["logq"])) if part else 0,
            "ess": round(float(ess[sid]), 2) if sid in ess else None,
        }

    n_fit_demos = int(fit.get("n_demos", 0))
    n_baseline_total = int(sum(len(p["logq"]) for p in samples_by_scenario.values()))
    reward_coef = dict(zip(FEATURE_NAMES, fit["coef"]))
    reward_std = dict(zip(FEATURE_NAMES, fit["std"]))
    reward_ci_low = dict(zip(FEATURE_NAMES, fit["ci_low"]))
    reward_ci_high = dict(zip(FEATURE_NAMES, fit["ci_high"]))
    return {
        "ok": True,
        "method": "maxent_v1",
        "feature_names": FEATURE_NAMES,
        "feature_semantics": "reward = sum(reward_coef[k] * phi[k]); cost features are positive magnitudes",
        "labeler": labeler or "maxent",
        "tier_filter": tier,
        "n_human": len(human),
        # Who the demos came from. Read this before quoting n_human as a sample
        # size: a public deployment can produce many plays from few people.
        "cohort": cohort_summary(human),
        "min_play_seconds": float(min_play_seconds),
        # Z-estimate rollouts (was: baseline pool size in the conditional model).
        "n_baseline": n_baseline_total,
        "n_z_samples_per_scenario": int(n_samples),
        "sample_seed": int(sample_seed),
        "n_demo_pools": n_fit_demos,
        # Backward-compatible alias for older UI text.
        "n_pairs": n_fit_demos,
        "n_explicit_prefs": 0,
        "scenarios": sorted(diag_per_scenario.keys()),
        "per_scenario": diag_per_scenario,
        "reward_coef": reward_coef,
        "reward_coef_std": reward_std,
        "reward_coef_ci_low": reward_ci_low,
        "reward_coef_ci_high": reward_ci_high,
        # Backward-compatible aliases. These are no longer 5-dim scorer weights.
        "weights": reward_coef,
        "weight_std": reward_std,
        "weight_ci_low": reward_ci_low,
        "weight_ci_high": reward_ci_high,
        "reward_default_coef": dict(DEFAULT_REWARD_COEFS),
        "coef_scale": dict(COEF_SCALE),
        "bootstrap_iters": bootstrap,
        "l2": l2,
        "fit_diagnostic": fit.get("diagnostic"),
        "generated_at": time.strftime("%Y-%m-%dT%H:%M:%S"),
    }


# ---------------------------------------------------------------------------
# CLI

def main():
    ap = argparse.ArgumentParser(description="Standard MaxEnt IRL on human crane-game demonstrations.")
    ap.add_argument("--plays", default=str(PLAYS_DIR), help="human_plays/ directory")
    ap.add_argument("--auto-reward-root", default="",
                    help="[deprecated] ignored — Z is estimated from sampled rollouts")
    ap.add_argument("--tier", default=None, help="filter human plays by tier (general / expert)")
    ap.add_argument("--labeler", default="maxent",
                    help="compatibility metadata only; every value uses standard MaxEnt")
    ap.add_argument("--bootstrap", type=int, default=200,
                    help="bootstrap iters for CI; 0 disables")
    ap.add_argument("--samples", type=int, default=200,
                    help="uniform-random rollouts per scenario for the Z estimate")
    ap.add_argument("--sample-seed", type=int, default=0,
                    help="seed for the Z-estimate rollouts (reproducible)")
    ap.add_argument("--heuristic-seeds", type=int, default=5,
                    help="[deprecated] ignored — no baseline pools in standard MaxEnt")
    ap.add_argument("--no-heuristic", action="store_true",
                    help="[deprecated] ignored — no baseline pools in standard MaxEnt")
    ap.add_argument("--l2", type=float, default=1.0,
                    help="ridge strength around the current default reward scale")
    ap.add_argument("--min-play-seconds", type=float, default=0.0,
                    help="drop submissions faster than this in seconds; 0 disables")
    ap.add_argument("--out", default="", help="output JSON path; default = irl_priors/irl_prior_<DATE>.json")
    args = ap.parse_args()

    if args.auto_reward_root or args.no_heuristic:
        print("[irl_from_plays] --auto-reward-root/--no-heuristic는 표준 MaxEnt 전환으로 "
              "더 이상 사용되지 않습니다 (무시됨)", file=sys.stderr)

    result = run_irl(
        plays_dir=Path(args.plays),
        tier=args.tier,
        labeler=args.labeler,
        bootstrap=args.bootstrap,
        l2=args.l2,
        n_samples=args.samples,
        sample_seed=args.sample_seed,
        min_play_seconds=args.min_play_seconds,
    )
    if not result.get("ok"):
        print(json.dumps(result, ensure_ascii=False, indent=2))
        sys.exit(2)

    if args.out:
        out_path = Path(args.out)
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
        ref = str(out_path)
    else:
        try:
            from crane_db.storage import save_irl_artifact, IRL_KIND_PRIOR
        except ImportError:
            from crane_db.storage import save_irl_artifact, IRL_KIND_PRIOR
        ref = save_irl_artifact(IRL_KIND_PRIOR, result,
                                 label=f"cli:maxent:{args.tier or 'all'}")
    print(f"wrote {ref}")
    print("reward coefficients: "
          + ", ".join(f"{k}={result['reward_coef'][k]:.4g}" for k in FEATURE_NAMES))
    print(f"n_demos={result['n_demo_pools']}, n_human={result['n_human']}, "
          f"z_samples/scenario={result['n_z_samples_per_scenario']}")
    cohort = result.get("cohort") or {}
    print(f"cohort: 참가자 {cohort.get('n_participants')}명, "
          f"1인 최대 {cohort.get('max_demos_per_participant')}건, "
          f"재도전 제외 {cohort.get('n_repeat_attempts_dropped')}건, "
          f"미귀속 {cohort.get('n_unattributed_demos')}건, "
          f"play_seconds 중앙값 {cohort.get('median_play_seconds')}")
    print(f"play_seconds 분포(n={cohort.get('n_timed_demos')}): "
          f"min={cohort.get('min_play_seconds')} p05={cohort.get('play_seconds_p05')} "
          f"p10={cohort.get('play_seconds_p10')} p25={cohort.get('play_seconds_p25')} "
          f"median={cohort.get('median_play_seconds')}  "
          f"<- --min-play-seconds 임계값은 이 하위 분위의 단절 지점에서 고르세요")


if __name__ == "__main__":
    main()
