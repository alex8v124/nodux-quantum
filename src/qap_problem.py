"""
QAP Problem Definition, Evaluation, and Constraint Validation Module.
Handles cost evaluation, permutation mapping, binary vector mapping,
QUBO penalty computation, and classical repair (bipartite matching).
"""

from typing import List, Tuple, Dict, Union, Optional
import numpy as np
from scipy.optimize import linear_sum_assignment

class QAPProblem:
    def __init__(self, F: np.ndarray, D: np.ndarray, name: str = "qap"):
        """
        Initializes a Quadratic Assignment Problem.
        Args:
            F: Flow matrix of shape (N, N), symmetric with zero diagonal.
            D: Distance matrix of shape (N, N), symmetric with zero diagonal.
            name: Instance identifier.
        """
        assert F.shape == D.shape, "F and D must have identical shapes"
        assert F.shape[0] == F.shape[1], "F must be square"
        self.N = F.shape[0]
        self.F = F.astype(float)
        self.D = D.astype(float)
        self.name = name
        self.num_qubits = self.N * self.N

        # Compute theoretical bound for penalty parameter lambda
        # Delta C_max = max_i(sum_{k != i} F_ik) * max(D)
        max_flow_row = float(np.max(np.sum(self.F, axis=1)))
        max_d = float(np.max(self.D))
        self.delta_c_max = max_flow_row * max_d
        self.lambda_min_theoretical = float((self.N - 1) * np.max(self.F) * max_d)
        # Recommended robust penalty parameter for QUBO: lambda = 60.0
        self.recommended_lambda = 60.0

    def evaluate_permutation(self, perm: Union[List[int], Tuple[int, ...], np.ndarray]) -> float:
        """
        Evaluates objective function for a valid permutation pi where element i is placed at location pi[i].
        Uses single-pair convention (i < k) matching MIPLIB reference.
        """
        cost = 0.0
        n = self.N
        for i in range(n):
            for k in range(i + 1, n):
                cost += self.F[i, k] * self.D[perm[i], perm[k]]
        return float(cost)

    def perm_to_matrix(self, perm: Union[List[int], Tuple[int, ...], np.ndarray]) -> np.ndarray:
        """Converts permutation pi to binary matrix X where X[i, pi[i]] = 1."""
        X = np.zeros((self.N, self.N), dtype=int)
        for i, loc in enumerate(perm):
            X[i, loc] = 1
        return X

    def perm_to_bitstring(self, perm: Union[List[int], Tuple[int, ...], np.ndarray]) -> str:
        """Converts permutation to flattened bitstring."""
        X = self.perm_to_matrix(perm)
        return "".join(str(val) for val in X.flatten())

    def bitstring_to_matrix(self, bitstring: str) -> np.ndarray:
        """Converts length N^2 bitstring to (N, N) binary matrix."""
        bits = [int(b) for b in bitstring]
        return np.array(bits).reshape((self.N, self.N))

    def check_feasibility(self, X: np.ndarray) -> Tuple[bool, int, int]:
        """
        Checks if binary matrix X is a valid permutation matrix.
        Returns:
            is_feasible: True if each row and column sums to exactly 1.
            row_violations: Number of rows where sum != 1.
            col_violations: Number of columns where sum != 1.
        """
        row_sums = np.sum(X, axis=1)
        col_sums = np.sum(X, axis=0)
        row_violations = int(np.sum(row_sums != 1))
        col_violations = int(np.sum(col_sums != 1))
        is_feasible = (row_violations == 0 and col_violations == 0)
        return is_feasible, row_violations, col_violations

    def evaluate_matrix_cost(self, X: np.ndarray) -> float:
        """
        Evaluates the quadratic objective C(X) = sum_{i<k} sum_{j!=l} F_ik D_jl X_ij X_kl.
        """
        cost = 0.0
        n = self.N
        for i in range(n):
            for k in range(i + 1, n):
                f_ik = self.F[i, k]
                if f_ik == 0:
                    continue
                for j in range(n):
                    if X[i, j] == 0:
                        continue
                    for l in range(n):
                        if j != l and X[k, l] > 0:
                            cost += f_ik * self.D[j, l] * X[i, j] * X[k, l]
        return float(cost)

    def evaluate_qubo_energy(self, X: np.ndarray, penalty_lambda: Optional[float] = None) -> Tuple[float, float, float]:
        """
        Calculates QUBO Hamiltonian energy: H(X) = C(X) + lambda * Penalty(X).
        Returns:
            total_energy: H(X)
            raw_cost: C(X)
            penalty: lambda * ((row_err)^2 + (col_err)^2)
        """
        if penalty_lambda is None:
            penalty_lambda = self.recommended_lambda

        raw_cost = self.evaluate_matrix_cost(X)
        row_err = np.sum((np.sum(X, axis=1) - 1.0) ** 2)
        col_err = np.sum((np.sum(X, axis=0) - 1.0) ** 2)
        penalty_val = penalty_lambda * (row_err + col_err)
        return float(raw_cost + penalty_val), float(raw_cost), float(penalty_val)

    def repair_to_permutation(self, X_or_probs: np.ndarray) -> Tuple[List[int], float]:
        """
        Repairs an arbitrary or continuous/probabilistic assignment matrix to the closest
        strictly valid permutation using minimum weight bipartite matching (Hungarian algorithm).
        Cost matrix for matching is negative of assignment weights: -X_or_probs.
        Returns:
            perm: Valid permutation list [pi(0), pi(1), ... pi(N-1)]
            feasible_cost: Exact objective cost of the repaired permutation.
        """
        # We want to maximize the agreement with X_or_probs, equivalent to minimizing -X
        row_ind, col_ind = linear_sum_assignment(-X_or_probs)
        perm = [0] * self.N
        for r, c in zip(row_ind, col_ind):
            perm[r] = int(c)
        feasible_cost = self.evaluate_permutation(perm)
        return perm, feasible_cost

    def gap(self, cost: float, reference_optimum: float) -> float:
        """Computes percentage gap relative to reference optimum: 100 * (C - C*) / C*."""
        return float(100.0 * (cost - reference_optimum) / reference_optimum)

if __name__ == "__main__":
    from parser import load_matrices
    F3, D3 = load_matrices(N=3)
    qap3 = QAPProblem(F3, D3, name="qap3")
    print(f"QAP3: Recommended lambda = {qap3.recommended_lambda:.2f}")
    c = qap3.evaluate_permutation([0, 1, 2])
    print(f"Perm [0, 1, 2] cost: {c} (Control optimum: 24, Gap: {qap3.gap(c, 24):.2f}%)")
