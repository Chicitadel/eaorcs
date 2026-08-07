/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Stream 3 Platform Governance Test
 * File           : eaorcs_corp_stream3_platform_governance.test.js
 * Version        : 2026.3.1-LTS
 * Author         : Ujomor Systems & Enterprise Governance Authority
 * Organization   : Ujomor Systems & Enterprise Governance
 * Created Date   : 2026-08-07
 * Last Modified  : 2026-08-07
 * Classification : ENTERPRISE | RESTRICTED
 *
 * Governance:
 * - Security Reviewed
 * - Architecture Controlled
 * - Protocol Frozen
 * - Modularization Enforced
 * - Corporate Policy Governed
 *
 * CORP: Stream 3 Platform Governance & Master Index
 *
 * Standards:
 * - ISO 27001
 * - SOC 2
 * - OWASP ASVS
 * - NIST
 *
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('[EAORCS Stream 3 Test] Starting verification of Platform Governance & Master Index deliverables...');

// Root path determination
const rootDir = path.resolve(__dirname, '../../../../');

// 1. Verify 00_MASTER_GOVERNANCE_INDEX.md
const masterIndexFile = path.join(rootDir, '00_engineering_guide', '00_MASTER_GOVERNANCE_INDEX.md');
assert.strictEqual(fs.existsSync(masterIndexFile), true, '00_MASTER_GOVERNANCE_INDEX.md must exist');
const masterIndexContent = fs.readFileSync(masterIndexFile, 'utf8');

const expectedLevels = [
  'Level 0: Corporate Governance',
  'Level 1: UAIGOS Constitution',
  'Level 2: EAORCS Governance Blueprint',
  'Level 3: Enterprise Architecture Standards',
  'Level 4: Reference Architectures',
  'Level 5: Product-Specific ADRs',
  'Level 6: Implementation Guides',
  'Level 7: Generated Documentation'
];

expectedLevels.forEach((level) => {
  assert.ok(masterIndexContent.includes(level), `Master index must contain hierarchy definition: ${level}`);
});

for (let i = 1; i <= 20; i++) {
  const sectionNum = String(i).padStart(2, '0');
  assert.ok(
    masterIndexContent.includes(`Section ${sectionNum}:`),
    `Master index must outline Section ${sectionNum} of 20-section engineering guide hierarchy`
  );
}
console.log('✓ 00_MASTER_GOVERNANCE_INDEX.md verified (8 hierarchy levels, 20 sections).');

// 2. Verify product.schema.json
const productSchemaFile = path.join(rootDir, 'schemas', 'product.schema.json');
assert.strictEqual(fs.existsSync(productSchemaFile), true, 'product.schema.json must exist');
const productSchema = JSON.parse(fs.readFileSync(productSchemaFile, 'utf8'));
assert.strictEqual(productSchema.title, 'UAIGOS Product Descriptor Schema');
assert.ok(productSchema.properties.product_id, 'product.schema.json must define product_id');
assert.ok(productSchema.properties.governance, 'product.schema.json must define governance');
console.log('✓ product.schema.json verified (valid JSON schema).');

// 3. Verify architecture.schema.json
const archSchemaFile = path.join(rootDir, 'schemas', 'architecture.schema.json');
assert.strictEqual(fs.existsSync(archSchemaFile), true, 'architecture.schema.json must exist');
const archSchema = JSON.parse(fs.readFileSync(archSchemaFile, 'utf8'));
assert.strictEqual(archSchema.title, 'UAIGOS Architecture Specification Schema');
assert.ok(archSchema.properties.architecture_id, 'architecture.schema.json must define architecture_id');
assert.ok(archSchema.properties.components, 'architecture.schema.json must define components');
console.log('✓ architecture.schema.json verified (valid JSON schema).');

// 4. Verify .governance/references.yaml
const referencesFile = path.join(rootDir, '.governance', 'references.yaml');
assert.strictEqual(fs.existsSync(referencesFile), true, 'references.yaml must exist');
const referencesContent = fs.readFileSync(referencesFile, 'utf8');
assert.ok(referencesContent.includes('00_MASTER_GOVERNANCE_INDEX.md'), 'references.yaml must reference master governance index');
assert.ok(referencesContent.includes('UAIGOS Constitution'), 'references.yaml must reference UAIGOS Constitution');
assert.ok(referencesContent.includes('schemas/product.schema.json'), 'references.yaml must reference product schema');
console.log('✓ .governance/references.yaml verified.');

// 5. Verify Release_Engineering_Standard.md
const releaseStdFile = path.join(rootDir, '00_engineering_guide', 'standards', 'Release_Engineering_Standard.md');
assert.strictEqual(fs.existsSync(releaseStdFile), true, 'Release_Engineering_Standard.md must exist');
const releaseStdContent = fs.readFileSync(releaseStdFile, 'utf8');
assert.ok(releaseStdContent.includes('Level 3 (Enterprise Architecture Standards)'), 'Release standard must specify Level 3 authority');
assert.ok(releaseStdContent.includes('00_MASTER_GOVERNANCE_INDEX.md'), 'Release standard must reference 00_MASTER_GOVERNANCE_INDEX.md');
console.log('✓ Release_Engineering_Standard.md verified.');

// 6. Verify cross-references in existing docs
const packagingWorkflowFile = path.join(rootDir, '00_engineering_guide', 'product_packaging_and_generation_workflow.md');
const packagingContent = fs.readFileSync(packagingWorkflowFile, 'utf8');
assert.ok(packagingContent.includes('00_MASTER_GOVERNANCE_INDEX.md'), 'product_packaging_and_generation_workflow.md must reference 00_MASTER_GOVERNANCE_INDEX.md');

const integrationGuideFile = path.join(rootDir, '00_engineering_guide', 'Air_Roofers_Product_Integration_Guide.md');
const integrationContent = fs.readFileSync(integrationGuideFile, 'utf8');
assert.ok(integrationContent.includes('00_MASTER_GOVERNANCE_INDEX.md'), 'Air_Roofers_Product_Integration_Guide.md must reference 00_MASTER_GOVERNANCE_INDEX.md');
console.log('✓ Cross-references in existing workflow & integration guides verified.');

console.log('\n[EAORCS Stream 3 Test] ALL CHECKS PASSED SUCCESSFULLY.');
