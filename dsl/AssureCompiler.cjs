/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System
 * Module         : Assurance DSL Engine - Compiler
 * File           : AssureCompiler.cjs
 * Version        : 1.1.0
 * Author         : Ujomor Systems Engineering & Governance Authority
 * Classification : ENTERPRISE
 ******************************************************************************/

class AssureCompiler {
  constructor(ast) {
    this.ast = ast;
  }

  compile() {
    const compiledPolicies = {};
    for (const policy of this.ast.policies) {
      compiledPolicies[policy.name] = this.compilePolicy(policy);
    }
    return compiledPolicies;
  }

  compilePolicy(policy) {
    const rules = policy.rules;
    let denyMessage = "Policy failed";
    
    // Extract deny message if exists
    const denyRule = rules.find(r => r.type === 'DenyRule');
    if (denyRule) {
      denyMessage = denyRule.message;
    }

    const requires = rules.filter(r => r.type === 'RequireRule');
    const onSuccessTriggers = rules.filter(r => r.type === 'OnSuccessTrigger');
    const onFailureTriggers = rules.filter(r => r.type === 'OnFailureTrigger');

    return (context, runtime) => {
      const executedTriggers = [];

      for (const req of requires) {
        const val = context[req.field];
        let passed = false;
        switch(req.operator) {
          case '>': passed = val > req.value; break;
          case '>=': passed = val >= req.value; break;
          case '<': passed = val < req.value; break;
          case '<=': passed = val <= req.value; break;
          case '==': passed = val === req.value; break;
          case '!=': passed = val !== req.value; break;
        }

        if (!passed) {
          // Execute ON_FAILURE triggers
          for (const trigger of onFailureTriggers) {
            if (runtime && typeof runtime.executeTrigger === 'function') {
              runtime.executeTrigger(trigger.action, trigger.message, context);
            }
            executedTriggers.push({ type: 'ON_FAILURE', action: trigger.action, message: trigger.message });
          }

          return {
            success: false,
            reason: denyMessage,
            failedRule: { field: req.field, operator: req.operator, expected: req.value, actual: val },
            executedTriggers
          };
        }
      }

      // Execute ON_SUCCESS triggers
      for (const trigger of onSuccessTriggers) {
        if (runtime && typeof runtime.executeTrigger === 'function') {
          runtime.executeTrigger(trigger.action, trigger.message, context);
        }
        executedTriggers.push({ type: 'ON_SUCCESS', action: trigger.action, message: trigger.message });
      }

      return {
        success: true,
        executedTriggers
      };
    };
  }
}

module.exports = AssureCompiler;
