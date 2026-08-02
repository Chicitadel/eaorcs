/******************************************************************************
 * Project        : Universal Autonomous Governance Operating System (UAIGOS)
 * Module         : EAORCS Provider Adapters (Stream S2)
 * File           : SupportProviderAdapter.js
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

/**
 * SupportProviderAdapter
 * Abstraction adapter for Enterprise ITSM and Support Ticketing Platforms (Jira, ServiceNow, Zendesk).
 */
class SupportProviderAdapter {
    /**
     * @param {Object} config
     * @param {string} [config.provider='jira'] - Driver type: 'jira', 'servicenow', 'zendesk'
     * @param {string} [config.host] - Endpoint base host (e.g. 'https://enterprise.atlassian.net')
     * @param {string} [config.projectKey='EAORCS'] - Jira Project Key / ServiceNow Table / Zendesk Group
     * @param {string} [config.apiToken] - Authentication Token / API Key
     * @param {string} [config.username] - API Service Account Username
     */
    constructor(config = {}) {
        this.provider = (config.provider || 'jira').toLowerCase();
        this.host = config.host || 'https://support.eaorcs.enterprise.local';
        this.projectKey = config.projectKey || 'EAORCS';
        this.apiToken = config.apiToken || 'mock_support_token';
        this.username = config.username || 'eaorcs-bot@enterprise.local';
        this.ticketsDb = new Map(); // Mock memory store for ticketing state

        this._validateProvider();
    }

    _validateProvider() {
        const supported = ['jira', 'servicenow', 'zendesk'];
        if (!supported.includes(this.provider)) {
            throw new Error(`[SupportProviderAdapter] Unsupported provider '${this.provider}'. Supported: ${supported.join(', ')}`);
        }
    }

    getProviderName() {
        return this.provider;
    }

    /**
     * Create a support issue / incident ticket
     * @param {Object} ticketData - { summary, description, priority, category, reporterEmail, customFields }
     * @returns {Promise<Object>} Created ticket payload
     */
    async createTicket(ticketData = {}) {
        if (!ticketData.summary || !ticketData.description) {
            throw new Error('[SupportProviderAdapter] Summary and description are required to create a ticket.');
        }

        const ticketId = this._generateTicketKey();
        const now = new Date().toISOString();

        const ticketRecord = {
            ticketId,
            key: ticketId,
            provider: this.provider,
            projectKey: this.projectKey,
            summary: ticketData.summary,
            description: ticketData.description,
            priority: ticketData.priority || 'High',
            status: this.provider === 'servicenow' ? 'New' : 'Open',
            category: ticketData.category || 'Governance Incident',
            reporter: ticketData.reporterEmail || this.username,
            createdAt: now,
            updatedAt: now,
            comments: [],
            url: this._getTicketUrl(ticketId)
        };

        this.ticketsDb.set(ticketId, ticketRecord);

        return {
            success: true,
            provider: this.provider,
            ticketId,
            key: ticketId,
            url: ticketRecord.url,
            status: ticketRecord.status,
            createdAt: now
        };
    }

    /**
     * Fetch current status and details of a support ticket
     * @param {string} ticketId 
     * @returns {Promise<Object>} Ticket record
     */
    async getTicketStatus(ticketId) {
        if (!ticketId) throw new Error('[SupportProviderAdapter] Ticket ID is required.');

        const ticket = this.ticketsDb.get(ticketId);
        if (!ticket) {
            // Mock fallback if query is for an un-stored external ticket
            return {
                ticketId,
                key: ticketId,
                provider: this.provider,
                status: 'In Progress',
                found: true,
                summary: `External Incident [${ticketId}]`,
                url: this._getTicketUrl(ticketId)
            };
        }

        return {
            found: true,
            ...ticket
        };
    }

    /**
     * Update status, comments, or fields on an existing support ticket
     * @param {string} ticketId 
     * @param {Object} updateData - { status, comment, priority }
     * @returns {Promise<Object>} Update outcome
     */
    async updateTicket(ticketId, updateData = {}) {
        if (!ticketId) throw new Error('[SupportProviderAdapter] Ticket ID is required.');

        const ticket = this.ticketsDb.get(ticketId) || {
            ticketId,
            key: ticketId,
            provider: this.provider,
            status: 'Open',
            comments: []
        };

        if (updateData.status) {
            ticket.status = updateData.status;
        }

        if (updateData.comment) {
            ticket.comments.push({
                author: this.username,
                text: updateData.comment,
                timestamp: new Date().toISOString()
            });
        }

        ticket.updatedAt = new Date().toISOString();
        this.ticketsDb.set(ticketId, ticket);

        return {
            updated: true,
            ticketId,
            status: ticket.status,
            commentsCount: ticket.comments.length,
            provider: this.provider
        };
    }

    /**
     * List open tickets matching optional filter criteria
     * @param {Object} [filter={}] - { status, priority }
     * @returns {Promise<Array<Object>>} Ticket list
     */
    async listTickets(filter = {}) {
        const results = [];
        for (const ticket of this.ticketsDb.values()) {
            let match = true;
            if (filter.status && ticket.status.toLowerCase() !== filter.status.toLowerCase()) {
                match = false;
            }
            if (filter.priority && ticket.priority.toLowerCase() !== filter.priority.toLowerCase()) {
                match = false;
            }
            if (match) {
                results.push(ticket);
            }
        }
        return results;
    }

    _generateTicketKey() {
        const num = Math.floor(1000 + Math.random() * 9000);
        switch (this.provider) {
            case 'servicenow':
                return `INC${num}`;
            case 'zendesk':
                return `ZD-${num}`;
            case 'jira':
            default:
                return `${this.projectKey}-${num}`;
        }
    }

    _getTicketUrl(ticketId) {
        switch (this.provider) {
            case 'servicenow':
                return `${this.host}/nav_to.do?uri=incident.do?sys_id=${ticketId}`;
            case 'zendesk':
                return `${this.host}/agent/tickets/${ticketId}`;
            case 'jira':
            default:
                return `${this.host}/browse/${ticketId}`;
        }
    }
}

module.exports = SupportProviderAdapter;
