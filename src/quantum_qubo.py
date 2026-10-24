"""
QUBO and Ising Hamiltonian Formulation Module for QAP.
Constructs Qiskit SparsePauliOp operators from QAP problem specifications.
"""

from typing import Tuple, Dict, Any, Optional
from collections import defaultdict
import numpy as np
from qiskit.quantum_info import SparsePauliOp
from qap_problem import QAPProblem

class QuantumQUBO:
    def __init__(self, problem: QAPProblem, penalty_lambda: Optional[float] = None):
        """
        Initializes QUBO and Ising formulation for the QAP problem.
        Variables are ordered lexicographically: u = i * N + j,
        where i is the element index (0..N-1) and j is the location index (0..N-1).
        """
        self.problem = problem
        self.N = problem.N
        self.num_vars = self.N * self.N
        if penalty_lambda is None:
            self.penalty_lambda = problem.recommended_lambda
        else:
            self.penalty_lambda = float(penalty_lambda)

        self._qubo_matrix = None
        self._qubo_constant = 0.0
        self._ising_op = None
        self._ising_offset = 0.0

    def get_var_index(self, i: int, j: int) -> int:
        """Maps (element i, location j) to linear variable index."""
        return i * self.N + j

    def get_pair_from_index(self, u: int) -> Tuple[int, int]:
        """Maps linear variable index u to (element i, location j)."""
        return u // self.N, u % self.N

    def build_qubo_matrix(self) -> Tuple[np.ndarray, float]:
        """
        Builds the upper triangular QUBO matrix Q such that:
        Objective + Penalty = x^T Q x + constant, where x in {0, 1}^(N^2).
        """
        n = self.N
        num_vars = self.num_vars
        Q = np.zeros((num_vars, num_vars), dtype=float)
        lam = self.penalty_lambda

        # 1. Objective function: sum_{i < k} sum_{j != l} F_ik * D_jl * x_ij * x_kl
        for i in range(n):
            for k in range(i + 1, n):
                f_ik = self.problem.F[i, k]
                if f_ik == 0:
                    continue
                for j in range(n):
                    u = self.get_var_index(i, j)
                    for l in range(n):
                        if j != l:
                            v = self.get_var_index(k, l)
                            # Ensure upper triangular index
                            idx1, idx2 = min(u, v), max(u, v)
                            Q[idx1, idx2] += f_ik * self.problem.D[j, l]

        # 2. Row penalties: lambda * sum_i (sum_j x_ij - 1)^2
        # = lambda * sum_i [ -sum_j x_ij + 2 sum_{j < l} x_ij x_il + 1 ]
        for i in range(n):
            for j in range(n):
                u = self.get_var_index(i, j)
                Q[u, u] -= lam  # Linear diagonal term
                for l in range(j + 1, n):
                    v = self.get_var_index(i, l)
                    idx1, idx2 = min(u, v), max(u, v)
                    Q[idx1, idx2] += 2.0 * lam  # Mutual exclusion in same row

        # 3. Column penalties: lambda * sum_j (sum_i x_ij - 1)^2
        # = lambda * sum_j [ -sum_i x_ij + 2 sum_{i < k} x_ij x_kj + 1 ]
        for j in range(n):
            for i in range(n):
                u = self.get_var_index(i, j)
                Q[u, u] -= lam  # Linear diagonal term
                for k in range(i + 1, n):
                    v = self.get_var_index(k, j)
                    idx1, idx2 = min(u, v), max(u, v)
                    Q[idx1, idx2] += 2.0 * lam  # Mutual exclusion in same column

        # Constant offset from ( -1 )^2 = 1 summed over N rows and N cols
        constant = 2.0 * n * lam

        self._qubo_matrix = Q
        self._qubo_constant = constant
        return Q, constant

    def to_ising_hamiltonian(self) -> Tuple[SparsePauliOp, float]:
        """
        Converts QUBO to an Ising Hamiltonian using substitution x_u = (I - Z_u) / 2.
        Returns:
            op: Qiskit SparsePauliOp representing sum J_uv Z_u Z_v + sum h_u Z_u
            offset: Scalar constant energy offset
        """
        if self._qubo_matrix is None:
            self.build_qubo_matrix()

        Q = self._qubo_matrix
        num_vars = self.num_vars

        # x_u = (1 - Z_u)/2
        # x_u * x_v = (1 - Z_u - Z_v + Z_u Z_v) / 4
        # x_u = (1 - Z_u) / 2
        pauli_dict = defaultdict(float)
        offset = self._qubo_constant

        for u in range(num_vars):
            diag = Q[u, u]
            if diag != 0.0:
                # diag * (1 - Z_u)/2 = diag/2 - diag/2 * Z_u
                offset += diag / 2.0
                pauli_dict[f"Z_{u}"] -= diag / 2.0

            for v in range(u + 1, num_vars):
                coupling = Q[u, v]
                if coupling != 0.0:
                    # coupling * (1 - Z_u - Z_v + Z_u Z_v)/4
                    offset += coupling / 4.0
                    pauli_dict[f"Z_{u}"] -= coupling / 4.0
                    pauli_dict[f"Z_{v}"] -= coupling / 4.0
                    pauli_dict[f"ZZ_{u}_{v}"] += coupling / 4.0

        # Construct Qiskit SparsePauliOp
        pauli_list = []
        for term, coeff in pauli_dict.items():
            if abs(coeff) < 1e-10:
                continue
            chars = ["I"] * num_vars
            if term.startswith("Z_"):
                idx = int(term.split("_")[1])
                # In Qiskit, index 0 is rightmost Pauli string character
                chars[num_vars - 1 - idx] = "Z"
            elif term.startswith("ZZ_"):
                parts = term.split("_")
                u, v = int(parts[1]), int(parts[2])
                chars[num_vars - 1 - u] = "Z"
                chars[num_vars - 1 - v] = "Z"
            pauli_list.append(("".join(chars), coeff))

        if not pauli_list:
            sparse_op = SparsePauliOp(["I" * num_vars], [0.0])
        else:
            labels = [p[0] for p in pauli_list]
            coeffs = [p[1] for p in pauli_list]
            sparse_op = SparsePauliOp(labels, coeffs)

        self._ising_op = sparse_op
        self._ising_offset = offset
        return sparse_op, offset

    def evaluate_bitstring_ising(self, bitstring: str) -> float:
        """
        Directly evaluates energy of a bitstring (e.g. '010001...') using Q matrix + offset.
        Matches <psi|H|psi>.
        """
        if self._qubo_matrix is None:
            self.build_qubo_matrix()
        x = np.array([int(b) for b in bitstring], dtype=float)
        energy = float(x @ self._qubo_matrix @ x + self._qubo_constant)
        return energy

if __name__ == "__main__":
    from parser import load_matrices
    F3, D3 = load_matrices(N=3)
    p3 = QAPProblem(F3, D3, name="qap3")
    q_qubo = QuantumQUBO(p3, penalty_lambda=50.0)
    Q, c = q_qubo.build_qubo_matrix()
    print(f"QUBO Matrix shape: {Q.shape}, Constant: {c}")
    op, offset = q_qubo.to_ising_hamiltonian()
    print(f"Ising Hamiltonian: {len(op)} Pauli terms, offset: {offset:.2f}")

    # Optimal bitstring for perm [0, 1, 2]
    opt_perm = [0, 1, 2]
    opt_bits = p3.perm_to_bitstring(opt_perm)
    opt_energy = q_qubo.evaluate_bitstring_ising(opt_bits)
    print(f"Optimal permutation {opt_perm} bitstring: {opt_bits}")
    print(f"QUBO Energy: {opt_energy:.2f} (Expected raw cost: 24, penalty: 0)")
