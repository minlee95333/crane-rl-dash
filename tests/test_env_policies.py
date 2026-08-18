import unittest

from crane_core.env import CraneSchedulingEnv


class HeuristicPolicyTests(unittest.TestCase):
    def setUp(self):
        self.env = CraneSchedulingEnv({
            'num_cranes': 1,
            'num_lifts': 2,
            'candidate_k': 2,
            'crane_radius': 20,
            'lift_setup_inner_fraction': 1.0,
            'max_steps': 10,
        })
        self.cranes = [{'id': 'C1', 'x': 10, 'y': 10}]
        # Both lifts are serviceable without moving. Candidate order keeps L-far
        # first, while a true nearest-lift policy must select L-near.
        self.lifts = [
            {'id': 'L-far', 'x': 25, 'y': 10, 'weightT': 1},
            {'id': 'L-near', 'x': 12, 'y': 10, 'weightT': 1},
        ]
        self.env.reset_layout(self.cranes, self.lifts)

    def test_nearest_and_radius_priority_choose_different_candidate_slots(self):
        candidates = self.env.candidate_actions(0)
        nearest_action = self.env.heuristic_actions('nearest')[0]
        radius_action = self.env.heuristic_actions('radiusPriority')[0]

        self.assertEqual(self.env.lifts[candidates[nearest_action]].id, 'L-near')
        self.assertEqual(self.env.lifts[candidates[radius_action]].id, 'L-far')
        self.assertNotEqual(nearest_action, radius_action)

    def test_policy_runs_produce_distinct_first_decisions(self):
        nearest = self.env.run_policy_layout('nearest', self.cranes, self.lifts)
        radius = self.env.run_policy_layout('radiusPriority', self.cranes, self.lifts)

        self.assertEqual(nearest['events'][0]['liftId'], 'L-near')
        self.assertEqual(radius['events'][0]['liftId'], 'L-far')
        self.assertNotEqual(
            [event['liftId'] for event in nearest['events']],
            [event['liftId'] for event in radius['events']],
        )

    def test_unknown_heuristic_policy_is_rejected(self):
        with self.assertRaisesRegex(ValueError, 'unsupported heuristic policy'):
            self.env.heuristic_actions('bogus')


class HeightOrderTests(unittest.TestCase):
    """height_order_radius: nearby lifts must go lower-z first, and the higher
    lift's hoist may not start before the lower one's hoist finishes."""

    def _make_env(self, radius):
        return CraneSchedulingEnv({
            'num_cranes': 2,
            'num_lifts': 3,
            'candidate_k': 3,
            'crane_radius': 30,
            'lift_setup_inner_fraction': 1.0,
            'max_steps': 20,
            'height_order_radius': radius,
        })

    # L-high sits 5 m from L-low (inside the 10 m rule) but higher, so L-low
    # must be erected first. L-free is 40 m away from both — unconstrained.
    CRANES = [{'id': 'C1', 'x': 10, 'y': 10}, {'id': 'C2', 'x': 60, 'y': 10}]
    LIFTS = [
        {'id': 'L-high', 'x': 20, 'y': 10, 'weightT': 1, 'z': 12},
        {'id': 'L-low', 'x': 25, 'y': 10, 'weightT': 1, 'z': 3},
        {'id': 'L-free', 'x': 62, 'y': 10, 'weightT': 1, 'z': 20},
    ]

    def test_requires_built_from_height_and_distance(self):
        env = self._make_env(10)
        env.reset_layout(self.CRANES, self.LIFTS)
        ids = {l.id: i for i, l in enumerate(env.lifts)}
        self.assertEqual(env._height_requires[ids['L-high']], [ids['L-low']])
        self.assertEqual(env._height_requires[ids['L-low']], [])
        self.assertEqual(env._height_requires[ids['L-free']], [])

    def test_higher_lift_masked_until_lower_done(self):
        env = self._make_env(10)
        env.reset_layout(self.CRANES, self.LIFTS)
        ids = {l.id: i for i, l in enumerate(env.lifts)}
        cands = env.candidate_actions(0)
        self.assertNotIn(ids['L-high'], cands)
        self.assertIn(ids['L-low'], cands)

    def test_plan_orders_lower_first_and_delays_hoist(self):
        env = self._make_env(10)
        result = env.run_policy_layout('nearest', self.CRANES, self.LIFTS)
        self.assertEqual(result['done'], 3)
        by_id = {e['liftId']: e for e in result['events']}
        low, high = by_id['L-low'], by_id['L-high']
        order = [e['liftId'] for e in result['events']]
        self.assertLess(order.index('L-low'), order.index('L-high'))
        self.assertGreaterEqual(high['liftStart'], low['liftFinish'] - 1e-9)
        self.assertEqual(result['heightOrder'], {'L-high': ['L-low']})

    def test_parallel_crane_waits_for_lower_neighbour_hoist(self):
        # C-far must travel to L-low (finishes late); idle C-near could hoist
        # L-high immediately — the height rule must delay its hoist past
        # L-low's liftFinish, leaving a visible wait after setup.
        env = self._make_env(10)
        cranes = [{'id': 'C-far', 'x': 80, 'y': 10}, {'id': 'C-near', 'x': 18, 'y': 10}]
        lifts = [
            {'id': 'L-high', 'x': 20, 'y': 10, 'weightT': 1, 'z': 12},
            {'id': 'L-low', 'x': 25, 'y': 10, 'weightT': 1, 'z': 3},
        ]
        result = env.run_policy_layout('nearest', cranes, lifts)
        self.assertEqual(result['done'], 2)
        by_id = {e['liftId']: e for e in result['events']}
        low, high = by_id['L-low'], by_id['L-high']
        self.assertGreaterEqual(high['liftStart'], low['liftFinish'] - 1e-9)
        # The wait shows up as a gap between setup end and hoist start.
        self.assertGreater(high['liftStart'], high['setupFinish'] + 1.0)

    def test_radius_zero_disables_ordering(self):
        env = self._make_env(0)
        env.reset_layout(self.CRANES, self.LIFTS)
        self.assertIsNone(env._height_requires)
        ids = {l.id: i for i, l in enumerate(env.lifts)}
        self.assertIn(ids['L-high'], env.candidate_actions(0))
        result = env.run_policy_layout('nearest', self.CRANES, self.LIFTS)
        self.assertEqual(result['done'], 3)
        self.assertIsNone(result['heightOrder'])


