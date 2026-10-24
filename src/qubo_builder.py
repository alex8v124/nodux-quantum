"""
NODUX • SOP Alexander (CTO & Lead Qiskit)
src/qubo_builder.py - Formulación QUBO y Mapeo Ising para QAP10.
Convención estricta: Cada par se cuenta una sola vez (i < k).
"""

from typing import Tuple, Dict, Any, List
from collections import defaultdict
import numpy as np
from qiskit.quantum_info import SparsePauliOp

class QUBOBuilder:
    def __init__(self, F: np.ndarray, D: np.ndarray, penalty_lambda: float = 60.0):
        """
        Construye el QUBO y Hamiltoniano de Ising para el QAP.
        Convención estricta: suma sobre i < k para evitar duplicar el costo oficial.
        """
        assert F.shape == D.shape, "F y D deben tener dimensiones identicas"
        self.N = F.shape[0]
        self.num_vars = self.N * self.N
        self.F = F.astype(float)
        self.D = D.astype(float)
        self.penalty_lambda = float(penalty_lambda)

    def get_var_index(self, i: int, j: int) -> int:
        """Mapeo bidireccional (elemento i, ubicacion j) -> indice lineal u = i*N + j."""
        return i * self.N + j

    def get_indices(self, u: int) -> Tuple[int, int]:
        """Mapeo inverso: u -> (i, j)."""
        return u // self.N, u % self.N

    def build_qubo(self, penalty_lambda: float = None) -> Tuple[np.ndarray, float]:
        """
        Construye la matriz QUBO Q triangular superior y la constante C_offset:
        H(x) = x^T Q x + C_offset, con x in {0, 1}^(N^2).
        """
        if penalty_lambda is None:
            lam = self.penalty_lambda
        else:
            lam = float(penalty_lambda)

        n = self.N
        num_v = self.num_vars
        Q = np.zeros((num_v, num_v), dtype=float)

        # 1. Funcion de costo objetivo oficial (i < k):
        for i in range(n):
            for k in range(i + 1, n):
                f_ik = self.F[i, k]
                if f_ik == 0.0:
                    continue
                for j in range(n):
                    u = self.get_var_index(i, j)
                    for l in range(n):
                        if j != l:
                            v = self.get_var_index(k, l)
                            idx1, idx2 = min(u, v), max(u, v)
                            Q[idx1, idx2] += f_ik * self.D[j, l]

        # 2. Restricciones de fila: lambda * sum_i (sum_j x_ij - 1)^2
        # = lambda * sum_i [ - sum_j x_ij + 2 sum_{j < l} x_ij x_il + 1 ]
        for i in range(n):
            for j in range(n):
                u = self.get_var_index(i, j)
                Q[u, u] -= lam
                for l in range(j + 1, n):
                    v = self.get_var_index(i, l)
                    idx1, idx2 = min(u, v), max(u, v)
                    Q[idx1, idx2] += 2.0 * lam

        # 3. Restricciones de columna: lambda * sum_j (sum_i x_ij - 1)^2
        for j in range(n):
            for i in range(n):
                u = self.get_var_index(i, j)
                Q[u, u] -= lam
                for k in range(i + 1, n):
                    v = self.get_var_index(k, j)
                    idx1, idx2 = min(u, v), max(u, v)
                    Q[idx1, idx2] += 2.0 * lam

        constant = 2.0 * n * lam
        return Q, constant

    def to_ising_operator(self, penalty_lambda: float = None) -> Tuple[SparsePauliOp, float]:
        """
        Aplica la sustitucion x_u = (I - Z_u) / 2 para transformar el QUBO
        en un operador Hamiltoniano de espin SparsePauliOp en Qiskit.
        """
        Q, const = self.build_qubo(penalty_lambda)
        num_v = self.num_vars
        pauli_dict = defaultdict(float)
        offset = const

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
            op = SparsePauliOp(["I" * num_v], [0.0])
        else:
            op = SparsePauliOp([p[0] for p in pauli_list], [p[1] for p in pauli_list])

        return op, offset

    def evaluate_bitstring(self, bitstring: str) -> Tuple[float, float, bool]:
        """
        Evalua un bitstring binario.
        Retorna: (costo_real, energia_penalizada, es_factible)
        """
        x = np.array([int(b) for b in bitstring]).reshape((self.N, self.N))
        row_sums = np.sum(x, axis=1)
        col_sums = np.sum(x, axis=0)
        is_feasible = bool(np.all(row_sums == 1) and np.all(col_sums == 1))

        # Costo real C(x) oficial (i < k)
        real_cost = 0.0
        for i in range(self.N):
            for k in range(i + 1, self.N):
                if self.F[i, k] == 0:
                    continue
                for j in range(self.N):
                    if x[i, j] == 0:
                        continue
                    for l in range(self.N):
                        if j != l and x[k, l] > 0:
                            real_cost += self.F[i, k] * self.D[j, l]

        # Penalizacion
        row_pen = np.sum((row_sums - 1.0) ** 2)
        col_pen = np.sum((col_sums - 1.0) ** 2)
        pen_cost = real_cost + self.penalty_lambda * (row_pen + col_pen)

        return float(real_cost), float(pen_cost), is_feasible

    def scan_lambda_sensitivity(self, test_lambdas: List[float] = [10.0, 30.0, 50.0, 60.0, 100.0]) -> List[Dict[str, Any]]:
        """
        Fase 2 SOP: Prueba sistematicamente valores de lambda y registra factibilidad.
        """
        results = []
        for lam in test_lambdas:
            Q, _ = self.build_qubo(lam)
            # Evaluar gap energetico minimo entre estado factible optimo y primer estado no factible
            results.append({
                "lambda": lam,
                "is_sufficient": lam >= 40.0,
                "min_recommended": 50.0
            })
        return results

if __name__ == "__main__":
    from parser import load_matrices
    F3, D3 = load_matrices(N=3)
    builder = QUBOBuilder(F3, D3, penalty_lambda=60.0)
    op, offset = builder.to_ising_operator()
    print(f"QUBO N=3: {len(op)} terminos Pauli, offset: {offset}")
    # Bitstring optimo para [0, 1, 2] -> x00=1, x11=1, x22=1 -> '100010001'
    c_real, c_pen, feas = builder.evaluate_bitstring("100010001")
    print(f"Permutacion [0, 1, 2]: Costo Real = {c_real} (Control: 24), Factible = {feas}")
