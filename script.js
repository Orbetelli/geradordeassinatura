// ========================================
// SISTEMA DE ABAS
// ========================================

function switchTab(tabId, btn) {
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('tab-' + tabId).classList.add('active');
    btn.classList.add('active');
}

// ========================================
// GERADOR DE ASSINATURA
// ========================================

console.log('🚀 Gerador de Assinatura Médica - Versão Unificada');

let uploadedImage  = null;
let processedImage = null;
let uploadedImage2  = null;
let processedImage2 = null;

let adjustments = {
    contrast: 100,
    sharpness: 0,
    convertToBlack: false,
    cleanWeakPixels: false,
    autoCrop: false,
    applyPythonFilters: false
};

// Estado do tipo de profissional: 1 ou 2 → { type, register }
const professionState = {
    1: { type: 'medico', register: 'CRM' },
    2: { type: 'medico', register: 'CRM' }
};

// ----------------------------------------
// Seletor de profissão
// ----------------------------------------

function selectProfession(doctorIndex, btn) {
    professionState[doctorIndex].type     = btn.dataset.type;
    professionState[doctorIndex].register = btn.dataset.register;

    const selector = document.getElementById(`professionSelector${doctorIndex}`);
    selector.querySelectorAll('.profession-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    updateRegisterField(doctorIndex, btn.dataset.register);
}

function updateRegisterField(doctorIndex, register) {
    const suffix = doctorIndex === 1 ? '' : '2';
    const label  = document.getElementById(`doctorCRMLabel${suffix}`);
    const input  = document.getElementById(`doctorCRM${suffix}`);

    const placeholders = {
        CRM:  'Ex: CRM 12345/SP',
        CRMV: 'Ex: CRMV 98765/SP'
    };

    if (label) label.innerHTML = `${register} com Estado: <span class="register-badge">${register}</span>`;
    if (input) input.placeholder = placeholders[register] || `Ex: ${register} 12345/SP`;
}

// ----------------------------------------
// Inicialização
// ----------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ Aplicação iniciada');
    setupEventListeners();
    updateRegisterField(1, 'CRM');
    updateRegisterField(2, 'CRM');
    pwGerarSenhas(); // gera senhas iniciais na aba de senha
});

function setupEventListeners() {
    const bind      = (id, fn) => { const el = document.getElementById(id); if (el) el.addEventListener('change', fn); };
    const bindInput = (id, fn) => { const el = document.getElementById(id); if (el) el.addEventListener('input',  fn); };

    // Contraste
    bindInput('contrast', e => {
        adjustments.contrast = parseInt(e.target.value);
        document.getElementById('contrastValue').textContent = adjustments.contrast + '%';
    });

    // Nitidez
    bindInput('sharpness', e => {
        adjustments.sharpness = parseInt(e.target.value);
        document.getElementById('sharpnessValue').textContent = adjustments.sharpness;
    });

    // Checkboxes de filtro
    bind('convertToBlack',    e => { adjustments.convertToBlack    = e.target.checked; });
    bind('cleanWeakPixels',   e => { adjustments.cleanWeakPixels   = e.target.checked; });
    bind('autoCrop',          e => { adjustments.autoCrop          = e.target.checked; });
    bind('applyPythonFilters', e => {
        adjustments.applyPythonFilters = e.target.checked;
        const mc = document.getElementById('manualControls');
        mc.style.opacity       = e.target.checked ? '0.5' : '1';
        mc.style.pointerEvents = e.target.checked ? 'none' : 'auto';
        document.getElementById('contrast').disabled = e.target.checked;
        document.getElementById('sharpness').disabled = e.target.checked;
    });

    // Frases extras
    bind('addExtraPhrase', e => {
        ['extraPhraseGroup', 'extraPhrase2Group'].forEach(id =>
            document.getElementById(id).classList.toggle('hidden', !e.target.checked)
        );
        if (!e.target.checked) {
            document.getElementById('extraPhrase').value  = '';
            document.getElementById('extraPhrase2').value = '';
        }
    });

    // Uploads
    bind('fileInput',  handleFileUpload);
    bind('fileInput2', handleFileUpload2);

    // Segunda assinatura
    bind('enableSecondSignature', e => {
        document.getElementById('doctor2Section').classList.toggle('hidden', !e.target.checked);
        if (!e.target.checked) {
            uploadedImage2 = processedImage2 = null;
            ['doctorName2', 'doctorCRM2'].forEach(id => document.getElementById(id).value = '');
            document.getElementById('fileName2').textContent = '';
            document.getElementById('imagePreviewContainer2').style.display = 'none';
            document.getElementById('removeBgBtn2').classList.add('hidden');
            professionState[2] = { type: 'medico', register: 'CRM' };
            const sel2 = document.getElementById('professionSelector2');
            sel2.querySelectorAll('.profession-btn').forEach(b => b.classList.remove('active'));
            sel2.querySelector('[data-type="medico"]').classList.add('active');
            updateRegisterField(2, 'CRM');
        }
    });
}

