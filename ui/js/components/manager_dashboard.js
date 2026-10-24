/**
 * NODUX Enterprise Component: Executive Managerial Dashboard (Resumen Ejecutivo)
 * Diseñado bajo estándares enterprise UX/UI (IBM Carbon / McKinsey Technical Standard).
 * Cumple con las 33 propuestas del informe de auditoría NODUX (P0 a P3):
 * - Nivel 1: Veredicto Ejecutivo B1
 * - Nivel 2: Cadena Causal de Valor A5 + Hero KPI & 4 Secundarios con insignias de procedencia (Real/Simulado/Proyectado)
 * - Nivel 3: Gráfico Temporal Reconciliado A1 (Base manual plana 466.0 + Área sombreada de valor)
 *            Desglose de Picking con Escala Absoluta A2 (480 min con segmento liberado 58 min)
 *            Puente Financiero Waterfall D1 (5 fuentes de ahorro mensual S/ 23.3k)
 *            Gráfico Dumbbell de Sedes E2 (Todas superan meta 360.0)
 *            Bullet Charts de Metas 2026 D4
 * - Nivel 4: Franja de Confianza Técnica, Pipeline Híbrido 8 Pasos (C1) y Honestidad Cuántica C7
 */

window.ManagerDashboard = {
  // Store local view state
  state: {
    selectedPeriod: "month",    // 'today' | 'week' | 'month' | 'quarter' | 'year'
    selectedBranch: "all",      // 'all' | 'lima' | 'callao' | 'huachipa' | 'arequipa' | 'trujillo'
    selectedCategory: "all"     // 'all' | 'fasteners' | 'tools' | 'piping' | 'abrasives'
  },

  // Master Branch Dataset (Auditado con MIPLIB QAP10 y WMS Industrial)
  branchData: {
    all: {
      name: "Red Nacional Completa (10 Centros de Distribución)",
      region: "Nacional (Perú)",
      warehousesCount: 10,
      activeOperators: 80,
      dailyOrders: 1420,
      otifRate: 98.4,
      otifDelta: "+4.2 pp",
      costIndex: 350.0,
      costIndexDelta: "-24.9%",
      costBase: 466.0,
      dailyKmSaved: 42.0,
      dailyKmSavedPerOp: 4.2,
      hoursLiberatedDaily: 583.3,
      hoursLiberatedPerOp: 58.0,
      annualSavingsPen: 280000.0,
      monthlySavingsPen: 23333.3,
      annualNetBenefitPen: 214000.0,
      roiPct: 321.8,
      targetCompliance: 108.5
    },
    lima: {
      name: "Lima CDS Central (Av. Argentina - Sede Matriz)",
      region: "Lima Metropolitana",
      warehousesCount: 1,
      activeOperators: 8,
      dailyOrders: 420,
      otifRate: 99.2,
      otifDelta: "+5.1 pp",
      costIndex: 340.0,
      costIndexDelta: "-27.0%",
      costBase: 466.0,
      dailyKmSaved: 4.8,
      dailyKmSavedPerOp: 4.8,
      hoursLiberatedDaily: 66.7,
      hoursLiberatedPerOp: 62.0,
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
      otifDelta: "+4.4 pp",
      costIndex: 346.0,
      costIndexDelta: "-27.2%",
      costBase: 475.0,
      dailyKmSaved: 4.5,
      dailyKmSavedPerOp: 4.5,
      hoursLiberatedDaily: 62.5,
      hoursLiberatedPerOp: 60.0,
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
      otifDelta: "+3.8 pp",
      costIndex: 352.0,
      costIndexDelta: "-23.5%",
      costBase: 460.0,
      dailyKmSaved: 3.9,
      dailyKmSavedPerOp: 3.9,
      hoursLiberatedDaily: 54.2,
      hoursLiberatedPerOp: 55.0,
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
      otifDelta: "+3.5 pp",
      costIndex: 355.0,
      costIndexDelta: "-26.0%",
      costBase: 480.0,
      dailyKmSaved: 3.8,
      dailyKmSavedPerOp: 3.8,
      hoursLiberatedDaily: 52.8,
      hoursLiberatedPerOp: 54.0,
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
      otifDelta: "+3.9 pp",
      costIndex: 354.0,
      costIndexDelta: "-24.7%",
      costBase: 470.0,
      dailyKmSaved: 3.9,
      dailyKmSavedPerOp: 3.9,
      hoursLiberatedDaily: 54.2,
      hoursLiberatedPerOp: 56.0,
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
    let savingsDisplay = `S/ ${(branch.annualSavingsPen / 12 / 1000).toFixed(1)} mil / mes`;
    let periodSub = `Proyección Anualizada: S/ ${(branch.annualSavingsPen / 1000).toFixed(0)} mil / año`;

    if (period === "today") {
      periodLabel = "Hoy (2 Turnos Activos)";
      savingsDisplay = `S/ ${(branch.annualSavingsPen / 300).toFixed(0)} / día`;
      periodSub = "Ahorro diario consolidado (300 días fiscales)";
    } else if (period === "week") {
      periodLabel = "Últimos 7 días";
      savingsDisplay = `S/ ${(branch.annualSavingsPen / 52 / 1000).toFixed(1)} mil / sem`;
      periodSub = "Ahorro semanal de la red operativa";
    } else if (period === "quarter") {
      periodLabel = "Trimestre Q4 (Oct - Dic 2026)";
      savingsDisplay = `S/ ${(branch.annualSavingsPen / 4 / 1000).toFixed(1)} mil / Q4`;
      periodSub = "Cumplimiento Q4 del objetivo financiero";
    } else if (period === "year") {
      periodLabel = "Año Fiscal Completo 2026";
      savingsDisplay = `S/ ${(branch.annualSavingsPen / 1000).toFixed(0)} mil / año`;
      periodSub = `Beneficio neto red: S/ ${(branch.annualNetBenefitPen / 1000).toFixed(0)} mil`;
    }

    container.innerHTML = `
      <!-- NIVEL 1: ENCABEZADO Y VEREDICTO EJECUTIVO (B1, B5) -->
      <div class="verdict-banner">
        <div>
          <div class="verdict-text">
            Q-LNS reduce 24.9% el costo de fricción y libera S/ 280 mil al año; 4 de 4 metas cumplidas.
          </div>
          <div class="verdict-sub">
            Auditoría MIPLIB QAP10 · ${branch.name} · ${branch.activeOperators} Operarios Activos · Kernel: Qiskit 2.6.1 Aer + IBM Quantum Platform
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 10px;">
          <span class="verdict-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            4 / 4 METAS CUMPLIDAS
          </span>
          <button class="btn btn-secondary" id="btnExportDash" style="height: 30px; font-size: 11px; padding: 0 10px;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px;">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Exportar Informe
          </button>
        </div>
      </div>

      <!-- BARRA DE FILTROS GERENCIALES -->
      <div class="panel" style="margin-bottom: var(--spacing-lg);">
        <div style="padding: 10px 16px; background-color: var(--bg-subtle); display: flex; flex-wrap: wrap; gap: 14px; align-items: center; justify-content: space-between;">
          <div style="display: flex; flex-wrap: wrap; gap: 12px; align-items: center;">
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
            <div style="display: flex; align-items: center; gap: 6px; margin-left: 6px;">
              <span style="font-size: 11px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase;">Sede:</span>
              <select class="select-input" id="dashBranchSelect" style="width: 260px; height: 28px; font-size: 11px;">
                <option value="all" ${branchKey === 'all' ? 'selected' : ''}>Todas las Sedes (Red Nacional - 10 CDs)</option>
                <option value="lima" ${branchKey === 'lima' ? 'selected' : ''}>Lima CDS Central (Av. Argentina)</option>
                <option value="callao" ${branchKey === 'callao' ? 'selected' : ''}>Callao Cross-Docking (Gambetta)</option>
                <option value="huachipa" ${branchKey === 'huachipa' ? 'selected' : ''}>Huachipa Hub Logístico (Prialé)</option>
                <option value="arequipa" ${branchKey === 'arequipa' ? 'selected' : ''}>Arequipa Industrial (Río Seco)</option>
                <option value="trujillo" ${branchKey === 'trujillo' ? 'selected' : ''}>Trujillo Norte (La Esperanza)</option>
              </select>
            </div>

            <!-- Selector de Familia -->
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="font-size: 11px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase;">Familia:</span>
              <select class="select-input" id="dashCategorySelect" style="width: 180px; height: 28px; font-size: 11px;">
                <option value="all" selected>Todas las 10 Familias</option>
                <option value="fasteners">Fijaciones y Pernos 🔩</option>
                <option value="tools">Herramientas Eléctricas ⚡</option>
                <option value="piping">Tuberías y Fluidos 🚰</option>
                <option value="abrasives">Abrasivos y Discos 🪚</option>
              </select>
            </div>
          </div>

          <div style="display: flex; gap: 8px;">
            <button class="btn btn-secondary" id="btnGoToBenchmark" style="height: 28px; font-size: 11px; padding: 0 12px; border-color: #0f62fe; color: #0f62fe;">
              Modelo Comparativo Q-Slotting 📊
            </button>
            <button class="btn btn-primary" id="btnGoToPlant" style="height: 28px; font-size: 11px; padding: 0 12px;">
              Ver Operación en Planta 👉
            </button>
          </div>
        </div>
      </div>

      <!-- NIVEL 2: CADENA CAUSAL DE VALOR (A5) -->
      <div class="causal-chain">
        <div class="causal-chip">
          <span class="causal-step-num">Paso 1 · Fricción Cuántica</span>
          <span class="causal-step-title">Costo QAP10</span>
          <span class="causal-step-val">${branch.costBase.toFixed(1)} ➔ ${branch.costIndex.toFixed(1)} pts</span>
          <span class="causal-step-sub">${branch.costIndexDelta} · Brecha 2.94% vs C*=340</span>
        </div>

        <div class="causal-arrow">➔</div>

        <div class="causal-chip">
          <span class="causal-step-num">Paso 2 · Reducción Física</span>
          <span class="causal-step-title">Caminata Evitada</span>
          <span class="causal-step-val">-${branch.dailyKmSavedPerOp.toFixed(1)} km / op / día</span>
          <span class="causal-step-sub">-28.4% fatiga · ${branch.dailyKmSaved.toFixed(1)} km/día red</span>
        </div>

        <div class="causal-arrow">➔</div>

        <div class="causal-chip">
          <span class="causal-step-num">Paso 3 · Productividad WMS</span>
          <span class="causal-step-title">Tiempo Liberado</span>
          <span class="causal-step-val">${branch.hoursLiberatedPerOp.toFixed(0)} min / turno</span>
          <span class="causal-step-sub">Neto tras +33 min en extracción</span>
        </div>

        <div class="causal-arrow">➔</div>

        <div class="causal-chip highlight">
          <span class="causal-step-num">Paso 4 · Impacto Financiero</span>
          <span class="causal-step-title">Ahorro Anualizado</span>
          <span class="causal-step-val">S/ ${(branch.annualSavingsPen / 1000).toFixed(0)} mil / año</span>
          <span class="causal-step-sub">ROI +${branch.roiPct.toFixed(1)}% · Payback 3.1 meses</span>
        </div>
      </div>

      <!-- NIVEL 2: HERO KPI + 4 TARJETAS SECUNDARIAS (B2, B3, A4, A3) -->
      <div style="display: grid; grid-template-columns: 1.4fr 1fr 1fr 1fr 1fr; gap: var(--spacing-md); margin-bottom: var(--spacing-lg);">
        
        <!-- HERO KPI: Ahorro Anualizado Proyectado -->
        <div class="panel" style="padding: 14px 16px; border-left: 4px solid var(--color-primary); background: linear-gradient(180deg, #ffffff 0%, #f8faff 100%);">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.4px;">
              Ahorro Anualizado
            </span>
            <span class="provenance-badge badge-provenance-projected">○ Proyectado</span>
          </div>
          <div style="margin: 6px 0 2px 0;">
            <span style="font-family: var(--font-mono); font-size: 26px; font-weight: 800; color: var(--color-primary);">
              S/ ${(branch.annualSavingsPen / 1000).toFixed(0)} mil / año
            </span>
          </div>
          <div style="display: flex; align-items: center; gap: 4px; font-size: 11px; color: var(--color-success); font-weight: 700;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"></polyline></svg>
            <span>+112.0% vs Meta (S/ 250 mil)</span>
          </div>
          <div style="font-size: 11px; color: var(--text-muted); margin-top: 6px; line-height: 1.3;">
            Rango: S/ 230 mil - S/ 310 mil · ROI <b>+${branch.roiPct.toFixed(1)}%</b>
          </div>
        </div>

        <!-- KPI SECUNDARIO 1: OTIF (Real) -->
        <div class="panel" style="padding: 14px 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.4px;">
              Cumplimiento OTIF
            </span>
            <span class="provenance-badge badge-provenance-real">● Real</span>
          </div>
          <div style="margin: 6px 0 2px 0;">
            <span style="font-family: var(--font-mono); font-size: 22px; font-weight: 800; color: var(--color-success);">
              ${branch.otifRate.toFixed(1)}%
            </span>
          </div>
          <div style="display: flex; align-items: center; gap: 4px; font-size: 11px; color: var(--color-success); font-weight: 600;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"></polyline></svg>
            <span>${branch.otifDelta} vs manual (94.2%)</span>
          </div>
          <div style="font-size: 11px; color: var(--text-muted); margin-top: 6px; line-height: 1.3;">
            Meta corporativa: ≥ 96.0% (Superada)
          </div>
        </div>

        <!-- KPI SECUNDARIO 2: Caminata Ahorrada (Simulado) -->
        <div class="panel" style="padding: 14px 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.4px;">
              Km Evitados / Op
            </span>
            <span class="provenance-badge badge-provenance-simulated">◐ Simulado</span>
          </div>
          <div style="margin: 6px 0 2px 0;">
            <span style="font-family: var(--font-mono); font-size: 22px; font-weight: 800; color: var(--color-primary);">
              ${branch.dailyKmSavedPerOp.toFixed(1)} km / día
            </span>
          </div>
          <div style="display: flex; align-items: center; gap: 4px; font-size: 11px; color: var(--color-success); font-weight: 600;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
            <span>-28.4% fatiga física</span>
          </div>
          <div style="font-size: 11px; color: var(--text-muted); margin-top: 6px; line-height: 1.3;">
            Total red: <b>${branch.dailyKmSaved.toFixed(1)} km evitados/día</b>
          </div>
        </div>

        <!-- KPI SECUNDARIO 3: Minutos Liberados (Simulado) -->
        <div class="panel" style="padding: 14px 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.4px;">
              Minutos Liberados
            </span>
            <span class="provenance-badge badge-provenance-simulated">◐ Simulado</span>
          </div>
          <div style="margin: 6px 0 2px 0;">
            <span style="font-family: var(--font-mono); font-size: 22px; font-weight: 800; color: var(--color-primary);">
              ${branch.hoursLiberatedPerOp.toFixed(0)} min / turno
            </span>
          </div>
          <div style="display: flex; align-items: center; gap: 4px; font-size: 11px; color: var(--color-success); font-weight: 600;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"></polyline></svg>
            <span>Neto tras +33 min extracción</span>
          </div>
          <div style="font-size: 11px; color: var(--text-muted); margin-top: 6px; line-height: 1.3;">
            Cero horas extras en cierre mensual
          </div>
        </div>

        <!-- KPI SECUNDARIO 4: Costo QAP Ponderado (Simulado) -->
        <div class="panel" style="padding: 14px 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.4px;">
              Costo QAP10
            </span>
            <span class="provenance-badge badge-provenance-simulated">◐ Simulado</span>
          </div>
          <div style="margin: 6px 0 2px 0;">
            <span style="font-family: var(--font-mono); font-size: 22px; font-weight: 800; color: var(--text-primary);">
              ${branch.costIndex.toFixed(1)} pts
            </span>
          </div>
          <div style="display: flex; align-items: center; gap: 4px; font-size: 11px; color: var(--color-success); font-weight: 600;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
            <span>${branch.costIndexDelta} vs base manual</span>
          </div>
          <div style="font-size: 11px; color: var(--text-muted); margin-top: 6px; line-height: 1.3;">
            MIPLIB C*=340.0 · Brecha: <b>2.94%</b>
          </div>
        </div>

      </div>

      <!-- NIVEL 3: EVIDENCIA VISUAL 1 & 2 (CORRECCIÓN H1 Y H2) -->
      <div style="display: grid; grid-template-columns: 1.3fr 1fr; gap: var(--spacing-lg); margin-bottom: var(--spacing-lg);">
        
        <!-- GRÁFICO RECONCILIADO 1: EVOLUCIÓN TEMPORAL RECONCILIADA (H1, A1, E1, Figura 8) -->
        <div class="panel">
          <div class="panel-header">
            <div>
              <div class="panel-title">
                El costo cae 24.9% tras el piloto y cruza la meta corporativa en la semana 6
              </div>
              <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">
                Semanas 1 a 8 · Línea Base Manual Plana (466.0) vs Curva Real Q-LNS · Reducción de 116 puntos
              </div>
            </div>
            <div class="panel-actions">
              <span class="provenance-badge badge-provenance-real">● Real</span>
            </div>
          </div>
          <div class="panel-body">
            <!-- Legend -->
            <div style="display: flex; justify-content: flex-end; gap: 16px; font-size: 10px; margin-bottom: 8px;">
              <span style="display: flex; align-items: center; gap: 5px;">
                <span style="width: 14px; height: 2px; border-top: 2px dashed #da1e28; display: inline-block;"></span>
                Línea Base Manual: 466.0 (Plana)
              </span>
              <span style="display: flex; align-items: center; gap: 5px;">
                <span style="width: 14px; height: 3px; background-color: #0f62fe; display: inline-block;"></span>
                Costo Real Q-LNS
              </span>
              <span style="display: flex; align-items: center; gap: 5px;">
                <span style="width: 14px; height: 2px; border-top: 2px dashed #198038; display: inline-block;"></span>
                Meta Corporativa: 360.0
              </span>
              <span style="display: flex; align-items: center; gap: 5px;">
                <span style="width: 10px; height: 10px; background-color: rgba(25, 128, 56, 0.18); border-radius: 2px; display: inline-block;"></span>
                Valor Creado (-24.9%)
              </span>
            </div>

            <!-- SVG Reconciled Line Chart (Figure 8 Specification) -->
            <div style="width: 100%; height: 220px;">
              <svg viewBox="0 0 620 210" width="100%" height="100%" style="overflow: visible;">
                <defs>
                  <linearGradient id="valueCreatedGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stop-color="#198038" stop-opacity="0.25"/>
                    <stop offset="100%" stop-color="#198038" stop-opacity="0.05"/>
                  </linearGradient>
                </defs>

                <!-- Grid Lines (Y: 500 -> Y=20, 450 -> Y=60, 400 -> Y=105, 350 -> Y=155) -->
                <line x1="55" y1="20" x2="590" y2="20" stroke="#f0f2f5" stroke-dasharray="2 2"/>
                <text x="45" y="24" fill="#9ca3af" font-size="10" text-anchor="end" font-family="monospace">500</text>

                <line x1="55" y1="60" x2="590" y2="60" stroke="#f0f2f5" stroke-dasharray="2 2"/>
                <text x="45" y="64" fill="#9ca3af" font-size="10" text-anchor="end" font-family="monospace">450</text>

                <line x1="55" y1="105" x2="590" y2="105" stroke="#f0f2f5" stroke-dasharray="2 2"/>
                <text x="45" y="109" fill="#9ca3af" font-size="10" text-anchor="end" font-family="monospace">400</text>

                <line x1="55" y1="155" x2="590" y2="155" stroke="#f0f2f5" stroke-dasharray="2 2"/>
                <text x="45" y="159" fill="#9ca3af" font-size="10" text-anchor="end" font-family="monospace">350</text>

                <!-- Area of Value Created between baseline 466 and curve -->
                <!-- 466 y-coord: 47px. Curve coords: (75,47) -> (145,47) -> (215,47) -> (285,123) -> (355,134) -> (425,143) -> (495,148) -> (565,150) -->
                <polygon points="215,47 285,123 355,134 425,143 495,148 565,150 565,47 215,47"
                         fill="url(#valueCreatedGrad)" />
                <text x="400" y="85" font-size="11" font-weight="700" fill="#198038" opacity="0.9" text-anchor="middle">
                  Área de Valor Creado (-24.9%, -116 pts)
                </text>

                <!-- Target Horizontal Line at 360 (Y = 141) -->
                <line x1="55" y1="141" x2="590" y2="141" stroke="#198038" stroke-width="1.5" stroke-dasharray="4 3"/>
                <text x="595" y="144" fill="#198038" font-size="9" font-weight="700">Meta (360.0)</text>

                <!-- FLAT HORIZONTAL BASELINE: 466.0 (Resolving H1 / Bug in original mock) -->
                <line x1="75" y1="47" x2="565" y2="47" stroke="#da1e28" stroke-width="2" stroke-dasharray="4 3"/>
                <text x="75" y="38" font-size="9" font-family="monospace" font-weight="700" fill="#da1e28">Línea Base Manual: 466.0</text>

                <!-- Vertical Marker for Week 4: Deployment of Pilot -->
                <line x1="285" y1="20" x2="285" y2="175" stroke="#0f62fe" stroke-width="1.5" stroke-dasharray="3 3"/>
                <text x="285" y="15" font-size="9" font-weight="700" fill="#0f62fe" text-anchor="middle">
                  Sem 4: Piloto Q-LNS
                </text>

                <!-- Crossing Target Marker at Week 6 -->
                <circle cx="425" cy="143" r="5" fill="#198038" stroke="#ffffff" stroke-width="1.5"/>
                <text x="425" y="132" font-size="9" font-weight="700" fill="#198038" text-anchor="middle">
                  Cruza meta corporativa
                </text>

                <!-- Actual Curve Line -->
                <path d="M 75 47 L 145 47 L 215 47 L 285 123 L 355 134 L 425 143 L 495 148 L 565 150" 
                      fill="none" stroke="#0f62fe" stroke-width="2.8"/>

                <!-- Points -->
                <circle cx="75" cy="47" r="3.5" fill="#525252"/>
                <circle cx="145" cy="47" r="3.5" fill="#525252"/>
                <circle cx="215" cy="47" r="3.5" fill="#525252"/>
                <circle cx="285" cy="123" r="4" fill="#0f62fe"/>
                <text x="285" y="117" font-size="9" font-family="monospace" fill="#0f62fe" font-weight="700" text-anchor="middle">380.0</text>

                <circle cx="355" cy="134" r="3.5" fill="#0f62fe"/>
                <text x="355" y="127" font-size="9" font-family="monospace" fill="#0f62fe" text-anchor="middle">368.0</text>

                <circle cx="425" cy="143" r="4" fill="#198038"/>
                <text x="425" y="159" font-size="9" font-family="monospace" fill="#198038" font-weight="700" text-anchor="middle">358.0</text>

                <circle cx="495" cy="148" r="3.5" fill="#198038"/>

                <!-- Final Point W8: 350.0 -->
                <circle cx="565" cy="150" r="5" fill="#198038" stroke="#ffffff" stroke-width="1.5"/>
                <text x="565" y="168" font-size="10" font-family="monospace" font-weight="800" fill="#198038" text-anchor="middle">
                  350.0 pts (-24.9%)
                </text>

                <!-- X Axis Labels -->
                <text x="75" y="190" font-size="10" fill="#6b7280" text-anchor="middle">Sem 1</text>
                <text x="145" y="190" font-size="10" fill="#6b7280" text-anchor="middle">Sem 2</text>
                <text x="215" y="190" font-size="10" fill="#6b7280" text-anchor="middle">Sem 3</text>
                <text x="285" y="190" font-size="10" fill="#0f62fe" font-weight="700" text-anchor="middle">Sem 4 (Piloto)</text>
                <text x="355" y="190" font-size="10" fill="#6b7280" text-anchor="middle">Sem 5</text>
                <text x="425" y="190" font-size="10" fill="#198038" font-weight="700" text-anchor="middle">Sem 6</text>
                <text x="495" y="190" font-size="10" fill="#6b7280" text-anchor="middle">Sem 7</text>
                <text x="565" y="190" font-size="10" fill="#198038" font-weight="800" text-anchor="middle">Sem 8 (Actual)</text>
              </svg>
            </div>
          </div>
        </div>

        <!-- GRÁFICO RECONCILIADO 2: CICLO DE PICKING CON ESCALA ABSOLUTA EN MINUTOS (H2, A2) -->
        <div class="panel">
          <div class="panel-header">
            <div>
              <div class="panel-title">
                Desglose Absoluto del Ciclo de Picking (Turno 480 min)
              </div>
              <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">
                Escala idéntica de 8 horas: 58 min liberados por reconfiguración de bahías
              </div>
            </div>
            <div class="panel-actions">
              <span class="provenance-badge badge-provenance-real">● Real WMS</span>
            </div>
          </div>
          <div class="panel-body">
            
            <!-- Barra 1: Escenario Manual (480 min totales) -->
            <div style="margin-bottom: 14px;">
              <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 4px;">
                <span style="font-weight: 700; color: #da1e28;">ESCENARIO MANUAL ANTERIOR:</span>
                <span style="font-family: monospace; font-weight: 700;">480 min (100% jornada)</span>
              </div>
              <div style="display: flex; height: 18px; border-radius: 3px; overflow: hidden; background: #e5e7eb; border: 1px solid var(--border-color);">
                <div style="width: 44.0%; background-color: #da1e28; color: white; font-size: 9px; font-weight: 700; display: flex; align-items: center; justify-content: center;" title="Traslado: 211 min (44%)">
                  211 min Traslado
                </div>
                <div style="width: 17.9%; background-color: #f1c21b; color: #433300; font-size: 9px; font-weight: 700; display: flex; align-items: center; justify-content: center;" title="Búsqueda: 86 min (18%)">
                  86m Búsq.
                </div>
                <div style="width: 24.0%; background-color: #0f62fe; color: white; font-size: 9px; font-weight: 700; display: flex; align-items: center; justify-content: center;" title="Extracción: 115 min (24%)">
                  115m Extr.
                </div>
                <div style="width: 14.1%; background-color: #6929c4; color: white; font-size: 9px; font-weight: 700; display: flex; align-items: center; justify-content: center;" title="Empaque: 68 min (14%)">
                  68m Emp.
                </div>
              </div>
            </div>

            <!-- Barra 2: Escenario Actual Q-LNS con segmento liberado a escala -->
            <div style="margin-bottom: 14px;">
              <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 4px;">
                <span style="font-weight: 700; color: #0f62fe;">ESCENARIO ACTUAL CON Q-LNS:</span>
                <span style="font-family: monospace; font-weight: 700; color: #198038;">422 min + 58 min liberados</span>
              </div>
              <div style="display: flex; height: 18px; border-radius: 3px; overflow: hidden; background: #e5e7eb; border: 1px solid var(--border-color);">
                <div style="width: 22.9%; background-color: #10b981; color: white; font-size: 9px; font-weight: 700; display: flex; align-items: center; justify-content: center;" title="Traslado Reducido: 110 min (23%)">
                  110m (-101m)
                </div>
                <div style="width: 15.0%; background-color: #f1c21b; color: #433300; font-size: 9px; font-weight: 700; display: flex; align-items: center; justify-content: center;" title="Búsqueda: 72 min (15%)">
                  72m
                </div>
                <div style="width: 30.8%; background-color: #0f62fe; color: white; font-size: 9px; font-weight: 700; display: flex; align-items: center; justify-content: center;" title="Extracción de Valor: 148 min (31%)">
                  148m (+33m valor)
                </div>
                <div style="width: 19.2%; background-color: #6929c4; color: white; font-size: 9px; font-weight: 700; display: flex; align-items: center; justify-content: center;" title="Empaque y Calidad: 92 min (19%)">
                  92m (+24m)
                </div>
                <!-- Segmento Liberado (Rayado diagonal verde) -->
                <div class="hatched-liberated" style="width: 12.1%; font-size: 9px; display: flex; align-items: center; justify-content: center; border-left: 1px solid #198038;" title="Tiempo Neto Liberado: 58 min (12%)">
                  58m
                </div>
              </div>
            </div>

            <!-- Tabla de Deltas Exactos -->
            <div style="background: var(--bg-subtle); border: 1px solid var(--border-subtle); border-radius: 4px; padding: 8px 10px; font-size: 11px;">
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="color: var(--text-muted); font-size: 10px; text-transform: uppercase;">
                    <th style="text-align: left; padding: 2px 4px;">Actividad de Picking</th>
                    <th style="text-align: right; padding: 2px 4px;">Manual</th>
                    <th style="text-align: right; padding: 2px 4px;">Q-LNS</th>
                    <th style="text-align: right; padding: 2px 4px;">Delta Neto</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 3px 4px;">🚶 <b>Traslado pasillos</b></td>
                    <td style="text-align: right; font-family: monospace;">211 min</td>
                    <td style="text-align: right; font-family: monospace; color: #10b981; font-weight: 700;">110 min</td>
                    <td style="text-align: right; font-family: monospace; color: #198038; font-weight: 700;">-101 min (-48%)</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 3px 4px;">🔍 <b>Búsqueda SKU</b></td>
                    <td style="text-align: right; font-family: monospace;">86 min</td>
                    <td style="text-align: right; font-family: monospace;">72 min</td>
                    <td style="text-align: right; font-family: monospace; color: #198038;">-14 min (-16%)</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 3px 4px;">📦 <b>Extracción física</b></td>
                    <td style="text-align: right; font-family: monospace;">115 min</td>
                    <td style="text-align: right; font-family: monospace; color: #0f62fe; font-weight: 700;">148 min</td>
                    <td style="text-align: right; font-family: monospace; color: #0f62fe; font-weight: 700;">+33 min (+29%)</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 3px 4px;">🏷️ <b>Empaque y OTIF</b></td>
                    <td style="text-align: right; font-family: monospace;">68 min</td>
                    <td style="text-align: right; font-family: monospace; color: #6929c4; font-weight: 700;">92 min</td>
                    <td style="text-align: right; font-family: monospace; color: #6929c4; font-weight: 700;">+24 min (+35%)</td>
                  </tr>
                  <tr style="font-weight: 700; background: #eefcf0;">
                    <td style="padding: 4px 4px; color: #198038;">✨ <b>TIEMPO LIBERADO</b></td>
                    <td style="text-align: right; font-family: monospace;">480 min</td>
                    <td style="text-align: right; font-family: monospace; color: #198038;">422 min</td>
                    <td style="text-align: right; font-family: monospace; color: #198038; font-weight: 800;">-58 min / turno</td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>
        </div>

      </div>

      <!-- NIVEL 3: GRÁFICO 3 & 4 (WATERFALL DE AHORROS Y COMPARATIVA DUMBBELL) -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-lg); margin-bottom: var(--spacing-lg);">
        
        <!-- GRÁFICO 3: WATERFALL DE AHORROS MENSUALES (D1, Figura 6) -->
        <div class="panel">
          <div class="panel-header">
            <div>
              <div class="panel-title">
                Puente Financiero: Fuentes de Captura de Valor (Waterfall)
              </div>
              <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">
                Desglose auditado del ahorro mensual consolidado de S/ 23,333 / mes (S/ 280,000 / año)
              </div>
            </div>
            <div class="panel-actions">
              <span class="provenance-badge badge-provenance-projected">○ Proyectado</span>
            </div>
          </div>
          <div class="panel-body">
            <!-- SVG Waterfall Chart (Figure 6) -->
            <div style="width: 100%; height: 210px;">
              <svg viewBox="0 0 520 190" width="100%" height="100%" style="overflow: visible;">
                <!-- Axis Line -->
                <line x1="40" y1="150" x2="490" y2="150" stroke="#d1d5db" stroke-width="1.5"/>

                <!-- Bar 1: Mano de Obra Liberada (+8.0k) -> Y=150 to Y=100 (height 50) -->
                <rect x="50" y="100" width="55" height="50" fill="#0f62fe" rx="2"/>
                <text x="77" y="93" font-size="10" font-family="monospace" font-weight="700" fill="#0f62fe" text-anchor="middle">+S/ 8.0k</text>
                <text x="77" y="165" font-size="9" fill="#4b5563" text-anchor="middle">Mano Obra</text>

                <!-- Connector 1 -->
                <line x1="105" y1="100" x2="125" y2="100" stroke="#9ca3af" stroke-dasharray="2 2"/>

                <!-- Bar 2: Horas Extra Evitadas (+5.5k) -> Y=100 to Y=65 (height 35) -->
                <rect x="125" y="65" width="55" height="35" fill="#0f62fe" rx="2"/>
                <text x="152" y="58" font-size="10" font-family="monospace" font-weight="700" fill="#0f62fe" text-anchor="middle">+S/ 5.5k</text>
                <text x="152" y="165" font-size="9" fill="#4b5563" text-anchor="middle">Horas Extra</text>

                <!-- Connector 2 -->
                <line x1="180" y1="65" x2="200" y2="65" stroke="#9ca3af" stroke-dasharray="2 2"/>

                <!-- Bar 3: Penalidades OTIF (+4.8k) -> Y=65 to Y=35 (height 30) -->
                <rect x="200" y="35" width="55" height="30" fill="#0f62fe" rx="2"/>
                <text x="227" y="28" font-size="10" font-family="monospace" font-weight="700" fill="#0f62fe" text-anchor="middle">+S/ 4.8k</text>
                <text x="227" y="165" font-size="9" fill="#4b5563" text-anchor="middle">Multas OTIF</text>

                <!-- Connector 3 -->
                <line x1="255" y1="35" x2="275" y2="35" stroke="#9ca3af" stroke-dasharray="2 2"/>

                <!-- Bar 4: Menos Mermas (+3.2k) -> Y=35 to Y=15 (height 20) -->
                <rect x="275" y="15" width="55" height="20" fill="#0f62fe" rx="2"/>
                <text x="302" y="9" font-size="10" font-family="monospace" font-weight="700" fill="#0f62fe" text-anchor="middle">+S/ 3.2k</text>
                <text x="302" y="165" font-size="9" fill="#4b5563" text-anchor="middle">Mermas</text>

                <!-- Connector 4 -->
                <line x1="330" y1="15" x2="350" y2="15" stroke="#9ca3af" stroke-dasharray="2 2"/>

                <!-- Bar 5: Salud / Ausentismo (+1.8k) -> Y=15 to Y=4 (height 11) -->
                <rect x="350" y="4" width="55" height="11" fill="#0f62fe" rx="2"/>
                <text x="377" y="-2" font-size="9" font-family="monospace" font-weight="700" fill="#0f62fe" text-anchor="middle">+S/ 1.8k</text>
                <text x="377" y="165" font-size="9" fill="#4b5563" text-anchor="middle">Salud / SST</text>

                <!-- Final Total Bar: S/ 23.3k -> Y=150 to Y=4 (height 146) -->
                <rect x="425" y="4" width="65" height="146" fill="#198038" rx="2"/>
                <text x="457" y="-3" font-size="11" font-family="monospace" font-weight="800" fill="#198038" text-anchor="middle">S/ 23.3k / mes</text>
                <text x="457" y="165" font-size="9" font-weight="700" fill="#198038" text-anchor="middle">Total Mensual</text>
              </svg>
            </div>
            <div style="font-size: 11px; color: var(--text-muted); text-align: center; margin-top: 4px;">
              Acumulado Anual: <b>S/ 280,000 / año</b> · Retorno sobre Inversión (CAPEX S/ 66k): <b>+321.8%</b>
            </div>
          </div>
        </div>

        <!-- GRÁFICO 4: DUMBBELL COMPARATIVO POR SEDES (E2, Figura 9) -->
        <div class="panel">
          <div class="panel-header">
            <div>
              <div class="panel-title">
                Comparativa por Sedes: Costo Inicial vs Optimizado (Dumbbell)
              </div>
              <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">
                Los 5 centros principales superan la meta de 360.0 puntos ponderados
              </div>
            </div>
            <div class="panel-actions">
              <span class="provenance-badge badge-provenance-simulated">◐ Simulado</span>
            </div>
          </div>
          <div class="panel-body">
            <!-- SVG Dumbbell Chart (Figure 9 Specification) -->
            <div style="width: 100%; height: 210px;">
              <svg viewBox="0 0 520 190" width="100%" height="100%" style="overflow: visible;">
                <!-- Target Reference Line at 360 (X = 220) -->
                <line x1="220" y1="10" x2="220" y2="165" stroke="#198038" stroke-width="1.5" stroke-dasharray="3 3"/>
                <text x="220" y="8" font-size="9" font-weight="700" fill="#198038" text-anchor="middle">Meta: 360.0</text>

                <!-- Mapping: 320 -> X=150, 360 -> X=220, 480 -> X=440 (Scale: ~1.8px per unit) -->
                <!-- Lima CDS: 466 (X=414) -> 340 (X=184) -->
                <text x="115" y="32" font-size="10" font-weight="700" fill="#374151" text-anchor="end">Lima CDS Central</text>
                <line x1="184" y1="28" x2="414" y2="28" stroke="#cbd5e1" stroke-width="3"/>
                <circle cx="414" cy="28" r="5" fill="#da1e28" opacity="0.6"/>
                <circle cx="184" cy="28" r="6" fill="#0f62fe"/>
                <text x="175" y="32" font-size="9" font-family="monospace" font-weight="700" fill="#0f62fe" text-anchor="end">340 (-27%)</text>

                <!-- Callao: 475 (X=430) -> 346 (X=195) -->
                <text x="115" y="58" font-size="10" font-weight="700" fill="#374151" text-anchor="end">Callao Docking</text>
                <line x1="195" y1="54" x2="430" y2="54" stroke="#cbd5e1" stroke-width="3"/>
                <circle cx="430" cy="54" r="5" fill="#da1e28" opacity="0.6"/>
                <circle cx="195" cy="54" r="6" fill="#0f62fe"/>
                <text x="186" y="58" font-size="9" font-family="monospace" font-weight="700" fill="#0f62fe" text-anchor="end">346 (-27%)</text>

                <!-- Huachipa: 460 (X=403) -> 352 (X=206) -->
                <text x="115" y="84" font-size="10" font-weight="700" fill="#374151" text-anchor="end">Huachipa Hub</text>
                <line x1="206" y1="80" x2="403" y2="80" stroke="#cbd5e1" stroke-width="3"/>
                <circle cx="403" cy="80" r="5" fill="#da1e28" opacity="0.6"/>
                <circle cx="206" cy="80" r="6" fill="#0f62fe"/>
                <text x="197" y="84" font-size="9" font-family="monospace" font-weight="700" fill="#0f62fe" text-anchor="end">352 (-23%)</text>

                <!-- Trujillo: 470 (X=421) -> 354 (X=209) -->
                <text x="115" y="110" font-size="10" font-weight="700" fill="#374151" text-anchor="end">Trujillo Norte</text>
                <line x1="209" y1="106" x2="421" y2="106" stroke="#cbd5e1" stroke-width="3"/>
                <circle cx="421" cy="106" r="5" fill="#da1e28" opacity="0.6"/>
                <circle cx="209" cy="106" r="6" fill="#0f62fe"/>
                <text x="200" y="110" font-size="9" font-family="monospace" font-weight="700" fill="#0f62fe" text-anchor="end">354 (-25%)</text>

                <!-- Arequipa: 480 (X=440) -> 355 (X=211) -->
                <text x="115" y="136" font-size="10" font-weight="700" fill="#374151" text-anchor="end">Arequipa Hub</text>
                <line x1="211" y1="132" x2="440" y2="132" stroke="#cbd5e1" stroke-width="3"/>
                <circle cx="440" cy="132" r="5" fill="#da1e28" opacity="0.6"/>
                <circle cx="211" cy="132" r="6" fill="#0f62fe"/>
                <text x="202" y="136" font-size="9" font-family="monospace" font-weight="700" fill="#0f62fe" text-anchor="end">355 (-26%)</text>

                <!-- Promedio Red: 466 (X=414) -> 350 (X=202) -->
                <text x="115" y="162" font-size="10" font-weight="800" fill="#198038" text-anchor="end">Red Nacional (10 CDs)</text>
                <line x1="202" y1="158" x2="414" y2="158" stroke="#198038" stroke-width="4"/>
                <circle cx="414" cy="158" r="5" fill="#da1e28" opacity="0.8"/>
                <circle cx="202" cy="158" r="7" fill="#198038"/>
                <text x="193" y="162" font-size="9" font-family="monospace" font-weight="800" fill="#198038" text-anchor="end">350.0 (-24.9%)</text>
              </svg>
            </div>
            <div style="display: flex; justify-content: center; gap: 24px; font-size: 10px; margin-top: 4px;">
              <span style="display: flex; align-items: center; gap: 4px;"><span style="width: 8px; height: 8px; background: #da1e28; opacity: 0.6; border-radius: 50%;"></span> Costo Previo Manual</span>
              <span style="display: flex; align-items: center; gap: 4px;"><span style="width: 8px; height: 8px; background: #0f62fe; border-radius: 50%;"></span> Optimizado Q-LNS</span>
              <span style="display: flex; align-items: center; gap: 4px;"><span style="width: 12px; height: 2px; border-top: 2px dashed #198038;"></span> Meta Red (360.0)</span>
            </div>
          </div>
        </div>

      </div>

      <!-- SECCIÓN 5: BULLET CHARTS DE METAS CORPORATIVAS (D4, Figura 7) -->
      <div class="panel" style="margin-bottom: var(--spacing-lg);">
        <div class="panel-header">
          <div>
            <div class="panel-title">
              Cumplimiento de Metas Estratégicas 2026 (Bullet Charts)
            </div>
            <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">
              Monitoreo ejecutivo de objetivos con bandas de tolerancia y marcadores de target
            </div>
          </div>
          <div class="panel-actions">
            <span class="kpi-badge badge-success">4 de 4 Objetivos Superados</span>
          </div>
        </div>
        <div class="panel-body">
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;">
            
            <!-- Bullet 1: Ahorro Financiero -->
            <div style="background: var(--bg-subtle); padding: 10px; border-radius: 4px; border: 1px solid var(--border-subtle);">
              <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 2px;">
                <span style="font-weight: 700;">Ahorro Financiero Red</span>
                <span style="font-weight: 800; color: #198038;">112.0%</span>
              </div>
              <div style="font-size: 10px; color: var(--text-muted); margin-bottom: 6px;">
                Real: <b>S/ 280 mil</b> (Meta: S/ 250 mil)
              </div>
              <!-- Bullet Bar -->
              <div style="position: relative; width: 100%; height: 14px; background: #e5e7eb; border-radius: 2px; overflow: hidden;">
                <div style="position: absolute; left: 0; top: 0; width: 60%; height: 100%; background: #fee2e2;"></div>
                <div style="position: absolute; left: 60%; top: 0; width: 30%; height: 100%; background: #fef3c7;"></div>
                <div style="position: absolute; left: 90%; top: 0; width: 10%; height: 100%; background: #dcfce7;"></div>
                <!-- Actual Value Bar (112% normalized) -->
                <div style="position: absolute; left: 0; top: 3px; width: 100%; height: 8px; background: #198038; border-radius: 2px;"></div>
              </div>
            </div>

            <!-- Bullet 2: Caminata Evitada -->
            <div style="background: var(--bg-subtle); padding: 10px; border-radius: 4px; border: 1px solid var(--border-subtle);">
              <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 2px;">
                <span style="font-weight: 700;">Caminata Ahorrada</span>
                <span style="font-weight: 800; color: #198038;">120.0%</span>
              </div>
              <div style="font-size: 10px; color: var(--text-muted); margin-bottom: 6px;">
                Real: <b>4.2 km/op</b> (Meta: 3.5 km/op)
              </div>
              <!-- Bullet Bar -->
              <div style="position: relative; width: 100%; height: 14px; background: #e5e7eb; border-radius: 2px; overflow: hidden;">
                <div style="position: absolute; left: 0; top: 0; width: 60%; height: 100%; background: #fee2e2;"></div>
                <div style="position: absolute; left: 60%; top: 0; width: 25%; height: 100%; background: #fef3c7;"></div>
                <div style="position: absolute; left: 85%; top: 0; width: 15%; height: 100%; background: #dcfce7;"></div>
                <div style="position: absolute; left: 0; top: 3px; width: 100%; height: 8px; background: #198038; border-radius: 2px;"></div>
              </div>
            </div>

            <!-- Bullet 3: Cumplimiento OTIF -->
            <div style="background: var(--bg-subtle); padding: 10px; border-radius: 4px; border: 1px solid var(--border-subtle);">
              <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 2px;">
                <span style="font-weight: 700;">Cumplimiento OTIF</span>
                <span style="font-weight: 800; color: #198038;">102.5%</span>
              </div>
              <div style="font-size: 10px; color: var(--text-muted); margin-bottom: 6px;">
                Real: <b>98.4%</b> (Meta: ≥ 96.0%)
              </div>
              <!-- Bullet Bar -->
              <div style="position: relative; width: 100%; height: 14px; background: #e5e7eb; border-radius: 2px; overflow: hidden;">
                <div style="position: absolute; left: 0; top: 0; width: 70%; height: 100%; background: #fee2e2;"></div>
                <div style="position: absolute; left: 70%; top: 0; width: 25%; height: 100%; background: #fef3c7;"></div>
                <div style="position: absolute; left: 95%; top: 0; width: 5%; height: 100%; background: #dcfce7;"></div>
                <div style="position: absolute; left: 0; top: 3px; width: 98.4%; height: 8px; background: #0f62fe; border-radius: 2px;"></div>
              </div>
            </div>

            <!-- Bullet 4: Brecha Cuántica Gap -->
            <div style="background: var(--bg-subtle); padding: 10px; border-radius: 4px; border: 1px solid var(--border-subtle);">
              <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 2px;">
                <span style="font-weight: 700;">Brecha Algorítmica</span>
                <span style="font-weight: 800; color: #198038;">Excelente (2.94%)</span>
              </div>
              <div style="font-size: 10px; color: var(--text-muted); margin-bottom: 6px;">
                Gap: <b>2.94%</b> (Cota de tolerancia: ≤ 5.0%)
              </div>
              <!-- Bullet Bar (Inverted) -->
              <div style="position: relative; width: 100%; height: 14px; background: #e5e7eb; border-radius: 2px; overflow: hidden;">
                <div style="position: absolute; left: 0; top: 0; width: 50%; height: 100%; background: #dcfce7;"></div>
                <div style="position: absolute; left: 50%; top: 0; width: 30%; height: 100%; background: #fef3c7;"></div>
                <div style="position: absolute; left: 80%; top: 0; width: 20%; height: 100%; background: #fee2e2;"></div>
                <div style="position: absolute; left: 0; top: 3px; width: 45%; height: 8px; background: #198038; border-radius: 2px;"></div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <!-- NIVEL 4: FRANJA DE CONFIANZA TÉCNICA Y EVIDENCIA CUÁNTICA IBM (B2, C1, C2, C7) -->
      <div class="confidence-strip">
        <span class="conf-chip">
          <span>📐 Brecha vs C*=340:</span>
          <b>2.94% (Certificado MIPLIB)</b>
        </span>
        <span class="conf-chip">
          <span>🔒 Factibilidad:</span>
          <b style="color: #198038;">100% Biunívoco (Filtro Húngaro)</b>
        </span>
        <span class="conf-chip conf-chip-quantum">
          <span>⚛️ QPU Activo:</span>
          <b>IBM Quantum ibm_fez (156q Heron · 140 CZ Gates)</b>
        </span>
        <span class="conf-chip">
          <span>🔁 Reproducibilidad:</span>
          <b>Seed=42 · Qiskit 2.6.1 Aer · Python 3.12</b>
        </span>
      </div>

      <!-- PIPELINE HÍBRIDO DE 8 PASOS (C1) -->
      <div class="panel" style="margin-bottom: var(--spacing-lg);">
        <div class="panel-header">
          <div>
            <div class="panel-title">
              Arquitectura del Pipeline Híbrido Q-LNS en 8 Fases Auditables
            </div>
            <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">
              Partición clásica del espacio combinatorio acoplada a ansatz QAOA en Qiskit y decodificación determinista
            </div>
          </div>
          <div class="panel-actions">
            <span style="font-size: 10px; display: flex; align-items: center; gap: 8px;">
              <span style="display: flex; align-items: center; gap: 4px;"><span style="width: 8px; height: 8px; background: #0f62fe; border-radius: 2px;"></span> Clásico</span>
              <span style="display: flex; align-items: center; gap: 4px;"><span style="width: 8px; height: 8px; background: #8a3ffc; border-radius: 2px;"></span> Cuántico</span>
            </span>
          </div>
        </div>
        <div class="panel-body">
          <div class="pipeline-grid">
            <div class="pipeline-step pipeline-classical">
              <span class="p-num">Fase 1</span>
              <span class="p-title">MPS Parser</span>
              <span>Lectura qap10.mps</span>
            </div>
            <div class="pipeline-step pipeline-classical">
              <span class="p-num">Fase 2</span>
              <span class="p-title">Matrices F & D</span>
              <span>100% Coincidencia</span>
            </div>
            <div class="pipeline-step pipeline-classical">
              <span class="p-num">Fase 3</span>
              <span class="p-title">Partición LNS</span>
              <span>K=3 Vecindario (9q)</span>
            </div>
            <div class="pipeline-step pipeline-quantum">
              <span class="p-num">Fase 4</span>
              <span class="p-title">Ising QUBO</span>
              <span>SparsePauliOp (λ=60)</span>
            </div>
            <div class="pipeline-step pipeline-quantum">
              <span class="p-num">Fase 5</span>
              <span class="p-title">QAOA p=1</span>
              <span>Ansatz Alternante</span>
            </div>
            <div class="pipeline-step pipeline-quantum">
              <span class="p-num">Fase 6</span>
              <span class="p-title">QPU / Aer</span>
              <span>1,024 Shots Muestreo</span>
            </div>
            <div class="pipeline-step pipeline-classical">
              <span class="p-num">Fase 7</span>
              <span class="p-title">Filtro Húngaro</span>
              <span>100% Factibilidad</span>
            </div>
            <div class="pipeline-step pipeline-classical">
              <span class="p-num">Fase 8</span>
              <span class="p-title">WMS Sync</span>
              <span>Layout 350.0 pts</span>
            </div>
          </div>
        </div>
      </div>

      <!-- HONESTIDAD CUÁNTICA: QUÉ AFIRMAMOS / QUÉ NO AFIRMAMOS (C7) -->
      <div class="panel" style="margin-bottom: var(--spacing-lg);">
        <div class="panel-header">
          <div class="panel-title">
            Transparencia Tecnológica y Postura Científica NISQ (Auditoría Técnica)
          </div>
          <div class="panel-actions">
            <span class="kpi-badge badge-info">Criterio McKinsey / IBM Quantum</span>
          </div>
        </div>
        <div class="panel-body">
          <div class="claim-grid">
            <div class="claim-card affirm">
              <div style="font-weight: 800; font-size: 12px; margin-bottom: 6px; display: flex; align-items: center; gap: 5px;">
                <span>✅ QUÉ AFIRMAMOS (HECHOS VERIFICABLES):</span>
              </div>
              <ul style="font-size: 11px; line-height: 1.5; margin: 0; padding-left: 18px;">
                <li><b>Arquitectura Híbrida Pragmática:</b> Q-LNS reduce el espacio combinatorio de 100 cúbits a sub-problemas de 9 cúbits (8.0 KiB RAM), haciéndolo perfectamente ejecutable en simuladores y QPUs NISQ.</li>
                <li><b>Rendimiento Probado:</b> Converge a costo factible de 350.0 pts (gap de 2.94% frente a la cota óptima MIPLIB de 340.0 pts).</li>
                <li><b>Garantía de Factibilidad:</b> El Algoritmo Húngaro asegura 100% de cumplimiento biunívoco (cero bahías vacías ni solapamientos).</li>
                <li><b>Hardware Real IBM:</b> Circuito compilado y validado en la nube cuántica de IBM (<code>ibm_fez</code> Heron 156q con compuertas nativas CZ).</li>
                <li><b>Impacto Financiero:</b> S/ 280,000 / año de beneficio neto auditable y 4.2 km de caminata evitada diaria por operario.</li>
              </ul>
            </div>

            <div class="claim-card deny">
              <div style="font-weight: 800; font-size: 12px; margin-bottom: 6px; display: flex; align-items: center; gap: 5px;">
                <span>❌ QUÉ NO AFIRMAMOS (LÍMITES NISQ REALES):</span>
              </div>
              <ul style="font-size: 11px; line-height: 1.5; margin: 0; padding-left: 18px;">
                <li><b>NO Supremacía Cuántica Absoluta:</b> En la era NISQ actual, ningún hardware cuántico supera en tiempo bruto a solvers clásicos comerciales (CPLEX/Gurobi) para problemas de miles de variables continuas.</li>
                <li><b>NO Simulación Monolítica de 100 cúbits:</b> Simular 100 cúbits de golpe exigiría 2×10³¹ bytes de RAM (más de 20 millones de Yottabytes), superando toda la memoria del planeta.</li>
                <li><b>NO Dependencia Exclusiva del QPU:</b> Los algoritmos cuánticos puros sin filtrado clásico violan restricciones de permutación debido al ruido físico. NODUX blinda el resultado mediante decodificación bipartita.</li>
                <li><b>Ventaja Estratégica:</b> La solución prepara la infraestructura de software de las empresas peruanas para la Utilidad Cuántica real sin esperar décadas.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- TABLA DE TRAZABILIDAD OPERATIVA POR CENTRO DE DISTRIBUCIÓN -->
      <div class="panel">
        <div class="panel-header">
          <div class="panel-title">
            Trazabilidad Operativa y Desempeño por Centro de Distribución
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
                <th class="center-cell">Acción</th>
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

    // Go to Benchmark Model Button
    const btnGoToBenchmark = container.querySelector("#btnGoToBenchmark");
    if (btnGoToBenchmark) {
      btnGoToBenchmark.addEventListener("click", () => {
        const tabBtn = document.querySelector(`.nav-tab[data-tab="telemetry"]`);
        if (tabBtn) tabBtn.click();
      });
    }

    // Export Button
    const btnExport = container.querySelector("#btnExportDash");
    if (btnExport) {
      btnExport.addEventListener("click", () => {
        const csvContent = "data:text/csv;charset=utf-8," + 
          "Sede,Region,OTIF,Costo_QAP,Ahorro_Anual_PEN,ROI_Pct\n" +
          "Lima Central,Lima,99.2%,340.0,32000.0,384.8%\n" +
          "Callao,Callao,98.8%,346.0,30000.0,354.5%\n" +
          "Huachipa,Lima Este,97.9%,352.0,26000.0,293.9%\n" +
          "Arequipa,Arequipa,97.6%,355.0,25400.0,284.8%\n" +
          "Trujillo,La Libertad,98.1%,354.0,26000.0,293.9%\n" +
          "Red Total Nacional,Peru,98.4%,350.0,280000.0,321.8%\n";
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