class CraneTypeCurveTests(unittest.TestCase):
    """Per-type rated-load curves: a crane whose type defines capacity_curve
    rates loads with it; other cranes keep the global curve; unknown types
    fall back to the global curve."""

    GLOBAL_CURVE = [
        {'radius': 3.0, 'capacityT': 50.0}, {'radius': 8.0, 'capacityT': 32.0},
        {'radius': 18.0, 'capacityT': 10.0},
    ]
    T100_CURVE = [
        {'radius': 3.0, 'capacityT': 100.0}, {'radius': 14.0, 'capacityT': 36.0},
        {'radius': 30.0, 'capacityT': 12.0},
    ]

    def _env(self):
        return CraneSchedulingEnv({
            'num_cranes': 2, 'num_lifts': 1, 'candidate_k': 3,
            'crane_radius': 18, 'lift_setup_inner_fraction': 1.0, 'max_steps': 10,
            'crane_capacity_curve': self.GLOBAL_CURVE,
            'crane_types': {'mobile_100t': {'capacity_curve': self.T100_CURVE}},
        })

    def test_type_curve_extends_allowed_radius_for_heavy_lift(self):
        env = self._env()
        cranes = [
            {'id': 'C-def', 'x': 10, 'y': 10},
            {'id': 'C-100', 'x': 90, 'y': 10, 'type': 'mobile_100t'},
        ]
        lifts = [{'id': 'L1', 'x': 50, 'y': 10, 'weightT': 30}]
        env.reset_layout(cranes, lifts)
        out_def = env.candidate_outcome(0, 0)
        out_100 = env.candidate_outcome(1, 0)
        # 30t: global curve allows out to 8m, the 100t curve out to 14m.
        self.assertAlmostEqual(out_def['maxRadius'], 8.0)
        self.assertAlmostEqual(out_100['maxRadius'], 14.0)

    def test_unknown_type_falls_back_to_global_curve(self):
        env = self._env()
        cranes = [{'id': 'C-x', 'x': 10, 'y': 10, 'type': 'tower'}]
        lifts = [{'id': 'L1', 'x': 30, 'y': 10, 'weightT': 30}]
        env.reset_layout(cranes, lifts)
        self.assertAlmostEqual(env.candidate_outcome(0, 0)['maxRadius'], 8.0)

    def test_over_50t_lift_requires_the_100t_class(self):
        # Weight cap was raised from 50t with the 100t class: an 80t lift must
        # survive clamping, be masked for the global(50t) curve, and be
        # liftable by a mobile_100t crane (100t@3m on its curve).
        lifts = [{'id': 'L-heavy', 'x': 50, 'y': 10, 'weightT': 80}]

        env = self._env()
        env.reset_layout([{'id': 'C-def', 'x': 45, 'y': 10}], lifts)
        self.assertAlmostEqual(env.lifts[0].weight_t, 80.0)  # not clamped to 50
        self.assertTrue(env.candidate_outcome(0, 0)['restricted'])

        env = self._env()
        result = env.run_policy_layout(
            'nearest', [{'id': 'C-100', 'x': 45, 'y': 10, 'type': 'mobile_100t'}], lifts)
        self.assertEqual(result['done'], 1)
        self.assertAlmostEqual(result['events'][0]['ratedMaxRadius'], 3.0)

    def test_mixed_fleet_plan_completes_and_events_carry_type_radius(self):
        env = self._env()
        cranes = [
            {'id': 'C-def', 'x': 45, 'y': 10},
            {'id': 'C-100', 'x': 55, 'y': 10, 'type': 'mobile_100t'},
        ]
        lifts = [{'id': 'L1', 'x': 50, 'y': 10, 'weightT': 30}]
        result = env.run_policy_layout('nearest', cranes, lifts)
        self.assertEqual(result['done'], 1)
        e = result['events'][0]
        expected = {'C-def': 8.0, 'C-100': 14.0}[e['craneId']]
        self.assertAlmostEqual(e['ratedMaxRadius'], expected)


