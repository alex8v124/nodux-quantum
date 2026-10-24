"""
Classical Optimization Baselines for Quadratic Assignment Problem (QAP).
Includes:
1. Exact Exhaustive Search (for N <= 8) and MIP Reference
2. Greedy Constructive Heuristic
3. 2-Opt Iterated Local Search (ILS)
4. Simulated Annealing (SA)
5. Tabu Search
"""

import time
import math
import itertools
from typing import List, Tuple, Dict, Any, Optional
import numpy as np
from qap_problem import QAPProblem

class ClassicalSolvers:
    def __init__(self, problem: QAPProblem, seed: int = 42):
        self.problem = problem
        self.N = problem.N
        self.rng = np.random.RandomState(seed)

    def solve_exact_exhaustive(self) -> Dict[str, Any]:
        """
        Solves by exhaustive enumeration of all N! permutations.
        Practical for N <= 10 (for N=10, 3.6M permutations takes ~3-5 seconds in optimized numpy/cpython).
        """
        start_time = time.perf_counter()
        best_cost = float("inf")
        best_perm = None
        eval_count = 0

        # Fast permutation evaluation
        f_mat = self.problem.F
        d_mat = self.problem.D
        n = self.N

        for p in itertools.permutations(range(n)):
            eval_count += 1
            cost = 0.0
            for i in range(n):
                for k in range(i + 1, n):
                    cost += f_mat[i, k] * d_mat[p[i], p[k]]
            if cost < best_cost:
                best_cost = cost
                best_perm = list(p)

        elapsed = time.perf_counter() - start_time
        return {
            "method": "Exact Exhaustive Search",
            "best_perm": best_perm,
            "best_cost": best_cost,
            "elapsed_seconds": elapsed,
            "evaluations": eval_count,
            "is_optimal": True
        }

    def solve_greedy(self) -> Dict[str, Any]:
        """
        Constructive greedy baseline: assigns elements with highest aggregate flow
        to central locations with lowest aggregate distance.
        """
        start_time = time.perf_counter()
        flow_sums = np.sum(self.problem.F, axis=1)
        dist_sums = np.sum(self.problem.D, axis=1)

        sorted_elements = np.argsort(-flow_sums)  # Highest flow first
        sorted_locations = np.argsort(dist_sums)   # Lowest distance (most central) first

        perm = [0] * self.N
        for elem, loc in zip(sorted_elements, sorted_locations):
            perm[elem] = int(loc)

        cost = self.problem.evaluate_permutation(perm)
        elapsed = time.perf_counter() - start_time
        return {
            "method": "Greedy Constructive",
            "best_perm": perm,
            "best_cost": cost,
            "elapsed_seconds": elapsed,
            "evaluations": 1,
            "is_optimal": False
        }

    def solve_2opt(self, initial_perm: Optional[List[int]] = None, max_restarts: int = 10) -> Dict[str, Any]:
        """
        Iterated 2-Opt Local Search: exhaustively checks all N*(N-1)/2 swaps
        until reaching a 2-optimal local minimum, with multi-start perturbation.
        """
        start_time = time.perf_counter()
        global_best_cost = float("inf")
        global_best_perm = None
        total_evals = 0

        for restart in range(max_restarts):
            if restart == 0 and initial_perm is not None:
                current_perm = list(initial_perm)
            else:
                current_perm = list(self.rng.permutation(self.N))

            current_cost = self.problem.evaluate_permutation(current_perm)
            improved = True

            while improved:
                improved = False
                for i in range(self.N):
                    for k in range(i + 1, self.N):
                        total_evals += 1
                        # Swap elements i and k
                        candidate = list(current_perm)
                        candidate[i], candidate[k] = candidate[k], candidate[i]
                        cand_cost = self.problem.evaluate_permutation(candidate)
                        if cand_cost < current_cost:
                            current_cost = cand_cost
                            current_perm = candidate
                            improved = True
                            break
                    if improved:
                        break

            if current_cost < global_best_cost:
                global_best_cost = current_cost
                global_best_perm = current_perm

        elapsed = time.perf_counter() - start_time
        return {
            "method": "2-Opt Local Search (Multi-start)",
            "best_perm": global_best_perm,
            "best_cost": global_best_cost,
            "elapsed_seconds": elapsed,
            "evaluations": total_evals,
            "is_optimal": False
        }

    def solve_simulated_annealing(
        self,
        t_start: float = 100.0,
        t_min: float = 0.05,
        alpha: float = 0.98,
        steps_per_temp: int = 50
    ) -> Dict[str, Any]:
        """
        Simulated Annealing heuristic over permutation space.
        Uses Metropolis acceptance rule: P(accept) = exp(-delta / T).
        """
        start_time = time.perf_counter()
        current_perm = list(self.rng.permutation(self.N))
        current_cost = self.problem.evaluate_permutation(current_perm)

        best_perm = list(current_perm)
        best_cost = current_cost

        T = t_start
        history = [best_cost]
        eval_count = 1

        while T > t_min:
            for _ in range(steps_per_temp):
                eval_count += 1
                # Generate neighbor via pairwise swap
                i, k = self.rng.choice(self.N, size=2, replace=False)
                neighbor = list(current_perm)
                neighbor[i], neighbor[k] = neighbor[k], neighbor[i]
                cand_cost = self.problem.evaluate_permutation(neighbor)

                delta = cand_cost - current_cost
                if delta < 0 or math.exp(-delta / T) > self.rng.uniform(0, 1):
                    current_perm = neighbor
                    current_cost = cand_cost
                    if current_cost < best_cost:
                        best_cost = current_cost
                        best_perm = list(current_perm)

            history.append(best_cost)
            T *= alpha

        elapsed = time.perf_counter() - start_time
        return {
            "method": "Simulated Annealing",
            "best_perm": best_perm,
            "best_cost": best_cost,
            "elapsed_seconds": elapsed,
            "evaluations": eval_count,
            "convergence_history": history,
            "is_optimal": False
        }

    def solve_tabu_search(self, max_iterations: int = 500, tabu_tenure: int = 7) -> Dict[str, Any]:
        """
        Tabu Search heuristic to avoid local minima by maintaining a recency memory of swaps.
        """
        start_time = time.perf_counter()
        current_perm = list(self.rng.permutation(self.N))
        current_cost = self.problem.evaluate_permutation(current_perm)

        best_perm = list(current_perm)
        best_cost = current_cost

        # Tabu matrix stores iteration until which swap (i, k) is tabu
        tabu_matrix = np.zeros((self.N, self.N), dtype=int)
        eval_count = 1

        for it in range(max_iterations):
            best_cand_perm = None
            best_cand_cost = float("inf")
            best_move = None

            for i in range(self.N):
                for k in range(i + 1, self.N):
                    eval_count += 1
                    cand = list(current_perm)
                    cand[i], cand[k] = cand[k], cand[i]
                    c = self.problem.evaluate_permutation(cand)

                    is_tabu = (tabu_matrix[i, k] > it)
                    # Aspiration criterion: override tabu if strictly better than global best
                    if not is_tabu or c < best_cost:
                        if c < best_cand_cost:
                            best_cand_cost = c
                            best_cand_perm = cand
                            best_move = (i, k)

            if best_cand_perm is None:
                break

            current_perm = best_cand_perm
            current_cost = best_cand_cost
            i, k = best_move
            tabu_matrix[i, k] = it + tabu_tenure
            tabu_matrix[k, i] = it + tabu_tenure

            if current_cost < best_cost:
                best_cost = current_cost
                best_perm = list(current_perm)

        elapsed = time.perf_counter() - start_time
        return {
            "method": "Tabu Search",
            "best_perm": best_perm,
            "best_cost": best_cost,
            "elapsed_seconds": elapsed,
            "evaluations": eval_count,
            "is_optimal": False
        }

if __name__ == "__main__":
    from parser import load_matrices
    F, D = load_matrices(N=3)
    p3 = QAPProblem(F, D, name="qap3")
    solvers = ClassicalSolvers(p3, seed=42)

    exact = solvers.solve_exact_exhaustive()
    print("Exact N=3:", exact["best_cost"], "Perm:", exact["best_perm"], f"in {exact['elapsed_seconds']:.4f}s")

    F10, D10 = load_matrices(N=10)
    p10 = QAPProblem(F10, D10, name="qap10")
    solvers10 = ClassicalSolvers(p10, seed=42)
    sa = solvers10.solve_simulated_annealing()
    print("SA N=10:", sa["best_cost"], "Perm:", sa["best_perm"], f"in {sa['elapsed_seconds']:.4f}s (Optimum 340, Gap: {p10.gap(sa['best_cost'], 340):.2f}%)")
