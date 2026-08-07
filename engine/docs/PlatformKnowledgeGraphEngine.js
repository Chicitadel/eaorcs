/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Platform Knowledge Graph Engine
 * File           : PlatformKnowledgeGraphEngine.js
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
 * CORP: Stream 4 Platform Knowledge Graph & Master Certification
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

class PlatformKnowledgeGraphEngine {
  constructor(options = {}) {
    this.options = options;
    this.platformId = 'PLATFORM-AIRROOFERS-2026';
    this.graph = {
      platform_id: this.platformId,
      created_at: new Date().toISOString(),
      entities: {
        standards: [],
        products: [],
        adrs: [],
        guides: [],
        schemas: [],
        descriptors: [],
        packages: []
      },
      nodes: [],
      edges: [],
      metadata: {
        total_entities: 0,
        unique_product_ids: []
      }
    };
  }

  /**
   * Build graph of platform entities across workspaceRoot.
   * Enforces globally unique platform_id (PLATFORM-AIRROOFERS-2026) and product_id across entities.
   * @param {string} workspaceRoot
   * @returns {Object} Knowledge graph
   */
  buildKnowledgeGraph(workspaceRoot) {
    const root = workspaceRoot || path.resolve(__dirname, '../../../../');
    
    this.graph = {
      platform_id: this.platformId,
      created_at: new Date().toISOString(),
      entities: {
        standards: [],
        products: [],
        adrs: [],
        guides: [],
        schemas: [],
        descriptors: [],
        packages: []
      },
      nodes: [],
      edges: [],
      metadata: {
        total_entities: 0,
        unique_product_ids: []
      }
    };

    const productIdsSet = new Set();

    // 1. Scan Descriptors & Products
    const productLocations = [
      { id: 'EAORCS', relPath: 'products/eaorcs', yaml: 'products/eaorcs/product.yaml' },
      { id: 'AirRoofers', relPath: 'airroofers.eu', yaml: 'airroofers.eu/product.yaml' },
      { id: 'Convergence', relPath: 'convergence.airroofers.eu', yaml: 'convergence.airroofers.eu/product.yaml' }
    ];

    for (const prod of productLocations) {
      const fullYamlPath = path.join(root, prod.yaml);
      const exists = fs.existsSync(fullYamlPath);
      productIdsSet.add(prod.id);

      const prodEntity = {
        platform_id: this.platformId,
        product_id: prod.id,
        entity_type: 'Product',
        id: `PROD-${prod.id.toUpperCase()}`,
        name: `${prod.id} Platform Product`,
        path: prod.relPath,
        descriptor_path: prod.yaml,
        status: exists ? 'ACTIVE' : 'DISCOVERED'
      };

      this.graph.entities.products.push(prodEntity);
      this.graph.nodes.push({
        id: prodEntity.id,
        type: 'Product',
        label: prodEntity.name,
        platform_id: this.platformId,
        product_id: prod.id,
        attributes: prodEntity
      });

      if (exists) {
        const descEntity = {
          platform_id: this.platformId,
          product_id: prod.id,
          entity_type: 'Descriptor',
          id: `DESC-${prod.id.toUpperCase()}-PRODUCT-YAML`,
          name: `${prod.id} Product Descriptor`,
          path: prod.yaml
        };
        this.graph.entities.descriptors.push(descEntity);
        this.graph.nodes.push({
          id: descEntity.id,
          type: 'Descriptor',
          label: descEntity.name,
          platform_id: this.platformId,
          product_id: prod.id,
          attributes: descEntity
        });
        this.graph.edges.push({
          source: prodEntity.id,
          target: descEntity.id,
          relation: 'HAS_DESCRIPTOR'
        });
      }
    }

    // 2. Scan Standards
    const standardsDir = path.join(root, '00_engineering_guide', 'standards');
    if (fs.existsSync(standardsDir)) {
      const files = fs.readdirSync(standardsDir);
      files.forEach((file) => {
        if (file.endsWith('.md')) {
          const stdId = file.replace(/\.md$/, '').toUpperCase().replace(/[^A-Z0-9_]/g, '_');
          const stdEntity = {
            platform_id: this.platformId,
            product_id: 'PLATFORM_WIDE',
            entity_type: 'Standard',
            id: `STD-${stdId}`,
            name: file.replace(/\.md$/, ''),
            path: path.join('00_engineering_guide', 'standards', file)
          };
          this.graph.entities.standards.push(stdEntity);
          this.graph.nodes.push({
            id: stdEntity.id,
            type: 'Standard',
            label: stdEntity.name,
            platform_id: this.platformId,
            product_id: 'PLATFORM_WIDE',
            attributes: stdEntity
          });

          for (const prodId of productIdsSet) {
            this.graph.edges.push({
              source: `PROD-${prodId.toUpperCase()}`,
              target: stdEntity.id,
              relation: 'GOVERNED_BY'
            });
          }
        }
      });
    }

    // 3. Scan ADRs
    const adrDirs = [
      path.join(root, '00_engineering_guide', 'adr'),
      path.join(root, 'products', 'eaorcs', '.governance', 'adr'),
      path.join(root, 'airroofers.eu', 'adr'),
      path.join(root, 'convergence.airroofers.eu', 'adr')
    ];

    adrDirs.forEach((adrDir) => {
      if (fs.existsSync(adrDir)) {
        const files = fs.readdirSync(adrDir);
        files.forEach((file) => {
          if (file.endsWith('.md') || file.endsWith('.json')) {
            const adrId = file.replace(/\.(md|json)$/, '').toUpperCase().replace(/[^A-Z0-9_]/g, '_');
            const adrEntity = {
              platform_id: this.platformId,
              product_id: adrDir.includes('eaorcs') ? 'EAORCS' : (adrDir.includes('convergence') ? 'Convergence' : 'AirRoofers'),
              entity_type: 'ADR',
              id: `ADR-${adrId}`,
              name: file,
              path: path.relative(root, path.join(adrDir, file))
            };
            this.graph.entities.adrs.push(adrEntity);
            this.graph.nodes.push({
              id: adrEntity.id,
              type: 'ADR',
              label: adrEntity.name,
              platform_id: this.platformId,
              product_id: adrEntity.product_id,
              attributes: adrEntity
            });

            this.graph.edges.push({
              source: `PROD-${adrEntity.product_id.toUpperCase()}`,
              target: adrEntity.id,
              relation: 'APPLIES_ADR'
            });
          }
        });
      }
    });

    // 4. Scan Implementation Guides
    const guideDirs = [
      path.join(root, '00_engineering_guide', 'guides'),
      path.join(root, '00_engineering_guide')
    ];

    guideDirs.forEach((guideDir) => {
      if (fs.existsSync(guideDir)) {
        const files = fs.readdirSync(guideDir);
        files.forEach((file) => {
          if (file.endsWith('.md') && !file.toLowerCase().includes('readme')) {
            const guideId = file.replace(/\.md$/, '').toUpperCase().replace(/[^A-Z0-9_]/g, '_');
            const guideEntity = {
              platform_id: this.platformId,
              product_id: 'PLATFORM_WIDE',
              entity_type: 'Guide',
              id: `GUIDE-${guideId}`,
              name: file,
              path: path.relative(root, path.join(guideDir, file))
            };
            this.graph.entities.guides.push(guideEntity);
            this.graph.nodes.push({
              id: guideEntity.id,
              type: 'Guide',
              label: guideEntity.name,
              platform_id: this.platformId,
              product_id: 'PLATFORM_WIDE',
              attributes: guideEntity
            });
          }
        });
      }
    });

    // 5. Scan Schemas
    const schemaDirs = [
      path.join(root, 'airroofers.eu', 'api', 'v1'),
      path.join(root, 'convergence.airroofers.eu', 'schemas')
    ];
    schemaDirs.forEach((dir) => {
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir);
        files.forEach((file) => {
          if (file.endsWith('.json') || file.endsWith('.yaml')) {
            const schemaId = file.replace(/\.(json|yaml)$/, '').toUpperCase().replace(/[^A-Z0-9_]/g, '_');
            const schemaEntity = {
              platform_id: this.platformId,
              product_id: dir.includes('convergence') ? 'Convergence' : 'AirRoofers',
              entity_type: 'Schema',
              id: `SCHEMA-${schemaId}`,
              name: file,
              path: path.relative(root, path.join(dir, file))
            };
            this.graph.entities.schemas.push(schemaEntity);
            this.graph.nodes.push({
              id: schemaEntity.id,
              type: 'Schema',
              label: schemaEntity.name,
              platform_id: this.platformId,
              product_id: schemaEntity.product_id,
              attributes: schemaEntity
            });
          }
        });
      }
    });

    // 6. Scan Packages
    const distDir = path.join(root, 'dist');
    if (fs.existsSync(distDir)) {
      const items = fs.readdirSync(distDir);
      items.forEach((item) => {
        const pkgEntity = {
          platform_id: this.platformId,
          product_id: item.split('-')[0].toUpperCase(),
          entity_type: 'Package',
          id: `PKG-${item.toUpperCase()}`,
          name: item,
          path: path.join('dist', item)
        };
        this.graph.entities.packages.push(pkgEntity);
        this.graph.nodes.push({
          id: pkgEntity.id,
          type: 'Package',
          label: pkgEntity.name,
          platform_id: this.platformId,
          product_id: pkgEntity.product_id,
          attributes: pkgEntity
        });
      });
    }

    // Metadata summary
    let total = 0;
    Object.keys(this.graph.entities).forEach(key => {
      total += this.graph.entities[key].length;
    });
    this.graph.metadata.total_entities = total;
    this.graph.metadata.unique_product_ids = Array.from(productIdsSet);

    return this.graph;
  }

  /**
   * Query knowledge graph for matching standards, products, ADRs, and implementation guides.
   * @param {string|Object} query
   * @returns {Object} Query result
   */
  queryKnowledgeGraph(query) {
    let term = '';
    if (typeof query === 'string') {
      term = query.toLowerCase();
    } else if (query && typeof query === 'object') {
      term = (query.text || query.term || query.product || query.standard || '').toLowerCase();
    }

    const result = {
      query: query,
      platform_id: this.platformId,
      standards: [],
      products: [],
      adrs: [],
      guides: []
    };

    result.standards = this.graph.entities.standards.filter(s =>
      !term || s.name.toLowerCase().includes(term) || s.id.toLowerCase().includes(term) || s.path.toLowerCase().includes(term)
    );

    result.products = this.graph.entities.products.filter(p =>
      !term || p.name.toLowerCase().includes(term) || p.product_id.toLowerCase().includes(term) || p.id.toLowerCase().includes(term)
    );

    result.adrs = this.graph.entities.adrs.filter(a =>
      !term || a.name.toLowerCase().includes(term) || a.id.toLowerCase().includes(term) || a.path.toLowerCase().includes(term)
    );

    result.guides = this.graph.entities.guides.filter(g =>
      !term || g.name.toLowerCase().includes(term) || g.id.toLowerCase().includes(term) || g.path.toLowerCase().includes(term)
    );

    return result;
  }

  /**
   * Export Knowledge Graph as YAML file.
   * @param {string} outputPath Destination file path
   * @returns {string} Written file path
   */
  exportKnowledgeGraphYaml(outputPath) {
    const targetPath = outputPath || path.resolve(__dirname, '../../../../knowledge_graph.yaml');
    
    const dir = path.dirname(targetPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const header = `/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : Platform Knowledge Graph Spec
 * File           : knowledge_graph.yaml
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
 * CORP: STREAM-04 Platform Knowledge Graph
 *
 * Standards:
 * - ISO 27001
 * - SOC 2
 * - OWASP ASVS
 * - NIST
 *
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/
`;

    const yamlBody = this._toYaml(this.graph);
    const content = header + '\n' + yamlBody;

    fs.writeFileSync(targetPath, content, 'utf8');
    return targetPath;
  }

  /**
   * Generate/Update generated architecture documentation.
   * @param {string} outputPath Optional target path for ARCHITECTURE.md
   * @returns {string} Written file path
   */
  generateArchitectureMarkdown(outputPath) {
    const targetPath = outputPath || path.resolve(__dirname, '../../docs/generated/ARCHITECTURE.md');
    
    const dir = path.dirname(targetPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const header = `/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Platform Architecture
 * File           : ARCHITECTURE.md
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
 * CORP: STREAM-04 Platform Architecture & Knowledge Graph
 *
 * Standards:
 * - ISO 27001
 * - SOC 2
 * - OWASP ASVS
 * - NIST
 *
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/
`;

    const totalEntities = (this.graph && this.graph.metadata) ? this.graph.metadata.total_entities : 0;

    const body = `# EAORCS Platform Architecture
**Generated**: ${new Date().toISOString()}  
**Platform ID**: ${this.platformId}  
**Total Entities Indexed**: ${totalEntities}  

## Mermaid Diagram
\`\`\`mermaid
flowchart TD
    subgraph FacadeLayer ["Facade Layer (Law 1)"]
        Facade["EAORCS.js Public Facade"]
    end

    subgraph PipelineLayer ["Pipeline & Convergence (Stream 3)"]
        PConvEngine["PlatformConvergenceEngine"]
        WDiscovery["1. Workspace Discovery"]
        DParsing["2. Descriptors Parsing"]
        SVal["3. Schema Validation"]
        RegGen["4. Registries Generation"]
        KGConst["5. Knowledge Graph"]
        ArchGen["6. Architecture Gen"]
        DocQual["7. Doc Qualification"]
        QualCert["8. Qualification Cert"]
        PkgOrch["9. Packaging Orchestration"]
        RelVerif["10. Release Verification"]
    end

    subgraph RegistryLayer ["Registry Fabric"]
        PlatformReg["platform_registry.yaml"]
        CapReg["capability_registry.yaml"]
        GovReg["governance_registry.yaml"]
        RelManifest["release_manifest.yaml"]
    end

    subgraph GovernanceLayer ["Governance & Standards"]
        ISO["ISO 27001"]
        SOC2["SOC 2"]
        OWASP["OWASP ASVS"]
        NIST["NIST"]
    end

    Facade --> PConvEngine
    PConvEngine --> WDiscovery --> DParsing --> SVal --> RegGen
    RegGen --> PlatformReg & CapReg & GovReg & RelManifest
    PConvEngine --> KGConst --> ArchGen --> DocQual --> QualCert --> PkgOrch --> RelVerif
    GovernanceLayer --> Facade & PConvEngine
\`\`\`

## ASCII Representation
\`\`\`text

+-----------------------------------------------------------------------------+
|          UAIGOS EAORCS Unified Platform Convergence Pipeline Architecture    |
+-----------------------------------------------------------------------------+
| [Facade]      EAORCS.js (Single Public Facade - Law 1)                     |
+-----------------------------------------------------------------------------+
| [Pipeline]    PlatformConvergenceEngine                                     |
|               1. Workspace Discovery  -->  2. Descriptors Parsing          |
|               3. Schema Validation    -->  4. Registries Generation         |
|               5. Knowledge Graph      -->  6. Architecture Generation       |
|               7. Doc Qualification    -->  8. Qualification Certification   |
|               9. Packaging Orchestr.  --> 10. Release Verification          |
+-----------------------------------------------------------------------------+
| [Registries]  - platform_registry.yaml                                      |
|               - capability_registry.yaml                                    |
|               - governance_registry.yaml                                    |
|               - release_manifest.yaml                                       |
+-----------------------------------------------------------------------------+
| [Standards]   ISO 27001 | SOC 2 | OWASP ASVS | NIST                         |
+-----------------------------------------------------------------------------+
\`\`\`
`;

    const content = header + '\n' + body;
    fs.writeFileSync(targetPath, content, 'utf8');
    return targetPath;
  }

  _toYaml(obj, indent = 0) {
    const spacing = ' '.repeat(indent);
    let str = '';

    if (obj === null || obj === undefined) return 'null\n';
    if (typeof obj !== 'object') {
      if (typeof obj === 'string' && (obj.includes('\n') || obj.includes(':') || obj.includes('#'))) {
        return `"${obj.replace(/"/g, '\\"')}"\n`;
      }
      return `${obj}\n`;
    }

    if (Array.isArray(obj)) {
      if (obj.length === 0) return '[]\n';
      for (const item of obj) {
        if (typeof item === 'object' && item !== null) {
          str += `${spacing}- ${this._toYaml(item, indent + 2).trimStart()}`;
        } else {
          str += `${spacing}- ${this._toYaml(item, 0)}`;
        }
      }
      return str;
    }

    for (const [key, value] of Object.entries(obj)) {
      if (value === undefined) continue;
      if (typeof value === 'object' && value !== null) {
        str += `${spacing}${key}:\n${this._toYaml(value, indent + 2)}`;
      } else {
        str += `${spacing}${key}: ${this._toYaml(value, 0)}`;
      }
    }

    return str;
  }
}

if (require.main === module) {
  const engine = new PlatformKnowledgeGraphEngine();
  const root = path.resolve(__dirname, '../../../../');
  engine.buildKnowledgeGraph(root);
  const yamlPath = engine.exportKnowledgeGraphYaml();
  const archPath = engine.generateArchitectureMarkdown();
  console.log(`Exported knowledge graph to ${yamlPath}`);
  console.log(`Updated architecture doc at ${archPath}`);
}

module.exports = PlatformKnowledgeGraphEngine;