class MixedFleetTypeAssignmentTests(unittest.TestCase):
    """crane_types[name]['count']: randomly generated scenarios assign the first
    `count` cranes that type (insertion order), the rest stay default. Assignment
    must not perturb seed-reproducible crane/lift positions."""

    def _cfg(self, **overrides):
        cfg = {
            'num_cranes': 3, 'num_lifts': 2, 'candidate_k': 2,
            'crane_radius': 18, 'lift_setup_inner_fraction': 1.0, 'max_steps': 10,
            'reward': {'p_move': -0.02},
            'crane_types': {'mobile_100t': {'count': 1, 'reward': {'p_move': -0.05}}},
        }
        cfg.update(overrides)
        return cfg

    def test_count_assigns_first_cranes_then_default(self):
        env = CraneSchedulingEnv(self._cfg())
        env.reset(7)
        self.assertEqual([c.type for c in env.cranes],
                         ['mobile_100t', 'default', 'default'])
        # Reward coefficients resolve per type: C1 uses the 100t override.
        self.assertAlmostEqual(env._coef(0, 'p_move'), -0.05)
        self.assertAlmostEqual(env._coef(1, 'p_move'), -0.02)

    def test_count_clamped_to_fleet_size(self):
        env = CraneSchedulingEnv(self._cfg(
            crane_types={'mobile_100t': {'count': 99, 'reward': {}}}))
        env.reset(7)
        self.assertEqual([c.type for c in env.cranes], ['mobile_100t'] * 3)

    def test_no_count_keeps_single_type_behavior(self):
        env = CraneSchedulingEnv(self._cfg(
            crane_types={'mobile_100t': {'reward': {'p_move': -0.05}}}))
        env.reset(7)
        self.assertEqual([c.type for c in env.cranes], ['default'] * 3)

    def test_count_max_samples_within_range_seed_deterministic(self):
        cfg = self._cfg(num_cranes=4, crane_types={
            'mobile_100t': {'count': 1, 'count_max': 3, 'reward': {}}})
        env = CraneSchedulingEnv(cfg)
        counts = {}
        for seed in range(40):
            env.reset(seed)
            counts[seed] = sum(1 for c in env.cranes if c.type == 'mobile_100t')
        # Every episode stays inside [1, 3] and the range is actually explored.
        self.assertTrue(all(1 <= n <= 3 for n in counts.values()), counts)
        self.assertEqual(sorted(set(counts.values())), [1, 2, 3])
        # Same seed → same composition (reproducible evaluation).
        env2 = CraneSchedulingEnv(cfg)
        for seed in (0, 7, 23):
            env2.reset(seed)
            self.assertEqual(sum(1 for c in env2.cranes if c.type == 'mobile_100t'),
                             counts[seed])

    def test_count_max_does_not_perturb_seeded_positions(self):
        fixed = CraneSchedulingEnv(self._cfg(num_cranes=4, crane_types={
            'mobile_100t': {'count': 1, 'reward': {}}}))
        ranged = CraneSchedulingEnv(self._cfg(num_cranes=4, crane_types={
            'mobile_100t': {'count': 1, 'count_max': 3, 'reward': {}}}))
        for seed in (3, 11):
            fixed.reset(seed)
            ranged.reset(seed)
            self.assertEqual([(c.x, c.y) for c in fixed.cranes],
                             [(c.x, c.y) for c in ranged.cranes])
            self.assertEqual([(l.x, l.y) for l in fixed.lifts],
                             [(l.x, l.y) for l in ranged.lifts])

    def test_type_assignment_does_not_perturb_seeded_positions(self):
        with_types = CraneSchedulingEnv(self._cfg())
        without_types = CraneSchedulingEnv(self._cfg(crane_types={}))
        with_types.reset(11)
        without_types.reset(11)
        self.assertEqual([(c.x, c.y) for c in with_types.cranes],
                         [(c.x, c.y) for c in without_types.cranes])
        self.assertEqual([(l.x, l.y) for l in with_types.lifts],
                         [(l.x, l.y) for l in without_types.lifts])


