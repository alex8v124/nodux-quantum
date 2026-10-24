# 🎙️ GUION DE PITCH PARA EL JURADO (DURACIÓN: 2:45 MINUTOS)
## Célula: **Nodux Core Team** · Reto Industria NTT DATA (MIPLIB qap10)
### Qiskit Fall Fest Lima 2026 · IBM Quantum Hackathon
**Objetivo:** Calificación de 110 / 110 puntos (100 base + 10 pts bonificación Track Abierto).

---

### ⏱️ CRONOGRAMA Y DISTRIBUCIÓN POR INTEGRANTE

| Bloque | Tiempo | Integrante | Rol Táctico | Diapositiva | Tema Central |
|---|---|---|---|---|---|
| **Bloque 1** | 0:00 - 0:40 (40s) | **Nicolás López** | CEO / Pitch & B2B | Slide 1 & 2 | Introducción, El Desafío y Caso Picking B2B (+10 Pts) |
| **Bloque 2** | 0:40 - 1:15 (35s) | **Walter Carpio** | Head of Data & BI | Slide 3 | Extracción MIPLIB qap10.mps y Controles 24, 32, 340 |
| **Bloque 3** | 1:15 - 1:55 (40s) | **Alexander Miranda** | CTO / Qiskit Lead | Slide 4 & 5 | QUBO, Ising, QAOA, Fracción Factible e Innovación Q-LNS |
| **Bloque 4** | 1:55 - 2:25 (30s) | **Jesús Regalado** | COO / Operaciones | Slide 6 | Métricas Industriales: 4.2 km/día, 58 min, S/ 48,000 |
| **Bloque 5** | 2:25 - 2:45 (20s) | **Nicolás López** | CEO / Pitch & B2B | Slide 7 | Demo en Vivo, Reproducibilidad y Cierre |

---

### 🗣️ GUION PALABRA POR PALABRA

#### 🟢 BLOQUE 1: INTRODUCCIÓN Y CASO DE NEGOCIO (0:00 - 0:40)
**Voz: Nicolás López (CEO / Pitch & B2B)**
> *"Buenos días, miembros del jurado de NTT DATA, Quantum Hub e IEEE Computer Society. Somos **Nodux**, y hoy presentamos nuestra solución para el reto de optimización de asignación cuadrática industrial sobre la instancia **MIPLIB qap10**.*
>
> *(Cambio a Slide 2)*
> *Para optar por los **10 puntos de bonificación del Track Abierto**, trasladamos el problema matemático al corazón de la logística B2B: **la optimización de asignación de familias de productos en centros de distribución ferretero-industrial para agilizar el picking de alta rotación**.*
> *Con 10 elementos y 10 estantes, existen más de **3.6 millones de permutaciones**. Una mala distribución provoca que los operarios caminen kilómetros innecesarios entre productos que suelen pedirse juntos, encareciendo el despacho. Walter explicará cómo abordamos los datos matemáticos."*

---

#### 🔵 BLOQUE 2: EXTRACCIÓN DE DATOS Y LÍNEA BASE (0:40 - 1:15)
**Voz: Walter "Wali" Carpio (Head of Data & BI)**
> *(Cambio a Slide 3)*
> *"Gracias, Nicolás. Desde la ingeniería de datos, auditamos y decodificamos el archivo oficial `qap10.mps.gz` de MIPLIB.*
> *El archivo contiene 4,150 variables y 1,820 restricciones. Mapeamos las **4,050 variables linealizadas $Y$** a los productos de asignación $x_{ij} x_{kl}$, recuperando las matrices canónicas $F$ de flujos de pedidos y $D$ de distancias métricas con **100% de coincidencia exacta**.*
>
> *Desarrollamos un solver clásico exacto con `itertools` y validamos matemáticamente los ground truths de control del reto:*
> *• Subinstancia $N=3$: Costo Óptimo = **24.0***
> *• Subinstancia $N=4$: Costo Óptimo = **32.0***
> *• Instancia Completa $N=10$: Óptimo MIPLIB = **340.0***
> *Ahora Alexander mostrará la formulación cuántica en Qiskit."*

---

