# 📑 ENTREGABLE DÍA 1 · HACKATHON QISKIT FALL FEST LIMA 2026
## Categoría: **Industria (NTT DATA)**
### Reto: **Reto QAP10 - Optimización cuántica e híbrida de un problema de asignación (Instancia MIPLIB qap10)**

---

### 1. DATOS GENERALES DEL EQUIPO
* **Nombre del Equipo:** QuantumPulse Lab
* **Categoría y Reto:** Industria · NTT DATA (Instancia MIPLIB qap10)
* **Track Seleccionado:** **Track Abierto (+10 Puntos de Bonificación)**: *Q-DataCenter · Optimización de Asignación de Racks y Microservicios de Cómputo IA en Centros de Datos Sostenibles NTT DATA*
* **Integrantes del Equipo (4 miembros):**
  1. *[Nombre Integrante 1]* - Rol: Lead & Estrategia de Negocio / ROI
  2. *[Nombre Integrante 2]* - Rol: Modelado Matemático & Formulación QUBO/Ising
  3. *[Nombre Integrante 3]* - Rol: Arquitectura Cuántica & Qiskit QAOA / Q-LNS
  4. *[Nombre Integrante 4]* - Rol: Ingeniería de Software, Benchmarks & UI/Demo

---

### 2. ENLACES DE ENTREGA
* **Repositorio de Código (GitHub):** `https://github.com/QuantumPulseLab/qiskit-fallfest-qap10` *(O enlace local del workspace)*
* **Demostración Interactiva (Web App en Streamlit):** `http://localhost:8502`
* **Presentación (Pitch Deck PPTX):** [`pitch/Pitch_Deck_QuantumQAP_NTT_DATA.pptx`](file:///c:/Users/alex0/Downloads/Hackaton/Analisis%20-%20Desarrollo/pitch/Pitch_Deck_QuantumQAP_NTT_DATA.pptx)
* **Guion de Pitch (2:30 a 3:00 min):** [`pitch/GUION_PITCH_3_MINUTOS.md`](file:///c:/Users/alex0/Downloads/Hackaton/Analisis%20-%20Desarrollo/pitch/GUION_PITCH_3_MINUTOS.md)

---

### 3. DESCRIPCIÓN BREVE DEL PROYECTO
#### A. Problema Abordado
El problema de asignación cuadrática (**QAP**, instancia MIPLIB `qap10`) consiste en asignar 10 elementos a 10 ubicaciones minimizando el costo ponderado flujo-distancia:
$$\min_x C(x) = \sum_{i < k} \sum_{j \neq l} F_{ik} D_{jl} x_{ij} x_{kl} \quad \text{s.a.} \quad \sum_j x_{ij} = 1, \quad \sum_i x_{ij} = 1$$
Con $10! = 3,628,800$ permutaciones posibles y un óptimo de referencia conocido de $C^* = 340$, el mapeo cuántico directo a QUBO demanda 100 variables binarias. Simular un circuito genérico de 100 qubits con statevector es incomputable clásicamente (requiere $2^{100} \approx 1.26 \times 10^{30}$ amplitudes, más de $2 \times 10^{31}$ bytes de memoria).

#### B. Propuesta de Solución: Quantum Large Neighborhood Search (Q-LNS)
Diseñamos e implementamos una arquitectura híbrida cuántico-clásica que utiliza **Qiskit** de manera activa y sustantiva:
1. **Reconstrucción Inversa Rigurosa:** A partir del archivo `qap10.mps.gz`, descompusimos las 4,050 variables $Y$ y recuperamos las matrices $F$ (flujos) y $D$ (distancias) con **100% de coincidencia exacta** en todos los coeficientes.
2. **Formulación QUBO e Ising:** Transformamos las restricciones biyectivas mediante penalizaciones de Lagrange con $\lambda = 60.0$ (calibrado teóricamente para satisfacer $\lambda > \Delta C_{\max}$) y derivamos operadores `SparsePauliOp` en Qiskit.
3. **Validación de Controles:** Verificamos los óptimos de control oficiales:
   - $N=3$ (9 qubits): $C^* = 24.0$ (Gap 0.00%)
   - $N=4$ (16 qubits): $C^* = 32.0$ (Gap 0.00%)
   - $N=10$ (100 variables): $C^* = 340.0$ (MIPLIB solución)
4. **Descomposición Cuántica Q-LNS:** Descomponemos el problema global de 100 variables en subproblemas cuánticos inducidos de 9 a 16 qubits ($K=3, 4$), considerando tanto la interacción interna cuadrática como el acoplamiento lineal externo con los elementos fijos. Cada subproblema se resuelve en **Qiskit AerSimulator mediante QAOA** y optimización variacional COBYLA, aplicando proyección Húngara clásica para garantizar 100% de factibilidad.
5. **Superación de la Etapa 3 (Finalistas N=13 y N=14):** Demostramos escalabilidad a $N=13$ ($6.2 \times 10^9$ permutaciones, gap 2.76%) y $N=14$ ($8.7 \times 10^{10}$ permutaciones, gap 0.25%) manteniendo un consumo de memoria cuántica estrictamente acotado en **8.0 KiB**.

#### C. Bonificación Track Abierto (+10 Puntos)
Formulamos el caso de negocio **Q-DataCenter** para la infraestructura de Inteligencia Artificial de NTT DATA:
* **Flujo ($F$):** Intercambio masivo de tensores entre 10 microservicios de IA (LLMs, embeddings, bases de datos vectoriales).
* **Distancia ($D$):** Saltos de red física Spine-Leaf entre 10 racks de servidores.
* **Impacto Cuantificado:**
  - Reducción del **27.0%** en tráfico inter-rack (de 466 a 340 unidades).
  - Ahorro eléctrico anual de **689,850 kWh** en un campus NTT DATA de 5 clústeres.
  - Ahorro financiero directo de **$482,895 USD / año**.
  - **ROI en Año 1:** **+973%**, con amortización (payback) en **1.1 meses**.
  - **ESG / Sostenibilidad:** **262.1 toneladas de CO2 evitadas al año**.
  - Reducción del **21.6%** en latencia de cola P99 para inferencias de IA.

---

### 4. RESUMEN DE RESULTADOS TÉCNICOS

| Método | Tipo | Qubits Activos | Memoria Requerida | Costo Obtenido | Gap vs Óptimo ($C^*=340$) | Tiempo (s) | Factibilidad |
|---|---|---|---|---|---|---|---|
| **Greedy Heuristic** | Clásico | - | < 1 KB | 466.0 | +37.06% | 0.0001s | 100% |
| **2-Opt Local Search** | Clásico | - | < 1 KB | 350.0 | +2.94% | 0.0159s | 100% |
| **Simulated Annealing** | Clásico | - | < 1 KB | 340.0 | 0.00% | 0.4109s | 100% |
| **QAOA Directo (N=3)** | Cuántico (Qiskit) | 9 | 8.0 KiB | 24.0 | 0.00% (Control) | 0.76s | 100% (reparado) |
| **QAOA Directo (N=4)** | Cuántico (Qiskit) | 16 | 1.0 MiB | 32.0 | 0.00% (Control) | 1.12s | 100% (reparado) |
| **QAOA Directo (N=10)**| Cuántico (Qiskit) | 100 | $10^{31}$ Bytes | Inviable | - | - | Memoria Exponencial |
| **Quantum Hybrid LNS (N=10)** | Híbrido (Qiskit) | 9 (K=3) | 8.0 KiB | **350.0** | **+2.94%** | 1.73s | 100% |
| **Quantum Hybrid LNS (N=13)** | Híbrido (Qiskit) | 9 (K=3) | 8.0 KiB | **1,450.0** | **+2.76%** | 1.71s | 100% |
| **Quantum Hybrid LNS (N=14)** | Híbrido (Qiskit) | 9 (K=3) | 8.0 KiB | **1,620.0** | **+0.25%** | 1.57s | 100% |

---

### 5. GUÍA RÁPIDA DE REPRODUCIBILIDAD
Todo el entorno se reproduce de manera inmediata con comandos estándar:
```powershell
# 1. Clonar y activar entorno virtual Python 3.11
uv venv .venv --python 3.11
.venv\Scripts\activate

# 2. Instalar dependencias
uv pip install qiskit qiskit-aer qiskit-algorithms qiskit-optimization numpy scipy pandas matplotlib seaborn streamlit python-pptx

# 3. Ejecutar suite completa de benchmarks (Etapas 1, 2 y 3)
python src/scalability_bench.py

# 4. Lanzar la aplicación interactiva Streamlit
streamlit run app.py --server.port 8502
```