class TypeOperationTimeTests(unittest.TestCase):
    """crane_types[name]['setup_time'/'teardown_time']: a typed crane deploys /
    packs up with its own times; untyped cranes and configs without overrides
    keep the global values (numerically unchanged)."""

    def _env(self, crane_types=None):
        return CraneSchedulingEnv({
            'num_cranes': 2, 'num_lifts': 2, 'candidate_k': 2,
            'crane_radius': 30, 'lift_setup_inner_fraction': 1.0, 'max_steps': 10,
            'setup_time': 10.0, 'teardown_time': 5.0, 'fixed_duration': 25.0,
            'crane_types': crane_types or {},
        })

    CRANES = [
        {'id': 'C-def', 'x': 10, 'y': 10},
        {'id': 'C-100', 'x': 90, 'y': 90, 'type': 'mobile_100t'},
    ]
    LIFTS = [
        {'id': 'L1', 'x': 15, 'y': 10, 'weightT': 1},
        {'id': 'L2', 'x': 85, 'y': 90, 'weightT': 1},
    ]

    def test_typed_crane_uses_override_times(self):
        env = self._env({'mobile_100t': {'setup_time': 20.0, 'teardown_time': 8.0,
                                         'fixed_duration': 40.0}})
        env.reset_layout(self.CRANES, self.LIFTS)
        out_def = env.candidate_outcome(0, 0)
        out_100 = env.candidate_outcome(1, 1)
        self.assertAlmostEqual(out_def['setup'], 10.0)
        self.assertAlmostEqual(out_100['setup'], 20.0)
        # Hoist duration = liftFinish - liftStart: 25 global vs 40 override.
        self.assertAlmostEqual(out_def['liftFinish'] - out_def['liftStart'], 25.0)
        self.assertAlmostEqual(out_100['liftFinish'] - out_100['liftStart'], 40.0)

    def test_final_teardown_uses_type_time(self):
        env = self._env({'mobile_100t': {'setup_time': 20.0, 'teardown_time': 8.0}})
        result = env.run_policy_layout('nearest', self.CRANES, self.LIFTS)
        self.assertEqual(result['done'], 2)  # both lifts completed
        td = {e['craneId']: e.get('finalTeardown') for e in result['events']
              if e.get('finalTeardownApplied')}
        self.assertAlmostEqual(td['C-def'], 5.0)
        self.assertAlmostEqual(td['C-100'], 8.0)

    def test_no_override_is_numerically_identical(self):
        # A type entry without time overrides must not change any schedule number.
        base = self._env().run_policy_layout('nearest', self.CRANES, self.LIFTS)
        typed = self._env({'mobile_100t': {'reward': {}}}).run_policy_layout(
            'nearest', self.CRANES, self.LIFTS)
        self.assertEqual(base['makespan'], typed['makespan'])
        self.assertEqual(
            [(e['liftId'], e['start'], e['finish']) for e in base['events']],
            [(e['liftId'], e['start'], e['finish']) for e in typed['events']],
        )


