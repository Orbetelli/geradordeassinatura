// ========================================
// ALERTA DE ATUALIZAÇÃO (VIA GITHUB API)
// ========================================

(function verificarAtualizacao() {
    var REPO  = 'Orbetelli/geradordeassinatura';
    var API   = 'https://api.github.com/repos/' + REPO + '/commits?per_page=1';
    var CHAVE = 'mobilemed-ultimo-commit';

    fetch(API)
        .then(function(r) { return r.json(); })
        .then(function(data) {
            if (!data || !data[0]) return;
            var commitAtual = data[0].sha;
            var commitSalvo = localStorage.getItem(CHAVE);
            var msgCommit   = data[0].commit.message.split('\n')[0];
            var dataCommit  = new Date(data[0].commit.author.date).toLocaleDateString('pt-BR');
            if (!commitSalvo) {
                localStorage.setItem(CHAVE, commitAtual);
                return;
            }
            if (commitSalvo !== commitAtual) {
                localStorage.setItem(CHAVE, commitAtual);
                mostrarToastAtualizacao(msgCommit, dataCommit, commitAtual.substring(0, 7));
            }
        })
        .catch(function() {});
})();

// ─── Utilitário global de escape HTML ────────────────────────────────────────
function escapeHtml(s) {
    if (s == null) return '';
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function mostrarToastAtualizacao(msg, data, hash) {
    var toastAntigo = document.getElementById('updateToast');
    if (toastAntigo) toastAntigo.remove();
    var toast = document.createElement('div');
    toast.id        = 'updateToast';
    toast.className = 'update-toast';
    toast.innerHTML =
        '<span class="update-toast-icon">🚀</span>' +
        '<div class="update-toast-body">' +
            '<div class="update-toast-title">Sistema atualizado!</div>' +
            '<div class="update-toast-msg">' + escapeHtml(msg) + '</div>' +
            '<div class="update-toast-commit">' + escapeHtml(data) + ' · ' + escapeHtml(hash) + '</div>' +
        '</div>' +
        '<button class="update-toast-close" onclick="fecharToast()">✕</button>';
    document.body.appendChild(toast);
    requestAnimationFrame(function() {
        requestAnimationFrame(function() { toast.classList.add('show'); });
    });
    setTimeout(function() { fecharToast(); }, 8000);
}

function fecharToast() {
    var toast = document.getElementById('updateToast');
    if (!toast) return;
    toast.classList.remove('show');
    setTimeout(function() { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 400);
}

// ========================================
// ALTERNÂNCIA DE TEMA (CLARO / ESCURO)
// ========================================

function alternarTema() {
    var body   = document.body;
    var label  = document.getElementById('temaLabel');
    var icon   = document.querySelector('.tema-icon');
    var escuro = body.classList.toggle('tema-escuro');
    if (escuro) {
        label.textContent = 'Tema Escuro';
        icon.textContent  = '🌙';
    } else {
        label.textContent = 'Tema Claro';
        icon.textContent  = '☀️';
    }
    localStorage.setItem('mobilemed-tema', escuro ? 'escuro' : 'claro');
}

(function() {
    var salvo = localStorage.getItem('mobilemed-tema');
    if (salvo === 'escuro') {
        document.body.classList.add('tema-escuro');
        document.addEventListener('DOMContentLoaded', function() {
            var label = document.getElementById('temaLabel');
            var icon  = document.querySelector('.tema-icon');
            if (label) label.textContent = 'Tema Escuro';
            if (icon)  icon.textContent  = '🌙';
        });
    }
})();

// ========================================
// SISTEMA DE ABAS PRINCIPAIS
// ========================================

function switchTab(tabId, btn) {
    document.querySelectorAll('.tab-panel').forEach(function(p) { p.classList.remove('active'); });
    document.querySelectorAll('.tab-btn').forEach(function(b) { b.classList.remove('active'); });
    document.getElementById('tab-' + tabId).classList.add('active');
    btn.classList.add('active');
}

// ========================================
// SUB-ABAS DO PAINEL GERAL
// ========================================

function geralSwitchTab(tabId, btn) {
    document.querySelectorAll('#tab-geral .qb-panel').forEach(function(p) { p.classList.remove('active'); });
    document.querySelectorAll('#tab-geral .qb-tab').forEach(function(b) { b.classList.remove('active'); });
    document.getElementById('geral-panel-' + tabId).classList.add('active');
    btn.classList.add('active');
}

// ========================================
// SUB-ABAS DO PAINEL SUPORTE
// ========================================

function suporteSwitchTab(tabId, btn) {
    document.querySelectorAll('#tab-suporte .qb-panel').forEach(function(p) { p.classList.remove('active'); });
    document.querySelectorAll('#tab-suporte .qb-tab').forEach(function(b) { b.classList.remove('active'); });
    document.getElementById('suporte-panel-' + tabId).classList.add('active');
    btn.classList.add('active');
}

// ========================================
// SUB-ABAS DO PAINEL IMPLANTAÇÃO
// ========================================

function implantacaoSwitchTab(tabId, btn) {
    document.querySelectorAll('#tab-query > .container > .qb-panel').forEach(function(p) { p.classList.remove('active'); });
    document.querySelectorAll('#tab-query > .container > .qb-tabs > .qb-tab').forEach(function(b) { b.classList.remove('active'); });
    document.getElementById('implantacao-panel-' + tabId).classList.add('active');
    btn.classList.add('active');
}

// ========================================
// TOAST GENÉRICO (usado por Query Builder e Implantação)
// ========================================

function qbShowToast(msg) {
    var old = document.getElementById('qbToast');
    if (old) old.remove();
    var t = document.createElement('div');
    t.id = 'qbToast'; t.className = 'qb-toast'; t.textContent = msg;
    document.body.appendChild(t);
    requestAnimationFrame(function() { requestAnimationFrame(function() { t.classList.add('show'); }); });
    setTimeout(function() {
        t.classList.remove('show');
        setTimeout(function() { if (t.parentNode) t.parentNode.removeChild(t); }, 400);
    }, 2200);
}

// ========================================
// INICIALIZAÇÃO GERAL
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    updateRegisterField(1, 'CRM');
    updateRegisterField(2, 'CRM');
    pwGerarSenhas();
    qbInit();
    storageInit();
    cmdInit();
    planRenderEquips();
    planRenderServidores();
    planRenderUsuarios();
    cechoGerar();
});
