/******************************************************************************
 * Project        : EAORCS - The Software Trust Platform
 * Module         : Scheduler Provider Abstraction
 * File           : SchedulerProvider.js
 * Version        : 2026.1-LTS
 * Organization   : Ujomor Systems Engineering
 * Classification : ENTERPRISE
 ******************************************************************************/

class SchedulerProvider {
  constructor(driver = 'WebCron', config = {}) {
    this.driver = driver;
    this.config = config;
    this.tasks = [];
  }

  scheduleTask(cronExpression, taskName, handler) {
    const task = { cronExpression, taskName, active: true };
    this.tasks.push(task);
    console.log(`[SCHEDULER:${this.driver.toUpperCase()}] Scheduled task '${taskName}' with schedule '${cronExpression}'`);
    return task;
  }
}

module.exports = SchedulerProvider;