class TypeCraneRadiusTests(unittest.TestCase):
    """crane_types[name]['crane_radius']: a typed crane reaches (and endangers)
    its own working radius; untyped cranes keep the global one."""

    def _env(self, crane_types=None, curve=None):
        cfg = {
            'num_cranes': 2, 'num_lifts': 1, 'candidate_k': 2,
            'crane_radius': 18.0, 'lift_setup_inner_fraction': 1.0, 'max_steps': 10,
            'crane_types': crane_types or {},
        }
        if curve:
            cfg['crane_capacity_curve'] = curve
        return CraneSchedulingEnv(cfg)

    CRANES = [
        {'id': 'C-def', 'x': 10, 'y': 10},
        {'id': 'C-big', 'x': 90, 'y': 10, 'type': 'crawler_200t'},
    ]

    def test_type_radius_extends_reach_without_curve(self):
        env = self._env({'crawler_200t': {'crane_radius': 30.0}})
        env.reset_layout(self.CRANES, [{'id': 'L1', 'x': 50, 'y': 10, 'weightT': 1}])
        self.assertAlmostEqual(env.candidate_outcome(0, 0)['maxRadius'], 18.0)
        self.assertAlmostEqual(env.candidate_outcome(1, 0)['maxRadius'], 30.0)

    def test_type_radius_caps_type_curve(self):
        # Type curve rates 30t out to 30m, but the type radius caps it at 10m.
        env = self._env({'crawler_200t': {
            'crane_radius': 10.0,
            'capacity_curve': [{'radius': 3.0, 'capacityT': 100.0},
                               {'radius': 30.0, 'capacityT': 30.0}],
        }})
        env.reset_layout(self.CRANES, [{'id': 'L1', 'x': 50, 'y': 10, 'weightT': 30}])
        self.assertAlmostEqual(env.candidate_outcome(1, 0)['maxRadius'], 10.0)

    def test_events_carry_type_radius_for_interference(self):
        env = self._env({'crawler_200t': {'crane_radius': 30.0}})
        result = env.run_policy_layout('nearest', self.CRANES, [
            {'id': 'L1', 'x': 12, 'y': 10, 'weightT': 1},
            {'id': 'L2', 'x': 88, 'y': 10, 'weightT': 1},
        ])
        radii = {e['craneId']: e['craneRadius'] for e in result['events']}
        self.assertAlmostEqual(radii['C-def'], 18.0)
        self.assertAlmostEqual(radii['C-big'], 30.0)


class ObsTypeFeatureTests(unittest.TestCase):
    """cfg['obs_type_features']: appends 4 crane-capability floats (rated capacity
    + time ratios) to each observation row so agents can see their own tonnage.
    Off by default — 17-dim layout and values must stay identical."""

    def _cfg(self, obs_flag, crane_types=None):
        return {
            'num_cranes': 2, 'num_lifts': 2, 'candidate_k': 2,
            'crane_radius': 18, 'lift_setup_inner_fraction': 1.0, 'max_steps': 10,
            'setup_time': 10.0, 'teardown_time': 5.0, 'fixed_duration': 25.0,
            'obs_type_features': obs_flag,
            'crane_capacity_curve': [
                {'radius': 3.0, 'capacityT': 50.0}, {'radius': 18.0, 'capacityT': 10.0}],
            'crane_types': crane_types or {},
        }

    T100 = {'mobile_100t': {
        'count': 1, 'fixed_duration': 40.0, 'setup_time': 20.0,
        'capacity_curve': [{'radius': 3.0, 'capacityT': 100.0},
                           {'radius': 30.0, 'capacityT': 12.0}],
    }}

    def test_default_off_keeps_17_dims(self):
        env = CraneSchedulingEnv(self._cfg(False, self.T100))
        obs, masks, _ = env.reset(3)
        self.assertEqual(obs.shape[-1], 17)

    def test_flag_on_appends_capability_features(self):
        env = CraneSchedulingEnv(self._cfg(True, self.T100))
        obs, masks, _ = env.reset(3)
        self.assertEqual(obs.shape[-1], 21)
        # C1 is mobile_100t (count=1): cap 100/100, duration 40/25, setup 20/10,
        # teardown falls back to global → ratio 1.0.
        f100 = obs[0, 0, 17:21].tolist()
        self.assertAlmostEqual(f100[0], 1.0, places=5)
        self.assertAlmostEqual(f100[1], 40.0 / 25.0, places=5)
        self.assertAlmostEqual(f100[2], 2.0, places=5)
        self.assertAlmostEqual(f100[3], 1.0, places=5)
        # C2 is the untyped 50t default: cap 50/100, all ratios 1.0.
        fdef = obs[1, 0, 17:21].tolist()
        self.assertAlmostEqual(fdef[0], 0.5, places=5)
        self.assertEqual(fdef[1:], [1.0, 1.0, 1.0])

    def test_flag_on_preserves_first_17_dims(self):
        off = CraneSchedulingEnv(self._cfg(False, self.T100))
        on = CraneSchedulingEnv(self._cfg(True, self.T100))
        obs_off, _, _ = off.reset(5)
        obs_on, _, _ = on.reset(5)
        self.assertTrue((obs_off == obs_on[:, :, :17]).all())


if __name__ == '__main__':
    unittest.main()
