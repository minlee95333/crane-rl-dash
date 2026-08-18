import math
import random
import unittest
from unittest.mock import patch

import numpy as np
import torch
from torch.distributions import Categorical

from rl_trainer.mappo import MAPPOAgent, Transition, _epsilon_mixture_log_prob
from rl_trainer.train import seed_everything


class EpsilonBehaviorProbabilityTests(unittest.TestCase):
    def setUp(self):
        self.agent = MAPPOAgent(
            obs_dim=1,
            state_dim=1,
            cfg={'mappo': {'hidden_dim': 4}},
        )

    def test_act_records_probability_of_epsilon_mixture(self):
        probs = torch.tensor([
            [0.8, 0.2, 0.0],
            [0.1, 0.3, 0.6],
        ])
        dist = Categorical(probs=probs)
        obs = np.zeros((2, 3, 1), dtype=np.float32)
        mask = np.array([
            [True, True, False],
            [True, True, True],
        ])

        with (
            patch.object(self.agent.actor, 'distribution', return_value=dist),
            patch('rl_trainer.mappo.random.random', return_value=0.0),
            patch('rl_trainer.mappo.random.choice', side_effect=lambda valid: valid[-1]),
        ):
            actions, logps = self.agent.act(obs, mask, epsilon=0.25)

        self.assertEqual(actions, [1, 2])
        expected = [0.75 * 0.2 + 0.25 / 2, 0.75 * 0.6 + 0.25 / 3]
        for actual_logp, expected_prob in zip(logps, expected):
            self.assertAlmostEqual(math.exp(actual_logp), expected_prob, places=6)

    def test_act_rejects_invalid_epsilon(self):
        obs = np.zeros((1, 1, 1), dtype=np.float32)
        mask = np.ones((1, 1), dtype=bool)
        with self.assertRaises(ValueError):
            self.agent.act(obs, mask, epsilon=1.01)

    def test_current_and_old_behavior_probabilities_match_before_update(self):
        probs = torch.tensor([[0.7, 0.3]])
        dist = Categorical(probs=probs)
        mask = torch.tensor([[True, True]])
        action = torch.tensor([1])
        epsilon = 0.4
        old_logp = _epsilon_mixture_log_prob(dist, action, mask, epsilon)
        current_logp = _epsilon_mixture_log_prob(
            dist, action, mask, torch.tensor([epsilon]),
        )
        self.assertAlmostEqual(
            torch.exp(current_logp - old_logp).item(), 1.0, places=7,
        )

        transition = Transition(
            agent=0,
            obs=np.zeros((2, 1), dtype=np.float32),
            mask=np.ones(2, dtype=bool),
            state=np.zeros(1, dtype=np.float32),
            action=1,
            logp=old_logp.item(),
            value=0.0,
            reward=0.0,
            done=False,
            epsilon=epsilon,
        )
        self.assertEqual(transition.epsilon, epsilon)

    def test_update_uses_epsilon_transition_without_invalid_ratio(self):
        epsilon = 0.2
        obs = np.zeros((1, 2, 1), dtype=np.float32)
        mask = np.ones((1, 2), dtype=bool)
        transitions = []
        for reward, done in ((1.0, False), (-0.25, True)):
            actions, logps = self.agent.act(obs, mask, epsilon=epsilon)
            transitions.append(Transition(
                agent=0,
                obs=obs[0].copy(),
                mask=mask[0].copy(),
                state=np.zeros(1, dtype=np.float32),
                action=actions[0],
                logp=logps[0],
                value=0.0,
                reward=reward,
                done=done,
                epsilon=epsilon,
            ))

        losses = self.agent.update(transitions)
        self.assertTrue(losses)
        self.assertTrue(all(math.isfinite(value) for value in losses.values()))


class TrainingSeedTests(unittest.TestCase):
    def test_seed_everything_reproduces_all_training_rngs(self):
        seed_everything(314)
        first = (random.random(), np.random.random(), torch.rand(1).item())
        seed_everything(314)
        second = (random.random(), np.random.random(), torch.rand(1).item())
        self.assertEqual(first, second)


if __name__ == '__main__':
    unittest.main()
