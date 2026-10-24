"""
NODUX • SOP Alexander (CTO & Lead Qiskit)
run_demo.py - Comando de Ejecución Oficial en 1 Línea para el Jurado de NTT DATA.
Ejecuta la suite completa de verificación:
1. Verificación matemática exacta N=3 (24.0) y N=4 (32.0).
2. Resolución cuántica híbrida N=10 (100 variables, C*=340).
3. Telemetría de brecha % y métricas industriales de picking de almacén B2B (+10 pts).
"""

import sys
import os
import time

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

sys.path.append(os.path.join(os.path.dirname(__file__), "src"))

from parser import load_matrices
from qap_problem import QAPProblem
from classical_baseline import WaliClassicalSolver
from qiskit_solver import QiskitQAPSolver
from quantum_hybrid import QuantumHybridLNS
from business_roi import WarehousePickingImpactModel

def main():
    print("=" * 80)
    print("⚛️ NODUX • QISKIT FALL FEST LIMA 2026 · RETO NTT DATA QAP10")
    print("Célula: Nodux Core Team (Nicolás López, Alexander Miranda, Walter Carpio, Jesús Regalado)")
    print("Objetivo: 110 PUNTOS | Track Abierto: Almacén B2B y Picking Ferretero-Industrial")
    print("=" * 80)

    print("\n[FASE 1] Verificación de Ground Truths de Control Oficiales (Walter Carpio):")
    for N, expected in [(3, 24.0), (4, 32.0)]:
        F, D = load_matrices(N=N)
        solver = WaliClassicalSolver(F, D)
        res = solver.solve_exact_exhaustive()
        status = "✔ EXACTO" if res['best_cost'] == expected else "❌ DISCREPANCIA"
        print(f"  • Subinstancia N={N} ({N*N} cúbits): Óptimo = {res['best_cost']} (Esperado: {expected}) [{status}] en {res['elapsed_seconds']:.4f}s")

    print("\n[FASE 2] Ejecución del Solver Cuántico QAOA en Qiskit AerSimulator (Alexander Miranda):")
    F3, D3 = load_matrices(N=3)
    p3 = QAPProblem(F3, D3)
    q_solver3 = QiskitQAPSolver(p3, reps=1, penalty_lambda=60.0, shots=1024, seed=42)
    qaoa_res = q_solver3.solve_qaoa(maxiter=20)
    gap3 = p3.gap(qaoa_res['repaired_cost'], 24.0)
    print(f"  • QAOA N=3 (9 cúbits): Costo Reparado = {qaoa_res['repaired_cost']} (Brecha %: {gap3:.2f}%) | Tasa Factible Cruda: {qaoa_res['tasa_factibilidad_pct']:.2f}%")

    print("\n[FASE 3] Resolución de la Instancia Completa N=10 con Quantum Hybrid LNS (Alexander):")
    F10, D10 = load_matrices(N=10)
    p10 = QAPProblem(F10, D10)
    from classical_solvers import ClassicalSolvers
    cs = ClassicalSolvers(p10)
    c2 = cs.solve_2opt(max_restarts=5)
    hybrid_solver = QuantumHybridLNS(p10, subproblem_size=3, seed=42)
    start_t = time.perf_counter()
    h_res = hybrid_solver.solve(max_iterations=20, initial_perm=c2["best_perm"])
    h_time = time.perf_counter() - start_t
    gap10 = p10.gap(h_res['best_cost'], 340.0)
    print(f"  • Q-LNS N=10 (100 variables, sub-circuitos de 9 cúbits): Costo = {h_res['best_cost']} (Brecha %: {gap10:.2f}%) en {h_time:.2f}s")

    print("\n[FASE 4] Métricas de Negocio & ROI Industrial B2B (+10 Pts Bonificación) (Jesús Regalado):")
    wh_model = WarehousePickingImpactModel()
    wh_rep = wh_model.calculate_impact(base_cost=466.0, optimized_cost=h_res['best_cost'])
    kpis = wh_rep["operational_kpis"]
    econ = wh_rep["economic_impact"]
    print(f"  • Distancia ahorrada por operario: {kpis['km_saved_per_operator_day']} km / día ({kpis['minutes_saved_per_shift']:.0f} min liberados al día por operario)")
    print(f"  • Ahorro económico anual: S/ {econ['annual_savings_pen_per_warehouse']:,.2f} por almacén (S/ {econ['total_network_annual_savings_pen']:,.2f} en red de {econ['network_warehouses_count']} almacenes)")
    print(f"  • Retorno sobre la Inversión (ROI 1er año): +{econ['projected_roi_pct']:.1f}%")

    print("\n" + "=" * 80)
    print("🌐 COCKPIT EJECUTIVO Y EXPLORADOR DISPONIBLES:")
    print("  👉 Cockpit Oficial Primario (Flask Micro-API): http://127.0.0.1:5000")
    print("  👉 Explorador Auxiliar (Streamlit): http://127.0.0.1:8502")
    print("=" * 80 + "\n")

if __name__ == "__main__":
    main()
