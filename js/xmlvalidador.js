// ========================================
// VALIDADOR DE XML — bem-formação + encoding/acentuação
// ========================================

var xmlValidadorRawBytes = null; // bytes brutos do arquivo, quando enviado por upload (null se for colado como texto)

// Padrões clássicos de "mojibake" — UTF-8 lido como Latin-1/Windows-1252 e re-salvo como UTF-8
var XML_MOJIBAKE_PADROES = [
    ['Ã¡','á'], ['Ã©','é'], ['Ã­','í'], ['Ã³','ó'], ['Ãº','ú'],
    ['Ã£','ã'], ['Ãµ','õ'], ['Ã¢','â'], ['Ãª','ê'], ['Ã´','ô'],
    ['Ã§','ç'], ['Ã‡','Ç'], ['Ã‰','É'], ['Ã\u0081','Á'], ['Ã“','Ó'],
    ['â€™','’'], ['â€œ','“'], ['â€\u009d','”'], ['â€“','–'], ['Â ','(espaço indevido)']
];

function xmlValidadorFileChange(input) {
    var file = input.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(e) {
        xmlValidadorRawBytes = new Uint8Array(e.target.result);
        // Decodifica como UTF-8 sem lançar erro (replacement char nos bytes inválidos)
        // apenas para exibir o conteúdo no textarea — a checagem estrita roda separadamente
        var textoDecodificado = new TextDecoder('utf-8', { fatal: false }).decode(xmlValidadorRawBytes);
        var textarea = document.getElementById('xmlValidadorTexto');
        if (textarea) textarea.value = textoDecodificado;
        var fn = document.getElementById('xmlValidadorFileName');
        if (fn) fn.textContent = 'Arquivo: ' + file.name;
        xmlValidadorValidar();
    };
    reader.readAsArrayBuffer(file);
}

function xmlValidadorLimpar() {
    xmlValidadorRawBytes = null;
    var textarea = document.getElementById('xmlValidadorTexto');
    if (textarea) textarea.value = '';
    var fn = document.getElementById('xmlValidadorFileName');
    if (fn) fn.textContent = '';
    var input = document.getElementById('xmlValidadorFile');
    if (input) input.value = '';
    var resultado = document.getElementById('xmlValidadorResultado');
    if (resultado) { resultado.innerHTML = ''; resultado.style.display = 'none'; }
}

// ── Bem-formação (via DOMParser nativo do navegador) ────────────────────────

function xmlValidadorChecarWellFormed(texto) {
    var parser = new DOMParser();
    var doc = parser.parseFromString(texto, 'application/xml');
    var errorNode = doc.querySelector('parsererror');
    if (errorNode) {
        var msg = errorNode.textContent.trim();
        var linha = null, coluna = null;
        var m = msg.match(/line\s*(\d+)[^\d]+column\s*(\d+)/i);
        if (m) { linha = parseInt(m[1]); coluna = parseInt(m[2]); }
        var trechoLinha = '';
        if (linha) {
            var linhas = texto.split('\n');
            if (linhas[linha - 1] !== undefined) trechoLinha = linhas[linha - 1];
        }
        return { valido: false, mensagem: msg, linha: linha, coluna: coluna, trechoLinha: trechoLinha };
    }
    var totalElementos = doc.querySelectorAll('*').length;
    var raiz = doc.documentElement ? doc.documentElement.tagName : '—';
    return { valido: true, raiz: raiz, totalElementos: totalElementos };
}

// ── Encoding declarado no prólogo do XML ────────────────────────────────────

function xmlValidadorEncodingDeclarado(texto) {
    var m = texto.match(/<\?xml[^>]*encoding=["']([^"']+)["']/i);
    return m ? m[1] : null;
}

// ── Detecção de mojibake (acentuação corrompida) ────────────────────────────

function xmlValidadorChecarMojibake(texto) {
    var encontrados = [];
    XML_MOJIBAKE_PADROES.forEach(function(par) {
        var padrao = par[0], correto = par[1];
        var count = texto.split(padrao).length - 1;
        if (count > 0) encontrados.push({ padrao: padrao, correto: correto, count: count });
    });
    return encontrados;
}

// ── Validação estrita de UTF-8 nos bytes brutos (só quando veio de upload) ──

function xmlValidadorChecarUtf8Bytes() {
    if (!xmlValidadorRawBytes) return null;
    try {
        new TextDecoder('utf-8', { fatal: true }).decode(xmlValidadorRawBytes);
        return true;
    } catch (e) {
        return false;
    }
}

// ── Função principal ─────────────────────────────────────────────────────────

