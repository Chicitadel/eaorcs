-- ==============================================================================
-- Project        : EAORCS Neovim Plugin Bundle
-- File           : init.lua
-- Version        : 2026.1.0
-- Author         : Ujomor Systems & Enterprise Governance Authority
-- Organization   : Ujomor Systems & Enterprise Governance Authority
-- ==============================================================================

local M = {}

M.config = {
    lsp_server_path = "engine/ide/LspServer.js",
    auto_audit_on_save = false,
    trust_threshold = 85.0,
    enable_diagnostics = true
}

function M.setup(user_opts)
    if user_opts and type(user_opts) == "table" then
        for k, v in pairs(user_opts) do
            M.config[k] = v
        end
    end
    M.register_commands()
    if M.config.enable_diagnostics then
        M.start_lsp()
    end
end

function M.start_lsp()
    if vim and vim.lsp and vim.lsp.start then
        vim.lsp.start({
            name = 'eaorcs-lsp',
            cmd = {'node', M.config.lsp_server_path},
            root_dir = vim.fn.getcwd()
        })
    end
end

function M.register_commands()
    if vim and vim.api and vim.api.nvim_create_user_command then
        vim.api.nvim_create_user_command('EAORCSAudit', function() M.run_audit() end, {})
        vim.api.nvim_create_user_command('EAORCSVerify', function() M.verify_cert() end, {})
        vim.api.nvim_create_user_command('EAORCSPassport', function() M.export_passport() end, {})
    end
end

function M.run_audit()
    print("[EAORCS] Running trust score audit...")
end

function M.verify_cert()
    print("[EAORCS] Verifying sovereign certificate...")
end

function M.export_passport()
    print("[EAORCS] Exporting OSAP passport...")
end

return M
