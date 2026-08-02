/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System
 * Module         : Assurance DSL Engine - Runtime
 * File           : AssureRuntime.cjs
 * Version        : 1.1.0
 * Author         : Ujomor Systems Engineering & Governance Authority
 * Classification : ENTERPRISE
 ******************************************************************************/

const fs = require('fs');
const AssureLexer = require('./AssureLexer.cjs');
const AssureParser = require('./AssureParser.cjs');
const AssureCompiler = require('./AssureCompiler.cjs');

class AssureRuntime {
  constructor() {
    this.policies = {};
    this.triggerHandlers = new Map();
    this.triggerLog = [];
    this.initializeDefaultTriggers();
  }

  /**
   * Registers default built-in trigger action handlers.
   */
  initializeDefaultTriggers() {
    this.registerTriggerHandler('log', (message, context) => {
      this.recordTriggerExecution('log', message, context);
    });

    this.registerTriggerHandler('alert', (message, context) => {
      this.recordTriggerExecution('alert', message, context);
    });

    this.registerTriggerHandler('notify', (message, context) => {
      this.recordTriggerExecution('notify', message, context);
    });

    this.registerTriggerHandler('audit', (message, context) => {
      this.recordTriggerExecution('audit', message, context);
    });

    this.registerTriggerHandler('webhook', (message, context) => {
      this.recordTriggerExecution('webhook', message, context);
    });
  }

  /**
   * Registers a custom trigger action handler.
   * @param {string} action 
   * @param {Function} handlerFn (message, context) => void
   */
  registerTriggerHandler(action, handlerFn) {
    if (typeof handlerFn !== 'function') {
      throw new Error(`Trigger handler for action [${action}] must be a function`);
    }
    this.triggerHandlers.set(action.toLowerCase(), handlerFn);
  }

  /**
   * Records execution of a trigger in runtime log.
   */
  recordTriggerExecution(action, message, context) {
    this.triggerLog.push({
      action,
      message,
      context,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Dispatches trigger execution to registered handler.
   * @param {string} action 
   * @param {string} message 
   * @param {Object} context 
   */
  executeTrigger(action, message, context) {
    const handler = this.triggerHandlers.get(action.toLowerCase());
    if (handler) {
      handler(message, context);
    } else {
      this.recordTriggerExecution(action, message, context);
    }
  }

  /**
   * Loads and compiles an assurance DSL script string.
   * @param {string} script 
   */
  loadScript(script) {
    const lexer = new AssureLexer(script);
    const tokens = lexer.tokenize();
    const parser = new AssureParser(tokens);
    const ast = parser.parse();
    const compiler = new AssureCompiler(ast);
    const compiled = compiler.compile();
    
    this.policies = { ...this.policies, ...compiled };
  }

  /**
   * Loads an .assure file from disk path.
   * @param {string} filepath 
   */
  loadFile(filepath) {
    const script = fs.readFileSync(filepath, 'utf8');
    this.loadScript(script);
  }

  /**
   * Executes a registered policy by name against context.
   * @param {string} policyName 
   * @param {Object} context 
   * @returns {Object} { success: boolean, reason?: string, executedTriggers: Array }
   */
  execute(policyName, context = {}) {
    const policy = this.policies[policyName];
    if (!policy) {
      throw new Error(`Policy not found: ${policyName}`);
    }
    return policy(context, this);
  }

  /**
   * Clears policy registry and trigger logs.
   */
  reset() {
    this.policies = {};
    this.triggerLog = [];
  }
}

module.exports = AssureRuntime;
