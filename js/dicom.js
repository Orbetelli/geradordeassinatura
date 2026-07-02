// ========================================
// DICOM INSPECTOR
// ========================================

// Dicionário de UIDs DICOM mais comuns
var DICOM_UID_DICT = {
    // SOP Classes — Imagens
    '1.2.840.10008.5.1.4.1.1.1':    { nome: 'CR Image Storage',                    cat: 'SOP Class', obs: 'Computed Radiography — Raio-X digital' },
    '1.2.840.10008.5.1.4.1.1.1.1':  { nome: 'Digital X-Ray Image Storage (Presentation)', cat: 'SOP Class', obs: 'Raio-X digital de apresentação' },
    '1.2.840.10008.5.1.4.1.1.2':    { nome: 'CT Image Storage',                    cat: 'SOP Class', obs: 'Tomografia Computadorizada' },
    '1.2.840.10008.5.1.4.1.1.4':    { nome: 'MR Image Storage',                    cat: 'SOP Class', obs: 'Ressonância Magnética' },
    '1.2.840.10008.5.1.4.1.1.6.1':  { nome: 'Ultrasound Image Storage',            cat: 'SOP Class', obs: 'Ultrassonografia' },
    '1.2.840.10008.5.1.4.1.1.7':    { nome: 'Secondary Capture Image Storage',     cat: 'SOP Class', obs: 'Captura secundária — screenshot, PDF convertido, etc.' },
    '1.2.840.10008.5.1.4.1.1.12.1': { nome: 'X-Ray Angiographic Image Storage',   cat: 'SOP Class', obs: 'Angiografia' },
    '1.2.840.10008.5.1.4.1.1.20':   { nome: 'Nuclear Medicine Image Storage',      cat: 'SOP Class', obs: 'Medicina Nuclear (PET, SPECT)' },
    '1.2.840.10008.5.1.4.1.1.104.1':{ nome: 'Encapsulated PDF Storage',            cat: 'SOP Class', obs: 'PDF encapsulado — muito comum em laudos digitais' },
    '1.2.840.10008.5.1.4.1.1.128':  { nome: 'Positron Emission Tomography Image Storage', cat: 'SOP Class', obs: 'PET Scan' },
    '1.2.840.10008.5.1.4.1.1.481.1':{ nome: 'RT Image Storage',                   cat: 'SOP Class', obs: 'Radioterapia' },
    // SOP Classes — Serviços
    '1.2.840.10008.5.1.4.31':        { nome: 'Modality Worklist',                   cat: 'Serviço DICOM', obs: 'Worklist de modalidade — lista de exames agendados' },
    '1.2.840.10008.5.1.4.1.2.1.1':  { nome: 'Patient Root Q/R — FIND',            cat: 'Serviço DICOM', obs: 'Query/Retrieve por raiz de paciente' },
    '1.2.840.10008.5.1.4.1.2.1.2':  { nome: 'Patient Root Q/R — MOVE',            cat: 'Serviço DICOM', obs: 'Mover imagens por raiz de paciente' },
    '1.2.840.10008.5.1.4.1.2.2.1':  { nome: 'Study Root Q/R — FIND',              cat: 'Serviço DICOM', obs: 'Query/Retrieve por raiz de estudo' },
    '1.2.840.10008.5.1.4.1.2.2.2':  { nome: 'Study Root Q/R — MOVE',              cat: 'Serviço DICOM', obs: 'Mover imagens por raiz de estudo' },
    '1.2.840.10008.1.1':             { nome: 'Verification SOP Class (C-ECHO)',     cat: 'Serviço DICOM', obs: 'Verificação de conectividade DICOM' },
    '1.2.840.10008.1.3.10':          { nome: 'Media Storage Directory Storage',     cat: 'Serviço DICOM', obs: 'DICOMDIR — índice de mídia' },
    // Transfer Syntaxes
    '1.2.840.10008.1.2':             { nome: 'Implicit VR Little Endian',           cat: 'Transfer Syntax', obs: 'Padrão implícito — sem compressão' },
    '1.2.840.10008.1.2.1':           { nome: 'Explicit VR Little Endian',           cat: 'Transfer Syntax', obs: 'Padrão explícito — sem compressão' },
    '1.2.840.10008.1.2.2':           { nome: 'Explicit VR Big Endian',              cat: 'Transfer Syntax', obs: 'Big Endian — pouco comum' },
    '1.2.840.10008.1.2.4.50':        { nome: 'JPEG Baseline (Process 1)',           cat: 'Transfer Syntax', obs: 'JPEG com perda — qualidade reduzida' },
    '1.2.840.10008.1.2.4.57':        { nome: 'JPEG Lossless (Non-Hierarchical)',    cat: 'Transfer Syntax', obs: 'JPEG sem perda — boa qualidade' },
    '1.2.840.10008.1.2.4.70':        { nome: 'JPEG Lossless (Selection Value 1)',   cat: 'Transfer Syntax', obs: 'JPEG sem perda — mais comum em CR/DR' },
    '1.2.840.10008.1.2.4.90':        { nome: 'JPEG 2000 Lossless',                 cat: 'Transfer Syntax', obs: '⚠️ JPEG 2000 sem perda — requer decoder especial' },
    '1.2.840.10008.1.2.4.91':        { nome: 'JPEG 2000 (Lossy)',                  cat: 'Transfer Syntax', obs: '⚠️ JPEG 2000 com perda — pode causar problemas em alguns viewers' },
    '1.2.840.10008.1.2.5':           { nome: 'RLE Lossless',                        cat: 'Transfer Syntax', obs: 'Run-Length Encoding sem perda' },
};

