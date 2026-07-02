// ========================================
// STORAGE — DCM Links
// ========================================

var STORAGE_GRUPOS = [
    { nome: 'Grupo Star',     link: 'https://star.mobilemed.com.br/dcm4chee-arc/ui2/',          obs: '', gestor: '', telefone: '', tamanho: '' },
    { nome: 'Teleimagem',     link: 'https://teleimagem.mobilemed.com.br/dcm4chee-arc/ui2/',     obs: '', gestor: '', telefone: '', tamanho: '' },
    { nome: 'Digimax 30 dias',link: 'https://digimax.mobilemed.com.br/dcm4chee-arc/ui2/',        obs: '30 dias de retenção', gestor: '', telefone: '', tamanho: '' },
    { nome: 'Digimax Interno',link: 'https://digimax.mobilemed.com.br:8001/dcm4chee-arc/ui2/',   obs: 'Acesso interno', gestor: '', telefone: '', tamanho: '' },
    { nome: 'SPX',            link: 'https://spximagem.mobilemed.com.br/dcm4chee-arc/ui2/',      obs: '', gestor: '', telefone: '', tamanho: '' },
    { nome: 'PRN',            link: 'https://prn.mobilemed.com.br/dcm4chee-arc/ui2/',            obs: '', gestor: '', telefone: '', tamanho: '' },
    { nome: 'Geral',          link: 'https://pacsapi.mobilemed.com.br/dcm4chee-arc/ui2/',        obs: '', gestor: '', telefone: '', tamanho: '' },
    { nome: 'OneYear',        link: 'https://pacsoneyear.mobilemed.com.br/dcm4chee-arc/ui2/',    obs: '1 ano de retenção', gestor: '', telefone: '', tamanho: '' },
    { nome: 'MEDICOM',        link: 'https://s3medicom.mobilemed.com.br/dcm4chee-arc/ui2/',      obs: '', gestor: '', telefone: '', tamanho: '' },
    { nome: 'FIDI',           link: 'https://fidi.mobilemed.com.br/dcm4chee-arc/ui2/',           obs: '', gestor: '', telefone: '', tamanho: '' },
];

function storageInit() {
    var el = document.getElementById('storageList');
    var count = document.getElementById('storageCount');
    if (el) el.innerHTML = '<div class="storage-empty-hint"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.4"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><div>Digite o nome do grupo para buscar</div></div>';
    if (count) count.textContent = '10 grupos';
}

function storageFiltrar(q) {
    var clear = document.getElementById('storageSearchClear');
    if (clear) clear.style.display = q ? 'block' : 'none';
    if (!q.trim()) {
        var el = document.getElementById('storageList');
        var count = document.getElementById('storageCount');
        if (el) el.innerHTML = '<div class="storage-empty-hint"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.4"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><div>Digite o nome do grupo para buscar</div></div>';
        if (count) count.textContent = '10 grupos';
        return;
    }
    var lower = q.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
    var filtrado = STORAGE_GRUPOS.filter(function(g) {
        return g.nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').includes(lower)
            || g.link.toLowerCase().includes(lower)
            || (g.obs && g.obs.toLowerCase().includes(lower))
            || (g.gestor && g.gestor.toLowerCase().includes(lower));
    });
    storageRender(filtrado);
}

function storageLimparBusca() {
    var inp = document.getElementById('storageSearch');
    if (inp) inp.value = '';
    var clear = document.getElementById('storageSearchClear');
    if (clear) clear.style.display = 'none';
    storageRender(STORAGE_GRUPOS);
}

function storageRender(lista) {
    var el = document.getElementById('storageList');
    var count = document.getElementById('storageCount');
    if (!el) return;
    if (count) count.textContent = lista.length + ' grupo' + (lista.length !== 1 ? 's' : '');

    if (!lista.length) {
        el.innerHTML = '<div class="qb-empty">Nenhum grupo encontrado.</div>';
        return;
    }

    el.innerHTML = lista.map(function(g, i) {
        var idx = STORAGE_GRUPOS.indexOf(g);

        var badges = '';
        if (g.tamanho) badges += '<span class="storage-badge storage-badge-size">💾 ' + g.tamanho + '</span>';
        if (g.obs)     badges += '<span class="storage-badge storage-badge-obs">📝 ' + g.obs + '</span>';

        var contatos = '';
        if (g.gestor)   contatos += '<div class="storage-info-row"><span class="storage-info-label">👤 Gestor</span><span>' + g.gestor + '</span></div>';
        if (g.telefone) contatos += '<div class="storage-info-row"><span class="storage-info-label">📞 Telefone</span><span>' + g.telefone + '</span></div>';

        return '<div class="storage-card">' +
            '<div class="storage-card-header">' +
                '<div class="storage-card-title">' +
                    '<span class="storage-icon">🗄️</span>' +
                    '<span class="storage-nome">' + g.nome + '</span>' +
                    (badges ? '<div class="storage-badges">' + badges + '</div>' : '') +
                '</div>' +
                '<div class="storage-card-actions">' +
                    '<a href="' + g.link + '" target="_blank" class="storage-btn storage-btn-open">' +
                        '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>' +
                        'Abrir DCM' +
                    '</a>' +
                    '<button class="storage-btn storage-btn-copy" onclick="storageCopiarLink(' + idx + ', this)">' +
                        '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>' +
                        'Copiar Link' +
                    '</button>' +
                '</div>' +
            '</div>' +
            '<div class="storage-link-row">' +
                '<code class="storage-link-code">' + g.link + '</code>' +
            '</div>' +
            (contatos ? '<div class="storage-contatos">' + contatos + '</div>' : '') +
        '</div>';
    }).join('');
}

function storageCopiarLink(idx, btn) {
    var g = STORAGE_GRUPOS[idx];
    if (!g) return;
    navigator.clipboard.writeText(g.link).then(function() {
        var orig = btn.innerHTML;
        btn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#38ef7d" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Copiado!';
        btn.style.background = 'rgba(17,153,142,0.45)';
        setTimeout(function() {
            btn.innerHTML = orig;
            btn.style.background = '';
        }, 1800);
    });
}
