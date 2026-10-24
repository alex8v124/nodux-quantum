/**
 * NODUX Enterprise Application Controller
 * Inicialización, suscripciones de estado, controladores de eventos y renderizado de vistas.
 */

document.addEventListener("DOMContentLoaded", async () => {
  const store = window.appStore;
  const api = window.ApiClient;

  // DOM Elements
  const elStatusDot = document.getElementById("statusDot");
  const elStatusText = document.getElementById("statusText");
  const elBackendLatency = document.getElementById("backendLatency");
  const elBackendHost = document.getElementById("backendHost");
  if (elBackendHost) {
    elBackendHost.innerText = window.location.host;
  }
  const elBtnOptimize = document.getElementById("btnOptimize");
  const elSliderLambda = document.getElementById("sliderLambda");
  const elValLambda = document.getElementById("valLambda");
  const elLambdaAlert = document.getElementById("lambdaAlert");
  const elSelectShots = document.getElementById("selectShots");

  // KPI Elements
  const elKpiCost = document.getElementById("kpiCost");
  const elKpiTarget = document.getElementById("kpiTarget");
  const elKpiGap = document.getElementById("kpiGap");
  const elKpiFeas = document.getElementById("kpiFeas");
  const elKpiTime = document.getElementById("kpiTime");
  const elKpiEngine = document.getElementById("kpiEngine");

  const elWorkspaceContent = document.getElementById("workspaceContent");
  const elNavTabs = document.querySelectorAll(".nav-tab");
  const elScaleButtons = document.querySelectorAll(".btn-scale");
  const elEngineButtons = document.querySelectorAll(".btn-engine");

  // 1. Health check & Initial metadata loading
  async function checkBackend() {
    try {
      const startTime = performance.now();
      const health = await api.getHealth();
      const latency = Math.round(performance.now() - startTime);

      store.setState({
        backendStatus: "online",
        lastLatencyMs: latency
      });

      elStatusDot.className = "status-dot";
      elStatusText.innerText = `Online (${health.quantum_backend})`;
      elBackendLatency.innerText = `${latency} ms`;

      // Load instance metadata
      const instances = await api.getInstances();
      store.setState({ instancesMeta: instances });
    } catch (err) {
      console.warn("Backend local no disponible o en inicio diferido:", err);
      store.setState({ backendStatus: "offline" });
      elStatusDot.className = "status-dot error";
      elStatusText.innerText = "Offline (Reintentando conexión...)";
      elBackendLatency.innerText = "-- ms";
    }
  }

  // 2. State Subscriber: Update KPIs & Render Active View
  store.subscribe((state) => {
    // Update KPI Bar
    if (state.results) {
      const r = state.results;
      elKpiCost.innerText = r.optimal_cost.toFixed(1);
      elKpiTarget.innerText = `Control: ${r.control_target.toFixed(1)}`;

      const gapVal = r.gap_percentage;
      const isOptimal = Math.abs(gapVal) < 0.05;
      elKpiGap.innerText = `${gapVal >= 0 ? "+" : ""}${gapVal.toFixed(2)}%`;
      elKpiGap.className = `kpi-badge ${isOptimal || gapVal <= 3.0 ? "badge-success" : "badge-warning"}`;

      elKpiFeas.innerText = `${(r.feasibility_rate * 100).toFixed(0)}%`;
      elKpiTime.innerText = `${r.execution_time_ms.toFixed(0)} ms`;
      elKpiEngine.innerText = r.method_name || (state.algorithm === "qaoa" ? "Qiskit Aer" : "Clásico");
    }

    // Render current active tab
    renderActiveTab(state);
  });

  function renderActiveTab(state) {
    if (!elWorkspaceContent) return;
    switch (state.activeTab) {
      case "dashboard":
        window.ManagerDashboard.render(elWorkspaceContent, state);
        break;
      case "warehouse":
        window.WarehouseView.render(elWorkspaceContent, state);
        break;
      case "telemetry":
        window.TelemetryView.render(elWorkspaceContent, state);
        break;
      case "roi":
        window.RoiView.render(elWorkspaceContent, state);
        break;
      case "circuit":
        window.CircuitView.render(elWorkspaceContent, state);
        break;
      case "ibm":
        window.IbmView.render(elWorkspaceContent, state);
        break;
    }
  }

  // 3. Tab Switching
  elNavTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      elNavTabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      const tabKey = tab.dataset.tab;
      store.setState({ activeTab: tabKey });
    });
  });

  // 4. Scale Selector
  elScaleButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      elScaleButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const scale = parseInt(btn.dataset.scale);
      store.setState({ scaleN: scale });
      executeOptimization();
    });
  });

  // 5. Engine Selector
  elEngineButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      elEngineButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const algo = btn.dataset.engine;
      store.setState({ algorithm: algo });
      executeOptimization();
    });
  });

  // 6. Lambda Parameter Slider & Theoretical Validation
  if (elSliderLambda) {
    elSliderLambda.addEventListener("input", (e) => {
      const val = parseFloat(e.target.value);
      elValLambda.innerText = val.toFixed(0);
      store.setState({ lambdaPenalty: val });

      if (val < 30.0) {
        elLambdaAlert.style.display = "flex";
        elLambdaAlert.className = "alert-box alert-danger";
        elLambdaAlert.innerHTML = `
          <div>
            <b>Colapso de Factibilidad (λ = ${val.toFixed(0)} < 30):</b><br/>
            El multiplicador de penalización es inferior al costo cuadrático marginal. Las restricciones biunívocas
            pueden ser violadas por estados espurios con menor energía.
          </div>
        `;
      } else if (val < 45.0) {
        elLambdaAlert.style.display = "flex";
        elLambdaAlert.className = "alert-box alert-warning";
        elLambdaAlert.innerHTML = `
          <div>
            <b>Zona Límite (λ = ${val.toFixed(0)}):</b><br/>
            Riesgo de convergencia subóptima por paisaje de energía rugoso.
          </div>
        `;
      } else {
        elLambdaAlert.style.display = "none";
      }
    });
  }

  // 7. Shots Selector
  if (elSelectShots) {
    elSelectShots.addEventListener("change", (e) => {
      store.setState({ shots: parseInt(e.target.value) });
    });
  }

  // 8. Optimization Execution Controller
  async function executeOptimization() {
    const state = store.getState();
    elBtnOptimize.disabled = true;
    elBtnOptimize.innerText = "Ejecutando Simulación...";
    elStatusDot.className = "status-dot loading";
    elStatusText.innerText = "Cómputo en curso (Qiskit Aer)...";

    try {
      const res = await api.optimize({
        scale_n: state.scaleN,
        lambda_penalty: state.lambdaPenalty,
        shots: state.shots,
        algorithm: state.algorithm
      });

      store.setState({
        results: res,
        isLoading: false,
        backendStatus: "online"
      });

      elStatusDot.className = "status-dot";
      elStatusText.innerText = `Completado (${res.execution_time_ms.toFixed(0)} ms)`;
    } catch (err) {
      console.error("Fallo en optimización:", err);
      elStatusDot.className = "status-dot error";
      elStatusText.innerText = "Error en cómputo";

      // Show error in canvas
      elWorkspaceContent.innerHTML = `
        <div class="panel">
          <div class="panel-header">
            <div class="panel-title" style="color: var(--color-danger);">
              <span>Error en la Ejecución del Motor de Optimización</span>
            </div>
          </div>
          <div class="panel-body">
            <div class="alert-box alert-danger">
              <div>
                <b>Detalle Técnico:</b> ${err.message}<br/>
                Asegúrese de que el backend Flask esté en ejecución en <code>http://localhost:5000</code>.
              </div>
            </div>
            <button class="btn btn-secondary" onclick="location.reload()">Reintentar Conexión</button>
          </div>
        </div>
      `;
    } finally {
      elBtnOptimize.disabled = false;
      elBtnOptimize.innerText = "Ejecutar Optimización";
    }
  }

  elBtnOptimize.addEventListener("click", executeOptimization);

  // Initialize
  await checkBackend();
  // Auto-run initial N=10 computation
  executeOptimization();
});
