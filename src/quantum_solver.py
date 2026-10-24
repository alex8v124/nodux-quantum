"""
NODUX • SOP Alexander Miranda (CTO & Lead Qiskit)
src/quantum_solver.py - Solvers Cuánticos e Híbridos Qiskit 2.x para el Endpoint API.
"""

import time
from typing import Dict, Any, List, Tuple
import numpy as np
from scipy.optimize import minimize, linear_sum_assignment

from qiskit import QuantumCircuit
from qiskit.circuit import ParameterVector
from qiskit_aer import AerSimulator
from qiskit.quantum_info import Statevector

from qubo_builder import QUBOBuilder
from qap_problem import QAPProblem
from quantum_hybrid import QuantumHybridLNS

class QuantumSolver:
    def __init__(
        self,
        F: np.ndarray,
        D: np.ndarray,
        lambda_penalty: float = 60.0,
        shots: int = 1024,
        seed: int = 42
    ):
        self.N = F.shape[0]
        self.F = F.astype(float)
        self.D = D.astype(float)
        self.lambda_penalty = float(lambda_penalty)
        self.shots = int(shots)
        self.seed = int(seed)

        self.problem = QAPProblem(self.F, self.D)
        self.builder = QUBOBuilder(self.F, self.D, penalty_lambda=self.lambda_penalty)

    def solve_qaoa_subinstance(self, p: int = 1, maxiter: int = 25) -> Dict[str, Any]:
        """Resuelve instancias N=3 o N=4 con QAOA en Qiskit AerSimulator."""
        start_time = time.perf_counter()
        num_q = self.N * self.N
        ising_op, ising_offset = self.builder.to_ising_operator()

        qc = QuantumCircuit(num_q)
        qc.h(range(num_q))

        gammas = ParameterVector("gamma", p)
        betas = ParameterVector("beta", p)

        for step in range(p):
            gamma = gammas[step]
            beta = betas[step]

            for pauli_str, coeff in ising_op.to_list():
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

        def cost_func(params):
            p_dict = {gammas[s]: params[s] for s in range(p)}
            p_dict.update({betas[s]: params[p + s] for s in range(p)})
            bound = qc.assign_parameters(p_dict)
            sv = Statevector.from_instruction(bound)
            return float(np.real(sv.expectation_value(ising_op))) + ising_offset

        init_p = np.concatenate([np.full(p, 0.15), np.full(p, 0.50)])
        opt_res = minimize(cost_func, init_p, method="COBYLA", options={"maxiter": maxiter})

        # Muestreo con AerSimulator
        p_dict = {gammas[s]: opt_res.x[s] for s in range(p)}
        p_dict.update({betas[s]: opt_res.x[p + s] for s in range(p)})
        bound_qc = qc.assign_parameters(p_dict)
        bound_qc.measure_all()

        backend = AerSimulator(seed_simulator=self.seed)
        counts = backend.run(bound_qc, shots=self.shots, seed_simulator=self.seed).result().get_counts()

        feasible_shots = 0
        total_shots = sum(counts.values())
        best_cost = float("inf")
        best_perm = None

        for bstr, count in counts.items():
            std_bstr = bstr[::-1]
            real_c, pen_c, is_feas = self.builder.evaluate_bitstring(std_bstr)
            if is_feas:
                feasible_shots += count

            X = np.array([int(b) for b in std_bstr]).reshape((self.N, self.N))
            rep_perm, rep_cost = self.problem.repair_to_permutation(X)
            if rep_cost < best_cost:
                best_cost = rep_cost
                best_perm = rep_perm

        elapsed_ms = (time.perf_counter() - start_time) * 1000.0
        feas_rate = feasible_shots / max(total_shots, 1)

        return {
            "optimal_cost": float(best_cost),
            "assignment_vector": best_perm,
            "feasibility_rate": round(feas_rate, 4),
            "execution_time_ms": round(elapsed_ms, 2)
        }

    def solve_hybrid_n10(self, max_iterations: int = 20) -> Dict[str, Any]:
        """Resuelve N=10 con Quantum Large Neighborhood Search (Descomposición 9 cúbits)."""
        start_time = time.perf_counter()
        hybrid_lns = QuantumHybridLNS(self.problem, subproblem_size=3, seed=self.seed)
        res = hybrid_lns.solve(max_iterations=max_iterations)
        elapsed_ms = (time.perf_counter() - start_time) * 1000.0

        return {
            "optimal_cost": float(res["best_cost"]),
            "assignment_vector": res["best_perm"],
            "feasibility_rate": 1.0, # Garantizado por matching bipartito
            "execution_time_ms": round(elapsed_ms, 2)
        }
