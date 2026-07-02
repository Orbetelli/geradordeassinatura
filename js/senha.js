// ========================================
// GERADOR DE SENHA
// ========================================

var pwSavedUsers = [];

function toggleEmailManual(on) {
    document.getElementById('pwModoAuto').style.display   = on ? 'none'  : 'block';
    document.getElementById('pwModoManual').style.display = on ? 'block' : 'none';
    if (on) {
        document.getElementById('pwNomeManual').value      = '';
        document.getElementById('pwEmailManualInput').value = '';
    } else {
        document.getElementById('pwNomes').value = '';
        pwAtualizarContador();
    }
}

function pwAtualizarContador() {
    var nomes=pwParsearNomes(), el=document.getElementById('pwNomeCount');
    if (el) el.textContent = nomes.length + ' nome' + (nomes.length!==1?'s':'');
}

function pwAtualizarPreview() {
    var dominio=document.getElementById('pwDominio').value||'mobilemed.com.br';
    var el=document.getElementById('pwDominioPreview');
    if (el) el.textContent=dominio;
}

function pwNomeParaEmail(nome) {
    var trimmed=nome.trim();
    if (trimmed.includes('.')) {
        return trimmed.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9.]/g,'');
    }
    return trimmed.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z\s]/g,'').trim().split(/\s+/).join('.');
}

function pwParsearNomes() {
    var textarea=document.getElementById('pwNomes');
    if (!textarea) return [];
    return textarea.value.split('\n').map(function(n){return n.trim();}).filter(function(n){return n.length>0;});
}

function pwRand(arr) { return arr[Math.floor(Math.random()*arr.length)]; }

function pwGerarSenha(len,useSpecial,upperOnly) {
    var lower='abcdefghijklmnopqrstuvwxyz',upper='ABCDEFGHIJKLMNOPQRSTUVWXYZ',digits='0123456789',special='@$&';
    var chars=upperOnly?upper+digits:lower+upper+digits;
    if (useSpecial) chars+=special;
    var mandatory=[];
    if (!upperOnly) mandatory.push(pwRand(lower));
    mandatory.push(pwRand(upper)); mandatory.push(pwRand(digits));
    if (useSpecial) mandatory.push(pwRand(special));
    var rest=len-mandatory.length; if(rest<0)rest=0;
    for(var i=0;i<rest;i++) mandatory.push(pwRand(chars));
    for(var i=mandatory.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=mandatory[i];mandatory[i]=mandatory[j];mandatory[j]=t;}
    return mandatory.join('');
}

// Gerador individual (Geral)
function pwGerarSenhas() {
    var prefix     = document.getElementById('pwPrefix').value || 'Mobile';
    var qty        = +document.getElementById('pwQty').value;
    var len        = +document.getElementById('pwLen').value;
    var useSpecial = document.getElementById('pwSpecial').checked;
    var upperOnly  = document.getElementById('pwUpper').checked;
    var list       = document.getElementById('pwList');
    list.innerHTML = '';

    for (var i = 0; i < qty; i++) {
        var senha = prefix + '@' + pwGerarSenha(len, useSpecial, upperOnly);
        var div   = document.createElement('div');
        div.className = 'pw-password-item';
        div.setAttribute('data-senha', senha);
        div.innerHTML =
            '<span>' + senha + '</span>' +
            '<button onclick="pwRegenOne(this,\'' + prefix + '\',' + len + ',' + useSpecial + ',' + upperOnly + ')" title="Regerar">' +
            '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
            '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg></button>' +
            '<button onclick="pwSalvarGeral(this)" title="Salvar">' +
            '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
            '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>' +
            '<polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg></button>' +
            '<button onclick="pwCopiar(this)" title="Copiar">' +
            '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
            '<rect x="9" y="9" width="13" height="13" rx="2"/>' +
            '<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button>';
        list.appendChild(div);
    }
}

