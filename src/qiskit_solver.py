"""
NODUX • SOP Alexander (CTO & Lead Qiskit)
src/qiskit_solver.py - Solvers Cuánticos Exactos e Híbridos (QAOA & NumPyMinimumEigensolver)
Implementa la arquitectura oficial del manual de operaciones con Qiskit 2.x.
"""

import time
from typing import Dict, Any, List, Tuple, Optional
import numpy as np
from scipy.optimize import minimize, linear_sum_assignment

from qiskit import QuantumCircuit
from qiskit.circuit import ParameterVector
from qiskit_aer import AerSimulator
from qiskit.quantum_info import Statevector, SparsePauliOp
from qiskit_algorithms import NumPyMinimumEigensolver

from qubo_builder import QUBOBuilder
from qap_problem import QAPProblem

class QiskitQAPSolver:
    def __init__(
        self,
        problem: QAPProblem,
        reps: int = 1,
        penalty_lambda: float = 60.0,
        shots: int = 2048,
        seed: int = 42
    ):
        self.problem = problem
        self.N = problem.N
        self.num_qubits = self.N * self.N
        self.reps = reps
        self.penalty_lambda = penalty_lambda
        self.shots = shots
        self.seed = seed

        self.builder = QUBOBuilder(problem.F, problem.D, penalty_lambda=penalty_lambda)
        self.ising_op, self.ising_offset = self.builder.to_ising_operator()
        self.backend = AerSimulator(seed_simulator=seed)
        self.build_qaoa_circuit()

    def build_qaoa_circuit(self):
        """Construye el circuito parametrizado QAOA (Fase 2 SOP)."""
        p = self.reps
        num_q = self.num_qubits
        qc = QuantumCircuit(num_q)
        qc.h(range(num_q))

        gammas = ParameterVector("gamma", p)
        betas = ParameterVector("beta", p)
        self._gammas = gammas
        self._betas = betas

        for step in range(p):
            gamma = gammas[step]
            beta = betas[step]

            # Operador de problema e^{-i * gamma * H_C}
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

            # Mezclador e^{-i * beta * H_M}
            for q in range(num_q):
                qc.rx(2.0 * beta, q)

        self.circuit = qc

    def solve_exact_ground_truth(self) -> Dict[str, Any]:
        """
        Ground Truth Matemático con NumPyMinimumEigensolver (SOP Fase 2).
        Encuentra el estado fundamental exacto del Hamiltoniano de Ising.
        """
        start_time = time.perf_counter()
        exact_solver = NumPyMinimumEigensolver()
        exact_res = exact_solver.compute_minimum_eigenvalue(self.ising_op)

        ground_energy = float(exact_res.eigenvalue.real) + self.ising_offset
        elapsed = time.perf_counter() - start_time

        # Extraer bitstring óptimo
        best_state = exact_res.eigenstate
        probs = best_state.probabilities()
        best_idx = int(np.argmax(probs))
        best_bitstring = format(best_idx, f"0{self.num_qubits}b")

        real_cost, pen_cost, is_feas = self.builder.evaluate_bitstring(best_bitstring)
        X = np.array([int(b) for b in best_bitstring]).reshape((self.N, self.N))
        rep_perm, rep_cost = self.problem.repair_to_permutation(X)

        return {
            "method": "NumPyMinimumEigensolver (Ground Truth Exacto)",
            "ground_energy": ground_energy,
            "raw_cost": real_cost,
            "is_feasible": is_feas,
            "best_bitstring": best_bitstring,
            "repaired_perm": rep_perm,
            "repaired_cost": rep_cost,
            "elapsed_seconds": elapsed
        }

    def solve_qaoa(self, maxiter: int = 25) -> Dict[str, Any]:
        """
        Heurístico Cuántico QAOA optimizado con Qiskit Aer y COBYLA (SOP Fase 2).
        Calcula expectativa cuántica, realiza muestreo con shots y calcula tasa de factibilidad.
        """
        start_time = time.perf_counter()
        p = self.reps

        def exp_val(params):
            p_dict = {
                self._gammas[s]: params[s] for s in range(p)
            }
            p_dict.update({
                self._betas[s]: params[p + s] for s in range(p)
            })
            bound_qc = self.circuit.assign_parameters(p_dict)
            sv = Statevector.from_instruction(bound_qc)
            return float(np.real(sv.expectation_value(self.ising_op))) + self.ising_offset

        init_p = np.concatenate([np.full(p, 0.15), np.full(p, 0.50)])
        opt_res = minimize(exp_val, init_p, method="COBYLA", options={"maxiter": maxiter})

        opt_params = opt_res.x
        opt_energy = float(opt_res.fun)

        # Muestreo con shots en AerSimulator
        p_dict = {
            self._gammas[s]: opt_params[s] for s in range(p)
        }
        p_dict.update({
            self._betas[s]: opt_params[p + s] for s in range(p)
        })
        bound_qc = self.circuit.assign_parameters(p_dict)
        bound_qc.measure_all()

        transpiled = self.backend.run(bound_qc, shots=self.shots, seed_simulator=self.seed)
        counts = transpiled.result().get_counts()

        feasible_samples = 0
        total_samples = sum(counts.values())
        best_bitstring = None
        best_repaired_cost = float("inf")
        best_repaired_perm = None

        for bstr, count in counts.items():
            std_bstr = bstr[::-1]
            real_c, pen_c, is_feas = self.builder.evaluate_bitstring(std_bstr)
            if is_feas:
                feasible_samples += count

            X = np.array([int(b) for b in std_bstr]).reshape((self.N, self.N))
            rep_perm, rep_cost = self.problem.repair_to_permutation(X)
            if rep_cost < best_repaired_cost:
                best_repaired_cost = rep_cost
                best_repaired_perm = rep_perm
                best_bitstring = std_bstr

        elapsed = time.perf_counter() - start_time
        tasa_factibilidad = (feasible_samples / max(total_samples, 1)) * 100.0

        return {
            "method": f"QAOA (p={self.reps}, {self.num_qubits} cúbits)",
            "eigenvalue_energy": opt_energy,
            "best_bitstring": best_bitstring,
            "repaired_perm": best_repaired_perm,
            "repaired_cost": best_repaired_cost,
            "tasa_factibilidad_pct": tasa_factibilidad,
            "elapsed_seconds": elapsed,
            "circuit_qubits": self.num_qubits,
            "circuit_depth": self.circuit.depth(),
            "total_gates": self.circuit.size()
        }

if __name__ == "__main__":
    from parser import load_matrices
    F3, D3 = load_matrices(N=3)
    p3 = QAPProblem(F3, D3)
    solver = QiskitQAPSolver(p3, reps=1, penalty_lambda=60.0, shots=1024)

    print("--- 1. Ground Truth NumPyMinimumEigensolver (N=3) ---")
    exact = solver.solve_exact_ground_truth()
    print(f"Costo: {exact['repaired_cost']} (Control: 24.0), Factible: {exact['is_feasible']}, Tiempo: {exact['elapsed_seconds']:.4f}s")

    print("\n--- 2. Heurístico Cuántico QAOA (N=3, 9 cúbits) ---")
    qaoa = solver.solve_qaoa(maxiter=20)
    print(f"Costo Reparado: {qaoa['repaired_cost']}, Factibilidad Cruda: {qaoa['tasa_factibilidad_pct']:.2f}%, Tiempo: {qaoa['elapsed_seconds']:.4f}s")
