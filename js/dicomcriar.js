// ========================================
// GERADOR DE DICOM DE TESTE — arquivo sintético
// ========================================

// ── Helpers de codificação binária (Explicit VR Little Endian) ──────────────

function dcmStrBytes(str) {
    str = str || '';
    var arr = new Uint8Array(str.length);
    for (var i = 0; i < str.length; i++) arr[i] = str.charCodeAt(i) & 0xFF;
    return arr;
}

function dcmPadEven(bytes, padByte) {
    if (bytes.length % 2 !== 0) {
        var padded = new Uint8Array(bytes.length + 1);
        padded.set(bytes);
        padded[bytes.length] = padByte;
        return padded;
    }
    return bytes;
}

function dcmStrVal(str, vr) {
    var padByte = (vr === 'UI') ? 0x00 : 0x20;
    return dcmPadEven(dcmStrBytes(str || ''), padByte);
}

function dcmUL(value) {
    var b = new Uint8Array(4);
    new DataView(b.buffer).setUint32(0, value, true);
    return b;
}

function dcmUS(value) {
    var b = new Uint8Array(2);
    new DataView(b.buffer).setUint16(0, value, true);
    return b;
}

// Monta um elemento DICOM completo: tag + VR + length + valor
function dcmElement(group, elem, vr, valueBytes) {
    var longForm = ['OB','OW','OF','SQ','UT','UN','UC','UR'].indexOf(vr) !== -1;
    var headerLen = longForm ? 12 : 8;
    var buf = new Uint8Array(headerLen + valueBytes.length);
    var dv  = new DataView(buf.buffer);
    dv.setUint16(0, group, true);
    dv.setUint16(2, elem, true);
    buf[4] = vr.charCodeAt(0);
    buf[5] = vr.charCodeAt(1);
    if (longForm) {
        dv.setUint16(6, 0, true); // reservado
        dv.setUint32(8, valueBytes.length, true);
        buf.set(valueBytes, 12);
    } else {
        dv.setUint16(6, valueBytes.length, true);
        buf.set(valueBytes, 8);
    }
    return buf;
}

function dcmConcat(arrays) {
    var total = arrays.reduce(function(s, a) { return s + a.length; }, 0);
    var out = new Uint8Array(total);
    var offset = 0;
    arrays.forEach(function(a) { out.set(a, offset); offset += a.length; });
    return out;
}

// ── Gera um UID válido no formato 2.25.<inteiro derivado de UUID> ───────────
// (raiz reservada pela própria norma DICOM PS3.5 Annex B para uso ad-hoc)
function dcmGerarUID() {
    var hex;
    if (window.crypto && crypto.randomUUID) {
        hex = crypto.randomUUID().replace(/-/g, '');
    } else {
        hex = '';
        for (var i = 0; i < 32; i++) hex += Math.floor(Math.random() * 16).toString(16);
    }
    try {
        return '2.25.' + BigInt('0x' + hex).toString();
    } catch (e) {
        // fallback caso BigInt não esteja disponível
        return '2.25.' + Date.now() + Math.floor(Math.random() * 1e9);
    }
}

function dcmGerarAccession() {
    var n = Math.floor(Math.random() * 900000000) + 100000000;
    var input = document.getElementById('dcmCriarAccession');
    if (input) input.value = 'TEST' + n;
}

// ── Preview do padrão de imagem sintética ────────────────────────────────────

function dcmCriarDesenharPreview() {
    var canvas = document.getElementById('dcmCriarPreview');
    if (!canvas) return;
    var padrao = document.getElementById('dcmCriarPadrao').value;
    var ctx = canvas.getContext('2d');
    dcmCriarPintarPadrao(ctx, canvas.width, canvas.height, padrao);
}

function dcmCriarPintarPadrao(ctx, W, H, padrao) {
    if (padrao === 'cinza') {
        ctx.fillStyle = '#808080';
        ctx.fillRect(0, 0, W, H);
    } else if (padrao === 'gradiente') {
        var grad = ctx.createLinearGradient(0, 0, W, 0);
        grad.addColorStop(0, '#000000');
        grad.addColorStop(1, '#ffffff');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);
    } else { // xadrez
        var tile = Math.max(8, Math.floor(W / 16));
        for (var y = 0; y < H; y += tile) {
            for (var x = 0; x < W; x += tile) {
                var par = ((x / tile) + (y / tile)) % 2 === 0;
                ctx.fillStyle = par ? '#e0e0e0' : '#404040';
                ctx.fillRect(x, y, tile, tile);
            }
        }
    }
}

// ── Geração do arquivo DICOM completo ────────────────────────────────────────