function pwSalvarGeral(btn) {
    var item = btn;
    while (item) {
        if (item.classList && item.classList.contains('pw-password-item')) break;
        item = item.parentElement;
    }
    if (!item) return;

    var senha      = item.getAttribute('data-senha') || item.querySelector('span').textContent.trim();
    var nomeEl     = document.getElementById('pwGeralNome');
    var emailEl    = document.getElementById('pwGeralEmail');
    var nomeFinal  = (nomeEl  && nomeEl.value.trim())  ? nomeEl.value.trim()  : 'Sem nome';
    var emailFinal = (emailEl && emailEl.value.trim()) ? emailEl.value.trim() : '—';

    var existe = pwSavedUsers.some(function(s) { return s.password === senha; });
    if (existe) {
        var btnEl = btn;
        while (btnEl && btnEl.tagName !== 'BUTTON') { btnEl = btnEl.parentElement; }
        if (btnEl) pwGeralFeedback(btnEl, '✅');
        return;
    }

    pwSavedUsers.push({
        name:     nomeFinal,
        email:    emailFinal,
        password: senha,
        date:     new Date().toLocaleDateString('pt-BR')
    });

    var total = pwSavedUsers.length;
    var sc  = document.getElementById('savedCount');
    var scg = document.getElementById('savedCountGeral');
    if (sc)  sc.textContent  = total;
    if (scg) scg.textContent = total;
    pwRenderUsers();

    var btnEl = btn;
    while (btnEl && btnEl.tagName !== 'BUTTON') { btnEl = btnEl.parentElement; }
    if (btnEl) pwGeralFeedback(btnEl, '✅');
}

function pwGeralFeedback(btn, icon) {
    if (!btn) return;
    var orig = btn.innerHTML;
    btn.innerHTML = icon;
    setTimeout(function() { btn.innerHTML = orig; }, 1500);
}

function pwRegenOne(btn, prefix, len, useSpecial, upperOnly) {
    var item = btn.closest('.pw-password-item');
    var nova = prefix + '@' + pwGerarSenha(len, useSpecial, upperOnly);
    item.querySelector('span').textContent = nova;
    item.setAttribute('data-senha', nova);
    item.style.animation = 'none';
    requestAnimationFrame(function() { item.style.animation = 'fadeIn 0.3s ease'; });
}

// Gerador de implantação em lote
function pwGerarImplantacao() {
    var prefix     = document.getElementById('pwPrefixImp').value || 'Mobile';
    var len        = +document.getElementById('pwLenImp').value;
    var useSpecial = document.getElementById('pwSpecialImp').checked;
    var upperOnly  = document.getElementById('pwUpperImp').checked;
    var emailManual = document.getElementById('pwEmailManual').checked;
    var list        = document.getElementById('pwListImp');
    list.innerHTML  = '';

    if (emailManual) {
        var nomeManual     = document.getElementById('pwNomeManual').value.trim();
        var emailManualVal = document.getElementById('pwEmailManualInput').value.trim();
        if (!nomeManual || !emailManualVal) { alert('Preencha o nome e o e-mail completo do usuário.'); return; }
        if (!emailManualVal.includes('@'))  { alert('Digite um e-mail válido com @.'); return; }
        var senha = prefix + '@' + pwGerarSenha(len, useSpecial, upperOnly);
        list.appendChild(pwCriarItemImp(nomeManual, emailManualVal, senha));
        pwSavedUsers.push({ name: nomeManual, email: emailManualVal, password: senha, date: new Date().toLocaleDateString('pt-BR') });
        document.getElementById('savedCount').textContent = pwSavedUsers.length;
        pwRenderUsers();
        return;
    }

    var nomes   = pwParsearNomes();
    var dominio = document.getElementById('pwDominio').value.trim() || 'mobilemed.com.br';
    if (!nomes.length) { alert('Digite pelo menos um nome.'); return; }
    nomes.forEach(function(nome) {
        var email = pwNomeParaEmail(nome) + '@' + dominio;
        var senha = prefix + '@' + pwGerarSenha(len, useSpecial, upperOnly);
        list.appendChild(pwCriarItemImp(nome, email, senha));
        pwSavedUsers.push({ name: nome, email: email, password: senha, date: new Date().toLocaleDateString('pt-BR') });
    });
    document.getElementById('savedCount').textContent = pwSavedUsers.length;
    pwRenderUsers();
}

