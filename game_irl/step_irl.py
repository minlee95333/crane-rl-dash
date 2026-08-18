"""Step-level conditional MaxEnt over the sweep decisions humans actually made.

Trajectory-level MaxEnt needs Z over a scenario's whole trajectory space. On
this dataset that failed structurally, not numerically: random rollouts never
reach the region the demonstrations occupy (0 of 60 rollouts matched the human
median on all three cost axes in 24 of 26 scenarios), so the importance weights
collapsed to an effective sample size near 1 and no reweighting could recover
it. Tilting the proposal five different ways did not change that.

This estimator shrinks the normalizer instead of chasing it. The reward is
linear in features and the features are additive over sweep waves, so a
trajectory's reward decomposes into per-step increments. That licenses a
per-decision model:

    P(chosen_t | candidates_t) = exp(theta . dphi_chosen) / sum_k exp(theta . dphi_k)

The sum runs over an explicit finite candidate set, so Z is exact — computed,
not sampled. Nothing here can collapse the way importance sampling did.

The honest cost is that the coefficients are conditional on what counts as an
alternative. The candidate set is a stated modelling choice, not a fact about
the world: it mixes draws from the layout's setup region with draws from the
setup coordinates other players actually used, so "what else could they have
placed" spans both the geometrically available and the humanly plausible. The
mixture proportions are reported alongside the coefficients, because a
different candidate set is a different estimand.

Only plays whose recorded outcome can be reproduced exactly from their own
stored actions are used. Replay fidelity is checked per play and mismatches are
counted and excluded rather than silently fitted, because a play we cannot
reproduce is one whose per-step features we would be inventing.
"""
from __future__ import annotations

import argparse
import copy
import json
import math
import random
import sys
import zlib
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Sequence, Tuple

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

try:
    from crane_core.env import CraneSchedulingEnv
    from .irl_from_plays import (
        DEFAULT_REWARD_COEFS, FEATURE_NAMES, PRIOR_THETA, SCALE_VEC,
        _phi_from_result, _sweep_setup_region,
    )
    from .sweep_exec import execute_sweep
except ImportError:  # script execution
    from crane_core.env import CraneSchedulingEnv  # type: ignore
    from game_irl.irl_from_plays import (  # type: ignore
        DEFAULT_REWARD_COEFS, FEATURE_NAMES, PRIOR_THETA, SCALE_VEC,
        _phi_from_result, _sweep_setup_region,
    )
    from game_irl.sweep_exec import execute_sweep  # type: ignore


# ---------------------------------------------------------------------------
# Faithful replay of a recorded play

def requires_of(doc: Dict) -> Dict[str, List[str]]:
    """Erection prerequisites, including the random-order variant's chain.

    In ``order_mode`` the session synthesises ``requires`` at runtime from a
    seeded permutation, so the layout JSON carries none. The play records the
    resulting sequence in ``meta.order_perm``; rebuilding the chain from that
    recorded order reproduces the locks exactly, whereas re-deriving it from the
    seed would depend on the generator staying byte-identical forever.
    """
    layout = doc.get("layout") or {}
    req = {str(l["id"]): [str(r) for r in (l.get("requires") or [])]
           for l in layout.get("lifts") or []}
    perm = (doc.get("meta") or {}).get("order_perm")
    if perm and not any(req.values()):
        for rank, lid in enumerate(perm):
            req[str(lid)] = [str(perm[rank - 1])] if rank > 0 else []
    return req


def locked_ids(env, requires: Dict[str, List[str]]) -> set:
    if not any(requires.values()):
        return set()
    done = {l.id for l in env.lifts if l.done}
    return {lid for lid, reqs in requires.items() if reqs and not set(reqs) <= done}


def new_env(doc: Dict):
    layout = doc["layout"]
    cfg = dict(doc.get("config") or {})
    cfg["num_cranes"] = len(layout["cranes"])
    cfg["num_lifts"] = len(layout["lifts"])
    env = CraneSchedulingEnv(cfg)
    env.reset_layout(layout["cranes"], layout["lifts"],
                     restricted_zones=layout.get("restrictedZones") or [])
    return env


