/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Public Developer SDK Package Builder
 * File           : PublicSdkPackageBuilder.js
 * Version        : 2026.1.0-LTS
 * Author         : Ujomor Systems & Enterprise Governance Authority
 * Organization   : Ujomor Systems & Enterprise Governance
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : GOVERNMENT | ENTERPRISE | PUBLIC SDK
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
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class PublicSdkPackageBuilder {
  constructor(options = {}) {
    this.version = options.version || '2026.1.0-LTS';
    this.organization = options.organization || 'Ujomor Systems & Enterprise Governance';
    this.author = options.author || 'Ujomor Systems & Enterprise Governance Authority';
    this.baseUrl = options.baseUrl || 'https://api.eaorcs.enterprise.internal';
  }

  /**
   * Helper to ensure output directory path exists recursively
   */
  _ensureDirSync(dirPath) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  /**
   * Helper to write a file and track metrics
   */
  _writeFile(filePath, content) {
    this._ensureDirSync(path.dirname(filePath));
    fs.writeFileSync(filePath, content, 'utf8');
    const bytes = Buffer.byteLength(content, 'utf8');
    return {
      path: filePath,
      relative: path.basename(filePath),
      bytes
    };
  }

  /**
   * Compiles zero-dependency Node.js SDK package (@eaorcs/sdk)
   * @param {string} outDir Target root directory
   */
  buildNodeJsSdk(outDir) {
    const targetDir = path.join(outDir, 'nodejs');
    this._ensureDirSync(targetDir);
    const filesWritten = [];

    // 1. package.json
    const packageJson = {
      name: '@eaorcs/sdk',
      version: '2026.1.0',
      description: 'Official Zero-Dependency Node.js Developer SDK for EAORCS Platform',
      main: 'index.js',
      types: 'index.d.ts',
      scripts: {
        test: 'node --test'
      },
      keywords: [
        'eaorcs',
        'governance',
        'compliance',
        'regulatory',
        'sdk',
        'zero-dependency'
      ],
      author: this.author,
      license: 'UNLICENSED',
      dependencies: {},
      engines: {
        node: '>=18.0.0'
      }
    };
    filesWritten.push(this._writeFile(path.join(targetDir, 'package.json'), JSON.stringify(packageJson, null, 2)));

    // 2. index.js
    const indexJs = `\
/******************************************************************************
 * Project        : EAORCS Platform SDK
 * Module         : Node.js Public SDK Entrypoint (@eaorcs/sdk)
 * Version        : 2026.1.0
 * Author         : ${this.author}
 * Organization   : ${this.organization}
 * License        : Proprietary / Enterprise
 ******************************************************************************/

'use strict';

const http = require('http');
const https = require('https');
const crypto = require('crypto');
const { URL } = require('url');

class EaorcsClient {
  constructor(config = {}) {
    this.baseUrl = config.baseUrl || '${this.baseUrl}';
    this.apiKey = config.apiKey || process.env.EAORCS_API_KEY || '';
    this.timeout = config.timeout || 10000;
  }

  async _request(method, path, body = null, customHeaders = {}) {
    const targetUrl = new URL(path, this.baseUrl);
    const transport = targetUrl.protocol === 'https:' ? https : http;
    const payload = body ? JSON.stringify(body) : null;

    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'EAORCS-NodeJS-SDK/2026.1.0',
      'Authorization': \`Bearer \${this.apiKey}\`,
      ...customHeaders
    };

    if (payload) {
      headers['Content-Length'] = Buffer.byteLength(payload);
    }

    return new Promise((resolve, reject) => {
      const req = transport.request(targetUrl, { method, headers, timeout: this.timeout }, (res) => {
        let rawData = '';
        res.on('data', (chunk) => { rawData += chunk; });
        res.on('end', () => {
          try {
            const parsed = rawData ? JSON.parse(rawData) : {};
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(parsed);
            } else {
              reject(new Error(\`EAORCS API Error (\${res.statusCode}): \${parsed.message || rawData}\`));
            }
          } catch (err) {
            reject(new Error(\`Failed to parse response: \${err.message}\`));
          }
        });
      });

      req.on('error', (err) => reject(err));
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timed out'));
      });

      if (payload) {
        req.write(payload);
      }
      req.end();
    });
  }

  // Governance APIs
  async evaluateGovernance(policyRequest) {
    return this._request('POST', '/api/v1/governance/evaluate', policyRequest);
  }

  // Trust Engine APIs
  async getTrustReport(entityId) {
    return this._request('GET', \`/api/v1/trust/reports/\${encodeURIComponent(entityId)}\`);
  }

  // Audit APIs
  async verifyAuditProof(proofPayload) {
    return this._request('POST', '/api/v1/audit/verify', proofPayload);
  }

  // OSAP APIs
  async getOsapPassport(passportId) {
    return this._request('GET', \`/api/v1/osap/passports/\${encodeURIComponent(passportId)}\`);
  }
}

module.exports = {
  EaorcsClient,
  version: '2026.1.0'
};
`;
    filesWritten.push(this._writeFile(path.join(targetDir, 'index.js'), indexJs));

    // 3. index.d.ts (TypeScript declarations)
    const indexDts = `\
declare module '@eaorcs/sdk' {
  export interface SdkConfig {
    baseUrl?: string;
    apiKey?: string;
    timeout?: number;
  }

  export interface GovernanceEvaluationRequest {
    domain: string;
    context: Record<string, any>;
    policies?: string[];
  }

  export interface TrustReportResponse {
    trustScore: number;
    tier: string;
    verifiedAt: string;
  }

  export class EaorcsClient {
    constructor(config?: SdkConfig);
    evaluateGovernance(policyRequest: GovernanceEvaluationRequest): Promise<any>;
    getTrustReport(entityId: string): Promise<TrustReportResponse>;
    verifyAuditProof(proofPayload: any): Promise<any>;
    getOsapPassport(passportId: string): Promise<any>;
  }

  export const version: string;
}
`;
    filesWritten.push(this._writeFile(path.join(targetDir, 'index.d.ts'), indexDts));

    // 4. README.md
    const readmeMd = `\
# @eaorcs/sdk

Official Zero-Dependency Node.js Developer SDK for EAORCS (Enterprise Autonomous Operation & Regulatory Compliance System).

## Installation

\`\`\`bash
npm install @eaorcs/sdk
\`\`\`

## Quick Start

\`\`\`javascript
const { EaorcsClient } = require('@eaorcs/sdk');

const client = new EaorcsClient({
  baseUrl: 'https://api.eaorcs.enterprise.internal',
  apiKey: process.env.EAORCS_API_KEY
});

async function run() {
  const trustReport = await client.getTrustReport('entity-1001');
  console.log('Trust Score:', trustReport.trustScore);
}

run().catch(console.error);
\`\`\`

## Governance & Standards
- Compliance: ISO 27001, SOC 2, OWASP ASVS, NIST
- Author: ${this.author}
- Copyright (c) 2026 ${this.organization}
`;
    filesWritten.push(this._writeFile(path.join(targetDir, 'README.md'), readmeMd));

    const totalBytes = filesWritten.reduce((acc, f) => acc + f.bytes, 0);

    return {
      success: true,
      target: 'nodejs',
      packageName: '@eaorcs/sdk',
      outDir: targetDir,
      filesWritten: filesWritten.map(f => f.relative),
      fileCount: filesWritten.length,
      totalBytes
    };
  }

  /**
   * Compiles zero-dependency Python SDK package (eaorcs-sdk)
   * @param {string} outDir Target root directory
   */
  buildPythonSdk(outDir) {
    const targetDir = path.join(outDir, 'python');
    this._ensureDirSync(path.join(targetDir, 'eaorcs_sdk'));
    const filesWritten = [];

    // 1. setup.py
    const setupPy = `\
# -*- coding: utf-8 -*-
"""
EAORCS Python SDK Setup Script
"""
from setuptools import setup, find_packages

setup(
    name='eaorcs-sdk',
    version='2026.1.0',
    description='Official Zero-Dependency Python Developer SDK for EAORCS Platform',
    author='${this.author}',
    packages=find_packages(),
    python_requires='>=3.8',
    install_requires=[],  # Zero external dependencies
    classifiers=[
        'Programming Language :: Python :: 3',
        'License :: Other/Proprietary License',
        'Operating System :: OS Independent',
    ],
)
`;
    filesWritten.push(this._writeFile(path.join(targetDir, 'setup.py'), setupPy));

    // 2. pyproject.toml
    const pyprojectToml = `\
[build-system]
requires = ["setuptools>=61.0"]
build-backend = "setuptools.build_meta"

[project]
name = "eaorcs-sdk"
version = "2026.1.0"
description = "Official Zero-Dependency Python Developer SDK for EAORCS Platform"
authors = [
    { name="${this.author}" }
]
dependencies = []
requires-python = ">=3.8"
`;
    filesWritten.push(this._writeFile(path.join(targetDir, 'pyproject.toml'), pyprojectToml));

    // 3. eaorcs_sdk/__init__.py
    const initPy = `\
# -*- coding: utf-8 -*-
"""
EAORCS Python SDK Package
"""

from .client import EaorcsClient

__version__ = '2026.1.0'
__author__ = '${this.author}'
__all__ = ['EaorcsClient']
`;
    filesWritten.push(this._writeFile(path.join(targetDir, 'eaorcs_sdk', '__init__.py'), initPy));

    // 4. eaorcs_sdk/client.py
    const clientPy = `\
# -*- coding: utf-8 -*-
"""
EAORCS Python SDK Client - Standard Library HTTP/JSON Client
"""

import json
import os
import urllib.request
import urllib.error
import ssl

class EaorcsClient:
    def __init__(self, base_url=None, api_key=None, timeout=10):
        self.base_url = (base_url or os.getenv('EAORCS_BASE_URL') or '${this.baseUrl}').rstrip('/')
        self.api_key = api_key or os.getenv('EAORCS_API_KEY') or ''
        this_timeout = timeout
        self.timeout = this_timeout

    def _request(self, method, endpoint, payload=None, headers=None):
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
        req_headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'EAORCS-Python-SDK/2026.1.0',
            'Authorization': f"Bearer {self.api_key}"
        }
        if headers:
            req_headers.update(headers)

        data = None
        if payload is not None:
            data = json.dumps(payload).encode('utf-8')

        req = urllib.request.Request(url, data=data, headers=req_headers, method=method)
        ctx = ssl.create_default_context()

        try:
            with urllib.request.urlopen(req, timeout=self.timeout, context=ctx) as response:
                res_data = response.read().decode('utf-8')
                return json.loads(res_data) if res_data else {}
        except urllib.error.HTTPError as e:
            err_content = e.read().decode('utf-8')
            raise RuntimeError(f"EAORCS API Error ({e.code}): {err_content}")
        except urllib.error.URLError as e:
            raise RuntimeError(f"EAORCS Connection Error: {e.reason}")

    def evaluate_governance(self, domain, context, policies=None):
        payload = {'domain': domain, 'context': context}
        if policies:
            payload['policies'] = policies
        return self._request('POST', '/api/v1/governance/evaluate', payload)

    def get_trust_report(self, entity_id):
        return self._request('GET', f"/api/v1/trust/reports/{entity_id}")

    def verify_audit_proof(self, proof_payload):
        return self._request('POST', '/api/v1/audit/verify', proof_payload)

    def get_osap_passport(self, passport_id):
        return self._request('GET', f"/api/v1/osap/passports/{passport_id}")
`;
    filesWritten.push(this._writeFile(path.join(targetDir, 'eaorcs_sdk', 'client.py'), clientPy));

    // 5. README.md
    const readmePy = `\
# eaorcs-sdk

Official Zero-Dependency Python Developer SDK for EAORCS (Enterprise Autonomous Operation & Regulatory Compliance System).

## Installation

\`\`\`bash
pip install eaorcs-sdk
\`\`\`

## Quick Start

\`\`\`python
from eaorcs_sdk import EaorcsClient

client = EaorcsClient(
    base_url="https://api.eaorcs.enterprise.internal",
    api_key="your-api-key"
)

report = client.get_trust_report("entity-1001")
print("Trust Score:", report.get("trustScore"))
\`\`\`
`;
    filesWritten.push(this._writeFile(path.join(targetDir, 'README.md'), readmePy));

    const totalBytes = filesWritten.reduce((acc, f) => acc + f.bytes, 0);

    return {
      success: true,
      target: 'python',
      packageName: 'eaorcs-sdk',
      outDir: targetDir,
      filesWritten: filesWritten.map(f => f.relative),
      fileCount: filesWritten.length,
      totalBytes
    };
  }

  /**
   * Compiles zero-dependency Java SDK package (com.eaorcs.sdk)
   * @param {string} outDir Target root directory
   */
  buildJavaSdk(outDir) {
    const targetDir = path.join(outDir, 'java');
    const packagePath = path.join(targetDir, 'src', 'main', 'java', 'com', 'eaorcs', 'sdk');
    this._ensureDirSync(packagePath);
    const filesWritten = [];

    // 1. pom.xml
    const pomXml = `\
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.eaorcs</groupId>
    <artifactId>eaorcs-sdk</artifactId>
    <version>2026.1.0</version>
    <name>EAORCS Java SDK</name>
    <description>Official Zero-Dependency Java SDK for EAORCS Platform</description>

    <properties>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

    <!-- Zero external dependencies - uses java.net.http.HttpClient -->
    <dependencies/>
</project>
`;
    filesWritten.push(this._writeFile(path.join(targetDir, 'pom.xml'), pomXml));

    // 2. EaorcsClient.java
    const eaorcsClientJava = `\
package com.eaorcs.sdk;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

public class EaorcsClient {
    private final String baseUrl;
    private final String apiKey;
    private final HttpClient httpClient;

    public EaorcsClient(String baseUrl, String apiKey) {
        this.baseUrl = baseUrl != null ? baseUrl.replaceAll("/$", "") : "${this.baseUrl}";
        this.apiKey = apiKey != null ? apiKey : "";
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    public String evaluateGovernance(String jsonBody) throws Exception {
        return sendPost("/api/v1/governance/evaluate", jsonBody);
    }

    public String getTrustReport(String entityId) throws Exception {
        return sendGet("/api/v1/trust/reports/" + entityId);
    }

    public String verifyAuditProof(String jsonBody) throws Exception {
        return sendPost("/api/v1/audit/verify", jsonBody);
    }

    public String getOsapPassport(String passportId) throws Exception {
        return sendGet("/api/v1/osap/passports/" + passportId);
    }

    private String sendGet(String path) throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl + path))
                .header("Accept", "application/json")
                .header("Authorization", "Bearer " + apiKey)
                .header("User-Agent", "EAORCS-Java-SDK/2026.1.0")
                .GET()
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() >= 200 && response.statusCode() < 300) {
            return response.body();
        }
        throw new RuntimeException("EAORCS API HTTP Error " + response.statusCode() + ": " + response.body());
    }

    private String sendPost(String path, String jsonBody) throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl + path))
                .header("Content-Type", "application/json")
                .header("Accept", "application/json")
                .header("Authorization", "Bearer " + apiKey)
                .header("User-Agent", "EAORCS-Java-SDK/2026.1.0")
                .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() >= 200 && response.statusCode() < 300) {
            return response.body();
        }
        throw new RuntimeException("EAORCS API HTTP Error " + response.statusCode() + ": " + response.body());
    }
}
`;
    filesWritten.push(this._writeFile(path.join(packagePath, 'EaorcsClient.java'), eaorcsClientJava));

    // 3. README.md
    const readmeJava = `\
# com.eaorcs.sdk

Official Zero-Dependency Java Developer SDK for EAORCS (Enterprise Autonomous Operation & Regulatory Compliance System).

## Requirement
- Java 17 or higher
- Standard Java HTTP Client (\`java.net.http.HttpClient\`)

## Usage

\`\`\`java
import com.eaorcs.sdk.EaorcsClient;

public class Main {
    public static void main(String[] args) throws Exception {
        EaorcsClient client = new EaorcsClient("https://api.eaorcs.enterprise.internal", "your-key");
        String reportJson = client.getTrustReport("entity-1001");
        System.out.println("Trust Report: " + reportJson);
    }
}
\`\`\`
`;
    filesWritten.push(this._writeFile(path.join(targetDir, 'README.md'), readmeJava));

    const totalBytes = filesWritten.reduce((acc, f) => acc + f.bytes, 0);

    return {
      success: true,
      target: 'java',
      packageName: 'com.eaorcs.sdk',
      outDir: targetDir,
      filesWritten: filesWritten.map(f => f.relative),
      fileCount: filesWritten.length,
      totalBytes
    };
  }

  /**
   * Compiles OpenAPI REST client specification (openapi.json & openapi.yaml)
   * @param {string} outDir Target root directory
   */
  buildOpenApiSpec(outDir) {
    const targetDir = path.join(outDir, 'openapi');
    this._ensureDirSync(targetDir);
    const filesWritten = [];

    const openApiObject = {
      openapi: '3.0.3',
      info: {
        title: 'EAORCS Platform REST API',
        description: 'Enterprise Autonomous Operation & Regulatory Compliance System Public API Specification',
        version: '2026.1.0',
        contact: {
          name: this.author,
          url: 'https://eaorcs.enterprise.internal/support'
        }
      },
      servers: [
        {
          url: this.baseUrl,
          description: 'Production Enterprise EAORCS Gateway'
        }
      ],
      security: [
        {
          BearerAuth: []
        }
      ],
      paths: {
        '/api/v1/governance/evaluate': {
          post: {
            summary: 'Evaluate Governance Policies',
            operationId: 'evaluateGovernance',
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/GovernanceEvaluationRequest'
                  }
                }
              }
            },
            responses: {
              '200': {
                description: 'Governance evaluation completed successfully',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/GovernanceEvaluationResponse'
                    }
                  }
                }
              }
            }
          }
        },
        '/api/v1/trust/reports/{entityId}': {
          get: {
            summary: 'Get Entity Trust Score Report',
            operationId: 'getTrustReport',
            parameters: [
              {
                name: 'entityId',
                in: 'path',
                required: true,
                schema: { type: 'string' }
              }
            ],
            responses: {
              '200': {
                description: 'Trust report retrieved',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/TrustReport'
                    }
                  }
                }
              }
            }
          }
        },
        '/api/v1/audit/verify': {
          post: {
            summary: 'Verify Audit Evidence Proof',
            operationId: 'verifyAuditProof',
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    required: ['proofId', 'hash'],
                    properties: {
                      proofId: { type: 'string' },
                      hash: { type: 'string' }
                    }
                  }
                }
              }
            },
            responses: {
              '200': {
                description: 'Proof status returned',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        verified: { type: 'boolean' },
                        signature: { type: 'string' }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        '/api/v1/osap/passports/{passportId}': {
          get: {
            summary: 'Get OSAP Passport Metadata',
            operationId: 'getOsapPassport',
            parameters: [
              {
                name: 'passportId',
                in: 'path',
                required: true,
                schema: { type: 'string' }
              }
            ],
            responses: {
              '200': {
                description: 'OSAP Passport details',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/OsapPassport'
                    }
                  }
                }
              }
            }
          }
        }
      },
      components: {
        securitySchemes: {
          BearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        },
        schemas: {
          GovernanceEvaluationRequest: {
            type: 'object',
            required: ['domain', 'context'],
            properties: {
              domain: { type: 'string' },
              context: { type: 'object' },
              policies: { type: 'array', items: { type: 'string' } }
            }
          },
          GovernanceEvaluationResponse: {
            type: 'object',
            properties: {
              status: { type: 'string', enum: ['APPROVED', 'DENIED', 'CONDITIONAL'] },
              evaluations: { type: 'array', items: { type: 'object' } },
              timestamp: { type: 'string', format: 'date-time' }
            }
          },
          TrustReport: {
            type: 'object',
            properties: {
              entityId: { type: 'string' },
              trustScore: { type: 'number', minimum: 0, maximum: 100 },
              tier: { type: 'string', enum: ['GOLD', 'SILVER', 'BRONZE', 'UNTRUSTED'] },
              verifiedAt: { type: 'string', format: 'date-time' }
            }
          },
          OsapPassport: {
            type: 'object',
            properties: {
              passportId: { type: 'string' },
              subject: { type: 'string' },
              issuer: { type: 'string' },
              signature: { type: 'string' }
            }
          }
        }
      }
    };

    // 1. openapi.json
    const openApiJsonStr = JSON.stringify(openApiObject, null, 2);
    filesWritten.push(this._writeFile(path.join(targetDir, 'openapi.json'), openApiJsonStr));

    // 2. openapi.yaml (Basic clean YAML representation without external libraries)
    const openApiYamlStr = `\
openapi: '3.0.3'
info:
  title: 'EAORCS Platform REST API'
  description: 'Enterprise Autonomous Operation & Regulatory Compliance System Public API Specification'
  version: '2026.1.0'
servers:
  - url: '${this.baseUrl}'
    description: 'Production Enterprise EAORCS Gateway'
paths:
  /api/v1/governance/evaluate:
    post:
      summary: 'Evaluate Governance Policies'
      operationId: 'evaluateGovernance'
  /api/v1/trust/reports/{entityId}:
    get:
      summary: 'Get Entity Trust Score Report'
      operationId: 'getTrustReport'
  /api/v1/audit/verify:
    post:
      summary: 'Verify Audit Evidence Proof'
      operationId: 'verifyAuditProof'
  /api/v1/osap/passports/{passportId}:
    get:
      summary: 'Get OSAP Passport Metadata'
      operationId: 'getOsapPassport'
`;
    filesWritten.push(this._writeFile(path.join(targetDir, 'openapi.yaml'), openApiYamlStr));

    // 3. README.md
    const readmeOpenApi = `\
# EAORCS OpenAPI REST Client Specification

This package provides standard OpenAPI 3.0.3 specifications for the EAORCS Platform.

## Usage with Swagger / Codegen

Generate SDKs for 40+ programming languages:

\`\`\`bash
npx @openapitools/openapi-generator-cli generate \\
  -i openapi.json \\
  -g typescript-axios \\
  -o ./generated-client
\`\`\`
`;
    filesWritten.push(this._writeFile(path.join(targetDir, 'README.md'), readmeOpenApi));

    const totalBytes = filesWritten.reduce((acc, f) => acc + f.bytes, 0);

    return {
      success: true,
      target: 'openapi',
      packageName: 'eaorcs-openapi-spec',
      outDir: targetDir,
      filesWritten: filesWritten.map(f => f.relative),
      fileCount: filesWritten.length,
      totalBytes
    };
  }

  /**
   * Compiles all SDKs (Node.js, Python, Java, OpenAPI)
   * @param {string} outDir Output directory
   */
  buildAllSdks(outDir) {
    const startTime = Date.now();

    const nodeJsResult = this.buildNodeJsSdk(outDir);
    const pythonResult = this.buildPythonSdk(outDir);
    const javaResult = this.buildJavaSdk(outDir);
    const openApiResult = this.buildOpenApiSpec(outDir);

    const packages = [nodeJsResult, pythonResult, javaResult, openApiResult];
    const totalFilesWritten = packages.reduce((acc, p) => acc + p.fileCount, 0);
    const totalSizeBytes = packages.reduce((acc, p) => acc + p.totalBytes, 0);
    const buildDurationMs = Date.now() - startTime;

    return {
      success: true,
      buildTimestamp: new Date().toISOString(),
      outDir,
      totalPackages: packages.length,
      totalFilesWritten,
      totalSizeBytes,
      buildDurationMs,
      packages: {
        nodejs: nodeJsResult,
        python: pythonResult,
        java: javaResult,
        openapi: openApiResult
      }
    };
  }
}

module.exports = PublicSdkPackageBuilder;