function pwCriarItemImp(nome, email, senha) {
    var div = document.createElement('div');
    div.className = 'pw-password-item pw-implantacao-item';
    div.innerHTML =
        '<div style="flex:1;min-width:0;">' +
        '<div style="font-size:12px;opacity:0.7;margin-bottom:2px;">' + nome + '</div>' +
        '<div style="font-size:13px;word-break:break-all;">' + email + '</div>' +
        '<div style="font-family:Courier New,monospace;font-size:14px;margin-top:2px;">' + senha + '</div>' +
        '</div>' +
        '<button onclick="pwCopiarItemCredencial(this)" data-email="' + email + '" data-senha="' + senha + '">' +
        '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
        '<rect x="9" y="9" width="13" height="13" rx="2"/>' +
        '<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>' +
        '</svg></button>';
    return div;
}

function pwCopiarItemCredencial(btn) {
    navigator.clipboard.writeText('Email: '+btn.dataset.email+' | Senha: '+btn.dataset.senha).then(function(){
        var orig=btn.innerHTML;
        btn.innerHTML='<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#38ef7d" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>';
        setTimeout(function(){btn.innerHTML=orig;},1500);
    });
}

function pwCopiar(btn) {
    var text=btn.closest('.pw-password-item').querySelector('span').textContent;
    navigator.clipboard.writeText(text).then(function(){
        btn.classList.add('copied');
        btn.innerHTML='<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>';
        setTimeout(function(){
            btn.classList.remove('copied');
            btn.innerHTML='<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
        },1500);
    });
}

function pwRenderUsers() {
    var list=document.getElementById('pwUserList');
    var actions=document.getElementById('pwModalActions');
    var total = pwSavedUsers.length;
    var sc  = document.getElementById('savedCount');
    var scg = document.getElementById('savedCountGeral');
    if (sc)  sc.textContent  = total;
    if (scg) scg.textContent = total;
    if (!pwSavedUsers.length) {
        list.innerHTML='<div class="pw-empty">Nenhum usuário salvo ainda.</div>';
        actions.style.display='none';
        document.getElementById('pwMsgSection').style.display = 'none';
        return;
    }
    actions.style.display='flex';
    document.getElementById('pwMsgSection').style.display = 'block';
    list.innerHTML=pwSavedUsers.map(function(u,i){
        return '<div class="pw-user-item">'+
            '<div style="min-width:0;flex:1;">'+
            '<div style="font-weight:600;">'+u.name+'</div>'+
            '<div class="uemail">'+u.email+' · '+u.date+'</div>'+
            '<div style="font-family:\'Courier New\',monospace;font-size:12px;margin-top:3px;opacity:0.85;letter-spacing:0.5px;">'+u.password+'</div>'+
            '</div>'+
            '<div class="uactions">'+
            '<button onclick="navigator.clipboard.writeText(\''+u.password+'\')">Copiar senha</button>'+
            '<button class="del-btn" onclick="pwRemoveUser('+i+')">Remover</button>'+
            '</div></div>';
    }).join('');
}

function pwCopiarCredenciais() {
    if (!pwSavedUsers.length) return;
    var texto=pwSavedUsers.map(function(u){return 'Email: '+u.email+' | Senha: '+u.password;}).join('\n');
    navigator.clipboard.writeText(texto).then(function(){pwFeedbackBtn('.pw-btn-credenciais','Copiado!');});
}

var PW_PORTAIS = {
    'mobilemed':    'laudos.mobilemed.com.br/login',
    'mobilemedvet': 'portal.mobilemedvet.com.br/exames'
};

function pwGetPortal() {
    var sel = document.getElementById('pwPortalSelect');
    return sel ? (PW_PORTAIS[sel.value] || PW_PORTAIS['mobilemed']) : PW_PORTAIS['mobilemed'];
}

function pwSelecionarPortal(valor, btn) {
    var input = document.getElementById('pwPortalSelect');
    if (input) input.value = valor;
    document.querySelectorAll('.pw-portal-btn').forEach(function(b) { b.classList.remove('active'); });
    if (btn) btn.classList.add('active');
}

function pwGetMsgPadrao() {
    var portal = pwGetPortal();
    return [
        'Seja bem-vindo(a) ao nosso sistema de Telerradiologia MobileMed!',
        'Seguem abaixo as informacoes necessarias para o seu primeiro acesso:',
        '',
        'Portal: ' + portal,
        'Login (e-mail): {email}',
        'Senha Temporaria: {senha}',
        '',
        'Atenciosamente,',
        'Equipe MobileMed'
    ].join('\n');
}