function dcmCriarGerarArquivo() {
    var tamanho = parseInt(document.getElementById('dcmCriarTamanho').value);
    var padrao  = document.getElementById('dcmCriarPadrao').value;

    // 1. Gera os pixels via canvas offscreen
    var canvas = document.createElement('canvas');
    canvas.width = tamanho; canvas.height = tamanho;
    var ctx = canvas.getContext('2d', { willReadFrequently: true });
    dcmCriarPintarPadrao(ctx, tamanho, tamanho, padrao);
    var imgData = ctx.getImageData(0, 0, tamanho, tamanho).data;

    var pixelBytes = new Uint8Array(tamanho * tamanho);
    for (var i = 0, p = 0; i < imgData.length; i += 4, p++) {
        // luminância simples (já é escala de cinza, mas garante consistência)
        pixelBytes[p] = Math.round(0.299 * imgData[i] + 0.587 * imgData[i+1] + 0.114 * imgData[i+2]);
    }
    pixelBytes = dcmPadEven(pixelBytes, 0x00);

    // 2. Coleta os campos do formulário (com defaults sensatos)
    var g = function(id) { var el = document.getElementById(id); return el ? el.value.trim() : ''; };

    var patientName  = g('dcmCriarPatientName')  || 'TESTE^PACIENTE';
    var patientID    = g('dcmCriarPatientID')    || ('TESTE' + Date.now());
    var birthDate    = g('dcmCriarBirthDate').replace(/-/g, '');
    var sex          = g('dcmCriarSex') || 'O';
    var modality     = g('dcmCriarModality') || 'OT';
    var accession    = g('dcmCriarAccession')    || ('TEST' + Date.now());
    var studyDesc    = g('dcmCriarStudyDesc')    || 'Estudo de teste — Mobilemed Tools';
    var referringPhys= g('dcmCriarReferringPhys')|| '';
    var institution  = g('dcmCriarInstitution')  || 'Mobilemed Tools';
    var stationName  = g('dcmCriarStation')      || 'MOBILEMEDTOOLS';
    var manufacturer = g('dcmCriarManufacturer') || 'Mobilemed Tools Test Generator';

    var studyDateRaw = g('dcmCriarStudyDate');
    var studyDate = studyDateRaw ? studyDateRaw.replace(/-/g, '') : dcmCriarDataHoje();
    var studyTimeRaw = g('dcmCriarStudyTime');
    var studyTime = studyTimeRaw ? studyTimeRaw.replace(/:/g, '') + '00' : dcmCriarHoraAgora();

    // 3. UIDs e constantes
    var sopClassUID       = '1.2.840.10008.5.1.4.1.1.7'; // Secondary Capture Image Storage
    var transferSyntaxUID = '1.2.840.10008.1.2.1';       // Explicit VR Little Endian
    var sopInstanceUID    = dcmGerarUID();
    var studyInstanceUID  = dcmGerarUID();
    var seriesInstanceUID = dcmGerarUID();
    var implementationUID = dcmGerarUID();

    // 4. Monta o dataset principal (ordem crescente de tag)
    var dataset = dcmConcat([
        dcmElement(0x0008, 0x0005, 'CS', dcmStrVal('ISO_IR 100', 'CS')),
        dcmElement(0x0008, 0x0016, 'UI', dcmStrVal(sopClassUID, 'UI')),
        dcmElement(0x0008, 0x0018, 'UI', dcmStrVal(sopInstanceUID, 'UI')),
        dcmElement(0x0008, 0x0020, 'DA', dcmStrVal(studyDate, 'DA')),
        dcmElement(0x0008, 0x0030, 'TM', dcmStrVal(studyTime, 'TM')),
        dcmElement(0x0008, 0x0050, 'SH', dcmStrVal(accession, 'SH')),
        dcmElement(0x0008, 0x0060, 'CS', dcmStrVal(modality, 'CS')),
        dcmElement(0x0008, 0x0070, 'LO', dcmStrVal(manufacturer, 'LO')),
        dcmElement(0x0008, 0x0080, 'LO', dcmStrVal(institution, 'LO')),
        dcmElement(0x0008, 0x0090, 'PN', dcmStrVal(referringPhys, 'PN')),
        dcmElement(0x0008, 0x1010, 'SH', dcmStrVal(stationName, 'SH')),
        dcmElement(0x0008, 0x1030, 'LO', dcmStrVal(studyDesc, 'LO')),
        dcmElement(0x0010, 0x0010, 'PN', dcmStrVal(patientName, 'PN')),
        dcmElement(0x0010, 0x0020, 'LO', dcmStrVal(patientID, 'LO')),
        dcmElement(0x0010, 0x0030, 'DA', dcmStrVal(birthDate, 'DA')),
        dcmElement(0x0010, 0x0040, 'CS', dcmStrVal(sex, 'CS')),
        dcmElement(0x0020, 0x000D, 'UI', dcmStrVal(studyInstanceUID, 'UI')),
        dcmElement(0x0020, 0x000E, 'UI', dcmStrVal(seriesInstanceUID, 'UI')),
        dcmElement(0x0020, 0x0010, 'SH', dcmStrVal('1', 'SH')),
        dcmElement(0x0020, 0x0011, 'IS', dcmStrVal('1', 'IS')),
        dcmElement(0x0020, 0x0013, 'IS', dcmStrVal('1', 'IS')),
        dcmElement(0x0028, 0x0002, 'US', dcmUS(1)),
        dcmElement(0x0028, 0x0004, 'CS', dcmStrVal('MONOCHROME2', 'CS')),
        dcmElement(0x0028, 0x0010, 'US', dcmUS(tamanho)),
        dcmElement(0x0028, 0x0011, 'US', dcmUS(tamanho)),
        dcmElement(0x0028, 0x0100, 'US', dcmUS(8)),
        dcmElement(0x0028, 0x0101, 'US', dcmUS(8)),
        dcmElement(0x0028, 0x0102, 'US', dcmUS(7)),
        dcmElement(0x0028, 0x0103, 'US', dcmUS(0)),
        dcmElement(0x7FE0, 0x0010, 'OB', pixelBytes)
    ]);

    // 5. Monta o File Meta Group (0002,xxxx) — sempre Explicit VR
    var metaSemGroupLength = dcmConcat([
        dcmElement(0x0002, 0x0001, 'OB', new Uint8Array([0x00, 0x01])),
        dcmElement(0x0002, 0x0002, 'UI', dcmStrVal(sopClassUID, 'UI')),
        dcmElement(0x0002, 0x0003, 'UI', dcmStrVal(sopInstanceUID, 'UI')),
        dcmElement(0x0002, 0x0010, 'UI', dcmStrVal(transferSyntaxUID, 'UI')),
        dcmElement(0x0002, 0x0012, 'UI', dcmStrVal(implementationUID, 'UI')),
        dcmElement(0x0002, 0x0013, 'SH', dcmStrVal('MOBILEMEDTOOLS', 'SH'))
    ]);
    var groupLengthEl = dcmElement(0x0002, 0x0000, 'UL', dcmUL(metaSemGroupLength.length));

    // 6. Preâmbulo (128 bytes zerados) + "DICM"
    var preamble = new Uint8Array(132);
    preamble.set(dcmStrBytes('DICM'), 128);

    // 7. Concatena tudo
    var arquivoCompleto = dcmConcat([preamble, groupLengthEl, metaSemGroupLength, dataset]);

    // 8. Download
    var blob = new Blob([arquivoCompleto], { type: 'application/dicom' });
    var url  = URL.createObjectURL(blob);
    var a    = document.createElement('a');
    a.href = url;
    a.download = 'Teste_DICOM_' + patientID.replace(/[^a-zA-Z0-9]/g, '_') + '.dcm';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // 9. Exibe os UIDs gerados para referência/log
    dcmCriarMostrarInfo({
        sopInstanceUID: sopInstanceUID,
        studyInstanceUID: studyInstanceUID,
        seriesInstanceUID: seriesInstanceUID,
        accession: accession
    });
}

