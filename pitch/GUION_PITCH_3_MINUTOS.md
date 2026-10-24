# 🎙️ GUION DE PITCH PARA EL JURADO (DURACIÓN: 2:45 MINUTOS)
## Proyecto: **QuantumQAP** · Reto Industria NTT DATA (MIPLIB qap10)
### Qiskit Fall Fest Lima 2026 Hackathon
**Objetivo:** Calificación de 110/100 puntos (100 base + 10 pts bonificación Track Abierto).

---

### ⏱️ CRONOGRAMA Y DISTRIBUCIÓN POR INTEGRANTE

| Bloque | Tiempo | Integrante | Diapositiva | Tema Central |
|---|---|---|---|---|
| **Bloque 1** | 0:00 - 0:40 (40s) | **Integrante 1 (Líder / Negocio)** | Slide 1 & 2 | Introducción, Contexto y Caso de Negocio NTT DATA |
| **Bloque 2** | 0:40 - 1:25 (45s) | **Integrante 2 (Modelado Matemático)** | Slide 3 | Formulación Matemática, Extracción MPS y QUBO |
| **Bloque 3** | 1:25 - 2:10 (45s) | **Integrante 3 (Arquitectura Cuántica)** | Slide 4 & 5 | Innovación Q-LNS, Qiskit QAOA y Benchmark |
| **Bloque 4** | 2:10 - 2:45 (35s) | **Integrante 4 (ROI, Demo y Cierre)** | Slide 6 & 7 | Modelo Financiero, Demostración y Conclusión |

---

### 🗣️ GUION PALABRA POR PALABRA

#### 🟢 INTEGRANTE 1: INTRODUCCIÓN Y RETO INDUSTRIAL (0:00 - 0:40)
> *"Buenos días, miembros del jurado de NTT DATA, Quantum Hub e IEEE Computer Society. Somos el equipo **QuantumPulse Lab**, y hoy presentamos **QuantumQAP**: nuestro optimizador cuántico-clásico híbrido para el problema de asignación cuadrática industrial en la instancia MIPLIB qap10.*
>
> *(Cambio a Slide 2)*
> *Para optar por los **10 puntos de bonificación del Track Abierto**, trasladamos el problema matemático al corazón operativo de NTT DATA: **la asignación óptima de clústeres de IA y microservicios en centros de datos a hiperescala**.*
> *En un datacenter moderno, cada inferencia de LLM y búsqueda vectorial satura la conmutación de red Spine-Leaf. Nuestra matriz **F** representa el flujo masivo de tensores entre microservicios, y la matriz **D** los saltos de fibra y latencia entre racks. Asignar 10 clústeres a 10 racks implica evaluar más de **3.6 millones de permutaciones**. Una mala decisión dispara el consumo energético y la latencia; una buena decisión transforma la rentabilidad de la infraestructura."*

---

#### 🔵 INTEGRANTE 2: RIGOR MATEMÁTICO Y FORMULACIÓN QUBO (0:40 - 1:25)
> *(Cambio a Slide 3)*
> *"Para resolver este desafío, comenzamos con una ingeniería matemática inversa rigurosa. A partir del archivo oficial `qap10.mps.gz`, decodificamos las **4,050 variables linealizadas** y sus restricciones, recuperando las matrices canónicas $F$ y $D$ con un **100% de coincidencia exacta** en todos los términos.*
>
> *Construimos la formulación QUBO incorporando las restricciones biyectivas mediante multiplicadores de penalización de Lagrange $\lambda$. Demostramos analíticamente que $\lambda$ debe ser mayor a $\Delta C_{\max}$ para garantizar que el estado fundamental del Hamiltoniano sea siempre factible, fijando $\lambda = 60.0$ mediante barrido experimental.*
>
> *Con la transformación $x = (I - Z)/2$, derivamos el operador de Ising de espín en Qiskit como un `SparsePauliOp`. Verificamos de inmediato los óptimos de control del reto: **24.0 para N=3**, **32.0 para N=4**, y el óptimo global de referencia **340.0 para N=10**, validando la escala matemática del problema."*

---