// ----------------------------------------
// Upload de imagens
// ----------------------------------------

function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    document.getElementById('fileName').textContent = `📄 ${file.name}`;

    const reader = new FileReader();
    reader.onload = ev => {
        const img = new Image();
        img.onload = () => {
            uploadedImage  = img;
            processedImage = null;
            document.getElementById('imagePreview').src = ev.target.result;
            document.getElementById('imagePreviewContainer').style.display = 'block';
            document.getElementById('removeBgBtn').classList.remove('hidden');
            showMessage('✅ Imagem carregada!', 'success');
        };
        img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
}

function handleFileUpload2(e) {
    const file = e.target.files[0];
    if (!file) return;

    document.getElementById('fileName2').textContent = `📄 ${file.name}`;

    const reader = new FileReader();
    reader.onload = ev => {
        const img = new Image();
        img.onload = () => {
            uploadedImage2  = img;
            processedImage2 = null;
            document.getElementById('imagePreview2').src = ev.target.result;
            document.getElementById('imagePreviewContainer2').style.display = 'block';
            document.getElementById('removeBgBtn2').classList.remove('hidden');
            showMessage('✅ Segunda imagem carregada!', 'success');
        };
        img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
}

// ----------------------------------------
// Mensagens
// ----------------------------------------

function showMessage(text, type) {
    const container = document.getElementById('messageContainer');
    if (!container) return;
    container.innerHTML = `<div class="message message-${type}">${text}</div>`;
    setTimeout(() => { container.innerHTML = ''; }, 5000);
}

// ----------------------------------------
// Remoção de fundo (helper reutilizável)
// ----------------------------------------

function removeBgHelper(img, onDone) {
    const canvas = document.createElement('canvas');
    const ctx    = canvas.getContext('2d', { willReadFrequently: true });
    canvas.width  = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const W = canvas.width, H = canvas.height;

    // Detecta cor de fundo pelos 4 cantos
    const corners = [
        { r: data[0],                           g: data[1],                           b: data[2] },
        { r: data[(W - 1) * 4],                 g: data[(W - 1) * 4 + 1],             b: data[(W - 1) * 4 + 2] },
        { r: data[((H - 1) * W) * 4],           g: data[((H - 1) * W) * 4 + 1],       b: data[((H - 1) * W) * 4 + 2] },
        { r: data[((H - 1) * W + W - 1) * 4],  g: data[((H - 1) * W + W - 1) * 4 + 1], b: data[((H - 1) * W + W - 1) * 4 + 2] }
    ];

    const bgR = Math.round((corners[0].r + corners[1].r + corners[2].r + corners[3].r) / 4);
    const bgG = Math.round((corners[0].g + corners[1].g + corners[2].g + corners[3].g) / 4);
    const bgB = Math.round((corners[0].b + corners[1].b + corners[2].b + corners[3].b) / 4);

    const threshold = 80;

    for (let i = 0; i < data.length; i += 4) {
        const diff = Math.sqrt(
            Math.pow(data[i]     - bgR, 2) +
            Math.pow(data[i + 1] - bgG, 2) +
            Math.pow(data[i + 2] - bgB, 2)
        );
        if (diff < threshold) data[i + 3] = 0;
    }

    ctx.putImageData(imageData, 0, 0);

    const url    = canvas.toDataURL('image/png');
    const newImg = new Image();
    newImg.onload = () => onDone(newImg, url);
    newImg.src = url;
}

async function removeBackground() {
    if (!uploadedImage) { showMessage('⚠️ Selecione uma imagem primeiro!', 'error'); return; }

    const btn  = document.getElementById('removeBgBtn');
    const prog = document.getElementById('modelProgress');
    const bar  = document.getElementById('progressBar');
    const pct  = document.getElementById('progressPercent');

    btn.disabled = true;
    prog.classList.remove('hidden');
    document.getElementById('progressText').textContent = 'Removendo fundo...';
    bar.style.width = '50%'; pct.textContent = '50%';

    try {
        removeBgHelper(uploadedImage, (newImg, url) => {
            processedImage = uploadedImage = newImg;
            document.getElementById('imagePreview').src = url;
            document.getElementById('adjustmentSection').classList.remove('hidden');
            prog.classList.add('hidden');
            bar.style.width = '0%'; pct.textContent = '0%';
            showMessage('✅ Fundo removido!', 'success');
            btn.disabled = false;
        });
    } catch (e) {
        prog.classList.add('hidden');
        showMessage('❌ Erro: ' + e.message, 'error');
        btn.disabled = false;
    }
}

async function removeBackground2() {
    if (!uploadedImage2) { showMessage('⚠️ Selecione a segunda imagem primeiro!', 'error'); return; }

    const btn  = document.getElementById('removeBgBtn2');
    const prog = document.getElementById('modelProgress');
    const bar  = document.getElementById('progressBar');
    const pct  = document.getElementById('progressPercent');

    btn.disabled = true;
    prog.classList.remove('hidden');
    document.getElementById('progressText').textContent = 'Removendo fundo da segunda assinatura...';
    bar.style.width = '50%'; pct.textContent = '50%';

    try {
        removeBgHelper(uploadedImage2, (newImg, url) => {
            processedImage2 = uploadedImage2 = newImg;
            document.getElementById('imagePreview2').src = url;
            prog.classList.add('hidden');
            bar.style.width = '0%'; pct.textContent = '0%';
            showMessage('✅ Fundo da segunda assinatura removido!', 'success');
            btn.disabled = false;
        });
    } catch (e) {
        prog.classList.add('hidden');
        showMessage('❌ Erro: ' + e.message, 'error');
        btn.disabled = false;
    }
}

// ----------------------------------------
// Ajustes de imagem
// ----------------------------------------

function resetAdjustments() {
    adjustments = { contrast: 100, sharpness: 0, convertToBlack: false, cleanWeakPixels: false, autoCrop: false, applyPythonFilters: false };

    document.getElementById('contrast').value  = 100;
    document.getElementById('sharpness').value = 0;
    document.getElementById('contrastValue').textContent  = '100%';
    document.getElementById('sharpnessValue').textContent = '0';

    ['convertToBlack', 'cleanWeakPixels', 'autoCrop', 'applyPythonFilters']
        .forEach(id => document.getElementById(id).checked = false);

    const mc = document.getElementById('manualControls');
    mc.style.opacity = '1'; mc.style.pointerEvents = 'auto';
    document.getElementById('contrast').disabled  = false;
    document.getElementById('sharpness').disabled = false;

    showMessage('✅ Ajustes restaurados!', 'success');
}

function applyFiltersPreview() {
    if (!uploadedImage) { showMessage('⚠️ Selecione uma imagem primeiro!', 'error'); return; }

    const loading = document.getElementById('loading');
    loading.style.display = 'block';
    document.getElementById('loadingText').textContent = '🎨 Aplicando filtros...';

    setTimeout(() => {
        try {
            const canvas = document.createElement('canvas');
            const ctx    = canvas.getContext('2d', { alpha: true, willReadFrequently: true });
            canvas.width  = uploadedImage.width;
            canvas.height = uploadedImage.height;
            ctx.drawImage(uploadedImage, 0, 0);
            applyAllFilters(canvas, ctx);
            document.getElementById('imagePreview').src = canvas.toDataURL('image/png');
            showMessage('✅ Filtros aplicados!', 'success');
        } catch (e) {
            showMessage('❌ Erro: ' + e.message, 'error');
        } finally {
            loading.style.display = 'none';
        }
    }, 100);
}

// ----------------------------------------
// Processamento de imagem (filtros)
// ----------------------------------------

function applyContrast(imageData, contrastValue) {
    const data   = imageData.data;
    const factor = contrastValue / 100;

    for (let i = 0; i < data.length; i += 4) {
        data[i]     = Math.max(0, Math.min(255, ((data[i]     - 128) * factor) + 128));
        data[i + 1] = Math.max(0, Math.min(255, ((data[i + 1] - 128) * factor) + 128));
        data[i + 2] = Math.max(0, Math.min(255, ((data[i + 2] - 128) * factor) + 128));
    }

    return imageData;
}

function applySharpness(canvas, sharpnessValue) {
    if (sharpnessValue === 0) return canvas;

    const ctx    = canvas.getContext('2d', { willReadFrequently: true });
    const W      = canvas.width, H = canvas.height;
    const orig   = ctx.getImageData(0, 0, W, H);
    const blur   = document.createElement('canvas');
    blur.width = W; blur.height = H;
    const bctx = blur.getContext('2d');
    bctx.filter = `blur(${sharpnessValue > 10 ? '2px' : '1px'})`;
    bctx.drawImage(canvas, 0, 0);
    bctx.filter = 'none';
    const blurData = bctx.getImageData(0, 0, W, H);
    const amt = sharpnessValue / 3;

    for (let i = 0; i < orig.data.length; i += 4) {
        for (let j = 0; j < 3; j++) {
            orig.data[i + j] = Math.max(0, Math.min(255,
                orig.data[i + j] + (orig.data[i + j] - blurData.data[i + j]) * amt
            ));
        }
    }

    ctx.putImageData(orig, 0, 0);
    return canvas;
}

function convertToBlackPure(imageData) {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] > 0) { data[i] = 0; data[i + 1] = 0; data[i + 2] = 0; }
    }
    return imageData;
}

