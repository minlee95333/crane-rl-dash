import math
import unittest

from crane_core.cost import estimate_cost, validate_rates, validate_result


def sample_result():
    return {
        'makespan': 20.0,
        'moveTotal': 6.0,
        'setupTotal': 4.0,
        'teardownTotal': 3.0,
        'cranes': [{'id': 'C1', 'type': 'mobile'}],
        'events': [{
            'craneId': 'C1',
            'teardown': 1.0,
            'finalTeardown': 2.0,
            'travel': 3.0,
            'setup': 4.0,
            'duration': 5.0,
            'move': 6.0,
            'finish': 15.0,
        }],
    }


class CostEstimatorTests(unittest.TestCase):
    def test_estimates_itemized_cost_from_valid_payload(self):
        cost = estimate_cost(sample_result(), rates={
            'rentalPerMin': {'mobile': 100.0},
            'idlePerMin': {'mobile': 50.0},
            'fuelPerMoveUnit': 2.0,
            'laborPerMin': 10.0,
        })

        # Rental bills hoisting only: duration 5.0 × 100.
        self.assertEqual(cost['items']['rental']['cost'], 500.0)
        # Idle is makespan 20 − working 15 = 5, × 50.
        self.assertEqual(cost['items']['idle']['cost'], 250.0)
        self.assertEqual(cost['items']['fuel']['cost'], 12.0)
        # Operator is paid for the crane's whole time on site: working 15 +
        # waiting 5 = 20 (= makespan), × 10.
        self.assertEqual(cost['items']['labor']['cost'], 200.0)
        self.assertEqual(cost['totalCost'], 962.0)

    def test_each_line_uses_its_own_time_basis(self):
        """The four lines deliberately measure different spans; a fixture where
        every span differs keeps them from agreeing by accident."""
        cost = estimate_cost(sample_result(), rates={
            'rentalPerMin': {'mobile': 1.0},
            'idlePerMin': {'mobile': 1.0},
            'fuelPerMoveUnit': 1.0,
            'laborPerMin': 1.0,
        })
        self.assertEqual(cost['items']['rental']['cost'], 5.0)    # hoist
        self.assertEqual(cost['items']['idle']['cost'], 5.0)      # waiting
        self.assertEqual(cost['items']['fuel']['cost'], 6.0)      # distance
        self.assertEqual(cost['items']['labor']['cost'], 20.0)    # whole project

        per = cost['perCrane'][0]
        self.assertEqual(per['hoistMin'], 5.0)
        self.assertEqual(per['busyMin'], 15.0)
        self.assertEqual(per['idleMin'], 5.0)
        self.assertEqual(per['onsiteMin'], 20.0)
        self.assertEqual(per['onsiteMin'], per['busyMin'] + per['idleMin'])

    def test_labor_label_and_detail(self):
        cost = estimate_cost(sample_result(), rates={'laborPerMin': 10.0})
        labor = cost['items']['labor']
        self.assertEqual(labor['label'], '노무비')
        self.assertIn('전체 공정시간 20.0분', labor['detail'])
        self.assertNotIn('설치', labor['detail'])
        self.assertNotIn('해체', labor['detail'])

    def test_rental_excludes_setup_travel_teardown(self):
        """Only lifting is productive equipment time. Zeroing the non-lifting
        spans must leave rental untouched (and shrink nothing but idle)."""
        base = estimate_cost(sample_result(), rates={'rentalPerMin': {'mobile': 100.0}})
        lean = sample_result()
        for e in lean['events']:
            e['teardown'] = e['finalTeardown'] = e['travel'] = e['setup'] = 0.0
        lean['setupTotal'] = 0.0
        lean['teardownTotal'] = 0.0
        out = estimate_cost(lean, rates={'rentalPerMin': {'mobile': 100.0}})
        self.assertEqual(out['items']['rental']['cost'], base['items']['rental']['cost'])

    def test_labor_scales_with_crane_count(self):
        """Labor is the one line that grows with fleet size: a second crane is a
        second operator on the clock for the whole project, even idling."""
        one = estimate_cost(sample_result(), rates={'laborPerMin': 10.0})
        result = sample_result()
        result['cranes'].append({'id': 'C2', 'type': 'mobile'})
        result['events'].append({
            'craneId': 'C2', 'teardown': 0.0, 'finalTeardown': 0.0, 'travel': 0.0,
            'setup': 0.0, 'duration': 1.0, 'move': 0.0, 'finish': 5.0,
        })
        two = estimate_cost(result, rates={'laborPerMin': 10.0})
        # C2 is on site for the full makespan (20) regardless of doing 1 minute
        # of work, so labor grows by a whole makespan of wages.
        self.assertEqual(two['items']['labor']['cost'],
                         one['items']['labor']['cost'] + 200.0)

    def test_labor_includes_idle_time(self):
        """Stretching makespan without adding work still costs operator wages —
        the crew waits on site."""
        base = estimate_cost(sample_result(), rates={'laborPerMin': 10.0})
        stretched = sample_result()
        stretched['makespan'] = 50.0
        out = estimate_cost(stretched, rates={'laborPerMin': 10.0})
        self.assertGreater(out['items']['labor']['cost'], base['items']['labor']['cost'])
        self.assertEqual(out['items']['labor']['cost'], 500.0)  # 50 min × 10

    def test_rejects_negative_nonfinite_and_unknown_rates(self):
        invalid_rates = (
            {'laborPerMin': -1},
            {'fuelPerMoveUnit': math.nan},
            {'rentalPerMin': {'_default': math.inf}},
            {'typoRate': 10},
        )
        for rates in invalid_rates:
            with self.subTest(rates=rates), self.assertRaises(ValueError):
                validate_rates(rates)

    def test_rejects_invalid_result_numbers_and_structure(self):
        invalid_results = []
        missing_events = sample_result()
        missing_events.pop('events')
        invalid_results.append(missing_events)
        negative_total = sample_result()
        negative_total['moveTotal'] = -1
        invalid_results.append(negative_total)
        inconsistent_total = sample_result()
        inconsistent_total['setupTotal'] = 0
        invalid_results.append(inconsistent_total)
        nonfinite_event = sample_result()
        nonfinite_event['events'][0]['duration'] = math.inf
        invalid_results.append(nonfinite_event)
        overlong_busy_time = sample_result()
        overlong_busy_time['makespan'] = 10
        invalid_results.append(overlong_busy_time)

        for result in invalid_results:
            with self.subTest(result=result), self.assertRaises(ValueError):
                validate_result(result)

    def test_accepts_subminute_float_drift_past_makespan(self):
        # The simulator's accumulated finish can sit a few ten-thousandths of a
        # minute past the separately rounded makespan (observed drift ~5e-4).
        # That float noise must not be rejected as an overrun.
        drift_finish = {
            'makespan': 200.0,
            'events': [{'craneId': 'C1', 'duration': 5.0, 'finish': 200.0004}],
        }
        validate_result(drift_finish)  # should not raise

        drift_busy = {
            'makespan': 20.0,
            'events': [{'craneId': 'C1', 'duration': 20.0004, 'finish': 20.0}],
        }
        validate_result(drift_busy)  # should not raise

    def test_still_rejects_real_makespan_overrun(self):
        real_overrun = {
            'makespan': 200.0,
            'events': [{'craneId': 'C1', 'duration': 5.0, 'finish': 200.5}],
        }
        with self.assertRaisesRegex(ValueError, 'exceeds result.makespan'):
            validate_result(real_overrun)

    def test_rejects_cost_overflow(self):
        with self.assertRaisesRegex(ValueError, 'not finite'):
            estimate_cost(sample_result(), rates={
                'rentalPerMin': {'mobile': 1e308},
                'idlePerMin': 1e308,
                'fuelPerMoveUnit': 1e308,
                'laborPerMin': 1e308,
            })


if __name__ == '__main__':
    unittest.main()
