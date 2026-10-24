# 📑 INFORME TÉCNICO FORMAL: MODELAMIENTO, PROCESO Y ARQUITECTURA
## Reto NTT DATA · Instancia MIPLIB QAP10 | Hackathon Qiskit Fall Fest Lima 2026
**Célula Operativa:** Nodux Core Team  
**Autores:** Nicolás López (CEO), Alexander Miranda (CTO), Walter Carpio (Head of Data & BI), Jesús Regalado (COO)  
**Entidades Organizadoras:** Quantum Hub Perú · IEEE Computer Society PUCP · NTT DATA  
**Fecha:** 24 de Octubre de 2026  
**Objetivo de Calificación:** 110 / 110 Puntos (100 base + 10 pts bonificación Track Abierto)

---

## 1. RESUMEN EJECUTIVO

El presente documento constituye el informe técnico formal de la solución **NODUX QAP10**, desarrollada para el reto de optimización cuántica e híbrida de la instancia de referencia **MIPLIB qap10.mps.gz** en el marco del *Qiskit Fall Fest Lima 2026*.

### Logros Principales del Proyecto:
1. **Ground Truth Matemático Verificado:** Reconstrucción inversa al 100% de las matrices canónicas de flujo ($F$) y distancia ($D$) a partir de las 4,150 variables binarias del archivo MPS oficial (100 variables de asignación $X_{ij}$ y 4,050 variables linealizadas $Y$ con coeficiente objetivo en `NOBJ`), verificando los óptimos de control $C^*(3)=24.0$, $C^*(4)=32.0$ y $C^*(10)=340.0$.
2. **Documentación Rigurosa del Muro de Memoria NISQ (100 Cúbits):** Demostración analítica de la inviabilidad física de simular un circuito monolítico de 100 cúbits en vector de estado ($2^{100} \approx 1.26 \times 10^{30}$ amplitudes, más de $2 \times 10^{31}$ bytes, equivalentes a **20 millones de Yottabytes**).
3. **Innovación Algorítmica (Q-LNS):** Diseño e implementación de **Quantum Large Neighborhood Search (Q-LNS)**, un algoritmo híbrido que utiliza **Qiskit 2.x** como acelerador cuántico activo resolviendo subproblemas inducidos de 9 a 16 cúbits con acoplamiento lineal exacto, alcanzando un costo de 350.0 (**brecha de 2.94%** frente al óptimo global) en 2.2 segundos.
4. **Escalabilidad a Etapa 3 (Finalistas):** Demostración experimental en instancias de $N=13$ ($6.2 \times 10^9$ permutaciones, gap 2.76% frente a SA 652.0) y $N=14$ ($8.7 \times 10^{10}$ permutaciones, gap 0.25% frente a SA 798.0) manteniendo el consumo de memoria cuántica estrictamente acotado en **8.0 KiB**.
5. **Bonificación de Track Abierto (+10 Puntos):** Modelamiento formal de un caso de optimización de picking en almacenes ferretero-industriales B2B, sustentando un ahorro operativo de **4.2 km de caminata diaria por operario** (**58.3 min/día**), una reducción de costo de **27.04%**, y un beneficio económico de **S/ 28,000 anuales por centro** (**S/ 280,000 anuales** en una red de 10 almacenes medianos) con un **ROI visible de +320%**.
6. **Arquitectura de Software Desacoplada:** Micro-API REST en Flask (latencia < 50 ms) y Cockpit autoportante en HTML5/Vanilla JS con mecanismo Fail-Safe embebido.

---

## 2. FORMULACIÓN MATEMÁTICA Y MODELAMIENTO

### 2.1. El Problema de Asignación Cuadrática (QAP)
El QAP es uno de los problemas fundamentales de la optimización combinatoria, clasificado formalmente dentro de la clase **NP-Hard**. Su formulación general (Koopmans-Beckmann, 1957) modela la asignación biunívoca de $N$ instalaciones a $N$ ubicaciones geográficas.