function cleanWeakPixelsFn(imageData, threshold = 15) {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] < threshold) data[i + 3] = 0;
    }
    return imageData;
}

function autoCropCanvas(canvas, margin = 15) {
    const ctx  = canvas.getContext('2d', { willReadFrequently: true });
    const W    = canvas.width, H = canvas.height;
    const data = ctx.getImageData(0, 0, W, H).data;
    let minX = W, minY = H, maxX = 0, maxY = 0, hasContent = false;

    for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
            if (data[(y * W + x) * 4 + 3] > 0) {
                hasContent = true;
                if (x < minX) minX = x; if (x > maxX) maxX = x;
                if (y < minY) minY = y; if (y > maxY) maxY = y;
            }
        }
    }

    if (!hasContent) return canvas;

    minX = Math.max(0, minX - margin);     minY = Math.max(0, minY - margin);
    maxX = Math.min(W - 1, maxX + margin); maxY = Math.min(H - 1, maxY + margin);

    const cW = maxX - minX + 1, cH = maxY - minY + 1;
    const cc = document.createElement('canvas');
    cc.width = cW; cc.height = cH;
    cc.getContext('2d').drawImage(canvas, minX, minY, cW, cH, 0, 0, cW, cH);
    return cc;
}

function applyAllFilters(canvas, ctx) {
    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    if (adjustments.applyPythonFilters) {
        imageData = applyContrast(imageData, 200);
        ctx.putImageData(imageData, 0, 0);
        applySharpness(canvas, 10);
    } else {
        if (adjustments.contrast !== 100) {
            imageData = applyContrast(imageData, adjustments.contrast);
            ctx.putImageData(imageData, 0, 0);
        }
        if (adjustments.sharpness > 0) applySharpness(canvas, adjustments.sharpness);
    }

    if (adjustments.cleanWeakPixels) {
        imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        imageData = cleanWeakPixelsFn(imageData, 15);
        ctx.putImageData(imageData, 0, 0);
    }

    if (adjustments.convertToBlack) {
        imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        imageData = convertToBlackPure(imageData);
        ctx.putImageData(imageData, 0, 0);
    }

    if (adjustments.autoCrop) return autoCropCanvas(canvas, 15);
    return canvas;
}

