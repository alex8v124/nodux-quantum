"""
Business Impact and ROI Quantification Module (Track Abierto: +10 Puntos Bonificación).
Case Study: Q-DataCenter - Optimización de Asignación de Racks y Microservicios de Cómputo IA
en Centros de Datos Sostenibles de NTT DATA.
"""

from typing import Dict, Any
import json

class BusinessImpactModel:
    """
    Quantifies the economic, energy, and operational return on investment (ROI)
    of applying QAP optimization to hyperscale data center rack placement.
    """
    def __init__(
        self,
        cost_per_kwh: float = 0.14,           # USD / kWh (industrial datacenter electricity rate)
        power_per_hop_watts: float = 18.0,     # Watts consumed per 100GbE optical transceiver + spine port
        tbps_per_flow_unit: float = 25.0,      # Tbps/day per unit of matrix F
        latency_us_per_hop: float = 1.8,       # Microseconds latency per spine-leaf network hop
        annual_hours: int = 8760,              # Operational hours per year (24x7x365)
        co2_kg_per_kwh: float = 0.385,         # kg of CO2 equivalent per kWh (grid average)
        implementation_capex_usd: float = 45000.0, # Capex to deploy hybrid quantum optimizer
        datacenter_rooms_scale: int = 5        # Number of 10-rack clusters deployed across NTT DATA campus
    ):
        self.cost_per_kwh = cost_per_kwh
        self.power_per_hop_watts = power_per_hop_watts
        self.tbps_per_flow_unit = tbps_per_flow_unit
        self.latency_us_per_hop = latency_us_per_hop
        self.annual_hours = annual_hours
        self.co2_kg_per_kwh = co2_kg_per_kwh
        self.implementation_capex = implementation_capex_usd
        self.num_clusters = datacenter_rooms_scale

    def calculate_impact(
        self,
        base_cost: float = 466.0,   # Baseline cost (e.g. Greedy or standard heuristic)
        optimized_cost: float = 340.0 # Quantum-optimized global minimum C*
    ) -> Dict[str, Any]:
        """
        Calculates savings, ROI, latency reduction, and carbon offset.
        """
        cost_reduction = max(0.0, base_cost - optimized_cost)
        pct_reduction = (cost_reduction / base_cost) * 100.0 if base_cost > 0 else 0.0

        # Power reduction per cluster:
        # Every unit of flow-distance saved reduces effective continuous transceiver switching
        # 1 flow-distance unit corresponds to 1 active 100GbE link equivalent
        watts_saved_per_cluster = cost_reduction * self.power_per_hop_watts
        kwh_saved_annual_per_cluster = (watts_saved_per_cluster * self.annual_hours) / 1000.0
        kwh_saved_annual_total = kwh_saved_annual_per_cluster * self.num_clusters

        # Financial savings
        annual_savings_usd_per_cluster = kwh_saved_annual_per_cluster * self.cost_per_kwh
        annual_savings_usd_total = annual_savings_usd_per_cluster * self.num_clusters

        # Payback period and ROI
        payback_months = (self.implementation_capex / max(annual_savings_usd_total, 1.0)) * 12.0
        roi_year_1_pct = ((annual_savings_usd_total - self.implementation_capex) / self.implementation_capex) * 100.0
        three_year_net_savings_usd = (annual_savings_usd_total * 3.0) - self.implementation_capex

        # Sustainability (CO2 abatement)
        co2_tons_abated_annual = (kwh_saved_annual_total * self.co2_kg_per_kwh) / 1000.0

        # SLA & Performance (Latency)
        latency_reduction_us = (cost_reduction / 10.0) * self.latency_us_per_hop
        tail_latency_p99_improvement_pct = min(45.0, pct_reduction * 0.85)

        return {
            "narrative": "Q-DataCenter: NTT DATA Green AI Infrastructure",
            "sector": "Cloud Hyperscale & AI Infrastructure (NTT DATA Core Business)",
            "matrices_interpretation": {
                "F_flow": "Inter-cluster tensor & activation traffic (1 unit = 25 Tbps/day between AI microservices)",
                "D_distance": "Physical spine-leaf topology & switch hops between server racks"
            },
            "operational_decision": "Asignación física óptima de microservicios de IA a racks para minimizar la conmutación de red este-oeste",
            "base_cost": base_cost,
            "optimized_cost": optimized_cost,
            "cost_reduction_units": cost_reduction,
            "cost_reduction_percentage": pct_reduction,
            "assumptions": {
                "industrial_kwh_cost_usd": self.cost_per_kwh,
                "power_per_hop_watts": self.power_per_hop_watts,
                "datacenter_clusters_scaled": self.num_clusters,
                "implementation_capex_usd": self.implementation_capex,
                "co2_factor_kg_per_kwh": self.co2_kg_per_kwh
            },
            "economic_impact": {
                "annual_savings_usd_per_cluster": round(annual_savings_usd_per_cluster, 2),
                "annual_savings_usd_total": round(annual_savings_usd_total, 2),
                "three_year_net_savings_usd": round(three_year_net_savings_usd, 2),
                "payback_period_months": round(payback_months, 1),
                "roi_first_year_pct": round(roi_year_1_pct, 1)
            },
            "environmental_impact": {
                "kwh_saved_annually": round(kwh_saved_annual_total, 1),
                "co2_tons_abated_annually": round(co2_tons_abated_annual, 2)
            },
            "technical_sla_impact": {
                "estimated_latency_reduction_us": round(latency_reduction_us, 2),
                "p99_tail_latency_improvement_pct": round(tail_latency_p99_improvement_pct, 1)
            }
        }

if __name__ == "__main__":
    model = BusinessImpactModel()
    report = model.calculate_impact(base_cost=466.0, optimized_cost=340.0)
    print("--- BUSINESS IMPACT & ROI REPORT (TRACK ABIERTO) ---")
    print(json.dumps(report, indent=2))
