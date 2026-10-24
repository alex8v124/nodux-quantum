# 📑 ENTREGABLE DÍA 1 · HACKATHON QISKIT FALL FEST LIMA 2026
## Categoría: **Industria (NTT DATA)**
### Reto: **Reto QAP10 - Optimización cuántica e híbrida de un problema de asignación (Instancia MIPLIB qap10)**
### Célula: **Nodux Core Team**

---

### 1. DATOS GENERALES DEL EQUIPO
* **Nombre del Equipo:** Nodux (Nodux Core Team)
* **Categoría y Reto:** Industria · NTT DATA (Instancia MIPLIB qap10)
* **Track Seleccionado:** **Track Abierto (+10 Puntos de Bonificación)**: *Optimización de Almacén B2B y Picking de Alta Rotación en Centros de Distribución Ferretero-Industrial*
* **Integrantes del Equipo (4 miembros acreditados):**
  1. **Nicolás López** - Rol: CEO / Pitch & B2B Strategy
  2. **Alexander Miranda** - Rol: CTO / Qiskit Lead (QUBO, Ising & QAOA)
  3. **Walter "Wali" Carpio** - Rol: Head of Data & BI (MIPLIB Engineering & Classical Baseline)
  4. **Jesús Regalado** - Rol: COO / Operaciones (Métricas Industriales, Picking & Demo)

---

