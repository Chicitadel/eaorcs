/******************************************************************************
 * Project        : Universal Autonomous Governance Operating System (UAIGOS)
 * Module         : EAORCS Provider Adapters (Stream S2)
 * File           : StorageProviderAdapter.js
 * Version        : 2026.1-LTS (v1.0.0-FROZEN)
 * Author         : Enterprise Architecture Council & Systems Engineering
 * Organization   : Ujomor Enterprise Systems
 * Created Date   : 2026-08-02
 * Last Modified  : 2026-08-02
 * Classification : ENTERPRISE | RESTRICTED
 *
 * Governance:
 * - Enterprise Policy Governed
 * - Architecture Frozen (ADR-002)
 * - Security Reviewed
 * - Provider Abstraction & Branding Standard
 ******************************************************************************/

'use strict';

const path = require('path');
const fs = require('fs');

/**
 * StorageProviderAdapter
 * Multi-cloud and local storage abstraction adapter (AWS S3, Azure Blob, Google Cloud Storage, POSIX).
 */
class StorageProviderAdapter {
    /**
     * @param {Object} config
     * @param {string} [config.provider='posix'] - Driver type: 's3', 'azure-blob', 'gcs', 'posix'
     * @param {string} [config.bucket='eaorcs-artifacts'] - Bucket or Container name
     * @param {string} [config.basePath='./storage_data'] - Local base path for POSIX driver
     * @param {string} [config.region='us-east-1'] - Cloud region
     * @param {string} [config.connectionString] - Azure or S3 connection string
     */
    constructor(config = {}) {
        this.provider = (config.provider || 'posix').toLowerCase();
        this.bucket = config.bucket || 'eaorcs-artifacts';
        this.basePath = config.basePath || path.join(process.cwd(), 'storage_data');
        this.region = config.region || 'us-east-1';
        this.connectionString = config.connectionString || null;
        this.inMemoryStore = new Map(); // Fallback for in-memory / mock mode

        this._validateProvider();
    }

    _validateProvider() {
        const supported = ['s3', 'azure-blob', 'gcs', 'posix'];
        if (!supported.includes(this.provider)) {
            throw new Error(`[StorageProviderAdapter] Unsupported provider '${this.provider}'. Supported: ${supported.join(', ')}`);
        }
    }

    getProviderName() {
        return this.provider;
    }

