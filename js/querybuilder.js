// ========================================
// QUERY BUILDER — chip-based
// ========================================

var QB_DBS = [
    { id: 'sqlserver', label: 'SQL Server', icon: '🪟' },
    { id: 'mysql',     label: 'MySQL',      icon: '🐬' },
    { id: 'postgres',  label: 'PostgreSQL', icon: '🐘' },
    { id: 'firebird',  label: 'Firebird',   icon: '🔥' },
    { id: 'aws',       label: 'AWS Aurora', icon: '☁️'  }
];

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

var QB_VIEWS = [
    { id: 'vw_patient',  label: 'VW_PACS_PATIENT',  value: 'VW_PACS_PATIENT' },
    { id: 'vw_worklist', label: 'VW_PACS_WORKLIST', value: 'VW_PACS_WORKLIST' },
    { id: 'vw_study',    label: 'VW_PACS_STUDY',    value: 'VW_PACS_STUDY' }
];

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

var qbState = {
    db: null,
    view: null,
    selectedFields: [],
    filters: []
};

var qbSavedQueries = JSON.parse(localStorage.getItem('mobilemed-qb-saved') || '[]');
var qbHistorico    = JSON.parse(localStorage.getItem('mobilemed-qb-hist')  || '[]');

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

function qbSwitchTab(tabId, btn) {
    var container = document.getElementById('implantacao-panel-querybuilder');
    container.querySelectorAll('.qb-panel').forEach(function(p) { p.classList.remove('active'); });
    container.querySelectorAll('.qb-tabs:nth-of-type(2) .qb-tab').forEach(function(b) { b.classList.remove('active'); });
    document.getElementById('qb-panel-' + tabId).classList.add('active');
    btn.classList.add('active');
}

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

function qbPersistir() {
    localStorage.setItem('mobilemed-qb-saved', JSON.stringify(qbSavedQueries));
}

function qbEscape(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
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
