/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Reporting Engine (Stream 1)
 * File           : engine/reporting/DynamicBrandingService.js
 * Version        : 2026.1-LTS (v1.0.0-FROZEN)
 * Author         : Enterprise Systems Engineering & Governance Authority
 * Organization   : Ujomor Enterprise Systems
 * Created Date   : 2026-08-06
 * Last Modified  : 2026-08-06
 * Classification : GOVERNMENT | ENTERPRISE | RESTRICTED
 *
 * Governance:
 * - Enterprise Governance Enforced
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
 * Signatures:
 * - Architecture Authority
 * - Security Authority
 * - Governance Authority
 * - Deployment Authority
 *
 * Copyright (c) 2026 Ujomor Enterprise Systems
 * All Rights Reserved.
 ******************************************************************************/

'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Embedded Base64 Inline Fallback SVG Logos
 * Guarantees report generation and dashboard UI rendering NEVER show missing image icons.
 */
const DEFAULT_PLATFORM_LOGO_SVG = `data:image/svg+xml;base64,${Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <defs>
    <linearGradient id="pGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
    <linearGradient id="aGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#0284c7"/>
    </linearGradient>
  </defs>
  <rect width="256" height="256" rx="32" fill="url(#pGrad)"/>
  <path d="M64 80 L128 48 L192 80 L192 176 L128 208 L64 176 Z" fill="none" stroke="url(#aGrad)" stroke-width="12" stroke-linejoin="round"/>
  <path d="M128 48 L128 208 M64 80 L192 176 M192 80 L64 176" fill="none" stroke="url(#aGrad)" stroke-width="6" opacity="0.6"/>
  <circle cx="128" cy="128" r="24" fill="#38bdf8"/>
</svg>
`).toString('base64')}`;

const DEFAULT_CUSTOMER_LOGO_SVG = `data:image/svg+xml;base64,${Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <rect width="256" height="256" rx="32" fill="#1e293b"/>
  <circle cx="128" cy="100" r="40" fill="none" stroke="#64748b" stroke-width="10"/>
  <path d="M64 200 C64 160 92 150 128 150 C164 150 192 160 192 200" fill="none" stroke="#64748b" stroke-width="10" stroke-linecap="round"/>
</svg>
`).toString('base64')}`;

/**
 * Built-in localization dictionary for common report labels.
 */
const DEFAULT_TRANSLATIONS = {
    'en-US': {
        'report_title': 'Enterprise Governance Audit & Compliance Report',
        'executive_summary': 'Executive Summary',
        'risk_score': 'Risk Score',
        'findings_count': 'Total Findings',
        'classification': 'Classification',
        'generated_date': 'Generated Date',
        'tenant': 'Tenant Organization',
        'architecture_type': 'Architecture Model',
        'compliance_status': 'Compliance Conformance Status',
        'legal_hold_active': 'LEGAL HOLD ACTIVE: Immutability Freeze Enforced',
        'confidentiality_notice': 'CONFIDENTIAL & PROPRIETARY - RESTRICTED DISTRIBUTION'
    },
    'de-DE': {
        'report_title': 'Enterprise Governance Audit- & Compliance-Bericht',
        'executive_summary': 'Management-Zusammenfassung',
        'risk_score': 'Risikobewertung',
        'findings_count': 'Gesamtzahl der Befunde',
        'classification': 'Klassifizierung',
        'generated_date': 'Erstellungsdatum',
        'tenant': 'Mandanten-Organisation',
        'architecture_type': 'Architekturmodell',
        'compliance_status': 'Compliance-Konformitätsstatus',
        'legal_hold_active': 'RECHTLICHE SPERRE AKTIV: Unveränderlichkeitsfreeze erzwungen',
        'confidentiality_notice': 'VERTRAULICH & PROPRIETÄR - EINGESCHRÄNKTER VERTEILER'
    },
    'fr-FR': {
        'report_title': "Rapport d'Audit de Gouvernance d'Entreprise et de Conformité",
        'executive_summary': 'Résumé Exécutif',
        'risk_score': 'Score de Risque',
        'findings_count': 'Nombre de Constats',
        'classification': 'Classification',
        'generated_date': 'Date de Génération',
        'tenant': 'Organisation Cliente',
        'architecture_type': "Modèle d'Architecture",
        'compliance_status': 'Statut de Conformité',
        'legal_hold_active': 'GEL JURIDIQUE ACTIF: Gel d\'immutabilité appliqué',
        'confidentiality_notice': 'CONFIDENTIEL ET PROPRIÉTAIRE - DIFFUSION RESTREINTE'
    },
    'es-ES': {
        'report_title': 'Informe de Auditoría de Gobernanza Empresarial y Cumplimiento',
        'executive_summary': 'Resumen Ejecutivo',
        'risk_score': 'Puntuación de Riesgo',
        'findings_count': 'Hallazgos Totales',
        'classification': 'Clasificación',
        'generated_date': 'Fecha de Generación',
        'tenant': 'Organización Cliente',
        'architecture_type': 'Modelo de Arquitectura',
        'compliance_status': 'Estado de Cumplimiento',
        'legal_hold_active': 'RETENCIÓN LEGAL ACTIVA: Congelación de Inmutabilidad Enforzada',
        'confidentiality_notice': 'CONFIDENCIAL Y PROPIETARIO - DISTRIBUCIÓN RESTRINGIDA'
    }
};

/**
 * DynamicBrandingService
 * Provides white-label custom branding capabilities including platform/customer logos,
 * watermark generation, customizable color themes, typography, multi-language localization,
 * currency formatting, and legal disclaimer injections.
 */
class DynamicBrandingService {
    /**
     * Static helper to get branding configuration
     */
    static getBranding(initialBranding = {}) {
        const service = new DynamicBrandingService(initialBranding);
        return service.getBranding();
    }

    /**
     * @param {Object} [initialBranding={}] Optional custom branding settings
     * @param {Object} [options={}] Optional service options
     */
    constructor(initialBranding = {}, options = {}) {
        this.options = {
            allowInlineStyleInjection: true,
            defaultLocale: 'en-US',
            ...options
        };

        this.branding = {
            companyName: 'Enterprise Governance Platform',
            customLogo: DEFAULT_PLATFORM_LOGO_SVG,
            customerLogo: DEFAULT_CUSTOMER_LOGO_SVG,
            showDualLogo: false,

            watermark: {
                enabled: true,
                text: 'CONFIDENTIAL & PROPRIETARY',
                opacity: 0.08,
                fontSize: '54px',
                rotation: -30,
                color: 'rgba(15, 23, 42, 0.12)'
            },

            colorThemes: {
                primary: '#0f172a',
                secondary: '#1e293b',
                accent: '#38bdf8',
                accentHover: '#0284c7',
                background: '#0b0f19',
                surface: '#151c2e',
                surfaceLight: '#1e293b',
                text: '#f8fafc',
                textMuted: '#94a3b8',
                border: 'rgba(56, 189, 248, 0.2)',
                statusSuccess: '#10b981',
                statusWarning: '#f59e0b',
                statusDanger: '#ef4444',
                statusInfo: '#3b82f6'
            },

            typography: {
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                headingFont: 'Outfit, Inter, sans-serif',
                codeFont: 'JetBrains Mono, Fira Code, Consolas, monospace',
                fontSizeBase: '14px',
                lineHeight: '1.6',
                googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@500;600;700&display=swap'
            },

            language: {
                locale: 'en-US',
                fallbackLocale: 'en-US',
                translations: { ...DEFAULT_TRANSLATIONS }
            },

            currency: {
                code: 'USD',
                symbol: '$',
                position: 'prefix', // 'prefix' | 'suffix'
                precision: 2,
                thousandsSeparator: ',',
                decimalSeparator: '.'
            },

            legalDisclaimers: {
                copyrightNotice: '© 2026 Ujomor Enterprise Systems. All Rights Reserved.',
                legalHoldNotice: 'LEGAL HOLD ENFORCED: State immutability freeze active.',
                classificationNotice: 'CONFIDENTIAL - RESTRICTED ENTERPRISE DISTRIBUTION',
                disclaimerText: 'This document contains confidential governance audit telemetry. Unauthorized reproduction, transmission, or disclosure is strictly prohibited under international governance agreements.',
                complianceFrameworks: ['ISO 27001', 'SOC 2', 'OWASP ASVS', 'NIST']
            }
        };

        if (initialBranding && typeof initialBranding === 'object') {
            this.setBranding(initialBranding);
        }
    }

    /**
     * Updates or merges active branding configuration safely.
     * @param {Object} newBranding Partial or complete branding options
     * @returns {Object} Full active branding state
     */
    setBranding(newBranding = {}) {
        if (!newBranding || typeof newBranding !== 'object') {
            throw new Error('DynamicBrandingService.setBranding requires an object parameter');
        }

        if (newBranding.companyName) {
            this.branding.companyName = String(newBranding.companyName).trim();
        }
        if (newBranding.customLogo) {
            this.branding.customLogo = this._resolveImageSource(newBranding.customLogo);
        }
        if (newBranding.customerLogo) {
            this.branding.customerLogo = this._resolveImageSource(newBranding.customerLogo);
        }
        if (typeof newBranding.showDualLogo === 'boolean') {
            this.branding.showDualLogo = newBranding.showDualLogo;
        }

        if (newBranding.watermark && typeof newBranding.watermark === 'object') {
            this.branding.watermark = {
                ...this.branding.watermark,
                ...newBranding.watermark
            };
        }

        if (newBranding.colorThemes && typeof newBranding.colorThemes === 'object') {
            this.branding.colorThemes = {
                ...this.branding.colorThemes,
                ...newBranding.colorThemes
            };
        }

        if (newBranding.typography && typeof newBranding.typography === 'object') {
            this.branding.typography = {
                ...this.branding.typography,
                ...newBranding.typography
            };
        }

        if (newBranding.language && typeof newBranding.language === 'object') {
            this.branding.language = {
                ...this.branding.language,
                ...newBranding.language,
                translations: {
                    ...this.branding.language.translations,
                    ...(newBranding.language.translations || {})
                }
            };
        }

        if (newBranding.currency && typeof newBranding.currency === 'object') {
            this.branding.currency = {
                ...this.branding.currency,
                ...newBranding.currency
            };
        }

        if (newBranding.legalDisclaimers && typeof newBranding.legalDisclaimers === 'object') {
            this.branding.legalDisclaimers = {
                ...this.branding.legalDisclaimers,
                ...newBranding.legalDisclaimers
            };
        }

        return this.getBranding();
    }

    /**
     * Dynamically configures white-label branding settings from tenant configuration metadata.
     * @param {Object} tenantConfig Tenant configuration object (from ReportMetadataRegistry)
     * @returns {Object} Updated branding configuration
     */
    loadFromTenantConfig(tenantConfig = {}) {
        if (!tenantConfig || typeof tenantConfig !== 'object') return this.getBranding();

        const updates = {};

        if (tenantConfig.tenantName) {
            updates.companyName = tenantConfig.tenantName;
        }
        if (tenantConfig.logoUrl || tenantConfig.customLogo || tenantConfig.logo) {
            updates.customerLogo = tenantConfig.logoUrl || tenantConfig.customLogo || tenantConfig.logo;
            updates.showDualLogo = true;
        }
        if (tenantConfig.watermarkText) {
            updates.watermark = { text: tenantConfig.watermarkText };
        }
        if (tenantConfig.colors || tenantConfig.themeColors) {
            updates.colorThemes = tenantConfig.colors || tenantConfig.themeColors;
        }
        if (tenantConfig.locale || tenantConfig.language) {
            updates.language = { locale: tenantConfig.locale || tenantConfig.language };
        }
        if (tenantConfig.currency || tenantConfig.currencyCode) {
            const code = tenantConfig.currency || tenantConfig.currencyCode;
            const symbols = { USD: '$', EUR: '€', GBP: '£', JPY: '¥', CAD: 'C$', AUD: 'A$' };
            updates.currency = {
                code,
                symbol: symbols[code] || code
            };
        }

        return this.setBranding(updates);
    }

    /**
     * Retrieves the complete active white-label branding configuration object.
     * @returns {Object} Active branding configuration
     */
    getBranding() {
        return JSON.parse(JSON.stringify(this.branding));
    }

    /**
     * Retrieves the data URI or image URL for logo requests.
     * @param {'platform'|'customer'|'dual'} [type='platform'] Logo type requested
     * @returns {string} Image source string or HTML snippet for dual logos
     */
    getLogo(type = 'platform') {
        if (type === 'customer') {
            return this.branding.customerLogo || DEFAULT_CUSTOMER_LOGO_SVG;
        }
        if (type === 'dual') {
            const pLogo = this.branding.customLogo || DEFAULT_PLATFORM_LOGO_SVG;
            const cLogo = this.branding.customerLogo || DEFAULT_CUSTOMER_LOGO_SVG;
            return `<div class="dual-logo-container" style="display:flex;align-items:center;gap:16px;">
                <img src="${pLogo}" alt="Platform Logo" style="height:36px;width:auto;" />
                <span style="color:${this.branding.colorThemes.textMuted};font-size:18px;">|</span>
                <img src="${cLogo}" alt="Customer Logo" style="height:36px;width:auto;" />
            </div>`;
        }
        return this.branding.customLogo || DEFAULT_PLATFORM_LOGO_SVG;
    }

    /**
     * Retrieves watermark rendering options object.
     * @returns {Object} Watermark parameters
     */
    getWatermarkConfig() {
        return JSON.parse(JSON.stringify(this.branding.watermark));
    }

    /**
     * Retrieves color theme object.
     * @returns {Object} Theme colors
     */
    getColorTheme() {
        return JSON.parse(JSON.stringify(this.branding.colorThemes));
    }

    /**
     * Generates a CSS custom properties snippet (:root block) for embedding in HTML/CSS headers.
     * @returns {string} Formatted CSS `:root` declaration block
     */
    getThemeCssVariables() {
        const c = this.branding.colorThemes;
        const t = this.branding.typography;
        return `
:root {
  --brand-primary: ${c.primary};
  --brand-secondary: ${c.secondary};
  --brand-accent: ${c.accent};
  --brand-accent-hover: ${c.accentHover};
  --brand-bg: ${c.background};
  --brand-surface: ${c.surface};
  --brand-surface-light: ${c.surfaceLight};
  --brand-text: ${c.text};
  --brand-text-muted: ${c.textMuted};
  --brand-border: ${c.border};
  --brand-success: ${c.statusSuccess};
  --brand-warning: ${c.statusWarning};
  --brand-danger: ${c.statusDanger};
  --brand-info: ${c.statusInfo};
  --brand-font-family: ${t.fontFamily};
  --brand-heading-font: ${t.headingFont};
  --brand-code-font: ${t.codeFont};
  --brand-font-size-base: ${t.fontSizeBase};
  --brand-line-height: ${t.lineHeight};
}`.trim();
    }

    /**
     * Generates typography CSS styles and font link imports.
     * @returns {string} CSS typography declaration block
     */
    getTypographyStyles() {
        const t = this.branding.typography;
        let fontImport = '';
        if (t.googleFontsUrl) {
            fontImport = `@import url('${t.googleFontsUrl}');\n`;
        }
        return `${fontImport}body {
  font-family: var(--brand-font-family, ${t.fontFamily});
  font-size: var(--brand-font-size-base, ${t.fontSizeBase});
  line-height: var(--brand-line-height, ${t.lineHeight});
  color: var(--brand-text, #f8fafc);
  background-color: var(--brand-bg, #0b0f19);
}
h1, h2, h3, h4, h5, h6 {
  font-family: var(--brand-heading-font, ${t.headingFont});
  letter-spacing: -0.02em;
}
code, pre, kbd {
  font-family: var(--brand-code-font, ${t.codeFont});
}`;
    }

    /**
     * Formats numerical monetary values into localized currency string representations.
     * @param {number} amount Numerical value
     * @param {Object} [currencyOverride] Optional currency settings override
     * @returns {string} Formatted currency string
     */
    formatCurrency(amount, currencyOverride = {}) {
        const c = { ...this.branding.currency, ...currencyOverride };
        const num = Number(amount) || 0;
        const fixed = num.toFixed(c.precision);

        const parts = fixed.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, c.thousandsSeparator);
        const formattedNum = parts.join(c.decimalSeparator);

        if (c.position === 'suffix') {
            return `${formattedNum} ${c.symbol}`;
        }
        return `${c.symbol}${formattedNum}`;
    }

    /**
     * Translates report string key using active locale dictionary.
     * @param {string} key Translation key
     * @param {string} [defaultText=''] Fallback text if key is missing
     * @param {Object} [params={}] Variables to substitute in text `{varName}`
     * @returns {string} Localized text
     */
    translate(key, defaultText = '', params = {}) {
        const lang = this.branding.language;
        const locale = lang.locale || 'en-US';
        const fallback = lang.fallbackLocale || 'en-US';

        let text = lang.translations[locale]?.[key] || lang.translations[fallback]?.[key] || DEFAULT_TRANSLATIONS['en-US']?.[key] || defaultText || key;

        for (const [pKey, pVal] of Object.entries(params)) {
            text = text.replace(new RegExp(`\\{${pKey}\\}`, 'g'), String(pVal));
        }

        return text;
    }

    /**
     * Generates styled HTML or Markdown legal disclaimer footer snippet.
     * @param {'html'|'markdown'} [format='html'] Desired output format
     * @param {string} [reportType='executive'] Report type identifier
     * @returns {string} Formatted disclaimer snippet
     */
    getLegalDisclaimerSnippet(format = 'html', reportType = 'executive') {
        const l = this.branding.legalDisclaimers;

        if (format === 'markdown') {
            return `
---
**${l.classificationNotice}**  
${l.disclaimerText}  
*${l.copyrightNotice} | ${l.legalHoldNotice}*  
Compliance Frameworks: ${l.complianceFrameworks.join(', ')}
`.trim();
        }

        return `
<footer class="eaorcs-report-footer" style="margin-top:40px;padding:24px;border-top:1px solid var(--brand-border, rgba(56,189,248,0.2));font-size:12px;color:var(--brand-text-muted, #94a3b8);background:var(--brand-surface, #151c2e);border-radius:8px;">
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
    <span style="font-weight:700;letter-spacing:0.05em;color:var(--brand-accent, #38bdf8);">${l.classificationNotice}</span>
    <span style="font-size:11px;background:rgba(239,68,68,0.15);color:#fca5a5;padding:2px 8px;border-radius:4px;">${l.legalHoldNotice}</span>
  </div>
  <p style="margin:0 0 12px 0;line-height:1.5;">${l.disclaimerText}</p>
  <div style="display:flex;justify-content:space-between;align-items:center;font-size:11px;">
    <span>${l.copyrightNotice}</span>
    <span>Standards: ${l.complianceFrameworks.join(' • ')}</span>
  </div>
</footer>`.trim();
    }

    /**
     * Applies full white-label branding elements (CSS variables, header logos,
     * watermark overlay, typography, and legal footer) to a raw HTML report string.
     * 
     * @param {string} htmlContent Raw HTML document string
     * @param {Object} [options] Injection options
     * @returns {string} Fully branded HTML document
     */
    applyBrandingToHtml(htmlContent, options = {}) {
        if (!htmlContent || typeof htmlContent !== 'string') return htmlContent;

        const cssVars = this.getThemeCssVariables();
        const typography = this.getTypographyStyles();
        const watermarkConfig = this.getWatermarkConfig();
        const footerSnippet = this.getLegalDisclaimerSnippet('html', options.reportType);

        let watermarkCss = '';
        if (watermarkConfig.enabled) {
            watermarkCss = `
body::before {
  content: "${watermarkConfig.text}";
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(${watermarkConfig.rotation}deg);
  font-size: ${watermarkConfig.fontSize};
  font-weight: 800;
  color: ${watermarkConfig.color};
  opacity: ${watermarkConfig.opacity};
  pointer-events: none;
  z-index: 9999;
  white-space: nowrap;
  user-select: none;
}`;
        }

        const fullStyleBlock = `
<style id="eaorcs-dynamic-branding-styles">
${cssVars}
${typography}
${watermarkCss}
</style>`;

        let brandedHtml = htmlContent;

        // Inject style block into <head> or prepend
        if (brandedHtml.includes('</head>')) {
            brandedHtml = brandedHtml.replace('</head>', `${fullStyleBlock}\n</head>`);
        } else {
            brandedHtml = `${fullStyleBlock}\n${brandedHtml}`;
        }

        // Inject footer before </body> or append
        if (options.injectFooter !== false) {
            if (brandedHtml.includes('</body>')) {
                brandedHtml = brandedHtml.replace('</body>', `${footerSnippet}\n</body>`);
            } else {
                brandedHtml = `${brandedHtml}\n${footerSnippet}`;
            }
        }

        return brandedHtml;
    }

    /**
     * Exports serializable JSON configuration object.
     * @returns {Object} JSON state
     */
    exportBrandingConfig() {
        return this.getBranding();
    }

    /**
     * JSON serialization support.
     * @returns {Object} JSON state
     */
    toJSON() {
        return this.getBranding();
    }

    // --------------------------------------------------------------------------
    // PRIVATE / HELPER METHODS
    // --------------------------------------------------------------------------

    /**
     * Resolves logo input string (file path, URL, or base64 data URI).
     * @private
     */
    _resolveImageSource(source) {
        if (!source || typeof source !== 'string') return DEFAULT_PLATFORM_LOGO_SVG;
        if (source.startsWith('data:') || source.startsWith('http://') || source.startsWith('https://')) {
            return source;
        }

        // Attempt resolving local file path to base64 data URI
        try {
            const resolvedPath = path.resolve(source);
            if (fs.existsSync(resolvedPath)) {
                const buf = fs.readFileSync(resolvedPath);
                const ext = path.extname(resolvedPath).toLowerCase().replace('.', '');
                const mime = ext === 'svg' ? 'image/svg+xml' : (ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'image/png');
                return `data:${mime};base64,${buf.toString('base64')}`;
            }
        } catch (e) {
            // Fallback
        }

        return source;
    }
}

module.exports = DynamicBrandingService;
module.exports.DynamicBrandingService = DynamicBrandingService;
