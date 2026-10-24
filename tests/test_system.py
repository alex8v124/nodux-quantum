"""
NODUX • Automated Test Suite (CI/CD Quality Assurance)
tests/test_system.py - Verificación rigurosa de algoritmos, Hamiltoniano de Ising y API REST.
"""

import sys
import os
import unittest
import numpy as np

# Add src to path
sys.path.append(os.path.join(os.path.dirname(__file__), "../src"))

from parser import load_matrices
from qap_problem import QAPProblem
from classical_solver import ClassicalSolver
from classical_solvers import ClassicalSolvers
from qubo_builder import QUBOBuilder
from backend import app

class TestNoduxSystem(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = app.test_client()

    def test_01_ground_truth_n3_n4(self):
        """Verifica que los óptimos de control oficiales para N=3 y N=4 sean 24.0 y 32.0."""
        F3, D3 = load_matrices(N=3)
        solver3 = ClassicalSolver(F3, D3)
        res3 = solver3.solve_exact()
        self.assertEqual(res3["best_cost"], 24.0, "N=3 debe ser exactamente 24.0")

        F4, D4 = load_matrices(N=4)
        solver4 = ClassicalSolver(F4, D4)
        res4 = solver4.solve_exact()
        self.assertEqual(res4["best_cost"], 32.0, "N=4 debe ser exactamente 32.0")

    def test_02_qubo_single_pair_convention(self):
        """Verifica la convención estricta i < k: el costo no debe duplicarse."""
        F, D = load_matrices(N=3)
        builder = QUBOBuilder(F, D, penalty_lambda=60.0)
        # Permutación [0, 1, 2] -> bitstring '100010001'
        bstr = "100010001"
        real_cost, pen_cost, is_feas = builder.evaluate_bitstring(bstr)
        self.assertTrue(is_feas, "Debe ser factible")
        self.assertEqual(real_cost, 24.0, "El costo QUBO de la solución óptima N=3 debe ser 24.0")
        self.assertEqual(pen_cost, 24.0, "La energía total H(x) debe ser igual al costo real C(x) cuando la penalización es 0")

    def test_03_hungarian_bipartite_repair(self):
        """Verifica que el algoritmo húngaro garantice permutaciones biunívocas puras."""
        F, D = load_matrices(N=4)
        prob = QAPProblem(F, D)
        # Matriz ruidosa o con violaciones
        noisy_X = np.array([
            [0.8, 0.2, 0.0, 0.0],
            [0.7, 0.1, 0.2, 0.0], # Fila 1 y 2 compiten por columna 0
            [0.0, 0.1, 0.8, 0.1],
            [0.0, 0.0, 0.1, 0.9]
        ])
        perm, cost = prob.repair_to_permutation(noisy_X)
        self.assertEqual(len(set(perm)), 4, "La permutación reparada debe ser biunívoca sin duplicados")
        self.assertEqual(sorted(perm), [0, 1, 2, 3], "Debe contener todos los índices 0..3")

    def test_04_api_health_endpoint(self):
        """Verifica que la API REST responda con estado healthy y Qiskit 2.x."""
        res = self.client.get("/api/health")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["status"], "healthy")
        self.assertTrue("2." in data["qiskit_version"])

    def test_05_api_optimization_n10_qlns(self):
        """Verifica que Q-LNS N=10 converja a la cota óptima 350.0 (Gap 2.94%)."""
        res = self.client.post("/api/optimize", json={"scale_n": 10, "algorithm": "qaoa"})
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["optimal_cost"], 350.0, "Costo debe converger a 350.0")
        self.assertEqual(data["gap_percentage"], 2.94, "Gap debe ser 2.94%")
        self.assertEqual(data["feasibility_rate"], 1.0, "Factibilidad reparada debe ser 100%")

    def test_06_api_roi_calculation(self):
        """Verifica el cálculo de ROI para el track abierto (+10 Pts)."""
        res = self.client.post("/api/roi", json={"base_cost": 466.0, "optimized_cost": 350.0})
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        econ = data["report"]["economic_impact"]
        self.assertAlmostEqual(econ["total_network_annual_savings_pen"], 280000.0, delta=2000.0)
        self.assertGreater(econ["projected_roi_pct"], 300.0, "ROI debe superar +300%")

if __name__ == "__main__":
    unittest.main()
