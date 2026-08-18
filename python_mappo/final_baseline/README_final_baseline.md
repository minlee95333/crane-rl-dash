# Final baseline: stabilized PyTorch Curriculum MAPPO

- source: outputs_curriculum_stabilized_l2
- selected because it improves Level 1/2/3 against Nearest while keeping completion 100% and executed hard overlap 0.

## L1_2C12L
- seen: MAPPO 212.093, Nearest 224.799, Random 222.458, Nearest improve 5.65%, completion 100.0%, hardExecuted 0.0
- unseen: MAPPO 232.351, Nearest 241.083, Random 256.487, Nearest improve 3.62%, completion 100.0%, hardExecuted 0.0

## L2_3C24L
- seen: MAPPO 333.133, Nearest 347.840, Random 358.890, Nearest improve 4.23%, completion 100.0%, hardExecuted 0.0
- validation: MAPPO 317.339, Nearest 355.474, Random 352.330, Nearest improve 10.73%, completion 100.0%, hardExecuted 0.0
- unseen: MAPPO 322.856, Nearest 338.000, Random 344.856, Nearest improve 4.48%, completion 100.0%, hardExecuted 0.0

## L3_4C36L
- seen: MAPPO 372.024, Nearest 401.108, Random 427.569, Nearest improve 7.25%, completion 100.0%, hardExecuted 0.0
- unseen: MAPPO 374.036, Nearest 399.452, Random 406.560, Nearest improve 6.36%, completion 100.0%, hardExecuted 0.0