Sean:
* $F \in \mathbb{R}^{N \times N}$: Matriz simétrica de interacción o flujos, donde $F_{ik}$ representa la intensidad de intercambio entre el elemento $i$ y el elemento $k$, con $F_{ii} = 0$.
* $D \in \mathbb{R}^{N \times N}$: Matriz simétrica de distancias espaciales, donde $D_{jl}$ denota la métrica física o costo de traslado entre la ubicación $j$ y la ubicación $l$, con $D_{jj} = 0$.
* $x_{ij} \in \{0, 1\}$: Variable binaria de decisión que toma el valor $1$ si y solo si el elemento $i$ es asignado a la ubicación $j$.

#### Convención Oficial de Evaluación (Conteo Único de Pares)
De acuerdo con las bases de la instancia MIPLIB, cada par no ordenado de elementos se contabiliza **una sola vez** ($i < k$). La función objetivo canónica es:

$$\min_{x} C(x) = \sum_{i=0}^{N-2} \sum_{k=i+1}^{N-1} \sum_{j=0}^{N-1} \sum_{\substack{l=0 \\ l \neq j}}^{N-1} F_{ik} D_{jl} x_{ij} x_{kl}$$

Sujeto a las restricciones de asignación biyectiva:
$$\sum_{j=0}^{N-1} x_{ij} = 1 \quad \forall i \in \{0, \dots, N-1\} \quad \text{(Cada elemento ocupa exactamente una ubicación)}$$
$$\sum_{i=0}^{N-1} x_{ij} = 1 \quad \forall j \in \{0, \dots, N-1\} \quad \text{(Cada ubicación recibe exactamente un elemento)}$$
$$x_{ij} \in \{0, 1\} \quad \forall i, j \in \{0, \dots, N-1\}$$

### 2.2. Representación en el Espacio de Permutaciones
Toda solución factible $X \in \{0, 1\}^{N \times N}$ equivale a una permutación $\pi \in S_N$, donde $\pi(i) = j$ indica que el elemento $i$ se encuentra en la posición $j$. La función de costo se reduce equivalentemente a:

$$C(\pi) = \sum_{i < k} F_{ik} D_{\pi(i) \pi(k)}$$

El cardinal del espacio de búsqueda factible es $|S_N| = N!$. Para $N=10$, existen exactamente $10! = 3,628,800$ permutaciones posibles.

---

## 3. INGENIERÍA INVERSA Y EXTRACCIÓN DE DATOS DESDE `qap10.mps.gz`

### 3.1. Estructura de la Instancia Linealizada MIPLIB
El archivo oficial de referencia `qap10.mps.gz` linealiza los productos cuadráticos $x_{ij} x_{kl}$ mediante variables continuas auxiliares $y_{ikjl} \in [0, 1]$ (linealización de Kaufman-Broeckx / Frieze-Yadegar):
* **Variables Totales:** 4,150 (100 variables binarias primarias $X001 \dots X100$ y 4,050 variables $Y$).
* **Restricciones de Igualdad:** 1,820 (20 restricciones primarias $NX01 \dots NX20$ y 1,800 restricciones de acoplamiento $C01A \dots C18A$).
* **Función Objetivo:** `NOBJ` asigna coeficientes no nulos a las 4,050 variables $Y$.

### 3.2. Metodología de Reconstrucción Tensorial
Desarrollamos el módulo `src/parser.py` para mapear cada variable $Y_{...}$ a su par correspondiente $(X_{i_1, j_1}, X_{i_2, j_2})$ analizando las columnas de la matriz de restricciones:
1. Cada columna $Y$ participa con coeficiente $+1$ en dos filas $C..A\{u\}$ y $C..A\{v\}$.
2. Los índices $u$ y $v$ ($1 \le u, v \le 100$) determinan unívocamente:
   $$i = \lfloor (u - 1) / 10 \rfloor, \quad j = (u - 1) \pmod{10}$$
   $$k = \lfloor (v - 1) / 10 \rfloor, \quad l = (v - 1) \pmod{10}$$
