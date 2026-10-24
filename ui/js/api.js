/**
 * NODUX Enterprise API Client
 * Cliente REST asíncrono con control de tiempo de espera y tipado de respuestas.
 */

const API_BASE = window.location.origin;

class ApiClient {
  static async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options.timeout || 30000);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          ...(options.headers || {})
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || `Error del servidor HTTP ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === "AbortError") {
        throw new Error("Tiempo de espera agotado al conectar con el motor de optimización (Timeout > 30s).");
      }
      throw err;
    }
  }

  static async getHealth() {
    return this.request("/api/health", { method: "GET", timeout: 5000 });
  }

  static async getInstances() {
    return this.request("/api/instances", { method: "GET", timeout: 5000 });
  }

  static async optimize(params) {
    return this.request("/api/optimize", {
      method: "POST",
      body: JSON.stringify(params),
      timeout: 45000 // Q-LNS simulation can take a few seconds
    });
  }

  static async calculateRoi(params) {
    return this.request("/api/roi", {
      method: "POST",
      body: JSON.stringify(params),
      timeout: 5000
    });
  }
}

window.ApiClient = ApiClient;
