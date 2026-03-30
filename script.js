console.log('🚀 Gerador de Assinatura Médica - Versão Simples (Sem IA)');

let uploadedImage = null;
let processedImage = null;
let uploadedImage2 = null;
let processedImage2 = null;
let adjustments = {
    contrast: 100,
    sharpness: 0,
    convertToBlack: false,
    cleanWeakPixels: false,
    autoCrop: false,
    applyPythonFilters: false
};

// Estado do tipo de profissional selecionado
// Mapa: número do médico (1 ou 2) → { type, register }
const professionState = {
    1: { type: 'medico', register: 'CRM' },
    2: { type: 'medico', register: 'CRM' }
};

// ========================================
// SELETOR DE TIPO DE PROFISSIONAL
// ========================================

/**
 * Chamado ao clicar em qualquer botão de profissão.
 * @param {number} doctorIndex - 1 ou 2
 * @param {HTMLElement} btn - botão clicado
 */
function selectProfession(doctorIndex, btn) {
    const register = btn.dataset.register;
    const type = btn.dataset.type;

    // Atualiza estado
    professionState[doctorIndex].type = type;
    professionState[doctorIndex].register = register;

    // Atualiza visual dos botões do grupo
    const selector = document.getElementById(`professionSelector${doctorIndex}`);
    selector.querySelectorAll('.profession-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Atualiza label + placeholder do campo de registro
    updateRegisterField(doctorIndex, register);
}

/**
 * Atualiza o label e placeholder do campo de registro conforme o profissional.
 */
function updateRegisterField(doctorIndex, register) {
    const suffix = doctorIndex === 1 ? '' : '2';
    const label = document.getElementById(`doctorCRMLabel${suffix || ''}`);
    const input = document.getElementById(`doctorCRM${suffix}`);

    // Exemplos de placeholder por tipo de registro
    const placeholders = {
        CRM:  'Ex: CRM 12345/SP',
        CRMV: 'Ex: CRMV 98765/SP'
    };

    if (label) {
        label.innerHTML = `${register} com Estado: <span class="register-badge">${register}</span>`;
    }

    if (input) {
        input.placeholder = placeholders[register] || `Ex: ${register} 12345/SP`;
    }
}

// ========================================
// INICIALIZAÇÃO
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ Aplicação iniciada');
    setupEventListeners();
    // Garante labels corretos no estado inicial
    updateRegisterField(1, 'CRM');
    updateRegisterField(2, 'CRM');
});

