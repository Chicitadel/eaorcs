/******************************************************************************
 * Project        : EAORCS - The Software Trust Platform
 * Module         : Kernel / Streaming Event Bus
 * File           : EventBus.js
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

const { Readable } = require('stream');

class EventBus {
  constructor() {
    this.listeners = new Map();
    this.history = [];
    this.maxHistory = 100;
    this.streams = new Set();
  }

  on(event, handler, priority = 10) {
    if (typeof handler !== 'function') {
      throw new Error(`[EventBus] Handler for event '${event}' must be a function.`);
    }

    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }

    const handlers = this.listeners.get(event);
    handlers.push({ handler, priority, once: false });
    handlers.sort((a, b) => b.priority - a.priority);

    return () => this.off(event, handler);
  }

  once(event, handler, priority = 10) {
    if (typeof handler !== 'function') {
      throw new Error(`[EventBus] Handler for event '${event}' must be a function.`);
    }

    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }

    const handlers = this.listeners.get(event);
    handlers.push({ handler, priority, once: true });
    handlers.sort((a, b) => b.priority - a.priority);

    return () => this.off(event, handler);
  }

  off(event, handler) {
    if (!this.listeners.has(event)) return;

    const handlers = this.listeners.get(event).filter(item => item.handler !== handler);
    if (handlers.length === 0) {
      this.listeners.delete(event);
    } else {
      this.listeners.set(event, handlers);
    }
  }

  async emit(event, payload = {}) {
    const timestamp = new Date().toISOString();
    const eventPacket = { event, payload, timestamp };
    this._recordHistory(event, payload, timestamp);
    this._pushToStreams(eventPacket);

    const matchingHandlers = this._getMatchingHandlers(event);
    const results = [];

    for (const item of matchingHandlers) {
      try {
        const res = await item.handler(payload, event);
        results.push({ success: true, result: res });
      } catch (err) {
        results.push({ success: false, error: err.message });
      }
    }

    // Remove once listeners
    for (const [evtKey, handlers] of this.listeners.entries()) {
      if (evtKey === event || this._matchPattern(evtKey, event)) {
        const remaining = handlers.filter(item => !item.once);
        if (remaining.length === 0) {
          this.listeners.delete(evtKey);
        } else {
          this.listeners.set(evtKey, remaining);
        }
      }
    }

    return results;
  }

  emitSync(event, payload = {}) {
    const timestamp = new Date().toISOString();
    const eventPacket = { event, payload, timestamp };
    this._recordHistory(event, payload, timestamp);
    this._pushToStreams(eventPacket);

    const matchingHandlers = this._getMatchingHandlers(event);
    const results = [];

    for (const item of matchingHandlers) {
      try {
        const res = item.handler(payload, event);
        results.push({ success: true, result: res });
      } catch (err) {
        results.push({ success: false, error: err.message });
      }
    }

    return results;
  }

  createStream(pattern = '*') {
    const bus = this;
    const stream = new Readable({
      objectMode: true,
      read() {}
    });

    stream.pattern = pattern;
    stream.destroyStream = () => {
      stream.push(null);
      bus.streams.delete(stream);
    };

    this.streams.add(stream);
    return stream;
  }

  pipe(pattern, targetWritable) {
    if (!targetWritable || typeof targetWritable.write !== 'function') {
      throw new Error('[EventBus] Target for pipe must be a Writable stream.');
    }
    const eventStream = this.createStream(pattern);
    eventStream.pipe(targetWritable);
    return targetWritable;
  }

  emitStream(event, sourceReadableStream) {
    if (!sourceReadableStream || typeof sourceReadableStream.on !== 'function') {
      throw new Error('[EventBus] Source stream must be a Readable stream.');
    }

    sourceReadableStream.on('data', (chunk) => {
      this.emit(event, { data: chunk, timestamp: new Date().toISOString() });
    });

    return new Promise((resolve, reject) => {
      sourceReadableStream.on('end', () => resolve({ status: 'completed', event }));
      sourceReadableStream.on('error', (err) => reject(err));
    });
  }

  _getMatchingHandlers(event) {
    let matched = [];
    for (const [pattern, handlers] of this.listeners.entries()) {
      if (pattern === event || this._matchPattern(pattern, event)) {
        matched = matched.concat(handlers);
      }
    }
    return matched;
  }

  _matchPattern(pattern, event) {
    if (pattern === '*') return true;
    if (pattern.endsWith('*')) {
      const prefix = pattern.slice(0, -1);
      return event.startsWith(prefix);
    }
    return false;
  }

  _recordHistory(event, payload, timestamp) {
    this.history.push({ event, payload, timestamp });
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }
  }

  _pushToStreams(eventPacket) {
    for (const stream of this.streams) {
      if (stream.pattern === '*' || this._matchPattern(stream.pattern, eventPacket.event)) {
        stream.push(eventPacket);
      }
    }
  }

  getHistory(limit = 50) {
    return this.history.slice(-limit);
  }

  clearHistory() {
    this.history = [];
  }

  removeAllListeners(event) {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }

    for (const stream of this.streams) {
      stream.destroyStream();
    }
    this.streams.clear();
  }
}

module.exports = EventBus;