def apply_wave(env, setups: Dict, requires: Dict[str, List[str]]) -> int:
    """One sweep wave exactly as ``submit_sweep_step`` applies it.

    The session runs ``apply_step_soft_conflicts`` over the events the wave
    produced, which ``execute_sweep`` alone does not do. Leaving it out changes
    p_inter_soft on roughly half of the recorded plays.
    """
    n0 = len(env.events)
    execute_sweep(env, setups or {}, locked_ids(env, requires))
    if len(env.events) > n0:
        env.apply_step_soft_conflicts(env.events[n0:])
    return len(env.events) - n0


def replay_matches(doc: Dict) -> bool:
    """True when replaying the stored actions reproduces the stored outcome."""
    actions = doc.get("actions") or []
    if not actions or any(a.get("__mode__") != "sweep" for a in actions):
        return False
    requires = requires_of(doc)
    env = new_env(doc)
    try:
        for a in actions:
            apply_wave(env, a.get("setups") or {}, requires)
        got = _phi_from_result(env.summary())
    except Exception:
        return False
    want = _phi_from_result(doc["outcome"])
    return bool(np.allclose(got, want, rtol=1e-6, atol=1e-6))


# ---------------------------------------------------------------------------
# Candidate sets

def _human_setup_cloud(docs: Iterable[Dict]) -> Dict[str, List[Tuple[float, float]]]:
    """Setup coordinates players used, pooled per scenario."""
    cloud: Dict[str, List[Tuple[float, float]]] = {}
    for doc in docs:
        sid = (doc.get("meta") or {}).get("scenario_id")
        if not sid:
            continue
        for a in doc.get("actions") or []:
            for s in (a.get("setups") or {}).values():
                try:
                    cloud.setdefault(str(sid), []).append(
                        (float(s["setup_x"]), float(s["setup_y"])))
                except (KeyError, TypeError, ValueError):
                    continue
    return cloud


def _draw_setups(env, rng: random.Random, region: Tuple[float, float, float, float],
                 pool: Sequence[Tuple[float, float]], from_pool: bool,
                 jitter: float) -> Dict:
    x0, x1, y0, y1 = region
    out = {}
    for c in env.cranes:
        if from_pool and pool:
            px, py = pool[rng.randrange(len(pool))]
            sx, sy = rng.gauss(px, jitter), rng.gauss(py, jitter)
        else:
            sx, sy = rng.uniform(x0, x1), rng.uniform(y0, y1)
        out[c.id] = {"setup_x": sx, "setup_y": sy}
    return out


def _total_score(doc: Dict) -> Optional[float]:
    """The play's displayed score. Not part of phi — used only to split
    participants into strong/weak groups, never as a fitting target."""
    try:
        return float((doc.get("scorer_snapshot") or {}).get("totalScore"))
    except (TypeError, ValueError):
        return None


def step_choices(doc: Dict, pool: Sequence[Tuple[float, float]],
                 n_uniform: int, n_human: int, seed: int,
                 jitter_frac: float = 0.05) -> List[Dict]:
    """Per step: the chosen wave's feature increment and its alternatives'.

    The env is advanced with the human's actual choice after each step, so every
    decision is evaluated in the state the player was really in — an alternative
    is scored against the same board, not against a counterfactual history.
    """
    requires = requires_of(doc)
    env = new_env(doc)
    scen_region = _sweep_setup_region({"layout": doc["layout"],
                                       "config": doc.get("config") or {}})
    jitter = max(jitter_frac * max(scen_region[1] - scen_region[0],
                                   scen_region[3] - scen_region[2]), 1e-6)
    sid = str((doc.get("meta") or {}).get("scenario_id") or "?")
    out: List[Dict] = []
    for t, action in enumerate(doc.get("actions") or []):
        rng = random.Random((zlib.crc32(f"{sid}|{t}".encode()) * 1000003
                             + int(seed) * 7919) & 0x7FFFFFFF)
        base = _phi_from_result(env.summary())

        def delta(setups) -> Optional[np.ndarray]:
            trial = copy.deepcopy(env)
            try:
                if apply_wave(trial, setups, requires) <= 0:
                    # A wave that works nothing is not an action the game would
                    # have accepted, so it is not a legal alternative either.
                    return None
                return _phi_from_result(trial.summary()) - base
            except Exception:
                return None

        chosen = delta(action.get("setups") or {})
        if chosen is None:
            break
        alts: List[np.ndarray] = []
        for i in range(int(n_uniform) + int(n_human)):
            d = delta(_draw_setups(env, rng, scen_region, pool,
                                   from_pool=(i >= n_uniform), jitter=jitter))
            if d is not None:
                alts.append(d)
        if alts:
            out.append({"chosen": chosen, "alts": alts, "scenario_id": sid,
                        "user_id": (doc.get("meta") or {}).get("user_id") or "",
                        "total_score": _total_score(doc)})
        if apply_wave(env, action.get("setups") or {}, requires) <= 0:
            break
    return out


