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
    return '<div class="plan-input-group"><label>' + escapeHtml(label) + '</label>' +
        '<input type="text" id="' + id + '" value="' + escapeHtml(val||'') + '" placeholder="' + escapeHtml(placeholder) + '" ' +
        'oninput="planUpdateField(\'' + field + '\', this.value)"></div>';
}

function planUpdateField(fieldId, value) {
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
        if (resp.error) {
            alert('Erro ao gerar planilha: ' + resp.error);
            return;
        }
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
