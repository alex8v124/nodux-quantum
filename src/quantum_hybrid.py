"""
Quantum-Classical Hybrid Optimization: Quantum Large Neighborhood Search (Q-LNS).
Decomposes the global QAP into exact induced K-element sub-QAPs (K=3, 4 -> 9, 16 qubits),
incorporating both internal quadratic interactions and external linear interactions with fixed elements.
Solved iteratively using Qiskit QAOA circuits.
"""

import time
from typing import List, Tuple, Dict, Any, Optional
from collections import defaultdict
import numpy as np

from qiskit.quantum_info import SparsePauliOp
from qiskit import QuantumCircuit
from qiskit.circuit import ParameterVector
from qiskit_aer import AerSimulator
from qiskit.quantum_info import Statevector
from scipy.optimize import minimize, linear_sum_assignment

from qap_problem import QAPProblem

class SubproblemQuantumQAOA:
    """
    Solves an induced K-element sub-QAP on K^2 qubits using Qiskit QAOA,
    accounting for quadratic internal terms and linear external coupling terms.
    """
    def __init__(
        self,
        F_sub: np.ndarray,
        D_sub: np.ndarray,
        L_sub: np.ndarray,
        reps: int = 1,
        penalty_lambda: float = 60.0,
        shots: int = 1024,
        seed: int = 42
    ):
        self.k = F_sub.shape[0]
        self.num_qubits = self.k * self.k
        self.F_sub = F_sub
        self.D_sub = D_sub
        self.L_sub = L_sub  # Linear cost: L_sub[a, loc_idx]
        self.reps = reps
        self.penalty_lambda = penalty_lambda
        self.shots = shots
        self.seed = seed

        # Build subproblem QUBO
        self.build_sub_qubo()
        self.build_ising_hamiltonian()
        self.backend = AerSimulator(seed_simulator=seed)
        self.build_circuit()

    def get_var_index(self, a: int, j: int) -> int:
        return a * self.k + j

    def build_sub_qubo(self):
        k = self.k
        num_v = self.num_qubits
        Q = np.zeros((num_v, num_v), dtype=float)
        lam = self.penalty_lambda

        # 1. Quadratic internal interaction: sum_{a < b} sum_{j != l} F_ab * D_jl * x_aj * x_bl
        for a in range(k):
            for b in range(a + 1, k):
                f_ab = self.F_sub[a, b]
                if f_ab == 0:
                    continue
                for j in range(k):
                    u = self.get_var_index(a, j)
                    for l in range(k):
                        if j != l:
                            v = self.get_var_index(b, l)
                            idx1, idx2 = min(u, v), max(u, v)
                            Q[idx1, idx2] += f_ab * self.D_sub[j, l]

        # 2. Linear external interaction: sum_a sum_j L_sub[a, j] * x_aj
        for a in range(k):
            for j in range(k):
                u = self.get_var_index(a, j)
                Q[u, u] += self.L_sub[a, j]

        # 3. Row constraints: lambda * sum_a (sum_j x_aj - 1)^2
        for a in range(k):
            for j in range(k):
                u = self.get_var_index(a, j)
                Q[u, u] -= lam
                for l in range(j + 1, k):
                    v = self.get_var_index(a, l)
                    idx1, idx2 = min(u, v), max(u, v)
                    Q[idx1, idx2] += 2.0 * lam

        # 4. Column constraints: lambda * sum_j (sum_a x_aj - 1)^2
        for j in range(k):
            for a in range(k):
                u = self.get_var_index(a, j)
                Q[u, u] -= lam
                for b in range(a + 1, k):
                    v = self.get_var_index(b, j)
                    idx1, idx2 = min(u, v), max(u, v)
                    Q[idx1, idx2] += 2.0 * lam

        self.qubo_matrix = Q
        self.qubo_constant = 2.0 * k * lam

    def build_ising_hamiltonian(self):
        Q = self.qubo_matrix
        num_v = self.num_qubits
        pauli_dict = defaultdict(float)
        offset = self.qubo_constant

        for u in range(num_v):
            diag = Q[u, u]
            if diag != 0.0:
                offset += diag / 2.0
                pauli_dict[f"Z_{u}"] -= diag / 2.0
            for v in range(u + 1, num_v):
                coupling = Q[u, v]
                if coupling != 0.0:
                    offset += coupling / 4.0
                    pauli_dict[f"Z_{u}"] -= coupling / 4.0
                    pauli_dict[f"Z_{v}"] -= coupling / 4.0
                    pauli_dict[f"ZZ_{u}_{v}"] += coupling / 4.0

        pauli_list = []
        for term, coeff in pauli_dict.items():
            if abs(coeff) < 1e-9:
                continue
            chars = ["I"] * num_v
            if term.startswith("Z_"):
                idx = int(term.split("_")[1])
                chars[num_v - 1 - idx] = "Z"
            elif term.startswith("ZZ_"):
                parts = term.split("_")
                u, v = int(parts[1]), int(parts[2])
                chars[num_v - 1 - u] = "Z"
                chars[num_v - 1 - v] = "Z"
            pauli_list.append(("".join(chars), coeff))

        if not pauli_list:
            self.ising_op = SparsePauliOp(["I" * num_v], [0.0])
        else:
            self.ising_op = SparsePauliOp([p[0] for p in pauli_list], [p[1] for p in pauli_list])
        self.ising_offset = offset

    def build_circuit(self):
        p = self.reps
        num_q = self.num_qubits
        qc = QuantumCircuit(num_q)
        qc.h(range(num_q))

        gammas = ParameterVector("gamma", p)
        betas = ParameterVector("beta", p)
        self._gamma_params = gammas
        self._beta_params = betas

        for step in range(p):
            gamma = gammas[step]
            beta = betas[step]

            for pauli_str, coeff in self.ising_op.to_list():
                c_val = float(np.real(coeff))
                if abs(c_val) < 1e-9:
                    continue
                z_indices = [
                    num_q - 1 - idx
                    for idx, char in enumerate(reversed(pauli_str))
                    if char == "Z"
                ]
                if len(z_indices) == 1:
                    qc.rz(2.0 * gamma * c_val, z_indices[0])
                elif len(z_indices) == 2:
                    qc.rzz(2.0 * gamma * c_val, z_indices[0], z_indices[1])

            for q in range(num_q):
                qc.rx(2.0 * beta, q)

        self.circuit = qc

    def solve(self, maxiter: int = 15) -> Dict[str, Any]:
        p = self.reps
        num_q = self.num_qubits

        def exp_val(params):
            p_dict = {
                self._gamma_params[s]: params[s] for s in range(p)
            }
            p_dict.update({
                self._beta_params[s]: params[p + s] for s in range(p)
            })
            bound_qc = self.circuit.assign_parameters(p_dict)
            sv = Statevector.from_instruction(bound_qc)
            return float(np.real(sv.expectation_value(self.ising_op))) + self.ising_offset

        init_p = np.concatenate([np.full(p, 0.15), np.full(p, 0.50)])
        opt_res = minimize(exp_val, init_p, method="COBYLA", options={"maxiter": maxiter})

        p_dict = {
            self._gamma_params[s]: opt_res.x[s] for s in range(p)
        }
        p_dict.update({
            self._beta_params[s]: opt_res.x[p + s] for s in range(p)
        })
        bound_qc = self.circuit.assign_parameters(p_dict)
        bound_qc.measure_all()

        transpiled = self.backend.run(bound_qc, shots=self.shots, seed_simulator=self.seed)
        counts = transpiled.result().get_counts()

        # Extract best repaired permutation
        best_perm = None
        best_cost = float("inf")
        feasible_count = 0
        total_count = sum(counts.values())

        for bstr, count in counts.items():
            std_bits = bstr[::-1]
            X = np.array([int(b) for b in std_bits]).reshape((self.k, self.k))
            if np.all(np.sum(X, axis=1) == 1) and np.all(np.sum(X, axis=0) == 1):
                feasible_count += count

            # Hungarian matching repair
            row_ind, col_ind = linear_sum_assignment(-X)
            perm = [0] * self.k
            for r, c in zip(row_ind, col_ind):
                perm[r] = int(c)

            # Evaluate exact subproblem cost
            c_val = 0.0
            for a in range(self.k):
                for b in range(a + 1, self.k):
                    c_val += self.F_sub[a, b] * self.D_sub[perm[a], perm[b]]
                c_val += self.L_sub[a, perm[a]]

            if c_val < best_cost:
                best_cost = c_val
                best_perm = perm

        return {
            "best_sub_perm": best_perm,
            "best_sub_cost": best_cost,
            "feasible_fraction": feasible_count / max(total_count, 1),
            "circuit_metrics": {
                "num_qubits": num_q,
                "depth": self.circuit.depth(),
                "total_gates": self.circuit.size()
            }
        }

