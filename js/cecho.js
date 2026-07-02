// ========================================
// C-ECHO GENERATOR
// ========================================

var CECHO_AE_REGEX = /^[A-Za-z0-9 _\-\.]+$/;

function cechoValidarAE(inputId, badgeId) {
    var val   = (document.getElementById(inputId) || {}).value || '';
    var badge = document.getElementById(badgeId);
    if (!badge) return;
    if (!val) { badge.textContent = ''; badge.className = 'cecho-badge'; return; }
    if (val.length > 16) {
        badge.textContent = '⚠️ máx 16 chars';
        badge.className   = 'cecho-badge cecho-badge-warn';
    } else if (!CECHO_AE_REGEX.test(val)) {
        badge.textContent = '⚠️ caractere inválido';
        badge.className   = 'cecho-badge cecho-badge-warn';
    } else if (val !== val.trim()) {
        badge.textContent = '⚠️ espaço no início/fim';
        badge.className   = 'cecho-badge cecho-badge-warn';
    } else {
        badge.textContent = '✔ válido';
        badge.className   = 'cecho-badge cecho-badge-ok';
    }
}

function cechoGerar() {
    var host = (document.getElementById('cecho_host') || {}).value || '{HOST}';
    var port = (document.getElementById('cecho_port') || {}).value || '104';
    var aec  = (document.getElementById('cecho_aec')  || {}).value || '{AE_DESTINO}';
    var aet  = (document.getElementById('cecho_aet')  || {}).value || 'SUPORTE';
    var el   = document.getElementById('cecho_results');
    if (!el) return;

    var cmds = [
        { label: 'dcm4che (Linux / Windows)',           icon: '🔧', cmd: 'storescu -c ' + aec + '@' + host + ':' + port + ' --echo -b ' + aet },
        { label: 'DCMTK — echoscu (Linux / Windows)',   icon: '🛠️', cmd: 'echoscu -aec ' + aec + ' -aet ' + aet + ' ' + host + ' ' + port },
        { label: 'PowerShell — teste de porta',         icon: '🪟', cmd: 'Test-NetConnection -ComputerName ' + host + ' -Port ' + port },
        { label: 'Linux — netcat (teste de porta)',     icon: '🐧', cmd: 'nc -zv ' + host + ' ' + port }
    ];

    el.innerHTML = cmds.map(function(c) {
        var e = c.cmd.replace(/&/g,'&amp;').replace(/"/g,'&quot;');
        return '<div class="cecho-cmd-card">' +
            '<div class="cecho-cmd-header">' +
                '<span class="cecho-cmd-icon">' + c.icon + '</span>' +
                '<span class="cecho-cmd-label">' + c.label + '</span>' +
                '<button class="cecho-copy-btn" onclick="cechoCopiar(this,\'' + e + '\')">📋 Copiar</button>' +
            '</div>' +
            '<code class="cecho-cmd-code">' + c.cmd + '</code>' +
        '</div>';
    }).join('');
}

function cechoCopiar(btn, cmd) {
    var ta = document.createElement('textarea');
    ta.innerHTML = cmd;
    navigator.clipboard.writeText(ta.value).then(function() {
        var orig = btn.innerHTML;
        btn.innerHTML = '✅ Copiado!';
        setTimeout(function() { btn.innerHTML = orig; }, 1500);
    });
}