// Tags DICOM que queremos extrair (tag decimal → info)
var DICOM_TAGS = [
    // Paciente
    { group: 0x0010, elem: 0x0010, nome: 'Patient Name',      cat: 'Paciente' },
    { group: 0x0010, elem: 0x0020, nome: 'Patient ID',        cat: 'Paciente' },
    { group: 0x0010, elem: 0x0030, nome: 'Birth Date',        cat: 'Paciente' },
    { group: 0x0010, elem: 0x0040, nome: 'Sex',               cat: 'Paciente' },
    // Estudo
    { group: 0x0008, elem: 0x0020, nome: 'Study Date',        cat: 'Estudo' },
    { group: 0x0008, elem: 0x0030, nome: 'Study Time',        cat: 'Estudo' },
    { group: 0x0008, elem: 0x0060, nome: 'Modality',          cat: 'Estudo' },
    { group: 0x0008, elem: 0x1030, nome: 'Study Description', cat: 'Estudo' },
    { group: 0x0008, elem: 0x0050, nome: 'Accession Number',  cat: 'Estudo' },
    { group: 0x0008, elem: 0x0090, nome: 'Referring Physician',cat: 'Estudo' },
    // Equipamento
    { group: 0x0008, elem: 0x0070, nome: 'Manufacturer',      cat: 'Equipamento' },
    { group: 0x0008, elem: 0x1090, nome: 'Model Name',        cat: 'Equipamento' },
    { group: 0x0008, elem: 0x1010, nome: 'Station Name',      cat: 'Equipamento' },
    { group: 0x0008, elem: 0x0080, nome: 'Institution Name',  cat: 'Equipamento' },
    { group: 0x0008, elem: 0x0055, nome: 'AE Title',          cat: 'Equipamento' },
    // Técnico
    { group: 0x0028, elem: 0x0010, nome: 'Rows',              cat: 'Técnico' },
    { group: 0x0028, elem: 0x0011, nome: 'Columns',           cat: 'Técnico' },
    { group: 0x0028, elem: 0x0030, nome: 'Pixel Spacing',     cat: 'Técnico' },
    { group: 0x0018, elem: 0x0050, nome: 'Slice Thickness',   cat: 'Técnico' },
    { group: 0x0018, elem: 0x0060, nome: 'KVP',               cat: 'Técnico' },
    // UIDs
    { group: 0x0008, elem: 0x0016, nome: 'SOP Class UID',     cat: 'UIDs' },
    { group: 0x0008, elem: 0x0018, nome: 'SOP Instance UID',  cat: 'UIDs' },
    { group: 0x0020, elem: 0x000D, nome: 'Study Instance UID',cat: 'UIDs' },
    { group: 0x0020, elem: 0x000E, nome: 'Series Instance UID',cat: 'UIDs' },
];

var dcmDados = null;

