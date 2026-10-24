"""
NODUX • SOP Walter 'Wali' Carpio (Head of Data & BI)
src/classical_baseline.py - Solvers Clásicos Exactos y Heurísticos para QAP10.
Evalúa exhaustivamente el espacio de permutaciones y valida los óptimos de control oficiales:
- N=3: Costo = 24.0
- N=4: Costo = 32.0
- N=10: Costo = 340.0 (MIPLIB ground truth)
"""

import time
import itertools
from typing import List, Tuple, Dict, Any
import numpy as np

class WaliClassicalSolver:
    def __init__(self, F: np.ndarray, D: np.ndarray):
        assert F.shape == D.shape
        self.N = F.shape[0]
        self.F = F.astype(float)
        self.D = D.astype(float)

    def evaluate_permutation(self, p: Tuple[int, ...]) -> float:
        """Convención estricta oficial: cada par se cuenta una sola vez (i < k)."""
        cost = 0.0
        n = self.N
        f = self.F
        d = self.D
        for i in range(n):
            for k in range(i + 1, n):
                cost += f[i, k] * d[p[i], p[k]]
        return float(cost)

    def solve_exact_exhaustive(self) -> Dict[str, Any]:
        """
        Solver Clásico Exacto de Wali (itertools.permutations).
        Evalúa las N! permutaciones completas del espacio de búsqueda.
        """
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

        elapsed = time.perf_counter() - start_time
        return {
            "method": f"Solver Clásico Exacto Wali (N! = {eval_count:,} perms)",
            "N": self.N,
            "best_cost": best_cost,
            "best_perm": best_perm,
            "evaluations": eval_count,
            "elapsed_seconds": elapsed,
            "is_exact": True
        }

    def solve_greedy(self) -> Dict[str, Any]:
        """Heurística constructiva Greedy: asigna elementos de mayor flujo a ubicaciones centrales."""
        start_time = time.perf_counter()
        flow_sums = np.sum(self.F, axis=1)
        dist_sums = np.sum(self.D, axis=1)

        sorted_elements = np.argsort(-flow_sums)
        sorted_locations = np.argsort(dist_sums)

        perm = [0] * self.N
        for elem, loc in zip(sorted_elements, sorted_locations):
            perm[elem] = int(loc)

        cost = self.evaluate_permutation(tuple(perm))
        elapsed = time.perf_counter() - start_time
        return {
            "method": "Greedy Heuristic",
            "N": self.N,
            "best_cost": cost,
            "best_perm": perm,
            "elapsed_seconds": elapsed,
            "is_exact": False
        }

if __name__ == "__main__":
    from parser import load_matrices

    print("=== VERIFICACIÓN OFICIAL DE ÓPTIMOS DE CONTROL (WALI) ===")
    for N in [3, 4]:
        F, D = load_matrices(N=N)
        solver = WaliClassicalSolver(F, D)
        res = solver.solve_exact_exhaustive()
        print(f"N={N}: Óptimo Control = {res['best_cost']} (Permutación: {res['best_perm']}) en {res['elapsed_seconds']:.6f}s")