function setupEventListeners() {
    // Contraste
    const contrastEl = document.getElementById('contrast');
    if (contrastEl) {
        contrastEl.addEventListener('input', function(e) {
            adjustments.contrast = parseInt(e.target.value);
            document.getElementById('contrastValue').textContent = adjustments.contrast + '%';
        });
    }

    // Nitidez
    const sharpnessEl = document.getElementById('sharpness');
    if (sharpnessEl) {
        sharpnessEl.addEventListener('input', function(e) {
            adjustments.sharpness = parseInt(e.target.value);
            document.getElementById('sharpnessValue').textContent = adjustments.sharpness;
        });
    }

    // Converter para preto
    const convertToBlackEl = document.getElementById('convertToBlack');
    if (convertToBlackEl) {
        convertToBlackEl.addEventListener('change', function(e) {
            adjustments.convertToBlack = e.target.checked;
        });
    }

    // Limpar pixels fracos
    const cleanWeakPixelsEl = document.getElementById('cleanWeakPixels');
    if (cleanWeakPixelsEl) {
        cleanWeakPixelsEl.addEventListener('change', function(e) {
            adjustments.cleanWeakPixels = e.target.checked;
        });
    }

    // Crop automático
    const autoCropEl = document.getElementById('autoCrop');
    if (autoCropEl) {
        autoCropEl.addEventListener('change', function(e) {
            adjustments.autoCrop = e.target.checked;
        });
    }

    // Aplicar filtros Python
    const applyPythonFiltersEl = document.getElementById('applyPythonFilters');
    if (applyPythonFiltersEl) {
        applyPythonFiltersEl.addEventListener('change', function(e) {
            adjustments.applyPythonFilters = e.target.checked;
            const manualControls = document.getElementById('manualControls');
            
            if (e.target.checked) {
                manualControls.style.opacity = '0.5';
                manualControls.style.pointerEvents = 'none';
                document.getElementById('contrast').disabled = true;
                document.getElementById('sharpness').disabled = true;
            } else {
                manualControls.style.opacity = '1';
                manualControls.style.pointerEvents = 'auto';
                document.getElementById('contrast').disabled = false;
                document.getElementById('sharpness').disabled = false;
            }
        });
    }

    // Frases extras
    const addExtraPhraseEl = document.getElementById('addExtraPhrase');
    if (addExtraPhraseEl) {
        addExtraPhraseEl.addEventListener('change', function (e) {
            const extraPhraseGroup = document.getElementById('extraPhraseGroup');
            const extraPhrase2Group = document.getElementById('extraPhrase2Group');
            if (e.target.checked) {
                extraPhraseGroup.classList.remove('hidden');
                extraPhrase2Group.classList.remove('hidden');
            } else {
                extraPhraseGroup.classList.add('hidden');
                extraPhrase2Group.classList.add('hidden');
                document.getElementById('extraPhrase').value = '';
                document.getElementById('extraPhrase2').value = '';
            }
        });
    }

    // Upload
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        fileInput.addEventListener('change', handleFileUpload);
    }

    // Upload segunda assinatura
    const fileInput2 = document.getElementById('fileInput2');
    if (fileInput2) {
        fileInput2.addEventListener('change', handleFileUpload2);
    }

    // Checkbox segunda assinatura
    const enableSecondSignatureEl = document.getElementById('enableSecondSignature');
    if (enableSecondSignatureEl) {
        enableSecondSignatureEl.addEventListener('change', function(e) {
            const doctor2Section = document.getElementById('doctor2Section');
            if (e.target.checked) {
                doctor2Section.classList.remove('hidden');
            } else {
                doctor2Section.classList.add('hidden');
                // Limpa dados da segunda assinatura
                uploadedImage2 = null;
                processedImage2 = null;
                document.getElementById('doctorName2').value = '';
                document.getElementById('doctorCRM2').value = '';
                document.getElementById('fileName2').textContent = '';
                document.getElementById('imagePreviewContainer2').style.display = 'none';
                document.getElementById('removeBgBtn2').classList.add('hidden');
                // Reseta profissão 2 para médico
                professionState[2] = { type: 'medico', register: 'CRM' };
                const selector2 = document.getElementById('professionSelector2');
                selector2.querySelectorAll('.profession-btn').forEach(b => b.classList.remove('active'));
                selector2.querySelector('[data-type="medico"]').classList.add('active');
                updateRegisterField(2, 'CRM');
            }
        });
    }
}

