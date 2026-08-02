/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : AI Engineering Interview Engine (Stream G)
 * File           : EngineeringInterviewEngine.js
 * Version        : 1.1.0
 * Author         : Enterprise Architecture Team & Ujomor Engineering
 * Organization   : Enterprise Architecture & Governance
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : ENTERPRISE
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
 * Signatures:
 * - Architecture Authority
 * - Security Authority
 * - Governance Authority
 * - Deployment Authority
 *
 * Copyright (c) 2026 Enterprise Architecture & Governance
 * All Rights Reserved.
 ******************************************************************************/

const crypto = require('crypto');

class EngineeringInterviewEngine {
    constructor() {
        this.topic = null;
        this.status = 'IDLE'; // IDLE | IN_PROGRESS | COMPLETED
        this.questions = [];
        this.currentIndex = 0;
        this.transcript = [];
        this.startedAt = null;
        this.completedAt = null;
        this.metadata = {};
    }

    /**
     * Start a new interactive interview session for a given architecture topic.
     * @param {string} topic - The domain or project name to interview for.
     * @param {Object} [options={}] - Optional metadata or initial parameters.
     * @returns {Object} Initial interview state and first question.
     */
    startInterview(topic, options = {}) {
        if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
            throw new Error("Interview topic must be a non-empty string.");
        }

        this.topic = topic.trim();
        this.status = 'IN_PROGRESS';
        this.currentIndex = 0;
        this.transcript = [];
        this.startedAt = new Date().toISOString();
        this.completedAt = null;
        this.metadata = options;

        this.questions = this._generateDefaultQuestions(this.topic);

        return {
            topic: this.topic,
            status: this.status,
            totalQuestions: this.questions.length,
            currentQuestion: this.questions[0]
        };
    }

    /**
     * Process an answer for the current question and advance interview.
     * @param {string|Object} answer - Answer provided by stakeholder.
     * @returns {Object} Status, progress, and next question or transcript summary.
     */
    processAnswer(answer) {
        if (this.status !== 'IN_PROGRESS') {
            throw new Error("Interview is not in progress. Call startInterview() first.");
        }

        if (this.currentIndex >= this.questions.length) {
            throw new Error("All interview questions have already been answered.");
        }

        const answerText = typeof answer === 'object' && answer !== null ? (answer.text || JSON.stringify(answer)) : String(answer || '');
        const currentQ = this.questions[this.currentIndex];

        currentQ.answer = answerText;
        currentQ.status = answerText.trim().length > 0 ? 'ANSWERED' : 'SKIPPED';
        currentQ.answeredAt = new Date().toISOString();

        this.transcript.push({
            questionId: currentQ.id,
            category: currentQ.category,
            question: currentQ.question,
            answer: answerText,
            timestamp: currentQ.answeredAt
        });

        // Dynamic question expansion based on response keywords
        this._checkForFollowUpQuestions(answerText, currentQ.category);

        this.currentIndex++;

        if (this.currentIndex >= this.questions.length) {
            this.status = 'COMPLETED';
            this.completedAt = new Date().toISOString();

            return {
                status: 'COMPLETED',
                completed: true,
                totalAnswered: this.questions.filter(q => q.status === 'ANSWERED').length,
                transcriptSummary: this.exportTranscript()
            };
        }

        return {
            status: 'IN_PROGRESS',
            completed: false,
            nextQuestion: this.questions[this.currentIndex],
            progress: `${this.currentIndex}/${this.questions.length}`
        };
    }

    /**
     * Retrieve all generated interview questions.
     * @returns {Array<Object>} Copy of questions list.
     */
    getGeneratedQuestions() {
        return this.questions.map(q => ({ ...q }));
    }

    /**
     * Export the complete structured transcript of the interview session.
     * @returns {Object} Formatted transcript report.
     */
    exportTranscript() {
        return {
            topic: this.topic,
            status: this.status,
            startedAt: this.startedAt,
            completedAt: this.completedAt,
            totalQuestions: this.questions.length,
            answeredCount: this.questions.filter(q => q.status === 'ANSWERED').length,
            qaPairs: [...this.transcript],
            metadata: { ...this.metadata }
        };
    }

    /**
     * Generate structured base questions for topic.
     * @private
     */
    _generateDefaultQuestions(topic) {
        return [
            {
                id: 'Q1_VISION',
                index: 0,
                category: 'VISION',
                question: `What is the core vision, primary business objective, and target user base for ${topic}?`,
                status: 'PENDING',
                answer: null
            },
            {
                id: 'Q2_BOUNDED_CONTEXTS',
                index: 1,
                category: 'ARCHITECTURE',
                question: `What primary functional modules, services, or bounded contexts are required to realize ${topic}?`,
                status: 'PENDING',
                answer: null
            },
            {
                id: 'Q3_SECURITY_DATA',
                index: 2,
                category: 'SECURITY',
                question: `What classification of data (e.g. PHI, PII, Financial, Secret) will be handled, and what authentication/authorization controls are needed?`,
                status: 'PENDING',
                answer: null
            },
            {
                id: 'Q4_PERFORMANCE_SCALE',
                index: 3,
                category: 'OPERATIONS',
                question: `What are your non-functional expectations regarding throughput (RPS), latency, availability (SLA), and disaster recovery (RTO/RPO)?`,
                status: 'PENDING',
                answer: null
            },
            {
                id: 'Q5_DEPLOYMENT_TOPOLOGY',
                index: 4,
                category: 'INFRASTRUCTURE',
                question: `What is your target deployment environment (e.g. Multi-Cloud, Hybrid, On-Premises, Kubernetes) and containerization strategy?`,
                status: 'PENDING',
                answer: null
            },
            {
                id: 'Q6_COMPLIANCE_STANDARDS',
                index: 5,
                category: 'COMPLIANCE',
                question: `Which industry regulations, governance policies, or certification standards (e.g., ISO 27001, HIPAA, PCI-DSS, FedRAMP, SOC 2) must be strictly enforced?`,
                status: 'PENDING',
                answer: null
            }
        ];
    }

    /**
     * Check if specific keywords warrant dynamic follow-up questions.
     * @private
     */
    _checkForFollowUpQuestions(answerText, category) {
        const text = answerText.toLowerCase();

        if (text.includes('hipaa') || text.includes('health') || text.includes('phi')) {
            if (!this.questions.some(q => q.id === 'Q_DYNAMIC_HIPAA')) {
                this.questions.push({
                    id: 'Q_DYNAMIC_HIPAA',
                    index: this.questions.length,
                    category: 'HEALTHCARE_COMPLIANCE',
                    question: 'Has a Business Associate Agreement (BAA) and PHI audit logging mechanism been specified?',
                    status: 'PENDING',
                    answer: null
                });
            }
        }

        if (text.includes('pci') || text.includes('payment') || text.includes('card')) {
            if (!this.questions.some(q => q.id === 'Q_DYNAMIC_PCI')) {
                this.questions.push({
                    id: 'Q_DYNAMIC_PCI',
                    index: this.questions.length,
                    category: 'FINANCIAL_COMPLIANCE',
                    question: 'How will tokenization and cardholder data environment (CDE) scope isolation be implemented for PCI-DSS 4.0?',
                    status: 'PENDING',
                    answer: null
                });
            }
        }
    }
}

module.exports = EngineeringInterviewEngine;