class QuantumHybridLNS:
    def __init__(
        self,
        problem: QAPProblem,
        subproblem_size: int = 3,
        qaoa_reps: int = 1,
        qaoa_shots: int = 1024,
        seed: int = 42
    ):
        self.problem = problem
        self.N = problem.N
        self.K = subproblem_size
        self.qaoa_reps = qaoa_reps
        self.qaoa_shots = qaoa_shots
        self.seed = seed
        self.rng = np.random.RandomState(seed)

    def select_neighborhood(self, current_perm: List[int]) -> List[int]:
        if self.rng.uniform() < 0.6:
            # Pick seed element with highest total flow
            flow_sums = np.sum(self.problem.F, axis=1)
            noisy_flows = flow_sums + self.rng.exponential(scale=1.5, size=self.N)
            seed_elem = int(np.argmax(noisy_flows))
            flows_with_seed = self.problem.F[seed_elem].copy()
            flows_with_seed[seed_elem] = -1
            top_partners = np.argsort(-flows_with_seed)[:self.K - 1]
            neighborhood = [seed_elem] + [int(x) for x in top_partners]
        else:
            # Random subset to ensure ergodic exploration
            neighborhood = list(self.rng.choice(self.N, size=self.K, replace=False))
        return sorted(neighborhood)

    def solve_induced_subproblem_quantum(
        self,
        active_elements: List[int],
        current_perm: List[int]
    ) -> Tuple[List[int], float, Dict[str, Any]]:
        k = self.K
        fixed_elements = [i for i in range(self.N) if i not in active_elements]
        available_locations = [current_perm[i] for i in active_elements]

        # 1. Induced sub-flow matrix
        F_sub = np.zeros((k, k))
        for a in range(k):
            for b in range(k):
                F_sub[a, b] = self.problem.F[active_elements[a], active_elements[b]]

        # 2. Induced sub-distance matrix
        D_sub = np.zeros((k, k))
        for j_idx in range(k):
            for l_idx in range(k):
                D_sub[j_idx, l_idx] = self.problem.D[available_locations[j_idx], available_locations[l_idx]]

        # 3. Exact linear interaction with fixed elements
        L_sub = np.zeros((k, k))
        for a in range(k):
            elem_a = active_elements[a]
            for j_idx in range(k):
                loc_j = available_locations[j_idx]
                lin_c = 0.0
                for fixed_elem in fixed_elements:
                    fixed_loc = current_perm[fixed_elem]
                    lin_c += self.problem.F[elem_a, fixed_elem] * self.problem.D[loc_j, fixed_loc]
                L_sub[a, j_idx] = lin_c

        # Solve via Qiskit Subproblem QAOA
        sub_solver = SubproblemQuantumQAOA(
            F_sub=F_sub,
            D_sub=D_sub,
            L_sub=L_sub,
            reps=self.qaoa_reps,
            shots=self.qaoa_shots,
            seed=self.seed
        )
        sub_res = sub_solver.solve(maxiter=15)
        best_sub_perm = sub_res["best_sub_perm"]

        new_perm = list(current_perm)
        for a, sub_loc_idx in enumerate(best_sub_perm):
            new_perm[active_elements[a]] = available_locations[sub_loc_idx]

        new_global_cost = self.problem.evaluate_permutation(new_perm)
        return new_perm, new_global_cost, {
            "active_elements": active_elements,
            "sub_perm": best_sub_perm,
            "qaoa_qubits": k * k,
            "qaoa_feasible_fraction": sub_res["feasible_fraction"],
            "circuit_metrics": sub_res["circuit_metrics"]
        }

    def solve(
        self,
        max_iterations: int = 40,
        initial_perm: Optional[List[int]] = None
    ) -> Dict[str, Any]:
        start_time = time.perf_counter()

        if initial_perm is None:
            # Start from random permutation
            current_perm = list(self.rng.permutation(self.N))
        else:
            current_perm = list(initial_perm)

        current_cost = self.problem.evaluate_permutation(current_perm)
        best_perm = list(current_perm)
        best_cost = current_cost

        cost_history = [best_cost]
        quantum_step_details = []
        improvements = 0

        for it in range(max_iterations):
            neighborhood = self.select_neighborhood(current_perm)
            cand_perm, cand_cost, q_metrics = self.solve_induced_subproblem_quantum(
                neighborhood, current_perm
            )

            if cand_cost < current_cost:
                current_cost = cand_cost
                current_perm = cand_perm
                improvements += 1
                if current_cost < best_cost:
                    best_cost = current_cost
                    best_perm = list(current_perm)
            elif cand_cost == current_cost:
                current_perm = cand_perm

            # Periodic 2-opt sweep to clean coordinate cross-talk
            if it % 4 == 0:
                for i in range(self.N):
                    for k in range(i + 1, self.N):
                        swap_perm = list(current_perm)
                        swap_perm[i], swap_perm[k] = swap_perm[k], swap_perm[i]
                        sc = self.problem.evaluate_permutation(swap_perm)
                        if sc < current_cost:
                            current_cost = sc
                            current_perm = swap_perm
                            if current_cost < best_cost:
                                best_cost = current_cost
                                best_perm = list(current_perm)

            cost_history.append(best_cost)
            quantum_step_details.append({
                "iteration": it + 1,
                "current_best": best_cost,
                "q_metrics": q_metrics
            })

        elapsed = time.perf_counter() - start_time
        return {
            "method": f"Quantum-Classical Hybrid LNS (K={self.K}, {self.K**2} qubits)",
            "subproblem_qubits": self.K * self.K,
            "best_perm": best_perm,
            "best_cost": best_cost,
            "elapsed_seconds": elapsed,
            "iterations": max_iterations,
            "improvements": improvements,
            "convergence_history": cost_history,
            "quantum_step_details": quantum_step_details
        }

if __name__ == "__main__":
    from parser import load_matrices
    F10, D10 = load_matrices(N=10)
    p10 = QAPProblem(F10, D10, name="qap10")
    print("Testing Enhanced Quantum Hybrid LNS with exact linear coupling...")
    q_lns = QuantumHybridLNS(p10, subproblem_size=3, seed=42)
    res = q_lns.solve(max_iterations=25)
    print(f"Final Cost: {res['best_cost']} (Reference: 340, Gap: {p10.gap(res['best_cost'], 340):.2f}%)")
    print(f"Elapsed: {res['elapsed_seconds']:.2f}s, Improvements: {res['improvements']}")
    print(f"Best Permutation: {res['best_perm']}")