function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    document.getElementById('fileName').textContent = `📄 ${file.name}`;

    const reader = new FileReader();
    reader.onload = function (event) {
        const img = new Image();
        img.onload = function () {
            uploadedImage = img;
            processedImage = null;
            document.getElementById('imagePreview').src = event.target.result;
            document.getElementById('imagePreviewContainer').style.display = 'block';
            document.getElementById('removeBgBtn').classList.remove('hidden');
            showMessage('✅ Imagem carregada!', 'success');
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

function handleFileUpload2(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    document.getElementById('fileName2').textContent = `📄 ${file.name}`;

    const reader = new FileReader();
    reader.onload = function (event) {
        const img = new Image();
        img.onload = function () {
            uploadedImage2 = img;
            processedImage2 = null;
            document.getElementById('imagePreview2').src = event.target.result;
            document.getElementById('imagePreviewContainer2').style.display = 'block';
            document.getElementById('removeBgBtn2').classList.remove('hidden');
            showMessage('✅ Segunda imagem carregada!', 'success');
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

function showMessage(text, type) {
    const container = document.getElementById('messageContainer');
    if (!container) return;
    container.innerHTML = `<div class="message message-${type}">${text}</div>`;
    setTimeout(() => { container.innerHTML = ''; }, 5000);
}

// ========================================
// REMOÇÃO DE FUNDO MANUAL (POR COR)
// ========================================
async function removeBackground() {
    if (!uploadedImage) {
        showMessage('⚠️ Selecione uma imagem primeiro!', 'error');
        return;
    }

    const removeBgBtn = document.getElementById('removeBgBtn');
    const modelProgress = document.getElementById('modelProgress');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const progressPercent = document.getElementById('progressPercent');

    removeBgBtn.disabled = true;
    modelProgress.classList.remove('hidden');
    progressText.textContent = 'Removendo fundo...';
    progressBar.style.width = '30%';
    progressPercent.textContent = '30%';

    try {
        console.log('🎨 Removendo fundo manualmente...');
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        canvas.width = uploadedImage.width;
        canvas.height = uploadedImage.height;
        
        ctx.drawImage(uploadedImage, 0, 0);
        
        progressBar.style.width = '50%';
        progressPercent.textContent = '50%';
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        const corners = [
            {r: data[0], g: data[1], b: data[2]},
            {r: data[(canvas.width - 1) * 4], g: data[(canvas.width - 1) * 4 + 1], b: data[(canvas.width - 1) * 4 + 2]},
            {r: data[((canvas.height - 1) * canvas.width) * 4], g: data[((canvas.height - 1) * canvas.width) * 4 + 1], b: data[((canvas.height - 1) * canvas.width) * 4 + 2]},
            {r: data[((canvas.height - 1) * canvas.width + canvas.width - 1) * 4], g: data[((canvas.height - 1) * canvas.width + canvas.width - 1) * 4 + 1], b: data[((canvas.height - 1) * canvas.width + canvas.width - 1) * 4 + 2]}
        ];
        
        const bgR = Math.round((corners[0].r + corners[1].r + corners[2].r + corners[3].r) / 4);
        const bgG = Math.round((corners[0].g + corners[1].g + corners[2].g + corners[3].g) / 4);
        const bgB = Math.round((corners[0].b + corners[1].b + corners[2].b + corners[3].b) / 4);
        
        console.log(`🎨 Cor de fundo detectada: RGB(${bgR}, ${bgG}, ${bgB})`);
        
        const threshold = 80;
        
        progressBar.style.width = '70%';
        progressPercent.textContent = '70%';
        
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            const diff = Math.sqrt(
                Math.pow(r - bgR, 2) +
                Math.pow(g - bgG, 2) +
                Math.pow(b - bgB, 2)
            );
            
            if (diff < threshold) {
                data[i + 3] = 0;
            }
        }
        
        progressBar.style.width = '90%';
        progressPercent.textContent = '90%';
        
        ctx.putImageData(imageData, 0, 0);
        
        progressBar.style.width = '100%';
        progressPercent.textContent = '100%';
        
        const dataUrl = canvas.toDataURL('image/png');
        const img = new Image();
        
        img.onload = function() {
            processedImage = img;
            uploadedImage = img;
            document.getElementById('imagePreview').src = dataUrl;
            document.getElementById('adjustmentSection').classList.remove('hidden');
            
            modelProgress.classList.add('hidden');
            showMessage('✅ Fundo removido com sucesso!', 'success');
            removeBgBtn.disabled = false;
            
            setTimeout(() => {
                progressBar.style.width = '0%';
                progressPercent.textContent = '0%';
            }, 1000);
        };
        
        img.src = dataUrl;

    } catch (error) {
        console.error('❌ Erro:', error);
        modelProgress.classList.add('hidden');
        showMessage('❌ Erro ao remover fundo: ' + error.message, 'error');
        removeBgBtn.disabled = false;
    }
}

// ========================================
// REMOÇÃO DE FUNDO DA SEGUNDA ASSINATURA
// ========================================
async function removeBackground2() {
    if (!uploadedImage2) {
        showMessage('⚠️ Selecione a segunda imagem primeiro!', 'error');
        return;
    }

    const removeBgBtn = document.getElementById('removeBgBtn2');
    const modelProgress = document.getElementById('modelProgress');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const progressPercent = document.getElementById('progressPercent');

    removeBgBtn.disabled = true;
    modelProgress.classList.remove('hidden');
    progressText.textContent = 'Removendo fundo da segunda assinatura...';
    progressBar.style.width = '30%';
    progressPercent.textContent = '30%';

    try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        canvas.width = uploadedImage2.width;
        canvas.height = uploadedImage2.height;
        
        ctx.drawImage(uploadedImage2, 0, 0);
        
        progressBar.style.width = '50%';
        progressPercent.textContent = '50%';
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        const corners = [
            {r: data[0], g: data[1], b: data[2]},
            {r: data[(canvas.width - 1) * 4], g: data[(canvas.width - 1) * 4 + 1], b: data[(canvas.width - 1) * 4 + 2]},
            {r: data[((canvas.height - 1) * canvas.width) * 4], g: data[((canvas.height - 1) * canvas.width) * 4 + 1], b: data[((canvas.height - 1) * canvas.width) * 4 + 2]},
            {r: data[((canvas.height - 1) * canvas.width + canvas.width - 1) * 4], g: data[((canvas.height - 1) * canvas.width + canvas.width - 1) * 4 + 1], b: data[((canvas.height - 1) * canvas.width + canvas.width - 1) * 4 + 2]}
        ];
        
        const bgR = Math.round((corners[0].r + corners[1].r + corners[2].r + corners[3].r) / 4);
        const bgG = Math.round((corners[0].g + corners[1].g + corners[2].g + corners[3].g) / 4);
        const bgB = Math.round((corners[0].b + corners[1].b + corners[2].b + corners[3].b) / 4);
        
        const threshold = 80;
        
        progressBar.style.width = '70%';
        progressPercent.textContent = '70%';
        
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            const diff = Math.sqrt(
                Math.pow(r - bgR, 2) +
                Math.pow(g - bgG, 2) +
                Math.pow(b - bgB, 2)
            );
            
            if (diff < threshold) {
                data[i + 3] = 0;
            }
        }
        
        progressBar.style.width = '90%';
        progressPercent.textContent = '90%';
        
        ctx.putImageData(imageData, 0, 0);
        
        progressBar.style.width = '100%';
        progressPercent.textContent = '100%';
        
        const dataUrl = canvas.toDataURL('image/png');
        const img = new Image();
        
        img.onload = function() {
            processedImage2 = img;
            uploadedImage2 = img;
            document.getElementById('imagePreview2').src = dataUrl;
            
            modelProgress.classList.add('hidden');
            showMessage('✅ Fundo da segunda assinatura removido!', 'success');
            removeBgBtn.disabled = false;
            
            setTimeout(() => {
                progressBar.style.width = '0%';
                progressPercent.textContent = '0%';
            }, 1000);
        };
        
        img.src = dataUrl;

    } catch (error) {
        console.error('❌ Erro:', error);
        modelProgress.classList.add('hidden');
        showMessage('❌ Erro ao remover fundo: ' + error.message, 'error');
        removeBgBtn.disabled = false;
    }
}

function resetAdjustments() {
    adjustments = { 
        contrast: 100, 
        sharpness: 0,
        convertToBlack: false,
        cleanWeakPixels: false,
        autoCrop: false,
        applyPythonFilters: false
    };
    
    document.getElementById('contrast').value = 100;
    document.getElementById('sharpness').value = 0;
    document.getElementById('contrastValue').textContent = '100%';
    document.getElementById('sharpnessValue').textContent = '0';
    
    document.getElementById('convertToBlack').checked = false;
    document.getElementById('cleanWeakPixels').checked = false;
    document.getElementById('autoCrop').checked = false;
    document.getElementById('applyPythonFilters').checked = false;
    
    const manualControls = document.getElementById('manualControls');
    manualControls.style.opacity = '1';
    manualControls.style.pointerEvents = 'auto';
    document.getElementById('contrast').disabled = false;
    document.getElementById('sharpness').disabled = false;
    
    showMessage('✅ Ajustes restaurados!', 'success');
}

function applyFiltersPreview() {
    if (!uploadedImage) {
        showMessage('⚠️ Selecione uma imagem primeiro!', 'error');
        return;
    }

    const loading = document.getElementById('loading');
    loading.style.display = 'block';
    document.getElementById('loadingText').textContent = '🎨 Aplicando filtros...';

    setTimeout(() => {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d', { alpha: true, willReadFrequently: true });
            
            canvas.width = uploadedImage.width;
            canvas.height = uploadedImage.height;
            ctx.drawImage(uploadedImage, 0, 0);

            applyAllFilters(canvas, ctx);

            const previewUrl = canvas.toDataURL('image/png');
            document.getElementById('imagePreview').src = previewUrl;
            
            showMessage('✅ Filtros aplicados no preview!', 'success');
        } catch (error) {
            showMessage('❌ Erro ao aplicar filtros: ' + error.message, 'error');
        } finally {
            loading.style.display = 'none';
        }
    }, 100);
}

async function generateSignature() {
    if (!uploadedImage) {
        showMessage('⚠️ Selecione uma imagem primeiro!', 'error');
        return;
    }

    const doctorName = document.getElementById('doctorName').value.trim();
    const doctorCRM  = document.getElementById('doctorCRM').value.trim();
    const register1  = professionState[1].register;

    if (!doctorName || !doctorCRM) {
        showMessage(`⚠️ Preencha nome e ${register1} da primeira assinatura!`, 'error');
        return;
    }

    const hasSecondSignature = document.getElementById('enableSecondSignature').checked;
    
    if (hasSecondSignature) {
        if (!uploadedImage2) {
            showMessage('⚠️ Selecione a segunda imagem!', 'error');
            return;
        }

        const doctorName2 = document.getElementById('doctorName2').value.trim();
        const doctorCRM2  = document.getElementById('doctorCRM2').value.trim();
        const register2   = professionState[2].register;

        if (!doctorName2 || !doctorCRM2) {
            showMessage(`⚠️ Preencha nome e ${register2} da segunda assinatura!`, 'error');
            return;
        }
    }

    const loading = document.getElementById('loading');
    const loadingText = document.getElementById('loadingText');
    const generateBtn = document.getElementById('generateBtn');

    loading.style.display = 'block';
    loadingText.textContent = '🎨 Gerando assinatura...';
    generateBtn.disabled = true;

    try {
        if (hasSecondSignature) {
            createDoubleSignature(doctorName, doctorCRM);
        } else {
            createFinalSignature(doctorName, doctorCRM);
        }
        showMessage('✅ Assinatura gerada!', 'success');
        document.getElementById('downloadBtn').classList.remove('hidden');
    } catch (error) {
        showMessage('❌ Erro: ' + error.message, 'error');
    } finally {
        loading.style.display = 'none';
        generateBtn.disabled = false;
    }
}

// ========================================
// PROCESSAMENTO DE IMAGEM
// ========================================

function applyContrast(imageData, contrastValue) {
    const data = imageData.data;
    const factor = contrastValue / 100;
    
    for (let i = 0; i < data.length; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];
        
        r = ((r - 128) * factor) + 128;
        g = ((g - 128) * factor) + 128;
        b = ((b - 128) * factor) + 128;
        
        data[i]     = Math.max(0, Math.min(255, r));
        data[i + 1] = Math.max(0, Math.min(255, g));
        data[i + 2] = Math.max(0, Math.min(255, b));
    }
    
    return imageData;
}

