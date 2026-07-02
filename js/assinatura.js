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

// Flag: segunda assinatura em modo "modelo pronto"
var sig2ModoModelo = false;

// Atalhos de teclado Ctrl+Z / Ctrl+Y para undo/redo da assinatura dupla
window.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        if (sig1Pos && sig2Pos) { dragDesfazer(); e.preventDefault(); }
    }
    if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        if (sig1Pos && sig2Pos) { dragRefazer(); e.preventDefault(); }
    }
});

function toggleSig2Modo(on) {
    sig2ModoModelo = on;
    var campos = document.getElementById('sig2CamposNormais');
    var hint   = document.getElementById('sig2ModeloHint');
    var label  = document.getElementById('fileInput2Label');
    if (campos) campos.style.display = on ? 'none' : 'block';
    if (hint)   hint.style.display   = on ? 'block' : 'none';
    if (label)  label.textContent    = on ? '📁 Selecionar Modelo Pronto (PNG)' : '📁 Selecionar Segunda Assinatura';
    // Limpa campos de nome/CRM para não influenciar validação
    if (on) {
        var n2 = document.getElementById('doctorName2');
        var c2 = document.getElementById('doctorCRM2');
        if (n2) n2.value = '';
        if (c2) c2.value = '';
    }
    sigRegenIfReady();
}

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
    var placeholders = { CRM: 'Ex: CRM 12345/SP', CRMV: 'Ex: CRMV 98765/SP', CRO: 'Ex: CRO 12345/SP' };
    if (label) label.innerHTML = register + ' com Estado: <span class="register-badge">' + register + '</span>';
    if (input) input.placeholder = placeholders[register] || 'Ex: ' + register + ' 12345/SP';
}

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
            // Esconde undo/redo
            var undoWrap = document.getElementById('sig_undoredo_wrap');
            if (undoWrap) undoWrap.style.display = 'none';
            dragResetarHistorico();
            // Reseta modo modelo pronto
            sig2ModoModelo = false;
            var cb = document.getElementById('sig2ModeloPronto');
            if (cb) cb.checked = false;
            toggleSig2Modo(false);
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

// ── Dados brutos para o slider de threshold ──────────────────────────────────
var bgRawData1 = null; // { lums, bgLum, origData, W, H }
var bgRawData2 = null;

function removeBgHelper(img, onDone, onRawReady) {
    var canvas = document.createElement('canvas');
    var ctx    = canvas.getContext('2d', { willReadFrequently: true });
    canvas.width = img.width; canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var data = imageData.data;
    var W = canvas.width, H = canvas.height;
    var total = W * H;

    // ── 1. Luminância perceptual de cada pixel (BT.601) ──────────────────────
    var lums = new Uint8Array(total);
    for (var i = 0; i < total; i++) {
        lums[i] = Math.round(0.299 * data[i*4] + 0.587 * data[i*4+1] + 0.114 * data[i*4+2]);
    }

    // ── 2. Moda do histograma = cor do fundo ─────────────────────────────────
    var hist = new Int32Array(256);
    for (var i = 0; i < total; i++) hist[lums[i]]++;
    var histSmooth = new Float32Array(256);
    for (var v = 0; v < 256; v++) {
        var soma = 0, cnt = 0;
        for (var k = -2; k <= 2; k++) {
            var idx = v + k;
            if (idx >= 0 && idx < 256) { soma += hist[idx]; cnt++; }
        }
        histSmooth[v] = soma / cnt;
    }
    var bgLum = 0, maxFreq = 0;
    for (var v = 0; v < 256; v++) {
        if (histSmooth[v] > maxFreq) { maxFreq = histSmooth[v]; bgLum = v; }
    }

    // ── 3. Threshold automático (usado na primeira passada) ──────────────────
    var fundoEscuro = bgLum < 128;
    var inkLum = bgLum;
    if (fundoEscuro) {
        for (var v = 255; v > bgLum; v--) { if (hist[v] > total * 0.005) { inkLum = v; break; } }
    } else {
        for (var v = 0; v < bgLum; v++) { if (hist[v] > total * 0.005) { inkLum = v; break; } }
    }
    var range = Math.abs(bgLum - inkLum);
    var autoThreshold = Math.min(100, Math.max(12, Math.round(range * 0.35)));

    // ── 4. Salva dados originais (RGB) para o slider poder reaplicar ─────────
    var origData = new Uint8ClampedArray(data);
    if (onRawReady) onRawReady({ lums: lums, bgLum: bgLum, origData: origData, W: W, H: H, canvas: canvas, ctx: ctx });

    // ── 5. Aplica threshold automático na primeira vez ───────────────────────
    bgAplicarThreshold(data, lums, bgLum, autoThreshold);

    ctx.putImageData(imageData, 0, 0);
    var url    = canvas.toDataURL('image/png');
    var newImg = new Image();
    newImg.onload = function() { onDone(newImg, url, autoThreshold); };
    newImg.src = url;
}