function dcmLerArquivo(input) {
    var file = input.files[0];
    if (!file) return;

    var statusEl = document.getElementById('dcm_status');
    if (statusEl) { statusEl.textContent = '⏳ Lendo arquivo...'; statusEl.className = 'dcm-status dcm-status-loading'; }

    var reader = new FileReader();
    reader.onload = function(e) {
        try {
            var buffer = e.target.result;
            dcmDados = dcmParsear(buffer);
            dcmRenderizar(file.name, buffer.byteLength);
            if (statusEl) { statusEl.textContent = '✅ Arquivo lido com sucesso'; statusEl.className = 'dcm-status dcm-status-ok'; }
        } catch(err) {
            if (statusEl) { statusEl.textContent = '❌ Erro: ' + err.message; statusEl.className = 'dcm-status dcm-status-err'; }
            var resultEl = document.getElementById('dcm_resultado');
            if (resultEl) resultEl.innerHTML = '';
        }
    };
    reader.onerror = function() {
        if (statusEl) { statusEl.textContent = '❌ Falha ao ler o arquivo'; statusEl.className = 'dcm-status dcm-status-err'; }
    };
    reader.readAsArrayBuffer(file);
}

function dcmParsear(buffer) {
    var view  = new DataView(buffer);
    var dados = {};
    var pos   = 0;

    if (buffer.byteLength > 132) {
        var magic = String.fromCharCode(
            view.getUint8(128), view.getUint8(129),
            view.getUint8(130), view.getUint8(131)
        );
        if (magic === 'DICM') { pos = 132; }
    }

    var transferSyntax = '1.2.840.10008.1.2.1'; // Explicit VR Little Endian (padrão)
    var explicitVR     = true;
    var metaFimPos     = -1;

    var posMeta = pos;
    while (posMeta < buffer.byteLength - 8) {
        try {
            var gm = view.getUint16(posMeta, true);
            var em = view.getUint16(posMeta + 2, true);
            posMeta += 4;
            if (gm !== 0x0002) { metaFimPos = posMeta - 4; break; }
            var vrm = String.fromCharCode(view.getUint8(posMeta), view.getUint8(posMeta + 1));
            posMeta += 2;
            var lm = 0;
            if (['OB','OW','SQ','UC','UN','UR','UT'].indexOf(vrm) !== -1) {
                posMeta += 2;
                lm = view.getUint32(posMeta, true); posMeta += 4;
            } else {
                lm = view.getUint16(posMeta, true); posMeta += 2;
            }
            if (lm === 0xFFFFFFFF || lm < 0 || posMeta + lm > buffer.byteLength) break;
            if (gm === 0x0002 && em === 0x0000) {
                metaFimPos = posMeta + lm + (posMeta - pos - 4 - 2 - 2);
            }
            if (gm === 0x0002 && em === 0x0010) {
                var tsBytes = new Uint8Array(buffer, posMeta, lm);
                transferSyntax = String.fromCharCode.apply(null, tsBytes).replace(/\x00/g,'').trim();
                dados['__transferSyntax'] = transferSyntax;
                if (transferSyntax === '1.2.840.10008.1.2') explicitVR = false;
            }
            posMeta += lm;
        } catch(e) { break; }
    }

    while (pos < buffer.byteLength - 8) {
        try {
            var group = view.getUint16(pos, true);
            var elem  = view.getUint16(pos + 2, true);
            pos += 4;

            if (group === 0x7FE0 && elem === 0x0010) break;

            var vr     = '';
            var length = 0;

            if (group === 0x0002) {
                vr = String.fromCharCode(view.getUint8(pos), view.getUint8(pos + 1));
                pos += 2;
                if (['OB','OW','SQ','UC','UN','UR','UT'].indexOf(vr) !== -1) {
                    pos += 2;
                    length = view.getUint32(pos, true); pos += 4;
                } else {
                    length = view.getUint16(pos, true); pos += 2;
                }
            } else if (explicitVR) {
                var vrStr = String.fromCharCode(view.getUint8(pos), view.getUint8(pos + 1));
                if (/^[A-Z]{2}$/.test(vrStr)) {
                    vr = vrStr;
                    pos += 2;
                    if (['OB','OW','SQ','UC','UN','UR','UT'].indexOf(vr) !== -1) {
                        pos += 2;
                        length = view.getUint32(pos, true); pos += 4;
                    } else {
                        length = view.getUint16(pos, true); pos += 2;
                    }
                } else {
                    vr = 'UN';
                    length = view.getUint32(pos, true); pos += 4;
                }
            } else {
                vr = 'UN';
                length = view.getUint32(pos, true); pos += 4;
            }

            if (length === 0xFFFFFFFF || length < 0) { pos += 0; break; }
            if (pos + length > buffer.byteLength)    { break; }

            var valor = '';
            if (length > 0 && length <= 4096) {
                if (['OB','OW','SQ'].indexOf(vr) === -1) {
                    var bytes = new Uint8Array(buffer, pos, length);
                    valor = String.fromCharCode.apply(null, bytes).replace(/\x00/g, '').trim();
                }
            }

            if (group === 0x0002 && elem === 0x0010 && valor) {
                transferSyntax = valor;
                dados['__transferSyntax'] = valor;
                if (valor === '1.2.840.10008.1.2') explicitVR = false;
            }

            var key = dcmTagKey(group, elem);
            if (valor) dados[key] = valor;

            pos += length;
        } catch(e) { pos++; continue; }
    }

    dados['__transferSyntax'] = dados['__transferSyntax'] || transferSyntax;
    return dados;
}

