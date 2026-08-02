/******************************************************************************
 * Project        : Universal Autonomous Governance Operating System (UAIGOS)
 * Module         : EAORCS Engine Branding (Stream S2 & S4)
 * File           : BrandingEngine.js
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

const fs = require('fs');
const path = require('path');

let defaultLogoData = null;
try {
    defaultLogoData = require('../../assets/branding/logo_data.json');
} catch (e) {}

/**
 * Embedded Base64 Inline Fallback Strings
 * Guarantees missing image icons NEVER appear in HTML reports, dashboards, executive summaries, or audit certificates.
 */
const EAORCS_DEFAULT_LOGO_BASE64 = (defaultLogoData && defaultLogoData.logo_256) ? defaultLogoData.logo_256 : 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
const EAORCS_DEFAULT_FAVICON_BASE64 = (defaultLogoData && defaultLogoData.logo_32) ? defaultLogoData.logo_32 : 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

/**
 * Multi-tenant branding engine for EAORCS enterprise deployment.
 * Handles tenant-specific logos, corporate color themes, taglines, and custom policy pack injections.
 */
class BrandingEngine {
    /**
     * @param {Object} [defaultBranding={}] - Fallback corporate branding defaults
     */
    constructor(defaultBranding = {}) {
        this.tenantStore = new Map();
        this._cachedLogoBase64 = null;
        this._cachedFaviconBase64 = null;

        const defaultLogo = this.getEaorcsLogoBase64();
        const defaultFavicon = this.getEaorcsFaviconBase64();

        // Default Enterprise Base Theme
        this.defaultTheme = {
            companyName: defaultBranding.companyName || 'EAORCS Governance Suite',
            logoUrl: defaultBranding.logoUrl || defaultLogo,
            darkLogoUrl: defaultBranding.darkLogoUrl || defaultLogo,
            logoBase64: defaultLogo,
            faviconUrl: defaultBranding.faviconUrl || defaultFavicon,
            faviconLinkHtml: `<link rel="icon" type="image/x-icon" href="${defaultBranding.faviconUrl || defaultFavicon}" />`,
            tagline: defaultBranding.tagline || 'Autonomous Governance & Operations Control System',
            subheading: defaultBranding.subheading || 'Enterprise Compliance & Compliance Automation Platform',
            footerText: defaultBranding.footerText || '© 2026 Ujomor Systems Engineering. All Rights Reserved.',
            colors: {
                primary: defaultBranding.colors?.primary || '#0b0f19',
                secondary: defaultBranding.colors?.secondary || '#151c2e',
                bg: defaultBranding.colors?.bg || '#070a12',
                card: defaultBranding.colors?.card || '#0e1424',
                accent: defaultBranding.colors?.accent || '#38bdf8',
                text: defaultBranding.colors?.text || '#ffffff',
                border: defaultBranding.colors?.border || 'rgba(56, 189, 248, 0.2)'
            },
            policyPack: {
                policyPackId: 'STANDARD_ENTERPRISE_PACK_2026',
                version: '1.0.0',
                rules: ['ZERO_TRUST_AUTH', 'AUDIT_TELEMETRY_REQUIRED', 'FROZEN_ARCH_ENFORCED'],
                customHeaders: {
                    'X-EAORCS-Governance': 'Enforced-Standard-v1',
                    'X-Security-Policy': 'Strict-Enterprise'
                },
                complianceOverrides: {}
            }
        };
    }

    /**
     * Retrieves official EAORCS logo as base64 data URI with inline fallback
     * @returns {string} Data URI
     */
    getEaorcsLogoBase64() {
        if (this._cachedLogoBase64) return this._cachedLogoBase64;
        try {
            const possiblePaths = [
                path.join(process.cwd(), 'assets', 'eaorcs_logo.png'),
                path.join(__dirname, '../../assets', 'eaorcs_logo.png'),
                path.join(__dirname, '../../assets/branding', 'eaorcs_logo.png')
            ];
            for (const p of possiblePaths) {
                if (fs.existsSync(p)) {
                    const buf = fs.readFileSync(p);
                    this._cachedLogoBase64 = 'data:image/png;base64,' + buf.toString('base64');
                    return this._cachedLogoBase64;
                }
            }
        } catch (e) {}
        this._cachedLogoBase64 = EAORCS_DEFAULT_LOGO_BASE64;
        return this._cachedLogoBase64;
    }

