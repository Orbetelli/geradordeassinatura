let uploadedImage = null;
let processedImage = null;

// Atualiza o valor do threshold
document.getElementById('threshold').addEventListener('input', e => {
    document.getElementById('thresholdValue').textContent = e.target.value;
});

// Mostrar/ocultar campos extras
document.getElementById('addExtraPhrase').addEventListener('change', e => {
    const extra1 = document.getElementById('extraPhraseGroup');
    const extra2 = document.getElementById('extraPhrase2Group');
    if (e.target.checked) {
        extra1.classList.remove('hidden');
        extra2.classList.remove('hidden');
    } else {
        extra1.classList.add('hidden');
        extra2.classList.add('hidden');
        document.getElementById('extraPhrase').value = '';
        document.getElementById('extraPhrase2').value = '';
    }
});

// Upload da imagem
document.getElementById('fileInput').addEventListener('change', e => {
    const file = e.target.files[0];
    if (file) {
        document.getElementById('fileName').textContent = `📄 ${file.name}`;
        const reader = new FileReader();
        reader.onload = event => {
            const img = new Image();
            img.onload = function () {
                uploadedImage = img;
                document.getElementById('imagePreview').src = event.target.result;
                document.getElementById('imagePreviewContainer').style.display = 'block';
                document.getElementById('removeBgBtn').classList.remove('hidden');
                document.getElementById('thresholdGroup').classList.remove('hidden');
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
    setTimeout(() => container.innerHTML = '', 5000);
}

// Funções removeBackground(), generateSignature(), processImage(), etc.
// (Todo o conteúdo JS original segue igual aqui.)