function applySharpness(canvas, sharpnessValue) {
    if (sharpnessValue === 0) return canvas;
    
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const width = canvas.width;
    const height = canvas.height;
    
    const originalData = ctx.getImageData(0, 0, width, height);
    
    const blurCanvas = document.createElement('canvas');
    blurCanvas.width = width;
    blurCanvas.height = height;
    const blurCtx = blurCanvas.getContext('2d');
    
    const blurAmount = sharpnessValue > 10 ? '2px' : '1px';
    blurCtx.filter = `blur(${blurAmount})`;
    blurCtx.drawImage(canvas, 0, 0);
    blurCtx.filter = 'none';
    
    const blurredData = blurCtx.getImageData(0, 0, width, height);
    const amount = sharpnessValue / 3;
    
    for (let i = 0; i < originalData.data.length; i += 4) {
        for (let j = 0; j < 3; j++) {
            const diff = originalData.data[i + j] - blurredData.data[i + j];
            originalData.data[i + j] = Math.max(0, Math.min(255, 
                originalData.data[i + j] + diff * amount
            ));
        }
    }
    
    ctx.putImageData(originalData, 0, 0);
    return canvas;
}

function convertToBlackPure(imageData) {
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] > 0) {
            data[i]     = 0;
            data[i + 1] = 0;
            data[i + 2] = 0;
        }
    }
    
    return imageData;
}