# ---------------------------------------------------------------------------
# Fit

def _pack(steps: Sequence[Dict]) -> List[np.ndarray]:
    """Each step as a matrix whose row 0 is the chosen option (scaled)."""
    return [np.stack([s["chosen"]] + s["alts"], axis=0) * SCALE_VEC for s in steps]


def _tensorize(packed: Sequence[np.ndarray]) -> Tuple[np.ndarray, np.ndarray]:
    """Pad the per-step option matrices into one (N, K, F) tensor plus a mask.

    Steps differ in how many candidates survived (a draw that works no lift is
    not a legal alternative), so the rows are ragged. Padding once and masking
    the padding out of the log-sum-exp turns the fit's inner loop into three
    array operations — the bootstrap runs thousands of fits, and a Python loop
    over steps there costs minutes per fit.
    """
    n = len(packed)
    f = packed[0].shape[1] if n else len(FEATURE_NAMES)
    k = max((m.shape[0] for m in packed), default=1)
    X = np.zeros((n, k, f), dtype=np.float64)
    mask = np.zeros((n, k), dtype=bool)
    for i, m in enumerate(packed):
        X[i, :m.shape[0]] = m
        mask[i, :m.shape[0]] = True
    return X, mask


def _loss_grad_tensor(theta: np.ndarray, X: np.ndarray, mask: np.ndarray,
                      l2: float) -> Tuple[float, np.ndarray]:
    u = X @ theta                                    # (N, K)
    u = np.where(mask, u, -np.inf)
    m = np.max(u, axis=1, keepdims=True)
    w = np.where(mask, np.exp(u - m), 0.0)
    Zs = np.sum(w, axis=1, keepdims=True)
    logZ = (m + np.log(Zs)).ravel()
    loss = float(np.mean(logZ - u[:, 0]))
    p = w / Zs                                       # (N, K)
    exp_feat = np.einsum("nk,nkf->nf", p, X)         # E_p[phi] per step
    grad = np.mean(exp_feat - X[:, 0, :], axis=0)
    d = theta - PRIOR_THETA
    loss += l2 * float(np.sum(d * d)) / len(theta)
    grad = grad + (2.0 * l2 / len(theta)) * d
    return loss, grad


def _loss_grad(theta: np.ndarray, packed: Sequence[np.ndarray],
               l2: float) -> Tuple[float, np.ndarray]:
    """Mean negative log P(chosen), with the same L2 anchor as the other fits."""
    if not packed:
        d = theta - PRIOR_THETA
        return l2 * float(np.sum(d * d)) / len(theta), (2.0 * l2 / len(theta)) * d
    X, mask = _tensorize(packed)
    return _loss_grad_tensor(theta, X, mask, l2)


def fit_steps(packed: Sequence[np.ndarray], l2: float = 1.0, lr: float = 0.05,
              max_iter: int = 2000, tol: float = 1e-9,
              record_history: bool = False) -> Tuple[np.ndarray, Dict]:
    theta = PRIOR_THETA.astype(np.float64).copy()
    m = np.zeros_like(theta)
    v = np.zeros_like(theta)
    best_theta, best_loss = theta.copy(), float("inf")
    beta1, beta2, eps = 0.9, 0.999, 1e-8
    hist: List[float] = []
    it = 0
    # Pad once, not per iteration: the optimizer runs thousands of passes over
    # the same steps and re-tensorizing each time dominates the runtime.
    X, mask = _tensorize(packed) if packed else (None, None)
    for it in range(1, max_iter + 1):
        if X is None:
            loss, grad = _loss_grad(theta, packed, l2)
        else:
            loss, grad = _loss_grad_tensor(theta, X, mask, l2)
        if record_history:
            hist.append(float(loss))
        if loss < best_loss:
            best_loss, best_theta = loss, theta.copy()
        if float(np.max(np.abs(grad))) < tol:
            break
        m = beta1 * m + (1 - beta1) * grad
        v = beta2 * v + (1 - beta2) * (grad * grad)
        theta = theta - lr * (m / (1 - beta1 ** it)) / (np.sqrt(v / (1 - beta2 ** it)) + eps)
        theta = np.clip(theta, -1000.0, 1000.0)
    diag = {"loss": best_loss, "iterations": it}
    if record_history:
        diag["loss_history"] = hist
    return best_theta, diag


