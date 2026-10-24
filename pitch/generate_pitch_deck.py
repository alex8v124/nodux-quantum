"""
Automated PowerPoint Generator for Hackathon Final Pitch Deck.
Creates a professional, branded 7-slide PPTX deck for NODUX Core Team.
Theme: NTT DATA & IBM Qiskit Aesthetics.
"""

import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

def create_deck(output_path: str = "pitch/NODUX_Pitch_Deck_QAP10_NTT_DATA.pptx"):
    prs = Presentation()
    # 16:9 widescreen layout
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)

    # Palette
    C_NAVY = RGBColor(10, 37, 64)       # Deep Navy
    C_BLUE = RGBColor(0, 114, 206)      # Tech Blue
    C_CYAN = RGBColor(0, 180, 216)      # Cyan / Quantum
    C_WHITE = RGBColor(255, 255, 255)
    C_DARK = RGBColor(30, 41, 59)       # Slate text
    C_LIGHT_BG = RGBColor(248, 250, 252)
    C_GREEN = RGBColor(16, 185, 129)    # Emerald ROI

    def add_header(slide, title_text, category_text="NODUX • IBM QUANTUM HACKATHON 2026 | RETO NTT DATA"):
        # Top banner
        header_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(11.7), Inches(1.1))
        tf = header_box.text_frame
        tf.word_wrap = True
        p_cat = tf.paragraphs[0]
        p_cat.text = category_text.upper()
        p_cat.font.size = Pt(11)
        p_cat.font.bold = True
        p_cat.font.color.rgb = C_CYAN

        p_title = tf.add_paragraph()
        p_title.text = title_text
        p_title.font.size = Pt(24)
        p_title.font.bold = True
        p_title.font.color.rgb = C_NAVY

    # ==================== SLIDE 1: PORTADA ====================
    slide_layout = prs.slide_layouts[6] # Blank
    s1 = prs.slides.add_slide(slide_layout)
    bg1 = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
    bg1.fill.solid()
    bg1.fill.fore_color.rgb = C_NAVY
    bg1.line.color.rgb = C_NAVY

    tb1 = s1.shapes.add_textbox(Inches(1.0), Inches(1.6), Inches(11.3), Inches(4.5))
    tf1 = tb1.text_frame
    tf1.word_wrap = True

    p0 = tf1.paragraphs[0]
    p0.text = "NODUX • QISKIT FALL FEST LIMA 2026 · RETO INDUSTRIA NTT DATA"
    p0.font.size = Pt(14)
    p0.font.bold = True
    p0.font.color.rgb = C_CYAN

    p1 = tf1.add_paragraph()
    p1.text = "NODUX QAP10"
    p1.font.size = Pt(46)
    p1.font.bold = True
    p1.font.color.rgb = C_WHITE

    p2 = tf1.add_paragraph()
    p2.text = "Optimización Cuántica e Híbrida de un Problema de Asignación Cuadrática (MIPLIB qap10)"
    p2.font.size = Pt(20)
    p2.font.color.rgb = RGBColor(226, 232, 240)

    p3 = tf1.add_paragraph()
    p3.text = "\n★ JUGADA DE BONIFICACIÓN: Optimización de Almacén B2B y Picking de Alta Rotación (+10 PTS)"
    p3.font.size = Pt(15)
    p3.font.bold = True
    p3.font.color.rgb = C_GREEN

    p4 = tf1.add_paragraph()
    p4.text = "Célula: Nicolás López (CEO) · Alexander Miranda (CTO) · Walter Carpio (Data & BI) · Jesús Regalado (COO)"
    p4.font.size = Pt(13)
    p4.font.color.rgb = RGBColor(148, 163, 184)

    # ==================== SLIDE 2: EL PROBLEMA ====================
    s2 = prs.slides.add_slide(slide_layout)
    add_header(s2, "1. El Reto: Asignación B2B y el Problema QAP10")

    tb2_left = s2.shapes.add_textbox(Inches(0.8), Inches(1.7), Inches(5.6), Inches(5.0))
    tf2_l = tb2_left.text_frame
    tf2_l.word_wrap = True

    p = tf2_l.paragraphs[0]
    p.text = "El Desafío MIPLIB qap10 (NP-Hard)"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = C_BLUE

    bullets = [
        ("Espacio de Búsqueda Masivo: ", "10! = 3,628,800 permutaciones factibles. Cada decisión de ubicación acopla cuadráticamente a todas las demás."),
        ("Ground Truth Matemático: ", "Instancia oficial qap10.mps con 4,150 variables binarias totales (100 de asignación X y 4,050 linealizadas Y). Óptimos de control: N=3 (24), N=4 (32) y N=10 (C* = 340)."),
        ("El Muro NISQ de 100 Qubits: ", "Un QUBO plano de 100 cúbits requiere 2^100 amplitudes (2×10^31 bytes ≈ 20 millones de Yottabytes). Ningún computador clásico puede simularlo con vector de estado."),
        ("Objetivo Nodux: ", "Demostrar utilidad metodológica cuántica con Q-LNS, escalando a N=13 y N=14 con memoria acotada (8 KiB) y factibilidad estricta.")
    ]
    for b_title, b_text in bullets:
        p_b = tf2_l.add_paragraph()
        p_b.text = f"• {b_title}"
        p_b.font.size = Pt(13)
        p_b.font.bold = True
        p_b.font.color.rgb = C_DARK
        p_b.add_run().text = b_text
        p_b.runs[1].font.bold = False

    tb2_right = s2.shapes.add_textbox(Inches(6.8), Inches(1.7), Inches(5.7), Inches(5.0))
    tf2_r = tb2_right.text_frame
    tf2_r.word_wrap = True
    p_r = tf2_r.paragraphs[0]
    p_r.text = "Track Abierto: Almacén B2B y Picking (+10 Pts)"
    p_r.font.size = Pt(18)
    p_r.font.bold = True
    p_r.font.color.rgb = C_GREEN

    narrative_pts = [
        ("Decisión Empresarial: ", "Asignación de 10 familias de productos a estantes en centros de distribución ferretero-industrial para minimizar distancias."),
        ("Matriz de Flujo (Fik): ", "Frecuencia histórica de co-ocurrencia de pedidos cruzados entre la familia i y la familia k."),
        ("Matriz de Distancia (Djl): ", "Distancia física en metros entre los estantes j y l hacia la mesa de consolidación."),
        ("Impacto Logístico: ", "Minimizar la caminata de los operarios por jornada, reduciendo fatiga y costos de picking.")
    ]
    for b_title, b_text in narrative_pts:
        p_b = tf2_r.add_paragraph()
        p_b.text = f"• {b_title}"
        p_b.font.size = Pt(13)
        p_b.font.bold = True
        p_b.font.color.rgb = C_DARK
        p_b.add_run().text = b_text
        p_b.runs[1].font.bold = False

    # ==================== SLIDE 3: FORMULACIÓN MATEMÁTICA ====================
    s3 = prs.slides.add_slide(slide_layout)
    add_header(s3, "2. Formulación Matemática y Extracción de Datos (Walter & Alexander)")

    tb3 = s3.shapes.add_textbox(Inches(0.8), Inches(1.7), Inches(11.7), Inches(5.2))
    tf3 = tb3.text_frame
    tf3.word_wrap = True

    sections = [
        ("A. Extracción Inversa Exacta desde MIPLIB qap10.mps (Walter Carpio)", 
         "El archivo contiene 4,150 variables binarias totales: 100 variables de asignación X_ij y 4,050 variables linealizadas Y con coeficiente en NOBJ. "
         "Comprobamos que Q_ikjl = F_ik * D_jl en el 100% de los 4,050 términos con coincidencia matemática exacta."),
        ("B. Formulación QUBO y Hamiltoniano de Ising (Alexander Miranda)",
         "H(x) = C(x) + λ ∑_i (∑_j x_ij - 1)^2 + λ ∑_j (∑_i x_ij - 1)^2\n"
         "Sustitución de espín: x_ij = (I - Z_ij)/2, construyendo operadores SparsePauliOp en Qiskit."),
        ("C. Calibración Analítica y Derivación Única de λ = 60.0",
         "Para garantizar que ningún estado infactible tenga menor energía que el óptimo factible: λ > ΔC_max = max_i(∑_{k≠i} F_ik) · max(D). "
         "Para el núcleo N=3, ΔC_max = 16 × 2 = 32.0 (cota superior conservadora: (N-1)·max(F)·max(D) = 40.0). "
         "Fijamos λ = 60.0 con 50% de margen de seguridad frente a fluctuaciones variacionales."),
        ("D. Verificación de Óptimos de Control",
         "• N=3 (9 cúbits): Costo Óptimo = 24.0 (100% verificado)\n"
         "• N=4 (16 cúbits): Costo Óptimo = 32.0 (100% verificado)\n"
         "• N=10 (100 variables): Óptimo MIPLIB = 340.0 (100% verificado)")
    ]

    for title, desc in sections:
        p_t = tf3.add_paragraph() if tf3.paragraphs[0].text else tf3.paragraphs[0]
        p_t.text = title
        p_t.font.size = Pt(15)
        p_t.font.bold = True
        p_t.font.color.rgb = C_BLUE
        p_d = tf3.add_paragraph()
        p_d.text = desc
        p_d.font.size = Pt(13)
        p_d.font.color.rgb = C_DARK

    # ==================== SLIDE 4: ARQUITECTURA Q-LNS ====================
    s4 = prs.slides.add_slide(slide_layout)
    add_header(s4, "3. Arquitectura Cuántica: Quantum Large Neighborhood Search (Q-LNS)")

    tb4_l = s4.shapes.add_textbox(Inches(0.8), Inches(1.7), Inches(6.0), Inches(5.0))
    tf4_l = tb4_l.text_frame
    tf4_l.word_wrap = True

    p = tf4_l.paragraphs[0]
    p.text = "Descomposición Activa de Vecindarios Cuánticos"
    p.font.size = Pt(17)
    p.font.bold = True
    p.font.color.rgb = C_BLUE

    lns_points = [
        ("Sin Cuántica por Relleno: ", "Qiskit tiene un rol computacional sustantivo y no decorativo. No forzamos un circuito monolítico de 100 cúbits que sería ruido puro en NISQ."),
        ("Descomposición Q-LNS: ", "Seleccionamos vecindarios dinámicos de K=3 o K=4 elementos según su gradiente de flujo e interacción cuadrática."),
        ("Sub-QUBO Inducido con Acoplamiento Lineal: ", "Incorporamos la interacción interna entre elementos activos y el acoplamiento lineal exacto L_aj con los elementos fijos."),
        ("Resolución en Qiskit: ", "Optimizamos en Qiskit AerSimulator con QAOA y COBYLA, aplicando Matching Húngaro clásico para asegurar 100% de factibilidad.")
    ]
    for t_str, d_str in lns_points:
        p_b = tf4_l.add_paragraph()
        p_b.text = f"• {t_str}"
        p_b.font.size = Pt(13)
        p_b.font.bold = True
        p_b.font.color.rgb = C_DARK
        p_b.add_run().text = d_str
        p_b.runs[1].font.bold = False

    tb4_r = s4.shapes.add_textbox(Inches(7.1), Inches(1.7), Inches(5.4), Inches(5.0))
    tf4_r = tb4_r.text_frame
    tf4_r.word_wrap = True
    p_r = tf4_r.paragraphs[0]
    p_r.text = "Frontera Experimental de Memoria NISQ"
    p_r.font.size = Pt(17)
    p_r.font.bold = True
    p_r.font.color.rgb = C_NAVY

    table_pts = [
        ("N=3 (9 cúbits): ", "Directo 8 KiB | Q-LNS 8 KiB (Factible)"),
        ("N=4 (16 cúbits): ", "Directo 1 MiB | Q-LNS 8 KiB (Factible)"),
        ("N=5 (25 cúbits): ", "Directo 512 MiB | Q-LNS 8 KiB (Factible)"),
        ("N=10 (100 cúbits): ", "Directo 10^31 B (Inviable) | Q-LNS 8 KiB (Factible)"),
        ("N=13 (169 cúbits): ", "Directo 10^52 B (Inviable) | Q-LNS 8 KiB (Factible)"),
        ("N=14 (196 cúbits): ", "Directo 10^60 B (Inviable) | Q-LNS 8 KiB (Factible)")
    ]
    for n_str, stat in table_pts:
        p_s = tf4_r.add_paragraph()
        p_s.text = f"✔ {n_str}"
        p_s.font.size = Pt(12)
        p_s.font.bold = True
        p_s.font.color.rgb = C_BLUE
        p_s.add_run().text = stat
        p_s.runs[1].font.bold = False

    # ==================== SLIDE 5: RESULTADOS EXPERIMENTALES ====================
    s5 = prs.slides.add_slide(slide_layout)
    add_header(s5, "4. Resultados Experimentales y Comparativa Clásica")

    tb5 = s5.shapes.add_textbox(Inches(0.8), Inches(1.7), Inches(11.7), Inches(5.2))
    tf5 = tb5.text_frame
    tf5.word_wrap = True

    p = tf5.paragraphs[0]
    p.text = "Auditoría de Calidad y Brecha % frente al Óptimo MIPLIB (C* = 340)"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = C_BLUE

    res_bullets = [
        ("Greedy Heuristic (Línea Base): ", "Costo = 466.0 | Gap = +37.06% | Tiempo = 0.0001s"),
        ("2-Opt Local Search Clásico: ", "Costo = 350.0 | Gap = +2.94% | Tiempo = 0.0159s (Mínimo local)"),
        ("Simulated Annealing: ", "Costo = 340.0 | Gap = 0.00% | Tiempo = 0.4109s (Óptimo clásico de referencia)"),
        ("QAOA Directo Qiskit (N=3, N=4): ", "N=3: Costo 24.0 (0.00% Gap, 0.19s) | N=4: Costo 32.0 (0.00% Gap, 6.21s)"),
        ("Quantum Hybrid LNS (N=10, 100 cúbits): ", "Costo = 350.0 | Gap = +2.94% | Tiempo = 2.21s (100% factible con decodificador húngaro)"),
        ("Prueba de Escalabilidad Etapa 3 (Finalistas): ", "N=13 (6.2 mil millones de perms): Costo = 670.0 (Gap = 2.76% vs SA 652) en 1.71s | N=14 (87 mil millones de perms): Costo = 800.0 (Gap = 0.25% vs SA 798) en 1.57s | Memoria cuántica acotada a 8 KiB"),
        ("Rigor y Enfoque Científico: ", "Demostramos Utilidad Metodológica Cuántica: Qiskit resuelve exactamente el subproblema activo y Q-LNS desacopla la intratabilidad de 100 cúbits.")
    ]
    for b_title, b_text in res_bullets:
        p_b = tf5.add_paragraph()
        p_b.text = f"• {b_title}"
        p_b.font.size = Pt(12)
        p_b.font.bold = True
        p_b.font.color.rgb = C_DARK
        p_b.add_run().text = b_text
        p_b.runs[1].font.bold = False

    # ==================== SLIDE 6: MODELO DE NEGOCIO Y ROI (+10 PTS) ====================
    s6 = prs.slides.add_slide(slide_layout)
    add_header(s6, "5. Métricas Industriales y Modelo de Ahorro ROI (Jesús Regalado)", "TRACK ABIERTO · PICKING DE ALMACÉN B2B (+10 PTS)")

    tb6_l = s6.shapes.add_textbox(Inches(0.8), Inches(1.7), Inches(5.8), Inches(5.0))
    tf6_l = tb6_l.text_frame
    tf6_l.word_wrap = True

    p = tf6_l.paragraphs[0]
    p.text = "Supuestos Operativos Formales y Verificables"
    p.font.size = Pt(17)
    p.font.bold = True
    p.font.color.rgb = C_BLUE

    roi_assumptions = [
        ("Velocidad de Picking: ", "1.2 m/s promedio de desplazamiento con transpaleta manual/eléctrica."),
        ("Costo Hora-Hombre: ", "S/ 12.00 por hora hombre en centros de distribución ferretero-industrial."),
        ("Dotación por Almacén: ", "4 operarios por turno en 2 turnos diarios (8 operarios activos) durante 300 días laborales."),
        ("Reducción de Flujo-Distancia: ", "De 466 a 340 unidades ponderadas (reducción del 27.04% al óptimo global; 24.89% con Q-LNS a 350).")
    ]
    for t_str, d_str in roi_assumptions:
        p_b = tf6_l.add_paragraph()
        p_b.text = f"• {t_str}"
        p_b.font.size = Pt(13)
        p_b.font.bold = True
        p_b.font.color.rgb = C_DARK
        p_b.add_run().text = d_str
        p_b.runs[1].font.bold = False

    tb6_r = s6.shapes.add_textbox(Inches(6.9), Inches(1.7), Inches(5.6), Inches(5.0))
    tf6_r = tb6_r.text_frame
    tf6_r.word_wrap = True
    p_r = tf6_r.paragraphs[0]
    p_r.text = "Ahorro Cuantificado y ROI Visible (+320%)"
    p_r.font.size = Pt(17)
    p_r.font.bold = True
    p_r.font.color.rgb = C_GREEN

    metrics_pts = [
        ("Caminata Ahorrada por Operario: ", "4.2 km de caminata menos al día por operario."),
        ("Tiempo Operativo Liberado: ", "58 minutos ahorrados por operario al día (4,200m / 1.2m/s = 3,500s)."),
        ("Ahorro Financiero por Almacén: ", "S/ 28,000 anuales por centro de distribución (8 operarios × 58.3 min × 300 días × S/ 12/h)."),
        ("Impacto en Red (10 Almacenes): ", "S/ 280,000 anuales ahorrados en la red nacional."),
        ("Fórmula de ROI Demostrable: ", "Inversión: S/ 6,600/almacén (S/ 66k red). ROI = (28,000 - 6,600)/6,600 = +321.8% (~+320%).")
    ]
    for m_title, m_val in metrics_pts:
        p_m = tf6_r.add_paragraph()
        p_m.text = f"★ {m_title}"
        p_m.font.size = Pt(12)
        p_m.font.bold = True
        p_m.font.color.rgb = C_NAVY
        p_m.add_run().text = m_val
        p_m.runs[1].font.bold = False

    # ==================== SLIDE 7: DEMO Y CONCLUSIONES ====================
    s7 = prs.slides.add_slide(slide_layout)
    add_header(s7, "6. Demostración Interactiva, Reproducibilidad y Defensa (Nicolás López)")

    tb7 = s7.shapes.add_textbox(Inches(0.8), Inches(1.7), Inches(11.7), Inches(5.2))
    tf7 = tb7.text_frame
    tf7.word_wrap = True

    p = tf7.paragraphs[0]
    p.text = "Cumplimiento del 100% de los Entregables y Reglas del Jurado"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = C_BLUE

    final_bullets = [
        ("Cockpit Oficial Ejecutivo en Vivo: ", "Micro-API local en Flask (http://localhost:5000, latencia < 50 ms) con visualización de asignación y Plan B Fail-Safe integrado."),
        ("100% Reproducibilidad en GitHub: ", "Repositorio público (https://github.com/alex8v124/nodux-quantum.git) con requirements.txt y semillas fijas (seed=42)."),
        ("Sin Cuántica por Relleno ni QEC Innecesario: ", "Respetamos las bases oficiales: cero códigos de corrección de error innecesarios y uso sustantivo de Qiskit 2.x en la optimización variacional."),
        ("Utilidad Metodológica Cuántica: ", "Honestidad científica ante el jurado: demostramos un framework de descomposición escalable para NISQ con impacto económico medible (+320% ROI)."),
        ("Compromiso Nodux: ", "Demostramos viabilidad teórica y operativa para la final presencial del Día 2 en NTT DATA Tower Bloom.")
    ]
    for b_title, b_text in final_bullets:
        p_b = tf7.add_paragraph()
        p_b.text = f"✔ {b_title}"
        p_b.font.size = Pt(13)
        p_b.font.bold = True
        p_b.font.color.rgb = C_DARK
        p_b.add_run().text = b_text
        p_b.runs[1].font.bold = False

    prs.save(output_path)
    print(f"Successfully generated presentation at {output_path}")

if __name__ == "__main__":
    create_deck()
