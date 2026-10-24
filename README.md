# ⚛️ NODUX • QAP10 QUANTUM OPTIMIZER

[![GitHub Repository](https://img.shields.io/badge/GitHub-nodux--quantum-181717.svg?logo=github)](https://github.com/alex8v124/nodux-quantum.git)
[![Python 3.11](https://img.shields.io/badge/Python-3.11-blue.svg)](https://www.python.org/)
[![Qiskit 2.x](https://img.shields.io/badge/Qiskit-2.6.1-6929C4.svg)](https://qiskit.org/)
[![Micro-API](https://img.shields.io/badge/Backend-Flask_REST_<50ms-0A2540.svg)]()
[![Bonus](https://img.shields.io/badge/Open_Track_Bonus-+10_Pts-10B981.svg)]()
[![Célula](https://img.shields.io/badge/Célula-Nodux_Core_Team-0072CE.svg)]()

> **Repositorio Oficial:** [https://github.com/alex8v124/nodux-quantum.git](https://github.com/alex8v124/nodux-quantum.git)  
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
│   ├── qap10.mps.gz            # Archivo oficial MIPLIB qap10 (4,150 variables)
│   └── qap10.sol.gz            # Solución de referencia oficial MIPLIB (340.0)
├── src/
│   ├── qubo_builder.py         # Formulación QUBO, penalizador lambda=60 y mapeo Ising
│   ├── classical_solver.py     # Solver clásico exacto y 2-Opt ILS genuino de Wali
│   ├── quantum_solver.py       # Solvers cuánticos QAOA (Aer) y descomposición Q-LNS
│   ├── business_roi.py         # Modelo de impacto económico S/ 280,000 en almacén B2B
│   └── backend.py              # Micro-API local en Flask multihilo (Endpoints REST /api/...)
├── ui/                         # Plataforma Empresarial de Decisiones Cuánticas
│   ├── css/                    # Design System (tokens, layout industrial, componentes)
│   ├── js/                     # Arquitectura modular (api client, state store, renderers)
│   └── index.html              # Shell semántico estructurado de alta densidad
├── tests/
│   ├── test_system.py          # Suite de pruebas automatizadas CI/CD (100% passing)
│   └── test_api.py             # Pruebas de integración sobre endpoints REST en vivo
├── demo/
│   ├── README.md               # Pauta técnica para el video de contingencia de 60s
│   └── backup_demo.mp4         # Video de respaldo grabado
├── pitch/
│   ├── NODUX_Pitch_Deck_QAP10_NTT_DATA.pptx # Diapositivas oficiales del pitch (16:9)
│   └── GUION_PITCH_3_MINUTOS.md            # Guion cronometrado para los 4 integrantes
├── benchmark.py                # Telemetría oficial Alexander vs Wali
├── run_demo.py                 # Comando oficial de ejecución en consola en 1 línea
├── run_cockpit.bat             # Lanzador unificado en 1 clic offline para Windows
├── requirements.txt            # Dependencias fijas reproducibles
└── README.md                   # Documentación técnica
```

---

## 📐 Modelo Matemático e Instancia MIPLIB qap10 (Walter Carpio & Alexander Miranda)

### 1. Variables de la Instancia y Convención Canónica ($i < k$)
* **Instancia oficial:** `data/qap10.mps.gz` (MIPLIB `qap10`).
* **Conteo de Variables:** Contiene **4,150 variables totales (100 binarias de asignación $X_{ij}$ y 4,050 continuas linealizadas $Y_{ijkl}$)** asociadas a la función objetivo `NOBJ` ($\binom{10}{2} \times 10 \times 9 = 45 \times 90 = 4,050$) y 1,820 restricciones de igualdad.
* **Convención de Conteo Único ($i < k$):** La función de costo:
  $$\min_x C(x) = \sum_{i < k} \sum_{j \neq l} F_{ik} D_{jl} x_{ij} x_{kl}$$
  está implementada rigurosamente en `src/parser.py`, `src/qubo_builder.py`, `src/quantum_solver.py` y `src/classical_solver.py`, garantizando que ningún par se duplique y verificando los óptimos de control oficiales:
  * Subinstancia $N=3$: $C^*(3) = \mathbf{24.0}$
  * Subinstancia $N=4$: $C^*(4) = \mathbf{32.0}$
  * Instancia Completa $N=10$: $C^*(10) = \mathbf{340.0}$ (Ground truth MIPLIB)

### 2. Formulación QUBO y Derivación Calibrada de $\lambda = 60.0$
* **Hamiltoniano Penalizado:** $H(x) = C(x) + \lambda \sum_i (\sum_j x_{ij} - 1)^2 + \lambda \sum_j (\sum_i x_{ij} - 1)^2$.
* **Cota Analítica para el Núcleo Cuántico ($K=3$):** Para que ningún estado inválido tenga menor energía que el óptimo factible:
  $$\lambda > \Delta C_{\max}^{(K=3)} = \max_i \left( \sum_{k \neq i} F_{ik} \right) \cdot \max_{j, l} D_{jl} = 16 \times 2 = 32.0 \quad (\text{cota teórica conservadora: } 40.0)$$
* **Barrido Empírico de Sensibilidad (`qubo_builder.py`):**
  El escaneo en `scan_lambda_sensitivity([10, 30, 50, 60, 100])` demuestra que para $\lambda < 30.0$ la factibilidad colapsa; entre 40 y 50 entra en zona límite; y en **$\lambda = 60.0$** provee un factor de seguridad de **$1.5\times$** sobre la cota teórica de 40.0, protegiendo al optimizador variacional COBYLA sin achatamiento espectral.

### 3. Documentación Rigurosa del Muro de Memoria NISQ
* **Inviabilidad Monolítica en $N=10$:** Un circuito QUBO directo de 100 cúbits exige simular $2^{100} \approx 1.26 \times 10^{30}$ amplitudes complejas, demandando **$\sim 2 \times 10^{31}$ bytes ($\sim 20$ millones de Yottabytes)** de memoria, físicamente imposible en computación clásica e inoperable en procesadores NISQ debido a ruido y decoherencia.
* **Escalabilidad Comprobada (Etapa 3 Finalistas):** La arquitectura **Quantum Large Neighborhood Search (Q-LNS)** desacopla el problema en sub-vecindarios cuánticos activos de **9 cúbits** ($K=3$) manteniendo la memoria cuántica acotada a **8.0 KiB**, validando convergencia a:
  * $N=13$ ($6.2 \times 10^9$ permutaciones): Costo = **670.0** (Gap = **+2.76%** frente a Simulated Annealing 652.0).
  * $N=14$ (**87 mil millones de permutaciones**, $8.7 \times 10^{10}$): Costo = **800.0** (Gap = **+0.25%** frente a Simulated Annealing 798.0).

---

## ⚡ Ejecución Rápida y Despliegue Local (< 1 Minuto)

### 1. Entorno Virtual e Instalación
```powershell
uv venv .venv --python 3.11
.venv\Scripts\activate
uv pip install -r requirements.txt
```

### 2. Comandos de Ejecución — Jerarquía Oficial

#### ▶ Opción 1 (Recomendada para el Jurado): Cockpit Web Interactivo
Lanza la Micro-API Flask y sirve la interfaz ejecutiva HTML5/Vanilla JS:
```powershell
python src/backend.py
```
Abrir en el navegador: **`http://127.0.0.1:5000`**
*(Latencia < 50 ms. Fail-Safe Plan B embebido en JS si el kernel cae.)*

En Windows se puede usar el lanzador en un solo clic:
```powershell
.\run_cockpit.bat
```

#### ▶ Opción 2: Demo de Consola (sin servidor, reproducción offline)
Ejecuta las 4 fases completas en terminal y verifica los ground truths N=3, N=4 y N=10:
```powershell
python run_demo.py
```

#### ▶ Opción 3: Suite de Telemetría Oficial (benchmark completo)
Genera la tabla CSV y las gráficas PNG de comparativa Alexander vs Wali:
```powershell
python benchmark.py
```

#### ▶ Opción 4: Explorador Auxiliar Streamlit (puerto 8502)
Interfaz alternativa con sliders, heatmaps y métricas en tiempo real:
```powershell
streamlit run app.py --server.port 8502
```
*Disponible en: `http://127.0.0.1:8502`*

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
| **$N = 3$** | 9 | **24.0** | 24.0 | **0.00%** | **24.0** | **0.00%** | **1.56%** (rep. 100%) | **0.19 s** |
| **$N = 4$** | 16 | **32.0** | 32.0 | **0.00%** | **32.0** | **0.00%** | **0.04%** (rep. 100%) | **6.21 s** |
| **$N = 10$** | 100 | **340.0** | 466.0 (Greedy) | +37.06% | **350.0** | **+2.94%** | **0.04%** (rep. 100%) | **2.21 s** |

---

## 📦 Jugada de Bonificación: Almacén B2B Ferretero (+10 Pts)

* **Decisión:** Asignar 10 familias de productos ferretero-industriales a 10 bahías para minimizar la distancia de traslado hacia la mesa de packing/consolidación.
* **Métricas Operativas y de Retorno (ROI):**
  * Reducción de costo: De 466 a 340 unidades (reducción del **$27.04\%$** al óptimo; $24.89\%$ con Q-LNS a 350).
  * Velocidad de picking: **$1.2\text{ m/s}$** a **$\text{S/ } 12.00\text{ / hora-hombre}$**.
  * Ahorro de caminata: **$4.2\text{ km}$ por operario al día** (**$58.3\text{ minutos}$ liberados por operario al día**).
  * Dotación: 4 operarios por turno en 2 turnos (8 operarios activos) durante 300 días laborales.
  * Ahorro financiero por almacén: **$\text{S/ } 28,000\text{ anuales por centro}$** ($8 \times \frac{58.3}{60}\text{ h} \times 300\text{ d} \times \text{S/ } 12/\text{h} = \text{S/ } 27,840$).
  * Ahorro financiero en red: **$\text{S/ } 280,000\text{ anuales}$** en una red de 10 centros de distribución medianos.
  * Inversión y ROI visible: Costo de implementación de $\text{S/ } 6,600$ por almacén ($\text{S/ } 66,000$ en red).
    $$\text{ROI} = \frac{\text{S/ } 27,840 - \text{S/ } 6,600}{\text{S/ } 6,600} \times 100\% = \mathbf{+321.8\% \approx +320\%}$$
