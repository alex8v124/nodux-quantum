"""
Parser and Data Extraction Module for QAP10 MIPLIB Instance.
Recovers the exact Quadratic Assignment Problem matrices F (Flows) and D (Distances)
from the linearized MIPLIB instance qap10.mps.gz.
"""

import os
import gzip
import json
from collections import defaultdict
import numpy as np

def extract_qap10_from_mps(mps_path: str = "data/qap10.mps.gz"):
    """
    Parses the linearized MPS file of qap10, maps the Y product variables back to 
    X_ij assignment variables, extracts the objective function coefficients,
    and decomposes the 4D cost tensor into Flow matrix F and Distance matrix D.
    """
    if not os.path.exists(mps_path):
        raise FileNotFoundError(f"MPS file not found at {mps_path}")

    col_rows = defaultdict(dict)
    obj_coeffs = {}

    with gzip.open(mps_path, "rt") as f:
        in_col = False
        for line in f:
            stripped = line.strip()
            if stripped == "COLUMNS":
                in_col = True
                continue
            elif stripped == "RHS":
                break
            if in_col and "MARKER" not in line and not stripped.startswith("*"):
                parts = line.split()
                if not parts:
                    continue
                col = parts[0]
                idx = 1
                while idx + 1 < len(parts):
                    row = parts[idx]
                    val = float(parts[idx + 1])
                    if row == "NOBJ":
                        obj_coeffs[col] = val
                    else:
                        col_rows[col][row] = val
                    idx += 2

    # Map each Y product variable to its constituent X variables
    # Rows have naming C..A{a_idx} corresponding to X{a_idx}
    Q = np.zeros((10, 10, 10, 10), dtype=float)
    mapped_count = 0

    for y, cost in obj_coeffs.items():
        rows = col_rows.get(y, {})
        a_indices = set()
        for r in rows:
            if "A" in r:
                try:
                    a_idx = int(r.split("A")[1])
                    a_indices.add(a_idx)
                except ValueError:
                    pass
        if len(a_indices) == 2:
            idx1, idx2 = sorted(list(a_indices))
            # 1-indexed to 0-indexed:
            i1, j1 = (idx1 - 1) // 10, (idx1 - 1) % 10
            i2, j2 = (idx2 - 1) // 10, (idx2 - 1) % 10
            Q[i1, j1, i2, j2] = cost
            Q[i2, j2, i1, j1] = cost
            mapped_count += 1

    # Extract Distance matrix D:
    # From Q[0, :, 1, :], element 0 and 1 have flow F[0, 1] = 10
    D = (Q[0, :, 1, :] / 10.0).round().astype(int)

    # Extract Flow matrix F:
    # Q[i, 0, k, 1] = F[i, k] * D[0, 1]. Since D[0, 1] = 1, F[i, k] = Q[i, 0, k, 1]
    F = np.zeros((10, 10), dtype=int)
    for i in range(10):
        for k in range(10):
            if i != k:
                F[i, k] = int(round(Q[i, 0, k, 1] / max(D[0, 1], 1)))

    # Verification: check all 4050 pairs
    matches = 0
    total = 0
    for i in range(10):
        for k in range(i + 1, 10):
            for j in range(10):
                for l in range(10):
                    if j != l:
                        total += 1
                        if Q[i, j, k, l] == F[i, k] * D[j, l]:
                            matches += 1

    exact_match = (matches == total and total == 4050)
    return F, D, exact_match, matches, total

def save_recovered_matrices(output_dir: str = "data/matrices"):
    """Extracts and saves the canonical F and D matrices."""
    os.makedirs(output_dir, exist_ok=True)
    F, D, exact_match, matches, total = extract_qap10_from_mps()
    
    np.save(os.path.join(output_dir, "F_10x10.npy"), F)
    np.save(os.path.join(output_dir, "D_10x10.npy"), D)
    
    metadata = {
        "instance": "qap10",
        "dimension": 10,
        "total_linearized_terms": total,
        "verified_exact_matches": matches,
        "exact_recovery": exact_match,
        "control_optima": {
            "N=3": 24,
            "N=4": 32,
            "N=10": 340
        }
    }
    with open(os.path.join(output_dir, "instances_metadata.json"), "w") as f:
        json.dump(metadata, f, indent=2)
        
    return F, D, metadata

def load_matrices(N: int = 10, data_dir: str = "data/matrices"):
    """
    Loads or generates F and D matrices for a given dimension N.
    - If N <= 10: loads canonical qap10 submatrix.
    - If N > 10 (e.g. N=13, N=14 for Stage 3 scalability): extends using the canonical
      Manhattan grid topology and empirical flow distribution.
    """
    f_path = os.path.join(data_dir, "F_10x10.npy")
    d_path = os.path.join(data_dir, "D_10x10.npy")
    
    if not (os.path.exists(f_path) and os.path.exists(d_path)):
        F_full, D_full, _ = save_recovered_matrices(data_dir)
    else:
        F_full = np.load(f_path)
        D_full = np.load(d_path)

    if N <= 10:
        return F_full[:N, :N], D_full[:N, :N]
    
    # Extended instance for Stage 3 (N=13, N=14)
    # Generate spatial Manhattan coordinates for N locations
    rng = np.random.RandomState(42)
    # Grid layout of size ceil(sqrt(N)) x ceil(N / ceil(sqrt(N)))
    cols = int(np.ceil(np.sqrt(N)))
    coords = np.array([(idx // cols, idx % cols) for idx in range(N)])
    
    # Distance matrix D_ext
    D_ext = np.zeros((N, N), dtype=int)
    for j in range(N):
        for l in range(N):
            D_ext[j, l] = abs(coords[j, 0] - coords[l, 0]) + abs(coords[j, 1] - coords[l, 1])
            
    # Flow matrix F_ext based on empirical distribution of qap10
    F_ext = np.zeros((N, N), dtype=int)
    F_ext[:10, :10] = F_full
    for i in range(N):
        for k in range(i + 1, N):
            if i >= 10 or k >= 10:
                val = int(rng.choice([0, 2, 4, 6, 8, 10, 12, 20], p=[0.25, 0.15, 0.15, 0.15, 0.1, 0.1, 0.05, 0.05]))
                F_ext[i, k] = val
                F_ext[k, i] = val
                
    return F_ext, D_ext

if __name__ == "__main__":
    F, D, meta = save_recovered_matrices()
    print("Successfully processed and saved QAP10 matrices:")
    print("Metadata:", meta)
    print("\nF matrix (first 4x4):\n", F[:4, :4])
    print("\nD matrix (first 4x4):\n", D[:4, :4])
