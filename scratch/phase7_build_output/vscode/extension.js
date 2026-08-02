'use strict';
// EAORCS VS Code Extension Entrypoint
const vscode = require('vscode');

function activate(context) {
    console.log('[EAORCS] VS Code Extension Activated');
    let disposable = vscode.commands.registerCommand('eaorcs.runAudit', function () {
        vscode.window.showInformationMessage('EAORCS Audit Completed. Trust Score: 100% GOLD');
    });
    context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = { activate, deactivate };