// Aplica um threshold específico nos dados de pixel
function bgAplicarThreshold(data, lums, bgLum, threshold) {
    var fadeZone = Math.max(6, Math.round(threshold * 0.25));
    var total = lums.length;
    for (var i = 0; i < total; i++) {
        var diff = Math.abs(lums[i] - bgLum);
        if (diff <= threshold) {
            data[i*4+3] = 0;
        } else if (diff <= threshold + fadeZone) {
            var t = (diff - threshold) / fadeZone;
            data[i*4+3] = Math.round(t * 255);
        } else {
            data[i*4+3] = 255;
        }
    }
}

// Reaplicar threshold quando o slider é movido
function bgThresholdAtualizar(sig) {
    var raw       = sig === 1 ? bgRawData1 : bgRawData2;
    var sliderId  = sig === 1 ? 'bgThreshold'       : 'bgThreshold2';
    var labelId   = sig === 1 ? 'bgThresholdValue'  : 'bgThresholdValue2';
    var previewId = sig === 1 ? 'imagePreview'      : 'imagePreview2';
    if (!raw) return;

    var threshold = parseInt(document.getElementById(sliderId).value);
    document.getElementById(labelId).textContent = threshold;

    // Restaura dados originais e reaaplica novo threshold
    var newData = new Uint8ClampedArray(raw.origData);
    bgAplicarThreshold(newData, raw.lums, raw.bgLum, threshold);

    var imageData = new ImageData(newData, raw.W, raw.H);
    raw.ctx.putImageData(imageData, 0, 0);
    var url = raw.canvas.toDataURL('image/png');

    document.getElementById(previewId).src = url;

    // Atualiza a imagem processada em memória
    var newImg = new Image();
    newImg.onload = function() {
        if (sig === 1) { processedImage = uploadedImage = newImg; }
        else           { processedImage2 = uploadedImage2 = newImg; }
    };
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
        removeBgHelper(uploadedImage,
            function(newImg, url, autoThreshold) {
                processedImage = uploadedImage = newImg;
                document.getElementById('imagePreview').src = url;
                document.getElementById('adjustmentSection').classList.remove('hidden');
                // Mostra e inicializa o slider
                var sec = document.getElementById('bgThresholdSection');
                if (sec) {
                    sec.classList.remove('hidden');
                    var sl = document.getElementById('bgThreshold');
                    sl.value = autoThreshold;
                    document.getElementById('bgThresholdValue').textContent = autoThreshold;
                }
                prog.classList.add('hidden');
                bar.style.width = '0%'; pct.textContent = '0%';
                showMessage('Fundo removido! Use o slider para ajustar.', 'success');
                btn.disabled = false;
            },
            function(raw) { bgRawData1 = raw; }
        );
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
        removeBgHelper(uploadedImage2,
            function(newImg, url, autoThreshold) {
                processedImage2 = uploadedImage2 = newImg;
                document.getElementById('imagePreview2').src = url;
                // Mostra e inicializa o slider
                var sec = document.getElementById('bgThresholdSection2');
                if (sec) {
                    sec.classList.remove('hidden');
                    var sl = document.getElementById('bgThreshold2');
                    sl.value = autoThreshold;
                    document.getElementById('bgThresholdValue2').textContent = autoThreshold;
                }
                prog.classList.add('hidden');
                bar.style.width = '0%'; pct.textContent = '0%';
                showMessage('Fundo da segunda assinatura removido!', 'success');
                btn.disabled = false;
            },
            function(raw) { bgRawData2 = raw; }
        );
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
    var data = imageData.data;
    threshold = threshold || 180;
    for (var i = 0; i < data.length; i += 4) {
        if (data[i+3] === 0) continue;
        var brilho = data[i] * 0.299 + data[i+1] * 0.587 + data[i+2] * 0.114;
        if (brilho >= threshold) {
            data[i+3] = 0; // pixel claro → transparente
        }
    }
    return imageData;
}

