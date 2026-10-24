import unittest
import numpy as np
import json
import os
import sys

# Ensure src is on PATH
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "src")))
from classical_solver import calcular_costo_qap, solve_greedy, solve_2opt, get_ground_truth
from backend import app

class TestBenchmarkModel(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()
        data_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data", "matrices_F_D.json"))
        with open(data_path, "r") as f:
            d = json.load(f)
        self.F = np.array(d["F"])
        self.D = np.array(d["D"])

    def test_ground_truth_cost(self):
        gt = get_ground_truth(10)
        self.assertEqual(gt["costo"], 340.0)
        self.assertEqual(gt["gap"], 0.0)
        self.assertEqual(gt["perm"], [2, 6, 3, 0, 8, 4, 5, 1, 7, 9])
        # Verify calculated cost
        c = calcular_costo_qap(gt["perm"], self.F, self.D)
        self.assertEqual(c, 340.0)

    def test_greedy_solver(self):
        res = solve_greedy(self.F, self.D)
        self.assertEqual(res["costo"], 466.0)
        self.assertAlmostEqual(res["gap"], 37.06, places=1)
        self.assertEqual(res["perm"], [9, 2, 3, 4, 0, 1, 6, 5, 8, 7])

    def test_2opt_solver(self):
        res = solve_2opt(self.F, self.D)
        self.assertLess(res["costo"], 466.0)
        self.assertGreaterEqual(res["costo"], 340.0)
        self.assertIn("perm", res)

    def test_benchmark_endpoint(self):
        response = self.app.get("/api/benchmark")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data["status"], "success")
        self.assertEqual(data["ground_truth"]["costo"], 340.0)
        self.assertEqual(data["greedy"]["costo"], 466.0)
        self.assertEqual(data["quantum_qlns"]["costo"], 350.0)
        self.assertAlmostEqual(data["quantum_qlns"]["gap"], 2.94, places=2)

if __name__ == "__main__":
    unittest.main()