def choice_metrics(theta: np.ndarray, packed: Sequence[np.ndarray]) -> Dict:
    """How often the reward ranks the human's actual choice first, and where
    it places it on average. Chance level is 1/(1+alternatives)."""
    if not packed:
        return {"top1": float("nan"), "mean_percentile": float("nan"), "chance": float("nan")}
    top1 = 0
    pct = []
    sizes = []
    for M in packed:
        u = M @ theta
        rank = int(np.sum(u > u[0]))          # options strictly better than chosen
        if rank == 0:
            top1 += 1
        pct.append(1.0 - rank / max(len(u) - 1, 1))
        sizes.append(len(u))
    return {
        "top1": top1 / len(packed),
        "mean_percentile": float(np.mean(pct)),
        "chance": float(np.mean([1.0 / s for s in sizes])),
        "mean_options": float(np.mean(sizes)),
    }


def identifiable_mask(packed: Sequence[np.ndarray], tol: float = 1e-12) -> np.ndarray:
    """Features that ever differ between the chosen option and an alternative.

    A feature constant across a step's options cannot influence that choice; if
    it is constant in every step it carries no gradient at all and stays at the
    prior. Reporting the mask keeps that from reading as a confident estimate.
    """
    if not packed:
        return np.zeros(len(FEATURE_NAMES), dtype=bool)
    spread = np.zeros(len(FEATURE_NAMES))
    for M in packed:
        spread = np.maximum(spread, np.max(np.abs(M - M[0]), axis=0))
    return spread > tol


# ---------------------------------------------------------------------------
# Uncertainty, clustered by participant

def bootstrap_by_participant(steps: Sequence[Dict], l2: float, n_boot: int,
                             seed: int) -> Dict:
    people = sorted({s["user_id"] for s in steps if s["user_id"]})
    by_person: Dict[str, List[Dict]] = {p: [] for p in people}
    for s in steps:
        if s["user_id"] in by_person:
            by_person[s["user_id"]].append(s)
    if not people:
        z = [None] * len(FEATURE_NAMES)
        return {"n_ok": 0, "std": z, "ci_low": z, "ci_high": z}
    rng = np.random.default_rng(seed)
    coefs = []
    for _ in range(int(n_boot)):
        picked = rng.choice(len(people), size=len(people), replace=True)
        sample: List[Dict] = []
        for idx in picked:
            sample.extend(by_person[people[idx]])
        if not sample:
            continue
        theta, _ = fit_steps(_pack(sample), l2=l2)
        coefs.append(theta * SCALE_VEC)
    if not coefs:
        z = [None] * len(FEATURE_NAMES)
        return {"n_ok": 0, "std": z, "ci_low": z, "ci_high": z}
    C = np.stack(coefs, axis=0)
    return {
        "n_ok": int(C.shape[0]),
        "std": C.std(axis=0, ddof=1).tolist(),
        "ci_low": np.percentile(C, 2.5, axis=0).tolist(),
        "ci_high": np.percentile(C, 97.5, axis=0).tolist(),
    }