function xmlValidadorValidar() {
    var texto = (document.getElementById('xmlValidadorTexto') || {}).value || '';
    var resultado = document.getElementById('xmlValidadorResultado');
    if (!resultado) return;

    if (!texto.trim()) {
        resultado.style.display = 'block';
        resultado.innerHTML = '<div class="dcm-status dcm-status-err">⚠️ Cole o conteúdo do XML ou selecione um arquivo primeiro.</div>';
        return;
    }

    var html = '';

    // 1. Bem-formação
    var wf = xmlValidadorChecarWellFormed(texto);
    if (wf.valido) {
        html += '<div class="dcm-status dcm-status-ok">✅ XML bem-formado</div>';
        html += '<div class="dcm-tag-row"><span class="dcm-tag-nome">Elemento raiz</span><span class="dcm-tag-val">' + escapeHtml(wf.raiz) + '</span></div>';
        html += '<div class="dcm-tag-row"><span class="dcm-tag-nome">Total de elementos</span><span class="dcm-tag-val">' + wf.totalElementos + '</span></div>';
    } else {
        html += '<div class="dcm-status dcm-status-err">❌ XML inválido — erro de sintaxe</div>';
        html += '<div class="dcm-warn-box">' + escapeHtml(wf.mensagem) + '</div>';
        if (wf.linha) {
            html += '<div class="dcm-tag-row"><span class="dcm-tag-nome">Linha</span><span class="dcm-tag-val">' + wf.linha + (wf.coluna ? ' (coluna ' + wf.coluna + ')' : '') + '</span></div>';
            if (wf.trechoLinha) {
                html += '<pre class="qb-code" style="margin-top:6px; font-size:12px;">' + escapeHtml(wf.trechoLinha) + '</pre>';
            }
        }
    }

    // 2. Encoding declarado
    var encodingDeclarado = xmlValidadorEncodingDeclarado(texto);
    html += '<div class="dcm-cat-block"><div class="dcm-cat-title">Encoding</div><div class="dcm-tag-list">';
    html += '<div class="dcm-tag-row"><span class="dcm-tag-nome">Declarado no prólogo</span><span class="dcm-tag-val">' + (encodingDeclarado ? escapeHtml(encodingDeclarado) : '— (não declarado, assume UTF-8)') + '</span></div>';

    // 3. Checagem estrita de bytes (só disponível quando veio de upload de arquivo)
    var utf8Bytes = xmlValidadorChecarUtf8Bytes();
    if (utf8Bytes !== null) {
        if (utf8Bytes) {
            html += '<div class="dcm-tag-row"><span class="dcm-tag-nome">Bytes do arquivo</span><span class="dcm-tag-val" style="color:#38ef7d;">✅ UTF-8 válido</span></div>';
        } else {
            html += '<div class="dcm-tag-row"><span class="dcm-tag-nome">Bytes do arquivo</span><span class="dcm-tag-val" style="color:#facc15;">❌ NÃO é UTF-8 válido</span></div>';
        }
    } else {
        html += '<div class="dcm-tag-row"><span class="dcm-tag-nome">Bytes do arquivo</span><span class="dcm-tag-val" style="opacity:0.6;">— (envie o arquivo .xml para essa checagem; texto colado não permite verificar os bytes originais)</span></div>';
    }
    html += '</div>';

    if (utf8Bytes === false) {
        html += '<div class="dcm-warn-box">⚠️ Os bytes do arquivo não formam UTF-8 válido — o arquivo provavelmente está salvo em <strong>ISO-8859-1</strong> ou <strong>Windows-1252</strong>. Reabra e salve novamente escolhendo UTF-8 no editor, ou ajuste o encoding declarado no prólogo para bater com o real.</div>';
    }

    // 4. Mojibake (acentuação corrompida visível no texto)
    var mojibake = xmlValidadorChecarMojibake(texto);
    html += '<div class="dcm-cat-block"><div class="dcm-cat-title">Acentuação</div><div class="dcm-tag-list">';
    if (mojibake.length) {
        html += '<div class="dcm-tag-row"><span class="dcm-tag-nome" style="color:#facc15;">⚠️ Padrões corrompidos encontrados</span><span class="dcm-tag-val">' + mojibake.length + ' tipo(s)</span></div>';
        mojibake.forEach(function(m) {
            html += '<div class="dcm-tag-row"><span class="dcm-tag-nome">"' + escapeHtml(m.padrao) + '" → deveria ser "' + escapeHtml(m.correto) + '"</span><span class="dcm-tag-val">' + m.count + 'x</span></div>';
        });
    } else {
        html += '<div class="dcm-tag-row"><span class="dcm-tag-nome">Resultado</span><span class="dcm-tag-val" style="color:#38ef7d;">✅ Nenhum padrão de acentuação corrompida encontrado</span></div>';
    }
    html += '</div>';

    resultado.style.display = 'block';
    resultado.innerHTML = html;
}