function cleanWeakPixels(imageData, threshold = 15) {
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] < threshold) {
            data[i + 3] = 0;
        }
    }
    
    return imageData;
}

function autoCropCanvas(canvas, margin = 15) {
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const width = canvas.width;
    const height = canvas.height;
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    let minX = width, minY = height, maxX = 0, maxY = 0;
    let hasContent = false;
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const i = (y * width + x) * 4;
            if (data[i + 3] > 0) {
                hasContent = true;
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
            }
        }
    }
    
    if (!hasContent) return canvas;
    
    minX = Math.max(0, minX - margin);
    minY = Math.max(0, minY - margin);
    maxX = Math.min(width - 1, maxX + margin);
    maxY = Math.min(height - 1, maxY + margin);
    
    const cropWidth  = maxX - minX + 1;
    const cropHeight = maxY - minY + 1;
    
    const croppedCanvas = document.createElement('canvas');
    croppedCanvas.width = cropWidth;
    croppedCanvas.height = cropHeight;
    croppedCanvas.getContext('2d').drawImage(canvas, minX, minY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
    
    return croppedCanvas;
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
        if (adjustments.sharpness > 0) {
            applySharpness(canvas, adjustments.sharpness);
        }
    }
    
    if (adjustments.cleanWeakPixels) {
        imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        imageData = cleanWeakPixels(imageData, 15);
        ctx.putImageData(imageData, 0, 0);
    }
    
    if (adjustments.convertToBlack) {
        imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        imageData = convertToBlackPure(imageData);
        ctx.putImageData(imageData, 0, 0);
    }
    
    if (adjustments.autoCrop) {
        return autoCropCanvas(canvas, 15);
    }
    
    return canvas;
}

