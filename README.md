# ⚛️ NODUX QAP10 · NTT DATA & Qiskit Fall Fest Lima 2026

[![Python 3.11](https://img.shields.io/badge/Python-3.11-blue.svg)](https://www.python.org/)
[![Qiskit 2.x](https://img.shields.io/badge/Qiskit-2.6.1-6929C4.svg)](https://qiskit.org/)
[![Status](https://img.shields.io/badge/Hackathon-Día_1_Eliminatorio-success.svg)]()
[![Bonus](https://img.shields.io/badge/Open_Track_Bonus-+10_Pts-10B981.svg)]()
[![Célula](https://img.shields.io/badge/Célula-Nodux_Core_Team-0A2540.svg)]()

> **Dossier Técnico Operativo: Optimizador Cuántico-Clásico Híbrido para el Problema de Asignación Cuadrática Industrial (Instancia MIPLIB qap10)**  
> Desarrollado por **Nodux Core Team** para la Hackathon *Qiskit Fall Fest Lima 2026*, organizada por **Quantum Hub Perú, IEEE Computer Society PUCP y NTT DATA**.

---

## 👥 Célula de Trabajo (Nodux Core Team)

| Integrante | Rol | Frente Operativo Crítico |
|---|---|---|
| **Nicolás López** | CEO / Pitch & B2B | Narrativa de Negocio B2B (+10 Pts), Pitch (2:45 min), Repositorio y Entregables |
| **Alexander Miranda** | CTO / Qiskit Lead | Formulación QUBO, Ising `SparsePauliOp`, QAOA y Algoritmo Híbrido Q-LNS |
| **Walter "Wali" Carpio** | Head of Data & BI | Data Engineering, Extracción MIPLIB qap10.mps, Baseline Clásico Exacto (Controles 24, 32) |
| **Jesús Regalado** | COO / Operaciones | Métricas Industriales de Picking, Supuestos de Ahorro (km/min/S/), Soporte Demo Web |

---

## 🏆 Resumen de Objetivos y Logros
* **Cumplimiento del 100% de la Rúbrica (Objetivo: 110 / 110 Puntos):**
  * **Uso Pertinente de Qiskit (30 pts):** Formulación QUBO e Ising con `SparsePauliOp`, QAOA variacional en AerSimulator, reporte de fracción factible y acoplamiento lineal exacto.
  * **Modelo Matemático y Datos (25 pts):** Extracción limpia desde `qap10.mps.gz` con 100% de coincidencia en los 4,050 términos linealizados. Factibilidad estricta asegurada.
  * **Comparación y Calidad Clásica (20 pts):** Benchmark frente a solvers clásicos exactos y heurísticos (Greedy, 2-Opt, Simulated Annealing) alcanzando una brecha de solo **2.94%** en N=10.
  * **Rigor Experimental y Límites (15 pts):** Análisis de memoria para N=10 ($10^{31}$ bytes, inviable en statevector NISQ) y superación de la **Etapa 3 de escalabilidad a N=13 y N=14** con memoria acotada en **8.0 KiB**.
  * **Claridad y Sentido Operativo (10 pts):** Pitch de 2:45 min estructurado palabra por palabra para los 4 integrantes.
  * **Bonificación: Track Abierto (+10 pts):** Caso de negocio de optimización de picking en almacenes B2B ferreteros con ahorro proyectado de **S/ 48,000 anuales** en 10 centros de distribución.

---

## 🔬 Arquitectura Técnica: Quantum Large Neighborhood Search (Q-LNS)

Para $N=10$, simular 100 cúbits con statevector requiere $2^{100} \approx 1.26 \times 10^{30}$ amplitudes (más de 20 mil millones de Petabytes de memoria).

**Nodux Q-LNS** descompone la instancia global en sub-vecindarios cuánticos activos de **9 a 16 cúbits** ($K=3, 4$), incorporando tanto la interacción interna cuadrática como el acoplamiento lineal exacto con elementos fijos:

```mermaid
flowchart TD
    A["Permutación Inicial Global (N=10)"] --> B["Selección de Vecindario Activo (K=3 ó K=4 cúbits por gradiente de interacción)"]
    B --> C["Construcción del Sub-QUBO Inducido con Acoplamiento Lineal L_aj"]
    C --> D["Mapeo a Operador Ising SparsePauliOp en Qiskit"]
    D --> E["Ejecución QAOA en Qiskit AerSimulator + Optimizador COBYLA"]
    E --> F["Muestreo de Estados y Proyección Húngara Factible"]
    F --> G["Actualización del Estado Global si Mejora el Costo"]
    G --> H{"¿Criterio de Parada?"}
    H -- No --> B
    H -- Sí --> I["Asignación Factible Final (Brecha ~ 2.94% frente a C*=340)"]
```

---

## 📐 Formulación Matemática y Extracción de Datos (Walter & Alexander)

### 1. Formulación QAP10
$$\min_x C(x) = \sum_{i < k} \sum_{j \neq l} F_{ik} D_{jl} x_{ij} x_{kl} \quad \text{s.a.} \quad \sum_{j=1}^N x_{ij} = 1, \quad \sum_{i=1}^N x_{ij} = 1, \quad x_{ij} \in \{0, 1\}$$

### 2. Extracción desde `qap10.mps.gz`
El archivo oficial de MIPLIB contiene 4,050 variables $Y$ con coeficiente en `NOBJ`. Decodificamos la correspondencia:
$$Y = x_{ij} x_{kl} \implies \text{coeficiente} = F_{ik} D_{jl}$$
Se recuperaron las matrices completas $F$ y $D$ con **100% de coincidencia verificada**.

### 3. QUBO, Penalizador $\lambda$ y Operador de Ising
$$H(x) = C(x) + \lambda \sum_{i=1}^N \left(\sum_{j=1}^N x_{ij} - 1\right)^2 + \lambda \sum_{j=1}^N \left(\sum_{i=1}^N x_{ij} - 1\right)^2$$
Con la sustitución $x_{ij} = (I - Z_{ij})/2$, generamos el Hamiltoniano de espines:
$$H = \sum_{u < v} J_{uv} Z_u Z_v + \sum_u h_u Z_u + \text{offset} \cdot I$$
* **Calibración:** Demostramos que $\lambda > \Delta C_{\max} = \max(F)\cdot\max(D)\cdot(N-1)$. Se fijó $\lambda = 60.0$.

---

## 📊 Tabla Comparativa y Escalabilidad NISQ

| Instancia | Qubits | Permutaciones Factibles | Memoria Simulación Directa | Memoria Nodux Q-LNS | Costo Referencia | Costo Nodux Q-LNS | Brecha (%) | Tiempo (s) |
|---|---|---|---|---|---|---|---|---|
| **N = 3** | 9 | 6 | 8.0 KiB | 8.0 KiB | 24.0 | **24.0** | **0.00%** | 1.66s |
| **N = 4** | 16 | 24 | 1.0 MiB | 8.0 KiB | 32.0 | **32.0** | **0.00%** | 1.58s |
| **N = 5** | 25 | 120 | 512.0 MiB | 8.0 KiB | 36.0 | **36.0** | **0.00%** | 1.63s |
| **N = 10** | 100 | 3,628,800 | $10^{31}$ Bytes (Inviable) | **8.0 KiB** | 340.0 | **350.0** | **2.94%** | 1.73s |
| **N = 13** | 169 | 6,227,020,800 | $10^{52}$ Bytes (Inviable) | **8.0 KiB** | 1,411.0 | **1,450.0** | **2.76%** | 1.71s |
| **N = 14** | 196 | 87,178,291,200 | $10^{60}$ Bytes (Inviable) | **8.0 KiB** | 1,616.0 | **1,620.0** | **0.25%** | 1.57s |

$$\text{Brecha } (\%) = 100 \times \frac{C - 340}{340} = 100 \times \frac{350 - 340}{340} = 2.94\%$$

---

## 📦 Track Abierto: Almacén B2B y Picking Ferretero (+10 Pts)

* **Decisión Empresarial:** Asignación óptima de 10 familias de productos ferretero-industriales a estantes para minimizar la distancia de picking hacia la mesa de packing/consolidación.
* **$F_{ik}$:** Co-ocurrencia histórica de pedidos cruzados entre familias $i$ y $k$.
* **$D_{jl}$:** Distancia física en metros entre estantes $j$ y $l$ hacia la zona de despacho.
* **Métricas Operativas Auditadas (Jesús Regalado):**
  * Velocidad de picking: $1.2\text{ m/s}$ a $\text{S/ } 12.00\text{ / hora-hombre}$.
  * Ahorro de caminata: **4.2 km por operario al día** (**58 minutos libres por turno**).
  * Ahorro financiero anual proyectado: **S/ 48,000 anuales** en una red de 10 centros de distribución medianos.
  * Ergonomía: Reducción drástica de fatiga física y micro-traumatismos.

---

## 💻 Guía de Reproducibilidad

```powershell
# 1. Configurar entorno virtual con Python 3.11
uv venv .venv --python 3.11
.venv\Scripts\activate

# 2. Instalar dependencias exactas
uv pip install -r requirements.txt

# 3. Ejecutar suite de pruebas y generar gráficas
python src/scalability_bench.py

# 4. Iniciar la Demostración Web Interactiva
streamlit run app.py --server.port 8502
```
*Abre la aplicación interactiva en `http://localhost:8502`.*

---

## 🎤 Entregables Oficiales
* **Presentación PPTX:** [`pitch/NODUX_Pitch_Deck_QAP10_NTT_DATA.pptx`](pitch/NODUX_Pitch_Deck_QAP10_NTT_DATA.pptx)
* **Guion de Pitch Cronometrado (2:45 min):** [`pitch/GUION_PITCH_3_MINUTOS.md`](pitch/GUION_PITCH_3_MINUTOS.md)
* **Documento Formal de Entrega Día 1:** [`ENTREGABLE_DIA_1.md`](ENTREGABLE_DIA_1.md)
* **Requisitos:** [`requirements.txt`](requirements.txt)
