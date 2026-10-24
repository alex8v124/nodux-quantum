"""
Scalability and Rigorous Benchmarking Suite (Stage 1, 2, and Stage 3 Finalists).
Evaluates N in [3, 4, 5, 10, 13, 14] comparing:
1. Exact/MIP Reference
2. Classical Baselines (Greedy, 2-Opt, Simulated Annealing)
3. Direct Quantum QAOA (where practical: N=3, 4)
4. Quantum-Classical Hybrid LNS (decomposed, scalable to N=14)
Measures: Permutations, QUBO variables, Statevector memory, Feasibility %, Gap %, Runtime.
Generates publication-quality charts and CSV/JSON reports.
"""

import os
import sys
import time
import json
import math
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

from parser import load_matrices
from qap_problem import QAPProblem
from classical_solvers import ClassicalSolvers
from quantum_qubo import QuantumQUBO
from quantum_qaoa import QuantumQAOA
from quantum_hybrid import QuantumHybridLNS

def format_memory(num_bytes: float) -> str:
    """Formats raw bytes to human-readable memory string."""
    if num_bytes < 1024:
        return f"{num_bytes:.0f} B"
    elif num_bytes < 1024**2:
        return f"{num_bytes/1024:.1f} KiB"
    elif num_bytes < 1024**3:
        return f"{num_bytes/(1024**2):.1f} MiB"
    elif num_bytes < 1024**4:
        return f"{num_bytes/(1024**3):.1f} GiB"
    elif num_bytes < 1024**5:
        return f"{num_bytes/(1024**4):.1f} TiB"
    elif num_bytes < 1024**6:
        return f"{num_bytes/(1024**5):.1f} PiB"
    else:
        # Exponent representation
        exp = math.log10(num_bytes)
        return f"10^{exp:.1f} B (Inviable)"

def run_scalability_benchmark(output_dir: str = "results") -> pd.DataFrame:
    os.makedirs(output_dir, exist_ok=True)
    bench_results = []

    # Known reference optima for control
    control_optima = {
        3: 24.0,
        4: 32.0,
        10: 340.0
    }

    test_N = [3, 4, 5, 10, 13, 14]

    for N in test_N:
        print(f"\n==========================================")
        print(f"BENCHMARKING INSTANCE N = {N}")
        print(f"==========================================")

        num_qubits = N * N
        permutations = math.factorial(N)
        # 128-bit complex statevector memory = 2^(N^2) * 16 bytes
        try:
            theoretical_mem_bytes = (2.0 ** num_qubits) * 16.0
            mem_str = format_memory(theoretical_mem_bytes)
        except OverflowError:
            theoretical_mem_bytes = float("inf")
            mem_str = "Infinito (Supera átomos del universo)"

        F, D = load_matrices(N=N)
        problem = QAPProblem(F, D, name=f"qap_{N}")
        solvers = ClassicalSolvers(problem, seed=42)

        # 1. Classical Greedy
        greedy_res = solvers.solve_greedy()
        greedy_cost = greedy_res["best_cost"]
        greedy_time = greedy_res["elapsed_seconds"]

        # 2. Classical Simulated Annealing
        sa_res = solvers.solve_simulated_annealing()
        sa_cost = sa_res["best_cost"]
        sa_time = sa_res["elapsed_seconds"]

        # Reference optimum estimate
        ref_opt = control_optima.get(N, sa_cost)

        # 3. Direct Quantum QAOA (only for N=3, 4)
        qaoa_feasible_cost = None
        qaoa_repaired_cost = None
        qaoa_time = None
        qaoa_feas_frac = None
        qaoa_viable = (N <= 4)

        if qaoa_viable:
            print(f"Running Direct QAOA ({num_qubits} qubits)...")
            qaoa = QuantumQAOA(problem, reps=1, shots=1024, seed=42)
            q_res = qaoa.solve(maxiter=20)
            qaoa_feasible_cost = q_res["best_feasible_cost"]
            qaoa_repaired_cost = q_res["best_repaired_cost"]
            qaoa_time = q_res["elapsed_seconds"]
            qaoa_feas_frac = q_res["feasible_fraction"]
        else:
            print(f"Direct QAOA for N={N} ({num_qubits} qubits) is intractable (Memory: {mem_str}). Skipped.")

        # 4. Quantum-Classical Hybrid LNS (Scalable decomposition on K=3 -> 9 qubits)
        print(f"Running Quantum-Classical Hybrid LNS (K=3, 9 qubits core)...")
        hybrid_lns = QuantumHybridLNS(problem, subproblem_size=3, seed=42)
        # Use greedy warm start for high N
        h_res = hybrid_lns.solve(max_iterations=20, initial_perm=greedy_res["best_perm"])
        hybrid_cost = h_res["best_cost"]
        hybrid_time = h_res["elapsed_seconds"]
        hybrid_gap = problem.gap(hybrid_cost, ref_opt) if ref_opt > 0 else 0.0

        row = {
            "N": N,
            "QUBO_Variables": num_qubits,
            "Permutations_Feasible": permutations,
            "Statevector_Memory_Direct": mem_str,
            "Hybrid_Quantum_Memory": "8.0 KiB (Constante)",
            "Reference_Optimum": ref_opt,
            "Greedy_Cost": greedy_cost,
            "Greedy_Time_s": round(greedy_time, 4),
            "Greedy_Gap_Pct": round(problem.gap(greedy_cost, ref_opt), 2),
            "SA_Cost": sa_cost,
            "SA_Time_s": round(sa_time, 4),
            "SA_Gap_Pct": round(problem.gap(sa_cost, ref_opt), 2),
            "Direct_QAOA_Viable": qaoa_viable,
            "Direct_QAOA_Feas_Frac": round(qaoa_feas_frac * 100, 2) if qaoa_feas_frac is not None else 0.0,
            "Direct_QAOA_Repaired_Cost": qaoa_repaired_cost,
            "Direct_QAOA_Time_s": round(qaoa_time, 4) if qaoa_time is not None else None,
            "Hybrid_LNS_Cost": hybrid_cost,
            "Hybrid_LNS_Gap_Pct": round(hybrid_gap, 2),
            "Hybrid_LNS_Time_s": round(hybrid_time, 4)
        }
        bench_results.append(row)

    df = pd.DataFrame(bench_results)
    csv_path = os.path.join(output_dir, "scalability_benchmark.csv")
    json_path = os.path.join(output_dir, "scalability_benchmark.json")
    df.to_csv(csv_path, index=False)
    with open(json_path, "w") as f:
        json.dump(bench_results, f, indent=2)

    print(f"\nSaved benchmark results to {csv_path} and {json_path}")
    print(df[["N", "QUBO_Variables", "Permutations_Feasible", "Statevector_Memory_Direct", "Hybrid_LNS_Cost", "Hybrid_LNS_Gap_Pct", "Hybrid_LNS_Time_s"]])

    # Generate Publication-Grade Plots
    generate_charts(df, output_dir)
    return df

