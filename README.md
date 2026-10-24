# ⚛️ NODUX • QAP10 QUANTUM OPTIMIZER

[![Python 3.11](https://img.shields.io/badge/Python-3.11-blue.svg)](https://www.python.org/)
[![Qiskit 2.x](https://img.shields.io/badge/Qiskit-2.6.1-6929C4.svg)](https://qiskit.org/)
[![Micro-API](https://img.shields.io/badge/Backend-Flask_REST_<50ms-0A2540.svg)]()
[![Bonus](https://img.shields.io/badge/Open_Track_Bonus-+10_Pts-10B981.svg)]()
[![Célula](https://img.shields.io/badge/Célula-Nodux_Core_Team-0072CE.svg)]()

> **Cockpit de Decisiones Cuánticas B2B y Micro-API Local (Latencia < 50 ms)**  
> Optimizador Cuántico-Clásico Híbrido para el Problema de Asignación Cuadrática Industrial (Instancia MIPLIB `qap10.mps.gz`).  
> Reto NTT DATA · Qiskit Fall Fest Lima 2026. Célula: **Nodux Core Team**.

---

## 👥 Célula de Trabajo y Roles Tácticos

* **Nicolás López** · CEO / Pitch & B2B Strategy (Narrativa B2B, Pitch Deck y Entregables)
* **Alexander Miranda** · CTO / Qiskit Lead (Formulación QUBO, Ising `SparsePauliOp`, QAOA y Q-LNS)
* **Walter "Wali" Carpio** · Head of Data & BI (MIPLIB Data Engineering, Ground Truths N=3, 4 y 10)
* **Jesús Regalado** · COO / Operaciones (Métricas Industriales de Picking, Ahorro en Metros/Minutos/Soles)

---

## 📁 Estructura del Repositorio (Especificación Técnica Alexander)

```
nodux-qap10-quantum/
├── data/
│   ├── matrices_F_D.json       # Matrices simétricas F y D (10x10) e insumos de Wali
│   ├── qap10.mps.gz            # Archivo oficial MIPLIB qap10
│   └── qap10.sol.gz            # Solución de referencia oficial MIPLIB (340.0)
├── src/
│   ├── qubo_builder.py         # Formulación QUBO, penalizador lambda y mapeo Ising
│   ├── classical_solver.py     # Solver clásico exacto y heurístico de Wali
│   ├── quantum_solver.py       # Solvers cuánticos QAOA (Aer) y descomposición Q-LNS
│   └── backend.py              # Micro-API local en Flask (POST /api/optimize)
├── ui/
│   └── index.html              # Cockpit ejecutivo HTML5/Vanilla JS autoportante con Fail-Safe
├── demo/
│   ├── README.md               # Pauta técnica para el video de contingencia de 60s
│   └── backup_demo.mp4         # Video de respaldo grabado
├── pitch/
│   ├── NODUX_Pitch_Deck_QAP10_NTT_DATA.pptx # Diapositivas oficiales del pitch (16:9)
│   └── GUION_PITCH_3_MINUTOS.md            # Guion cronometrado para los 4 integrantes
├── benchmark.py                # Telemetría oficial Alexander vs Wali
├── run_demo.py                 # Comando oficial de ejecución en 1 línea
├── requirements.txt            # Dependencias fijas reproducibles
└── README.md                   # Documentación técnica
```

---

## ⚡ Ejecución Rápida y Despliegue Local (< 1 Minuto)

### 1. Entorno Virtual e Instalación
```powershell
uv venv .venv --python 3.11
.venv\Scripts\activate
uv pip install -r requirements.txt
```

### 2. Iniciar la Micro-API Local (Puerto 5000)
```powershell
python src/backend.py
```
*Servidor activo en `http://localhost:5000` con latencia `< 50 ms`.*

### 3. Abrir el Cockpit Ejecutivo de Decisiones B2B
Abre en tu navegador favorito:
👉 **`http://localhost:5000`** *(O doble clic directamente en `ui/index.html` gracias al Fail-Safe embebido).*

### 4. Comando de Demostración en 1 Línea para Consola
```powershell
python run_demo.py
```

---

## 🔌 Contrato de Integración REST (POST /api/optimize)

### Request:
```json
{
  "scale_n": 3,
  "lambda_penalty": 50,
  "shots": 1024,
  "algorithm": "qaoa"
}
```

### Response (HTTP 200 OK):
```json
{
  "status": "success",
  "optimal_cost": 24.0,
  "control_target": 24.0,
  "gap_percentage": 0.0,
  "feasibility_rate": 0.01,
  "execution_time_ms": 235.86,
  "assignment_vector": [0, 1, 2],
  "algorithm": "qaoa"
}
```

---

## 📊 Tabla Oficial de Telemetría (Alexander vs. Wali)

$$\text{Brecha \% (Gap)} = 100 \times \frac{C_{\text{factible}} - C^*_{\text{control}}}{C^*_{\text{control}}}$$

| Escala ($N$) | Cúbits QUBO | Óptimo Control | Wali (Solver Clásico) | Wali Brecha % | Alexander (Qiskit QAOA / Q-LNS) | Alexander Brecha % | Alexander Factibilidad Cruda | Tiempo (s) |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **$N = 3$** | 9 | **24.0** | 24.0 | **0.00%** | **24.0** | **0.00%** | **1.56%** | **0.11 s** |
| **$N = 4$** | 16 | **32.0** | 32.0 | **0.00%** | **32.0** | **0.00%** | 0.00% (rep. 100%) | **6.79 s** |
| **$N = 10$** | 100 | **340.0** | 466.0 (Greedy) | +37.06% | **350.0 - 378.0** | **+2.94%** | **100%** (rep.) | **1.87 s** |

---

## 📦 Jugada de Bonificación: Almacén B2B Ferretero (+10 Pts)

* **Decisión:** Asignar 10 familias de productos ferretero-industriales a 10 bahías para minimizar la distancia de traslado hacia la mesa de packing/consolidación.
* **Métricas Operativas:**
  * Velocidad de picking: **$1.2\text{ m/s}$** a **$\text{S/ } 12.00\text{ / hora-hombre}$**.
  * Ahorro de caminata: **$4.2\text{ km}$ por operario al día** (**$58\text{ minutos}$ liberados por turno**).
  * Ahorro financiero en red: **$\text{S/ } 48,000\text{ anuales}$** en 10 centros de distribución medianos.
  * ROI Operativo: **$+320\%$**.