def feature_matching(theta: np.ndarray, packed: Sequence[np.ndarray]) -> Dict:
    """The MaxEnt optimality condition, in this estimator's own terms.

    At the trajectory level the condition is E_model[phi] = E_demo[phi] with the
    model expectation taken over the sampled trajectory space — which is exactly
    what collapsed there (the p_idle residual sat above 11 demo sd). Here the
    expectation is over each step's explicit candidate softmax, so it is
    computed rather than estimated and should vanish at the optimum up to the
    L2 pull. A residual that does NOT vanish would mean the optimizer stopped
    early, not that the data disagrees.

    Reported in raw feature units per step, and scaled by the spread of the
    chosen options so a large count feature cannot look worse than a small one
    purely from its units.
    """
    if not packed:
        return {}
    X, mask = _tensorize(packed)
    u = np.where(mask, X @ theta, -np.inf)
    m = np.max(u, axis=1, keepdims=True)
    w = np.where(mask, np.exp(u - m), 0.0)
    p = w / np.sum(w, axis=1, keepdims=True)
    e_model = np.einsum("nk,nkf->nf", p, X).mean(axis=0) / SCALE_VEC
    chosen = X[:, 0, :] / SCALE_VEC
    e_demo = chosen.mean(axis=0)
    sd = chosen.std(axis=0, ddof=1)
    resid = e_model - e_demo
    return {
        "n_steps": len(packed),
        "e_demo": dict(zip(FEATURE_NAMES, e_demo.tolist())),
        "e_model": dict(zip(FEATURE_NAMES, e_model.tolist())),
        "residual": dict(zip(FEATURE_NAMES, resid.tolist())),
        "residual_in_sd": dict(zip(
            FEATURE_NAMES,
            [float(r / s) if s > 1e-12 else None for r, s in zip(resid, sd)])),
    }


def l2_sensitivity(packed: Sequence[np.ndarray],
                   levels: Sequence[float] = (1.0, 0.3, 0.1, 0.03, 0.01, 0.0)) -> Dict:
    """How much each coefficient depends on the regularization strength.

    The L2 term is centred on the current training coefficients, so "the
    estimate reproduces the default" can mean the data agrees — or that the data
    said nothing and the anchor held. Refitting across L2 levels shows which
    reading applies: a value that survives releasing the anchor is a property of
    the data, one that swings (or flips sign) is a property of the choice of L2.

    Deliberately no causal labels here. Moving little does NOT prove the data
    determined the value, and moving a lot does not prove it did not — a
    strongly informative feature is held back by a tight prior and springs out
    when it is released. Read this together with ``condition_report``: a value
    is a finding only when the likelihood has curvature in that direction AND
    the value is stable across L2.

    ``choice_top1`` per level is what makes the ridge visible: if very different
    coefficient vectors score the same, the data cannot distinguish them.
    """
    out: Dict[str, Dict] = {}
    base = None
    for l2 in levels:
        theta, _ = fit_steps(packed, l2=float(l2), max_iter=4000)
        coef = theta * SCALE_VEC
        if base is None:
            base = coef
        out[str(l2)] = {
            "reward_coef": dict(zip(FEATURE_NAMES, coef.tolist())),
            "choice_top1": choice_metrics(theta, packed)["top1"],
        }
    lowest = np.asarray(list(out[str(levels[-1])]["reward_coef"].values()))
    prior_coef = PRIOR_THETA * SCALE_VEC
    rel = {k: float(abs(lowest[i] - base[i]) / max(abs(base[i]), 1e-9))
           for i, k in enumerate(FEATURE_NAMES)}
    # Did the unanchored fit leave the prior at all? A coefficient that sits on
    # its prior with L2 = 0 has no gradient — the data is silent about it.
    from_prior = {
        k: float(abs(lowest[i] - prior_coef[i]) / max(abs(prior_coef[i]), 1e-9))
        for i, k in enumerate(FEATURE_NAMES)
    }
    tops = [out[str(l)]["choice_top1"] for l in levels]
    return {
        "levels": [float(x) for x in levels],
        "by_level": out,
        # |Δ| between the anchored and the least-anchored fit.
        "relative_move": rel,
        # |Δ| from the prior at the least-anchored fit.
        "distance_from_prior_at_lowest_l2": from_prior,
        # Values that barely depend on the regularization choice.
        "stable_across_l2": [k for k, v in rel.items() if v < 0.25],
        "unstable_across_l2": [k for k, v in rel.items() if v > 1.0],
        "sign_flipped": [k for i, k in enumerate(FEATURE_NAMES)
                         if base[i] * lowest[i] < 0],
        # If accuracy is flat while the coefficients swing, the data does not
        # prefer any of those vectors — that is the ridge, stated as a number.
        "choice_top1_range": [float(min(tops)), float(max(tops))],
    }