// ========================================
// GERAÇÃO DA ASSINATURA FINAL (SIMPLES)
// ========================================

/**
 * Retorna a fonte selecionada pelo usuário.
 */
function getSelectedFont() {
    const select = document.getElementById('fontSelector');
    return select ? select.value : 'Arial';
}

/**
 * Monta o texto da assinatura usando o registro correto do tipo de profissional.
 */
function buildSignatureText(name, registerValue, registerType, extraPhrase, extraPhrase2) {
    let texto = `${name}\n${registerType}: ${registerValue}`;
    if (extraPhrase)  texto += '\n' + extraPhrase;
    if (extraPhrase2) texto += '\n' + extraPhrase2;
    return texto;
}

function createFinalSignature(doctorName, doctorCRM) {
    const finalCanvas = document.getElementById('previewCanvas');
    const finalCtx = finalCanvas.getContext('2d', { alpha: true });

    finalCanvas.width  = 600;
    finalCanvas.height = 120;
    finalCtx.fillStyle = 'white';
    finalCtx.fillRect(0, 0, 600, 120);

    const imagePreview = document.getElementById('imagePreview');
    if (!imagePreview || !imagePreview.src) return;
    
    const previewImage = new Image();
    previewImage.onload = function() {
        processImageAndDraw(previewImage, finalCanvas, finalCtx, doctorName, doctorCRM);
    };
    previewImage.src = imagePreview.src;
}

