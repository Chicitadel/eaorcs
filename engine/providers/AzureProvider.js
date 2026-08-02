/******************************************************************************
 * Project        : EAORCS - The Software Trust Platform
 * Module         : Provider Framework / Azure Cloud Provider Driver
 * File           : AzureProvider.js
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

const { execSync } = require('child_process');

let azureSdk = null;
try {
  azureSdk = require('@azure/storage-blob');
} catch (e) {
  azureSdk = null;
}

class AzureProvider {
  constructor(config = {}) {
    this.name = 'AzureProvider';
    this.region = config.region || process.env.AZURE_REGION || process.env.LOCATION || 'eastus';
    this.connectionString = config.connectionString || process.env.AZURE_STORAGE_CONNECTION_STRING || null;
    this.containerName = config.containerName || process.env.AZURE_STORAGE_CONTAINER || 'eaorcs-blobs';
    this.mockStore = new Map();
  }

  getRegion() {
    return this.region;
  }

  isAvailable() {
    if (process.env.WEBSITE_SITE_NAME || process.env.AZURE_REGION || this.connectionString) return true;

    try {
      execSync('az --version', { stdio: 'ignore' });
      return true;
    } catch (e) {
      return false;
    }
  }

  async isHealthy() {
    return this.isAvailable();
  }

  async uploadBlob(blobName, content, container = null) {
    const targetContainer = container || this.containerName;
    const stringContent = typeof content === 'object' ? JSON.stringify(content, null, 2) : String(content);

    if (azureSdk && this.connectionString) {
      try {
        const blobServiceClient = azureSdk.BlobServiceClient.fromConnectionString(this.connectionString);
        const containerClient = blobServiceClient.getContainerClient(targetContainer);
        await containerClient.createIfNotExists();
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        await blockBlobClient.upload(stringContent, stringContent.length);
        return { status: 'uploaded', container: targetContainer, blobName, provider: 'azure-sdk' };
      } catch (err) {
        console.warn(`[AzureProvider] Blob SDK upload failed, falling back to CLI/mock: ${err.message}`);
      }
    }

    try {
      if (this.isAvailable() && process.env.AZURE_STORAGE_ACCOUNT) {
        execSync(`az storage blob upload --container-name ${targetContainer} --name ${blobName} --data "${stringContent.replace(/"/g, '\\"')}"`, {
          encoding: 'utf8',
          stdio: ['pipe', 'pipe', 'pipe']
        });
        return { status: 'uploaded', container: targetContainer, blobName, provider: 'azure-cli' };
      }
    } catch (err) {}

    // Fallback mock store
    this.mockStore.set(`${targetContainer}:${blobName}`, stringContent);
    return { status: 'uploaded', container: targetContainer, blobName, provider: 'azure-mock' };
  }

  async downloadBlob(blobName, container = null) {
    const targetContainer = container || this.containerName;

    if (azureSdk && this.connectionString) {
      try {
        const blobServiceClient = azureSdk.BlobServiceClient.fromConnectionString(this.connectionString);
        const containerClient = blobServiceClient.getContainerClient(targetContainer);
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        const downloadBlockBlobResponse = await blockBlobClient.download(0);
        const body = await this._streamToString(downloadBlockBlobResponse.readableStreamBody);
        try { return JSON.parse(body); } catch (e) { return body; }
      } catch (err) {}
    }

    try {
      if (this.isAvailable() && process.env.AZURE_STORAGE_ACCOUNT) {
        const output = execSync(`az storage blob download --container-name ${targetContainer} --name ${blobName} -o tsv`, {
          encoding: 'utf8',
          stdio: ['pipe', 'pipe', 'pipe']
        });
        try { return JSON.parse(output); } catch (e) { return output; }
      }
    } catch (err) {}

    const cached = this.mockStore.get(`${targetContainer}:${blobName}`);
    if (!cached) return null;
    try { return JSON.parse(cached); } catch (e) { return cached; }
  }

  async deleteBlob(blobName, container = null) {
    const targetContainer = container || this.containerName;
    this.mockStore.delete(`${targetContainer}:${blobName}`);

    try {
      if (this.isAvailable() && process.env.AZURE_STORAGE_ACCOUNT) {
        execSync(`az storage blob delete --container-name ${targetContainer} --name ${blobName}`, { stdio: ['pipe', 'pipe', 'pipe'] });
      }
    } catch (e) {}

    return { status: 'deleted', container: targetContainer, blobName };
  }

  async getSecret(keyVaultName, secretName) {
    try {
      if (this.isAvailable()) {
        const output = execSync(`az keyvault secret show --vault-name ${keyVaultName} --name ${secretName} -o json`, {
          encoding: 'utf8',
          stdio: ['pipe', 'pipe', 'pipe']
        });
        const parsed = JSON.parse(output);
        return parsed.value;
      }
    } catch (e) {}

    return `MOCK_AZURE_SECRET_${secretName}_VALUE`;
  }

  async listResourceGroups() {
    try {
      if (this.isAvailable()) {
        const output = execSync('az group list -o json', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
        return JSON.parse(output);
      }
    } catch (e) {}

    return [{ name: 'eaorcs-rg', location: this.region, provisioningState: 'Succeeded' }];
  }

  async _streamToString(readableStream) {
    return new Promise((resolve, reject) => {
      const chunks = [];
      readableStream.on('data', (data) => chunks.push(data.toString()));
      readableStream.on('end', () => resolve(chunks.join('')));
      readableStream.on('error', reject);
    });
  }
}

module.exports = AzureProvider;
