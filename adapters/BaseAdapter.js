/******************************************************************************
 * Project        : EAORCS - The Software Trust Platform
 * Module         : Platform Adapter Layer
 * File           : BaseAdapter.js
 * Version        : 2026.1-LTS
 * Organization   : Ujomor Systems Engineering
 * Classification : ENTERPRISE
 ******************************************************************************/

class BaseAdapter {
  constructor(name, endpoint, offlineMode = false) {
    this.name = name;
    this.endpoint = endpoint;
    this.offlineMode = offlineMode;
    this.healthy = true;
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [ADAPTER:${this.name.toUpperCase()}] [${level.toUpperCase()}] ${message}`);
  }

  async isHealthy() {
    if (this.offlineMode) return true;
    try {
      // Basic ping test simulation
      return this.healthy;
    } catch (err) {
      this.log(`Health check failed: ${err.message}`, 'error');
      return false;
    }
  }

  setOfflineMode(offline) {
    this.offlineMode = offline;
    this.log(`Offline mode set to: ${offline}`);
  }
}

module.exports = BaseAdapter;
