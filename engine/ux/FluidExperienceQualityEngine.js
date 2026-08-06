/******************************************************************************
 * Project        : EAORCS STK
 * Module         : Fluid UX & Interaction Quality Engine (Stream 5)
 * File           : engine/ux/FluidExperienceQualityEngine.js
 * Version        : 1.0.0
 * Author         : Enterprise Architecture & Operational Resilience Governance
 * Organization   : Ujomor Platform
 * Created Date   : 2026-08-06
 * Last Modified  : 2026-08-06
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
 * Copyright (c) 2026 Ujomor Platform
 * All Rights Reserved.
 ******************************************************************************/

'use strict';

/**
 * FluidExperienceQualityEngine
 * 
 * Comprehensive Fluid UX & Interaction Quality Manager:
 * 1. Page transition states
 * 2. Micro-animations
 * 3. Contextual onboarding
 * 4. Keyboard-first Ctrl+K shortcuts
 * 5. Responsive layouts
 * 6. Optimistic UI updates
 * 7. Guided tours
 * 8. Undo/redo state stacks
 */
class FluidExperienceQualityEngine {
    /**
     * @param {Object} config
     * @param {number} [config.undoStackMaxDepth=50]
     * @param {boolean} [config.enableReducedMotion=false]
     * @param {string} [config.initialBreakpoint='desktop']
     */
    constructor(config = {}) {
        this.config = {
            undoStackMaxDepth: config.undoStackMaxDepth || 50,
            enableReducedMotion: Boolean(config.enableReducedMotion),
            initialBreakpoint: config.initialBreakpoint || 'desktop'
        };

        // 1. Page Transition States
        this.pageTransitionState = {
            currentRoute: '/',
            previousRoute: null,
            status: 'IDLE', // 'IDLE', 'LOADING', 'ANIMATING_IN', 'ACTIVE', 'ANIMATING_OUT'
            transitionDurationMs: 250,
            easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)'
        };

        // 2. Micro-animations Registry
        this.microAnimations = new Map();
        this._initDefaultMicroAnimations();

        // 3. Contextual Onboarding Manager
        this.onboardingState = {
            completedModules: new Set(),
            dismissedHints: new Set(),
            activeHint: null
        };

        // 4. Keyboard-First Ctrl+K Shortcuts Registry
        this.shortcuts = new Map();
        this._initDefaultShortcuts();

        // 5. Responsive Layout Manager
        this.layoutState = {
            currentBreakpoint: this.config.initialBreakpoint, // 'mobile', 'tablet', 'desktop', 'ultrawide'
            sidebarCollapsed: false,
            viewportWidth: 1280,
            gridColumns: 12
        };

        // 6. Optimistic UI Updates Queue
        this.optimisticQueue = [];

        // 7. Guided Tours Manager
        this.tours = new Map();
        this.activeTour = null;

