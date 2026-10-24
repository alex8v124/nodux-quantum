"""
Quantum Approximate Optimization Algorithm (QAOA) Implementation via Qiskit.
Constructs parameterized QAOA circuits, evaluates expectation values using
AerSimulator and Statevector, optimizes variational parameters (gamma, beta)
with COBYLA, and analyzes measurement statistics and feasibility.
"""

import time
from typing import List, Tuple, Dict, Any, Optional
import numpy as np
from scipy.optimize import minimize

from qiskit import QuantumCircuit
from qiskit.circuit import ParameterVector
from qiskit_aer import AerSimulator
from qiskit.quantum_info import Statevector

from qap_problem import QAPProblem
from quantum_qubo import QuantumQUBO

class QuantumQAOA:
    def __init__(
        self,
        problem: QAPProblem,
        reps: int = 1,
        penalty_lambda: Optional[float] = None,
        shots: int = 2048,
        seed: int = 42
    ):
        """
        Initializes QAOA solver for a QAP instance.
        Args:
            problem: QAPProblem instance
            reps: Number of QAOA alternating layers (p)
            penalty_lambda: Lagrange multiplier for constraint violation
            shots: Measurement shots for simulator
            seed: RNG seed for reproducibility
        """
        self.problem = problem
        self.N = problem.N
        self.num_qubits = self.N * self.N
        self.reps = reps
        self.shots = shots
        self.seed = seed

        # Build QUBO and Ising formulation
        self.qubo = QuantumQUBO(problem, penalty_lambda=penalty_lambda)
        self.ising_op, self.ising_offset = self.qubo.to_ising_hamiltonian()

        self.backend = AerSimulator(seed_simulator=seed)
        self.circuit = None
        self._gamma_params = None
        self._beta_params = None
        self.build_circuit()

    def build_circuit(self):
        """Constructs the parameterized QAOA ansatz circuit."""
        p = self.reps
        num_q = self.num_qubits

        qc = QuantumCircuit(num_q)
        # Initial superposition state
        qc.h(range(num_q))

        gammas = ParameterVector("gamma", p)
        betas = ParameterVector("beta", p)
        self._gamma_params = gammas
        self._beta_params = betas

        # Decompose Ising Hamiltonian terms into gates
        for step in range(p):
            gamma = gammas[step]
            beta = betas[step]

            # 1. Problem Unitary e^{-i * gamma * H_C}
            for pauli_str, coeff in self.ising_op.to_list():
                c_val = float(np.real(coeff))
                if abs(c_val) < 1e-9:
                    continue

                # Find which qubits have Z
                # In Qiskit, index 0 is the rightmost character
                z_indices = [
                    num_q - 1 - idx
                    for idx, char in enumerate(reversed(pauli_str))
                    if char == "Z"
                ]

                if len(z_indices) == 1:
                    q0 = z_indices[0]
                    # RZ(2 * gamma * coeff)
                    qc.rz(2.0 * gamma * c_val, q0)
                elif len(z_indices) == 2:
                    q0, q1 = z_indices[0], z_indices[1]
                    # RZZ(2 * gamma * coeff)
                    qc.rzz(2.0 * gamma * c_val, q0, q1)

            # 2. Mixer Unitary e^{-i * beta * H_M} where H_M = sum X_i
            for q in range(num_q):
                qc.rx(2.0 * beta, q)

        self.circuit = qc

    def get_circuit_metrics(self) -> Dict[str, Any]:
        """Returns circuit depth, qubit count, and gate statistics."""
        return {
            "num_qubits": self.num_qubits,
            "reps_p": self.reps,
            "depth": self.circuit.depth(),
            "total_gates": self.circuit.size(),
            "gate_counts": dict(self.circuit.count_ops())
        }

    def _expectation_from_statevector(self, params: np.ndarray) -> float:
        """Computes exact expectation value <psi|H|psi> using Statevector."""
        param_dict = {}
        for step in range(self.reps):
            param_dict[self._gamma_params[step]] = params[step]
            param_dict[self._beta_params[step]] = params[self.reps + step]

        bound_circuit = self.circuit.assign_parameters(param_dict)
        sv = Statevector.from_instruction(bound_circuit)
        exp_val = float(np.real(sv.expectation_value(self.ising_op)))
        return exp_val + self.ising_offset

    def solve(
        self,
        maxiter: int = 40,
        initial_params: Optional[np.ndarray] = None
    ) -> Dict[str, Any]:
        """
        Executes QAOA optimization using classical COBYLA optimizer.
        """
        start_time = time.perf_counter()
        p = self.reps

        if initial_params is None:
            # Standard heuristic initialization: gamma around 0.1, beta around 0.5
            initial_params = np.concatenate([
                np.full(p, 0.15),
                np.full(p, 0.50)
            ])

        history = []

        def cost_func(params):
            val = self._expectation_from_statevector(params)
            history.append(val)
            return val

        res = minimize(
            cost_func,
            initial_params,
            method="COBYLA",
            options={"maxiter": maxiter, "disp": False}
        )

        opt_params = res.x
        opt_energy = float(res.fun)

        # Final sampling at optimal parameters
        param_dict = {}
        for step in range(p):
            param_dict[self._gamma_params[step]] = opt_params[step]
            param_dict[self._beta_params[step]] = opt_params[p + step]

        bound_qc = self.circuit.assign_parameters(param_dict)
        meas_qc = bound_qc.copy()
        meas_qc.measure_all()

        transpiled = self.backend.run(meas_qc, shots=self.shots, seed_simulator=self.seed)
        counts = transpiled.result().get_counts()

        # Analyze measurement samples
        best_raw_energy = float("inf")
        best_raw_bitstring = None
        best_feasible_cost = float("inf")
        best_feasible_perm = None
        best_repaired_cost = float("inf")
        best_repaired_perm = None

        feasible_samples = 0
        total_samples = 0

        sample_distribution = {}

        for bitstring, count in counts.items():
            # Qiskit bitstring has qubit 0 as rightmost character; reverse for standard ordering
            standard_bits = bitstring[::-1]
            total_samples += count

            energy = self.qubo.evaluate_bitstring_ising(standard_bits)
            X = self.problem.bitstring_to_matrix(standard_bits)
            is_feasible, row_viol, col_viol = self.problem.check_feasibility(X)

            if energy < best_raw_energy:
                best_raw_energy = energy
                best_raw_bitstring = standard_bits

            if is_feasible:
                feasible_samples += count
                raw_c = self.problem.evaluate_matrix_cost(X)
                perm = [int(np.argmax(X[i, :])) for i in range(self.N)]
                if raw_c < best_feasible_cost:
                    best_feasible_cost = raw_c
                    best_feasible_perm = perm

            # Always evaluate classical Hungarian repair on the sample
            rep_perm, rep_cost = self.problem.repair_to_permutation(X)
            if rep_cost < best_repaired_cost:
                best_repaired_cost = rep_cost
                best_repaired_perm = rep_perm

            sample_distribution[standard_bits] = {
                "count": count,
                "probability": count / self.shots,
                "energy": energy,
                "feasible": is_feasible
            }

        elapsed = time.perf_counter() - start_time
        feasible_fraction = (feasible_samples / total_samples) if total_samples > 0 else 0.0

        return {
            "method": f"QAOA (p={p})",
            "optimal_parameters": opt_params.tolist(),
            "ground_state_energy": opt_energy,
            "best_raw_energy": best_raw_energy,
            "best_raw_bitstring": best_raw_bitstring,
            "feasible_fraction": feasible_fraction,
            "best_feasible_cost": best_feasible_cost if best_feasible_cost != float("inf") else None,
            "best_feasible_perm": best_feasible_perm,
            "best_repaired_cost": best_repaired_cost,
            "best_repaired_perm": best_repaired_perm,
            "elapsed_seconds": elapsed,
            "cobyla_iterations": len(history),
            "convergence_history": history,
            "circuit_metrics": self.get_circuit_metrics()
        }

if __name__ == "__main__":
    from parser import load_matrices
    F3, D3 = load_matrices(N=3)
    p3 = QAPProblem(F3, D3, name="qap3")
    print("Initializing QAOA for N=3 (9 qubits)...")
    qaoa = QuantumQAOA(p3, reps=1, penalty_lambda=50.0, shots=1024, seed=42)
    print("Circuit metrics:", qaoa.get_circuit_metrics())
    result = qaoa.solve(maxiter=20)
    print(f"Elapsed: {result['elapsed_seconds']:.2f}s")
    print(f"Feasible fraction: {result['feasible_fraction']*100:.1f}%")
    print(f"Best feasible cost: {result['best_feasible_cost']} (Perm: {result['best_feasible_perm']})")
    print(f"Best repaired cost: {result['best_repaired_cost']} (Perm: {result['best_repaired_perm']})")