var PW_MSG_PADRAO = [
    'Seja bem-vindo(a) ao nosso sistema de Telerradiologia MobileMed!',
    'Seguem abaixo as informacoes necessarias para o seu primeiro acesso:',
    '',
    'Portal: laudos.mobilemed.com.br/login',
    'Login (e-mail): {email}',
    'Senha Temporaria: {senha}',
    '',
    'Atenciosamente,',
    'Equipe MobileMed'
].join('\n');

function pwCarregarMensagemPadrao() {
    var editor = document.getElementById('pwMsgEditor') || document.getElementById('pwMensagemCustom');
    if (!editor) return;
    editor.value = pwGetMsgPadrao();
}

function pwToggleMensagemEditor() {
    var ed = document.getElementById('pwMensagemEditor');
    var ic = document.getElementById('pwMsgToggleIcon');
    if (!ed) return;
    var open = ed.style.display !== 'none';
    ed.style.display = open ? 'none' : 'block';
    if (ic) ic.textContent = open ? '▼' : '▲';
}

function pwLimparMensagem() {
    var ed = document.getElementById('pwMensagemCustom');
    if (ed) ed.value = '';
}

function pwCopiarMensagemCustom() {
    if (!pwSavedUsers.length) return;
    var ed = document.getElementById('pwMensagemCustom');
    var template = ed && ed.value.trim() ? ed.value : pwGetMsgPadrao();
    var partes = pwSavedUsers.map(function(u) {
        return template.split('{nome}').join(u.name).split('{email}').join(u.email).split('{senha}').join(u.password);
    });
    navigator.clipboard.writeText(partes.join('\n\n---\n\n')).then(function() {
        pwFeedbackBtn('.pw-btn-exportcsv', 'Copiado!');
    });
}

function pwCopiarMensagem() {
    if (!pwSavedUsers.length) return;
    var editor   = document.getElementById('pwMsgEditor');
    var template = editor && editor.value.trim() ? editor.value : pwGetMsgPadrao();
    var partes   = pwSavedUsers.map(function(u) {
        return template
            .split('{nome}').join(u.name)
            .split('{email}').join(u.email)
            .split('{senha}').join(u.password);
    });
    navigator.clipboard.writeText(partes.join('\n\n---\n\n')).then(function() {
        pwFeedbackBtn('.pw-btn-mensagem', 'Copiado!');
    });
}

function pwFeedbackBtn(selector, msg) {
    var btn = document.querySelector(selector);
    if (!btn) return;
    var orig = btn.innerHTML;
    btn.textContent = msg;
    setTimeout(function() { btn.innerHTML = orig; }, 2000);
}

function pwRemoveUser(i) {
    pwSavedUsers.splice(i, 1);
    document.getElementById('savedCount').textContent = pwSavedUsers.length;
    pwRenderUsers();
}

