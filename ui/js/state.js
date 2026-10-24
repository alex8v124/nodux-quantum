/**
 * NODUX Enterprise State Management Store
 * Mantiene el estado canónico de la aplicación y notifica a las vistas suscritas.
 */

class AppStore {
  constructor() {
    this.state = {
      scaleN: 10,
      lambdaPenalty: 60.0,
      shots: 1024,
      algorithm: "qaoa", // 'qaoa' | 'classical'
      activeTab: "dashboard", // 'dashboard' | 'warehouse' | 'telemetry' | 'roi' | 'circuit' | 'ibm'
      isLoading: false,
      backendStatus: "checking", // 'online' | 'offline' | 'checking'
      lastLatencyMs: null,
      error: null,
      results: null,
      instancesMeta: null
    };
    this.listeners = [];
  }

  getState() {
    return this.state;
  }

  setState(partialState) {
    this.state = { ...this.state, ...partialState };
    this.notify();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }
}

window.appStore = new AppStore();