function createDoubleSignature(doctorName, doctorCRM) {
    const finalCanvas = document.getElementById('previewCanvas');
    const finalCtx = finalCanvas.getContext('2d', { alpha: true });

    finalCanvas.width  = 600;
    finalCanvas.height = 120;
    finalCtx.fillStyle = 'white';
    finalCtx.fillRect(0, 0, 600, 120);

    const imagePreview1 = document.getElementById('imagePreview');
    const imagePreview2 = document.getElementById('imagePreview2');
    
    if (!imagePreview1?.src || !imagePreview2?.src) return;
    
    const previewImage1 = new Image();
    const previewImage2 = new Image();
    
    let loaded = 0;
    const checkBothLoaded = () => {
        loaded++;
        if (loaded === 2) {
            processDoubleImages(previewImage1, previewImage2, finalCanvas, finalCtx, doctorName, doctorCRM);
        }
    };
    
    previewImage1.onload = checkBothLoaded;
    previewImage2.onload = checkBothLoaded;
    
    previewImage1.src = imagePreview1.src;
    previewImage2.src = imagePreview2.src;
}

function processDoubleImages(sourceImage1, sourceImage2, finalCanvas, finalCtx, doctorName1, doctorCRM1) {
    const tempCanvas1 = document.createElement('canvas');
    const tempCtx1 = tempCanvas1.getContext('2d', { alpha: true, willReadFrequently: true });
    tempCanvas1.width  = sourceImage1.width;
    tempCanvas1.height = sourceImage1.height;
    tempCtx1.drawImage(sourceImage1, 0, 0);
    const processedCanvas1 = applyAllFilters(tempCanvas1, tempCtx1);
    
    const tempCanvas2 = document.createElement('canvas');
    const tempCtx2 = tempCanvas2.getContext('2d', { alpha: true, willReadFrequently: true });
    tempCanvas2.width  = sourceImage2.width;
    tempCanvas2.height = sourceImage2.height;
    tempCtx2.drawImage(sourceImage2, 0, 0);
    const processedCanvas2 = applyAllFilters(tempCanvas2, tempCtx2);
    
    const larguraFinal  = finalCanvas.width;
    const alturaFinal   = finalCanvas.height;
    const maxLargura    = 240;
    const maxAltura     = 50;
    
    const proporcao1 = Math.min(maxLargura / processedCanvas1.width, maxAltura / processedCanvas1.height, 1.0);
    const novaLargura1 = Math.floor(processedCanvas1.width  * proporcao1);
    const novaAltura1  = Math.floor(processedCanvas1.height * proporcao1);
    
    const proporcao2 = Math.min(maxLargura / processedCanvas2.width, maxAltura / processedCanvas2.height, 1.0);
    const novaLargura2 = Math.floor(processedCanvas2.width  * proporcao2);
    const novaAltura2  = Math.floor(processedCanvas2.height * proporcao2);
    
    finalCtx.font      = `bold 11px "${getSelectedFont()}"`;
    finalCtx.fillStyle = 'black';
    finalCtx.textAlign = 'center';

    const doctorName2 = document.getElementById('doctorName2').value.trim();
    const doctorCRM2  = document.getElementById('doctorCRM2').value.trim();

    const addExtra    = document.getElementById('addExtraPhrase').checked;
    const extraPhrase = addExtra ? document.getElementById('extraPhrase').value.trim()  : '';
    const extraPhrase2 = addExtra ? document.getElementById('extraPhrase2').value.trim() : '';

    // Usa o tipo de registro correto para cada profissional
    const texto1 = buildSignatureText(doctorName1, doctorCRM1, professionState[1].register, extraPhrase, '');
    const texto2 = buildSignatureText(doctorName2, doctorCRM2, professionState[2].register, extraPhrase2, '');

    const linhas1 = texto1.split('\n');
    const linhas2 = texto2.split('\n');
    const margemInferior = 5;
    
    // Assinatura 1 (esquerda)
    const alturaConteudo1 = novaAltura1 + margemInferior + linhas1.length * 13;
    const yInicio1  = Math.floor((alturaFinal - alturaConteudo1) / 2);
    const xCentro1  = larguraFinal / 4;
    const xInicio1  = Math.floor(xCentro1 - novaLargura1 / 2);

    // Assinatura 2 (direita)
    const alturaConteudo2 = novaAltura2 + margemInferior + linhas2.length * 13;
    const yInicio2  = Math.floor((alturaFinal - alturaConteudo2) / 2);
    const xCentro2  = (larguraFinal * 3) / 4;
    const xInicio2  = Math.floor(xCentro2 - novaLargura2 / 2);

    finalCtx.imageSmoothingEnabled = true;
    finalCtx.imageSmoothingQuality = 'high';

    finalCtx.drawImage(processedCanvas1, 0, 0, processedCanvas1.width, processedCanvas1.height,
                       xInicio1, yInicio1, novaLargura1, novaAltura1);
    linhas1.forEach((linha, i) => {
        finalCtx.fillText(linha, xCentro1, yInicio1 + novaAltura1 + margemInferior + 11 + (i * 13));
    });

    finalCtx.drawImage(processedCanvas2, 0, 0, processedCanvas2.width, processedCanvas2.height,
                       xInicio2, yInicio2, novaLargura2, novaAltura2);
    linhas2.forEach((linha, i) => {
        finalCtx.fillText(linha, xCentro2, yInicio2 + novaAltura2 + margemInferior + 11 + (i * 13));
    });

    finalCanvas.style.display = 'block';
}

