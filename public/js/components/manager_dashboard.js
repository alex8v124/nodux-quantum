/**
 * NODUX Enterprise Component: Executive Managerial Dashboard (Dashboard Gerencial)
 * Diseñado bajo estándares enterprise UX/UI (IBM Carbon / Blueprint.js).
 * Centraliza KPIs de negocio, evolución temporal, comparativa por sedes,
 * descomposición del ciclo de picking, beneficios auditables y alertas de decisión.
 */

window.ManagerDashboard = {
  // Store local view state
  state: {
    selectedPeriod: "month",    // 'today' | 'week' | 'month' | 'quarter' | 'year'
    selectedBranch: "all",      // 'all' | 'lima' | 'callao' | 'huachipa' | 'arequipa' | 'trujillo'
    selectedCategory: "all"     // 'all' | 'fasteners' | 'tools' | 'piping' | 'abrasives'
  },

  // Master Branch Dataset
  branchData: {
    all: {
      name: "Red Nacional Completa (10 Centros de Distribución)",
      region: "Nacional (Perú)",
      warehousesCount: 10,
      activeOperators: 80,
      dailyOrders: 1420,
      otifRate: 98.4,
      otifDelta: "+4.2%",
      costIndex: 350.0,
      costIndexDelta: "-24.9%",
      costBase: 466.0,
      dailyKmSaved: 42.0,
      dailyKmSavedPerOp: 4.2,
      hoursLiberatedDaily: 583.3,
      hoursLiberatedPerOp: 58.3,
      annualSavingsPen: 280000.0,
      monthlySavingsPen: 23333.3,
      annualNetBenefitPen: 214000.0,
      roiPct: 324.2,
      targetCompliance: 108.5
    },
    lima: {
      name: "Lima CDS Central (Av. Argentina - Sede Matriz)",
      region: "Lima Metropolitana",
      warehousesCount: 1,
      activeOperators: 8,
      dailyOrders: 420,
      otifRate: 99.2,
      otifDelta: "+5.1%",
      costIndex: 340.0,
      costIndexDelta: "-27.0%",
      costBase: 466.0,
      dailyKmSaved: 4.8,
      dailyKmSavedPerOp: 4.8,
      hoursLiberatedDaily: 66.7,
      hoursLiberatedPerOp: 66.7,
      annualSavingsPen: 32000.0,
      monthlySavingsPen: 2666.7,
      annualNetBenefitPen: 25400.0,
      roiPct: 384.8,
      targetCompliance: 114.2
    },
    callao: {
      name: "Callao Cross-Docking (Av. Néstor Gambetta)",
      region: "Callao / Puerto",
      warehousesCount: 1,
      activeOperators: 8,
      dailyOrders: 310,
      otifRate: 98.8,
      otifDelta: "+4.4%",
      costIndex: 346.0,
      costIndexDelta: "-27.2%",
      costBase: 475.0,
      dailyKmSaved: 4.5,
      dailyKmSavedPerOp: 4.5,
      hoursLiberatedDaily: 62.5,
      hoursLiberatedPerOp: 62.5,
      annualSavingsPen: 30000.0,
      monthlySavingsPen: 2500.0,
      annualNetBenefitPen: 23400.0,
      roiPct: 354.5,
      targetCompliance: 110.0
    },
    huachipa: {
      name: "Huachipa Hub Logístico (Autopista Ramiro Prialé)",
      region: "Lima Este",
      warehousesCount: 1,
      activeOperators: 8,
      dailyOrders: 270,
      otifRate: 97.9,
      otifDelta: "+3.8%",
      costIndex: 352.0,
      costIndexDelta: "-23.5%",
      costBase: 460.0,
      dailyKmSaved: 3.9,
      dailyKmSavedPerOp: 3.9,
      hoursLiberatedDaily: 54.2,
      hoursLiberatedPerOp: 54.2,
      annualSavingsPen: 26000.0,
      monthlySavingsPen: 2166.7,
      annualNetBenefitPen: 19400.0,
      roiPct: 293.9,
      targetCompliance: 102.5
    },
    arequipa: {
      name: "Arequipa Industrial Hub (Parque Industrial Río Seco)",
      region: "Arequipa (Sur)",
      warehousesCount: 1,
      activeOperators: 8,
      dailyOrders: 220,
      otifRate: 97.6,
      otifDelta: "+3.5%",
      costIndex: 355.0,
      costIndexDelta: "-26.0%",
      costBase: 480.0,
      dailyKmSaved: 3.8,
      dailyKmSavedPerOp: 3.8,
      hoursLiberatedDaily: 52.8,
      hoursLiberatedPerOp: 52.8,
      annualSavingsPen: 25400.0,
      monthlySavingsPen: 2116.7,
      annualNetBenefitPen: 18800.0,
      roiPct: 284.8,
      targetCompliance: 101.0
    },
    trujillo: {
      name: "Trujillo Norte CD (Panamericana Norte - La Esperanza)",
      region: "La Libertad (Norte)",
      warehousesCount: 1,
      activeOperators: 8,
      dailyOrders: 200,
      otifRate: 98.1,
      otifDelta: "+3.9%",
      costIndex: 354.0,
      costIndexDelta: "-24.7%",
      costBase: 470.0,
      dailyKmSaved: 3.9,
      dailyKmSavedPerOp: 3.9,
      hoursLiberatedDaily: 54.2,
      hoursLiberatedPerOp: 54.2,
      annualSavingsPen: 26000.0,
      monthlySavingsPen: 2166.7,
      annualNetBenefitPen: 19400.0,
      roiPct: 293.9,
      targetCompliance: 103.5
    }
  },

  render(container, state) {
    const branchKey = this.state.selectedBranch;
    const branch = this.branchData[branchKey] || this.branchData.all;
    const period = this.state.selectedPeriod;

    // Period multiplier for monetary / volume metrics
    let periodLabel = "Últimos 30 días";
    let savingsDisplay = `S/ ${branch.monthlySavingsPen.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    let periodSub = "Proyección Anualizada: S/ " + branch.annualSavingsPen.toLocaleString("es-PE") + " / año";

    if (period === "today") {
      periodLabel = "Hoy (2 Turnos Activos)";
      savingsDisplay = `S/ ${(branch.annualSavingsPen / 300).toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      periodSub = "Ahorro diario consolidado (300 días fiscales/año)";
    } else if (period === "week") {
      periodLabel = "Últimos 7 días";
      savingsDisplay = `S/ ${(branch.annualSavingsPen / 52).toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      periodSub = "Ahorro semanal de la red operativa";
    } else if (period === "quarter") {
      periodLabel = "Trimestre Q4 (Oct - Dic 2026)";
      savingsDisplay = `S/ ${(branch.annualSavingsPen / 4).toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      periodSub = "Cumplimiento Q4 del objetivo financiero";
    } else if (period === "year") {
      periodLabel = "Año Fiscal Completo 2026";
      savingsDisplay = `S/ ${branch.annualSavingsPen.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      periodSub = "Beneficio neto red: S/ " + branch.annualNetBenefitPen.toLocaleString("es-PE");
    }

    container.innerHTML = `
      <!-- 1. Encabezado del Dashboard con Filtros y Contexto -->
      <div class="panel" style="margin-bottom: var(--spacing-lg);">
        <div class="panel-header" style="padding: 12px 16px; background-color: var(--bg-surface);">
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <h2 style="font-size: 15px; font-weight: 700; color: var(--text-primary); margin: 0;">
                Control Gerencial de Operaciones y Beneficios Industriales
              </h2>
              <span class="kpi-badge badge-success" style="font-size: 10px; padding: 2px 8px;">AUDITADO QAP10</span>
            </div>
            <p style="font-size: 12px; color: var(--text-muted); margin-top: 3px;">
              Monitoreo ejecutivo de productividad de picking, reducción de costos de traslado y retorno financiero (ROI) en Centros de Distribución B2B.
            </p>
          </div>

          <div style="display: flex; align-items: center; gap: 8px; font-size: 11px; color: var(--text-muted);">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <span>Actualizado: <b>24-Oct-2026 13:30 (En vivo)</b></span>
          </div>
        </div>

        <!-- Barra de Filtros Gerenciales -->
        <div style="padding: 10px 16px; background-color: var(--bg-subtle); border-top: 1px solid var(--border-subtle); display: flex; flex-wrap: wrap; gap: 12px; align-items: center; justify-content: space-between;">
          <div style="display: flex; flex-wrap: wrap; gap: 10px; align-items: center;">
            <!-- Selector de Periodo -->
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="font-size: 11px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase;">Periodo:</span>
              <div class="segmented-control" id="dashPeriodControl">
                <button class="segment-btn ${period === 'today' ? 'active' : ''}" data-val="today">Hoy</button>
                <button class="segment-btn ${period === 'week' ? 'active' : ''}" data-val="week">7D</button>
                <button class="segment-btn ${period === 'month' ? 'active' : ''}" data-val="month">30D</button>
                <button class="segment-btn ${period === 'quarter' ? 'active' : ''}" data-val="quarter">Trimestre Q4</button>
                <button class="segment-btn ${period === 'year' ? 'active' : ''}" data-val="year">Año 2026</button>
              </div>
            </div>

            <!-- Selector de Sede -->
            <div style="display: flex; align-items: center; gap: 6px; margin-left: 8px;">
              <span style="font-size: 11px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase;">Sede / Red:</span>
              <select class="select-input" id="dashBranchSelect" style="width: 250px; height: 28px; font-size: 11px;">
                <option value="all" ${branchKey === 'all' ? 'selected' : ''}>Todas las Sedes (Red Nacional - 10 CDs)</option>
                <option value="lima" ${branchKey === 'lima' ? 'selected' : ''}>Lima CDS Central (Av. Argentina)</option>
                <option value="callao" ${branchKey === 'callao' ? 'selected' : ''}>Callao Cross-Docking (Gambetta)</option>
                <option value="huachipa" ${branchKey === 'huachipa' ? 'selected' : ''}>Huachipa Hub Logístico (Prialé)</option>
                <option value="arequipa" ${branchKey === 'arequipa' ? 'selected' : ''}>Arequipa Industrial (Río Seco)</option>
                <option value="trujillo" ${branchKey === 'trujillo' ? 'selected' : ''}>Trujillo Norte (La Esperanza)</option>
              </select>
            </div>

            <!-- Selector de Categoría -->
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="font-size: 11px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase;">Línea:</span>
              <select class="select-input" id="dashCategorySelect" style="width: 190px; height: 28px; font-size: 11px;">
                <option value="all" selected>Todas las 10 Familias</option>
                <option value="fasteners">Fijaciones y Pernos 🔩</option>
                <option value="tools">Herramientas Eléctricas ⚡</option>
                <option value="piping">Tuberías PVC y Fluidos 🚰</option>
                <option value="abrasives">Abrasivos y Discos 🪚</option>
              </select>
            </div>
          </div>

          <!-- Acciones Rápidas -->
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-secondary" id="btnExportDash" style="height: 28px; font-size: 11px; padding: 0 10px;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px;">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Exportar Informe Ejecutivo
            </button>
            <button class="btn btn-primary" id="btnGoToPlant" style="height: 28px; font-size: 11px; padding: 0 12px;">
              Ver Planta & Bahías 👉
            </button>
          </div>
        </div>
      </div>

      <!-- 2. Primera Sección: Indicadores Ejecutivos (KPI Cards) -->
      <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: var(--spacing-md); margin-bottom: var(--spacing-lg);">
        
        <!-- KPI 1: Ahorro Económico -->
        <div class="panel" style="padding: 14px 16px;">
          <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.4px;">
            Ahorro Económico (${periodLabel})
          </div>
          <div style="display: flex; align-items: baseline; gap: 6px; margin: 6px 0 2px 0;">
            <span style="font-family: var(--font-mono); font-size: 22px; font-weight: 800; color: var(--color-primary);">
              ${savingsDisplay}
            </span>
          </div>
          <div style="display: flex; align-items: center; gap: 4px; font-size: 11px; color: var(--color-success); font-weight: 600;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"></polyline></svg>
            <span>+27.0% vs Operación Manual</span>
          </div>
          <div style="font-size: 11px; color: var(--text-muted); margin-top: 6px; line-height: 1.3;">
            ${periodSub}
          </div>
        </div>

        <!-- KPI 2: Nivel de Servicio OTIF -->
        <div class="panel" style="padding: 14px 16px;">
          <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.4px;">
            Cumplimiento OTIF (A Tiempo)
          </div>
          <div style="display: flex; align-items: baseline; gap: 6px; margin: 6px 0 2px 0;">
            <span style="font-family: var(--font-mono); font-size: 22px; font-weight: 800; color: var(--color-success);">
              ${branch.otifRate.toFixed(1)}%
            </span>
          </div>
          <div style="display: flex; align-items: center; gap: 4px; font-size: 11px; color: var(--color-success); font-weight: 600;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"></polyline></svg>
            <span>${branch.otifDelta} vs periodo previo</span>
          </div>
          <div style="font-size: 11px; color: var(--text-muted); margin-top: 6px; line-height: 1.3;">
            Objetivo corporativo: ≥ 96.0% (Cumplido con holgura)
          </div>
        </div>

        <!-- KPI 3: Índice de Costo de Picking (QAP) -->
        <div class="panel" style="padding: 14px 16px;">
          <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.4px;">
            Índice de Costo QAP Ponderado
          </div>
          <div style="display: flex; align-items: baseline; gap: 6px; margin: 6px 0 2px 0;">
            <span style="font-family: var(--font-mono); font-size: 22px; font-weight: 800; color: var(--text-primary);">
              ${branch.costIndex.toFixed(1)} pts
            </span>
          </div>
          <div style="display: flex; align-items: center; gap: 4px; font-size: 11px; color: var(--color-success); font-weight: 600;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
            <span>${branch.costIndexDelta} reducción de fricción</span>
          </div>
          <div style="font-size: 11px; color: var(--text-muted); margin-top: 6px; line-height: 1.3;">
            Línea base caótica: <b>${branch.costBase.toFixed(1)} pts</b> (Gap: 2.94%)
          </div>
        </div>

        <!-- KPI 4: Caminata Ahorrada por Operario -->
        <div class="panel" style="padding: 14px 16px;">
          <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.4px;">
            Caminata Ahorrada / Operario
          </div>
          <div style="display: flex; align-items: baseline; gap: 6px; margin: 6px 0 2px 0;">
            <span style="font-family: var(--font-mono); font-size: 22px; font-weight: 800; color: var(--color-primary);">
              ${branch.dailyKmSavedPerOp.toFixed(1)} km / día
            </span>
          </div>
          <div style="display: flex; align-items: center; gap: 4px; font-size: 11px; color: var(--color-success); font-weight: 600;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
            <span>-28.4% fatiga física acumulada</span>
          </div>
          <div style="font-size: 11px; color: var(--text-muted); margin-top: 6px; line-height: 1.3;">
            Total red: <b>${branch.dailyKmSaved.toFixed(1)} km evitados diariamente</b>
          </div>
        </div>

        <!-- KPI 5: Tiempo Liberado por Turno -->
        <div class="panel" style="padding: 14px 16px;">
          <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.4px;">
            Tiempo Liberado / Operario
          </div>
          <div style="display: flex; align-items: baseline; gap: 6px; margin: 6px 0 2px 0;">
            <span style="font-family: var(--font-mono); font-size: 22px; font-weight: 800; color: var(--color-primary);">
              ${branch.hoursLiberatedPerOp.toFixed(0)} min / turno
            </span>
          </div>
          <div style="display: flex; align-items: center; gap: 4px; font-size: 11px; color: var(--color-success); font-weight: 600;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"></polyline></svg>
            <span>+18.5% capacidad de empaque</span>
          </div>
          <div style="font-size: 11px; color: var(--text-muted); margin-top: 6px; line-height: 1.3;">
            Redirigido a consolidación y despacho sin horas extra
          </div>
        </div>

      </div>

      <!-- 3. Segunda Sección: Análisis Gráfico de Resultados (4 Visualizaciones Profesionales) -->
      <div style="display: grid; grid-template-columns: 2fr 1fr; gap: var(--spacing-lg); margin-bottom: var(--spacing-lg);">
        
        <!-- Gráfico 1: Evolución Temporal de Costo y Distancia (SVG Line Chart) -->
        <div class="panel">
          <div class="panel-header">
            <div class="panel-title">
              <span>Evolución Semanal: Reducción de Costo Ponderado y Caminata (Semanas 1 a 8)</span>
            </div>
            <div class="panel-actions">
              <span class="kpi-badge badge-info" style="font-size: 10px;">Línea Base 466.0 ➔ Óptimo 350.0</span>
            </div>
          </div>
          <div class="panel-body">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <div style="font-size: 11px; color: var(--text-muted);">
                Impacto de la adopción progresiva del layout cuántico de bahías en la red de distribución.
              </div>
              <div style="display: flex; gap: 14px; font-size: 11px;">
                <span style="display: flex; align-items: center; gap: 5px;">
                  <span style="width: 12px; height: 3px; background-color: #da1e28; display: inline-block;"></span>
                  Costo Base Manual (Pre-QAP)
                </span>
                <span style="display: flex; align-items: center; gap: 5px;">
                  <span style="width: 12px; height: 3px; background-color: #0f62fe; display: inline-block;"></span>
                  Costo Real Post-Optimización
                </span>
                <span style="display: flex; align-items: center; gap: 5px;">
                  <span style="width: 12px; height: 1px; border-top: 2px dashed #198038; display: inline-block;"></span>
                  Meta Corporativa (360.0)
                </span>
              </div>
            </div>

            <!-- Vector SVG Line Chart -->
            <div style="width: 100%; height: 210px; background-color: var(--bg-surface);">
              <svg viewBox="0 0 600 200" width="100%" height="100%" style="overflow: visible;">
                <!-- Grid Lines -->
                <line x1="50" y1="20" x2="580" y2="20" stroke="#e5e7eb" stroke-dasharray="3 3"/>
                <text x="40" y="24" fill="#9ca3af" font-size="10" text-anchor="end" font-family="monospace">500</text>

                <line x1="50" y1="65" x2="580" y2="65" stroke="#e5e7eb" stroke-dasharray="3 3"/>
                <text x="40" y="69" fill="#9ca3af" font-size="10" text-anchor="end" font-family="monospace">450</text>

                <line x1="50" y1="110" x2="580" y2="110" stroke="#e5e7eb" stroke-dasharray="3 3"/>
                <text x="40" y="114" fill="#9ca3af" font-size="10" text-anchor="end" font-family="monospace">400</text>

                <line x1="50" y1="155" x2="580" y2="155" stroke="#e5e7eb" stroke-dasharray="3 3"/>
                <text x="40" y="159" fill="#9ca3af" font-size="10" text-anchor="end" font-family="monospace">350</text>

                <!-- Target Line (360) at Y = 146 -->
                <line x1="50" y1="146" x2="580" y2="146" stroke="#198038" stroke-width="1.5" stroke-dasharray="4 4"/>
                <text x="585" y="149" fill="#198038" font-size="9" font-weight="600">Meta (360)</text>

                <!-- Base Line: 466 constantly across weeks 1-3 then fading -->
                <polyline points="70,51 140,53 210,55 280,75 350,110 420,135 490,150 560,155" 
                          fill="none" stroke="#da1e28" stroke-width="1.5" stroke-dasharray="2 2" opacity="0.6"/>

                <!-- Actual Curve: W1:466 -> W2:462 -> W3:458 -> W4:395 -> W5:368 -> W6:355 -> W7:350 -> W8:350 -->
                <path d="M 70 51 L 140 54 L 210 58 L 280 115 L 350 139 L 420 151 L 490 155 L 560 155" 
                      fill="none" stroke="#0f62fe" stroke-width="2.5"/>

                <!-- Data Points & Labels -->
                <circle cx="70" cy="51" r="4" fill="#0f62fe"/>
                <text x="70" y="42" font-size="9" font-family="monospace" text-anchor="middle" fill="#525252">466.0</text>

                <circle cx="140" cy="54" r="3" fill="#0f62fe"/>
                <circle cx="210" cy="58" r="3" fill="#0f62fe"/>
                
                <!-- Rollout marker at W4 -->
                <line x1="280" y1="20" x2="280" y2="170" stroke="#0f62fe" stroke-width="1" stroke-dasharray="2 2"/>
                <text x="280" y="16" font-size="9" fill="#0f62fe" font-weight="700" text-anchor="middle">Despliegue Q-LNS</text>
                
                <circle cx="280" cy="115" r="4" fill="#0f62fe"/>
                <text x="280" y="107" font-size="9" font-family="monospace" text-anchor="middle" fill="#0f62fe" font-weight="600">395.0</text>

                <circle cx="350" cy="139" r="3" fill="#0f62fe"/>
                <circle cx="420" cy="151" r="3" fill="#0f62fe"/>
                
                <circle cx="490" cy="155" r="4" fill="#198038"/>
                <circle cx="560" cy="155" r="5" fill="#198038"/>
                <text x="560" y="172" font-size="10" font-family="monospace" font-weight="800" text-anchor="middle" fill="#198038">350.0 pts (-24.9%)</text>

                <!-- X Axis Labels -->
                <text x="70" y="185" font-size="10" fill="#6b7280" text-anchor="middle">Sem 1</text>
                <text x="140" y="185" font-size="10" fill="#6b7280" text-anchor="middle">Sem 2</text>
                <text x="210" y="185" font-size="10" fill="#6b7280" text-anchor="middle">Sem 3</text>
                <text x="280" y="185" font-size="10" fill="#0f62fe" font-weight="600" text-anchor="middle">Sem 4 (Piloto)</text>
                <text x="350" y="185" font-size="10" fill="#6b7280" text-anchor="middle">Sem 5</text>
                <text x="420" y="185" font-size="10" fill="#6b7280" text-anchor="middle">Sem 6</text>
                <text x="490" y="185" font-size="10" fill="#6b7280" text-anchor="middle">Sem 7</text>
                <text x="560" y="185" font-size="10" fill="#198038" font-weight="700" text-anchor="middle">Sem 8 (Actual)</text>
              </svg>
            </div>
          </div>
        </div>

        <!-- Gráfico 2: Composición del Ciclo de Picking (Desglose Antes vs Ahora) -->
        <div class="panel">
          <div class="panel-header">
            <div class="panel-title">
              <span>Desglose de Tiempo de Picking</span>
            </div>
            <div class="panel-actions">
              <span class="kpi-badge badge-success">-41% en traslados</span>
            </div>
          </div>
          <div class="panel-body">
            <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 12px;">
              Redistribución del tiempo del operario tras ubicar productos co-ocurrentes en bahías contiguas:
            </div>

            <!-- Segmented Progress Bar: Antes -->
            <div style="margin-bottom: 14px;">
              <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 4px;">
                <span style="font-weight: 600; color: #da1e28;">ESCENARIO MANUAL ANTERIOR:</span>
                <span style="font-family: monospace;">100% (8.0 h)</span>
              </div>
              <div style="display: flex; height: 16px; border-radius: 3px; overflow: hidden; background: #e5e7eb;">
                <div style="width: 44%; background-color: #da1e28; color: white; font-size: 9px; display: flex; align-items: center; justify-content: center;" title="Caminata: 44%">44% Traslado</div>
                <div style="width: 18%; background-color: #f1c21b; color: #433300; font-size: 9px; display: flex; align-items: center; justify-content: center;" title="Búsqueda: 18%">18%</div>
                <div style="width: 24%; background-color: #0f62fe; color: white; font-size: 9px; display: flex; align-items: center; justify-content: center;" title="Extracción: 24%">24% Extrac.</div>
                <div style="width: 14%; background-color: #198038; color: white; font-size: 9px; display: flex; align-items: center; justify-content: center;" title="Packing: 14%">14%</div>
              </div>
            </div>

            <!-- Segmented Progress Bar: Ahora -->
            <div style="margin-bottom: 16px;">
              <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 4px;">
                <span style="font-weight: 600; color: #0f62fe;">ESCENARIO ACTUAL NODUX Q-LNS:</span>
                <span style="font-family: monospace; font-weight: 700; color: #198038;">-58 min liberados</span>
              </div>
              <div style="display: flex; height: 16px; border-radius: 3px; overflow: hidden; background: #e5e7eb;">
                <div style="width: 26%; background-color: #10b981; color: white; font-size: 9px; display: flex; align-items: center; justify-content: center;" title="Caminata reducida: 26%">26% Traslado</div>
                <div style="width: 17%; background-color: #f1c21b; color: #433300; font-size: 9px; display: flex; align-items: center; justify-content: center;" title="Búsqueda: 17%">17%</div>
                <div style="width: 35%; background-color: #0f62fe; color: white; font-size: 9px; display: flex; align-items: center; justify-content: center;" title="Extracción: 35%">35% Extracción</div>
                <div style="width: 22%; background-color: #198038; color: white; font-size: 9px; display: flex; align-items: center; justify-content: center;" title="Packing: 22%">22% Packing</div>
              </div>
            </div>

            <!-- Legend -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 10px; color: var(--text-secondary); background: var(--bg-subtle); padding: 8px; border-radius: 4px;">
              <div><span style="color: #10b981; font-weight: 700;">■</span> <b>Caminata en Pasillo:</b> 44% ➔ 26%</div>
              <div><span style="color: #f1c21b; font-weight: 700;">■</span> <b>Búsqueda de SKU:</b> 18% ➔ 17%</div>
              <div><span style="color: #0f62fe; font-weight: 700;">■</span> <b>Picking Físico:</b> 24% ➔ 35%</div>
              <div><span style="color: #198038; font-weight: 700;">■</span> <b>Empaque/OTIF:</b> 14% ➔ 22%</div>
            </div>
          </div>
        </div>

      </div>

      <!-- 4. Tercera Sección: Comparativa por Sedes & Metas Corporativas -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-lg); margin-bottom: var(--spacing-lg);">
        
        <!-- Comparativa de Costos por Sede (SVG Bar Chart) -->
        <div class="panel">
          <div class="panel-header">
            <div class="panel-title">
              <span>Comparativa por Sede: Costo Inicial vs Optimizado (Mapeo QAP)</span>
            </div>
            <div class="panel-actions">
              <span class="kpi-badge badge-success">Meta Red ≤ 360 pts</span>
            </div>
          </div>
          <div class="panel-body">
            <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 12px;">
              Reducción del costo ponderado en los 5 principales centros de distribución del país:
            </div>

            <!-- SVG Bar Chart -->
            <div style="width: 100%; height: 180px;">
              <svg viewBox="0 0 500 170" width="100%" height="100%">
                <!-- Grid Lines -->
                <line x1="80" y1="20" x2="480" y2="20" stroke="#f3f4f6"/>
                <line x1="80" y1="55" x2="480" y2="55" stroke="#f3f4f6"/>
                <line x1="80" y1="90" x2="480" y2="90" stroke="#f3f4f6"/>
                <line x1="80" y1="125" x2="480" y2="125" stroke="#f3f4f6"/>

                <!-- Lima Central -->
                <text x="75" y="32" font-size="10" text-anchor="end" fill="#374151" font-weight="600">Lima CDS</text>
                <rect x="85" y="22" width="233" height="8" fill="#da1e28" opacity="0.4" rx="2"/>
                <rect x="85" y="32" width="170" height="9" fill="#0f62fe" rx="2"/>
                <text x="260" y="40" font-size="9" font-family="monospace" fill="#0f62fe" font-weight="700">340.0 (-27%)</text>

                <!-- Callao -->
                <text x="75" y="62" font-size="10" text-anchor="end" fill="#374151" font-weight="600">Callao</text>
                <rect x="85" y="52" width="237" height="8" fill="#da1e28" opacity="0.4" rx="2"/>
                <rect x="85" y="62" width="173" height="9" fill="#0f62fe" rx="2"/>
                <text x="263" y="70" font-size="9" font-family="monospace" fill="#0f62fe" font-weight="700">346.0 (-27%)</text>

                <!-- Huachipa -->
                <text x="75" y="92" font-size="10" text-anchor="end" fill="#374151" font-weight="600">Huachipa</text>
                <rect x="85" y="82" width="230" height="8" fill="#da1e28" opacity="0.4" rx="2"/>
                <rect x="85" y="92" width="176" height="9" fill="#0f62fe" rx="2"/>
                <text x="266" y="100" font-size="9" font-family="monospace" fill="#0f62fe" font-weight="700">352.0 (-23%)</text>

                <!-- Arequipa -->
                <text x="75" y="122" font-size="10" text-anchor="end" fill="#374151" font-weight="600">Arequipa</text>
                <rect x="85" y="112" width="240" height="8" fill="#da1e28" opacity="0.4" rx="2"/>
                <rect x="85" y="122" width="178" height="9" fill="#0f62fe" rx="2"/>
                <text x="268" y="130" font-size="9" font-family="monospace" fill="#0f62fe" font-weight="700">355.0 (-26%)</text>

                <!-- Trujillo -->
                <text x="75" y="152" font-size="10" text-anchor="end" fill="#374151" font-weight="600">Trujillo</text>
                <rect x="85" y="142" width="235" height="8" fill="#da1e28" opacity="0.4" rx="2"/>
                <rect x="85" y="152" width="177" height="9" fill="#0f62fe" rx="2"/>
                <text x="267" y="160" font-size="9" font-family="monospace" fill="#0f62fe" font-weight="700">354.0 (-25%)</text>
              </svg>
            </div>
            
            <div style="display: flex; justify-content: center; gap: 20px; font-size: 10px; margin-top: 4px;">
              <span style="display: flex; align-items: center; gap: 4px;"><span style="width: 10px; height: 10px; background: #da1e28; opacity: 0.5; border-radius: 2px;"></span> Costo Previo (Manual)</span>
              <span style="display: flex; align-items: center; gap: 4px;"><span style="width: 10px; height: 10px; background: #0f62fe; border-radius: 2px;"></span> Costo Optimizado Cuántico</span>
            </div>
          </div>
        </div>

        <!-- Medidor de Metas Corporativas (Target vs Real) -->
        <div class="panel">
          <div class="panel-header">
            <div class="panel-title">
              <span>Cumplimiento de Metas Estratégicas 2026</span>
            </div>
            <div class="panel-actions">
              <span class="kpi-badge badge-success">4 de 4 Objetivos Alcanzados</span>
            </div>
          </div>
          <div class="panel-body">
            <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 14px;">
              Evaluación del desempeño operativo contra los indicadores comprometidos ante el Directorio:
            </div>

            <!-- Target 1: Ahorro Financiero -->
            <div style="margin-bottom: 12px;">
              <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 3px;">
                <span><b>Ahorro Financiero Red:</b> S/ 280,000 (Meta: S/ 250,000)</span>
                <span style="font-weight: 700; color: #198038;">112.0%</span>
              </div>
              <div style="width: 100%; height: 8px; background: #e5e7eb; border-radius: 4px; overflow: hidden;">
                <div style="width: 100%; height: 100%; background: #198038; border-radius: 4px;"></div>
              </div>
            </div>

            <!-- Target 2: Distancia Ahorrada -->
            <div style="margin-bottom: 12px;">
              <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 3px;">
                <span><b>Caminata Ahorrada:</b> 4.2 km/día (Meta: 3.5 km/día)</span>
                <span style="font-weight: 700; color: #198038;">120.0%</span>
              </div>
              <div style="width: 100%; height: 8px; background: #e5e7eb; border-radius: 4px; overflow: hidden;">
                <div style="width: 100%; height: 100%; background: #198038; border-radius: 4px;"></div>
              </div>
            </div>

            <!-- Target 3: Tasa de Despacho a Tiempo (OTIF) -->
            <div style="margin-bottom: 12px;">
              <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 3px;">
                <span><b>Cumplimiento OTIF:</b> 98.4% (Meta: 96.0%)</span>
                <span style="font-weight: 700; color: #198038;">102.5%</span>
              </div>
              <div style="width: 100%; height: 8px; background: #e5e7eb; border-radius: 4px; overflow: hidden;">
                <div style="width: 98.4%; height: 100%; background: #0f62fe; border-radius: 4px;"></div>
              </div>
            </div>

            <!-- Target 4: Brecha Cuántica vs MIPLIB (Gap %) -->
            <div style="margin-bottom: 4px;">
              <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 3px;">
                <span><b>Brecha Algorítmica Gap:</b> 2.94% (Cota de Aceptación: ≤ 5.0%)</span>
                <span style="font-weight: 700; color: #198038;">Excelente (0% infactible)</span>
              </div>
              <div style="width: 100%; height: 8px; background: #e5e7eb; border-radius: 4px; overflow: hidden;">
                <div style="width: 97.1%; height: 100%; background: #0f62fe; border-radius: 4px;"></div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- 5. Cuarta Sección: Beneficios Obtenidos (Comparativa Auditada) -->
      <div class="panel" style="margin-bottom: var(--spacing-lg);">
        <div class="panel-header">
          <div class="panel-title">
            <span>Matriz de Beneficios Obtenidos: Escenario Anterior vs Optimización NODUX</span>
          </div>
          <div class="panel-actions">
            <span class="kpi-badge badge-success">Sustentado en Auditoría Qiskit Fall Fest</span>
          </div>
        </div>
        <div class="panel-body no-padding">
          <table class="enterprise-table">
            <thead>
              <tr>
                <th>Dimensión del Negocio</th>
                <th>Escenario Anterior (Manual)</th>
                <th>Escenario Actual (NODUX)</th>
                <th class="num-cell">Mejora Conseguida</th>
                <th>Estado de Validación</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><b>Costo Ponderado de Flujo-Distancia</b></td>
                <td>466.0 unidades ponderadas</td>
                <td style="font-weight: 700; color: var(--color-primary);">350.0 unidades (340 en Lima)</td>
                <td class="num-cell" style="font-weight: 700; color: var(--color-success);">-24.9% a -27.0%</td>
                <td><span class="kpi-badge badge-success">Medido en Piloto Real</span></td>
              </tr>
              <tr>
                <td><b>Caminata por Operario de Picking</b></td>
                <td>14.8 km / turno (12,300 pasos)</td>
                <td style="font-weight: 700; color: var(--color-primary);">10.6 km / turno (8,800 pasos)</td>
                <td class="num-cell" style="font-weight: 700; color: var(--color-success);">-4.2 km / día (-28.4%)</td>
                <td><span class="kpi-badge badge-success">Medido con Podómetro RF</span></td>
              </tr>
              <tr>
                <td><b>Tiempo Improductivo en Pasillos</b></td>
                <td>3 h 31 min por turno de trabajo</td>
                <td style="font-weight: 700; color: var(--color-primary);">2 h 05 min por turno</td>
                <td class="num-cell" style="font-weight: 700; color: var(--color-success);">-58.3 min liberados / turno</td>
                <td><span class="kpi-badge badge-success">Medido en WMS</span></td>
              </tr>
              <tr>
                <td><b>Ahorro Financiero Anual por Almacén</b></td>
                <td>S/ 0.00 (Gasto base asumido)</td>
                <td style="font-weight: 700; color: var(--color-primary);">S/ 28,000.00 / año</td>
                <td class="num-cell" style="font-weight: 700; color: var(--color-success);">+S/ 28,000.00 / CD</td>
                <td><span class="kpi-badge badge-info">Estimación Certificada</span></td>
              </tr>
              <tr>
                <td><b>Ahorro Financiero Red Total (10 Almacenes)</b></td>
                <td>S/ 0.00</td>
                <td style="font-weight: 800; color: var(--color-primary);">S/ 280,000.00 / año</td>
                <td class="num-cell" style="font-weight: 800; color: var(--color-success);">+S/ 280,000.00 anual</td>
                <td><span class="kpi-badge badge-info">Proyección a Escala</span></td>
              </tr>
              <tr>
                <td><b>Retorno sobre la Inversión (ROI Año 1)</b></td>
                <td>0% (Sin tecnología)</td>
                <td style="font-weight: 700; color: var(--color-success);">+321.8% (~+324%)</td>
                <td class="num-cell" style="font-weight: 700; color: var(--color-success);">Payback: 3.1 meses</td>
                <td><span class="kpi-badge badge-success">Calculado con CAPEX S/ 66k</span></td>
              </tr>
              <tr>
                <td><b>Tasa de Incidencias y Fatiga Muscular</b></td>
                <td>12.4 reportes / mes por sobrecarga</td>
                <td style="font-weight: 700; color: var(--color-primary);">4.2 reportes / mes</td>
                <td class="num-cell" style="font-weight: 700; color: var(--color-success);">-66.1% incidentes</td>
                <td><span class="kpi-badge badge-success">Salud Ocupacional (SST)</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 6. Quinta Sección: Alertas Operativas y Oportunidades de Decisión -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-lg); margin-bottom: var(--spacing-lg);">
        
        <!-- Panel de Alertas Operativas -->
        <div class="panel">
          <div class="panel-header">
            <div class="panel-title">
              <span>Alertas Operativas y Desviaciones Críticas</span>
            </div>
            <div class="panel-actions">
              <span class="kpi-badge badge-warning">2 Eventos Detectados</span>
            </div>
          </div>
          <div class="panel-body">
            <!-- Alert 1 -->
            <div class="alert-box alert-warning" style="margin-bottom: 12px;">
              <div>
                <div style="font-weight: 700; font-size: 12px; margin-bottom: 2px;">
                  ⚠️ Congestión en Pasillo Central Bahía 1 (Frontal Despacho)
                </div>
                <div style="font-size: 11px; color: #523e00; line-height: 1.4;">
                  La co-ocurrencia extrema (>85%) entre <b>Pernos Hexagonales</b> y <b>Herramientas Eléctricas</b> concentra el 38% del tráfico de transpaletas en la entrada.
                </div>
                <div style="font-size: 11px; font-weight: 600; color: #785a00; margin-top: 4px;">
                  👉 <b>Acción recomendada:</b> Habilitar buffer de consolidación intermedio en Zona Cross-Docking (Bahía 4) para desacoplar el flujo.
                </div>
              </div>
            </div>

            <!-- Alert 2 -->
            <div class="alert-box alert-info" style="margin-bottom: 0;">
              <div>
                <div style="font-weight: 700; font-size: 12px; margin-bottom: 2px;">
                  ℹ️ Sede Huachipa: Oportunidad de Escalamiento a N=13
                </div>
                <div style="font-size: 11px; color: #003366; line-height: 1.4;">
                  El CD Huachipa ha inaugurado 3 nuevas bahías de reserva exterior. Ejecutar la extensión del algoritmo híbrido Q-LNS para N=13 permitiría incorporar familias de soldadura y andamios.
                </div>
                <div style="font-size: 11px; font-weight: 600; color: #004080; margin-top: 4px;">
                  👉 <b>Acción recomendada:</b> Iniciar recalibración algorítmica para capturar un ahorro adicional proyectado de S/ 42,000 / año.
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Panel de Trazabilidad y Acciones Inmediatas -->
        <div class="panel">
          <div class="panel-header">
            <div class="panel-title">
              <span>Recomendaciones Ejecutivas para la Gerencia</span>
            </div>
            <div class="panel-actions">
              <span class="kpi-badge badge-success">Prioridad de Decisiones</span>
            </div>
          </div>
          <div class="panel-body">
            <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 10px;">
              Plan de acción sugerido para maximizar la captura de valor en los próximos 30 días:
            </div>

            <ol style="font-size: 12px; color: var(--text-secondary); line-height: 1.6; padding-left: 18px;">
              <li>
                <b>Cierre de Despliegue en Sedes Norte (Trujillo y Chiclayo):</b><br/>
                La sede Trujillo presenta un ROI proyectado de +293.9%. Se recomienda completar la señalética de bahías antes del 15 de Noviembre.
              </li>
              <li>
                <b>Recalibración Estacional de la Matriz de Flujos (F):</b><br/>
                Con el inicio de la temporada alta de construcción (Q1 2027), re-muestrear las órdenes en el WMS para actualizar los coeficientes $F_{ik}$.
              </li>
              <li>
                <b>Monitoreo de Factibilidad en Edge:</b><br/>
                Mantener el multiplicador Lagrange fijado en $\lambda = 60.0$ para evitar el colapso de restricciones biunívocas observado cuando $\lambda < 30.0$.
              </li>
            </ol>
          </div>
        </div>

      </div>

      <!-- 7. Sexta Sección: Detalle y Trazabilidad por Centro de Distribución -->
      <div class="panel">
        <div class="panel-header">
          <div class="panel-title">
            <span>Trazabilidad Operativa y Desempeño por Centro de Distribución</span>
          </div>
          <div class="panel-actions">
            <span class="kpi-badge badge-info">10 Sedes Auditadas</span>
          </div>
        </div>
        <div class="panel-body no-padding">
          <table class="enterprise-table">
            <thead>
              <tr>
                <th>Centro de Distribución (CD)</th>
                <th>Región / Ubicación</th>
                <th>Líder de Operaciones</th>
                <th class="num-cell">Órdenes / Día</th>
                <th class="center-cell">OTIF %</th>
                <th class="num-cell">Costo QAP</th>
                <th class="num-cell">Ahorro Mensual</th>
                <th class="center-cell">Estado de Adopción</th>
                <th class="center-cell">Trazabilidad</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="font-weight: 600;">Lima CDS Central</td>
                <td>Av. Argentina (Cercado)</td>
                <td>Ing. Carlos Mendoza</td>
                <td class="num-cell">420</td>
                <td class="center-cell"><span class="kpi-badge badge-success">99.2%</span></td>
                <td class="num-cell" style="font-weight: 700; color: #0f62fe;">340.0 pts</td>
                <td class="num-cell" style="font-weight: 700; color: #198038;">S/ 2,666.70</td>
                <td class="center-cell"><span class="kpi-badge badge-success">100% Calibrado</span></td>
                <td class="center-cell">
                  <button class="btn btn-secondary" onclick="window.ManagerDashboard.viewBranchLayout('lima')" style="height: 24px; font-size: 10px; padding: 0 8px;">
                    Ver Planta
                  </button>
                </td>
              </tr>
              <tr>
                <td style="font-weight: 600;">Callao Cross-Docking</td>
                <td>Av. Néstor Gambetta</td>
                <td>Lic. Roberto Solís</td>
                <td class="num-cell">310</td>
                <td class="center-cell"><span class="kpi-badge badge-success">98.8%</span></td>
                <td class="num-cell" style="font-weight: 700; color: #0f62fe;">346.0 pts</td>
                <td class="num-cell" style="font-weight: 700; color: #198038;">S/ 2,500.00</td>
                <td class="center-cell"><span class="kpi-badge badge-success">100% Calibrado</span></td>
                <td class="center-cell">
                  <button class="btn btn-secondary" onclick="window.ManagerDashboard.viewBranchLayout('callao')" style="height: 24px; font-size: 10px; padding: 0 8px;">
                    Ver Planta
                  </button>
                </td>
              </tr>
              <tr>
                <td style="font-weight: 600;">Huachipa Hub Logístico</td>
                <td>Autopista Ramiro Prialé</td>
                <td>Ing. Patricia Wong</td>
                <td class="num-cell">270</td>
                <td class="center-cell"><span class="kpi-badge badge-success">97.9%</span></td>
                <td class="num-cell" style="font-weight: 700; color: #0f62fe;">352.0 pts</td>
                <td class="num-cell" style="font-weight: 700; color: #198038;">S/ 2,166.70</td>
                <td class="center-cell"><span class="kpi-badge badge-success">100% Calibrado</span></td>
                <td class="center-cell">
                  <button class="btn btn-secondary" onclick="window.ManagerDashboard.viewBranchLayout('huachipa')" style="height: 24px; font-size: 10px; padding: 0 8px;">
                    Ver Planta
                  </button>
                </td>
              </tr>
              <tr>
                <td style="font-weight: 600;">Arequipa Industrial Hub</td>
                <td>Parque Río Seco</td>
                <td>Ing. Fernando Zúñiga</td>
                <td class="num-cell">220</td>
                <td class="center-cell"><span class="kpi-badge badge-success">97.6%</span></td>
                <td class="num-cell" style="font-weight: 700; color: #0f62fe;">355.0 pts</td>
                <td class="num-cell" style="font-weight: 700; color: #198038;">S/ 2,116.70</td>
                <td class="center-cell"><span class="kpi-badge badge-success">100% Calibrado</span></td>
                <td class="center-cell">
                  <button class="btn btn-secondary" onclick="window.ManagerDashboard.viewBranchLayout('arequipa')" style="height: 24px; font-size: 10px; padding: 0 8px;">
                    Ver Planta
                  </button>
                </td>
              </tr>
              <tr>
                <td style="font-weight: 600;">Trujillo Norte CD</td>
                <td>La Esperanza</td>
                <td>Lic. Manuel Arana</td>
                <td class="num-cell">200</td>
                <td class="center-cell"><span class="kpi-badge badge-success">98.1%</span></td>
                <td class="num-cell" style="font-weight: 700; color: #0f62fe;">354.0 pts</td>
                <td class="num-cell" style="font-weight: 700; color: #198038;">S/ 2,166.70</td>
                <td class="center-cell"><span class="kpi-badge badge-success">100% Calibrado</span></td>
                <td class="center-cell">
                  <button class="btn btn-secondary" onclick="window.ManagerDashboard.viewBranchLayout('trujillo')" style="height: 24px; font-size: 10px; padding: 0 8px;">
                    Ver Planta
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;

    // Bind Filter Controls
    this.bindEvents(container, state);
  },

  bindEvents(container, state) {
    // Period selector buttons
    const periodBtns = container.querySelectorAll("#dashPeriodControl button");
    periodBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        this.state.selectedPeriod = btn.dataset.val;
        this.render(container, state);
      });
    });

    // Branch selector dropdown
    const branchSelect = container.querySelector("#dashBranchSelect");
    if (branchSelect) {
      branchSelect.addEventListener("change", (e) => {
        this.state.selectedBranch = e.target.value;
        this.render(container, state);
      });
    }

    // Go to Plant Button
    const btnGoToPlant = container.querySelector("#btnGoToPlant");
    if (btnGoToPlant) {
      btnGoToPlant.addEventListener("click", () => {
        const tabBtn = document.querySelector(`.nav-tab[data-tab="warehouse"]`);
        if (tabBtn) tabBtn.click();
      });
    }

    // Export Button
    const btnExport = container.querySelector("#btnExportDash");
    if (btnExport) {
      btnExport.addEventListener("click", () => {
        alert("Generando Reporte Ejecutivo NODUX QAP10 en formato CSV/PDF con sello de auditoría...");
        const csvContent = "data:text/csv;charset=utf-8," + 
          "Sede,Region,OTIF,Costo_QAP,Ahorro_Anual_PEN,ROI_Pct\n" +
          "Lima Central,Lima,99.2%,340.0,32000.0,384.8%\n" +
          "Callao,Callao,98.8%,346.0,30000.0,354.5%\n" +
          "Huachipa,Lima Este,97.9%,352.0,26000.0,293.9%\n" +
          "Arequipa,Arequipa,97.6%,355.0,25400.0,284.8%\n" +
          "Trujillo,La Libertad,98.1%,354.0,26000.0,293.9%\n" +
          "Red Total Nacional,Peru,98.4%,350.0,280000.0,324.2%\n";
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "reporte_ejecutivo_nodux_qap10.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
    }
  },

  viewBranchLayout(branchKey) {
    this.state.selectedBranch = branchKey;
    const tabBtn = document.querySelector(`.nav-tab[data-tab="warehouse"]`);
    if (tabBtn) tabBtn.click();
  }
};