def condition_report(theta: np.ndarray, packed: Sequence[np.ndarray],
                     l2: float) -> Dict:
    """Curvature of the fitted objective — which directions the data pins.

    Eigenvalues near the L2 contribution (2*l2/dim) mark directions where the
    likelihood is flat and the prior alone is holding the answer.
    """
    if not packed:
        return {}
    X, mask = _tensorize(packed)
    eps = 1e-5
    n = len(theta)
    H = np.zeros((n, n))
    for i in range(n):
        e = np.zeros(n)
        e[i] = eps
        _, gp = _loss_grad_tensor(theta + e, X, mask, l2)
        _, gm = _loss_grad_tensor(theta - e, X, mask, l2)
        H[:, i] = (gp - gm) / (2 * eps)
    H = (H + H.T) / 2
    w, V = np.linalg.eigh(H)
    l2_floor = 2.0 * l2 / n
    dirs = []
    for k in range(n):
        v = V[:, k]
        top = np.argsort(-np.abs(v))[:3]
        dirs.append({
            "eigenvalue": float(w[k]),
            "data_curvature": float(w[k] - l2_floor),
            "direction": {FEATURE_NAMES[t]: round(float(v[t]), 3) for t in top},
        })
    return {
        "l2_floor": float(l2_floor),
        "condition_number": float(w.max() / max(w.min(), 1e-12)),
        "eigen": dirs,
    }


def group_contrast(steps: Sequence[Dict], l2: float, n_boot: int, seed: int,
                   quantile: float = 0.25) -> Dict:
    """Top vs bottom participants by mean totalScore, fitted independently.

    Splitting participants rather than plays: a play-level split can put the
    same person in both groups, and then the coefficient difference measures
    that person's step-to-step variation instead of the difference between
    strong and weak schedulers.
    """
    scores: Dict[str, List[float]] = {}
    for s in steps:
        if s.get("user_id") and s.get("total_score") is not None:
            scores.setdefault(s["user_id"], []).append(float(s["total_score"]))
    ranked = sorted(((u, float(np.mean(v))) for u, v in scores.items()),
                    key=lambda kv: kv[1])
    if len(ranked) < 4:
        return {"ok": False, "message": f"점수 있는 참가자 {len(ranked)}명 — 분할 불가"}
    k = max(1, int(round(len(ranked) * quantile)))
    bottom = {u for u, _ in ranked[:k]}
    top = {u for u, _ in ranked[-k:]}
    out: Dict = {
        "ok": True, "quantile": quantile, "n_participants_scored": len(ranked),
        "n_per_group": k,
        "top_mean_score": round(float(np.mean([s for u, s in ranked if u in top])), 2),
        "bottom_mean_score": round(float(np.mean([s for u, s in ranked if u in bottom])), 2),
    }
    for name, ids in (("top", top), ("bottom", bottom)):
        rows = [s for s in steps if s["user_id"] in ids]
        if not rows:
            return {"ok": False, "message": f"{name} 그룹에 스텝이 없습니다"}
        packed = _pack(rows)
        theta, _ = fit_steps(packed, l2=l2)
        boot = bootstrap_by_participant(rows, l2, n_boot, seed)
        out[name] = {
            "n_steps": len(rows),
            "n_participants": len({s["user_id"] for s in rows}),
            "reward_coef": dict(zip(FEATURE_NAMES, (theta * SCALE_VEC).tolist())),
            "ci_low": dict(zip(FEATURE_NAMES, boot["ci_low"])),
            "ci_high": dict(zip(FEATURE_NAMES, boot["ci_high"])),
            "choice": choice_metrics(theta, packed),
        }
    out["coef_delta_top_minus_bottom"] = {
        k2: out["top"]["reward_coef"][k2] - out["bottom"]["reward_coef"][k2]
        for k2 in FEATURE_NAMES
    }
    # Overlapping intervals mean this sample does not resolve the contrast;
    # say so rather than reading the point difference.
    out["ci_disjoint"] = {
        k2: bool(out["top"]["ci_low"][k2] > out["bottom"]["ci_high"][k2]
                 or out["bottom"]["ci_low"][k2] > out["top"]["ci_high"][k2])
        for k2 in FEATURE_NAMES
    } if n_boot > 0 else None
    return out


