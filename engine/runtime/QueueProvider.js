/******************************************************************************
 * Project        : EAORCS - The Software Trust Platform
 * Module         : Queue Provider Abstraction
 * File           : QueueProvider.js
 * Version        : 2026.1-LTS
 * Organization   : Ujomor Systems Engineering
 * Classification : ENTERPRISE
 ******************************************************************************/

class QueueProvider {
  constructor(driver = 'DatabaseQueue', config = {}) {
    this.driver = driver;
    this.config = config;
    this.queue = [];
  }

  async push(jobName, payload) {
    const job = { id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`, jobName, payload, status: 'pending', queuedAt: new Date().toISOString() };
    this.queue.push(job);
    console.log(`[QUEUE:${this.driver.toUpperCase()}] Pushed job '${jobName}' (${job.id})`);
    return job;
  }

  async pop() {
    return this.queue.shift() || null;
  }
}

module.exports = QueueProvider;
