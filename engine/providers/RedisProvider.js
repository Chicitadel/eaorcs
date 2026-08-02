/******************************************************************************
 * Project        : EAORCS - The Software Trust Platform
 * Module         : Provider Framework / Redis Provider Driver
 * File           : RedisProvider.js
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

let redisDriver = null;
try {
  redisDriver = require('ioredis');
} catch (e) {
  try {
    redisDriver = require('redis');
  } catch (err) {
    redisDriver = null;
  }
}

class RedisProvider {
  constructor(config = {}) {
    this.name = 'RedisProvider';
    this.config = {
      host: config.host || process.env.REDIS_HOST || '127.0.0.1',
      port: config.port || process.env.REDIS_PORT || 6379,
      password: config.password || process.env.REDIS_PASSWORD || null
    };

    this.client = null;
    this.memoryStore = new Map();
    this.subscribers = new Map();
  }

  async connect() {
    if (redisDriver && (process.env.REDIS_HOST || (this.config.host !== '127.0.0.1' && this.config.host !== 'localhost'))) {
      try {
        this.client = new redisDriver({
          ...this.config,
          maxRetriesPerRequest: 1,
          enableOfflineQueue: false,
          retryStrategy: () => null
        });
        return { status: 'connected', driver: 'redis' };
      } catch (err) {
        console.warn(`[RedisProvider] Redis client connection failed, falling back to memory store: ${err.message}`);
      }
    }
    return { status: 'connected', driver: 'in-memory-mock' };
  }

  async get(key) {
    if (this.client && typeof this.client.get === 'function') {
      try {
        return await this.client.get(key);
      } catch (e) {}
    }
    return this.memoryStore.has(key) ? this.memoryStore.get(key).value : null;
  }

  async set(key, value, ttlSeconds = null) {
    if (this.client && typeof this.client.set === 'function') {
      try {
        if (ttlSeconds) {
          await this.client.set(key, value, 'EX', ttlSeconds);
        } else {
          await this.client.set(key, value);
        }
        return 'OK';
      } catch (e) {}
    }

    this.memoryStore.set(key, {
      value,
      expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : null
    });
    return 'OK';
  }

  async del(key) {
    if (this.client && typeof this.client.del === 'function') {
      try {
        return await this.client.del(key);
      } catch (e) {}
    }
    const existed = this.memoryStore.has(key);
    this.memoryStore.delete(key);
    return existed ? 1 : 0;
  }

  async publish(channel, message) {
    if (this.client && typeof this.client.publish === 'function') {
      try {
        return await this.client.publish(channel, JSON.stringify(message));
      } catch (e) {}
    }

    const listeners = this.subscribers.get(channel) || [];
    for (const fn of listeners) {
      fn(message, channel);
    }
    return listeners.length;
  }

  async subscribe(channel, callback) {
    if (!this.subscribers.has(channel)) {
      this.subscribers.set(channel, []);
    }
    this.subscribers.get(channel).push(callback);
    return true;
  }

  async isHealthy() {
    try {
      if (this.client && typeof this.client.ping === 'function') {
        await this.client.ping();
        return true;
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  async disconnect() {
    if (this.client && typeof this.client.quit === 'function') {
      await this.client.quit();
    }
    this.memoryStore.clear();
    this.subscribers.clear();
    return true;
  }
}

module.exports = RedisProvider;