    /**
     * Retrieves official EAORCS favicon as base64 data URI with inline fallback
     * @returns {string} Data URI
     */
    getEaorcsFaviconBase64() {
        if (this._cachedFaviconBase64) return this._cachedFaviconBase64;
        try {
            const possiblePaths = [
                path.join(process.cwd(), 'assets', 'favicon.ico'),
                path.join(__dirname, '../../assets', 'favicon.ico')
            ];
            for (const p of possiblePaths) {
                if (fs.existsSync(p)) {
                    const buf = fs.readFileSync(p);
                    this._cachedFaviconBase64 = 'data:image/x-icon;base64,' + buf.toString('base64');
                    return this._cachedFaviconBase64;
                }
            }
        } catch (e) {}
        this._cachedFaviconBase64 = EAORCS_DEFAULT_FAVICON_BASE64;
        return this._cachedFaviconBase64;
    }

    /**
     * Resolves complete branding profile following the Fallback Cascade:
     * 1. Customer Brand (customerConfig / context.customerBrand / customerLogo / customerName)
     * 2. Tenant Brand (registered tenant store config or tenantId overrides)
     * 3. EAORCS Brand (assets/eaorcs_logo.png base64 inline fallback)
     * 
     * @param {string} [tenantId] 
     * @param {Object} [customerConfig={}] 
     * @returns {Object} Full resolved branding profile manifest
     */
    resolveBranding(tenantId, customerConfig = {}) {
        let cascadeSource = 'EAORCS Brand';
        
        let tenantRecord = null;
        if (tenantId && this.tenantStore.has(tenantId)) {
            tenantRecord = this.tenantStore.get(tenantId);
            cascadeSource = 'Tenant Brand';
        }

        const cConfig = (typeof customerConfig === 'object' && customerConfig !== null) ? customerConfig : {};
        if (cConfig.companyName || cConfig.customerLogo || cConfig.logoUrl || cConfig.customerName) {
            cascadeSource = 'Customer Brand';
        }

        const defaultLogo = this.getEaorcsLogoBase64();
        const defaultFavicon = this.getEaorcsFaviconBase64();

        const logoUrl = cConfig.customerLogo || cConfig.logoUrl || (tenantRecord && tenantRecord.logoUrl) || this.defaultTheme.logoUrl || defaultLogo;
        const darkLogoUrl = cConfig.darkLogoUrl || (tenantRecord && tenantRecord.darkLogoUrl) || this.defaultTheme.darkLogoUrl || defaultLogo;
        const faviconUrl = cConfig.customerFavicon || cConfig.faviconUrl || (tenantRecord && tenantRecord.faviconUrl) || this.defaultTheme.faviconUrl || defaultFavicon;
        
        const companyName = cConfig.companyName || cConfig.customerName || (tenantRecord && tenantRecord.companyName) || this.defaultTheme.companyName;
        const tagline = cConfig.tagline || (tenantRecord && tenantRecord.tagline) || this.defaultTheme.tagline;
        const subheading = cConfig.subheading || (tenantRecord && tenantRecord.subheading) || this.defaultTheme.subheading;
        const footerText = cConfig.footerText || (tenantRecord && tenantRecord.footerText) || this.defaultTheme.footerText;

        const colors = {
            ...this.defaultTheme.colors,
            ...(tenantRecord?.colors || {}),
            ...(cConfig.colors || {})
        };

        const policyPack = {
            ...this.defaultTheme.policyPack,
            ...(tenantRecord?.policyPack || {}),
            ...(cConfig.policyPack || {})
        };

        const faviconType = faviconUrl.includes('x-icon') ? 'image/x-icon' : (faviconUrl.includes('svg') ? 'image/svg+xml' : 'image/png');
        const faviconLinkHtml = `<link rel="icon" type="${faviconType}" href="${faviconUrl}" />`;

        return {
            tenantId: tenantId || 'default',
            cascadeSource,
            companyName,
            organizationName: cConfig.organizationName || tenantRecord?.organizationName || companyName,
            logoUrl,
            darkLogoUrl,
            logoBase64: defaultLogo,
            faviconUrl,
            faviconLinkHtml,
            tagline,
            subheading,
            footerText,
            colors,
            policyPack
        };
    }

    /**
     * Returns centralized branding manifest object for EAORCS platform components
     * @param {string} [tenantId] 
     * @param {Object} [customerConfig={}] 
     * @returns {Object} Centralized branding manifest
     */
    getBrandManifest(tenantId, customerConfig = {}) {
        const resolved = this.resolveBranding(tenantId, customerConfig);
        return {
            manifestVersion: "2026.1-LTS",
            generatedAt: new Date().toISOString(),
            ...resolved,
            eaorcsOfficialLogoBase64: this.getEaorcsLogoBase64(),
            eaorcsOfficialFaviconBase64: this.getEaorcsFaviconBase64()
        };
    }