function dcmTagKey(group, elem) {
    var g = ('0000' + group.toString(16)).slice(-4).toUpperCase();
    var e = ('0000' + elem.toString(16)).slice(-4).toUpperCase();
    return g + ',' + e;
}

function dcmGetTag(group, elem) {
    if (!dcmDados) return '';
    return dcmDados[dcmTagKey(group, elem)] || '';
}

function dcmRenderizar(fileName, fileSize) {
    var el = document.getElementById('dcm_resultado');
    if (!el) return;

    var cats = {};
    DICOM_TAGS.forEach(function(t) {
        var val = dcmGetTag(t.group, t.elem);
        if (!cats[t.cat]) cats[t.cat] = [];
        cats[t.cat].push({ nome: t.nome, val: val || '—', isUID: t.cat === 'UIDs' });
    });

    var ts  = dcmDados['__transferSyntax'] || '';
    var tsInfo = ts ? (DICOM_UID_DICT[ts] || { nome: ts, cat: 'Transfer Syntax', obs: '' }) : null;

    var sopUID  = dcmGetTag(0x0008, 0x0016);
    var sopInfo = sopUID ? (DICOM_UID_DICT[sopUID] || null) : null;

    var html = '';

    html += '<div class="dcm-file-header">' +
        '<span class="dcm-file-icon">📄</span>' +
        '<div>' +
        '<div class="dcm-file-name">' + escapeHtml(fileName) + '</div>' +
        '<div class="dcm-file-meta">' + (fileSize / 1024).toFixed(1) + ' KB' +
        (tsInfo ? ' · <span class="dcm-ts-badge">' + escapeHtml(tsInfo.nome) + '</span>' : '') +
        '</div>' +
        '</div>' +
        '</div>';

    if (ts && (ts === '1.2.840.10008.1.2.4.90' || ts === '1.2.840.10008.1.2.4.91')) {
        html += '<div class="dcm-warn-box">⚠️ Transfer Syntax <strong>JPEG 2000</strong> — metadados lidos normalmente. ' +
            'Visualização de imagem não suportada sem decoder adicional.</div>';
    }

    if (sopInfo) {
        html += '<div class="dcm-sop-box">' +
            '<span class="dcm-sop-cat">' + escapeHtml(sopInfo.cat) + '</span>' +
            '<span class="dcm-sop-nome">' + escapeHtml(sopInfo.nome) + '</span>' +
            (sopInfo.obs ? '<span class="dcm-sop-obs">' + escapeHtml(sopInfo.obs) + '</span>' : '') +
            '</div>';
    }

    Object.keys(cats).forEach(function(cat) {
        html += '<div class="dcm-cat-block">' +
            '<div class="dcm-cat-title">' + cat + '</div>' +
            '<div class="dcm-tag-list">';
        cats[cat].forEach(function(t) {
            var valDisplay = t.val;
            var extra = '';
            if (t.isUID && t.val !== '—') {
                var info = DICOM_UID_DICT[t.val];
                if (info) {
                    extra = '<span class="dcm-uid-desc">' + escapeHtml(info.nome) + '</span>';
                }
            }
            html += '<div class="dcm-tag-row">' +
                '<span class="dcm-tag-nome">' + escapeHtml(t.nome) + '</span>' +
                '<span class="dcm-tag-val">' + escapeHtml(valDisplay) + extra + '</span>' +
                '</div>';
        });
        html += '</div></div>';
    });

    html += '<div class="dcm-export-row">' +
        '<button class="dcm-export-btn" onclick="dcmExportarJSON()">📥 Exportar JSON</button>' +
        '</div>';

    el.innerHTML = html;

    var sw = document.getElementById('dcm_search_wrap');
    if (sw) sw.style.display = 'block';
    dcmLimparBuscaTags();

    var compSection = document.getElementById('dcm_comp_section');
    if (compSection) compSection.style.display = 'block';
    var btnComp = document.getElementById('dcm_comp_btn');
    if (btnComp) btnComp.disabled = !dcmDados2;
}

