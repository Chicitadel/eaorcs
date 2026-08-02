const fs = require('fs');
const path = require('path');

const filesToFix = [
  'engine/hypervisor/VirtualFilesystem.js',
  'engine/hypervisor/EdhHypervisorEngine.js',
  'engine/dcp/DistributionControlPlane.js',
  'engine/kernel/CapabilityBrokerEngine.js',
  'engine/kernel/CapabilityRegistry.js',
  'engine/packaging/CapabilityCapsulePacker.js',
  'engine/packaging/StandardPackagePacker.js',
  'engine/packaging/EnterpriseBundlePacker.js',
  'api/v1/dcp.js'
];

const STANDARD_AUTHOR = 'Architectural Governance Council & Ujomor Systems Engineering (Ujomor Engineering Governance Authority)';
const STANDARD_ORG = 'Air Roofers Platform Ecosystem & Ujomor Systems';
const COPYRIGHT = 'Copyright (c) 2026 Air Roofers Platform Ecosystem & Ujomor Systems';

filesToFix.forEach(file => {
  const p = path.join(__dirname, file);
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf8');
    
    // Replace Author
    content = content.replace(/\* Author\s+:\s+.*/g, `* Author         : ${STANDARD_AUTHOR}`);
    // Replace Organization
    content = content.replace(/\* Organization\s+:\s+.*/g, `* Organization   : ${STANDARD_ORG}`);
    // Replace Copyright
    content = content.replace(/\* Copyright \(c\) .*/g, `* ${COPYRIGHT}`);
    // Check if Governance contains AI Governed
    if (!content.includes('* - AI Governed')) {
      content = content.replace(/\* Governance:\r?\n/, '* Governance:\n * - AI Governed\n');
    }
    // Check if Governance contains Protocol Frozen
    if (!content.includes('* - Protocol Frozen')) {
      content = content.replace(/\* Governance:\r?\n/, '* Governance:\n * - Protocol Frozen\n');
    }
    // Check if Governance contains Architecture Controlled
    if (!content.includes('* - Architecture Controlled')) {
      content = content.replace(/\* Governance:\r?\n/, '* Governance:\n * - Architecture Controlled\n');
    }
    // Check if Governance contains Modularization Enforced
    if (!content.includes('* - Modularization Enforced')) {
      content = content.replace(/\* Governance:\r?\n/, '* Governance:\n * - Modularization Enforced\n');
    }
    
    // Check for Signatures block
    if (!content.includes('* Signatures:')) {
      const sigs = `* Signatures:\n * - Architecture Authority\n * - Security Authority\n * - Governance Authority\n * - Deployment Authority\n *\n `;
      content = content.replace(/\* Copyright/, sigs + '* Copyright');
    }

    fs.writeFileSync(p, content, 'utf8');
    console.log(`Updated header in ${file}`);
  } else {
    console.log(`File not found: ${file}`);
  }
});
