/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System
 * Module         : Assurance DSL Engine - Lexer
 * File           : AssureLexer.cjs
 * Version        : 1.1.0
 * Author         : Ujomor Systems Engineering & Governance Authority
 * Classification : ENTERPRISE
 ******************************************************************************/

class AssureLexer {
  constructor(input) {
    this.input = input;
    this.pos = 0;
    this.tokens = [];
  }

  tokenize() {
    while (this.pos < this.input.length) {
      let char = this.input[this.pos];

      // Skip whitespace
      if (/\s/.test(char)) {
        this.pos++;
        continue;
      }

      // String literals
      if (char === '"') {
        let str = '';
        this.pos++;
        while (this.pos < this.input.length && this.input[this.pos] !== '"') {
          if (this.input[this.pos] === '\\') {
            this.pos++; // skip escape char
          }
          str += this.input[this.pos];
          this.pos++;
        }
        this.pos++; // skip closing quote
        this.tokens.push({ type: 'STRING', value: str });
        continue;
      }

      // Identifiers & Keywords
      if (/[a-zA-Z_]/.test(char)) {
        let ident = '';
        while (this.pos < this.input.length && /[a-zA-Z0-9_]/.test(this.input[this.pos])) {
          ident += this.input[this.pos];
          this.pos++;
        }
        const lowerIdent = ident.toLowerCase();
        if (['policy', 'require', 'deny', 'on_success', 'on_failure'].includes(lowerIdent)) {
          this.tokens.push({ type: 'KEYWORD', value: lowerIdent });
        } else {
          this.tokens.push({ type: 'IDENTIFIER', value: ident });
        }
        continue;
      }

      // Numbers
      if (/[0-9]/.test(char)) {
        let num = '';
        while (this.pos < this.input.length && /[0-9\.]/.test(this.input[this.pos])) {
          num += this.input[this.pos];
          this.pos++;
        }
        this.tokens.push({ type: 'NUMBER', value: parseFloat(num) });
        continue;
      }

      // Multi-character Operators
      if (char === '>' && this.input[this.pos + 1] === '=') {
        this.tokens.push({ type: 'OPERATOR', value: '>=' });
        this.pos += 2;
        continue;
      }
      if (char === '<' && this.input[this.pos + 1] === '=') {
        this.tokens.push({ type: 'OPERATOR', value: '<=' });
        this.pos += 2;
        continue;
      }
      if (char === '=' && this.input[this.pos + 1] === '=') {
        this.tokens.push({ type: 'OPERATOR', value: '==' });
        this.pos += 2;
        continue;
      }
      if (char === '!' && this.input[this.pos + 1] === '=') {
        this.tokens.push({ type: 'OPERATOR', value: '!=' });
        this.pos += 2;
        continue;
      }

      // Single-character Operators
      if (['>', '<', '='].includes(char)) {
        this.tokens.push({ type: 'OPERATOR', value: char });
        this.pos++;
        continue;
      }

      // Punctuation
      if (['{', '}', ';'].includes(char)) {
        this.tokens.push({ type: 'PUNCTUATION', value: char });
        this.pos++;
        continue;
      }

      throw new Error(`Unexpected character at position ${this.pos}: '${char}'`);
    }
    this.tokens.push({ type: 'EOF' });
    return this.tokens;
  }
}

module.exports = AssureLexer;