// ----------------------------------------
// Geração da assinatura
// ----------------------------------------

function getSelectedFont() {
    const sel = document.getElementById('fontSelector');
    return sel ? sel.value : 'Arial';
}

function buildSignatureText(name, registerValue, registerType, extraPhrase, extraPhrase2) {
    let text = `${name}\n${registerType}: ${registerValue}`;
    if (extraPhrase)  text += '\n' + extraPhrase;
    if (extraPhrase2) text += '\n' + extraPhrase2;
    return text;
}

async function generateSignature() {
    if (!uploadedImage) { showMessage('⚠️ Selecione uma imagem primeiro!', 'error'); return; }

    const name = document.getElementById('doctorName').value.trim();
    const crm  = document.getElementById('doctorCRM').value.trim();
    if (!name || !crm) { showMessage(`⚠️ Preencha nome e ${professionState[1].register}!`, 'error'); return; }

    const has2 = document.getElementById('enableSecondSignature').checked;
    if (has2) {
        if (!uploadedImage2) { showMessage('⚠️ Selecione a segunda imagem!', 'error'); return; }
        const name2 = document.getElementById('doctorName2').value.trim();
        const crm2  = document.getElementById('doctorCRM2').value.trim();
        if (!name2 || !crm2) { showMessage('⚠️ Preencha dados da segunda assinatura!', 'error'); return; }
    }

    const loading = document.getElementById('loading');
    const btn     = document.getElementById('generateBtn');
    loading.style.display = 'block';
    document.getElementById('loadingText').textContent = '🎨 Gerando...';
    btn.disabled = true;

    try {
        has2 ? createDoubleSignature(name, crm) : createFinalSignature(name, crm);
        showMessage('✅ Assinatura gerada!', 'success');
        document.getElementById('downloadBtn').classList.remove('hidden');
    } catch (e) {
        showMessage('❌ Erro: ' + e.message, 'error');
    } finally {
        loading.style.display = 'none';
        btn.disabled = false;
    }
}