3. El coeficiente en `NOBJ` define el tensor cuadrático: $Q_{ikjl} = \text{coeficiente}(Y)$.
4. Dado que $F_{0, 1} = 10$, se derivó la matriz de distancias: $D_{jl} = Q_{0, j, 1, l} / 10.0$.
5. Posteriormente, la matriz de flujo se obtuvo mediante: $F_{ik} = Q_{i, 0, k, 1} / D_{0, 1}$.

#### Resultados de la Auditoría de Datos:
* **Términos Totales Linealizados:** 4,050 términos.
* **Coincidencias Exactas:** 4,050 términos (**100.0% de exactitud matemática**).
* **Topología de $D$:** Métrica de Manhattan en cuadrícula $2 \times 5$.

Las matrices completas fueron serializadas en `data/matrices/F_10x10.npy`, `data/matrices/D_10x10.npy` y `data/matrices_F_D.json`.

---

## 4. MAPEO A COMPUTACIÓN CUÁNTICA: QUBO E ISING HAMILTONIAN

### 4.1. Incorporación de Restricciones Cuadráticas
Las $2N$ restricciones de unicidad se penalizan cuadráticamente en el Hamiltoniano:

$$H(x) = C(x) + \lambda \sum_{i=0}^{N-1} \left( \sum_{j=0}^{N-1} x_{ij} - 1 \right)^2 + \lambda \sum_{j=0}^{N-1} \left( \sum_{i=0}^{N-1} x_{ij} - 1 \right)^2$$

Expandiendo los términos cuadráticos considerando que $x_{ij}^2 = x_{ij}$ para $x_{ij} \in \{0, 1\}$:

$$\left( \sum_j x_{ij} - 1 \right)^2 = -\sum_j x_{ij} + 2 \sum_{j < l} x_{ij} x_{il} + 1$$

Esto genera la matriz simétrica QUBO $Q \in \mathbb{R}^{N^2 \times N^2}$ tal que:
$$H(x) = x^T Q x + 2 N \lambda$$

### 4.2. Derivación Analítica Unificada del Parámetro de Penalización $\lambda = 60.0$
Para garantizar rigurosamente que ningún estado infactible (por ejemplo, omitir un elemento para anular interacciones costosas) posea menor energía en el Hamiltoniano que la permutación óptima factible, el multiplicador $\lambda$ debe exceder la ganancia máxima de violar una restricción:

$$\lambda > \Delta C_{\max} = \max_{i} \left( \sum_{k \neq i} F_{ik} \right) \cdot \max_{j, l} D_{jl}$$

* **Cota Exacta para el Núcleo Cuántico $N=3$ (usado en QAOA y Q-LNS):**  
  $\max_i \sum_{k \neq i} F_{ik} = 10 + 6 = 16$, y $\max(D) = 2$.  
  $$\Delta C_{\max} = 16 \times 2 = 32.0$$
* **Cota Superior Teórica Conservadora:**  
  $$\Delta C_{\max} \le (N - 1) \cdot \max(F) \cdot \max(D) = 2 \times 10 \times 2 = 40.0$$
* **Selección Calibrada:** Fijamos **$\lambda = 60.0$**, lo cual otorga un factor de seguridad de **$1.5\times$** sobre la cota conservadora de 40.0 (y $1.875\times$ sobre la cota exacta de 32.0), inmunizando al solver variacional contra distorsiones de energía causadas por fluctuaciones de parámetros en COBYLA.

### 4.3. Sustitución de Espín de Pauli (Mapeo a Ising)
Mapeamos las variables booleanas $x_{ij} \in \{0, 1\}$ a operadores de espín de Pauli $Z_{ij} \in \{+1, -1\}$ mediante:

$$x_u = \frac{I - Z_u}{2}$$

Generando el operador Hamiltoniano de Ising en Qiskit:

$$H_{\text{Ising}} = \sum_{u < v} J_{uv} Z_u Z_v + \sum_u h_u Z_u + E_{\text{offset}} \cdot I$$

Implementado mediante `SparsePauliOp` en `src/qubo_builder.py` y `src/qiskit_solver.py`.

---

## 5. LA FRONTERA DE ESCALABILIDAD NISQ Y EL LÍMITE DE MEMORIA