function applyContrast(imageData, contrastValue) {
    var data = imageData.data, factor = contrastValue / 100;
    for (var i = 0; i < data.length; i += 4) {
        if (data[i+3] === 0) continue;
        data[i]   = Math.max(0, Math.min(255, ((data[i]   - 128) * factor) + 128));
        data[i+1] = Math.max(0, Math.min(255, ((data[i+1] - 128) * factor) + 128));
        data[i+2] = Math.max(0, Math.min(255, ((data[i+2] - 128) * factor) + 128));
    }
    return imageData;
}

function applySharpness(canvas, sharpnessValue) {
    if (sharpnessValue === 0) return canvas;
    var ctx = canvas.getContext('2d', { willReadFrequently: true }), W = canvas.width, H = canvas.height;
    var orig = ctx.getImageData(0, 0, W, H);
    var blur = document.createElement('canvas'); blur.width = W; blur.height = H;
    var bctx = blur.getContext('2d');
    bctx.filter = 'blur(' + (sharpnessValue > 10 ? '2px' : '1px') + ')';
    bctx.drawImage(canvas, 0, 0); bctx.filter = 'none';
    var blurData = bctx.getImageData(0, 0, W, H), amt = sharpnessValue / 3;
    for (var i = 0; i < orig.data.length; i += 4)
        for (var j = 0; j < 3; j++)
            orig.data[i+j] = Math.max(0, Math.min(255, orig.data[i+j] + (orig.data[i+j] - blurData.data[i+j]) * amt));
    ctx.putImageData(orig, 0, 0);
    return canvas;
}

// Amplifica o canal alpha dos pixels semi-transparentes da tinta
function boostAlpha(imageData) {
    var data = imageData.data;
    for (var i = 0; i < data.length; i += 4) {
        if (data[i+3] === 0) continue;
        data[i+3] = 255;
    }
    return imageData;
}

function convertToBlackPure(imageData) {
    var data = imageData.data;
    for (var i = 0; i < data.length; i += 4)
        if (data[i+3] > 0) { data[i] = 0; data[i+1] = 0; data[i+2] = 0; }
    return imageData;
}

function cleanWeakPixelsFn(imageData, threshold) {
    threshold = threshold || 15;
    var data = imageData.data;
    for (var i = 0; i < data.length; i += 4) if (data[i+3] < threshold) data[i+3] = 0;
    return imageData;
}

function autoCropCanvas(canvas, margin) {
    margin = margin || 15;
    var ctx = canvas.getContext('2d', { willReadFrequently: true }), W = canvas.width, H = canvas.height;
    var data = ctx.getImageData(0, 0, W, H).data;
    var minX = W, minY = H, maxX = 0, maxY = 0, has = false;
    for (var y = 0; y < H; y++) for (var x = 0; x < W; x++) if (data[(y * W + x) * 4 + 3] > 0) {
        has = true;
        if (x < minX) minX = x; if (x > maxX) maxX = x;
        if (y < minY) minY = y; if (y > maxY) maxY = y;
    }
    if (!has) return canvas;
    minX = Math.max(0, minX - margin); minY = Math.max(0, minY - margin);
    maxX = Math.min(W - 1, maxX + margin); maxY = Math.min(H - 1, maxY + margin);
    var cW = maxX - minX + 1, cH = maxY - minY + 1;
    var cc = document.createElement('canvas'); cc.width = cW; cc.height = cH;
    cc.getContext('2d').drawImage(canvas, minX, minY, cW, cH, 0, 0, cW, cH);
    return cc;
}