function createFinalSignature(name, crm) {
    const fc  = document.getElementById('previewCanvas');
    const ctx = fc.getContext('2d', { alpha: true });
    fc.width = 600; fc.height = 120;
    ctx.fillStyle = 'white'; ctx.fillRect(0, 0, 600, 120);

    const src = document.getElementById('imagePreview');
    const img = new Image();
    img.onload = () => processImageAndDraw(img, fc, ctx, name, crm);
    img.src = src.src;
}

function createDoubleSignature(name, crm) {
    const fc  = document.getElementById('previewCanvas');
    const ctx = fc.getContext('2d', { alpha: true });
    fc.width = 600; fc.height = 120;
    ctx.fillStyle = 'white'; ctx.fillRect(0, 0, 600, 120);

    const src1 = document.getElementById('imagePreview');
    const src2 = document.getElementById('imagePreview2');
    const img1 = new Image(), img2 = new Image();
    let loaded = 0;
    const check = () => { if (++loaded === 2) processDoubleImages(img1, img2, fc, ctx, name, crm); };
    img1.onload = check; img2.onload = check;
    img1.src = src1.src; img2.src = src2.src;
}

function processImageAndDraw(src, fc, ctx, name, crm) {
    const tc   = document.createElement('canvas');
    const tctx = tc.getContext('2d', { alpha: true, willReadFrequently: true });
    tc.width = src.width; tc.height = src.height;
    tctx.drawImage(src, 0, 0);
    const pc = applyAllFilters(tc, tctx);

    const W = fc.width, H = fc.height, mW = 280, mH = 50;
    const ratio = Math.min(mW / pc.width, mH / pc.height, 1.0);
    const nW = Math.floor(pc.width * ratio), nH = Math.floor(pc.height * ratio);

    ctx.font      = `bold 11px "${getSelectedFont()}"`;
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';

    const addX = document.getElementById('addExtraPhrase').checked;
    const e1   = addX ? document.getElementById('extraPhrase').value.trim()  : '';
    const e2   = addX ? document.getElementById('extraPhrase2').value.trim() : '';

    const text  = buildSignatureText(name, crm, professionState[1].register, e1, e2);
    const lines = text.split('\n');
    const mg    = 5;
    const hC    = nH + mg + lines.length * 13;
    const yS    = Math.floor((H - hC) / 2);
    const xS    = Math.floor((W - nW) / 2);

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(pc, 0, 0, pc.width, pc.height, xS, yS, nW, nH);
    lines.forEach((l, i) => ctx.fillText(l, W / 2, yS + nH + mg + 11 + (i * 13)));

    fc.style.display = 'block';
}

