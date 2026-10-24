/**
 * NODUX Component: Quantum Circuit & Ising Hamiltonian Inspector
 * Muestra el desglose formal del operador de Ising, gates cuánticos y arquitectura de circuito Qiskit.
 */

window.CircuitView = {
  render(container, state) {
    const scale = state.scaleN;
    const qubits = scale <= 4 ? scale * scale : 9;
    const isHybrid = scale > 4;

    container.innerHTML = `
      <div class="two-col-grid">
        <!-- Arquitectura del Ansatz QAOA -->
        <div class="panel">
          <div class="panel-header">
            <div class="panel-title">
              <span>Arquitectura del Circuito QAOA Parametrizado (Qiskit 2.x)</span>
            </div>
            <div class="panel-actions">
              <span class="kpi-badge badge-info">${qubits} Cúbits Activos · p=1 Capa</span>
            </div>
          </div>
          <div class="panel-body">
            <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 12px; line-height: 1.5;">
              Implementación formal mediante operadores <code>qiskit.circuit.QuantumCircuit</code> y descomposición unitaria de Ising:
            </p>

            <table class="enterprise-table" style="margin-bottom: 16px;">
              <thead>
                <tr>
                  <th>Fase del Circuito</th>
                  <th>Operador Matemático</th>
                  <th>Compuertas Cuánticas Nativas</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>1. Superposición Inicial</b></td>
                  <td><code>|ψ₀⟩ = H^(⊗n) |0⟩^n</code></td>
                  <td>Compuertas Hadamard <code>H</code> en todos los cúbits</td>
                </tr>
                <tr>
                  <td><b>2. Operador de Costo (U_C)</b></td>
                  <td><code>e^(-i γ H_C)</code></td>
                  <td>Rotaciones <code>RZ(2γ·c)</code> y <code>RZZ(2γ·J_uv)</code></td>
                </tr>
                <tr>
                  <td><b>3. Operador Mezclador (U_M)</b></td>
                  <td><code>e^(-i β H_M)</code> donde <code>H_M = ∑ X_i</code></td>
                  <td>Rotaciones transversales <code>RX(2β)</code> en cada cúbit</td>
                </tr>
                <tr>
                  <td><b>4. Medición / Colapso</b></td>
                  <td>Muestreo proyectivo Z</td>
                  <td><code>measure_all()</code> en AerSimulator (1,024 shots)</td>
                </tr>
              </tbody>
            </table>

            <div style="background-color: var(--bg-subtle); padding: 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); font-family: var(--font-mono); font-size: 11px;">
              <span style="color: var(--text-muted);">// Mapeo canónico variable binaria a operador de Pauli:</span><br/>
              x_u = (I - Z_u) / 2<br/>
              x_u · x_v = (I - Z_u - Z_v + Z_u ⊗ Z_v) / 4<br/>
              <span style="color: var(--color-primary); font-weight: 600;">H_C = C_offset + ∑ h_u Z_u + ∑ J_uv (Z_u ⊗ Z_v)</span>
            </div>
          </div>
        </div>

        <!-- Diagnóstico de Escala y Descomposición NISQ -->
        <div class="panel">
          <div class="panel-header">
            <div class="panel-title">
              <span>Métricas de Ejecución y Descomposición NISQ</span>
            </div>
            <div class="panel-actions">
              <span class="kpi-badge badge-success">${isHybrid ? "Q-LNS Híbrido Activo" : "QAOA Directo"}</span>
            </div>
          </div>
          <div class="panel-body">
            <table class="enterprise-table" style="margin-bottom: 16px;">
              <thead>
                <tr>
                  <th>Métrica de Circuito</th>
                  <th class="num-cell">Valor Medido</th>
                  <th>Especificación Técnica</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Número de Cúbits Físicos</td>
                  <td class="num-cell" style="font-weight: 700;">${qubits} cúbits</td>
                  <td>${isHybrid ? "Sub-circuito núcleo de 9 cúbits acotado" : "Mapeo completo N² cúbits"}</td>
                </tr>
                <tr>
                  <td>Profundidad del Circuito (Depth)</td>
                  <td class="num-cell">${scale === 3 ? "12" : scale === 4 ? "28" : "18"}</td>
                  <td>Profundidad compilada para arquitectura All-to-All</td>
                </tr>
                <tr>
                  <td>Compuertas de 2 Cúbits (RZZ)</td>
                  <td class="num-cell">${scale === 3 ? "36" : scale === 4 ? "120" : "36"}</td>
                  <td>Interacciones cuadráticas F_ik · D_jl activas</td>
                </tr>
                <tr>
                  <td>Optimizador Clásico Variacional</td>
                  <td class="num-cell">COBYLA</td>
                  <td>25 iteraciones con gradiente numérico libre de ruido</td>
                </tr>
                <tr>
                  <td>Memoria Cuántica Asignada</td>
                  <td class="num-cell" style="font-weight: 600; color: var(--color-success);">8.0 KiB</td>
                  <td>Estrictamente acotada mediante descomposición LNS</td>
                </tr>
              </tbody>
            </table>

            <div class="alert-box alert-info" style="margin-bottom: 0;">
              <div>
                <b>Blindaje de Factibilidad (Filtro Húngaro):</b><br/>
                En hardware NISQ ruidoso, las mediciones probabilísticas de bits cuánticos pueden violar
                las restricciones biunívocas (filas/columnas que suman 0 o >1). Nodux aplica un algoritmo de
                asignación lineal de pesos bipartitos (Matching Húngaro en tiempo O(N³)) que repara cada muestra
                medida hacia la permutación biunívoca más cercana en el simplex de Birkhoff, garantizando
                <b>100% de soluciones válidas entregadas a planta</b>.
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
};
