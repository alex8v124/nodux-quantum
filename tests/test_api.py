import urllib.request
import json

print("=== AUDITORIA DE API EN VIVO (http://127.0.0.1:5000) ===")
for n in [3, 4, 10]:
    for algo in ["qaoa", "classical"]:
        req = urllib.request.Request(
            "http://127.0.0.1:5000/api/optimize",
            data=json.dumps({"scale_n": n, "lambda_penalty": 60, "shots": 1024, "algorithm": algo}).encode("utf-8"),
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req) as resp:
            d = json.loads(resp.read().decode("utf-8"))
            print(f"N={n:2d} | Algo: {algo:9s} -> Costo: {d['optimal_cost']:5.1f} | Control: {d['control_target']:5.1f} | Gap: {d['gap_percentage']:5.2f}% | Factibilidad: {d['feasibility_rate']} | Tiempo: {d['execution_time_ms']:7.2f} ms")