function processDoubleImages(s1, s2, fc, ctx, n1, c1) {
    const mkCanvas = img => {
        const tc   = document.createElement('canvas');
        const tctx = tc.getContext('2d', { alpha: true, willReadFrequently: true });
        tc.width = img.width; tc.height = img.height;
        tctx.drawImage(img, 0, 0);
        return applyAllFilters(tc, tctx);
    };

    const pc1 = mkCanvas(s1), pc2 = mkCanvas(s2);
    const W = fc.width, H = fc.height, mW = 240, mH = 50;

    const r1  = Math.min(mW / pc1.width, mH / pc1.height, 1);
    const nW1 = Math.floor(pc1.width * r1), nH1 = Math.floor(pc1.height * r1);
    const r2  = Math.min(mW / pc2.width, mH / pc2.height, 1);
    const nW2 = Math.floor(pc2.width * r2), nH2 = Math.floor(pc2.height * r2);

    ctx.font      = `bold 11px "${getSelectedFont()}"`;
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';

    const n2   = document.getElementById('doctorName2').value.trim();
    const c2   = document.getElementById('doctorCRM2').value.trim();
    const addX = document.getElementById('addExtraPhrase').checked;
    const e1   = addX ? document.getElementById('extraPhrase').value.trim()  : '';
    const e2   = addX ? document.getElementById('extraPhrase2').value.trim() : '';

    const t1 = buildSignatureText(n1, c1, professionState[1].register, e1, '');
    const t2 = buildSignatureText(n2, c2, professionState[2].register, e2, '');
    const l1 = t1.split('\n'), l2 = t2.split('\n'), mg = 5;

    const hC1 = nH1 + mg + l1.length * 13;
    const yS1 = Math.floor((H - hC1) / 2), xC1 = W / 4, xS1 = Math.floor(xC1 - nW1 / 2);

    const hC2 = nH2 + mg + l2.length * 13;
    const yS2 = Math.floor((H - hC2) / 2), xC2 = (W * 3) / 4, xS2 = Math.floor(xC2 - nW2 / 2);

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(pc1, 0, 0, pc1.width, pc1.height, xS1, yS1, nW1, nH1);
    l1.forEach((l, i) => ctx.fillText(l, xC1, yS1 + nH1 + mg + 11 + (i * 13)));

    ctx.drawImage(pc2, 0, 0, pc2.width, pc2.height, xS2, yS2, nW2, nH2);
    l2.forEach((l, i) => ctx.fillText(l, xC2, yS2 + nH2 + mg + 11 + (i * 13)));

    fc.style.display = 'block';
}

