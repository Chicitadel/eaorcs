/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System
 * Module         : Assurance DSL Engine - Parser
 * File           : AssureParser.cjs
 * Version        : 1.1.0
 * Author         : Ujomor Systems Engineering & Governance Authority
 * Classification : ENTERPRISE
 ******************************************************************************/

class AssureParser {
  constructor(tokens) {
    this.tokens = tokens;
    this.pos = 0;
  }

  peek() {
    return this.tokens[this.pos];
  }

  consume() {
    return this.tokens[this.pos++];
  }

  expect(type, value = null) {
    const token = this.peek();
    if (!token) {
      throw new Error(`Unexpected end of tokens, expected ${type} ${value || ''}`);
    }
    if (token.type !== type || (value !== null && token.value !== value)) {
      throw new Error(`Expected ${type} ${value || ''}, got ${token.type} ${token.value}`);
    }
    return this.consume();
  }

  parse() {
    const ast = { type: 'Program', policies: [] };
    while (this.peek() && this.peek().type !== 'EOF') {
      ast.policies.push(this.parsePolicy());
    }
    return ast;
  }

  parsePolicy() {
    this.expect('KEYWORD', 'policy');
    const nameToken = this.expect('STRING');
    this.expect('PUNCTUATION', '{');
    
    const policy = { type: 'Policy', name: nameToken.value, rules: [] };
    
    while (this.peek() && (this.peek().type !== 'PUNCTUATION' || this.peek().value !== '}')) {
      const currentToken = this.peek();
      if (currentToken.type === 'KEYWORD' && currentToken.value === 'require') {
        policy.rules.push(this.parseRequire());
      } else if (currentToken.type === 'KEYWORD' && currentToken.value === 'deny') {
        policy.rules.push(this.parseDeny());
      } else if (currentToken.type === 'KEYWORD' && (currentToken.value === 'on_success' || currentToken.value === 'on_failure')) {
        policy.rules.push(this.parseTrigger());
      } else {
        throw new Error(`Unexpected token in policy body: ${currentToken.type} ${currentToken.value}`);
      }
    }
    
    this.expect('PUNCTUATION', '}');
    return policy;
  }

  parseRequire() {
    this.expect('KEYWORD', 'require');
    const left = this.expect('IDENTIFIER');
    const operator = this.expect('OPERATOR');
    let right;
    if (this.peek().type === 'NUMBER') right = this.expect('NUMBER');
    else if (this.peek().type === 'STRING') right = this.expect('STRING');
    else right = this.expect('IDENTIFIER');
    
    this.expect('PUNCTUATION', ';');
    return { type: 'RequireRule', field: left.value, operator: operator.value, value: right.value };
  }

  parseDeny() {
    this.expect('KEYWORD', 'deny');
    const msgToken = this.expect('STRING');
    this.expect('PUNCTUATION', ';');
    return { type: 'DenyRule', message: msgToken.value };
  }

  parseTrigger() {
    const triggerKeyword = this.consume().value; // 'on_success' or 'on_failure'
    const actionToken = this.expect('IDENTIFIER'); // e.g. 'log', 'alert', 'notify'
    let message = '';
    if (this.peek().type === 'STRING') {
      message = this.expect('STRING').value;
    }
    this.expect('PUNCTUATION', ';');
    return {
      type: triggerKeyword === 'on_success' ? 'OnSuccessTrigger' : 'OnFailureTrigger',
      action: actionToken.value,
      message
    };
  }
}

module.exports = AssureParser;
