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
            '<div class="update-toast-msg">' + msg + '</div>' +
            '<div class="update-toast-commit">' + data + ' · ' + hash + '</div>' +
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
    // Desativa todos os painéis dentro de tab-geral
    document.querySelectorAll('#tab-geral .qb-panel').forEach(function(p) { p.classList.remove('active'); });
    // Desativa todos os botões de sub-aba dentro de tab-geral
    document.querySelectorAll('#tab-geral .qb-tab').forEach(function(b) { b.classList.remove('active'); });
    // Ativa o painel e botão corretos
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

function cmdSwitchOS(os, btn) {
    CMD_OS_ATUAL = os;
    document.querySelectorAll('.cmd-os-panel').forEach(function(p) { p.classList.remove('active'); });
    document.querySelectorAll('.cmd-os-btn').forEach(function(b) { b.classList.remove('active'); });
    var panel = document.getElementById('cmd-os-' + os);
    if (panel) { panel.classList.add('active'); panel.style.display = 'block'; }
    if (btn) btn.classList.add('active');
    // Limpa busca ao trocar OS
    var inp = document.getElementById('cmdSearch');
    if (inp && inp.value) { inp.value = ''; cmdLimparBusca(); }
}

function cmdCopiar(btn, texto) {
    navigator.clipboard.writeText(texto).then(function() {
        var orig = btn.textContent;
        btn.textContent = '✅';
        btn.classList.add('copied');
        setTimeout(function() {
            btn.textContent = orig;
            btn.classList.remove('copied');
        }, 1500);
    });
}

