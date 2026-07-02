// ========================================
// DIAGNÓSTICO IA — proxy Vercel → Gemini
// ========================================

var IA_SYSTEM_PROMPT = [
    'Você é um especialista em suporte técnico de sistemas de PACS e telerradiologia da Mobilemed.',
    'Seu papel é ajudar técnicos de suporte a diagnosticar e resolver problemas rapidamente.',
    '',
    'Contexto do ambiente Mobilemed:',
    '- Sistema PACS: dcm4chee-arc (WildFly/JBoss)',
    '- Bancos suportados: SQL Server, MySQL, PostgreSQL, Firebird',
    '- Portas padrão: DICOM 104, Worklist 1105, HTTP 8080, HTTPS 8443',
    '- Portal de laudos: laudos.mobilemed.com.br',
    '- Portal vet: portal.mobilemedvet.com.br',
    '- Routers: Mobilemed Router e Worklist Router (Windows)',
    '- Acesso remoto: AnyDesk / TeamViewer',
    '',
    'Diretrizes:',
    '- Seja objetivo e prático — o técnico está em atendimento',
    '- Estruture respostas com passos numerados quando for diagnóstico',
    '- Inclua comandos prontos para copiar quando relevante',
    '- Priorize as causas mais comuns antes das raras'
].join('\n');

var iaHistorico  = [];
var iaCarregando = false;

function iaEnviar() {
    if (iaCarregando) return;
    var inputEl = document.getElementById('ia_input');
    var texto   = inputEl ? inputEl.value.trim() : '';
    if (!texto) return;

    iaAdicionarMsg('user', texto);
    inputEl.value = '';
    iaHistorico.push({ role: 'user', content: texto });

    iaCarregando = true;
    var sendBtn = document.getElementById('ia_send_btn');
    if (sendBtn) sendBtn.disabled = true;
    iaAdicionarMsg('assistant', '...', 'ia-loading-msg');

    fetch('/api/ia-diagnostico', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            system:   IA_SYSTEM_PROMPT,
            messages: iaHistorico
        })
    })
    .then(function(r) { return r.json(); })
    .then(function(data) {
        var loadingEl = document.getElementById('ia-loading-msg');
        if (loadingEl) loadingEl.remove();
        if (data.error) { iaAdicionarMsg('assistant', '⚠️ Erro: ' + data.error); return; }
        var resposta = (data.content && data.content[0] && data.content[0].text) || 'Sem resposta.';
        iaAdicionarMsg('assistant', resposta);
        iaHistorico.push({ role: 'assistant', content: resposta });
    })
    .catch(function() {
        var loadingEl = document.getElementById('ia-loading-msg');
        if (loadingEl) loadingEl.remove();
        iaAdicionarMsg('assistant', '⚠️ Erro ao conectar. Verifique se o deploy está atualizado e a GROQ_API_KEY está configurada no Vercel.');
    })
    .finally(function() {
        iaCarregando = false;
        if (sendBtn) sendBtn.disabled = false;
    });
}

function iaAdicionarMsg(role, texto, id) {
    var container = document.getElementById('ia_messages');
    if (!container) return;
    var div = document.createElement('div');
    div.className = 'ia-msg ia-msg-' + role;
    if (id) div.id = id;
    var content = document.createElement('div');
    content.className = 'ia-msg-content';
    if (role === 'assistant' && texto !== '...') {
        content.innerHTML = iaFormatarTexto(texto);
    } else {
        content.textContent = texto;
    }
    div.appendChild(content);
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

function iaFormatarTexto(texto) {
    texto = escapeHtml(texto);
    return texto
        .replace(/```(\w*)\n?([\s\S]*?)```/g, '<pre class="ia-code-block"><code>$2</code></pre>')
        .replace(/`([^`]+)`/g, '<code class="ia-code-inline">$1</code>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/^\d+\.\s(.+)$/gm, '<div class="ia-list-item">$1</div>')
        .replace(/^[•\-]\s(.+)$/gm, '<div class="ia-list-item">• $1</div>')
        .replace(/\n\n/g, '<br><br>')
        .replace(/\n/g, '<br>');
}

function iaLimpar() {
    iaHistorico = [];
    var container = document.getElementById('ia_messages');
    if (!container) return;
    container.innerHTML =
        '<div class="ia-msg ia-msg-assistant">' +
        '<div class="ia-msg-content">Conversa limpa. Pode descrever o novo problema!</div>' +
        '</div>';
}
