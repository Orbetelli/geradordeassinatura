let uploadedImage = null;
let processedImage = null;

// Checkbox para mostrar/ocultar campos de frase extra
document.getElementById('addExtraPhrase').addEventListener('change', function(e) {
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

// Upload de arquivo
document.getElementById('fileInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        document.getElementById('fileName').textContent = `📄 ${file.name}`;
        const reader = new FileReader();
        reader.onload = function(event) {
            const img = new Image();
            img.onload = function() {
                uploadedImage = img;
                showMessage('Imagem carregada com sucesso!', 'success');
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
});

function showMessage(text, type) {
    const container = document.getElementById('messageContainer');
    container.innerHTML = `<div class="message message-${type}">${text}</div>`;
    setTimeout(() => {
        container.innerHTML = '';
    }, 3000);
}

async function generateSignature() {
    if (!uploadedImage) {
        showMessage('❌ Por favor, selecione uma imagem primeiro!', 'error');
        return;
    }

    const doctorName = document.getElementById('doctorName').value.trim();
    const doctorCRM = document.getElementById('doctorCRM').value.trim();

    if (!doctorName || !doctorCRM) {
        showMessage('❌ Por favor, preencha o nome e CRM!', 'error');
        return;
    }

    const loading = document.getElementById('loading');
    const generateBtn = document.getElementById('generateBtn');
    
    loading.style.display = 'block';
    generateBtn.disabled = true;

    try {
        await processImage();
        createFinalSignature(doctorName, doctorCRM);
        showMessage('✅ Assinatura gerada com sucesso!', 'success');
        document.getElementById('downloadBtn').classList.remove('hidden');
    } catch (error) {
        showMessage('❌ Erro ao processar imagem: ' + error.message, 'error');
    } finally {
        loading.style.display = 'none';
        generateBtn.disabled = false;
    }
}

async function processImage() {
    return new Promise((resolve) => {
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        
        tempCanvas.width = uploadedImage.width;
        tempCanvas.height = uploadedImage.height;
        
        tempCtx.drawImage(uploadedImage, 0, 0);
        
        const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const brightness = (r + g + b) / 3;
            
            if (brightness > 200) {
                data[i + 3] = 0;
            } else if (data[i + 3] > 25) {
                data[i] = 0;
                data[i + 1] = 0;
                data[i + 2] = 0;
                data[i + 3] = 250;
            } else {
                data[i + 3] = 0;
            }
        }
        
        tempCtx.putImageData(imageData, 0, 0);
        
        const bounds = getImageBounds(imageData);
        if (bounds) {
            const margin = 10;
            const cropCanvas = document.createElement('canvas');
            const cropCtx = cropCanvas.getContext('2d');
            
            const cropWidth = bounds.right - bounds.left + margin * 2;
            const cropHeight = bounds.bottom - bounds.top + margin * 2;
            
            cropCanvas.width = cropWidth;
            cropCanvas.height = cropHeight;
            
            cropCtx.drawImage(
                tempCanvas,
                bounds.left - margin,
                bounds.top - margin,
                cropWidth,
                cropHeight,
                0,
                0,
                cropWidth,
                cropHeight
            );
            
            processedImage = cropCanvas;
        } else {
            processedImage = tempCanvas;
        }
        
        resolve();
    });
}

function getImageBounds(imageData) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    
    let minX = width, minY = height, maxX = 0, maxY = 0;
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const alpha = data[(y * width + x) * 4 + 3];
            if (alpha > 25) {
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
            }
        }
    }
    
    if (minX < maxX && minY < maxY) {
        return { left: minX, top: minY, right: maxX, bottom: maxY };
    }
    return null;
}

function createFinalSignature(doctorName, doctorCRM) {
    const canvas = document.getElementById('previewCanvas');
    const ctx = canvas.getContext('2d');
    
    const larguraFinal = 480;
    const alturaFinal = 120;
    
    canvas.width = larguraFinal;
    canvas.height = alturaFinal;
    
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, larguraFinal, alturaFinal);
    
    ctx.font = 'bold 11px Arial';
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';
    
    // Monta texto com suporte a múltiplas linhas
    let texto = `${doctorName}\nCRM: ${doctorCRM}`;
    const addExtra = document.getElementById('addExtraPhrase').checked;
    
    if (addExtra) {
        const extraPhrase = document.getElementById('extraPhrase').value.trim();
        const extraPhrase2 = document.getElementById('extraPhrase2').value.trim();
        
        if (extraPhrase) {
            texto += '\n' + extraPhrase;
        }
        
        if (extraPhrase2) {
            texto += '\n' + extraPhrase2;
        }
    }
    
    const linhas = texto.split('\n');
    const alturaTexto = linhas.length * 13;
    
    const maxLarguraAssinatura = 280;
    const maxAlturaAssinatura = 50;
    
    const proporcao = Math.min(
        maxLarguraAssinatura / processedImage.width,
        maxAlturaAssinatura / processedImage.height
    );
    
    const novaLargura = Math.floor(processedImage.width * proporcao);
    const novaAltura = Math.floor(processedImage.height * proporcao);
    
    const margemInferior = 5;
    const alturaConteudo = novaAltura + margemInferior + alturaTexto;
    const yInicioAssinatura = Math.floor((alturaFinal - alturaConteudo) / 2);
    const xInicioAssinatura = Math.floor((larguraFinal - novaLargura) / 2);
    
    ctx.drawImage(processedImage, xInicioAssinatura, yInicioAssinatura, novaLargura, novaAltura);
    
    const yTexto = yInicioAssinatura + novaAltura + margemInferior + 11;
    linhas.forEach((linha, i) => {
        ctx.fillText(linha, larguraFinal / 2, yTexto + (i * 13));
    });
    
    canvas.style.display = 'block';
}

function downloadImage() {
    const canvas = document.getElementById('previewCanvas');
    const doctorName = document.getElementById('doctorName').value.trim();
    
    canvas.toBlob(function(blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Assinatura - ${doctorName}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showMessage('✅ Download iniciado!', 'success');
    });
}