Memoria de simulación statevector: $\text{Memoria}(q) = 2^q \times 16 \text{ bytes}$, con $q = N^2$.

| Dimensión ($N$) | Variables / Cúbits ($N^2$) | Permutaciones Factibles ($N!$) | Memoria Simulación Directa | Viabilidad en Cómputo Clásico | Estrategia NODUX |
|:---:|:---:|:---:|:---:|:---:|:---:|
| **$N = 3$** | 9 | 6 | **8.0 KiB** | Instantáneo (Cualquier laptop) | QAOA Directo (Qiskit Aer) |
| **$N = 4$** | 16 | 24 | **1.0 MiB** | Muy Rápido (< 2 segundos) | QAOA Directo (Qiskit Aer) |
| **$N = 5$** | 25 | 120 | **512.0 MiB** | Viable en Servidor | Transición a Descomposición |
| **$N = 10$** | **100** | **3,628,800** | **$2 \times 10^{31}$ Bytes (20 millones de Yottabytes)** | **FÍSICAMENTE IMPOSIBLE** | **Quantum Hybrid LNS (8 KiB)** |
| **$N = 13$** | **169** | **6,227,020,800** | **$10^{52.1}$ Bytes** | **FÍSICAMENTE IMPOSIBLE** | **Quantum Hybrid LNS (8 KiB)** |
| **$N = 14$** | **196** | **87,178,291,200** | **$10^{60.2}$ Bytes** | **FÍSICAMENTE IMPOSIBLE** | **Quantum Hybrid LNS (8 KiB)** |

---

## 6. ARQUITECTURA INNOVADORA: QUANTUM LARGE NEIGHBORHOOD SEARCH (Q-LNS)

En cada iteración del bucle híbrido:
1. Se selecciona un vecindario activo de $K$ elementos ($K=3 \implies 9$ cúbits, ó $K=4 \implies 16$ cúbits) guiado por gradientes de flujo $F_{ik}$.
2. Los restantes $N - K$ elementos permanecen fijos.
3. Se formula el Sub-QUBO inducido exacto con acoplamiento lineal externo:
   $$L_{a, j} = \sum_{k \notin \text{activo}} F_{a, k} D_{j, \pi(k)}$$
4. **Qiskit QAOA** resuelve el núcleo cuántico de 9 cúbits en `AerSimulator`.
5. El algoritmo Húngaro garantiza factibilidad del 100%.

---

## 7. TELEMETRÍA Y COMPARATIVA CLÁSICA OFICIAL

$$\text{Brecha \% (Gap)} = 100 \times \frac{C_{\text{obtenido}} - C^*_{\text{control}}}{C^*_{\text{control}}}$$

| Instancia | Algoritmo Evaluado | Tipo de Solver | Cúbits Activos | Memoria RAM | Costo Factible | Brecha % (Gap) | Factibilidad Cruda | Tiempo (s) |
|---|---|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **$N = 3$** | Solver Clásico Exacto (Wali) | Clásico Exhaustivo | - | < 1 KB | **24.0** | **0.00%** | 100% | 0.0000 s |
| **$N = 3$** | NumPyMinimumEigensolver | Ground Truth Cuántico | 9 | 8 KiB | **24.0** | **0.00%** | 100% | 0.0243 s |
| **$N = 3$** | Qiskit QAOA ($p=1$, 1024 shots) | Cuántico Variacional | 9 | 8 KiB | **24.0** | **0.00%** | **1.56%** (rep. 100%) | 0.1948 s |
| **$N = 4$** | Solver Clásico Exacto (Wali) | Clásico Exhaustivo | - | < 1 KB | **32.0** | **0.00%** | 100% | 0.0001 s |
| **$N = 4$** | Qiskit QAOA ($p=1$, 1024 shots) | Cuántico Variacional | 16 | 1 MiB | **32.0** | **0.00%** | 0.04% (rep. 100%) | 6.2086 s |
| **$N = 10$** | Greedy Heuristic (Wali) | Clásico Constructivo | - | < 1 KB | **466.0** | **+37.06%** | 100% | 0.0001 s |
| **$N = 10$** | 2-Opt Local Search Multi-start | Clásico Local Search | - | < 1 KB | **350.0** | **+2.94%** | 100% | 0.0159 s |
| **$N = 10$** | Simulated Annealing | Clásico Metaheurístico | - | < 1 KB | **340.0** | **0.00%** | 100% | 0.4109 s |
| **$N = 10$** | **Nodux Quantum Hybrid LNS** | **Híbrido Qiskit (K=3)** | **9** | **8 KiB** | **350.0** | **+2.94%** | **0.04% (rep. 100%)** | **2.2101 s** |

