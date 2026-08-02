/******************************************************************************
 * Project        : EAORCS - The Software Trust Platform
 * Module         : Blueprint Traceability
 * File           : TraceabilityGraphEngine.js
 * Version        : 2026.1.0-LTS
 * Author         : Ujomor Systems Engineering & Governance Authority
 * Organization   : Ujomor Systems
 * Created Date   : 2026-08-01
 * Classification : ENTERPRISE | GOVERNMENT
 * Standards      : ISO 27001, SOC 2, OWASP ASVS, NIST
 * Copyright (c) 2026 Ujomor Systems. All Rights Reserved.
 ******************************************************************************/

'use strict';
const fs = require('fs');
const path = require('path');
const { BlueprintRequirementRegistry } = require('./BlueprintRequirementRegistry');

class TraceabilityGraphEngine {
  constructor(rootDir) {
    this.rootDir = rootDir || path.resolve(__dirname, '../..');
    this.registry = new BlueprintRequirementRegistry();
    this.nodes = new Map();  // id -> { type, label, path }
    this.edges = [];         // { from, to, relation }
  }

  buildGraph() {
    this.nodes.clear();
    this.edges = [];

    const sections = this.registry.getAllSections();
    const uniqueModules = new Set();
    const uniqueTests = new Set();

    for (const section of sections) {
      const sectionNodeId = `section_${section.id}`;
      this.nodes.set(sectionNodeId, {
        id: sectionNodeId,
        type: 'section',
        label: section.title,
        path: `Section ${section.id}`
      });

      if (Array.isArray(section.mappedModules)) {
        for (const modPath of section.mappedModules) {
          uniqueModules.add(modPath);
          const modNodeId = `module_${modPath}`;
          if (!this.nodes.has(modNodeId)) {
            this.nodes.set(modNodeId, {
              id: modNodeId,
              type: 'module',
              label: modPath,
              path: modPath
            });
          }
          this.edges.push({
            from: sectionNodeId,
            to: modNodeId,
            relation: 'implements'
          });
        }
      }

      if (Array.isArray(section.mappedTests)) {
        for (const testPath of section.mappedTests) {
          uniqueTests.add(testPath);
          const testNodeId = `test_${testPath}`;
          if (!this.nodes.has(testNodeId)) {
            this.nodes.set(testNodeId, {
              id: testNodeId,
              type: 'test',
              label: testPath,
              path: testPath
            });
          }

          if (Array.isArray(section.mappedModules) && section.mappedModules.length > 0) {
            for (const modPath of section.mappedModules) {
              const modNodeId = `module_${modPath}`;
              this.edges.push({
                from: modNodeId,
                to: testNodeId,
                relation: 'tested_by'
              });
            }
          } else {
            this.edges.push({
              from: sectionNodeId,
              to: testNodeId,
              relation: 'tested_by'
            });
          }
        }
      }
    }

    return {
      nodes: Array.from(this.nodes.values()),
      edges: this.edges,
      sections: sections.length,
      modules: uniqueModules.size,
      tests: uniqueTests.size
    };
  }

  findGaps() {
    const gaps = [];
    const sections = this.registry.getAllSections();

    for (const section of sections) {
      const missingModules = !Array.isArray(section.mappedModules) || section.mappedModules.length === 0;
      const missingTests = !Array.isArray(section.mappedTests) || section.mappedTests.length === 0;

      if (missingModules || missingTests) {
        gaps.push({
          sectionId: section.id,
          title: section.title,
          missingModules,
          missingTests
        });
      }
    }

    return gaps;
  }

  computeCoverageScore() {
    const sections = this.registry.getAllSections();
    const total = sections.length;
    let covered = 0;

    for (const section of sections) {
      const hasModules = Array.isArray(section.mappedModules) && section.mappedModules.length > 0;
      const hasTests = Array.isArray(section.mappedTests) && section.mappedTests.length > 0;
      if (hasModules && hasTests) {
        covered++;
      }
    }

    const score = total > 0 ? (covered / total) * 100 : 0;
    return {
      score: Number(score.toFixed(2)),
      covered,
      total
    };
  }

  exportGraph() {
    const graph = this.buildGraph();
    return {
      ...graph,
      gaps: this.findGaps(),
      coverage: this.computeCoverageScore()
    };
  }
}

module.exports = { TraceabilityGraphEngine };