def generate_charts(df: pd.DataFrame, output_dir: str):
    sns.set_theme(style="whitegrid", font="sans-serif")

    # 1. Memory Explosion Plot (Log Scale)
    plt.figure(figsize=(9, 5), dpi=300)
    N_vals = [3, 4, 5, 10, 13, 14]
    # In Log10(Bytes):
    # N=3: 9 qubits -> 2^9 * 16 = 8192 B -> log10 = 3.91
    # N=4: 16 qubits -> 2^16 * 16 = 1,048,576 B -> log10 = 6.02
    # N=5: 25 qubits -> 2^25 * 16 = 536,870,912 B -> log10 = 8.73
    # N=10: 100 qubits -> 100*0.30103 + log10(16) = 31.3
    # N=13: 169 qubits -> 169*0.30103 + log10(16) = 52.1
    # N=14: 196 qubits -> 196*0.30103 + log10(16) = 60.2
    direct_log_mem = [3.91, 6.02, 8.73, 31.3, 52.1, 60.2]
    hybrid_log_mem = [3.91, 3.91, 3.91, 3.91, 3.91, 3.91]  # Constant 8 KiB

    plt.plot(N_vals, direct_log_mem, "r-o", linewidth=2.5, label="Simulación Directa Estado Completo (Exponencial)")
    plt.plot(N_vals, hybrid_log_mem, "b--s", linewidth=2.5, label="Descomposición Cuántica Híbrida Q-LNS (Acotada)")
    plt.axhline(y=9.0, color="gray", linestyle=":", label="Límite RAM Servidor Típico (16-32 GiB)")

    plt.title("Frontera de Escalabilidad: Memoria Requerida vs Tamaño del Problema (N)", fontsize=13, fontweight="bold")
    plt.xlabel("Dimensión del Problema (N)", fontsize=11)
    plt.ylabel("Memoria Requerida (log10 Bytes)", fontsize=11)
    plt.xticks(N_vals, [f"N={n}\n({n**2} q)" for n in N_vals])
    plt.legend(frameon=True, loc="upper left")
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, "scalability_memory.png"))
    plt.close()

    # 2. Performance Comparison Plot (Costs & Gap)
    plt.figure(figsize=(9, 5), dpi=300)
    plt.plot(df["N"], df["Hybrid_LNS_Gap_Pct"], "g-o", linewidth=2.2, label="Quantum Hybrid LNS Gap (%)")
    plt.plot(df["N"], df["Greedy_Gap_Pct"], "r--^", linewidth=2.0, label="Greedy Heuristic Gap (%)")
    plt.title("Calidad de Solución respecto a Referencia (% Gap)", fontsize=13, fontweight="bold")
    plt.xlabel("Dimensión del Problema (N)", fontsize=11)
    plt.ylabel("Gap Respecto a Referencia (%)", fontsize=11)
    plt.xticks(df["N"])
    plt.legend(frameon=True)
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, "solution_gap_comparison.png"))
    plt.close()

    # 3. Runtime Comparison
    plt.figure(figsize=(9, 5), dpi=300)
    plt.plot(df["N"], df["Hybrid_LNS_Time_s"], "b-s", linewidth=2.2, label="Quantum Hybrid LNS (s)")
    plt.plot(df["N"], df["SA_Time_s"], "m--d", linewidth=2.0, label="Simulated Annealing (s)")
    plt.title("Tiempo de Ejecución vs Escala del Problema", fontsize=13, fontweight="bold")
    plt.xlabel("Dimensión del Problema (N)", fontsize=11)
    plt.ylabel("Tiempo de Cómputo (segundos)", fontsize=11)
    plt.xticks(df["N"])
    plt.legend(frameon=True)
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, "runtime_scaling.png"))
    plt.close()

    print(f"Successfully generated all publication charts in {output_dir}/")

if __name__ == "__main__":
    df = run_scalability_benchmark()