def holdout_by_participant(steps: Sequence[Dict], l2: float, seed: int,
                           frac: float = 0.3) -> Dict:
    people = sorted({s["user_id"] for s in steps if s["user_id"]})
    if len(people) < 4:
        return {"ok": False, "message": f"참가자 {len(people)}명 — 분할 불가"}
    rng = np.random.default_rng(seed)
    order = rng.permutation(len(people))
    n_test = max(1, int(round(len(people) * frac)))
    test_ids = {people[i] for i in order[:n_test]}
    train = [s for s in steps if s["user_id"] not in test_ids]
    test = [s for s in steps if s["user_id"] in test_ids]
    if not train or not test:
        return {"ok": False, "message": "분할 후 한쪽이 비었습니다"}
    ptr, pte = _pack(train), _pack(test)
    theta, _ = fit_steps(ptr, l2=l2)
    return {
        "ok": True,
        "n_train_participants": len(people) - n_test,
        "n_test_participants": n_test,
        "n_train_steps": len(ptr), "n_test_steps": len(pte),
        "train": choice_metrics(theta, ptr),
        "test": choice_metrics(theta, pte),
        "prior_test": choice_metrics(PRIOR_THETA, pte),
    }


# ---------------------------------------------------------------------------
# Orchestration

def _save_steps(path: Path, steps: Sequence[Dict], meta: Dict) -> None:
    packed = _pack(steps)
    X, mask = _tensorize(packed)
    np.savez_compressed(
        path, X=X, mask=mask,
        user_id=np.array([s["user_id"] for s in steps], dtype=object),
        scenario_id=np.array([s["scenario_id"] for s in steps], dtype=object),
        total_score=np.array([np.nan if s.get("total_score") is None
                              else s["total_score"] for s in steps], dtype=float),
        meta=np.array([json.dumps(meta, ensure_ascii=False)], dtype=object),
        allow_pickle=True)


def _load_steps(path: Path) -> Tuple[List[Dict], Dict]:
    """Rebuild the step list from a cache. Candidate generation replays every
    play and executes ~13 sweeps per step, which dominates the runtime; the fit
    itself takes seconds, so a cache makes re-analysis (new L2, more bootstrap,
    an added diagnostic) cheap enough to actually do."""
    z = np.load(path, allow_pickle=True)
    X, mask = z["X"], z["mask"]
    steps = []
    for i in range(X.shape[0]):
        rows = X[i][mask[i]] / SCALE_VEC
        score = float(z["total_score"][i])
        steps.append({
            "chosen": rows[0], "alts": [r for r in rows[1:]],
            "user_id": str(z["user_id"][i]), "scenario_id": str(z["scenario_id"][i]),
            "total_score": None if math.isnan(score) else score,
        })
    return steps, json.loads(str(z["meta"][0]))


def analyze(plays_dir: Path, l2: float, n_boot: int, seed: int,
            n_uniform: int, n_human: int, max_plays: Optional[int] = None,
            cache: Optional[Path] = None) -> Dict:
    if cache and Path(cache).exists():
        steps, src = _load_steps(Path(cache))
        return _report(steps, src, l2, n_boot, seed)
    docs = []
    n_files = n_nonsweep = n_unreplayable = 0
    for path in sorted(Path(plays_dir).glob("*.json")):
        try:
            doc = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            continue
        n_files += 1
        actions = doc.get("actions") or []
        if not actions or any(a.get("__mode__") != "sweep" for a in actions):
            n_nonsweep += 1
            continue
        if not replay_matches(doc):
            n_unreplayable += 1
            continue
        docs.append(doc)
        if max_plays and len(docs) >= max_plays:
            break
    if not docs:
        raise SystemExit("재현 가능한 sweep play가 없습니다.")

    cloud = _human_setup_cloud(docs)
    steps: List[Dict] = []
    for doc in docs:
        sid = str((doc.get("meta") or {}).get("scenario_id") or "?")
        steps.extend(step_choices(doc, cloud.get(sid, []), n_uniform, n_human, seed))
    if not steps:
        raise SystemExit("스텝 선택지를 만들지 못했습니다.")

    src = {
        "plays_dir": str(plays_dir),
        "n_files": n_files, "n_plays_used": len(docs),
        "n_nonsweep": n_nonsweep, "n_unreplayable": n_unreplayable,
        "candidates_per_step": {"uniform": n_uniform, "human_cloud": n_human,
                                "plus_chosen": 1},
        "estimand_note": (
            "계수는 후보 집합 정의에 조건부입니다 — 후보를 다르게 잡으면 "
            "다른 추정 대상이 됩니다."
        ),
    }
    if cache:
        _save_steps(Path(cache), steps, src)
    return _report(steps, src, l2, n_boot, seed)