### 2. ENLACES DE ENTREGA OBLIGATORIOS (PORTAL WEB)
* **Repositorio GitHub Oficial:** [https://github.com/alex8v124/nodux-quantum.git](https://github.com/alex8v124/nodux-quantum.git)
* **Cockpit Oficial Ejecutivo (Primario):** Web App Vanilla JS + Micro-API Flask en `http://127.0.0.1:5000` (con Fail-Safe Plan B integrado).
* **Explorador Interactivo Auxiliar:** Web App en Streamlit corriendo en `http://127.0.0.1:8502`.
* **Presentación PPT Oficial:** [`pitch/NODUX_Pitch_Deck_QAP10_NTT_DATA.pptx`](file:///c:/Users/alex0/Downloads/Hackaton/Analisis%20-%20Desarrollo/pitch/NODUX_Pitch_Deck_QAP10_NTT_DATA.pptx)
* **Guion de Pitch Cronometrado (2:45 min):** [`pitch/GUION_PITCH_3_MINUTOS.md`](file:///c:/Users/alex0/Downloads/Hackaton/Analisis%20-%20Desarrollo/pitch/GUION_PITCH_3_MINUTOS.md)

---

### 3. DESCRIPCIÓN BREVE DEL PROYECTO
#### A. Problema Abordado
El problema de asignación cuadrática (**QAP10**, instancia MIPLIB `qap10`) busca asignar 10 elementos a 10 ubicaciones minimizando el costo ponderado flujo-distancia:
$$\min_x C(x) = \sum_{i < k} \sum_{j \neq l} F_{ik} D_{jl} x_{ij} x_{kl} \quad \text{s.a.} \quad \sum_j x_{ij} = 1, \quad \sum_i x_{ij} = 1, \quad x_{ij} \in \{0, 1\}$$
El espacio de búsqueda abarca $10! = 3,628,800$ permutaciones posibles con un óptimo de referencia conocido de $C^* = 340$. La formulación QUBO directa exige 100 cúbits binarios ($2^{100} \approx 1.26 \times 10^{30}$ estados amplitudes $\times 16$ bytes $\approx 2 \times 10^{31}$ bytes, equivalente a **20 millones de Yottabytes**), cuya simulación por vector de estado es físicamente imposible en computación clásica e inviable en procesadores NISQ debido a ruido y decoherencia.

#### B. Propuesta de Solución Técnica (Nodux Pipeline)
1. **Extracción y Validación de Datos (Walter Carpio):** A partir del archivo `qap10.mps.gz`, decodificamos las **4,150 variables totales del modelo linealizado**: 100 variables binarias de asignación $X_{ij}$ y las **4,050 variables auxiliares de linealización $Y_{ijkl} = X_{ij}X_{kl}$** con coeficiente en `NOBJ`, recuperando las matrices canónicas $F$ y $D$ con **100% de coincidencia exacta** en todos los términos. Verificamos los óptimos de control oficiales:
   - Subinstancia $N=3$: $C^* = 24.0$ (Exacto)
   - Subinstancia $N=4$: $C^* = 32.0$ (Exacto)
   - Instancia Completa $N=10$: $C^* = 340.0$ (Ground truth MIPLIB)
2. **Formulación Cuántica en Qiskit (Alexander Miranda):** Construimos el Hamiltoniano QUBO con penalización **$\lambda = 60.0$** (demostrado analíticamente a partir de la cota mínima $\lambda > \Delta C_{\max} = 16 \times 2 = 32.0$ para el núcleo $N=3$, con cota teórica conservadora de 40, aplicando un factor de seguridad de $1.5\times$ para garantizar la factibilidad del estado fundamental). Mapeamos a espín mediante $x = (I - Z)/2$, generando operadores `SparsePauliOp` en Qiskit.
3. **Innovación Híbrida: Quantum Large Neighborhood Search (Q-LNS):** En lugar de un circuito de 100 cúbits intratable, Q-LNS descompone la instancia en sub-vecindarios cuánticos activos de **9 a 16 cúbits** ($K=3, 4$) basados en gradientes de flujo e interacción. Cada subproblema incorpora la interacción cuadrática interna y el acoplamiento lineal exacto con elementos fijos, resolviéndose con **QAOA en Qiskit AerSimulator** y optimización variacional COBYLA.
4. **Factibilidad Estricta:** Aplicamos proyección determinista al espacio biyectivo mediante Matching Bipartito Húngaro clásico (`scipy.optimize.linear_sum_assignment`), garantizando 100% de factibilidad y reportando tanto la tasa cruda (0.04%) como el costo factible (100%).
5. **Prueba de Escalabilidad Etapa 3 (Finalistas N=13 y N=14):** Demostramos convergencia a $N=13$ ($6.2 \times 10^9$ perms, gap 2.76%) y $N=14$ ($14! \approx \mathbf{87\text{ mil millones}}$ de permutaciones, gap 0.25%) manteniendo la memoria cuántica acotada a **8.0 KiB**.
6. **Postura Científica y Utilidad Metodológica:** No pretendemos "ventaja cuántica" frente a Simulated Annealing clásico en CPU. Demostramos la utilidad metodológica de Qiskit al resolver con precisión analítica los sub-Hamiltonianos activos de 9 cúbits e integrar un pipeline híbrido NISQ reproducible.

#### C. Jugada de Bonificación: Track Abierto (+10 Puntos)
**Caso: Optimización de Almacén B2B y Picking de Alta Rotación (Jesús Regalado & Nicolás López)**
* **Decisión:** Asignar 10 familias de productos a 10 zonas de estantería en centros de distribución ferretero-industrial para minimizar el recorrido de picking hacia la mesa de consolidación/packing.
* **Matriz $F_{ik}$:** Frecuencia histórica de co-ocurrencia de pedidos cruzados entre familias $i$ y $k$.
* **Matriz $D_{jl}$:** Distancia física en metros entre estantes $j$ y $l$ respecto a la zona de packing.
* **Métricas y Supuestos Operativos:**
  - Velocidad media de picking: $1.2\text{ m/s}$.
  - Costo hora-hombre: $\text{S/ } 12.00\text{ / hora}$.
  - Reducción de costo: De 466 (Greedy) a 340 (Óptimo) es una reducción del **27.04%** (126 unidades ponderadas; a 350 es 24.89%).
  - Ahorro de traslado: **4.2 km menos de caminata por operario al día**, liberando **58 minutos diarios** por operario.
  - Ahorro financiero por almacén: 4 operarios por turno en 2 turnos (8 operarios) $\times$ 58.3 min $\times$ 300 días $\times$ S/ 12/h = **S/ 28,000 anuales por almacén** (**S/ 278,400 en la red de 10 almacenes**).
  - Inversión y ROI: Con una inversión tecnológica de S/ 6,600 por almacén (S/ 66,000 en la red), el retorno de inversión del primer año es:
    $$\text{ROI} = \frac{\text{S/ } 27,840 - \text{S/ } 6,600}{\text{S/ } 6,600} \times 100\% = \mathbf{+321.8\% \approx +320\%}$$
  - Ergonomía: Reducción drástica de fatiga física y micro-traumatismos en operarios.

---

### 4. AUDITORÍA TÉCNICA COMPARATIVA

| Método | Tipo | Qubits Activos | Memoria Requerida | Costo Obtenido | Brecha frente al Óptimo ($C^*=340$) | Tiempo (s) | Factibilidad |
|---|---|---|---|---|---|---|---|
| **Greedy Heuristic** | Clásico | - | < 1 KB | 466.0 | +37.06% | 0.0001s | 100% |
| **2-Opt Local Search** | Clásico | - | < 1 KB | 350.0 | +2.94% | 0.0159s | 100% |
| **Simulated Annealing** | Clásico | - | < 1 KB | 340.0 | 0.00% | 0.4109s | 100% |
| **QAOA Directo (N=3)** | Cuántico (Qiskit) | 9 | 8.0 KiB | 24.0 | 0.00% (Control 24) | 0.19s | 100% (rep.) / 1.56% (cruda) |
| **QAOA Directo (N=4)** | Cuántico (Qiskit) | 16 | 1.0 MiB | 32.0 | 0.00% (Control 32) | 6.21s | 100% (rep.) / 0.04% (cruda) |
| **QAOA Directo (N=10)**| Cuántico (Qiskit) | 100 | $2 \times 10^{31}$ Bytes (20M YB) | Inviable | - | - | Memoria Exponencial |
| **Quantum Hybrid LNS (N=10)** | Híbrido (Qiskit) | 9 (K=3) | **8.0 KiB** | **350.0** | **+2.94% (C*=340)** | 2.21s | 100% (rep.) / 0.04% (cruda) |
| **Quantum Hybrid LNS (N=13)** | Híbrido (Qiskit) | 9 (K=3) | **8.0 KiB** | **670.0** | **+2.76% (Ref SA 652)** | 1.71s | 100% |
| **Quantum Hybrid LNS (N=14)** | Híbrido (Qiskit) | 9 (K=3) | **8.0 KiB** | **800.0** | **+0.25% (Ref SA 798)** | 1.57s | 100% |

$$\text{Brecha } (\%) = 100 \times \frac{C - 340}{340} = 100 \times \frac{350 - 340}{340} = 2.94\%$$

---

### 5. VERIFICACIÓN DE REPRODUCIBILIDAD
Todo el proyecto es ejecutable con el archivo de dependencias `requirements.txt`:
```powershell
# 1. Configurar entorno virtual con Python 3.11
uv venv .venv --python 3.11
.venv\Scripts\activate

# 2. Instalar dependencias exactas
uv pip install -r requirements.txt

# 3. Correr suite de benchmarks y telemetría oficial
python benchmark.py
python src/scalability_bench.py

# 4. Lanzar el Cockpit Oficial Primario (Flask + UI)
python src/backend.py
# Acceso inmediato en navegador: http://127.0.0.1:5000

# 5. Opcional: Lanzar Explorador Auxiliar (Streamlit)
streamlit run app.py --server.port 8502
# Acceso: http://127.0.0.1:8502
```