function dcmExportarJSON() {
    if (!dcmDados) return;
    var exportData = {};
    DICOM_TAGS.forEach(function(t) {
        var val = dcmGetTag(t.group, t.elem);
        if (val) exportData[t.nome] = val;
    });
    exportData['Transfer Syntax'] = dcmDados['__transferSyntax'] || '';
    var ts = exportData['Transfer Syntax'];
    if (ts && DICOM_UID_DICT[ts]) exportData['Transfer Syntax Name'] = DICOM_UID_DICT[ts].nome;
    var blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    var url  = URL.createObjectURL(blob);
    var a    = document.createElement('a');
    a.href   = url;
    a.download = 'dicom_metadata_' + new Date().toLocaleDateString('pt-BR').replace(/\//g,'-') + '.json';
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
}

function dcmLimpar() {
    dcmDados = null;
    var el = document.getElementById('dcm_resultado');
    if (el) el.innerHTML = '';
    var statusEl = document.getElementById('dcm_status');
    if (statusEl) { statusEl.textContent = ''; statusEl.className = 'dcm-status'; }
    var input = document.getElementById('dcm_file_input');
    if (input) input.value = '';
    var sw = document.getElementById('dcm_search_wrap');
    if (sw) sw.style.display = 'none';
    dcmLimparBuscaTags();
    var compSection = document.getElementById('dcm_comp_section');
    if (compSection) compSection.style.display = 'none';
    dcmLimparComparacao();
}

// ─── Busca de tags DICOM ──────────────────────────────────────────────────────

function dcmTodasAsTags() {
    if (!dcmDados) return [];
    var resultado = [];
    Object.keys(dcmDados).forEach(function(key) {
        if (key.startsWith('__')) return;
        var val = dcmDados[key];
        if (!val) return;
        var partes = key.split(',');
        var g = parseInt(partes[0], 16);
        var e = parseInt(partes[1], 16);
        var tagInfo = DICOM_TAGS.find(function(t) { return t.group === g && t.elem === e; });
        var nome = tagInfo ? tagInfo.nome : '';
        var uidInfo = DICOM_UID_DICT[val] || null;
        resultado.push({
            key:     key,
            nome:    nome,
            val:     val,
            uidInfo: uidInfo
        });
    });
    resultado.sort(function(a, b) {
        if (a.nome && !b.nome) return -1;
        if (!a.nome && b.nome) return 1;
        return a.key.localeCompare(b.key);
    });
    return resultado;
}

function dcmFiltrarTags(q) {
    var clearBtn = document.getElementById('dcm_search_clear');
    var countEl  = document.getElementById('dcm_search_count');
    var resultsEl = document.getElementById('dcm_search_results');
    if (clearBtn) clearBtn.style.display = q ? 'block' : 'none';

    var todas = dcmTodasAsTags();

    if (!q.trim()) {
        if (resultsEl) resultsEl.innerHTML = '';
        if (countEl)  countEl.textContent = todas.length + ' tags no arquivo';
        return;
    }

    var lower = q.toLowerCase().trim();
    var filtrado = todas.filter(function(t) {
        return t.key.toLowerCase().includes(lower) ||
               t.nome.toLowerCase().includes(lower) ||
               t.val.toLowerCase().includes(lower);
    });

    if (countEl) countEl.textContent = filtrado.length + ' resultado' + (filtrado.length !== 1 ? 's' : '');

    if (!filtrado.length) {
        resultsEl.innerHTML =
            '<div style="text-align:center; padding:20px; opacity:0.5;">' +
            '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="display:block;margin:0 auto 8px">' +
            '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>' +
            'Nenhuma tag encontrada</div>';
        return;
    }

    resultsEl.innerHTML = filtrado.map(function(t) {
        var nomeHtml = t.nome
            ? '<span class="dcm-tag-nome">' + t.nome + '</span>'
            : '<span class="dcm-tag-nome" style="opacity:0.45;">Tag desconhecida</span>';
        var codeHtml = '<span style="font-family:monospace; font-size:11px; opacity:0.6; margin-left:6px;">(' + t.key + ')</span>';
        var valHtml  = t.val;
        var extra    = '';
        if (t.uidInfo) extra = '<div style="font-size:11px; opacity:0.65; margin-top:2px;">↳ ' + t.uidInfo.nome + (t.uidInfo.obs ? ' — ' + t.uidInfo.obs : '') + '</div>';
        return '<div class="dcm-tag-row" style="flex-direction:column; align-items:flex-start; gap:2px; padding:8px 10px;">' +
            '<div style="display:flex; align-items:center; width:100%; gap:4px;">' +
            nomeHtml + codeHtml +
            '<span class="dcm-tag-val" style="margin-left:auto; text-align:right; max-width:55%; word-break:break-all;">' + valHtml + '</span>' +
            '</div>' + extra +
            '</div>';
    }).join('');
}

function dcmLimparBuscaTags() {
    var inp = document.getElementById('dcm_search_input');
    if (inp) inp.value = '';
    var clearBtn = document.getElementById('dcm_search_clear');
    if (clearBtn) clearBtn.style.display = 'none';
    var resultsEl = document.getElementById('dcm_search_results');
    if (resultsEl) resultsEl.innerHTML = '';
    var countEl = document.getElementById('dcm_search_count');
    if (countEl) {
        var todas = dcmTodasAsTags();
        countEl.textContent = todas.length ? todas.length + ' tags no arquivo' : '';
    }
}

// ─── Comparação de dois arquivos DICOM ───────────────────────────────────────

var dcmDados2 = null;

function dcmLerArquivo2(input) {
    var file = input.files ? input.files[0] : null;
    if (!file) return;
    var statusEl = document.getElementById('dcm_comp_status');
    if (statusEl) statusEl.textContent = 'Carregando ' + file.name + '...';
    var reader = new FileReader();
    reader.onload = function(e) {
        dcmDados2 = dcmParsear(e.target.result);
        if (statusEl) statusEl.textContent = '✅ ' + file.name + ' carregado';
        var btnComp = document.getElementById('dcm_comp_btn');
        if (btnComp) btnComp.disabled = !dcmDados || !dcmDados2;
    };
    reader.readAsArrayBuffer(file);
}

function dcmComparar() {
    if (!dcmDados || !dcmDados2) return;

    var todasKeys = new Set(
        Object.keys(dcmDados).concat(Object.keys(dcmDados2))
            .filter(function(k) { return !k.startsWith('__'); })
    );

    var iguais = 0, diferentes = 0, apenasA = 0, apenasB = 0;
    var rows = [];

    todasKeys.forEach(function(key) {
        var valA = dcmDados[key]  || '';
        var valB = dcmDados2[key] || '';

        var partes  = key.split(',');
        var g       = parseInt(partes[0], 16);
        var e       = parseInt(partes[1], 16);
        var tagInfo = DICOM_TAGS.find(function(t) { return t.group === g && t.elem === e; });
        var nome    = tagInfo ? tagInfo.nome : '';

        var status;
        if      (!valA)        { status = 'apenas-b'; apenasB++; }
        else if (!valB)        { status = 'apenas-a'; apenasA++; }
        else if (valA === valB){ status = 'igual';    iguais++;  }
        else                   { status = 'diferente';diferentes++; }

        rows.push({ key: key, nome: nome, valA: valA, valB: valB, status: status });
    });

    var ordem = { 'diferente': 0, 'apenas-a': 1, 'apenas-b': 1, 'igual': 2 };
    rows.sort(function(a, b) {
        if (ordem[a.status] !== ordem[b.status]) return ordem[a.status] - ordem[b.status];
        return a.key.localeCompare(b.key);
    });

    var resumo = document.getElementById('dcm_comp_resumo');
    if (resumo) {
        resumo.innerHTML =
            '<span style="color:#facc15; font-weight:600;">⚠️ ' + diferentes + ' diferentes</span> &nbsp;|&nbsp; ' +
            '<span style="opacity:0.7;">📄 ' + apenasA + ' só no arquivo 1</span> &nbsp;|&nbsp; ' +
            '<span style="opacity:0.7;">📄 ' + apenasB + ' só no arquivo 2</span> &nbsp;|&nbsp; ' +
            '<span style="opacity:0.5;">✅ ' + iguais + ' iguais</span>';
    }

    var el = document.getElementById('dcm_comp_resultado');
    if (!el) return;

    var html = '<div style="overflow-x:auto;">';
    html += '<table style="width:100%; border-collapse:collapse; font-size:12px;">';
    html += '<thead><tr>' +
        '<th style="text-align:left; padding:8px 10px; border-bottom:1px solid rgba(255,255,255,0.15); opacity:0.7;">Tag</th>' +
        '<th style="text-align:left; padding:8px 10px; border-bottom:1px solid rgba(255,255,255,0.15); opacity:0.7;">Arquivo 1</th>' +
        '<th style="text-align:left; padding:8px 10px; border-bottom:1px solid rgba(255,255,255,0.15); opacity:0.7;">Arquivo 2</th>' +
        '</tr></thead><tbody>';

    rows.forEach(function(r) {
        var highlight = r.status === 'diferente'
            ? 'background:rgba(250,204,21,0.12); border-left:3px solid #facc15;'
            : r.status !== 'igual'
            ? 'background:rgba(255,255,255,0.04); border-left:3px solid rgba(255,255,255,0.2);'
            : '';
        var nomeHtml = r.nome
            ? '<span style="font-weight:600;">' + r.nome + '</span><br><span style="opacity:0.5; font-family:monospace;">(' + r.key + ')</span>'
            : '<span style="font-family:monospace; opacity:0.6;">' + r.key + '</span>';
        var valAHtml = r.valA
            ? '<span' + (r.status === 'diferente' ? ' style="color:#facc15;"' : '') + '>' + r.valA + '</span>'
            : '<span style="opacity:0.3;">—</span>';
        var valBHtml = r.valB
            ? '<span' + (r.status === 'diferente' ? ' style="color:#facc15;"' : '') + '>' + r.valB + '</span>'
            : '<span style="opacity:0.3;">—</span>';
        html += '<tr style="' + highlight + '">' +
            '<td style="padding:7px 10px; border-bottom:1px solid rgba(255,255,255,0.06);">' + nomeHtml + '</td>' +
            '<td style="padding:7px 10px; border-bottom:1px solid rgba(255,255,255,0.06); word-break:break-all;">' + valAHtml + '</td>' +
            '<td style="padding:7px 10px; border-bottom:1px solid rgba(255,255,255,0.06); word-break:break-all;">' + valBHtml + '</td>' +
            '</tr>';
    });

    html += '</tbody></table></div>';
    el.innerHTML = html;

    var wrap = document.getElementById('dcm_comp_wrap');
    if (wrap) wrap.style.display = 'block';
}

function dcmLimparComparacao() {
    dcmDados2 = null;
    var el = document.getElementById('dcm_comp_resultado');
    if (el) el.innerHTML = '';
    var resumo = document.getElementById('dcm_comp_resumo');
    if (resumo) resumo.innerHTML = '';
    var statusEl = document.getElementById('dcm_comp_status');
    if (statusEl) statusEl.textContent = '';
    var inp = document.getElementById('dcm_comp_file_input');
    if (inp) inp.value = '';
    var wrap = document.getElementById('dcm_comp_wrap');
    if (wrap) wrap.style.display = 'none';
    var btnComp = document.getElementById('dcm_comp_btn');
    if (btnComp) btnComp.disabled = true;
}