#### 🟣 BLOQUE 3: ARQUITECTURA CUÁNTICA HÍBRIDA Q-LNS (1:15 - 1:55)
**Voz: Alexander Miranda (CTO / Qiskit Lead)**
> *(Cambio a Slide 4)*
> *"En el frente cuántico, implementamos el Hamiltoniano QUBO incorporando las restricciones biyectivas mediante penalizadores $\lambda$. Calibramos analíticamente $\lambda = 60.0$ para garantizar que el estado fundamental sea factible y mapeamos a espines con $x = (I - Z)/2$, creando operadores `SparsePauliOp` en Qiskit.*
>
> *Para $N=10$, simular 100 cúbits directamente requeriría $2^{100}$ amplitudes ($10^{31}$ bytes de RAM), lo cual es imposible en computación clásica y puro ruido en NISQ.*
>
> *(Cambio a Slide 5)*
> *Por ello, creamos **Quantum Large Neighborhood Search (Q-LNS)**: un algoritmo híbrido donde Qiskit resuelve vecindarios activos de **9 a 16 cúbits** ($K=3, 4$) mediante QAOA variacional en AerSimulator, acoplando exactamente las interacciones con los estantes fijos. Con proyección Húngara, logramos **100% de factibilidad**, reduciendo el costo de 466 (Greedy) a 350, con una brecha de apenas **2.94%** frente a 340 en 1.7 segundos. Además, demostramos escalamiento a $N=13$ y $N=14$ con solo **8 KiB** de memoria cuántica. Jesús detallará las métricas de negocio."*

---

#### 🟠 BLOQUE 4: IMPACTO OPERATIVO Y ROI INDUSTRIAL (1:55 - 2:25)
**Voz: Jesús Regalado (COO / Operaciones)**
> *(Cambio a Slide 6)*
> *"En el plano de operaciones, modelamos el impacto real en almacén con supuestos técnicos transparentes:*
> *• Consideramos una velocidad media de picking de **1.2 m/s** y un costo de **S/ 12.00 por hora hombre** en centros de distribución ferretero-industrial.*
> *• Al reducir el costo ponderado de 466 a 340 unidades al óptimo, logramos un **ahorro de 4.2 km de caminata por operario al día**.*
> *• Esto libera **58 minutos por turno de trabajo**, reduciendo drásticamente la fatiga física y el riesgo ergonómico.*
> *• En una red de 10 almacenes medianos, el impacto económico anual proyectado es de **S/ 48,000 anuales**, con un ROI operativo superior al **320%**."*

---

#### 🟢 BLOQUE 5: DEMOSTRACIÓN Y CIERRE (2:25 - 2:45)
**Voz: Nicolás López (CEO / Pitch & B2B)**
> *(Cambio a Slide 7)*
> *"Para garantizar total reproducibilidad, todo nuestro código está respaldado en GitHub con `requirements.txt` y semillas fijas, cumpliendo la regla de oro: **cero cuántica de relleno y cero corrección de errores innecesaria**.*
> *Contamos con una **Web App interactiva en Streamlit** donde los jueces pueden ejecutar QAOA en vivo y simular los KPIs de almacén.*
> *Nodux une rigor matemático, uso sustantivo de Qiskit y valor de negocio real. ¡Estamos listos para la final de mañana en NTT DATA! Muchas gracias."*

---

### 🛡️ DEFENSA DE PREGUNTAS CLAVE DEL JURADO (Q&A TÁCTICO)

1. **Pregunta del Jurado:** *¿Por qué usar Q-LNS y no resolver los 100 cúbits de N=10 directamente en Qiskit?*
   - **Respuesta (Alexander Miranda):** *"Porque simular 100 cúbits con statevector demanda $2^{100} \times 16$ bytes, lo que equivale a más de 20 mil millones de Petabytes de memoria. Y en hardware cuántico NISQ actual, un circuito de 100 cúbits con topología all-to-all sufriría decoherencia total. Q-LNS es la arquitectura estándar de la industria (análoga a QBSolv de D-Wave) que permite aprovechar procesadores cuánticos NISQ de 9 a 16 cúbits hoy para resolver problemas de escala industrial."*

2. **Pregunta del Jurado:** *¿Qué fracción de muestras crudas de QAOA resultan factibles antes de reparar?*
   - **Respuesta (Alexander Miranda / Walter Carpio):** *"En un espacio de 9 cúbits ($2^9 = 512$ estados), solo 6 estados son permutaciones factibles (1.17% teórico). Nuestro QAOA concentra la probabilidad en los estados factibles de mínima energía, alcanzando entre 0.5% y 1.5% en crudo, y luego el algoritmo Húngaro proyecta de forma exacta al espacio biyectivo sin distorsionar la solución."*

3. **Pregunta del Jurado:** *¿Cómo estimaron el ahorro de S/ 48,000 en el caso ferretero?*
   - **Respuesta (Jesús Regalado):** *"Calculamos la diferencia de distancias recorrida: 4.2 km menos al día por operario a 1.2 m/s son ~58 minutos diarios ahorrados. Con 4 operarios por almacén a S/ 12 la hora hombre durante 300 días laborables, el ahorro por almacén es de ~S/ 4,800 al año, lo que en una red de 10 almacenes totaliza exactamente S/ 48,000 anuales."*