        // 8. Undo/Redo State Stacks
        this.undoStack = [];
        this.redoStack = [];
    }

    // =========================================================================
    // 1. PAGE TRANSITION STATES
    // =========================================================================

    /**
     * Trigger a page transition
     * @param {string} targetRoute 
     * @param {Object} [options]
     * @returns {Object} Updated transition state
     */
    transitionToPage(targetRoute, options = {}) {
        this.pageTransitionState.previousRoute = this.pageTransitionState.currentRoute;
        this.pageTransitionState.currentRoute = targetRoute;
        this.pageTransitionState.status = 'ANIMATING_OUT';
        this.pageTransitionState.transitionDurationMs = options.durationMs || 250;

        // Simulate step completion
        this.pageTransitionState.status = 'LOADING';
        this.pageTransitionState.status = 'ANIMATING_IN';
        this.pageTransitionState.status = 'ACTIVE';

        return { ...this.pageTransitionState };
    }

    // =========================================================================
    // 2. MICRO-ANIMATIONS
    // =========================================================================

    _initDefaultMicroAnimations() {
        const defaults = [
            { id: 'fade-slide', cssClass: 'anim-fade-slide', durationMs: 200 },
            { id: 'pulse-glow', cssClass: 'anim-pulse-glow', durationMs: 400 },
            { id: 'button-ripple', cssClass: 'anim-ripple', durationMs: 150 },
            { id: 'card-hover-lift', cssClass: 'anim-lift', durationMs: 180 },
            { id: 'error-shake', cssClass: 'anim-shake', durationMs: 300 }
        ];
        defaults.forEach(a => this.microAnimations.set(a.id, a));
    }

    registerMicroAnimation(id, definition) {
        this.microAnimations.set(id, { id, ...definition });
    }

    getMicroAnimation(id) {
        const anim = this.microAnimations.get(id);
        if (!anim) return null;
        if (this.config.enableReducedMotion) {
            return { ...anim, durationMs: 0, disabledDueToReducedMotion: true };
        }
        return anim;
    }

    // =========================================================================
    // 3. CONTEXTUAL ONBOARDING
    // =========================================================================

    triggerContextualHint(hintId, targetSelector, content) {
        if (this.onboardingState.dismissedHints.has(hintId)) {
            return null;
        }
        this.onboardingState.activeHint = {
            hintId,
            targetSelector,
            content,
            triggeredAt: new Date().toISOString()
        };
        return this.onboardingState.activeHint;
    }

    dismissContextualHint(hintId) {
        this.onboardingState.dismissedHints.add(hintId);
        if (this.onboardingState.activeHint && this.onboardingState.activeHint.hintId === hintId) {
            this.onboardingState.activeHint = null;
        }
    }

    markOnboardingModuleComplete(moduleId) {
        this.onboardingState.completedModules.add(moduleId);
    }

    // =========================================================================
    // 4. KEYBOARD-FIRST CTRL+K SHORTCUTS
    // =========================================================================

    _initDefaultShortcuts() {
        this.registerShortcut('Ctrl+K', 'Open Command Palette', () => ({ action: 'OPEN_COMMAND_PALETTE' }));
        this.registerShortcut('Ctrl+Z', 'Undo Action', () => this.undo());
        this.registerShortcut('Ctrl+Y', 'Redo Action', () => this.redo());
        this.registerShortcut('/', 'Focus Global Search', () => ({ action: 'FOCUS_SEARCH' }));
        this.registerShortcut('Esc', 'Close Modal / Clear Selection', () => ({ action: 'CLOSE_MODALS' }));
    }

    registerShortcut(combo, description, handler) {
        const normalizedKey = combo.toLowerCase().replace(/\s+/g, '');
        this.shortcuts.set(normalizedKey, {
            combo,
            normalizedKey,
            description,
            handler
        });
    }

    handleKeyPress(keyCombination) {
        const normalizedKey = keyCombination.toLowerCase().replace(/\s+/g, '');
        const shortcut = this.shortcuts.get(normalizedKey);
        if (shortcut && typeof shortcut.handler === 'function') {
            return {
                matched: true,
                combo: shortcut.combo,
                description: shortcut.description,
                result: shortcut.handler()
            };
        }
        return { matched: false };
    }

    getRegisteredShortcuts() {
        const list = [];
        for (const s of this.shortcuts.values()) {
            list.push({ combo: s.combo, description: s.description });
        }
        return list;
    }

    // =========================================================================
    // 5. RESPONSIVE LAYOUTS
    // =========================================================================

    updateViewportWidth(width) {
        this.layoutState.viewportWidth = width;
        if (width < 640) {
            this.layoutState.currentBreakpoint = 'mobile';
            this.layoutState.gridColumns = 4;
            this.layoutState.sidebarCollapsed = true;
        } else if (width < 1024) {
            this.layoutState.currentBreakpoint = 'tablet';
            this.layoutState.gridColumns = 8;
        } else if (width < 1440) {
            this.layoutState.currentBreakpoint = 'desktop';
            this.layoutState.gridColumns = 12;
        } else {
            this.layoutState.currentBreakpoint = 'ultrawide';
            this.layoutState.gridColumns = 16;
        }
        return { ...this.layoutState };
    }

    toggleSidebar() {
        this.layoutState.sidebarCollapsed = !this.layoutState.sidebarCollapsed;
        return this.layoutState.sidebarCollapsed;
    }

    // =========================================================================
    // 6. OPTIMISTIC UI UPDATES
    // =========================================================================

    /**
     * Perform an optimistic UI update with automatic rollback support
     * @param {Object} action
     * @param {string} action.id
     * @param {Object} action.optimisticData
     * @param {Function} action.asyncOperation - Returns Promise
     * @param {Function} action.onRollback
     * @returns {Promise<Object>}
     */
    async executeOptimisticUpdate(action) {
        const entry = {
            id: action.id || `opt_${Date.now()}`,
            timestamp: new Date().toISOString(),
            status: 'APPLIED_OPTIMISTICALLY',
            data: action.optimisticData
        };
        this.optimisticQueue.push(entry);

        try {
            const result = await action.asyncOperation();
            entry.status = 'COMMITTED';
            return { success: true, status: 'COMMITTED', result };
        } catch (error) {
            entry.status = 'ROLLED_BACK';
            if (typeof action.onRollback === 'function') {
                action.onRollback(error);
            }
            return { success: false, status: 'ROLLED_BACK', error: error.message };
        }
    }

    // =========================================================================
    // 7. GUIDED TOURS
    // =========================================================================

    registerTour(tourId, steps = []) {
        this.tours.set(tourId, {
            tourId,
            steps,
            totalSteps: steps.length
        });
    }

    startTour(tourId) {
        const tour = this.tours.get(tourId);
        if (!tour) return null;
        this.activeTour = {
            tourId,
            currentStepIndex: 0,
            step: tour.steps[0] || null,
            totalSteps: tour.totalSteps
        };
        return this.activeTour;
    }

    nextTourStep() {
        if (!this.activeTour) return null;
        const tour = this.tours.get(this.activeTour.tourId);
        if (!tour) return null;

        if (this.activeTour.currentStepIndex + 1 < tour.totalSteps) {
            this.activeTour.currentStepIndex += 1;
            this.activeTour.step = tour.steps[this.activeTour.currentStepIndex];
            return this.activeTour;
        } else {
            return this.endTour(true);
        }
    }

    endTour(completed = true) {
        const summary = this.activeTour ? { tourId: this.activeTour.tourId, completed } : null;
        this.activeTour = null;
        return summary;
    }

    // =========================================================================
    // 8. UNDO / REDO STATE STACKS
    // =========================================================================

    /**
     * Push a state snapshot onto the undo stack
     * @param {Object} stateSnapshot 
     */
    pushUndoState(stateSnapshot) {
        this.undoStack.push(JSON.parse(JSON.stringify(stateSnapshot)));
        if (this.undoStack.length > this.config.undoStackMaxDepth) {
            this.undoStack.shift();
        }
        // Clear redo stack on new action
        this.redoStack = [];
    }

    /**
     * Undo last action
     * @returns {Object|null} Restored state
     */
    undo() {
        if (this.undoStack.length === 0) return null;
        const currentState = this.undoStack.pop();
        this.redoStack.push(currentState);
        return this.undoStack.length > 0 ? this.undoStack[this.undoStack.length - 1] : null;
    }

    /**
     * Redo last undone action
     * @returns {Object|null} Restored state
     */
    redo() {
        if (this.redoStack.length === 0) return null;
        const stateToRedo = this.redoStack.pop();
        this.undoStack.push(stateToRedo);
        return stateToRedo;
    }

    canUndo() {
        return this.undoStack.length > 0;
    }

    canRedo() {
        return this.redoStack.length > 0;
    }

    /**
     * Summary snapshot of all UX quality engine subsystems
     */
    getEngineStatus() {
        return {
            pageTransitionStatus: this.pageTransitionState.status,
            registeredMicroAnimationsCount: this.microAnimations.size,
            onboardingStatus: {
                completedCount: this.onboardingState.completedModules.size,
                activeHint: this.onboardingState.activeHint ? this.onboardingState.activeHint.hintId : null
            },
            keyboardShortcutsCount: this.shortcuts.size,
            layoutState: this.layoutState,
            optimisticQueuePendingCount: this.optimisticQueue.filter(q => q.status === 'APPLIED_OPTIMISTICALLY').length,
            activeTour: this.activeTour ? this.activeTour.tourId : null,
            undoStackDepth: this.undoStack.length,
            redoStackDepth: this.redoStack.length
        };
    }
}

module.exports = FluidExperienceQualityEngine;