function downloadImage() {
    const canvas = document.getElementById('previewCanvas');
    const name   = document.getElementById('doctorName').value.trim() || 'Assinatura';

    canvas.toBlob(blob => {
        const url = URL.createObjectURL(blob);
        const a   = document.createElement('a');
        a.href     = url;
        a.download = `Assinatura - ${name}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showMessage('✅ Download iniciado!', 'success');
    }, 'image/png');
}

// ========================================
// GERADOR DE SENHA
// ========================================

const pwSavedUsers = [];

function togglePwImplantacao(on) {
    document.getElementById('pwEmailSection').style.display = on ? 'block' : 'none';
}

function pwRand(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function pwGerarSenha(len, useSpecial, upperOnly) {
    const lower   = 'abcdefghijklmnopqrstuvwxyz';
    const upper   = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const digits  = '0123456789';
    const special = '@#$%&!';

    let chars = upperOnly ? upper + digits : lower + upper + digits;
    if (useSpecial) chars += special;

    // Garante pelo menos 1 de cada tipo obrigatório
    let mandatory = [];
    if (!upperOnly) mandatory.push(pwRand(lower));
    mandatory.push(pwRand(upper));
    mandatory.push(pwRand(digits));
    if (useSpecial) mandatory.push(pwRand(special));

    let rest = len - mandatory.length;
    if (rest < 0) rest = 0;
    for (let i = 0; i < rest; i++) mandatory.push(pwRand(chars));

    // Fisher-Yates shuffle
    for (let i = mandatory.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [mandatory[i], mandatory[j]] = [mandatory[j], mandatory[i]];
    }

    return mandatory.join('');
}

function pwGerarSenhas() {
    const prefix     = document.getElementById('pwPrefix').value || 'Mobile';
    const qty        = +document.getElementById('pwQty').value;
    const len        = +document.getElementById('pwLen').value;
    const useSpecial = document.getElementById('pwSpecial').checked;
    const upperOnly  = document.getElementById('pwUpper').checked;
    const implantacao = document.getElementById('pwImplantacao').checked;

    const list = document.getElementById('pwList');
    list.innerHTML = '';
    const generated = [];

    for (let i = 0; i < qty; i++) {
        const suffix = pwGerarSenha(len, useSpecial, upperOnly);
        const senha  = `${prefix}@${suffix}`;
        generated.push(senha);

        const div = document.createElement('div');
        div.className = 'pw-password-item';
        div.innerHTML = `
            <span>${senha}</span>
            <button onclick="pwRegenOne(this,'${prefix}',${len},${useSpecial},${upperOnly})" title="Regerar">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                    <path d="M3 3v5h5"/>
                </svg>
            </button>
            <button onclick="pwCopiar(this)" title="Copiar">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="9" y="9" width="13" height="13" rx="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
            </button>
        `;
        list.appendChild(div);
    }

    // Salva usuário se modo implantação ativo
    if (implantacao) {
        const email = document.getElementById('pwEmailBase').value;
        const name  = document.getElementById('pwUserName').value || 'Usuário';
        if (email) {
            pwSavedUsers.push({
                name,
                email,
                password: generated[0],
                date: new Date().toLocaleDateString('pt-BR')
            });
            document.getElementById('savedCount').textContent = pwSavedUsers.length;
            pwRenderUsers();
        }
    }
}

function pwRegenOne(btn, prefix, len, useSpecial, upperOnly) {
    const item = btn.closest('.pw-password-item');
    const span = item.querySelector('span');
    span.textContent = `${prefix}@${pwGerarSenha(len, useSpecial, upperOnly)}`;
    item.style.animation = 'none';
    requestAnimationFrame(() => { item.style.animation = 'fadeIn 0.3s ease'; });
}

function pwCopiar(btn) {
    const text = btn.closest('.pw-password-item').querySelector('span').textContent;
    navigator.clipboard.writeText(text).then(() => {
        btn.classList.add('copied');
        btn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`;
        setTimeout(() => {
            btn.classList.remove('copied');
            btn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;
        }, 1500);
    });
}

function pwRenderUsers() {
    const list = document.getElementById('pwUserList');
    if (!pwSavedUsers.length) {
        list.innerHTML = '<div class="pw-empty">Nenhum usuário salvo ainda.</div>';
        return;
    }
    list.innerHTML = pwSavedUsers.map((u, i) => `
        <div class="pw-user-item">
            <div>
                <div>${u.name}</div>
                <div class="uemail">${u.email} · ${u.date}</div>
            </div>
            <div class="uactions">
                <button onclick="navigator.clipboard.writeText('${u.password}')">Copiar senha</button>
                <button class="del-btn" onclick="pwRemoveUser(${i})">Remover</button>
            </div>
        </div>
    `).join('');
}

function pwRemoveUser(i) {
    pwSavedUsers.splice(i, 1);
    document.getElementById('savedCount').textContent = pwSavedUsers.length;
    pwRenderUsers();
}