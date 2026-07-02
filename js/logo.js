// ========================================
// LOGO DA UNIDADE — padrão 120x120
// ========================================

var LOGO_SIZE = 120;
var logoImportImg = null;

// ── Troca entre os modos "Importar" e "Manual" ──
function logoSwitchModo(modo, btn) {
    document.querySelectorAll('#geral-panel-logo .qb-tab').forEach(function(b) { b.classList.remove('active'); });
    document.querySelectorAll('#geral-panel-logo > .qb-panel').forEach(function(p) { p.classList.remove('active'); });
    btn.classList.add('active');
    document.getElementById('logo-modo-' + modo).classList.add('active');
}

// ========================================
// MODO IMPORTAR
// ========================================

function logoImportFileChange(e) {
    var file = e.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(ev) {
        var img = new Image();
        img.onload = function() {
            logoImportImg = img;
            var fn = document.getElementById('logoImportFileName');
            if (fn) fn.textContent = 'Arquivo: ' + file.name;
            logoRenderImportPreview();
        };
        img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
}

function logoImportToggleTransparente(checked) {
    var colorInput = document.getElementById('logoImportBgColor');
    if (colorInput) colorInput.disabled = checked;
    logoRenderImportPreview();
}

function logoRenderImportPreview() {
    var canvas = document.getElementById('logoImportCanvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d', { willReadFrequently: false });
    ctx.clearRect(0, 0, LOGO_SIZE, LOGO_SIZE);

    var transparente = document.getElementById('logoImportTransparente').checked;
    if (!transparente) {
        var corFundo = document.getElementById('logoImportBgColor').value || '#ffffff';
        ctx.fillStyle = corFundo;
        ctx.fillRect(0, 0, LOGO_SIZE, LOGO_SIZE);
    }

    if (!logoImportImg) return;

    var padding = parseInt(document.getElementById('logoImportPadding').value) || 0;
    var avail = LOGO_SIZE - (padding * 2);
    var ratio = Math.min(avail / logoImportImg.width, avail / logoImportImg.height);
    var w = logoImportImg.width * ratio;
    var h = logoImportImg.height * ratio;
    var x = (LOGO_SIZE - w) / 2;
    var y = (LOGO_SIZE - h) / 2;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(logoImportImg, x, y, w, h);
}

function logoDownloadImport() {
    if (!logoImportImg) { alert('Selecione uma imagem primeiro!'); return; }
    var canvas = document.getElementById('logoImportCanvas');
    var nome = (document.getElementById('logoImportNome').value || 'logo').trim();
    var nomeArquivo = nome ? nome.replace(/[^a-zA-Z0-9]+/g, '_') : 'logo';
    canvas.toBlob(function(blob) {
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'Logo_' + nomeArquivo + '_120x120.png';
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 'image/png');
}

// ========================================
// MODO MANUAL
// ========================================

function logoManualSelecionarCor(hex) {
    var input = document.getElementById('logoManualBgColor');
    if (input) input.value = hex;
    logoRenderManualPreview();
}

function logoManualCorModoChange() {
    var custom = document.querySelector('input[name="logoManualCorTexto"]:checked').value === 'custom';
    var wrap = document.getElementById('logoManualTextColorWrap');
    if (wrap) wrap.style.display = custom ? 'block' : 'none';
    logoRenderManualPreview();
}

function logoIniciais(nome) {
    var partes = nome.trim().split(/\s+/).filter(Boolean);
    if (!partes.length) return '';
    if (partes.length === 1) return partes[0].substring(0, 2).toUpperCase();
    return (partes[0][0] + partes[1][0]).toUpperCase();
}

function logoQuebrarLinhas(ctx, texto, maxWidth) {
    var palavras = texto.split(/\s+/);
    var linhas = [];
    var atual = '';
    palavras.forEach(function(p) {
        var teste = atual ? atual + ' ' + p : p;
        if (ctx.measureText(teste).width > maxWidth && atual) {
            linhas.push(atual);
            atual = p;
        } else {
            atual = teste;
        }
    });
    if (atual) linhas.push(atual);
    return linhas;
}

// Luminância relativa (WCAG) para decidir se o texto fica preto ou branco
function logoContrastColor(hex) {
    hex = (hex || '#ffffff').replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(function(c) { return c + c; }).join('');
    var r = parseInt(hex.substring(0, 2), 16) / 255;
    var g = parseInt(hex.substring(2, 4), 16) / 255;
    var b = parseInt(hex.substring(4, 6), 16) / 255;
    function lin(c) { return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }
    var L = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
    return L > 0.5 ? '#111111' : '#ffffff';
}

function logoRenderManualPreview() {
    var canvas = document.getElementById('logoManualCanvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');

    var bg = document.getElementById('logoManualBgColor').value || '#11998e';
    ctx.clearRect(0, 0, LOGO_SIZE, LOGO_SIZE);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, LOGO_SIZE, LOGO_SIZE);

    var nome = document.getElementById('logoManualNome').value.trim();
    var modoTexto = document.getElementById('logoManualModoTexto').value;
    var corModoEl = document.querySelector('input[name="logoManualCorTexto"]:checked');
    var corModo = corModoEl ? corModoEl.value : 'auto';
    var corTexto = corModo === 'custom'
        ? (document.getElementById('logoManualTextColor').value || '#ffffff')
        : logoContrastColor(bg);

    ctx.fillStyle = corTexto;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (!nome) {
        ctx.font = '13px "Segoe UI", sans-serif';
        ctx.globalAlpha = 0.55;
        ctx.fillText('Sem nome', LOGO_SIZE / 2, LOGO_SIZE / 2);
        ctx.globalAlpha = 1;
        return;
    }

    if (modoTexto === 'iniciais') {
        var ini = logoIniciais(nome);
        ctx.font = 'bold 44px "Segoe UI", sans-serif';
        ctx.fillText(ini, LOGO_SIZE / 2, LOGO_SIZE / 2 + 4);
    } else {
        var fontSize = 20;
        var linhas;
        do {
            ctx.font = 'bold ' + fontSize + 'px "Segoe UI", sans-serif';
            linhas = logoQuebrarLinhas(ctx, nome, LOGO_SIZE - 16);
            fontSize -= 1;
        } while (linhas.length > 3 && fontSize > 8);

        var lineHeight = fontSize + 5;
        var startY = (LOGO_SIZE / 2) - ((linhas.length - 1) * lineHeight) / 2;
        linhas.forEach(function(l, i) {
            ctx.fillText(l, LOGO_SIZE / 2, startY + i * lineHeight);
        });
    }
}

function logoDownloadManual() {
    var canvas = document.getElementById('logoManualCanvas');
    var nome = (document.getElementById('logoManualNome').value || 'unidade').trim();
    var nomeArquivo = nome ? nome.replace(/[^a-zA-Z0-9]+/g, '_') : 'unidade';
    canvas.toBlob(function(blob) {
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'Logo_' + nomeArquivo + '_120x120.png';
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 'image/png');
}

// ── Inicialização (desenha o preview manual assim que a página carrega) ──
document.addEventListener('DOMContentLoaded', function() {
    logoRenderManualPreview();
});