    /**
     * Injects SVG/PNG/ICO favicon <link rel="icon" href="..."/> into HTML string
     * @param {string} htmlString 
     * @param {string} [tenantId] 
     * @param {Object} [customerConfig] 
     * @returns {string} HTML string with favicon tag injected in <head>
     */
    injectFaviconToHtml(htmlString, tenantId, customerConfig) {
        if (!htmlString || typeof htmlString !== 'string') return '';
        if (htmlString.includes('rel="icon"') || htmlString.includes("rel='icon'")) {
            return htmlString;
        }
        const brand = this.resolveBranding(tenantId, customerConfig);
        const faviconTag = brand.faviconLinkHtml || `<link rel="icon" type="image/x-icon" href="${brand.faviconUrl}" />`;
        if (htmlString.includes('</head>')) {
            return htmlString.replace('</head>', `    ${faviconTag}\n</head>`);
        }
        return faviconTag + '\n' + htmlString;
    }

    /**
     * Register or update branding profile for a specific tenant
     * @param {string} tenantId 
     * @param {Object} config - Custom logo, colors, taglines, and policy pack
     * @returns {Object} Saved tenant branding record
     */
    registerTenantBranding(tenantId, config = {}) {
        if (!tenantId || typeof tenantId !== 'string') {
            throw new Error('[BrandingEngine] Valid tenantId string is required.');
        }

        const mergedColors = {
            ...this.defaultTheme.colors,
            ...(config.colors || {})
        };

        const mergedPolicyPack = {
            ...this.defaultTheme.policyPack,
            ...(config.policyPack || {})
        };

        const tenantBranding = {
            tenantId,
            companyName: config.companyName || `${tenantId.toUpperCase()} Enterprise`,
            logoUrl: config.logoUrl || this.defaultTheme.logoUrl,
            darkLogoUrl: config.darkLogoUrl || this.defaultTheme.darkLogoUrl,
            faviconUrl: config.faviconUrl || this.defaultTheme.faviconUrl,
            tagline: config.tagline || this.defaultTheme.tagline,
            subheading: config.subheading || this.defaultTheme.subheading,
            footerText: config.footerText || this.defaultTheme.footerText,
            colors: mergedColors,
            policyPack: mergedPolicyPack,
            registeredAt: new Date().toISOString()
        };

        this.tenantStore.set(tenantId, tenantBranding);
        return tenantBranding;
    }

    /**
     * Get resolved branding profile for a tenant (returns default theme if tenant not found)
     * Supports optional customerConfig override to enforce Fallback Cascade: Customer -> Tenant -> EAORCS
     * @param {string} [tenantId] 
     * @param {Object} [customerConfig]
     * @returns {Object} Resolved branding payload
     */
    getTenantBranding(tenantId, customerConfig = {}) {
        return this.resolveBranding(tenantId, customerConfig);
    }

    /**
     * Generate CSS variable block for theme injection into frontend/HTML
     * @param {string} [tenantId] 
     * @param {Object} [customerConfig]
     * @returns {string} CSS :root variables definition
     */
    generateCssVariables(tenantId, customerConfig = {}) {
        const brand = this.resolveBranding(tenantId, customerConfig);
        const c = brand.colors;

        return `:root {
  --brand-primary: ${c.primary};
  --brand-secondary: ${c.secondary};
  --brand-bg: ${c.bg};
  --brand-card: ${c.card};
  --brand-accent: ${c.accent};
  --brand-text: ${c.text};
  --brand-border: ${c.border};
  --brand-logo-url: url("${brand.logoUrl}");
}`;
    }