function dcmCriarDataHoje() {
    var d = new Date();
    return '' + d.getFullYear() + String(d.getMonth()+1).padStart(2,'0') + String(d.getDate()).padStart(2,'0');
}

function dcmCriarHoraAgora() {
    var d = new Date();
    return String(d.getHours()).padStart(2,'0') + String(d.getMinutes()).padStart(2,'0') + String(d.getSeconds()).padStart(2,'0');
}

function dcmCriarMostrarInfo(dados) {
    var el = document.getElementById('dcmCriarInfoGerado');
    if (!el) return;
    el.innerHTML =
        '<div class="dcm-sop-box">' +
        '<span class="dcm-sop-cat">Arquivo gerado</span>' +
        '<span class="dcm-sop-nome">Baixado com sucesso</span>' +
        '</div>' +
        '<div class="dcm-tag-row"><span class="dcm-tag-nome">Accession Number</span><span class="dcm-tag-val">' + dados.accession + '</span></div>' +
        '<div class="dcm-tag-row"><span class="dcm-tag-nome">Study Instance UID</span><span class="dcm-tag-val" style="font-size:11px;">' + dados.studyInstanceUID + '</span></div>' +
        '<div class="dcm-tag-row"><span class="dcm-tag-nome">Series Instance UID</span><span class="dcm-tag-val" style="font-size:11px;">' + dados.seriesInstanceUID + '</span></div>' +
        '<div class="dcm-tag-row"><span class="dcm-tag-nome">SOP Instance UID</span><span class="dcm-tag-val" style="font-size:11px;">' + dados.sopInstanceUID + '</span></div>';
    el.style.display = 'block';
}

// ── Inicialização ────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
    dcmGerarAccession();
    dcmCriarDesenharPreview();
    var hoje = dcmCriarDataHoje();
    var campoData = document.getElementById('dcmCriarStudyDate');
    if (campoData) campoData.value = hoje.substring(0,4) + '-' + hoje.substring(4,6) + '-' + hoje.substring(6,8);
});
