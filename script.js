document.addEventListener('DOMContentLoaded', () => {
    let uploadedImage = null;
    let processedImage = null;

    // Atualiza o valor do threshold em tempo real
    const thresholdEl = document.getElementById('threshold');
    if (thresholdEl) {
        thresholdEl.addEventListener('input', function(e) {
            const v = e.target.value;
            const out = document.getElementById('thresholdValue');
            if (out) out.textContent = v;
        });
    }

    // Checkbox para mostrar/ocultar campos de frase extra
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

    // Upload de arquivo
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        fileInput.addEventListener('change', function (e) {
            const file = e.target.files[0];
            if (file) {
                const fileNameEl = document.getElementById('fileName');
                if (fileNameEl) fileNameEl.textContent = `📄 ${file.name}`;

                const reader = new FileReader();
                reader.onload = function (event) {
                    const img = new Image();
                    img.onload = function () {
                        uploadedImage = img;

                        // Mostra preview
                        const imagePreview = document.getElementById('imagePreview');
                        const imagePreviewContainer = document.getElementById('imagePreviewContainer');
                        if (imagePreview) imagePreview.src = event.target.result;
                        if (imagePreviewContainer) imagePreviewContainer.style.display = 'block';
                        const removeBgBtn = document.getElementById('removeBgBtn');
                        if (removeBgBtn) removeBgBtn.classList.remove('hidden');
                        const thresholdGroup = document.getElementById('thresholdGroup');
                        if (thresholdGroup) thresholdGroup.classList.remove('hidden');

                        showMessage('Imagem carregada com sucesso! Você pode remover o fundo se necessário.', 'success');
                    };
                    img.src = event.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    function showMessage(text, type) {
        const container = document.getElementById('messageContainer');
        if (!container) return;
        container.innerHTML = `<div class="message message-${type}">${text}</div>`;
        setTimeout(() => {
            container.innerHTML = '';
        }, 5000);
    }

    async function removeBackground() {
        if (!uploadedImage) {
            showMessage('❌ Por favor, selecione uma imagem primeiro!', 'error');
            return;
        }

        const loading = document.getElementById('loading');
        const loadingText = document.getElementById('loadingText');
        const removeBgBtn = document.getElementById('removeBgBtn');

        if (loading) loading.style.display = 'block';
        if (loadingText) loadingText.textContent = '🎨 Removendo fundo... Isso pode levar alguns segundos.';
        if (removeBgBtn) removeBgBtn.disabled = true;

        try {
            // Redimensiona imagem grande para performance
            const maxDimension = 2000;
            let width = uploadedImage.width;
            let height = uploadedImage.height;
            
            if (width > maxDimension || height > maxDimension) {
                const scale = Math.min(maxDimension / width, maxDimension / height);
                width = Math.floor(width * scale);
                height = Math.floor(height * scale);
            }

            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
            tempCanvas.width = width;
            tempCanvas.height = height;
            tempCtx.drawImage(uploadedImage, 0, 0, width, height);

            const imageData = tempCtx.getImageData(0, 0, width, height);
            const data = imageData.data;

            // Amostra múltiplos pontos das bordas
            const bgSamples = [
                { x: 0, y: 0 },
                { x: width - 1, y: 0 },
                { x: 0, y: height - 1 },
                { x: width - 1, y: height - 1 },
                { x: Math.floor(width / 2), y: 0 }
            ];

            // Calcula cor média do fundo
            let totalR = 0, totalG = 0, totalB = 0;
            bgSamples.forEach(sample => {
                const idx = (sample.y * width + sample.x) * 4;
                totalR += data[idx];
                totalG += data[idx + 1];
                totalB += data[idx + 2];
            });

            const bgColor = {
                r: Math.floor(totalR / bgSamples.length),
                g: Math.floor(totalG / bgSamples.length),
                b: Math.floor(totalB / bgSamples.length)
            };

            const threshold = parseInt(document.getElementById('threshold')?.value ?? '50', 10);

            // Processamento em chunks
            const chunkSize = 50000;
            const totalPixels = width * height;
            
            for (let start = 0; start < totalPixels; start += chunkSize) {
                const end = Math.min(start + chunkSize, totalPixels);
                
                for (let i = start; i < end; i++) {
                    const idx = i * 4;
                    const r = data[idx];
                    const g = data[idx + 1];
                    const b = data[idx + 2];
                    
                    // Distância euclidiana
                    const diff = Math.sqrt(
                        Math.pow(r - bgColor.r, 2) +
                        Math.pow(g - bgColor.g, 2) +
                        Math.pow(b - bgColor.b, 2)
                    );
                    
                    if (diff < threshold) {
                        data[idx + 3] = 0;
                    } else if (diff < threshold * 1.5) {
                        data[idx + 3] = Math.floor(255 * (diff - threshold) / (threshold * 0.5));
                    }
                }
                
                if (end < totalPixels) {
                    // Permite que o browser atualize a UI
                    await new Promise(resolve => setTimeout(resolve, 0));
                }
            }

            tempCtx.putImageData(imageData, 0, 0);

            const img = new Image();
            img.onload = function () {
                uploadedImage = img;
                const preview = document.getElementById('imagePreview');
                if (preview) preview.src = tempCanvas.toDataURL('image/png');
                showMessage('✅ Fundo removido com sucesso!', 'success');
                if (loading) loading.style.display = 'none';
                if (removeBgBtn) removeBgBtn.disabled = false;
            };
            img.src = tempCanvas.toDataURL('image/png');

        } catch (error) {
            console.error('Erro detalhado:', error);
            showMessage('❌ Erro ao remover fundo: ' + (error.message || error), 'error');
            const loading = document.getElementById('loading');
            const removeBgBtn = document.getElementById('removeBgBtn');
            if (loading) loading.style.display = 'none';
            if (removeBgBtn) removeBgBtn.disabled = false;
        }
    }

    // Geração e processamento da assinatura
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
        const loadingText = document.getElementById('loadingText');
        const generateBtn = document.getElementById('generateBtn');

        if (loading) loading.style.display = 'block';
        if (loadingText) loadingText.textContent = 'Processando imagem...';
        if (generateBtn) generateBtn.disabled = true;

        try {
            await processImage();
            createFinalSignature(doctorName, doctorCRM);
            showMessage('✅ Assinatura gerada com sucesso!', 'success');
            const downloadBtn = document.getElementById('downloadBtn');
            if (downloadBtn) downloadBtn.classList.remove('hidden');
        } catch (error) {
            showMessage('❌ Erro ao processar imagem: ' + (error.message || error), 'error');
        } finally {
            if (loading) loading.style.display = 'none';
            if (generateBtn) generateBtn.disabled = false;
        }
    }

    async function processImage() {
        const removeFilters = document.getElementById('removeFilters')?.checked ?? false;

        return new Promise((resolve) => {
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');

            tempCanvas.width = uploadedImage.width;
            tempCanvas.height = uploadedImage.height;
            tempCtx.drawImage(uploadedImage, 0, 0);

            const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
            const data = imageData.data;

            if (removeFilters) {
                for (let i = 0; i < data.length; i += 4) {
                    const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
                    if (brightness > 240) data[i + 3] = 0;
                }
            } else {
                for (let i = 0; i < data.length; i += 4) {
                    const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
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

        let texto = `${doctorName}\nCRM: ${doctorCRM}`;
        const addExtra = document.getElementById('addExtraPhrase').checked;

        if (addExtra) {
            const extraPhrase = document.getElementById('extraPhrase').value.trim();
            const extraPhrase2 = document.getElementById('extraPhrase2').value.trim();

            if (extraPhrase) texto += '\n' + extraPhrase;
            if (extraPhrase2) texto += '\n' + extraPhrase2;
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
        const doctorName = document.getElementById('doctorName').value.trim() || 'Assinatura';

        canvas.toBlob(function (blob) {
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

    // Expõe funções no escopo global para serem chamadas pelos botões inline no HTML
    window.removeBackground = removeBackground;
    window.generateSignature = generateSignature;
    window.downloadImage = downloadImage;
});