function applyAllFilters(canvas, ctx) {
    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    if (adjustments.applyPythonFilters) {
        imageData = boostAlpha(imageData);
        imageData = applyContrast(imageData, 400);
        ctx.putImageData(imageData, 0, 0);
        applySharpness(canvas, 15);
        imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        imageData = applyThreshold(imageData, 160);
        imageData = convertToBlackPure(imageData);
        ctx.putImageData(imageData, 0, 0);
    } else {
        imageData = boostAlpha(imageData);

        if (adjustments.contrast !== 200) {
            imageData = applyContrast(imageData, adjustments.contrast);
        }
        ctx.putImageData(imageData, 0, 0);

        if (adjustments.sharpness > 0) applySharpness(canvas, adjustments.sharpness);

        imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        imageData = applyThreshold(imageData, 230);
        ctx.putImageData(imageData, 0, 0);
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

function getSelectedFont() { var sel=document.getElementById('fontSelector'); return sel?sel.value:'Arial'; }

function buildSignatureText(name,regVal,regType,e1,e2) {
    var t = name;
    if(e2) t+='\n'+e2;
    t+='\n'+regType+': '+regVal;
    if(e1) t+='\n'+e1;
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
        if (!sig2ModoModelo) {
            if (!document.getElementById('doctorName2').value.trim()||!document.getElementById('doctorCRM2').value.trim()) {
                showMessage('Preencha dados da segunda assinatura!','error'); return;
            }
        }
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

// ── Estado do drag & drop das assinaturas duplas ──
var dragState = {
    active: false,
    which: null,       // 1 ou 2
    offsetX: 0, offsetY: 0
};
var sig1Pos = null;    // { x, y, w, h } — posição atual da assinatura 1
var sig2Pos = null;    // { x, y, w, h } — posição atual da assinatura 2
var doubleCtx = null;  // contexto salvo para redesenho
var doubleData = null; // dados salvos para redesenho

// ── Histórico de undo/redo (posições do drag) ──
var dragHistorico  = [];
var dragFuturo     = [];
var DRAG_MAX_HIST  = 20;

function dragSalvarEstado() {
    if (!sig1Pos || !sig2Pos) return;
    dragHistorico.push({
        s1: { x: sig1Pos.x, y: sig1Pos.y },
        s2: { x: sig2Pos.x, y: sig2Pos.y }
    });
    if (dragHistorico.length > DRAG_MAX_HIST) dragHistorico.shift();
    dragFuturo = [];
    dragAtualizarBotoes();
}

function dragDesfazer() {
    if (!dragHistorico.length || !sig1Pos || !sig2Pos) return;
    dragFuturo.push({
        s1: { x: sig1Pos.x, y: sig1Pos.y },
        s2: { x: sig2Pos.x, y: sig2Pos.y }
    });
    var anterior = dragHistorico.pop();
    sig1Pos.x = anterior.s1.x; sig1Pos.y = anterior.s1.y;
    sig2Pos.x = anterior.s2.x; sig2Pos.y = anterior.s2.y;
    drawDoubleCanvas();
    dragAtualizarBotoes();
}

function dragRefazer() {
    if (!dragFuturo.length || !sig1Pos || !sig2Pos) return;
    dragHistorico.push({
        s1: { x: sig1Pos.x, y: sig1Pos.y },
        s2: { x: sig2Pos.x, y: sig2Pos.y }
    });
    var proximo = dragFuturo.pop();
    sig1Pos.x = proximo.s1.x; sig1Pos.y = proximo.s1.y;
    sig2Pos.x = proximo.s2.x; sig2Pos.y = proximo.s2.y;
    drawDoubleCanvas();
    dragAtualizarBotoes();
}

function dragAtualizarBotoes() {
    var btnU = document.getElementById('sig_undo_btn');
    var btnR = document.getElementById('sig_redo_btn');
    if (btnU) btnU.disabled = dragHistorico.length === 0;
    if (btnR) btnR.disabled = dragFuturo.length === 0;
}

function dragResetarHistorico() {
    dragHistorico = [];
    dragFuturo    = [];
    dragAtualizarBotoes();
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
    var n2=document.getElementById('doctorName2').value.trim();
    var c2=document.getElementById('doctorCRM2').value.trim();
    var addX=document.getElementById('addExtraPhrase').checked;
    var e1=addX?document.getElementById('extraPhrase').value.trim():'';
    var e2=addX?document.getElementById('extraPhrase2').value.trim():'';
    var t1=buildSignatureText(n1,c1,professionState[1].register,e1,'');
    var t2 = sig2ModoModelo ? '' : buildSignatureText(n2,c2,professionState[2].register,e2,'');
    var l1=t1.split('\n'), l2= sig2ModoModelo ? [] : t2.split('\n'), mg=5;
    var hC1=nH1+mg+l1.length*13, hC2=nH2+(sig2ModoModelo?0:mg+l2.length*13);

    var totalW = nW1 + nW2;
    var gap    = Math.floor((W - totalW) / 3);
    var x1 = gap;
    var x2 = gap + nW1 + gap;

    sig1Pos = { x: x1, y: Math.floor((H-hC1)/2), w: nW1, h: nH1, lines: l1, mg: mg };
    sig2Pos = { x: x2, y: Math.floor((H-hC2)/2), w: nW2, h: nH2, lines: l2, mg: mg };

    doubleCtx = ctx;
    doubleData = { fc: fc, pc1: pc1, pc2: pc2, W: W, H: H, font: getSelectedFont() };

    drawDoubleCanvas();
    fc.style.display='block';

    var hint = document.getElementById('canvasDragHint');
    if (hint) hint.style.display = 'block';

    var undoWrap = document.getElementById('sig_undoredo_wrap');
    if (undoWrap) undoWrap.style.display = 'flex';
    dragResetarHistorico();

    fc.onmousedown  = onSigMouseDown;
    fc.onmousemove  = onSigMouseMove;
    fc.onmouseup    = onSigMouseUp;
    fc.onmouseleave = onSigMouseUp;
    fc.ontouchstart = onSigTouchStart;
    fc.ontouchmove  = onSigTouchMove;
    fc.ontouchend   = onSigMouseUp;
}

function drawDoubleCanvas() {
    if (!doubleCtx || !doubleData || !sig1Pos || !sig2Pos) return;
    var ctx=doubleCtx, d=doubleData, W=d.W, H=d.H;
    var p1=sig1Pos, p2=sig2Pos;

    ctx.clearRect(0,0,W,H);
    ctx.fillStyle='white'; ctx.fillRect(0,0,W,H);
    ctx.font='bold 11px "'+d.font+'"'; ctx.fillStyle='black'; ctx.textAlign='center';
    ctx.imageSmoothingEnabled=true; ctx.imageSmoothingQuality='high';

    ctx.drawImage(d.pc1,0,0,d.pc1.width,d.pc1.height, p1.x, p1.y, p1.w, p1.h);
    p1.lines.forEach(function(l,i){ ctx.fillText(l, p1.x+p1.w/2, p1.y+p1.h+p1.mg+11+(i*13)); });

    ctx.drawImage(d.pc2,0,0,d.pc2.width,d.pc2.height, p2.x, p2.y, p2.w, p2.h);
    p2.lines.forEach(function(l,i){ ctx.fillText(l, p2.x+p2.w/2, p2.y+p2.h+p2.mg+11+(i*13)); });
}

function getSigAtPoint(x, y) {
    function hits(p) {
        var textH = p.lines.length * 13 + p.mg + 15;
        return x >= p.x && x <= p.x + p.w && y >= p.y && y <= p.y + p.h + textH;
    }
    if (sig1Pos && hits(sig1Pos)) return 1;
    if (sig2Pos && hits(sig2Pos)) return 2;
    return null;
}

function getCanvasXY(fc, e) {
    var rect = fc.getBoundingClientRect();
    var scaleX = fc.width  / rect.width;
    var scaleY = fc.height / rect.height;
    return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top)  * scaleY
    };
}

function onSigMouseDown(e) {
    var pt = getCanvasXY(this, e);
    var which = getSigAtPoint(pt.x, pt.y);
    if (!which) return;
    var pos = which === 1 ? sig1Pos : sig2Pos;
    dragState.active  = true;
    dragState.which   = which;
    dragState.offsetX = pt.x - pos.x;
    dragState.offsetY = pt.y - pos.y;
    this.style.cursor = 'grabbing';
    e.preventDefault();
}

function onSigMouseMove(e) {
    if (!dragState.active) {
        var pt = getCanvasXY(this, e);
        this.style.cursor = getSigAtPoint(pt.x, pt.y) ? 'grab' : 'default';
        return;
    }
    var pt = getCanvasXY(this, e);
    var pos = dragState.which === 1 ? sig1Pos : sig2Pos;
    var W = doubleData ? doubleData.W : 600;
    var H = doubleData ? doubleData.H : 120;
    pos.x = Math.max(0, Math.min(W - pos.w, pt.x - dragState.offsetX));
    pos.y = Math.max(0, Math.min(H - pos.h - pos.lines.length*13 - pos.mg - 5, pt.y - dragState.offsetY));
    drawDoubleCanvas();
    e.preventDefault();
}

function onSigMouseUp() {
    if (dragState.active) dragSalvarEstado();
    dragState.active = false;
    dragState.which  = null;
    if (this && this.style) this.style.cursor = 'grab';
}

function onSigTouchStart(e) {
    if (e.touches.length !== 1) return;
    onSigMouseDown.call(this, e.touches[0]);
}

function onSigTouchMove(e) {
    if (e.touches.length !== 1) return;
    onSigMouseMove.call(this, e.touches[0]);
}

function sigRegenIfReady() {
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
        sig1Pos = null; sig2Pos = null;
        if (!sig2ModoModelo) {
            if (!document.getElementById('doctorName2').value.trim()) return;
            if (!document.getElementById('doctorCRM2').value.trim()) return;
        }
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
