"""
NODUX • SOP Walter 'Wali' Carpio
src/classical_solver.py - Baseline Clásico y Verificación de Ground Truths.
"""

import time
import itertools
from typing import List, Tuple, Dict, Any
import numpy as np

class ClassicalSolver:
    def __init__(self, F: np.ndarray, D: np.ndarray):
        assert F.shape == D.shape
        self.N = F.shape[0]
        self.F = F.astype(float)
        self.D = D.astype(float)

    def evaluate_permutation(self, p: Tuple[int, ...]) -> float:
        """Convención estricta: cada par se cuenta una sola vez (i < k)."""
        cost = 0.0
        n = self.N
        f = self.F
        d = self.D
        for i in range(n):
            for k in range(i + 1, n):
                cost += f[i, k] * d[p[i], p[k]]
        return float(cost)

    def solve_exact(self) -> Dict[str, Any]:
        start_time = time.perf_counter()
        best_cost = float("inf")
        best_perm = None
        eval_count = 0

        for p in itertools.permutations(range(self.N)):
            eval_count += 1
            c = self.evaluate_permutation(p)
            if c < best_cost:
                best_cost = c
                best_perm = list(p)

        elapsed_ms = (time.perf_counter() - start_time) * 1000.0
        return {
            "best_cost": best_cost,
            "best_perm": best_perm,
            "execution_time_ms": round(elapsed_ms, 2),
            "evaluations": eval_count
        }

    def solve_heuristic_n10(self, max_restarts: int = 5) -> Dict[str, Any]:
        """Solver heurístico clásico para N=10 mediante 2-Opt Iterated Local Search."""
        start_time = time.perf_counter()
        rng = np.random.RandomState(42)
        global_best_cost = float("inf")
        global_best_perm = None
        eval_count = 0

        # Constructive greedy initialization
        flow_sums = np.sum(self.F, axis=1)
        dist_sums = np.sum(self.D, axis=1)
        greedy_perm = [0] * self.N
        for elem, loc in zip(np.argsort(-flow_sums), np.argsort(dist_sums)):
            greedy_perm[elem] = int(loc)

        for restart in range(max_restarts):
            if restart == 0:
                current_perm = list(greedy_perm)
            else:
                current_perm = list(rng.permutation(self.N))

            current_cost = self.evaluate_permutation(tuple(current_perm))
            eval_count += 1
            improved = True

            while improved:
                improved = False
                for i in range(self.N):
                    for j in range(i + 1, self.N):
                        cand_perm = list(current_perm)
                        cand_perm[i], cand_perm[j] = cand_perm[j], cand_perm[i]
                        c = self.evaluate_permutation(tuple(cand_perm))
                        eval_count += 1
                        if c < current_cost:
                            current_cost = c
                            current_perm = cand_perm
                            improved = True
                            break
                    if improved:
                        break

            if current_cost < global_best_cost:
                global_best_cost = current_cost
                global_best_perm = current_perm

        elapsed_ms = (time.perf_counter() - start_time) * 1000.0
        return {
            "best_cost": float(global_best_cost),
            "best_perm": [int(x) for x in global_best_perm],
            "execution_time_ms": round(elapsed_ms, 2),
            "evaluations": eval_count,
            "method": "2-Opt Iterated Local Search"
        }