def _report(steps: Sequence[Dict], src: Dict, l2: float, n_boot: int,
            seed: int) -> Dict:
    packed = _pack(steps)
    theta, diag = fit_steps(packed, l2=l2, record_history=True)
    coef = theta * SCALE_VEC
    mask = identifiable_mask(packed)
    boot = bootstrap_by_participant(steps, l2, n_boot, seed)

    return {
        "method": "step_conditional_maxent",
        "source": {**src, "l2": l2, "seed": seed, "bootstrap": n_boot},
        "feature_names": FEATURE_NAMES,
        "n_steps": len(steps),
        "n_participants": len({s["user_id"] for s in steps if s["user_id"]}),
        "n_scenarios": len({s["scenario_id"] for s in steps}),
        "reward_coef": dict(zip(FEATURE_NAMES, coef.tolist())),
        "identified": dict(zip(FEATURE_NAMES, mask.tolist())),
        "default_vs_fitted": {
            k: {"default": DEFAULT_REWARD_COEFS[k], "fitted": float(c),
                "delta": float(c) - DEFAULT_REWARD_COEFS[k]}
            for k, c in zip(FEATURE_NAMES, coef)
        },
        "convergence": {"iterations": diag["iterations"], "final_loss": diag["loss"],
                        "loss_history": diag.get("loss_history")},
        "fit_choice": choice_metrics(theta, packed),
        "prior_choice": choice_metrics(PRIOR_THETA, packed),
        "feature_matching": feature_matching(theta, packed),
        "l2_sensitivity": l2_sensitivity(packed),
        "conditioning": condition_report(theta, packed, l2),
        "group_contrast": group_contrast(steps, l2, max(n_boot // 2, 0), seed),
        "holdout": holdout_by_participant(steps, l2, seed),
        "coefficient_ci": {
            k: {
                "coef": float(coef[i]),
                "std": (boot["std"][i] if mask[i] else None),
                "ci_low": (boot["ci_low"][i] if mask[i] else None),
                "ci_high": (boot["ci_high"][i] if mask[i] else None),
                "identified": bool(mask[i]),
            }
            for i, k in enumerate(FEATURE_NAMES)
        },
        "bootstrap_n_ok": boot["n_ok"],
    }


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--plays", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--l2", type=float, default=1.0)
    ap.add_argument("--seed", type=int, default=0)
    ap.add_argument("--bootstrap", type=int, default=100)
    ap.add_argument("--cand-uniform", type=int, default=8,
                    help="스텝당 균등 영역 후보 수")
    ap.add_argument("--cand-human", type=int, default=8,
                    help="스텝당 사람 설치좌표 풀 후보 수")
    ap.add_argument("--max-plays", type=int, default=0)
    ap.add_argument("--cache", default="",
                    help="생성된 스텝 선택지 캐시(.npz). 있으면 재사용, 없으면 생성 후 저장 — "
                         "후보 생성이 실행 시간의 대부분이라 재분석이 초 단위가 된다")
    args = ap.parse_args()

    report = analyze(Path(args.plays), args.l2, args.bootstrap, args.seed,
                     args.cand_uniform, args.cand_human,
                     args.max_plays or None,
                     Path(args.cache) if args.cache else None)
    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"wrote {out}  steps={report['n_steps']} "
          f"top1={report['fit_choice']['top1']:.3f} "
          f"(chance {report['fit_choice']['chance']:.3f})")


if __name__ == "__main__":
    main()