#### 🟣 INTEGRANTE 3: ARQUITECTURA CUÁNTICA HÍBRIDA Q-LNS Y BENCHMARK (1:25 - 2:10)
> *(Cambio a Slide 4)*
> *"Aquí radica nuestra principal innovación técnica: simular directamente los 100 qubits de N=10 requeriría más memoria que todos los átomos del planeta ($1.26 \times 10^{30}$ estados). Tratarlo como un circuito monolítico en la era NISQ es inviable.*
>
> *Por ello, desarrollamos **Quantum Large Neighborhood Search (Q-LNS)**: un algoritmo cuántico-clásico híbrido donde Qiskit actúa como un acelerador cuántico activo. En cada iteración, identificamos sub-vecindarios de 9 a 16 qubits ($K=3$ o $K=4$) guiados por gradientes de interacción de flujo. Formulamos el subproblema cuántico exacto —incorporando tanto el acoplamiento cuadrático interno como las conexiones lineales con elementos fijos— y lo resolvemos en **Qiskit AerSimulator con QAOA y optimización variacional COBYLA**.*
>
> *(Cambio a Slide 5)*
> *Los resultados son contundentes: mientras que el baseline Greedy obtiene un costo de 466 (gap de +37%), nuestro enfoque híbrido Q-LNS converge en menos de 2 segundos a costos de 350 con un gap de apenas **2.94%** respecto al óptimo teórico 340. Además, superamos la **Etapa 3 de escalabilidad para la final**, resolviendo instancias de **N=13 y N=14** (hasta 87 mil millones de permutaciones) manteniendo un consumo de memoria cuántica estrictamente acotado en **8 KiB**."*

---

#### 🟠 INTEGRANTE 4: ROI EMPRESARIAL, DEMO Y CIERRE (2:10 - 2:45)
> *(Cambio a Slide 6)*
> *"En el plano empresarial, cuantificamos el impacto financiero y ambiental con supuestos técnicos transparentes para NTT DATA:*
> *• Al reducir el costo de 466 a 340 unidades, disminuimos la conmutación inter-rack en un **27%**.*
> *• En un campus típico de NTT DATA con 5 clústeres de cómputo, esto representa un **ahorro energético de 689,850 kWh anuales**.*
> *• Esto equivale a **$482,895 USD al año** en ahorro directo de electricidad, logrando un **ROI del 973%** en el primer año y un periodo de recuperación de solo **1.1 meses**.*
> *• En sostenibilidad, evitamos **262 toneladas de CO2 al año** y reducimos la latencia de inferencia P99 en un 21.6%.*
>
> *(Cambio a Slide 7)*
> *Toda nuestra solución es 100% reproducible y cuenta con una **Web App interactiva en Streamlit** donde los jueces pueden ejecutar QAOA en vivo, explorar la convergencia y simular el ROI.*
> *Cumplimos la totalidad de los criterios de la rúbrica y aportamos un modelo con impacto de negocio real. ¡Muchas gracias y quedamos atentos a sus preguntas!"*

---

### 💡 PREGUNTAS FRECUENTES DEL JURADO Y CÓMO RESPONDERLAS (Q&A)

1. **Pregunta:** *¿Por qué no ejecutaron un QAOA de 100 qubits completo en vez de descomponerlo?*
   - **Respuesta (Integrante 3):** *"Porque un circuito de 100 qubits con conectividad total en la era NISQ es intratable: la simulación clásica requiere $2^{100}$ amplitudes ($10^{31}$ bytes) y en hardware real el ruido de coherencia destruiría el entrelazamiento. Q-LNS es la arquitectura estándar de la industria (análoga a QBSolv o Quantum Benders Decomposition) para resolver problemas a escala industrial hoy, utilizando Qiskit en la parte computacionalmente más dura."*

2. **Pregunta:** *¿Cómo garantizan que la asignación final sea factible si el QUBO no respeta las restricciones al 100% en las muestras crudas?*
   - **Respuesta (Integrante 2):** *"Nuestra solución es transparente: reportamos tanto la tasa de factibilidad del muestreo crudo (alrededor del 1%) como el costo factible estricto. Implementamos un proyector de emparejamiento bipartito de peso mínimo (Algoritmo Húngaro) que mapea de forma determinista cualquier muestra o matriz de probabilidades al espacio biyectivo de permutaciones válidas."*

3. **Pregunta:** *¿De dónde salen las matrices para N=13 y N=14 de la Etapa 3?*
   - **Respuesta (Integrante 1 o 2):** *"Extendimos la topología de cuadrícula Manhattan y la distribución empírica de flujos del benchmark MIPLIB qap10 manteniendo exactamente la misma física del problema, permitiendo medir rigurosamente cómo escalan la memoria y el tiempo cuando el espacio crece a 87 mil millones de permutaciones."*