function cmdCopiarItem(btn) {
    // Sobe até o cmd-item para pegar o data-cmd
    var item = btn;
    while (item && !item.classList.contains('cmd-item')) item = item.parentElement;
    var texto = item ? item.getAttribute('data-cmd') : '';
    if (!texto) return;
    // Decodifica entidades HTML
    var ta = document.createElement('textarea');
    ta.innerHTML = texto;
    cmdCopiar(btn, ta.value);
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
// GERADOR DE ASSINATURA
// ========================================

console.log('Gerador de Assinatura Medica - Versao Unificada');

var uploadedImage   = null;
var processedImage  = null;
var uploadedImage2  = null;
var processedImage2 = null;

var adjustments = {
    contrast: 200,
    sharpness: 0,
    convertToBlack: false,
    cleanWeakPixels: false,
    autoCrop: false,
    applyPythonFilters: false
};

var professionState = {
    1: { type: 'medico', register: 'CRM' },
    2: { type: 'medico', register: 'CRM' }
};

function selectProfession(doctorIndex, btn) {
    professionState[doctorIndex].type     = btn.dataset.type;
    professionState[doctorIndex].register = btn.dataset.register;
    var selector = document.getElementById('professionSelector' + doctorIndex);
    selector.querySelectorAll('.profession-btn').forEach(function(b) { b.classList.remove('active'); });
    btn.classList.add('active');
    updateRegisterField(doctorIndex, btn.dataset.register);
}

function updateRegisterField(doctorIndex, register) {
    var suffix = doctorIndex === 1 ? '' : '2';
    var label  = document.getElementById('doctorCRMLabel' + suffix);
    var input  = document.getElementById('doctorCRM' + suffix);
    var placeholders = { CRM: 'Ex: CRM 12345/SP', CRMV: 'Ex: CRMV 98765/SP' };
    if (label) label.innerHTML = register + ' com Estado: <span class="register-badge">' + register + '</span>';
    if (input) input.placeholder = placeholders[register] || 'Ex: ' + register + ' 12345/SP';
}

// ========================================
// QUERY BUILDER — chip-based
// ========================================

// ── Bancos disponíveis ─────────────────
var QB_DBS = [
    { id: 'sqlserver', label: 'SQL Server', icon: '🪟' },
    { id: 'mysql',     label: 'MySQL',      icon: '🐬' },
    { id: 'postgres',  label: 'PostgreSQL', icon: '🐘' },
    { id: 'firebird',  label: 'Firebird',   icon: '🔥' },
    { id: 'aws',       label: 'AWS Aurora', icon: '☁️'  }
];

// ── Sintaxe por banco ──────────────────
var QB_SYNTAX = {
    sqlserver: {
        fmtDate:     function(col, alias) { return "CONVERT(VARCHAR(10), TRY_CONVERT(DATE, " + col + ", 112), 103) AS " + alias; },
        fmtTime:     function(col, alias) { return "REPLACE(CONVERT(VARCHAR(8), TRY_CONVERT(TIME, " + col + "), 108), ':', '') AS " + alias; },
        fmtBirthDate:function(col, alias) { return "CONVERT(VARCHAR(10), TRY_CONVERT(DATE, " + col + ", 103), 103) AS " + alias; },
        today:       "CAST(GETDATE() AS DATE)",
        betweenDate: function(col, v1, v2) { return "TRY_CONVERT(DATE, " + col + ", 112) BETWEEN '" + v1 + "' AND '" + v2 + "'"; },
        datePlaceholder: 'YYYYMMDD'
    },
    mysql: {
        fmtDate:     function(col, alias) { return "DATE_FORMAT(STR_TO_DATE(" + col + ", '%Y%m%d'), '%d/%m/%Y') AS " + alias; },
        fmtTime:     function(col, alias) { return "REPLACE(TIME_FORMAT(CAST(" + col + " AS TIME), '%H%i%s'), ':', '') AS " + alias; },
        fmtBirthDate:function(col, alias) { return "DATE_FORMAT(STR_TO_DATE(" + col + ", '%d/%m/%Y'), '%d/%m/%Y') AS " + alias; },
        today:       "CURDATE()",
        betweenDate: function(col, v1, v2) { return "STR_TO_DATE(" + col + ", '%Y%m%d') BETWEEN '" + v1 + "' AND '" + v2 + "'"; },
        datePlaceholder: 'YYYY-MM-DD'
    },
    postgres: {
        fmtDate:     function(col, alias) { return "TO_CHAR(TO_DATE(" + col + ", 'YYYYMMDD'), 'DD/MM/YYYY') AS " + alias; },
        fmtTime:     function(col, alias) { return "TO_CHAR(CAST(" + col + " AS TIME), 'HH24MISS') AS " + alias; },
        fmtBirthDate:function(col, alias) { return "TO_CHAR(TO_DATE(" + col + ", 'DD/MM/YYYY'), 'DD/MM/YYYY') AS " + alias; },
        today:       "CURRENT_DATE",
        betweenDate: function(col, v1, v2) { return "TO_DATE(" + col + ", 'YYYYMMDD') BETWEEN '" + v1 + "' AND '" + v2 + "'"; },
        datePlaceholder: 'YYYY-MM-DD'
    },
    firebird: {
        fmtDate:     function(col, alias) { return "CAST(" + col + " AS DATE) AS " + alias; },
        fmtTime:     function(col, alias) { return "CAST(" + col + " AS TIME) AS " + alias; },
        fmtBirthDate:function(col, alias) { return "CAST(" + col + " AS DATE) AS " + alias; },
        today:       "CURRENT_DATE",
        betweenDate: function(col, v1, v2) { return "CAST(" + col + " AS DATE) BETWEEN '" + v1 + "' AND '" + v2 + "'"; },
        datePlaceholder: 'YYYY-MM-DD'
    },
    aws: {
        fmtDate:     function(col, alias) { return "DATE_FORMAT(STR_TO_DATE(" + col + ", '%Y%m%d'), '%d/%m/%Y') AS " + alias; },
        fmtTime:     function(col, alias) { return "REPLACE(TIME_FORMAT(CAST(" + col + " AS TIME), '%H%i%s'), ':', '') AS " + alias; },
        fmtBirthDate:function(col, alias) { return "DATE_FORMAT(STR_TO_DATE(" + col + ", '%d/%m/%Y'), '%d/%m/%Y') AS " + alias; },
        today:       "CURDATE()",
        betweenDate: function(col, v1, v2) { return "STR_TO_DATE(" + col + ", '%Y%m%d') BETWEEN '" + v1 + "' AND '" + v2 + "'"; },
        datePlaceholder: 'YYYY-MM-DD'
    }
};

function qbSyntax() {
    return QB_SYNTAX[qbState.db] || QB_SYNTAX['sqlserver'];
}

// ── Views disponíveis ──────────────────
var QB_VIEWS = [
    { id: 'vw_patient',  label: 'VW_PACS_PATIENT',  value: 'VW_PACS_PATIENT' },
    { id: 'vw_worklist', label: 'VW_PACS_WORKLIST', value: 'VW_PACS_WORKLIST' },
    { id: 'vw_study',    label: 'VW_PACS_STUDY',    value: 'VW_PACS_STUDY' }
];

// ── Campos SELECT ──────────────────────
var QB_FIELDS = [
    { id: 'patientid',     label: 'Patient ID',           col: 'PATIENTID',                     grupo: 'Paciente' },
    { id: 'patient_name',  label: 'Patient Name',         col: 'PATIENT_NAME',                  grupo: 'Paciente' },
    { id: 'patient_cpf',   label: 'Patient CPF',          col: 'PATIENT_CPF',                   grupo: 'Paciente' },
    { id: 'patient_sex',   label: 'Patient Sex',          col: 'PATIENT_SEX',                   grupo: 'Paciente' },
    { id: 'patient_bd',    label: 'Patient BirthDate',    grupo: 'Paciente',
      fn: function(s) { return s.fmtBirthDate('PATIENT_BIRTHDATE', 'PATIENT_BIRTHDATE'); } },
    { id: 'acc_number',    label: 'Accession Number',     col: 'ACCESSION_NUMBER',              grupo: 'Estudo' },
    { id: 'study_id',      label: 'Study ID',             col: 'STUDY_ID',                      grupo: 'Estudo' },
    { id: 'modality',      label: 'Modality',             col: 'MODALITY',                      grupo: 'Estudo' },
    { id: 'study_desc',    label: 'Study Description',    col: 'REQUESTEDPROCEDUREDESCRIPTION', grupo: 'Estudo' },
    { id: 'study_date',    label: 'Study Date',           grupo: 'Estudo',
      fn: function(s) { return s.fmtDate('STUDY_DATE', 'STUDY_DATE'); } },
    { id: 'study_time',    label: 'Study Time',           grupo: 'Estudo',
      fn: function(s) { return s.fmtTime('STUDY_TIME', 'STUDY_TIME_HHmmss'); } },
    { id: 'req_service',   label: 'Requesting Service',   col: 'REQUESTING_SERVICE',            grupo: 'Estudo' },
    { id: 'req_physician', label: 'Requesting Physician', col: 'REQUESTING_PHYSICIAN',          grupo: 'Estudo' },
    { id: 'sched_date',    label: 'Schedule Date',        grupo: 'Worklist',
      fn: function(s) { return s.fmtDate('SCHEDULE_STUDY_DATE', 'SCHEDULE_STUDY_DATE'); } },
    { id: 'sched_time',    label: 'Schedule Time',        grupo: 'Worklist',
      fn: function(s) { return s.fmtTime('SCHEDULE_STUDY_TIME', 'SCHEDULE_STUDY_TIME_HHmmss'); } }
];

// ── Campos WHERE ───────────────────────
var QB_WHERE_FIELDS = [
    { id: 'w_patientid',    label: 'Patient ID',           col: 'PATIENTID',                     tipo: 'text' },
    { id: 'w_patient_name', label: 'Patient Name',         col: 'PATIENT_NAME',                  tipo: 'like' },
    { id: 'w_patient_cpf',  label: 'Patient CPF',          col: 'PATIENT_CPF',                   tipo: 'text' },
    { id: 'w_acc_number',   label: 'Accession Number',     col: 'ACCESSION_NUMBER',              tipo: 'text' },
    { id: 'w_modality',     label: 'Modality',             col: 'MODALITY',                      tipo: 'text' },
    { id: 'w_study_date',   label: 'Study Date (período)', col: 'STUDY_DATE',                    tipo: 'between_date' },
    { id: 'w_req_service',  label: 'Requesting Service',   col: 'REQUESTING_SERVICE',            tipo: 'like' },
    { id: 'w_study_desc',   label: 'Study Description',    col: 'REQUESTEDPROCEDUREDESCRIPTION', tipo: 'like' }
];

// ── Estado ─────────────────────────────
var qbState = {
    db: null,
    view: null,
    selectedFields: [],
    filters: []
};

var qbSavedQueries = JSON.parse(localStorage.getItem('mobilemed-qb-saved') || '[]');
var qbHistorico    = JSON.parse(localStorage.getItem('mobilemed-qb-hist')  || '[]');


// ========================================
// COMANDOS — busca + render dinâmico
// ========================================

var CMD_OS_ATUAL = 'windows';

var CMD_DATA = {
    windows: [
        // Rede & IP
        { secao: 'Rede & IP', label: 'Ver IP local',                    cmd: 'ipconfig',                                              tags: 'rede ip ifconfig' },
        { secao: 'Rede & IP', label: 'IP detalhado (DNS, Gateway)',      cmd: 'ipconfig /all',                                         tags: 'rede ip dns gateway' },
        { secao: 'Rede & IP', label: 'Testar conectividade',             cmd: 'ping 8.8.8.8',                                          tags: 'rede ping conectividade' },
        { secao: 'Rede & IP', label: 'Ping contínuo',                    cmd: 'ping -t 8.8.8.8',                                       tags: 'rede ping continuo' },
        { secao: 'Rede & IP', label: 'Rastrear rota',                    cmd: 'tracert 8.8.8.8',                                       tags: 'rede rota tracert' },
        { secao: 'Rede & IP', label: 'Ver conexões ativas',              cmd: 'netstat -an',                                           tags: 'rede conexoes netstat' },
        { secao: 'Rede & IP', label: 'Flush DNS',                        cmd: 'ipconfig /flushdns',                                    tags: 'rede dns flush limpar' },
        { secao: 'Rede & IP', label: 'Testar porta específica',          cmd: 'Test-NetConnection -ComputerName HOST -Port 3306',       tags: 'rede porta tcp' },
        { secao: 'Rede & IP', label: 'Resolver DNS',                     cmd: 'nslookup google.com',                                   tags: 'rede dns nslookup' },
        { secao: 'Rede & IP', label: 'Liberar e renovar IP',             cmd: 'ipconfig /release && ipconfig /renew',                  tags: 'rede ip dhcp renovar' },
        { secao: 'Rede & IP', label: 'Ver tabela ARP',                   cmd: 'arp -a',                                                tags: 'rede arp mac' },
        { secao: 'Rede & IP', label: 'Ver rotas de rede',                cmd: 'route print',                                           tags: 'rede rota route' },
        // Sistema
        { secao: 'Sistema',   label: 'Informações do sistema',           cmd: 'systeminfo',                                            tags: 'sistema info hardware' },
        { secao: 'Sistema',   label: 'Processos em execução',            cmd: 'tasklist',                                              tags: 'sistema processos tasks' },
        { secao: 'Sistema',   label: 'Matar processo por nome',          cmd: 'taskkill /IM nome.exe /F',                              tags: 'sistema matar processo kill' },
        { secao: 'Sistema',   label: 'Ver uso de disco',                 cmd: 'wmic logicaldisk get size,freespace,caption',           tags: 'sistema disco storage hd' },
        { secao: 'Sistema',   label: 'Versão do Windows',                cmd: 'winver',                                                tags: 'sistema versao windows' },
        { secao: 'Sistema',   label: 'Reiniciar serviço',                cmd: 'net stop "NomeServico" && net start "NomeServico"',     tags: 'sistema servico reiniciar' },
        { secao: 'Sistema',   label: 'Listar serviços ativos',           cmd: 'net start',                                             tags: 'sistema servicos listar' },
        { secao: 'Sistema',   label: 'Verificar integridade do sistema', cmd: 'sfc /scannow',                                          tags: 'sistema integridade arquivos' },
        { secao: 'Sistema',   label: 'Uso de CPU e memória (live)',      cmd: 'Get-Process | Sort-Object CPU -Descending | Select -First 10', tags: 'sistema cpu memoria uso' },
        { secao: 'Sistema',   label: 'Ver variáveis de ambiente',        cmd: 'set',                                                   tags: 'sistema variaveis ambiente env' },
        { secao: 'Sistema',   label: 'Limpar cache DNS do sistema',      cmd: 'ipconfig /flushdns && netsh int ip reset',              tags: 'sistema dns cache limpar reset' },
        { secao: 'Sistema',   label: 'Ver usuários logados',             cmd: 'query user',                                            tags: 'sistema usuarios logados sessao' },
        { secao: 'Sistema',   label: 'Ver hora do sistema',              cmd: 'time /t && date /t',                                    tags: 'sistema hora data' },
        // Banco de Dados
        { secao: 'Banco de Dados', label: 'Verificar porta SQL Server',  cmd: 'netstat -an | findstr 1433',                            tags: 'banco sql server porta 1433' },
        { secao: 'Banco de Dados', label: 'Verificar porta MySQL',       cmd: 'netstat -an | findstr 3306',                            tags: 'banco mysql porta 3306' },
        { secao: 'Banco de Dados', label: 'Verificar porta PostgreSQL',  cmd: 'netstat -an | findstr 5432',                            tags: 'banco postgres postgresql porta 5432' },
        { secao: 'Banco de Dados', label: 'Verificar porta Firebird',    cmd: 'netstat -an | findstr 3050',                            tags: 'banco firebird porta 3050' },
        { secao: 'Banco de Dados', label: 'Testar conexão SQL Server',   cmd: 'Test-NetConnection -ComputerName HOST -Port 1433',      tags: 'banco sql server conexao teste' },
        { secao: 'Banco de Dados', label: 'Testar conexão MySQL',        cmd: 'Test-NetConnection -ComputerName HOST -Port 3306',      tags: 'banco mysql conexao teste' },
        // DICOM / PACS
        { secao: 'DICOM / PACS', label: 'Verificar porta DICOM padrão', cmd: 'netstat -an | findstr 104',                             tags: 'dicom pacs porta 104' },
        { secao: 'DICOM / PACS', label: 'Testar porta DICOM',           cmd: 'Test-NetConnection -ComputerName HOST -Port 104',       tags: 'dicom pacs porta teste' },
        { secao: 'DICOM / PACS', label: 'Verificar porta worklist',     cmd: 'netstat -an | findstr 1105',                            tags: 'dicom worklist porta 1105' },
        // Portas & Rede
        { secao: 'Portas & Rede', label: 'Listar todas as portas abertas',          cmd: 'netstat -an',                                                  tags: 'porta rede aberta listen' },
        { secao: 'Portas & Rede', label: 'Portas em LISTEN (aguardando conexão)',   cmd: 'netstat -an | findstr LISTENING',                              tags: 'porta listen escuta aberta' },
        { secao: 'Portas & Rede', label: 'Verificar qual processo usa uma porta',   cmd: 'netstat -ano | findstr :104',                                  tags: 'porta processo pid ocupada' },
        { secao: 'Portas & Rede', label: 'Matar processo que ocupa uma porta',      cmd: 'FOR /F "tokens=5" %P IN ("netstat -ano | findstr :104") DO taskkill /PID %P /F', tags: 'porta matar processo kill pid' },
        { secao: 'Portas & Rede', label: 'Testar porta remota (PowerShell)',         cmd: 'Test-NetConnection -ComputerName HOST -Port 104',               tags: 'porta remota teste tcp' },
        { secao: 'Portas & Rede', label: 'Testar porta com timeout (PowerShell)',    cmd: '(New-Object Net.Sockets.TcpClient).Connect("HOST", 104)',      tags: 'porta tcp socket timeout' },
        { secao: 'Portas & Rede', label: 'Listar portas TCP abertas com PID',        cmd: 'netstat -aon | findstr TCP',                                   tags: 'porta tcp pid lista' },
        { secao: 'Portas & Rede', label: 'Listar portas UDP abertas',                cmd: 'netstat -aon | findstr UDP',                                   tags: 'porta udp lista' },
        { secao: 'Portas & Rede', label: 'Ver porta 80 (HTTP)',                      cmd: 'netstat -an | findstr :80',                                    tags: 'porta 80 http' },
        { secao: 'Portas & Rede', label: 'Ver porta 443 (HTTPS)',                    cmd: 'netstat -an | findstr :443',                                   tags: 'porta 443 https ssl' },
        { secao: 'Portas & Rede', label: 'Ver porta 22 (SSH)',                       cmd: 'netstat -an | findstr :22',                                    tags: 'porta 22 ssh' },
        { secao: 'Portas & Rede', label: 'Ver porta 3389 (RDP)',                     cmd: 'netstat -an | findstr :3389',                                  tags: 'porta 3389 rdp remote desktop' },
        { secao: 'Portas & Rede', label: 'Ver porta 8080 (HTTP alternativo)',        cmd: 'netstat -an | findstr :8080',                                  tags: 'porta 8080 http alternativo' },
        { secao: 'Portas & Rede', label: 'Ver porta 8443 (HTTPS alternativo)',       cmd: 'netstat -an | findstr :8443',                                  tags: 'porta 8443 https alternativo' },
        { secao: 'Portas & Rede', label: 'Verificar porta DICOM (104)',              cmd: 'netstat -an | findstr :104',                                   tags: 'porta dicom 104 pacs' },
        { secao: 'Portas & Rede', label: 'Verificar porta Worklist (1105)',          cmd: 'netstat -an | findstr :1105',                                  tags: 'porta worklist 1105 dicom' },
        { secao: 'Portas & Rede', label: 'Verificar porta SQL Server (1433)',        cmd: 'netstat -an | findstr :1433',                                  tags: 'porta sql server 1433 banco' },
        { secao: 'Portas & Rede', label: 'Verificar porta MySQL (3306)',             cmd: 'netstat -an | findstr :3306',                                  tags: 'porta mysql 3306 banco' },
        { secao: 'Portas & Rede', label: 'Verificar porta PostgreSQL (5432)',        cmd: 'netstat -an | findstr :5432',                                  tags: 'porta postgres 5432 banco' },
        { secao: 'Portas & Rede', label: 'Verificar porta Firebird (3050)',          cmd: 'netstat -an | findstr :3050',                                  tags: 'porta firebird 3050 banco' },
        { secao: 'Portas & Rede', label: 'Verificar porta RabbitMQ (5672)',          cmd: 'netstat -an | findstr :5672',                                  tags: 'porta rabbitmq 5672 fila' },
        { secao: 'Portas & Rede', label: 'Verificar porta Redis (6379)',             cmd: 'netstat -an | findstr :6379',                                  tags: 'porta redis 6379 cache' },
        { secao: 'Portas & Rede', label: 'Abrir porta no Firewall Windows',         cmd: 'netsh advfirewall firewall add rule name="PORTA" protocol=TCP dir=in localport=104 action=allow', tags: 'porta abrir firewall liberar' },
        { secao: 'Portas & Rede', label: 'Fechar porta no Firewall Windows',        cmd: 'netsh advfirewall firewall add rule name="BLOQUEAR" protocol=TCP dir=in localport=104 action=block', tags: 'porta fechar bloquear firewall' },
        // Firewall
        { secao: 'Firewall',  label: 'Ver regras do firewall',           cmd: 'netsh advfirewall firewall show rule name=all',         tags: 'firewall regras' },
        { secao: 'Firewall',  label: 'Desativar firewall (temporário)',  cmd: 'netsh advfirewall set allprofiles state off',           tags: 'firewall desativar off' },
        { secao: 'Firewall',  label: 'Ativar firewall',                  cmd: 'netsh advfirewall set allprofiles state on',            tags: 'firewall ativar on' },
        { secao: 'Firewall',  label: 'Abrir porta no firewall',          cmd: 'netsh advfirewall firewall add rule name="PORTA" protocol=TCP dir=in localport=104 action=allow', tags: 'firewall porta abrir liberar' },
    ],
    linux: [
        // Rede & IP
        { secao: 'Rede & IP', label: 'Ver IP local',                    cmd: 'ip addr show',                                          tags: 'rede ip ifconfig' },
        { secao: 'Rede & IP', label: 'Ver IP (Mac/ifconfig)',           cmd: 'ifconfig',                                              tags: 'rede ip mac' },
        { secao: 'Rede & IP', label: 'Testar conectividade',            cmd: 'ping 8.8.8.8',                                          tags: 'rede ping conectividade' },
        { secao: 'Rede & IP', label: 'Ping com limite de pacotes',      cmd: 'ping -c 10 8.8.8.8',                                   tags: 'rede ping pacotes' },
        { secao: 'Rede & IP', label: 'Rastrear rota',                   cmd: 'traceroute 8.8.8.8',                                   tags: 'rede rota traceroute' },
        { secao: 'Rede & IP', label: 'Ver conexões ativas',             cmd: 'ss -tuln',                                              tags: 'rede conexoes ss netstat' },
        { secao: 'Rede & IP', label: 'Flush DNS (Linux)',               cmd: 'sudo systemd-resolve --flush-caches',                   tags: 'rede dns flush limpar' },
        { secao: 'Rede & IP', label: 'Testar porta específica',         cmd: 'nc -zv HOST 3306',                                     tags: 'rede porta tcp nc' },
        { secao: 'Rede & IP', label: 'Resolver DNS',                    cmd: 'nslookup google.com',                                   tags: 'rede dns nslookup' },
        { secao: 'Rede & IP', label: 'Ver tabela de rotas',             cmd: 'ip route show',                                         tags: 'rede rota route' },
        { secao: 'Rede & IP', label: 'Ver tabela ARP',                  cmd: 'arp -n',                                                tags: 'rede arp mac' },
        { secao: 'Rede & IP', label: 'Monitorar tráfego de rede',       cmd: 'iftop -i eth0',                                         tags: 'rede trafego monitorar' },
        // Sistema
        { secao: 'Sistema',   label: 'Uso de disco',                    cmd: 'df -h',                                                 tags: 'sistema disco storage hd' },
        { secao: 'Sistema',   label: 'Uso de memória',                  cmd: 'free -h',                                               tags: 'sistema memoria ram' },
        { secao: 'Sistema',   label: 'Processos em tempo real',         cmd: 'top',                                                   tags: 'sistema processos cpu' },
        { secao: 'Sistema',   label: 'Processos melhorado',             cmd: 'htop',                                                  tags: 'sistema processos cpu htop' },
        { secao: 'Sistema',   label: 'Versão do sistema',               cmd: 'uname -a',                                              tags: 'sistema versao linux kernel' },
        { secao: 'Sistema',   label: 'Reiniciar serviço (systemd)',      cmd: 'sudo systemctl restart nome-servico',                   tags: 'sistema servico reiniciar systemd' },
        { secao: 'Sistema',   label: 'Status de serviço',               cmd: 'sudo systemctl status nome-servico',                    tags: 'sistema servico status' },
        { secao: 'Sistema',   label: 'Ver logs do sistema',             cmd: 'journalctl -xe',                                        tags: 'sistema logs journal' },
        { secao: 'Sistema',   label: 'Ver logs em tempo real',          cmd: 'journalctl -f',                                         tags: 'sistema logs tempo real' },
        { secao: 'Sistema',   label: 'Ver usuários logados',            cmd: 'who',                                                   tags: 'sistema usuarios logados' },
        { secao: 'Sistema',   label: 'Espaço usado por pasta',          cmd: 'du -sh /caminho/pasta',                                 tags: 'sistema disco pasta tamanho' },
        { secao: 'Sistema',   label: 'Ver processos por porta',         cmd: 'sudo lsof -i :104',                                     tags: 'sistema porta processo lsof' },
        // Banco de Dados
        { secao: 'Banco de Dados', label: 'Verificar porta MySQL',      cmd: 'ss -tuln | grep 3306',                                  tags: 'banco mysql porta 3306' },
        { secao: 'Banco de Dados', label: 'Verificar porta PostgreSQL', cmd: 'ss -tuln | grep 5432',                                  tags: 'banco postgres postgresql porta 5432' },
        { secao: 'Banco de Dados', label: 'Verificar porta Firebird',   cmd: 'ss -tuln | grep 3050',                                  tags: 'banco firebird porta 3050' },
        { secao: 'Banco de Dados', label: 'Reiniciar MySQL',            cmd: 'sudo systemctl restart mysql',                          tags: 'banco mysql reiniciar' },
        { secao: 'Banco de Dados', label: 'Reiniciar PostgreSQL',       cmd: 'sudo systemctl restart postgresql',                     tags: 'banco postgres reiniciar' },
        { secao: 'Banco de Dados', label: 'Entrar no MySQL (root)',      cmd: 'mysql -u root -p',                                      tags: 'banco mysql entrar login' },
        { secao: 'Banco de Dados', label: 'Backup MySQL rápido',        cmd: 'mysqldump -u root -p banco > backup.sql',               tags: 'banco mysql backup dump' },
        // DICOM / PACS
        { secao: 'DICOM / PACS', label: 'Verificar porta DICOM',       cmd: 'ss -tuln | grep 104',                                   tags: 'dicom pacs porta 104' },
        { secao: 'DICOM / PACS', label: 'Testar porta DICOM',          cmd: 'nc -zv HOST 104',                                       tags: 'dicom pacs teste porta' },
        { secao: 'DICOM / PACS', label: 'Ver logs do dcm4chee',        cmd: 'sudo journalctl -u wildfly -f',                         tags: 'dicom pacs dcm4chee logs wildfly' },
        { secao: 'DICOM / PACS', label: 'Reiniciar dcm4chee',          cmd: 'sudo systemctl restart wildfly',                        tags: 'dicom pacs dcm4chee reiniciar wildfly' },
        { secao: 'DICOM / PACS', label: 'Ver porta worklist',          cmd: 'ss -tuln | grep 1105',                                  tags: 'dicom worklist porta 1105' },
        // Portas & Rede
        { secao: 'Portas & Rede', label: 'Listar todas as portas abertas',          cmd: 'ss -tuln',                                                     tags: 'porta rede aberta listen' },
        { secao: 'Portas & Rede', label: 'Portas em LISTEN com processo',           cmd: 'ss -tulnp',                                                    tags: 'porta listen processo pid' },
        { secao: 'Portas & Rede', label: 'Verificar qual processo usa uma porta',   cmd: 'sudo lsof -i :104',                                            tags: 'porta processo pid ocupada lsof' },
        { secao: 'Portas & Rede', label: 'Matar processo que ocupa uma porta',      cmd: 'sudo fuser -k 104/tcp',                                        tags: 'porta matar processo kill fuser' },
        { secao: 'Portas & Rede', label: 'Testar porta remota (nc)',                cmd: 'nc -zv HOST 104',                                              tags: 'porta remota teste nc netcat' },
        { secao: 'Portas & Rede', label: 'Testar porta com timeout (nc)',           cmd: 'nc -zvw 3 HOST 104',                                           tags: 'porta tcp timeout nc' },
        { secao: 'Portas & Rede', label: 'Testar porta remota (bash)',              cmd: 'bash -c "echo > /dev/tcp/HOST/104" && echo aberta || echo fechada', tags: 'porta remota bash tcp' },
        { secao: 'Portas & Rede', label: 'Listar portas TCP abertas',               cmd: 'ss -tln',                                                      tags: 'porta tcp lista aberta' },
        { secao: 'Portas & Rede', label: 'Listar portas UDP abertas',               cmd: 'ss -uln',                                                      tags: 'porta udp lista aberta' },
        { secao: 'Portas & Rede', label: 'Ver porta 80 (HTTP)',                     cmd: 'ss -tuln | grep :80',                                          tags: 'porta 80 http' },
        { secao: 'Portas & Rede', label: 'Ver porta 443 (HTTPS)',                   cmd: 'ss -tuln | grep :443',                                         tags: 'porta 443 https ssl' },
        { secao: 'Portas & Rede', label: 'Ver porta 22 (SSH)',                      cmd: 'ss -tuln | grep :22',                                          tags: 'porta 22 ssh' },
        { secao: 'Portas & Rede', label: 'Ver porta 8080 (HTTP alternativo)',       cmd: 'ss -tuln | grep :8080',                                        tags: 'porta 8080 http alternativo' },
        { secao: 'Portas & Rede', label: 'Ver porta 8443 (HTTPS alternativo)',      cmd: 'ss -tuln | grep :8443',                                        tags: 'porta 8443 https alternativo' },
        { secao: 'Portas & Rede', label: 'Verificar porta DICOM (104)',             cmd: 'ss -tuln | grep :104',                                         tags: 'porta dicom 104 pacs' },
        { secao: 'Portas & Rede', label: 'Verificar porta Worklist (1105)',         cmd: 'ss -tuln | grep :1105',                                        tags: 'porta worklist 1105 dicom' },
        { secao: 'Portas & Rede', label: 'Verificar porta MySQL (3306)',            cmd: 'ss -tuln | grep :3306',                                        tags: 'porta mysql 3306 banco' },
        { secao: 'Portas & Rede', label: 'Verificar porta PostgreSQL (5432)',       cmd: 'ss -tuln | grep :5432',                                        tags: 'porta postgres 5432 banco' },
        { secao: 'Portas & Rede', label: 'Verificar porta Firebird (3050)',         cmd: 'ss -tuln | grep :3050',                                        tags: 'porta firebird 3050 banco' },
        { secao: 'Portas & Rede', label: 'Verificar porta RabbitMQ (5672)',         cmd: 'ss -tuln | grep :5672',                                        tags: 'porta rabbitmq 5672 fila' },
        { secao: 'Portas & Rede', label: 'Verificar porta Redis (6379)',            cmd: 'ss -tuln | grep :6379',                                        tags: 'porta redis 6379 cache' },
        { secao: 'Portas & Rede', label: 'Scan de portas num host (nmap)',          cmd: 'nmap -p 1-1024 HOST',                                          tags: 'porta scan nmap host' },
        { secao: 'Portas & Rede', label: 'Liberar porta no firewall (ufw)',         cmd: 'sudo ufw allow 104/tcp',                                       tags: 'porta liberar ufw firewall' },
        { secao: 'Portas & Rede', label: 'Fechar porta no firewall (ufw)',          cmd: 'sudo ufw deny 104/tcp',                                        tags: 'porta fechar bloquear ufw' },
        // Firewall
        { secao: 'Firewall',  label: 'Ver regras do firewall (ufw)',    cmd: 'sudo ufw status verbose',                               tags: 'firewall ufw regras' },
        { secao: 'Firewall',  label: 'Liberar porta no firewall',       cmd: 'sudo ufw allow 104/tcp',                                tags: 'firewall porta liberar abrir' },
        { secao: 'Firewall',  label: 'Ver regras iptables',             cmd: 'sudo iptables -L -n -v',                                tags: 'firewall iptables regras' },
    ]
};

function cmdInit() {
    cmdRenderOS('windows');
    cmdRenderOS('linux');
}

function cmdRenderOS(os) {
    var el = document.getElementById('cmd-' + os + '-list');
    if (!el) return;
    var cmds = CMD_DATA[os] || [];

    var secoes = {};
    cmds.forEach(function(c) {
        if (!secoes[c.secao]) secoes[c.secao] = [];
        secoes[c.secao].push(c);
    });

    var iconMap = { 'Rede & IP': '🌐', 'Sistema': '🖥️', 'Banco de Dados': '🗄️', 'DICOM / PACS': '📡', 'Firewall': '🔒', 'Portas & Rede': '🔌' };

    el.innerHTML = Object.keys(secoes).map(function(secao, idx) {
        var id = os + '_' + secao.replace(/[^a-z0-9]/gi,'_');
        var itens = secoes[secao].map(function(c) {
            var cmdEsc = c.cmd.replace(/&/g,'&amp;').replace(/"/g,'&quot;');
            return '<div class="cmd-item" data-cmd="' + cmdEsc + '">' +
                '<div class="cmd-info">' +
                '<span class="cmd-label">' + c.label + '</span>' +
                '<code class="cmd-code">' + c.cmd + '</code>' +
                '</div>' +
                '<button class="cmd-copy-btn" onclick="cmdCopiarItem(this)">📋</button>' +
                '</div>';
        }).join('');
        var count = secoes[secao].length;
        return '<div class="cmd-accordion">' +
            '<button class="cmd-accordion-btn" data-secao="' + id + '" onclick="cmdToggleSecao(this)">' +
                '<span class="cmd-accordion-icon">' + (iconMap[secao] || '🔧') + '</span>' +
                '<span class="cmd-accordion-title">' + secao + '</span>' +
                '<span class="cmd-accordion-count">' + count + '</span>' +
                '<svg class="cmd-accordion-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>' +
            '</button>' +
            '<div class="cmd-accordion-body" id="' + id + '">' +
                '<div class="cmd-list">' + itens + '</div>' +
            '</div>' +
            '</div>';
    }).join('');
}

function cmdToggleSecao(btn) {
    var id = btn.getAttribute('data-secao');
    var body = document.getElementById(id);
    if (!body) return;
    var isOpen = body.classList.contains('open');
    body.classList.toggle('open', !isOpen);
    btn.classList.toggle('active', !isOpen);
}

function cmdFiltrar(q) {
    var clear = document.getElementById('cmdSearchClear');
    if (clear) clear.style.display = q ? 'block' : 'none';

    var resultsEl = document.getElementById('cmdSearchResults');
    var windowsEl = document.getElementById('cmd-os-windows');
    var linuxEl   = document.getElementById('cmd-os-linux');

    if (!q.trim()) {
        if (resultsEl) resultsEl.style.display = 'none';
        if (windowsEl) windowsEl.style.display = 'block';
        if (linuxEl)   linuxEl.style.display = 'none';
        // Restaura o OS ativo
        cmdSwitchOS(CMD_OS_ATUAL, document.querySelector('.cmd-os-btn.active'));
        return;
    }

    // Esconde painéis de OS e mostra resultados unificados
    if (windowsEl) windowsEl.style.display = 'none';
    if (linuxEl)   linuxEl.style.display   = 'none';
    if (resultsEl) resultsEl.style.display = 'block';

    var lower = q.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    var todos = [];
    ['windows', 'linux'].forEach(function(os) {
        CMD_DATA[os].forEach(function(c) {
            todos.push({ os: os, cmd: c });
        });
    });

    var filtrado = todos.filter(function(item) {
        var c = item.cmd;
        var texto = (c.label + ' ' + c.cmd + ' ' + c.secao + ' ' + (c.tags || '')).toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return texto.includes(lower);
    });

    if (!filtrado.length) {
        resultsEl.innerHTML = '<div class="storage-empty-hint"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.4"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><div>Nenhum comando encontrado</div></div>';
        return;
    }

    var osBadge = { windows: '🪟 Windows', linux: '🐧 Linux' };
    resultsEl.innerHTML = '<div class="cmd-search-count">' + filtrado.length + ' comando' + (filtrado.length !== 1 ? 's' : '') + ' encontrado' + (filtrado.length !== 1 ? 's' : '') + '</div>' +
        '<div class="cmd-list">' +
        filtrado.map(function(item) {
            var c = item.cmd;
            var cmdEsc = c.cmd.replace(/&/g,'&amp;').replace(/"/g,'&quot;');
            return '<div class="cmd-item" data-cmd="' + cmdEsc + '">' +
                '<div class="cmd-info">' +
                '<span class="cmd-label">' + c.label + ' <span class="cmd-os-badge">' + osBadge[item.os] + '</span></span>' +
                '<code class="cmd-code">' + c.cmd + '</code>' +
                '</div>' +
                '<button class="cmd-copy-btn" onclick="cmdCopiarItem(this)">📋</button>' +
                '</div>';
        }).join('') +
        '</div>';
}

function cmdLimparBusca() {
    var inp = document.getElementById('cmdSearch');
    if (inp) inp.value = '';
    var clear = document.getElementById('cmdSearchClear');
    if (clear) clear.style.display = 'none';
    var resultsEl = document.getElementById('cmdSearchResults');
    if (resultsEl) resultsEl.style.display = 'none';
    cmdSwitchOS(CMD_OS_ATUAL, document.querySelector('.cmd-os-btn.active'));
}

// ========================================
// STORAGE — DCM Links
// ========================================

var STORAGE_GRUPOS = [
    { nome: 'Grupo Star',     link: 'https://star.mobilemed.com.br/dcm4chee-arc/ui2/',          obs: '', gestor: '', telefone: '', tamanho: '' },
    { nome: 'Teleimagem',     link: 'https://teleimagem.mobilemed.com.br/dcm4chee-arc/ui2/',     obs: '', gestor: '', telefone: '', tamanho: '' },
    { nome: 'Digimax 30 dias',link: 'https://digimax.mobilemed.com.br/dcm4chee-arc/ui2/',        obs: '30 dias de retenção', gestor: '', telefone: '', tamanho: '' },
    { nome: 'Digimax Interno',link: 'https://digimax.mobilemed.com.br:8001/dcm4chee-arc/ui2/',   obs: 'Acesso interno', gestor: '', telefone: '', tamanho: '' },
    { nome: 'SPX',            link: 'https://spximagem.mobilemed.com.br/dcm4chee-arc/ui2/',      obs: '', gestor: '', telefone: '', tamanho: '' },
    { nome: 'PRN',            link: 'https://prn.mobilemed.com.br/dcm4chee-arc/ui2/',            obs: '', gestor: '', telefone: '', tamanho: '' },
    { nome: 'Geral',          link: 'https://pacsapi.mobilemed.com.br/dcm4chee-arc/ui2/',        obs: '', gestor: '', telefone: '', tamanho: '' },
    { nome: 'OneYear',        link: 'https://pacsoneyear.mobilemed.com.br/dcm4chee-arc/ui2/',    obs: '1 ano de retenção', gestor: '', telefone: '', tamanho: '' },
    { nome: 'MEDICOM',        link: 'https://s3medicom.mobilemed.com.br/dcm4chee-arc/ui2/',      obs: '', gestor: '', telefone: '', tamanho: '' },
    { nome: 'FIDI',           link: 'https://fidi.mobilemed.com.br/dcm4chee-arc/ui2/',           obs: '', gestor: '', telefone: '', tamanho: '' },
];

function storageInit() {
    // Não renderiza nada no início — aguarda busca
    var el = document.getElementById('storageList');
    var count = document.getElementById('storageCount');
    if (el) el.innerHTML = '<div class="storage-empty-hint"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.4"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><div>Digite o nome do grupo para buscar</div></div>';
    if (count) count.textContent = '10 grupos';
}

function storageFiltrar(q) {
    var clear = document.getElementById('storageSearchClear');
    if (clear) clear.style.display = q ? 'block' : 'none';
    if (!q.trim()) {
        var el = document.getElementById('storageList');
        var count = document.getElementById('storageCount');
        if (el) el.innerHTML = '<div class="storage-empty-hint"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.4"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><div>Digite o nome do grupo para buscar</div></div>';
        if (count) count.textContent = '10 grupos';
        return;
    }
    var lower = q.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
    var filtrado = STORAGE_GRUPOS.filter(function(g) {
        return g.nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').includes(lower)
            || g.link.toLowerCase().includes(lower)
            || (g.obs && g.obs.toLowerCase().includes(lower))
            || (g.gestor && g.gestor.toLowerCase().includes(lower));
    });
    storageRender(filtrado);
}

function storageLimparBusca() {
    var inp = document.getElementById('storageSearch');
    if (inp) inp.value = '';
    var clear = document.getElementById('storageSearchClear');
    if (clear) clear.style.display = 'none';
    storageRender(STORAGE_GRUPOS);
}

function storageRender(lista) {
    var el = document.getElementById('storageList');
    var count = document.getElementById('storageCount');
    if (!el) return;
    if (count) count.textContent = lista.length + ' grupo' + (lista.length !== 1 ? 's' : '');

    if (!lista.length) {
        el.innerHTML = '<div class="qb-empty">Nenhum grupo encontrado.</div>';
        return;
    }

    el.innerHTML = lista.map(function(g, i) {
        var idx = STORAGE_GRUPOS.indexOf(g);

        var badges = '';
        if (g.tamanho) badges += '<span class="storage-badge storage-badge-size">💾 ' + g.tamanho + '</span>';
        if (g.obs)     badges += '<span class="storage-badge storage-badge-obs">📝 ' + g.obs + '</span>';

        var contatos = '';
        if (g.gestor)   contatos += '<div class="storage-info-row"><span class="storage-info-label">👤 Gestor</span><span>' + g.gestor + '</span></div>';
        if (g.telefone) contatos += '<div class="storage-info-row"><span class="storage-info-label">📞 Telefone</span><span>' + g.telefone + '</span></div>';

        return '<div class="storage-card">' +
            '<div class="storage-card-header">' +
                '<div class="storage-card-title">' +
                    '<span class="storage-icon">🗄️</span>' +
                    '<span class="storage-nome">' + g.nome + '</span>' +
                    (badges ? '<div class="storage-badges">' + badges + '</div>' : '') +
                '</div>' +
                '<div class="storage-card-actions">' +
                    '<a href="' + g.link + '" target="_blank" class="storage-btn storage-btn-open">' +
                        '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>' +
                        'Abrir DCM' +
                    '</a>' +
                    '<button class="storage-btn storage-btn-copy" onclick="storageCopiarLink(' + idx + ', this)">' +
                        '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>' +
                        'Copiar Link' +
                    '</button>' +
                '</div>' +
            '</div>' +
            '<div class="storage-link-row">' +
                '<code class="storage-link-code">' + g.link + '</code>' +
            '</div>' +
            (contatos ? '<div class="storage-contatos">' + contatos + '</div>' : '') +
        '</div>';
    }).join('');
}

function storageCopiarLink(idx, btn) {
    var g = STORAGE_GRUPOS[idx];
    if (!g) return;
    navigator.clipboard.writeText(g.link).then(function() {
        var orig = btn.innerHTML;
        btn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#38ef7d" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Copiado!';
        btn.style.background = 'rgba(17,153,142,0.45)';
        setTimeout(function() {
            btn.innerHTML = orig;
            btn.style.background = '';
        }, 1800);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    updateRegisterField(1, 'CRM');
    updateRegisterField(2, 'CRM');
    pwGerarSenhas();
    qbInit();
    storageInit();
    cmdInit();
});

function setupEventListeners() {
    function bind(id, fn) { var el = document.getElementById(id); if (el) el.addEventListener('change', fn); }
    function bindInput(id, fn) { var el = document.getElementById(id); if (el) el.addEventListener('input', fn); }

    bindInput('contrast', function(e) {
        adjustments.contrast = parseInt(e.target.value);
        document.getElementById('contrastValue').textContent = adjustments.contrast + '%';
    });
    bindInput('sharpness', function(e) {
        adjustments.sharpness = parseInt(e.target.value);
        document.getElementById('sharpnessValue').textContent = adjustments.sharpness;
    });
    bind('convertToBlack',    function(e) { adjustments.convertToBlack    = e.target.checked; });
    bind('cleanWeakPixels',   function(e) { adjustments.cleanWeakPixels   = e.target.checked; });
    bind('autoCrop',          function(e) { adjustments.autoCrop          = e.target.checked; });
    bind('applyPythonFilters', function(e) {
        adjustments.applyPythonFilters = e.target.checked;
        var mc = document.getElementById('manualControls');
        mc.style.opacity = e.target.checked ? '0.5' : '1';
        mc.style.pointerEvents = e.target.checked ? 'none' : 'auto';
        document.getElementById('contrast').disabled = e.target.checked;
        document.getElementById('sharpness').disabled = e.target.checked;
    });
    bind('addExtraPhrase', function(e) {
        ['extraPhraseGroup','extraPhrase2Group'].forEach(function(id) {
            document.getElementById(id).classList.toggle('hidden', !e.target.checked);
        });
        if (!e.target.checked) {
            document.getElementById('extraPhrase').value  = '';
            document.getElementById('extraPhrase2').value = '';
        }
    });
    bind('fileInput',  handleFileUpload);
    bind('fileInput2', handleFileUpload2);
    bind('enableSecondSignature', function(e) {
        document.getElementById('doctor2Section').classList.toggle('hidden', !e.target.checked);
        if (!e.target.checked) {
            uploadedImage2 = processedImage2 = null;
            ['doctorName2','doctorCRM2'].forEach(function(id) { document.getElementById(id).value = ''; });
            document.getElementById('fileName2').textContent = '';
            document.getElementById('imagePreviewContainer2').style.display = 'none';
            document.getElementById('removeBgBtn2').classList.add('hidden');
            professionState[2] = { type: 'medico', register: 'CRM' };
            var sel2 = document.getElementById('professionSelector2');
            sel2.querySelectorAll('.profession-btn').forEach(function(b) { b.classList.remove('active'); });
            sel2.querySelector('[data-type="medico"]').classList.add('active');
            updateRegisterField(2, 'CRM');
        }
    });

    // ── Preview ao vivo: regenera a assinatura enquanto o usuário digita ──
    var previewDelay;
    function triggerLivePreview() {
        clearTimeout(previewDelay);
        previewDelay = setTimeout(function() { sigRegenIfReady(); }, 400);
    }
    ['doctorName', 'doctorCRM', 'doctorName2', 'doctorCRM2',
     'extraPhrase', 'extraPhrase2'].forEach(function(id) {
        bindInput(id, triggerLivePreview);
    });
}

function handleFileUpload(e) {
    var file = e.target.files[0];
    if (!file) return;
    document.getElementById('fileName').textContent = 'Arquivo: ' + file.name;
    var reader = new FileReader();
    reader.onload = function(ev) {
        var img = new Image();
        img.onload = function() {
            uploadedImage = img; processedImage = null;
            document.getElementById('imagePreview').src = ev.target.result;
            document.getElementById('imagePreviewContainer').style.display = 'block';
            document.getElementById('removeBgBtn').classList.remove('hidden');
            showMessage('Imagem carregada!', 'success');
        };
        img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
}

function handleFileUpload2(e) {
    var file = e.target.files[0];
    if (!file) return;
    document.getElementById('fileName2').textContent = 'Arquivo: ' + file.name;
    var reader = new FileReader();
    reader.onload = function(ev) {
        var img = new Image();
        img.onload = function() {
            uploadedImage2 = img; processedImage2 = null;
            document.getElementById('imagePreview2').src = ev.target.result;
            document.getElementById('imagePreviewContainer2').style.display = 'block';
            document.getElementById('removeBgBtn2').classList.remove('hidden');
            showMessage('Segunda imagem carregada!', 'success');
        };
        img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
}

function showMessage(text, type) {
    var container = document.getElementById('messageContainer');
    if (!container) return;
    container.innerHTML = '<div class="message message-' + type + '">' + text + '</div>';
    setTimeout(function() { container.innerHTML = ''; }, 5000);
}

function removeBgHelper(img, onDone) {
    var canvas = document.createElement('canvas');
    var ctx    = canvas.getContext('2d', { willReadFrequently: true });
    canvas.width = img.width; canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var data = imageData.data;
    var W = canvas.width, H = canvas.height;
    var corners = [
        { r: data[0],                 g: data[1],                 b: data[2] },
        { r: data[(W-1)*4],           g: data[(W-1)*4+1],         b: data[(W-1)*4+2] },
        { r: data[((H-1)*W)*4],       g: data[((H-1)*W)*4+1],     b: data[((H-1)*W)*4+2] },
        { r: data[((H-1)*W+W-1)*4],   g: data[((H-1)*W+W-1)*4+1], b: data[((H-1)*W+W-1)*4+2] }
    ];
    var bgR = Math.round((corners[0].r+corners[1].r+corners[2].r+corners[3].r)/4);
    var bgG = Math.round((corners[0].g+corners[1].g+corners[2].g+corners[3].g)/4);
    var bgB = Math.round((corners[0].b+corners[1].b+corners[2].b+corners[3].b)/4);
    for (var i = 0; i < data.length; i += 4) {
        var diff = Math.sqrt(Math.pow(data[i]-bgR,2)+Math.pow(data[i+1]-bgG,2)+Math.pow(data[i+2]-bgB,2));
        if (diff < 80) data[i+3] = 0;
    }
    ctx.putImageData(imageData, 0, 0);
    var url    = canvas.toDataURL('image/png');
    var newImg = new Image();
    newImg.onload = function() { onDone(newImg, url); };
    newImg.src = url;
}

function removeBackground() {
    if (!uploadedImage) { showMessage('Selecione uma imagem primeiro!', 'error'); return; }
    var btn  = document.getElementById('removeBgBtn');
    var prog = document.getElementById('modelProgress');
    var bar  = document.getElementById('progressBar');
    var pct  = document.getElementById('progressPercent');
    btn.disabled = true;
    prog.classList.remove('hidden');
    document.getElementById('progressText').textContent = 'Removendo fundo...';
    bar.style.width = '50%'; pct.textContent = '50%';
    try {
        removeBgHelper(uploadedImage, function(newImg, url) {
            processedImage = uploadedImage = newImg;
            document.getElementById('imagePreview').src = url;
            document.getElementById('adjustmentSection').classList.remove('hidden');
            prog.classList.add('hidden');
            bar.style.width = '0%'; pct.textContent = '0%';
            showMessage('Fundo removido!', 'success');
            btn.disabled = false;
        });
    } catch(e) {
        prog.classList.add('hidden');
        showMessage('Erro: ' + e.message, 'error');
        btn.disabled = false;
    }
}

function removeBackground2() {
    if (!uploadedImage2) { showMessage('Selecione a segunda imagem primeiro!', 'error'); return; }
    var btn  = document.getElementById('removeBgBtn2');
    var prog = document.getElementById('modelProgress');
    var bar  = document.getElementById('progressBar');
    var pct  = document.getElementById('progressPercent');
    btn.disabled = true;
    prog.classList.remove('hidden');
    document.getElementById('progressText').textContent = 'Removendo fundo da segunda assinatura...';
    bar.style.width = '50%'; pct.textContent = '50%';
    try {
        removeBgHelper(uploadedImage2, function(newImg, url) {
            processedImage2 = uploadedImage2 = newImg;
            document.getElementById('imagePreview2').src = url;
            prog.classList.add('hidden');
            bar.style.width = '0%'; pct.textContent = '0%';
            showMessage('Fundo da segunda assinatura removido!', 'success');
            btn.disabled = false;
        });
    } catch(e) {
        prog.classList.add('hidden');
        showMessage('Erro: ' + e.message, 'error');
        btn.disabled = false;
    }
}

function resetAdjustments() {
    adjustments = { contrast:200, sharpness:0, convertToBlack:false, cleanWeakPixels:false, autoCrop:false, applyPythonFilters:false };
    document.getElementById('contrast').value = 200;
    document.getElementById('sharpness').value = 0;
    document.getElementById('contrastValue').textContent  = '200%';
    document.getElementById('sharpnessValue').textContent = '0';
    ['convertToBlack','cleanWeakPixels','autoCrop','applyPythonFilters'].forEach(function(id) {
        document.getElementById(id).checked = false;
    });
    var mc = document.getElementById('manualControls');
    mc.style.opacity = '1'; mc.style.pointerEvents = 'auto';
    document.getElementById('contrast').disabled  = false;
    document.getElementById('sharpness').disabled = false;
    showMessage('Ajustes restaurados!', 'success');
}

function applyFiltersPreview() {
    if (!uploadedImage) { showMessage('Selecione uma imagem primeiro!', 'error'); return; }
    var loading = document.getElementById('loading');
    loading.style.display = 'block';
    document.getElementById('loadingText').textContent = 'Aplicando filtros...';
    setTimeout(function() {
        try {
            var canvas = document.createElement('canvas');
            var ctx    = canvas.getContext('2d', { alpha: true, willReadFrequently: true });
            canvas.width = uploadedImage.width; canvas.height = uploadedImage.height;
            ctx.drawImage(uploadedImage, 0, 0);
            applyAllFilters(canvas, ctx);
            document.getElementById('imagePreview').src = canvas.toDataURL('image/png');
            showMessage('Filtros aplicados!', 'success');
        } catch(e) {
            showMessage('Erro: ' + e.message, 'error');
        } finally {
            loading.style.display = 'none';
        }
    }, 100);
}

function applyThreshold(imageData, threshold) {
    // Converte pixels escuros (abaixo do threshold) para preto puro, mantendo transparência
    var data = imageData.data;
    threshold = threshold || 180;
    for (var i = 0; i < data.length; i += 4) {
        if (data[i+3] === 0) continue; // ignora transparente
        var brilho = (data[i] * 0.299 + data[i+1] * 0.587 + data[i+2] * 0.114);
        if (brilho < threshold) {
            // escuro — força preto
            data[i] = 0; data[i+1] = 0; data[i+2] = 0;
        } else {
            // claro — força transparente
            data[i+3] = 0;
        }
    }
    return imageData;
}

function applyContrast(imageData, contrastValue) {
    var data = imageData.data, factor = contrastValue / 100;
    for (var i = 0; i < data.length; i += 4) {
        data[i]   = Math.max(0,Math.min(255,((data[i]  -128)*factor)+128));
        data[i+1] = Math.max(0,Math.min(255,((data[i+1]-128)*factor)+128));
        data[i+2] = Math.max(0,Math.min(255,((data[i+2]-128)*factor)+128));
    }
    return imageData;
}

function applySharpness(canvas, sharpnessValue) {
    if (sharpnessValue === 0) return canvas;
    var ctx = canvas.getContext('2d',{willReadFrequently:true}), W=canvas.width, H=canvas.height;
    var orig = ctx.getImageData(0,0,W,H);
    var blur = document.createElement('canvas'); blur.width=W; blur.height=H;
    var bctx = blur.getContext('2d');
    bctx.filter = 'blur(' + (sharpnessValue > 10 ? '2px' : '1px') + ')';
    bctx.drawImage(canvas,0,0); bctx.filter = 'none';
    var blurData = bctx.getImageData(0,0,W,H), amt = sharpnessValue/3;
    for (var i = 0; i < orig.data.length; i += 4)
        for (var j = 0; j < 3; j++)
            orig.data[i+j] = Math.max(0,Math.min(255, orig.data[i+j]+(orig.data[i+j]-blurData.data[i+j])*amt));
    ctx.putImageData(orig,0,0);
    return canvas;
}

function convertToBlackPure(imageData) {
    var data = imageData.data;
    for (var i = 0; i < data.length; i+=4)
        if (data[i+3]>0) { data[i]=0; data[i+1]=0; data[i+2]=0; }
    return imageData;
}

function cleanWeakPixelsFn(imageData, threshold) {
    threshold = threshold||15;
    var data = imageData.data;
    for (var i=0; i<data.length; i+=4) if (data[i+3]<threshold) data[i+3]=0;
    return imageData;
}

function autoCropCanvas(canvas, margin) {
    margin = margin||15;
    var ctx=canvas.getContext('2d',{willReadFrequently:true}), W=canvas.width, H=canvas.height;
    var data=ctx.getImageData(0,0,W,H).data;
    var minX=W,minY=H,maxX=0,maxY=0,has=false;
    for (var y=0;y<H;y++) for (var x=0;x<W;x++) if (data[(y*W+x)*4+3]>0) {
        has=true;
        if(x<minX)minX=x; if(x>maxX)maxX=x;
        if(y<minY)minY=y; if(y>maxY)maxY=y;
    }
    if (!has) return canvas;
    minX=Math.max(0,minX-margin); minY=Math.max(0,minY-margin);
    maxX=Math.min(W-1,maxX+margin); maxY=Math.min(H-1,maxY+margin);
    var cW=maxX-minX+1, cH=maxY-minY+1;
    var cc=document.createElement('canvas'); cc.width=cW; cc.height=cH;
    cc.getContext('2d').drawImage(canvas,minX,minY,cW,cH,0,0,cW,cH);
    return cc;
}

function applyAllFilters(canvas, ctx) {
    var imageData = ctx.getImageData(0,0,canvas.width,canvas.height);
    if (adjustments.applyPythonFilters) {
        imageData=applyContrast(imageData,400); ctx.putImageData(imageData,0,0); applySharpness(canvas,15);
        imageData=ctx.getImageData(0,0,canvas.width,canvas.height); imageData=applyThreshold(imageData,160); ctx.putImageData(imageData,0,0);
    } else {
        if (adjustments.contrast!==200) { imageData=applyContrast(imageData,adjustments.contrast); ctx.putImageData(imageData,0,0); }
        if (adjustments.sharpness>0) applySharpness(canvas,adjustments.sharpness);
        // Aplica threshold automático leve para eliminar cinzas fracos
        imageData=ctx.getImageData(0,0,canvas.width,canvas.height); imageData=applyThreshold(imageData,200); ctx.putImageData(imageData,0,0);
    }
    if (adjustments.cleanWeakPixels) { imageData=ctx.getImageData(0,0,canvas.width,canvas.height); imageData=cleanWeakPixelsFn(imageData,15); ctx.putImageData(imageData,0,0); }
    if (adjustments.convertToBlack) { imageData=ctx.getImageData(0,0,canvas.width,canvas.height); imageData=convertToBlackPure(imageData); ctx.putImageData(imageData,0,0); }
    if (adjustments.autoCrop) return autoCropCanvas(canvas,15);
    return canvas;
}

function getSelectedFont() { var sel=document.getElementById('fontSelector'); return sel?sel.value:'Arial'; }

function buildSignatureText(name,regVal,regType,e1,e2) {
    var t = name+'\n'+regType+': '+regVal;
    if(e1) t+='\n'+e1; if(e2) t+='\n'+e2;
    return t;
}

function generateSignature() {
    if (!uploadedImage) { showMessage('Selecione uma imagem primeiro!','error'); return; }
    var name=document.getElementById('doctorName').value.trim();
    var crm =document.getElementById('doctorCRM').value.trim();
    if (!name||!crm) { showMessage('Preencha nome e '+professionState[1].register+'!','error'); return; }
    var has2=document.getElementById('enableSecondSignature').checked;
    if (has2) {
        if (!uploadedImage2) { showMessage('Selecione a segunda imagem!','error'); return; }
        if (!document.getElementById('doctorName2').value.trim()||!document.getElementById('doctorCRM2').value.trim()) { showMessage('Preencha dados da segunda assinatura!','error'); return; }
    }
    var loading=document.getElementById('loading'), btn=document.getElementById('generateBtn');
    loading.style.display='block'; document.getElementById('loadingText').textContent='Gerando...'; btn.disabled=true;
    try {
        has2?createDoubleSignature(name,crm):createFinalSignature(name,crm);
        showMessage('Assinatura gerada!','success');
        document.getElementById('downloadBtn').classList.remove('hidden');
    } catch(e) { showMessage('Erro: '+e.message,'error'); }
    finally { loading.style.display='none'; btn.disabled=false; }
}

function createFinalSignature(name,crm) {
    var fc=document.getElementById('previewCanvas'), ctx=fc.getContext('2d',{alpha:true});
    fc.width=600; fc.height=120; ctx.fillStyle='white'; ctx.fillRect(0,0,600,120);
    var img=new Image();
    img.onload=function(){processImageAndDraw(img,fc,ctx,name,crm);};
    img.src=document.getElementById('imagePreview').src;
}

function createDoubleSignature(name,crm) {
    var fc=document.getElementById('previewCanvas'), ctx=fc.getContext('2d',{alpha:true});
    fc.width=600; fc.height=120; ctx.fillStyle='white'; ctx.fillRect(0,0,600,120);
    var img1=new Image(), img2=new Image(), loaded=0;
    var check=function(){if(++loaded===2)processDoubleImages(img1,img2,fc,ctx,name,crm);};
    img1.onload=check; img2.onload=check;
    img1.src=document.getElementById('imagePreview').src;
    img2.src=document.getElementById('imagePreview2').src;
}

function processImageAndDraw(src,fc,ctx,name,crm) {
    var tc=document.createElement('canvas'), tctx=tc.getContext('2d',{alpha:true,willReadFrequently:true});
    tc.width=src.width; tc.height=src.height; tctx.drawImage(src,0,0);
    var pc=applyAllFilters(tc,tctx);
    var sigScale = (document.getElementById('sigSize') ? parseInt(document.getElementById('sigSize').value) : 100) / 100;
    var W=fc.width,H=fc.height,mW=Math.floor(280*sigScale),mH=Math.floor(50*sigScale);
    var ratio=Math.min(mW/pc.width,mH/pc.height,1.0);
    var nW=Math.floor(pc.width*ratio), nH=Math.floor(pc.height*ratio);
    ctx.font='bold 11px "'+getSelectedFont()+'"'; ctx.fillStyle='black'; ctx.textAlign='center';
    var addX=document.getElementById('addExtraPhrase').checked;
    var e1=addX?document.getElementById('extraPhrase').value.trim():'';
    var e2=addX?document.getElementById('extraPhrase2').value.trim():'';
    var text=buildSignatureText(name,crm,professionState[1].register,e1,e2);
    var lines=text.split('\n'), mg=5, hC=nH+mg+lines.length*13;
    var yS=Math.floor((H-hC)/2), xS=Math.floor((W-nW)/2);
    ctx.imageSmoothingEnabled=true; ctx.imageSmoothingQuality='high';
    ctx.drawImage(pc,0,0,pc.width,pc.height,xS,yS,nW,nH);
    lines.forEach(function(l,i){ctx.fillText(l,W/2,yS+nH+mg+11+(i*13));});
    fc.style.display='block';
}

function processDoubleImages(s1,s2,fc,ctx,n1,c1) {
    var mk=function(img){
        var tc=document.createElement('canvas'),tctx=tc.getContext('2d',{alpha:true,willReadFrequently:true});
        tc.width=img.width;tc.height=img.height;tctx.drawImage(img,0,0);return applyAllFilters(tc,tctx);
    };
    var sigScale2 = (document.getElementById('sigSize') ? parseInt(document.getElementById('sigSize').value) : 100) / 100;
    var pc1=mk(s1),pc2=mk(s2),W=fc.width,H=fc.height,mW=Math.floor(240*sigScale2),mH=Math.floor(50*sigScale2);
    var r1=Math.min(mW/pc1.width,mH/pc1.height,1),nW1=Math.floor(pc1.width*r1),nH1=Math.floor(pc1.height*r1);
    var r2=Math.min(mW/pc2.width,mH/pc2.height,1),nW2=Math.floor(pc2.width*r2),nH2=Math.floor(pc2.height*r2);
    ctx.font='bold 11px "'+getSelectedFont()+'"'; ctx.fillStyle='black'; ctx.textAlign='center';
    var n2=document.getElementById('doctorName2').value.trim();
    var c2=document.getElementById('doctorCRM2').value.trim();
    var addX=document.getElementById('addExtraPhrase').checked;
    var e1=addX?document.getElementById('extraPhrase').value.trim():'';
    var e2=addX?document.getElementById('extraPhrase2').value.trim():'';
    var t1=buildSignatureText(n1,c1,professionState[1].register,e1,'');
    var t2=buildSignatureText(n2,c2,professionState[2].register,e2,'');
    var l1=t1.split('\n'),l2=t2.split('\n'),mg=5;
    var hC1=nH1+mg+l1.length*13,yS1=Math.floor((H-hC1)/2),xC1=W/4;
    var hC2=nH2+mg+l2.length*13,yS2=Math.floor((H-hC2)/2),xC2=(W*3)/4;
    ctx.imageSmoothingEnabled=true; ctx.imageSmoothingQuality='high';
    ctx.drawImage(pc1,0,0,pc1.width,pc1.height,Math.floor(xC1-nW1/2),yS1,nW1,nH1);
    l1.forEach(function(l,i){ctx.fillText(l,xC1,yS1+nH1+mg+11+(i*13));});
    ctx.drawImage(pc2,0,0,pc2.width,pc2.height,Math.floor(xC2-nW2/2),yS2,nW2,nH2);
    l2.forEach(function(l,i){ctx.fillText(l,xC2,yS2+nH2+mg+11+(i*13));});
    fc.style.display='block';
}

function sigRegenIfReady() {
    // Regenera a assinatura automaticamente se já foi gerada antes
    var canvas = document.getElementById('previewCanvas');
    if (!canvas || canvas.style.display === 'none' || !uploadedImage) return;
    var name = document.getElementById('doctorName').value.trim();
    var crm  = document.getElementById('doctorCRM').value.trim();
    if (!name || !crm) return;
    var has2 = document.getElementById('enableSecondSignature').checked;
    if (has2) {
        if (!uploadedImage2) return;
        if (!document.getElementById('doctorName2').value.trim()) return;
        if (!document.getElementById('doctorCRM2').value.trim()) return;
        createDoubleSignature(name, crm);
    } else {
        createFinalSignature(name, crm);
    }
}

function downloadImage() {
    var canvas=document.getElementById('previewCanvas');
    var name=document.getElementById('doctorName').value.trim()||'Assinatura';
    canvas.toBlob(function(blob){
        var url=URL.createObjectURL(blob),a=document.createElement('a');
        a.href=url; a.download='Assinatura - '+name+'.png';
        document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
        showMessage('Download iniciado!','success');
    },'image/png');
}

// ========================================
// GERADOR DE SENHA
// ========================================

var pwSavedUsers = [];

function toggleEmailManual(on) {
    document.getElementById('pwModoAuto').style.display   = on ? 'none'  : 'block';
    document.getElementById('pwModoManual').style.display = on ? 'block' : 'none';
    if (on) {
        document.getElementById('pwNomeManual').value      = '';
        document.getElementById('pwEmailManualInput').value = '';
    } else {
        document.getElementById('pwNomes').value = '';
        pwAtualizarContador();
    }
}

function pwAtualizarContador() {
    var nomes=pwParsearNomes(), el=document.getElementById('pwNomeCount');
    if (el) el.textContent = nomes.length + ' nome' + (nomes.length!==1?'s':'');
}

function pwAtualizarPreview() {
    var dominio=document.getElementById('pwDominio').value||'mobilemed.com.br';
    var el=document.getElementById('pwDominioPreview');
    if (el) el.textContent=dominio;
}

function pwNomeParaEmail(nome) {
    var trimmed=nome.trim();
    if (trimmed.includes('.')) {
        return trimmed.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9.]/g,'');
    }
    return trimmed.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z\s]/g,'').trim().split(/\s+/).join('.');
}

function pwParsearNomes() {
    var textarea=document.getElementById('pwNomes');
    if (!textarea) return [];
    return textarea.value.split('\n').map(function(n){return n.trim();}).filter(function(n){return n.length>0;});
}

function pwRand(arr) { return arr[Math.floor(Math.random()*arr.length)]; }

function pwGerarSenha(len,useSpecial,upperOnly) {
    var lower='abcdefghijklmnopqrstuvwxyz',upper='ABCDEFGHIJKLMNOPQRSTUVWXYZ',digits='0123456789',special='@#$%&!';
    var chars=upperOnly?upper+digits:lower+upper+digits;
    if (useSpecial) chars+=special;
    var mandatory=[];
    if (!upperOnly) mandatory.push(pwRand(lower));
    mandatory.push(pwRand(upper)); mandatory.push(pwRand(digits));
    if (useSpecial) mandatory.push(pwRand(special));
    var rest=len-mandatory.length; if(rest<0)rest=0;
    for(var i=0;i<rest;i++) mandatory.push(pwRand(chars));
    for(var i=mandatory.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=mandatory[i];mandatory[i]=mandatory[j];mandatory[j]=t;}
    return mandatory.join('');
}

// Gerador individual (Geral)
function pwGerarSenhas() {
    var prefix     = document.getElementById('pwPrefix').value || 'Mobile';
    var qty        = +document.getElementById('pwQty').value;
    var len        = +document.getElementById('pwLen').value;
    var useSpecial = document.getElementById('pwSpecial').checked;
    var upperOnly  = document.getElementById('pwUpper').checked;
    var list       = document.getElementById('pwList');
    list.innerHTML = '';

    for (var i = 0; i < qty; i++) {
        var senha = prefix + '@' + pwGerarSenha(len, useSpecial, upperOnly);
        var div   = document.createElement('div');
        div.className = 'pw-password-item';
        div.setAttribute('data-senha', senha);
        div.innerHTML =
            '<span>' + senha + '</span>' +
            '<button onclick="pwRegenOne(this,\'' + prefix + '\',' + len + ',' + useSpecial + ',' + upperOnly + ')" title="Regerar">' +
            '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
            '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg></button>' +
            '<button onclick="pwSalvarGeral(this)" title="Salvar">' +
            '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
            '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>' +
            '<polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg></button>' +
            '<button onclick="pwCopiar(this)" title="Copiar">' +
            '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
            '<rect x="9" y="9" width="13" height="13" rx="2"/>' +
            '<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button>';
        list.appendChild(div);
    }
}

function pwSalvarGeral(btn) {
    // Sobe pelo DOM com segurança até encontrar pw-password-item
    var item = btn;
    while (item) {
        if (item.classList && item.classList.contains('pw-password-item')) break;
        item = item.parentElement;
    }
    if (!item) return;

    var senha      = item.getAttribute('data-senha') || item.querySelector('span').textContent.trim();
    var nomeEl     = document.getElementById('pwGeralNome');
    var emailEl    = document.getElementById('pwGeralEmail');
    var nomeFinal  = (nomeEl  && nomeEl.value.trim())  ? nomeEl.value.trim()  : 'Sem nome';
    var emailFinal = (emailEl && emailEl.value.trim()) ? emailEl.value.trim() : '—';

    var existe = pwSavedUsers.some(function(s) { return s.password === senha; });
    if (existe) {
        // feedback visual mesmo se já existe
        var btnEl = btn;
        while (btnEl && btnEl.tagName !== 'BUTTON') { btnEl = btnEl.parentElement; }
        if (btnEl) pwGeralFeedback(btnEl, '✅');
        return;
    }

    pwSavedUsers.push({
        name:     nomeFinal,
        email:    emailFinal,
        password: senha,
        date:     new Date().toLocaleDateString('pt-BR')
    });

    var total = pwSavedUsers.length;
    var sc  = document.getElementById('savedCount');
    var scg = document.getElementById('savedCountGeral');
    if (sc)  sc.textContent  = total;
    if (scg) scg.textContent = total;
    pwRenderUsers();

    var btnEl = btn;
    while (btnEl && btnEl.tagName !== 'BUTTON') { btnEl = btnEl.parentElement; }
    if (btnEl) pwGeralFeedback(btnEl, '✅');
}

function pwGeralFeedback(btn, icon) {
    if (!btn) return;
    var orig = btn.innerHTML;
    btn.innerHTML = icon;
    setTimeout(function() { btn.innerHTML = orig; }, 1500);
}

function pwRegenOne(btn, prefix, len, useSpecial, upperOnly) {
    var item = btn.closest('.pw-password-item');
    var nova = prefix + '@' + pwGerarSenha(len, useSpecial, upperOnly);
    item.querySelector('span').textContent = nova;
    item.setAttribute('data-senha', nova); // atualiza data-senha também
    item.style.animation = 'none';
    requestAnimationFrame(function() { item.style.animation = 'fadeIn 0.3s ease'; });
}

// Gerador de implantação em lote
function pwGerarImplantacao() {
    var prefix     = document.getElementById('pwPrefixImp').value || 'Mobile';
    var len        = +document.getElementById('pwLenImp').value;
    var useSpecial = document.getElementById('pwSpecialImp').checked;
    var upperOnly  = document.getElementById('pwUpperImp').checked;
    var emailManual = document.getElementById('pwEmailManual').checked;
    var list        = document.getElementById('pwListImp');
    list.innerHTML  = '';

    if (emailManual) {
        var nomeManual     = document.getElementById('pwNomeManual').value.trim();
        var emailManualVal = document.getElementById('pwEmailManualInput').value.trim();
        if (!nomeManual || !emailManualVal) { alert('Preencha o nome e o e-mail completo do usuário.'); return; }
        if (!emailManualVal.includes('@'))  { alert('Digite um e-mail válido com @.'); return; }
        var senha = prefix + '@' + pwGerarSenha(len, useSpecial, upperOnly);
        list.appendChild(pwCriarItemImp(nomeManual, emailManualVal, senha));
        pwSavedUsers.push({ name: nomeManual, email: emailManualVal, password: senha, date: new Date().toLocaleDateString('pt-BR') });
        document.getElementById('savedCount').textContent = pwSavedUsers.length;
        pwRenderUsers();
        return;
    }

    var nomes   = pwParsearNomes();
    var dominio = document.getElementById('pwDominio').value.trim() || 'mobilemed.com.br';
    if (!nomes.length) { alert('Digite pelo menos um nome.'); return; }
    nomes.forEach(function(nome) {
        var email = pwNomeParaEmail(nome) + '@' + dominio;
        var senha = prefix + '@' + pwGerarSenha(len, useSpecial, upperOnly);
        list.appendChild(pwCriarItemImp(nome, email, senha));
        pwSavedUsers.push({ name: nome, email: email, password: senha, date: new Date().toLocaleDateString('pt-BR') });
    });
    document.getElementById('savedCount').textContent = pwSavedUsers.length;
    pwRenderUsers();
}

function pwCriarItemImp(nome, email, senha) {
    var div = document.createElement('div');
    div.className = 'pw-password-item pw-implantacao-item';
    div.innerHTML =
        '<div style="flex:1;min-width:0;">' +
        '<div style="font-size:12px;opacity:0.7;margin-bottom:2px;">' + nome + '</div>' +
        '<div style="font-size:13px;word-break:break-all;">' + email + '</div>' +
        '<div style="font-family:Courier New,monospace;font-size:14px;margin-top:2px;">' + senha + '</div>' +
        '</div>' +
        '<button onclick="pwCopiarItemCredencial(this)" data-email="' + email + '" data-senha="' + senha + '">' +
        '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
        '<rect x="9" y="9" width="13" height="13" rx="2"/>' +
        '<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>' +
        '</svg></button>';
    return div;
}

function pwCopiarItemCredencial(btn) {
    navigator.clipboard.writeText('Email: '+btn.dataset.email+' | Senha: '+btn.dataset.senha).then(function(){
        var orig=btn.innerHTML;
        btn.innerHTML='<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#38ef7d" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>';
        setTimeout(function(){btn.innerHTML=orig;},1500);
    });
}


function pwCopiar(btn) {
    var text=btn.closest('.pw-password-item').querySelector('span').textContent;
    navigator.clipboard.writeText(text).then(function(){
        btn.classList.add('copied');
        btn.innerHTML='<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>';
        setTimeout(function(){
            btn.classList.remove('copied');
            btn.innerHTML='<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
        },1500);
    });
}

function pwRenderUsers() {
    var list=document.getElementById('pwUserList');
    var actions=document.getElementById('pwModalActions');
    // Sincroniza ambos os contadores
    var total = pwSavedUsers.length;
    var sc  = document.getElementById('savedCount');
    var scg = document.getElementById('savedCountGeral');
    if (sc)  sc.textContent  = total;
    if (scg) scg.textContent = total;
    if (!pwSavedUsers.length) {
        list.innerHTML='<div class="pw-empty">Nenhum usuário salvo ainda.</div>';
        actions.style.display='none';
        document.getElementById('pwMsgSection').style.display = 'none';
        return;
    }
    actions.style.display='flex';
    document.getElementById('pwMsgSection').style.display = 'block';
    list.innerHTML=pwSavedUsers.map(function(u,i){
        return '<div class="pw-user-item">'+
            '<div style="min-width:0;flex:1;">'+
            '<div style="font-weight:600;">'+u.name+'</div>'+
            '<div class="uemail">'+u.email+' · '+u.date+'</div>'+
            '<div style="font-family:\'Courier New\',monospace;font-size:12px;margin-top:3px;opacity:0.85;letter-spacing:0.5px;">'+u.password+'</div>'+
            '</div>'+
            '<div class="uactions">'+
            '<button onclick="navigator.clipboard.writeText(\''+u.password+'\')">Copiar senha</button>'+
            '<button class="del-btn" onclick="pwRemoveUser('+i+')">Remover</button>'+
            '</div></div>';
    }).join('');
}

function pwCopiarCredenciais() {
    if (!pwSavedUsers.length) return;
    var texto=pwSavedUsers.map(function(u){return 'Email: '+u.email+' | Senha: '+u.password;}).join('\n');
    navigator.clipboard.writeText(texto).then(function(){pwFeedbackBtn('.pw-btn-credenciais','Copiado!');});
}

var PW_PORTAIS = {
    'mobilemed':    'laudos.mobilemed.com.br/login',
    'mobilemedvet': 'portal.mobilemedvet.com.br/exames'
};

function pwGetPortal() {
    var sel = document.getElementById('pwPortalSelect');
    return sel ? (PW_PORTAIS[sel.value] || PW_PORTAIS['mobilemed']) : PW_PORTAIS['mobilemed'];
}


function pwSelecionarPortal(valor, btn) {
    var input = document.getElementById('pwPortalSelect');
    if (input) input.value = valor;
    document.querySelectorAll('.pw-portal-btn').forEach(function(b) { b.classList.remove('active'); });
    if (btn) btn.classList.add('active');
}

function pwGetMsgPadrao() {
    var portal = pwGetPortal();
    return [
        'Seja bem-vindo(a) ao nosso sistema de Telerradiologia MobileMed!',
        'Seguem abaixo as informacoes necessarias para o seu primeiro acesso:',
        '',
        'Portal: ' + portal,
        'Login (e-mail): {email}',
        'Senha Temporaria: {senha}',
        '',
        'Atenciosamente,',
        'Equipe MobileMed'
    ].join('\n');
}

var PW_MSG_PADRAO = [
    'Seja bem-vindo(a) ao nosso sistema de Telerradiologia MobileMed!',
    'Seguem abaixo as informacoes necessarias para o seu primeiro acesso:',
    '',
    'Portal: laudos.mobilemed.com.br/login',
    'Login (e-mail): {email}',
    'Senha Temporaria: {senha}',
    '',
    'Atenciosamente,',
    'Equipe MobileMed'
].join('\n');

function pwCarregarMensagemPadrao() {
    var editor = document.getElementById('pwMsgEditor') || document.getElementById('pwMensagemCustom');
    if (!editor) return;
    editor.value = pwGetMsgPadrao();
}

function pwToggleMensagemEditor() {
    var ed = document.getElementById('pwMensagemEditor');
    var ic = document.getElementById('pwMsgToggleIcon');
    if (!ed) return;
    var open = ed.style.display !== 'none';
    ed.style.display = open ? 'none' : 'block';
    if (ic) ic.textContent = open ? '▼' : '▲';
}

function pwLimparMensagem() {
    var ed = document.getElementById('pwMensagemCustom');
    if (ed) ed.value = '';
}

function pwCopiarMensagemCustom() {
    if (!pwSavedUsers.length) return;
    var ed = document.getElementById('pwMensagemCustom');
    var template = ed && ed.value.trim() ? ed.value : pwGetMsgPadrao();
    var partes = pwSavedUsers.map(function(u) {
        return template.split('{nome}').join(u.name).split('{email}').join(u.email).split('{senha}').join(u.password);
    });
    navigator.clipboard.writeText(partes.join('\n\n---\n\n')).then(function() {
        pwFeedbackBtn('.pw-btn-exportcsv', 'Copiado!');
    });
}

function pwCopiarMensagem() {
    if (!pwSavedUsers.length) return;
    var editor   = document.getElementById('pwMsgEditor');
    var template = editor && editor.value.trim() ? editor.value : pwGetMsgPadrao();
    var partes   = pwSavedUsers.map(function(u) {
        return template
            .split('{nome}').join(u.name)
            .split('{email}').join(u.email)
            .split('{senha}').join(u.password);
    });
    navigator.clipboard.writeText(partes.join('\n\n---\n\n')).then(function() {
        pwFeedbackBtn('.pw-btn-mensagem', 'Copiado!');
    });
}

function pwFeedbackBtn(selector, msg) {
    var btn = document.querySelector(selector);
    if (!btn) return;
    var orig = btn.innerHTML;
    btn.textContent = msg;
    setTimeout(function() { btn.innerHTML = orig; }, 2000);
}

function pwRemoveUser(i) {
    pwSavedUsers.splice(i, 1);
    document.getElementById('savedCount').textContent = pwSavedUsers.length;
    pwRenderUsers();
}

function pwExportarCSV() {
    if (!pwSavedUsers.length) return;
    var linhas=['Nome,Email,Senha,Data'];
    pwSavedUsers.forEach(function(u){
        linhas.push('"'+u.name+'","'+u.email+'","'+u.password+'","'+u.date+'"');
    });
    var csv=linhas.join('\r\n');
    var blob=new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8;'});
    var url=URL.createObjectURL(blob), a=document.createElement('a');
    a.href=url;
    a.download='mobilemed_usuarios_'+new Date().toLocaleDateString('pt-BR').replace(/\//g,'-')+'.csv';
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    pwFeedbackBtn('.pw-btn-exportcsv','Baixando!');
}

function pwExportarExcel() {
    if (!pwSavedUsers.length) return;
    if (typeof XLSX==='undefined') { alert('Biblioteca Excel ainda carregando. Tente novamente.'); return; }
    var dados=pwSavedUsers.map(function(u){return{'Nome':u.name,'Email':u.email,'Senha':u.password,'Data':u.date};});
    var ws=XLSX.utils.json_to_sheet(dados);
    ws['!cols']=[{wch:25},{wch:35},{wch:25},{wch:12}];
    var wb=XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb,ws,'Usuarios');
    XLSX.writeFile(wb,'mobilemed_usuarios_'+new Date().toLocaleDateString('pt-BR').replace(/\//g,'-')+'.xlsx');
    pwFeedbackBtn('.pw-btn-exportxlsx','Baixando!');
}

function pwImportarArquivo(input) {
    var file=input.files[0]; if (!file) return;
    var info=document.getElementById('pwImportInfo');
    var ext=file.name.split('.').pop().toLowerCase();
    var reader=new FileReader();
    reader.onload=function(e){
        try {
            var usuarios=[];
            if (ext==='csv') {
                usuarios=pwParsearCSV(e.target.result);
            } else if (ext==='xlsx'||ext==='xls') {
                if (typeof XLSX==='undefined') { alert('Biblioteca Excel ainda carregando.'); return; }
                var wb=XLSX.read(e.target.result,{type:'binary'});
                var ws=wb.Sheets[wb.SheetNames[0]];
                var json=XLSX.utils.sheet_to_json(ws,{defval:''});
                usuarios=pwNormalizarLinhas(json);
            }
            if (!usuarios.length) { info.textContent='Nenhum usuário encontrado no arquivo.'; return; }
            var adicionados=0;
            usuarios.forEach(function(u){
                var existe=pwSavedUsers.some(function(s){return s.email===u.email;});
                if (!existe) { pwSavedUsers.push(u); adicionados++; }
            });
            document.getElementById('savedCount').textContent=pwSavedUsers.length;
            pwRenderUsers();
            info.textContent=adicionados+' usuário(s) importado(s) com senha gerada!';
            setTimeout(function(){info.textContent='';},4000);
        } catch(err) { info.textContent='Erro ao ler o arquivo: '+err.message; }
        input.value='';
    };
    if (ext==='csv') reader.readAsText(file,'UTF-8');
    else reader.readAsBinaryString(file);
}

function pwGerarSenhaImport() {
    // Usa prefixo e configs do painel de implantação
    var prefix     = (document.getElementById('pwPrefixImp')  || {}).value || 'Mobile';
    var useSpecial = document.getElementById('pwSpecialImp') ? document.getElementById('pwSpecialImp').checked : true;
    var upperOnly  = document.getElementById('pwUpperImp')   ? document.getElementById('pwUpperImp').checked   : false;
    var len        = document.getElementById('pwLenImp')     ? parseInt(document.getElementById('pwLenImp').value) : 6;
    return prefix + '@' + pwGerarSenha(len, useSpecial, upperOnly);
}

function pwParsearCSV(texto) {
    // Remove BOM UTF-8 se presente
    texto = texto.replace(/^\uFEFF/, '');
    var sep = texto.indexOf('\r\n') !== -1 ? '\r\n' : '\n';
    var linhas = texto.split(sep).filter(function(l){ return l.trim(); });
    if (linhas.length < 2) return [];
    var header = linhas[0].split(',').map(function(h){ return h.replace(/"/g,'').trim().toLowerCase(); });
    var iNome  = header.findIndex(function(h){ return h.includes('nome'); });
    var iEmail = header.findIndex(function(h){ return h.includes('email'); });
    if (iEmail === -1) throw new Error('O arquivo precisa ter uma coluna Email.');
    return linhas.slice(1).map(function(linha){
        var cols = linha.match(/(".*?"|[^,]+)(?=,|$)/g) || linha.split(',');
        function lim(v){ return (v||'').toString().replace(/^"|"$/g,'').trim(); }
        var email = lim(cols[iEmail]);
        if (!email) return null;
        return {
            name:     iNome >= 0 ? lim(cols[iNome]) || 'Importado' : 'Importado',
            email:    email,
            password: pwGerarSenhaImport(),
            date:     new Date().toLocaleDateString('pt-BR')
        };
    }).filter(Boolean);
}

function pwNormalizarLinhas(json) {
    return json.map(function(row){
        function norm(){
            var keys = Array.prototype.slice.call(arguments);
            for (var i=0; i<keys.length; i++){
                var f = Object.keys(row).find(function(r){ return r.toLowerCase().includes(keys[i]); });
                if (f && row[f]) return String(row[f]).trim();
            }
            return '';
        }
        var email = norm('email');
        if (!email) return null;
        return {
            name:     norm('nome') || 'Importado',
            email:    email,
            password: pwGerarSenhaImport(),
            date:     new Date().toLocaleDateString('pt-BR')
        };
    }).filter(Boolean);
}


// ========================================
// PLANILHA DE IMPLANTAÇÃO
// ========================================

var planEquips    = [];
var planServidores = [];
var planUsuarios  = [];

function planSwitchSection(id, btn) {
    document.querySelectorAll('.plan-section').forEach(function(s) { s.classList.remove('active'); });
    document.querySelectorAll('.plan-nav-btn').forEach(function(b) { b.classList.remove('active'); });
    document.getElementById('plan-section-' + id).classList.add('active');
    btn.classList.add('active');
}

// ── Equipamentos ──────────────────────
function planAddEquip() {
    planEquips.push({ unidade:'', modalidade:'', marca:'', modelo:'', ip:'', porta:'', aetitle:'', local:'', obs:'' });
    planRenderEquips();
}
function planRemoveEquip(i) { planEquips.splice(i,1); planRenderEquips(); }
function planRenderEquips() {
    var el = document.getElementById('plan-equip-list');
    if (!planEquips.length) { el.innerHTML = '<div class="qb-empty">Nenhum equipamento adicionado ainda.</div>'; return; }
    el.innerHTML = planEquips.map(function(e, i) {
        return '<div class="plan-row-card">' +
            '<div class="plan-row-header"><span>Equipamento #' + (i+1) + '</span>' +
            '<button class="qb-action-btn qb-action-danger" onclick="planRemoveEquip(' + i + ')">✕ Remover</button></div>' +
            '<div class="plan-row-grid">' +
            planInput('Unidade',          'pe_unidade_'+i,    e.unidade,    'Unidade/Setor',       'pe_unidade_'+i) +
            planInput('Modalidade',       'pe_modal_'+i,      e.modalidade, 'Ex: CR, CT, US...',   'pe_modal_'+i) +
            planInput('Marca',            'pe_marca_'+i,      e.marca,      'Marca',               'pe_marca_'+i) +
            planInput('Modelo',           'pe_modelo_'+i,     e.modelo,     'Modelo',              'pe_modelo_'+i) +
            planInput('IP',               'pe_ip_'+i,         e.ip,         '192.168.x.x',         'pe_ip_'+i) +
            planInput('Porta',            'pe_porta_'+i,      e.porta,      'Ex: 104',             'pe_porta_'+i) +
            planInput('AETitle',          'pe_aetitle_'+i,    e.aetitle,    'AE Title',            'pe_aetitle_'+i) +
            planInput('Localização Física','pe_local_'+i,     e.local,      'Ex: Sala de RX',      'pe_local_'+i) +
            planInput('Observações',      'pe_obs_'+i,        e.obs,        'Observações',         'pe_obs_'+i) +
            '</div></div>';
    }).join('');
}

// ── Servidores ────────────────────────
function planAddServidor() {
    planServidores.push({ unidade:'', servico:'', sistema:'', ip:'', acesso:'', usuario:'', senha:'' });
    planRenderServidores();
}
function planRemoveServidor(i) { planServidores.splice(i,1); planRenderServidores(); }
function planRenderServidores() {
    var el = document.getElementById('plan-servidor-list');
    if (!planServidores.length) { el.innerHTML = '<div class="qb-empty">Nenhum servidor adicionado ainda.</div>'; return; }
    el.innerHTML = planServidores.map(function(s, i) {
        return '<div class="plan-row-card">' +
            '<div class="plan-row-header"><span>Servidor #' + (i+1) + '</span>' +
            '<button class="qb-action-btn qb-action-danger" onclick="planRemoveServidor(' + i + ')">✕ Remover</button></div>' +
            '<div class="plan-row-grid">' +
            planInput('Unidade',                  'ps_unidade_'+i, s.unidade, 'Unidade',           'ps_unidade_'+i) +
            planInput('Serviço (Router/Worklist)', 'ps_servico_'+i, s.servico, 'Router / Worklist', 'ps_servico_'+i) +
            planInput('Sistema',                  'ps_sistema_'+i, s.sistema, 'Ex: Windows Server','ps_sistema_'+i) +
            planInput('IP',                       'ps_ip_'+i,      s.ip,      '192.168.x.x',       'ps_ip_'+i) +
            planInput('Acesso Externo SSH/Team',  'ps_acesso_'+i,  s.acesso,  'Ex: TeamViewer ID', 'ps_acesso_'+i) +
            planInput('Usuário',                  'ps_user_'+i,    s.usuario, 'Usuário',           'ps_user_'+i) +
            planInput('Senha',                    'ps_senha_'+i,   s.senha,   'Senha',             'ps_senha_'+i) +
            '</div></div>';
    }).join('');
}

// ── Usuários ──────────────────────────
function planAddUsuario() {
    planUsuarios.push({ nome:'', email:'', telefone:'', permissao:'', crm:'', estado:'' });
    planRenderUsuarios();
}
function planRemoveUsuario(i) { planUsuarios.splice(i,1); planRenderUsuarios(); }
function planRenderUsuarios() {
    var el = document.getElementById('plan-usuario-list');
    if (!planUsuarios.length) { el.innerHTML = '<div class="qb-empty">Nenhum usuário adicionado ainda.</div>'; return; }
    var perms = ['MÉDICO RADIOLOGISTA','TÉCNICO','DIGITADOR (A)','MÉDICO SOLICITANTE','GESTOR','FINANCEIRO / RELATÓRIOS','SOMENTE LEITURA','MÉDICO EXECUTANTE'];
    el.innerHTML = planUsuarios.map(function(u, i) {
        var opts = perms.map(function(p) {
            return '<option value="' + p + '"' + (u.permissao === p ? ' selected' : '') + '>' + p + '</option>';
        }).join('');
        return '<div class="plan-row-card">' +
            '<div class="plan-row-header"><span>Usuário #' + (i+1) + '</span>' +
            '<button class="qb-action-btn qb-action-danger" onclick="planRemoveUsuario(' + i + ')">✕ Remover</button></div>' +
            '<div class="plan-row-grid">' +
            planInput('Nome Completo',       'pu_nome_'+i,  u.nome,     'Nome completo',       'pu_nome_'+i) +
            planInput('E-mail',              'pu_email_'+i, u.email,    'email@empresa.com.br','pu_email_'+i) +
            planInput('Telefone (opcional)', 'pu_tel_'+i,   u.telefone, '(00) 00000-0000',     'pu_tel_'+i) +
            '<div class="plan-input-group"><label>Permissão</label>' +
            '<select id="pu_perm_'+i+'" onchange="planUsuarios['+i+'].permissao=this.value" style="width:100%;background:rgba(255,255,255,0.13);color:white;border:1px solid rgba(255,255,255,0.3);border-radius:8px;padding:8px 10px;font-size:13px;font-family:\'Segoe UI\',sans-serif;outline:none;">' +
            '<option value="">Selecione...</option>' + opts + '</select></div>' +
            planInput('CRM',   'pu_crm_'+i,    u.crm,    'CRM 00000',  'pu_crm_'+i) +
            planInput('Estado','pu_estado_'+i, u.estado, 'UF',         'pu_estado_'+i) +
            '</div></div>';
    }).join('');
}

function planInput(label, id, val, placeholder, field) {
    return '<div class="plan-input-group"><label>' + label + '</label>' +
        '<input type="text" id="' + id + '" value="' + (val||'') + '" placeholder="' + placeholder + '" ' +
        'oninput="planUpdateField(\'' + field + '\', this.value)"></div>';
}

function planUpdateField(fieldId, value) {
    // Detecta tipo e índice pelo prefixo do ID
    var parts = fieldId.split('_');
    var prefix = parts[0]; // pe, ps, pu
    var idx    = parseInt(parts[parts.length - 1]);
    var key    = parts.slice(1, parts.length - 1).join('_');
    if (prefix === 'pe') planEquips[idx][key]     = value;
    if (prefix === 'ps') planServidores[idx][key] = value;
    if (prefix === 'pu') planUsuarios[idx][key]   = value;
}

function planLimparTudo() {
    if (!confirm('Limpar todos os dados da planilha?')) return;
    // Campos do cliente
    ['p_nomefantasia','p_razaosocial','p_cnpj','p_email','p_endereco','p_bairro','p_cidade','p_cep','p_telefone',
     'p_rishis','p_integ1','p_consultorios','p_pacs','p_integpacs',
     'p_rmm_ip','p_rmm_porta','p_rmm_etitle','p_rmm_anydesk','p_rmm_senha','p_rmm_login','p_rmm_senhawin','p_rmm_local','p_rmm_obs',
     'p_ti_resp','p_ti_fone','p_ti_email','p_ti_tipo','p_ti_obs',
     'p_rwl_ip','p_rwl_porta','p_rwl_etitle','p_rwl_anydesk','p_rwl_senha','p_rwl_login','p_rwl_senhawin','p_rwl_obs',
     'p_anotacoes'
    ].forEach(function(id) { var el = document.getElementById(id); if (el) el.value = ''; });
    planEquips = []; planServidores = []; planUsuarios = [];
    planRenderEquips(); planRenderServidores(); planRenderUsuarios();
    qbShowToast('Planilha limpa!');
}

function g(id) { var el = document.getElementById(id); return el ? el.value.trim() : ''; }

// Script Python embutido para gerar planilha formatada via API
function planExportarExcel() {
    var dados = {
        nomefantasia: g('p_nomefantasia'), razaosocial: g('p_razaosocial'),
        cnpj: g('p_cnpj'), email: g('p_email'), endereco: g('p_endereco'),
        bairro: g('p_bairro'), cidade: g('p_cidade'), cep: g('p_cep'), telefone: g('p_telefone'),
        rmm_ip: g('p_rmm_ip'), rmm_porta: g('p_rmm_porta'), rmm_etitle: g('p_rmm_etitle'),
        rmm_anydesk: g('p_rmm_anydesk'), rmm_senha: g('p_rmm_senha'), rmm_login: g('p_rmm_login'),
        rmm_senhawin: g('p_rmm_senhawin'), rmm_local: g('p_rmm_local'), rmm_obs: g('p_rmm_obs'),
        rishis: g('p_rishis'), integ1: g('p_integ1'), consultorios: g('p_consultorios'),
        pacs: g('p_pacs'), integpacs: g('p_integpacs'),
        ti_resp: g('p_ti_resp'), ti_fone: g('p_ti_fone'), ti_email: g('p_ti_email'),
        ti_tipo: g('p_ti_tipo'), ti_obs: g('p_ti_obs'),
        rwl_ip: g('p_rwl_ip'), rwl_porta: g('p_rwl_porta'), rwl_etitle: g('p_rwl_etitle'),
        rwl_anydesk: g('p_rwl_anydesk'), rwl_senha: g('p_rwl_senha'), rwl_login: g('p_rwl_login'),
        rwl_senhawin: g('p_rwl_senhawin'), rwl_obs: g('p_rwl_obs'),
        anotacoes: (document.getElementById('p_anotacoes') || {}).value || '',
        equips: planEquips, servidores: planServidores, usuarios: planUsuarios
    };

    var btn = document.querySelector('[onclick="planExportarExcel()"]');
    var orig = btn ? btn.innerHTML : '';
    if (btn) { btn.innerHTML = '⏳ Gerando...'; btn.disabled = true; }

    fetch('/api/gerar-planilha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
    })
    .then(function(r) { return r.json(); })
    .then(function(resp) {
        var b64 = resp.b64;
        if (!b64 || b64.length < 100) {
            alert('Erro ao gerar planilha. Tente novamente.');
            return;
        }
        var binary = atob(b64);
        var bytes = new Uint8Array(binary.length);
        for (var i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        var blob = new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        var nome = (dados.nomefantasia || 'Implantacao').replace(/[^a-zA-Z0-9\s]/g,'').trim().replace(/\s+/g,'_');
        a.download = 'Planilha_Implantacao_' + nome + '_' + new Date().toLocaleDateString('pt-BR').replace(/\//g,'-') + '.xlsx';
        document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
        qbShowToast('Planilha exportada!');
    })
    .catch(function(err) { alert('Erro: ' + err.message); })
    .finally(function() { if (btn) { btn.innerHTML = orig; btn.disabled = false; } });
}


// Init planilha: render listas vazias
document.addEventListener('DOMContentLoaded', function() {
    planRenderEquips();
    planRenderServidores();
    planRenderUsuarios();
});

function qbInit() {
    qbRenderDbChips();
    qbRenderViewChips();
    qbRenderFieldChips();
    qbRenderWhereChips();
    qbRenderSalvas();
    qbRenderHistorico();
    qbUpdateSalvasCount();
    qbInitConexao();
}

// ── Chips de BANCO ─────────────────────
function qbRenderDbChips() {
    var el = document.getElementById('qbDbChips');
    if (!el) return;
    el.innerHTML = QB_DBS.map(function(db) {
        var active = qbState.db === db.id ? ' qb-chip-active' : '';
        return '<button class="qb-chip qb-chip-db' + active + '" onclick="qbSelectDb(\'' + db.id + '\')">' +
            db.icon + ' ' + db.label + '</button>';
    }).join('');
}

function qbSelectDb(id) {
    qbState.db = (qbState.db === id) ? null : id;
    qbRenderDbChips();
    qbRenderActiveFilters();
    qbGerarQuery();
}

// ── Sub-abas do Query Builder ──────────
function qbSwitchTab(tabId, btn) {
    var container = document.getElementById('implantacao-panel-querybuilder');
    container.querySelectorAll('.qb-panel').forEach(function(p) { p.classList.remove('active'); });
    container.querySelectorAll('.qb-tabs:nth-of-type(2) .qb-tab').forEach(function(b) { b.classList.remove('active'); });
    document.getElementById('qb-panel-' + tabId).classList.add('active');
    btn.classList.add('active');
}

// ── Chips de VIEW ──────────────────────
function qbRenderViewChips() {
    var el = document.getElementById('qbViewChips');
    if (!el) return;
    el.innerHTML = QB_VIEWS.map(function(v) {
        var active = qbState.view === v.value ? ' qb-chip-active' : '';
        return '<button class="qb-chip qb-chip-view' + active + '" onclick="qbSelectView(\'' + v.value + '\')">' + v.label + '</button>';
    }).join('');
}

function qbSelectView(value) {
    qbState.view = (qbState.view === value) ? null : value;
    qbRenderViewChips();
    qbGerarQuery();
}

// ── Chips de CAMPO (SELECT) ────────────
function qbRenderFieldChips() {
    var el = document.getElementById('qbFieldChips');
    if (!el) return;
    var grupos = QB_FIELDS.reduce(function(acc, f) {
        if (!acc[f.grupo]) acc[f.grupo] = [];
        acc[f.grupo].push(f);
        return acc;
    }, {});

    el.innerHTML = Object.keys(grupos).map(function(grupo) {
        var chips = grupos[grupo].map(function(f) {
            var active = qbState.selectedFields.indexOf(f.id) !== -1 ? ' qb-chip-active' : '';
            return '<button class="qb-chip' + active + '" onclick="qbToggleField(\'' + f.id + '\')">' + f.label + '</button>';
        }).join('');
        return '<div class="qb-chip-group"><span class="qb-chip-group-label">' + grupo + '</span>' + chips + '</div>';
    }).join('');
}

function qbToggleField(id) {
    var idx = qbState.selectedFields.indexOf(id);
    if (idx === -1) qbState.selectedFields.push(id);
    else qbState.selectedFields.splice(idx, 1);
    qbRenderFieldChips();
    qbGerarQuery();
}

// ── Chips de WHERE ─────────────────────
function qbRenderWhereChips() {
    var el = document.getElementById('qbWhereChips');
    if (!el) return;
    el.innerHTML = QB_WHERE_FIELDS.map(function(wf) {
        var jaAdicionado = qbState.filters.some(function(f) { return f.wfid === wf.id; });
        var cls = 'qb-chip qb-chip-where' + (jaAdicionado ? ' qb-chip-active' : '');
        return '<button class="' + cls + '" onclick="qbAddFilter(\'' + wf.id + '\')">' + wf.label + '</button>';
    }).join('');
}

function qbAddFilter(wfid) {
    if (qbState.filters.some(function(f) { return f.wfid === wfid; })) return;
    var wf = QB_WHERE_FIELDS.find(function(w) { return w.id === wfid; });
    if (!wf) return;
    qbState.filters.push({ wfid: wfid, col: wf.col, tipo: wf.tipo, value: '', value2: '' });
    qbRenderWhereChips();
    qbRenderActiveFilters();
    qbGerarQuery();
}

function qbRemoveFilter(wfid) {
    qbState.filters = qbState.filters.filter(function(f) { return f.wfid !== wfid; });
    qbRenderWhereChips();
    qbRenderActiveFilters();
    qbGerarQuery();
}

function qbRenderActiveFilters() {
    var el = document.getElementById('qbActiveFilters');
    if (!el) return;
    if (!qbState.filters.length) { el.innerHTML = ''; return; }

    el.innerHTML = qbState.filters.map(function(f) {
        var wf = QB_WHERE_FIELDS.find(function(w) { return w.id === f.wfid; });
        var label = wf ? wf.label : f.col;

        var inputHtml = '';
        if (f.tipo === 'between_date') {
            var dp = qbState.db && QB_SYNTAX[qbState.db] ? QB_SYNTAX[qbState.db].datePlaceholder : 'YYYYMMDD';
            inputHtml =
                '<input class="qb-filter-input" type="text" placeholder="De (' + dp + ')" value="' + qbEscape(f.value) + '" ' +
                'oninput="qbUpdateFilter(\'' + f.wfid + '\', \'value\', this.value)">' +
                '<span class="qb-filter-between-sep">até</span>' +
                '<input class="qb-filter-input" type="text" placeholder="Até (' + dp + ')" value="' + qbEscape(f.value2) + '" ' +
                'oninput="qbUpdateFilter(\'' + f.wfid + '\', \'value2\', this.value)">';
        } else if (f.tipo === 'like') {
            inputHtml =
                '<input class="qb-filter-input qb-filter-input-wide" type="text" placeholder="Valor (busca parcial)" value="' + qbEscape(f.value) + '" ' +
                'oninput="qbUpdateFilter(\'' + f.wfid + '\', \'value\', this.value)">';
        } else {
            inputHtml =
                '<input class="qb-filter-input qb-filter-input-wide" type="text" placeholder="Valor exato" value="' + qbEscape(f.value) + '" ' +
                'oninput="qbUpdateFilter(\'' + f.wfid + '\', \'value\', this.value)">';
        }

        return '<div class="qb-filter-row">' +
            '<span class="qb-filter-label">' + label + '</span>' +
            inputHtml +
            '<button class="qb-filter-remove" onclick="qbRemoveFilter(\'' + f.wfid + '\')">✕</button>' +
            '</div>';
    }).join('');
}

function qbUpdateFilter(wfid, key, val) {
    var f = qbState.filters.find(function(x) { return x.wfid === wfid; });
    if (f) { f[key] = val; qbGerarQuery(); }
}

function qbAddTodayFilter() {
    qbState.filters = qbState.filters.filter(function(f) { return f.wfid !== 'w_study_date'; });
    var hoje = qbGetToday();
    qbState.filters.push({ wfid: 'w_study_date', col: 'STUDY_DATE', tipo: 'between_date', value: hoje, value2: hoje });
    qbRenderWhereChips();
    qbRenderActiveFilters();
    qbGerarQuery();
}

function qbGetToday() {
    var d = new Date();
    var y = d.getFullYear();
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    return '' + y + m + day;
}

// ── Gerar Query ────────────────────────
function qbGerarQuery() {
    var prev = document.getElementById('qbPreview');
    if (!prev) return;

    if (!qbState.db) {
        prev.value = '-- Selecione o banco de dados primeiro';
        return;
    }
    if (!qbState.view) {
        prev.value = '-- Selecione uma view e ao menos um campo para gerar a query';
        return;
    }
    if (!qbState.selectedFields.length) {
        prev.value = '-- Selecione ao menos um campo para gerar a query';
        return;
    }

    var s = qbSyntax();

    var cols = qbState.selectedFields.map(function(id) {
        var f = QB_FIELDS.find(function(x) { return x.id === id; });
        if (!f) return null;
        return '    ' + (f.fn ? f.fn(s) : f.col);
    }).filter(Boolean);

    var lines = ['SELECT'];
    lines.push(cols.join(',\n'));
    lines.push('FROM ' + qbState.view);

    var wheres = [];
    qbState.filters.forEach(function(f) {
        if (f.tipo === 'between_date') {
            if (f.value && f.value2) {
                wheres.push('    ' + s.betweenDate(f.col, f.value, f.value2));
            }
        } else if (f.tipo === 'like') {
            if (f.value) {
                wheres.push("    " + f.col + " LIKE '%" + f.value + "%'");
            }
        } else {
            if (f.value) {
                wheres.push("    " + f.col + " = '" + f.value + "'");
            }
        }
    });

    if (wheres.length) {
        lines.push('WHERE');
        lines.push(wheres.join('\n  AND\n'));
    }

    lines.push('ORDER BY ' + (qbState.selectedFields.indexOf('study_date') !== -1 ? 'STUDY_DATE DESC' : '1 ASC') + ';');

    prev.value = lines.join('\n');
}

// ── Copiar / Salvar / Limpar ───────────
function qbCopiarQuery() {
    var prev = document.getElementById('qbPreview');
    if (!prev || prev.value.trim().startsWith('--')) { qbShowToast('Monte uma query primeiro!'); return; }
    navigator.clipboard.writeText(prev.value).then(function() {
        qbAddHistorico(prev.value, (qbState.view || 'Query'));
        qbShowToast('Copiado!');
    });
}

function qbSalvarQuery() {
    var prev = document.getElementById('qbPreview');
    if (!prev || prev.value.trim().startsWith('--')) { qbShowToast('Monte uma query primeiro!'); return; }
    var dbLabel = qbState.db ? (QB_DBS.find(function(d){return d.id===qbState.db;})||{}).label || '' : '';
    var titulo = (dbLabel ? '[' + dbLabel + '] ' : '') + (qbState.view || 'Query') + ' — ' + new Date().toLocaleDateString('pt-BR');
    qbSavedQueries.push({ titulo: titulo, query: prev.value, data: new Date().toLocaleDateString('pt-BR') });
    qbPersistir();
    qbRenderSalvas();
    qbUpdateSalvasCount();
    qbShowToast('Query salva!');
}

function qbReset() {
    qbState.db = null;
    qbState.view = null;
    qbState.selectedFields = [];
    qbState.filters = [];
    qbRenderDbChips();
    qbRenderViewChips();
    qbRenderFieldChips();
    qbRenderWhereChips();
    qbRenderActiveFilters();
    qbGerarQuery();
}

// ── Queries Salvas ─────────────────────
function qbRenderSalvas() {
    var el = document.getElementById('qbSalvasList');
    var btn = document.getElementById('qbBtnLimparSalvas');
    if (!el) return;
    if (btn) btn.style.display = qbSavedQueries.length ? 'inline-flex' : 'none';
    if (!qbSavedQueries.length) {
        el.innerHTML = '<div class="qb-empty">Nenhuma query salva ainda.<br><small>Monte uma query e clique em Salvar.</small></div>';
        return;
    }
    var busca = ((document.getElementById('qbSalvasSearch') || {}).value || '').toLowerCase();
    var lista = busca
        ? qbSavedQueries.filter(function(q) { return q.titulo.toLowerCase().includes(busca) || q.query.toLowerCase().includes(busca); })
        : qbSavedQueries;

    el.innerHTML = lista.map(function(q, i) {
        return '<div class="qb-saved-card">' +
            '<div class="qb-saved-header">' +
            '<div><div class="qb-template-title">' + qbEscape(q.titulo) + '</div>' +
            '<span class="qb-date-badge">' + q.data + '</span></div>' +
            '<div class="qb-template-actions">' +
            '<button class="qb-action-btn" onclick="qbCopiarSalva(' + i + ')">📋 Copiar</button>' +
            '<button class="qb-action-btn qb-action-danger" onclick="qbRemoverSalva(' + i + ')">🗑️</button>' +
            '</div></div>' +
            '<pre class="qb-code qb-code-preview">' + qbEscape(q.query) + '</pre>' +
            '</div>';
    }).join('');
}

function qbFiltrarSalvas() { qbRenderSalvas(); }

function qbCopiarSalva(i) {
    navigator.clipboard.writeText(qbSavedQueries[i].query).then(function() {
        qbAddHistorico(qbSavedQueries[i].query, qbSavedQueries[i].titulo);
        qbShowToast('Copiado!');
    });
}

function qbRemoverSalva(i) {
    qbSavedQueries.splice(i, 1);
    qbPersistir();
    qbRenderSalvas();
    qbUpdateSalvasCount();
}

function qbLimparTodasSalvas() {
    if (!confirm('Remover todas as queries salvas?')) return;
    qbSavedQueries = [];
    qbPersistir();
    qbRenderSalvas();
    qbUpdateSalvasCount();
}

function qbUpdateSalvasCount() {
    var el = document.getElementById('qbSalvasCount');
    if (el) el.textContent = qbSavedQueries.length;
}

// ── Histórico ──────────────────────────
function qbAddHistorico(query, titulo) {
    qbHistorico.unshift({ titulo: titulo || 'Query', query: query, data: new Date().toLocaleString('pt-BR') });
    if (qbHistorico.length > 30) qbHistorico.pop();
    localStorage.setItem('mobilemed-qb-hist', JSON.stringify(qbHistorico));
    qbRenderHistorico();
}

function qbRenderHistorico() {
    var el = document.getElementById('qbHistoricoList');
    if (!el) return;
    if (!qbHistorico.length) { el.innerHTML = '<div class="qb-empty">Nenhuma query no histórico ainda.</div>'; return; }
    el.innerHTML = qbHistorico.map(function(q, i) {
        return '<div class="qb-hist-card">' +
            '<div class="qb-hist-header"><div>' +
            '<span class="qb-hist-titulo">' + qbEscape(q.titulo) + '</span>' +
            '<span class="qb-date-badge">' + q.data + '</span>' +
            '</div><button class="qb-action-btn" onclick="qbCopiarHist(' + i + ')">📋 Copiar</button></div>' +
            '<pre class="qb-code qb-code-preview">' + qbEscape(q.query) + '</pre>' +
            '</div>';
    }).join('');
}

function qbCopiarHist(i) {
    navigator.clipboard.writeText(qbHistorico[i].query).then(function() { qbShowToast('Copiado!'); });
}

function qbLimparHistorico() {
    if (!confirm('Limpar todo o histórico?')) return;
    qbHistorico = [];
    localStorage.setItem('mobilemed-qb-hist', '[]');
    qbRenderHistorico();
}

// ── Utilitários ────────────────────────
function qbPersistir() {
    localStorage.setItem('mobilemed-qb-saved', JSON.stringify(qbSavedQueries));
}

function qbEscape(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

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
// STRING DE CONEXÃO
// ========================================

var QB_CONN_DEFAULTS = {
    sqlserver: { port: '1433', portLabel: '1433' },
    mysql:     { port: '3306', portLabel: '3306' },
    postgres:  { port: '5432', portLabel: '5432' },
    firebird:  { port: '3050', portLabel: '3050' },
    aws:       { port: '3306', portLabel: '3306' }
};

var QB_CONN_FORMATS = {
    sqlserver: {
        build: function(h, port, db, user, pass, instance) {
            var server = instance ? h + '\\' + instance : h;
            if (port && port !== '1433') server += ',' + port;
            return 'Server=' + server + ';Database=' + db + ';User Id=' + user + ';Password=' + pass + ';';
        },
        ref: 'Server={host}\\{instancia},{porta};Database={database};User Id={usuario};Password={senha};',
        extra: 'sqlserver'
    },
    mysql: {
        build: function(h, port, db, user, pass) {
            return 'Server=' + h + ';Port=' + port + ';Database=' + db + ';Uid=' + user + ';Pwd=' + pass + ';';
        },
        ref: 'Server={host};Port={porta};Database={database};Uid={usuario};Pwd={senha};',
        extra: null
    },
    postgres: {
        build: function(h, port, db, user, pass) {
            return 'Host=' + h + ';Port=' + port + ';Database=' + db + ';Username=' + user + ';Password=' + pass + ';';
        },
        ref: 'Host={host};Port={porta};Database={database};Username={usuario};Password={senha};',
        extra: null
    },
    firebird: {
        build: function(h, port, db, user, pass) {
            return 'DataSource=' + h + ';Port=' + port + ';Database=' + db + ';User=' + user + ';Password=' + pass + ';';
        },
        ref: 'DataSource={host};Port={porta};Database={caminho/banco.fdb};User={usuario};Password={senha};',
        extra: null
    },
    aws: {
        build: function(h, port, db, user, pass) {
            return 'Server=' + h + ';Port=' + port + ';Database=' + db + ';Uid=' + user + ';Pwd=' + pass + ';';
        },
        ref: 'Server={endpoint.rds.amazonaws.com};Port={porta};Database={database};Uid={usuario};Pwd={senha};',
        extra: null
    }
};

var qbConnDb = null;

function qbInitConexao() {
    var el = document.getElementById('qbConnDbChips');
    if (!el) return;
    el.innerHTML = QB_DBS.map(function(db) {
        var active = qbConnDb === db.id ? ' qb-chip-active' : '';
        return '<button class="qb-chip qb-chip-db' + active + '" onclick="qbSelectConnDb(\'' + db.id + '\')">' +
            db.icon + ' ' + db.label + '</button>';
    }).join('');
}

function qbSelectConnDb(id) {
    qbConnDb = (qbConnDb === id) ? null : id;
    qbInitConexao();

    var form   = document.getElementById('qbConnForm');
    var ph     = document.getElementById('qbConnPlaceholder');
    var instWrap = document.getElementById('qbConnInstanceWrap');

    if (!qbConnDb) {
        form.style.display = 'none';
        ph.style.display   = 'block';
        return;
    }

    form.style.display = 'block';
    ph.style.display   = 'none';

    var def = QB_CONN_DEFAULTS[qbConnDb];
    var portEl = document.getElementById('qbConnPort');
    if (portEl && !portEl.value) portEl.placeholder = def ? def.portLabel : '';
    if (portEl && !portEl.value && def) portEl.value = def.port;

    instWrap.style.display = (qbConnDb === 'sqlserver') ? 'block' : 'none';

    qbRenderConnRef();
    qbGerarConexao();
}

function qbGerarConexao() {
    var el = document.getElementById('qbConnString');
    if (!el || !qbConnDb) return;

    var fmt  = QB_CONN_FORMATS[qbConnDb];
    if (!fmt) return;

    var host     = (document.getElementById('qbConnHost')     || {}).value || '{host}';
    var port     = (document.getElementById('qbConnPort')     || {}).value || (QB_CONN_DEFAULTS[qbConnDb] || {}).port || '';
    var db       = (document.getElementById('qbConnDb')       || {}).value || '{database}';
    var user     = (document.getElementById('qbConnUser')     || {}).value || '{usuario}';
    var pass     = (document.getElementById('qbConnPass')     || {}).value || '{senha}';
    var instance = (document.getElementById('qbConnInstance') || {}).value || '';

    el.value = fmt.build(host, port, db, user, pass, instance);
}

function qbRenderConnRef() {
    var el = document.getElementById('qbConnRef');
    if (!el || !qbConnDb) return;
    var fmt = QB_CONN_FORMATS[qbConnDb];
    if (!fmt) return;
    var db = QB_DBS.find(function(d) { return d.id === qbConnDb; });
    el.innerHTML =
        '<div class="qb-conn-ref-title">📖 Formato ' + (db ? db.icon + ' ' + db.label : '') + '</div>' +
        '<pre class="qb-code" style="font-size:11px; margin-top:6px;">' + qbEscape(fmt.ref) + '</pre>';
}

function qbCopiarConexao() {
    var el = document.getElementById('qbConnString');
    if (!el || !el.value.trim() || el.value.includes('{')) {
        qbShowToast('Preencha os campos primeiro!');
        return;
    }
    navigator.clipboard.writeText(el.value).then(function() {
        qbShowToast('String copiada!');
    });
}

function qbToggleConnPass() {
    var input = document.getElementById('qbConnPass');
    var icon  = document.getElementById('qbConnEyeIcon');
    if (!input) return;
    var show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    icon.innerHTML = show
        ? '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>'
        : '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
}

function qbLimparConexao() {
    ['qbConnHost','qbConnPort','qbConnDb','qbConnUser','qbConnPass','qbConnInstance'].forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.value = '';
    });
    if (qbConnDb && QB_CONN_DEFAULTS[qbConnDb]) {
        var portEl = document.getElementById('qbConnPort');
        if (portEl) portEl.value = QB_CONN_DEFAULTS[qbConnDb].port;
    }
    var el = document.getElementById('qbConnString');
    if (el) el.value = '';
}