function pwExportarCSV() {
    if (!pwSavedUsers.length) return;
    var linhas=['Nome,Email,Senha,Data'];
    pwSavedUsers.forEach(function(u){
        linhas.push('"'+u.name+'","'+u.email+'","'+u.password+'","'+u.date+'"');
    });
    var csv=linhas.join('\r\n');
    var blob=new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8;'});
    var url=URL.createObjectURL(blob), a=document.createElement('a');
    a.href=url;
    a.download='mobilemed_usuarios_'+new Date().toLocaleDateString('pt-BR').replace(/\//g,'-')+'.csv';
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    pwFeedbackBtn('.pw-btn-exportcsv','Baixando!');
}

function pwExportarExcel() {
    if (!pwSavedUsers.length) return;
    if (typeof XLSX==='undefined') { alert('Biblioteca Excel ainda carregando. Tente novamente.'); return; }
    var dados=pwSavedUsers.map(function(u){return{'Nome':u.name,'Email':u.email,'Senha':u.password,'Data':u.date};});
    var ws=XLSX.utils.json_to_sheet(dados);
    ws['!cols']=[{wch:25},{wch:35},{wch:25},{wch:12}];
    var wb=XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb,ws,'Usuarios');
    XLSX.writeFile(wb,'mobilemed_usuarios_'+new Date().toLocaleDateString('pt-BR').replace(/\//g,'-')+'.xlsx');
    pwFeedbackBtn('.pw-btn-exportxlsx','Baixando!');
}

function pwImportarArquivo(input) {
    var file=input.files[0]; if (!file) return;
    var info=document.getElementById('pwImportInfo');
    var ext=file.name.split('.').pop().toLowerCase();
    var reader=new FileReader();
    reader.onload=function(e){
        try {
            var usuarios=[];
            if (ext==='csv') {
                usuarios=pwParsearCSV(e.target.result);
            } else if (ext==='xlsx'||ext==='xls') {
                if (typeof XLSX==='undefined') { alert('Biblioteca Excel ainda carregando.'); return; }
                var wb=XLSX.read(e.target.result,{type:'binary'});
                var ws=wb.Sheets[wb.SheetNames[0]];
                var json=XLSX.utils.sheet_to_json(ws,{defval:''});
                usuarios=pwNormalizarLinhas(json);
            }
            if (!usuarios.length) { info.textContent='Nenhum usuário encontrado no arquivo.'; return; }
            var adicionados=0;
            usuarios.forEach(function(u){
                var existe=pwSavedUsers.some(function(s){return s.email===u.email;});
                if (!existe) { pwSavedUsers.push(u); adicionados++; }
            });
            document.getElementById('savedCount').textContent=pwSavedUsers.length;
            pwRenderUsers();
            info.textContent=adicionados+' usuário(s) importado(s) com senha gerada!';
            setTimeout(function(){info.textContent='';},4000);
        } catch(err) { info.textContent='Erro ao ler o arquivo: '+err.message; }
        input.value='';
    };
    if (ext==='csv') reader.readAsText(file,'UTF-8');
    else reader.readAsBinaryString(file);
}

function pwGerarSenhaImport() {
    var prefix     = (document.getElementById('pwPrefixImp')  || {}).value || 'Mobile';
    var useSpecial = document.getElementById('pwSpecialImp') ? document.getElementById('pwSpecialImp').checked : true;
    var upperOnly  = document.getElementById('pwUpperImp')   ? document.getElementById('pwUpperImp').checked   : false;
    var len        = document.getElementById('pwLenImp')     ? parseInt(document.getElementById('pwLenImp').value) : 6;
    return prefix + '@' + pwGerarSenha(len, useSpecial, upperOnly);
}

function pwParsearCSV(texto) {
    texto = texto.replace(/^\uFEFF/, '');
    var sep = texto.indexOf('\r\n') !== -1 ? '\r\n' : '\n';
    var linhas = texto.split(sep).filter(function(l){ return l.trim(); });
    if (linhas.length < 2) return [];
    var header = linhas[0].split(',').map(function(h){ return h.replace(/"/g,'').trim().toLowerCase(); });
    var iNome  = header.findIndex(function(h){ return h.includes('nome'); });
    var iEmail = header.findIndex(function(h){ return h.includes('email'); });
    if (iEmail === -1) throw new Error('O arquivo precisa ter uma coluna Email.');
    return linhas.slice(1).map(function(linha){
        var cols = linha.match(/(".*?"|[^,]+)(?=,|$)/g) || linha.split(',');
        function lim(v){ return (v||'').toString().replace(/^"|"$/g,'').trim(); }
        var email = lim(cols[iEmail]);
        if (!email) return null;
        return {
            name:     iNome >= 0 ? lim(cols[iNome]) || 'Importado' : 'Importado',
            email:    email,
            password: pwGerarSenhaImport(),
            date:     new Date().toLocaleDateString('pt-BR')
        };
    }).filter(Boolean);
}

function pwNormalizarLinhas(json) {
    return json.map(function(row){
        function norm(){
            var keys = Array.prototype.slice.call(arguments);
            for (var i=0; i<keys.length; i++){
                var f = Object.keys(row).find(function(r){ return r.toLowerCase().includes(keys[i]); });
                if (f && row[f]) return String(row[f]).trim();
            }
            return '';
        }
        var email = norm('email');
        if (!email) return null;
        return {
            name:     norm('nome') || 'Importado',
            email:    email,
            password: pwGerarSenhaImport(),
            date:     new Date().toLocaleDateString('pt-BR')
        };
    }).filter(Boolean);
}