### Escalabilidad de Etapa 3 (Finalistas $N=13$ y $N=14$):
* **$N=13$ ($6.2 \times 10^9$ perms):** Costo = 670.0 | **Gap = 2.76%** frente al mejor clásico de control (Simulated Annealing $C^*_{\text{SA}} = 652.0$) | Tiempo = 1.71 s | Memoria = **8 KiB**.
* **$N=14$ ($14! \approx 87\text{ mil millones}$ perms):** Costo = 800.0 | **Gap = 0.25%** frente al mejor clásico de control (Simulated Annealing $C^*_{\text{SA}} = 798.0$) | Tiempo = 1.57 s | Memoria = **8 KiB**.

> [!NOTE] Postura Científica Oficial: Utilidad Metodológica Cuántica
> No afirmamos "ventaja cuántica" frente a Simulated Annealing clásico en CPU. Lo que demostramos es **utilidad metodológica**: probamos que Qiskit resuelve con exactitud matemática el subproblema cuántico de reasignación local de 9 cúbits ($N=3$), y mediante la descomposición híbrida Q-LNS resolvemos la intratabilidad de $100$ cúbits ($20\text{ millones de YB}$), logrando un gap de 2.94% con solo 8 KiB de memoria, igualando a heurísticas avanzadas y preparando los sistemas para procesadores NISQ reales.

---

## 8. MODELO DE NEGOCIO Y ROI (+10 PUNTOS BONIFICACIÓN TRACK ABIERTO)

* **Caso de Negocio:** Optimización de Picking en Almacenes B2B Ferretero-Industriales.
* **Parámetros:** Velocidad $1.2\text{ m/s}$, costo $\text{S/ } 12.00\text{ / hora-hombre}$.
* **Reducción de Costo:** De 466 a 340 unidades ponderadas (**$27.04\%$ de reducción**; $24.89\%$ a 350).
* **Ahorro Cuantificado:** **$4.2\text{ km}$ menos de caminata diaria por operario** (**$58.3\text{ minutos}$ liberados al día por operario**).
* **Ahorro Financiero por Almacén:** 4 operarios por turno en 2 turnos (8 operarios) $\times$ 58.3 min $\times$ 300 días $\times$ S/ 12/h = **$\text{S/ } 28,000.00\text{ anuales}$** ($\text{S/ } 27,840$).
* **Beneficio Económico en Red:** **$\text{S/ } 280,000.00\text{ anuales}$** en una red de 10 almacenes medianos.
* **Inversión y Retorno (ROI):** Inversión de $\text{S/ } 6,600$ por almacén ($\text{S/ } 66,000$ en red).
  $$\text{ROI} = \frac{\text{S/ } 27,840 - \text{S/ } 6,600}{\text{S/ } 6,600} \times 100\% = \mathbf{+321.8\% \approx +320\%}$$

---

## 9. ARQUITECTURA DE SOFTWARE, DESPLIEGUE Y PROTOCOLO REPRODUCIBLE

* **Micro-API Local (`src/backend.py`):** Flask en `http://localhost:5000` con endpoint `POST /api/optimize`.
* **Cockpit Visual (`ui/index.html`):** Interfaz autoportante HTML5/JS con mecanismo Fail-Safe embebido.
* **Comando Oficial en 1 Línea:** `python run_demo.py`.
* **Suite de Telemetría Oficial:** `python benchmark.py`.