function processImageAndDraw(sourceImage, finalCanvas, finalCtx, doctorName, doctorCRM) {
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d', { alpha: true, willReadFrequently: true });
    tempCanvas.width  = sourceImage.width;
    tempCanvas.height = sourceImage.height;
    tempCtx.drawImage(sourceImage, 0, 0);
    
    const processedCanvas = applyAllFilters(tempCanvas, tempCtx);
    
    const larguraFinal = finalCanvas.width;
    const alturaFinal  = finalCanvas.height;
    const maxLargura   = 280;
    const maxAltura    = 50;
    
    const proporcao   = Math.min(maxLargura / processedCanvas.width, maxAltura / processedCanvas.height, 1.0);
    const novaLargura = Math.floor(processedCanvas.width  * proporcao);
    const novaAltura  = Math.floor(processedCanvas.height * proporcao);
    
    finalCtx.font      = `bold 11px "${getSelectedFont()}"`;
    finalCtx.fillStyle = 'black';
    finalCtx.textAlign = 'center';

    const addExtra     = document.getElementById('addExtraPhrase').checked;
    const extraPhrase  = addExtra ? document.getElementById('extraPhrase').value.trim()  : '';
    const extraPhrase2 = addExtra ? document.getElementById('extraPhrase2').value.trim() : '';

    // Usa o tipo de registro correto
    const texto  = buildSignatureText(doctorName, doctorCRM, professionState[1].register, extraPhrase, extraPhrase2);
    const linhas = texto.split('\n');
    
    const margemInferior  = 5;
    const alturaConteudo  = novaAltura + margemInferior + linhas.length * 13;
    const yInicioAssinatura = Math.floor((alturaFinal - alturaConteudo) / 2);
    const xInicioAssinatura = Math.floor((larguraFinal - novaLargura) / 2);

    finalCtx.imageSmoothingEnabled = true;
    finalCtx.imageSmoothingQuality = 'high';
    finalCtx.drawImage(processedCanvas, 0, 0, processedCanvas.width, processedCanvas.height,
                       xInicioAssinatura, yInicioAssinatura, novaLargura, novaAltura);

    linhas.forEach((linha, i) => {
        finalCtx.fillText(linha, larguraFinal / 2, yInicioAssinatura + novaAltura + margemInferior + 11 + (i * 13));
    });

    finalCanvas.style.display = 'block';
}

function downloadImage() {
    const canvas     = document.getElementById('previewCanvas');
    const doctorName = document.getElementById('doctorName').value.trim() || 'Assinatura';

    canvas.toBlob(function (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href     = url;
        a.download = `Assinatura - ${doctorName}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showMessage('✅ Download iniciado!', 'success');
    }, 'image/png');
}