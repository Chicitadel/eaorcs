/******************************************************************************
 * Project        : EAORCS - The Software Trust Platform
 * Module         : Provider Framework / Cron Provider Driver
 * File           : CronProvider.js
 * Version        : 2026.1.0-LTS
 * Author         : Ujomor Systems Engineering & Governance Authority
 * Organization   : Ujomor Systems
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : ENTERPRISE | GOVERNMENT
 *
 * Governance:
 * - Security Reviewed
 * - Architecture Controlled
 * - Protocol Frozen
 * - Modularization Enforced
 *
 * Standards:
 * - ISO 27001
 * - SOC 2
 * - OWASP ASVS
 * - NIST
 *
 * Copyright (c) 2026 Ujomor Systems
 * All Rights Reserved.
 ******************************************************************************/

class CronProvider {
  constructor(options = {}) {
    this.name = 'CronProvider';
    this.jobs = new Map();
    this.timers = new Map();
  }

  schedule(jobName, cronExpression, taskFn) {
    if (typeof taskFn !== 'function') {
      throw new Error('[CronProvider] Scheduled task must be a function.');
    }

    const job = {
      name: jobName,
      expression: cronExpression,
      taskFn,
      active: true,
      lastRun: null,
      runCount: 0
    };

    this.jobs.set(jobName, job);

    const intervalMs = this._parseCronIntervalMs(cronExpression);
    const timer = setInterval(async () => {
      if (job.active) {
        try {
          job.lastRun = new Date().toISOString();
          job.runCount++;
          await taskFn();
        } catch (err) {
          console.error(`[CronProvider] Job '${jobName}' failed: ${err.message}`);
        }
      }
    }, intervalMs);

    if (timer.unref) timer.unref();

    this.timers.set(jobName, timer);
    return job;
  }

  stop(jobName) {
    if (this.timers.has(jobName)) {
      clearInterval(this.timers.get(jobName));
      this.timers.delete(jobName);
    }
    if (this.jobs.has(jobName)) {
      this.jobs.get(jobName).active = false;
    }
    return true;
  }

  listJobs() {
    return Array.from(this.jobs.values()).map(j => ({
      name: j.name,
      expression: j.expression,
      active: j.active,
      lastRun: j.lastRun,
      runCount: j.runCount
    }));
  }

  async triggerNow(jobName) {
    if (!this.jobs.has(jobName)) {
      throw new Error(`[CronProvider] Job '${jobName}' not found.`);
    }

    const job = this.jobs.get(jobName);
    job.lastRun = new Date().toISOString();
    job.runCount++;
    return await job.taskFn();
  }

  async isHealthy() {
    return true;
  }

  _parseCronIntervalMs(expr) {
    if (expr === '* * * * *') return 60000;
    if (expr.startsWith('*/')) {
      const num = parseInt(expr.split('/')[1]);
      if (!isNaN(num)) return num * 1000;
    }
    return 60000;
  }

  stopAll() {
    for (const [name, timer] of this.timers.entries()) {
      clearInterval(timer);
    }
    this.timers.clear();
    this.jobs.clear();
  }
}

module.exports = CronProvider;