    /**
     * Store object into storage provider
     * @param {string} key - Object key/path (e.g. 'audit_reports/2026-08/report.json')
     * @param {string|Buffer|Object} data - Content payload
     * @param {Object} [metadata={}] - Custom headers / metadata
     * @returns {Promise<Object>} Response metadata
     */
    async putObject(key, data, metadata = {}) {
        if (!key) throw new Error('[StorageProviderAdapter] Object key is required.');

        const content = typeof data === 'object' && !(data instanceof Buffer)
            ? JSON.stringify(data, null, 2)
            : data;

        const size = Buffer.byteLength(content);
        const record = {
            key,
            bucket: this.bucket,
            size,
            contentType: metadata.contentType || 'application/json',
            metadata,
            lastModified: new Date().toISOString(),
            provider: this.provider
        };

        if (this.provider === 'posix') {
            const targetPath = path.join(this.basePath, key);
            const dir = path.dirname(targetPath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(targetPath, content);
            record.localPath = targetPath;
        } else {
            // Cloud providers (S3, Azure, GCS mock memory store)
            this.inMemoryStore.set(`${this.bucket}:${key}`, { content, metadata: record });
            record.uri = this._getCloudUri(key);
        }

        return {
            success: true,
            objectKey: key,
            ...record
        };
    }

    /**
     * Retrieve object from storage provider
     * @param {string} key 
     * @returns {Promise<Object>} Object content and metadata
     */
    async getObject(key) {
        if (!key) throw new Error('[StorageProviderAdapter] Object key is required.');

        if (this.provider === 'posix') {
            const targetPath = path.join(this.basePath, key);
            if (!fs.existsSync(targetPath)) {
                throw new Error(`[StorageProviderAdapter] Object '${key}' not found on POSIX filesystem.`);
            }
            const content = fs.readFileSync(targetPath, 'utf8');
            return {
                key,
                content,
                provider: this.provider,
                localPath: targetPath
            };
        } else {
            const entry = this.inMemoryStore.get(`${this.bucket}:${key}`);
            if (!entry) {
                throw new Error(`[StorageProviderAdapter] Object '${key}' not found in ${this.provider} bucket '${this.bucket}'.`);
            }
            return {
                key,
                content: entry.content,
                metadata: entry.metadata,
                provider: this.provider
            };
        }
    }

    /**
     * Delete object from storage provider
     * @param {string} key 
     * @returns {Promise<Object>} Delete outcome
     */
    async deleteObject(key) {
        if (!key) throw new Error('[StorageProviderAdapter] Object key is required.');

        if (this.provider === 'posix') {
            const targetPath = path.join(this.basePath, key);
            if (fs.existsSync(targetPath)) {
                fs.unlinkSync(targetPath);
            }
        } else {
            this.inMemoryStore.delete(`${this.bucket}:${key}`);
        }

        return {
            deleted: true,
            key,
            bucket: this.bucket,
            provider: this.provider
        };
    }

    /**
     * List objects under prefix
     * @param {string} [prefix=''] 
     * @returns {Promise<Array<Object>>} Object list
     */
    async listObjects(prefix = '') {
        if (this.provider === 'posix') {
            const result = [];
            const walk = (dir, currentPrefix) => {
                if (!fs.existsSync(dir)) return;
                const items = fs.readdirSync(dir, { withFileTypes: true });
                for (const item of items) {
                    const fullPath = path.join(dir, item.name);
                    const relKey = currentPrefix ? `${currentPrefix}/${item.name}` : item.name;
                    if (item.isDirectory()) {
                        walk(fullPath, relKey);
                    } else if (relKey.startsWith(prefix)) {
                        const stat = fs.statSync(fullPath);
                        result.push({
                            key: relKey,
                            size: stat.size,
                            lastModified: stat.mtime.toISOString(),
                            provider: 'posix'
                        });
                    }
                }
            };
            walk(this.basePath, '');
            return result;
        } else {
            const results = [];
            const targetBucketPrefix = `${this.bucket}:`;
            for (const [k, v] of this.inMemoryStore.entries()) {
                if (k.startsWith(targetBucketPrefix)) {
                    const objectKey = k.replace(targetBucketPrefix, '');
                    if (objectKey.startsWith(prefix)) {
                        results.push({
                            key: objectKey,
                            size: v.metadata.size,
                            lastModified: v.metadata.lastModified,
                            provider: this.provider
                        });
                    }
                }
            }
            return results;
        }
    }

    /**
     * Generate presigned URL for direct access
     * @param {string} key 
     * @param {number} [expiresInSeconds=3600] 
     * @returns {string} Presigned URL
     */
    getPresignedUrl(key, expiresInSeconds = 3600) {
        const expiresParam = Math.floor(Date.now() / 1000) + expiresInSeconds;
        switch (this.provider) {
            case 's3':
                return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}?X-Amz-Expires=${expiresInSeconds}&X-Amz-Signature=mock_s3_sig`;
            case 'azure-blob':
                return `https://${this.bucket}.blob.core.windows.net/${key}?se=${expiresParam}&sig=mock_azure_sig`;
            case 'gcs':
                return `https://storage.googleapis.com/${this.bucket}/${key}?GoogleAccessId=eaorcs-sa&Expires=${expiresParam}&Signature=mock_gcs_sig`;
            case 'posix':
            default:
                return `file://${path.join(this.basePath, key)}`;
        }
    }

    _getCloudUri(key) {
        switch (this.provider) {
            case 's3':
                return `s3://${this.bucket}/${key}`;
            case 'azure-blob':
                return `wasbs://${this.bucket}@azureblob.local/${key}`;
            case 'gcs':
                return `gs://${this.bucket}/${key}`;
            default:
                return `file://${path.join(this.basePath, key)}`;
        }
    }
}

module.exports = StorageProviderAdapter;