    /**
     * Inject branding tokens into an HTML/text template string
     * Replaces {{BRAND_COMPANY}}, {{BRAND_TAGLINE}}, {{BRAND_LOGO}}, {{BRAND_PRIMARY}}, {{POLICY_PACK_ID}}, etc.
     * @param {string} templateString 
     * @param {string} [tenantId] 
     * @param {Object} [customerConfig]
     * @returns {string} Interpolated template string
     */
    injectBrandingToTemplate(templateString, tenantId, customerConfig = {}) {
        if (!templateString || typeof templateString !== 'string') {
            return '';
        }

        const brand = this.resolveBranding(tenantId, customerConfig);
        const c = brand.colors;

        let result = templateString;
        result = result.replace(/\{\{BRAND_COMPANY\}\}/g, brand.companyName);
        result = result.replace(/\{\{BRAND_TAGLINE\}\}/g, brand.tagline);
        result = result.replace(/\{\{BRAND_SUBHEADING\}\}/g, brand.subheading);
        result = result.replace(/\{\{BRAND_FOOTER\}\}/g, brand.footerText);
        result = result.replace(/\{\{BRAND_LOGO\}\}/g, brand.logoUrl);
        result = result.replace(/\{\{BRAND_DARK_LOGO\}\}/g, brand.darkLogoUrl);
        result = result.replace(/\{\{BRAND_FAVICON\}\}/g, brand.faviconUrl);
        result = result.replace(/\{\{BRAND_FAVICON_TAG\}\}/g, brand.faviconLinkHtml);

        // Color replacements
        result = result.replace(/\{\{BRAND_PRIMARY\}\}/g, c.primary);
        result = result.replace(/\{\{BRAND_SECONDARY\}\}/g, c.secondary);
        result = result.replace(/\{\{BRAND_BG\}\}/g, c.bg);
        result = result.replace(/\{\{BRAND_CARD\}\}/g, c.card);
        result = result.replace(/\{\{BRAND_ACCENT\}\}/g, c.accent);
        result = result.replace(/\{\{BRAND_TEXT\}\}/g, c.text);
        result = result.replace(/\{\{BRAND_BORDER\}\}/g, c.border);

        // Policy pack replacement
        result = result.replace(/\{\{POLICY_PACK_ID\}\}/g, brand.policyPack.policyPackId);

        // CSS Variables block tag replacement
        result = result.replace(/\{\{BRAND_CSS_VARS\}\}/g, this.generateCssVariables(tenantId, customerConfig));

        return result;
    }

    /**
     * Render tenant branded HTML Header navbar component
     * @param {string} [tenantId] 
     * @param {Object} [customerConfig]
     * @returns {string} HTML component string
     */
    renderHeaderHtml(tenantId, customerConfig = {}) {
        const brand = this.resolveBranding(tenantId, customerConfig);
        const c = brand.colors;

        return `<header class="eaorcs-header" style="background-color: ${c.primary}; color: #ffffff; padding: 1rem 2rem; border-bottom: 2px solid ${c.accent};">
  <div class="eaorcs-header-container" style="display: flex; align-items: center; justify-content: space-between;">
    <div class="eaorcs-brand" style="display: flex; align-items: center; gap: 1rem;">
      <img src="${brand.logoUrl}" alt="${brand.companyName}" style="height: 40px;" onerror="this.src='${brand.logoBase64}';" />
      <div>
        <h1 style="margin: 0; font-size: 1.25rem; font-weight: 700;">${brand.companyName}</h1>
        <p style="margin: 0; font-size: 0.85rem; opacity: 0.85;">${brand.tagline}</p>
      </div>
    </div>
    <div class="eaorcs-policy-badge" style="background: ${c.secondary}; padding: 0.25rem 0.75rem; border-radius: 4px; font-size: 0.75rem;">
      Policy Pack: <strong>${brand.policyPack.policyPackId}</strong>
    </div>
  </div>
</header>`;
    }

    /**
     * Render tenant branded HTML Footer component
     * @param {string} [tenantId] 
     * @param {Object} [customerConfig]
     * @returns {string} HTML component string
     */
    renderFooterHtml(tenantId, customerConfig = {}) {
        const brand = this.resolveBranding(tenantId, customerConfig);
        const c = brand.colors;

        return `<footer class="eaorcs-footer" style="background-color: ${c.bg}; color: ${c.text}; border-top: 1px solid ${c.border}; padding: 1.5rem 2rem; text-align: center;">
  <p style="margin: 0; font-size: 0.875rem;">${brand.footerText}</p>
  <p style="margin: 0.5rem 0 0 0; font-size: 0.75rem; opacity: 0.7;">Powered by EAORCS Engine v2026.1-LTS | Bounded Context: ${brand.tenantId} | Cascade: ${brand.cascadeSource}</p>
</footer>`;
    }

    /**
     * Get HTML <link rel="icon"> tag for tenant branding favicon
     * @param {string} [tenantId] 
     * @param {Object} [customerConfig]
     * @returns {string} HTML link element string
     */
    getFaviconLinkHtml(tenantId, customerConfig = {}) {
        const brand = this.resolveBranding(tenantId, customerConfig);
        if (brand.faviconLinkHtml) return brand.faviconLinkHtml;
        const url = brand.faviconUrl || this.getEaorcsFaviconBase64();
        return `<link rel="icon" type="image/x-icon" href="${url}" />`;
    }

    /**
     * Check if a tenant's policy pack meets required rules
     * @param {string} tenantId 
     * @param {string} requiredRule 
     * @returns {boolean}
     */
    hasPolicyRule(tenantId, requiredRule) {
        const brand = this.resolveBranding(tenantId);
        const rules = brand.policyPack?.rules || [];
        return rules.includes(requiredRule) || rules.includes('*');
    }
}

module.exports = BrandingEngine;
module.exports.BrandingEngine = BrandingEngine;


