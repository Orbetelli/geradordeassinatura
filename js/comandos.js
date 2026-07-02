// ========================================
// COMANDOS — busca + render dinâmico
// ========================================

var CMD_OS_ATUAL = 'windows';

var CMD_DATA = {
    windows: [
        // Rede & IP
        { secao: 'Rede & IP', label: 'Ver IP local',                    cmd: 'ipconfig',                                              tags: 'rede ip ifconfig' },
        { secao: 'Rede & IP', label: 'IP detalhado (DNS, Gateway)',      cmd: 'ipconfig /all',                                         tags: 'rede ip dns gateway' },
        { secao: 'Rede & IP', label: 'Testar conectividade',             cmd: 'ping 8.8.8.8',                                          tags: 'rede ping conectividade' },
        { secao: 'Rede & IP', label: 'Ping contínuo',                    cmd: 'ping -t 8.8.8.8',                                       tags: 'rede ping continuo' },
        { secao: 'Rede & IP', label: 'Rastrear rota',                    cmd: 'tracert 8.8.8.8',                                       tags: 'rede rota tracert' },
        { secao: 'Rede & IP', label: 'Ver conexões ativas',              cmd: 'netstat -an',                                           tags: 'rede conexoes netstat' },
        { secao: 'Rede & IP', label: 'Flush DNS',                        cmd: 'ipconfig /flushdns',                                    tags: 'rede dns flush limpar' },
        { secao: 'Rede & IP', label: 'Testar porta específica',          cmd: 'Test-NetConnection -ComputerName HOST -Port 3306',       tags: 'rede porta tcp' },
        { secao: 'Rede & IP', label: 'Resolver DNS',                     cmd: 'nslookup google.com',                                   tags: 'rede dns nslookup' },
        { secao: 'Rede & IP', label: 'Liberar e renovar IP',             cmd: 'ipconfig /release && ipconfig /renew',                  tags: 'rede ip dhcp renovar' },
        { secao: 'Rede & IP', label: 'Ver tabela ARP',                   cmd: 'arp -a',                                                tags: 'rede arp mac' },
        { secao: 'Rede & IP', label: 'Ver rotas de rede',                cmd: 'route print',                                           tags: 'rede rota route' },
        // Sistema
        { secao: 'Sistema',   label: 'Informações do sistema',           cmd: 'systeminfo',                                            tags: 'sistema info hardware' },
        { secao: 'Sistema',   label: 'Processos em execução',            cmd: 'tasklist',                                              tags: 'sistema processos tasks' },
        { secao: 'Sistema',   label: 'Matar processo por nome',          cmd: 'taskkill /IM nome.exe /F',                              tags: 'sistema matar processo kill' },
        { secao: 'Sistema',   label: 'Ver uso de disco',                 cmd: 'wmic logicaldisk get size,freespace,caption',           tags: 'sistema disco storage hd' },
        { secao: 'Sistema',   label: 'Versão do Windows',                cmd: 'winver',                                                tags: 'sistema versao windows' },
        { secao: 'Sistema',   label: 'Reiniciar serviço',                cmd: 'net stop "NomeServico" && net start "NomeServico"',     tags: 'sistema servico reiniciar' },
        { secao: 'Sistema',   label: 'Listar serviços ativos',           cmd: 'net start',                                             tags: 'sistema servicos listar' },
        { secao: 'Sistema',   label: 'Verificar integridade do sistema', cmd: 'sfc /scannow',                                          tags: 'sistema integridade arquivos' },
        { secao: 'Sistema',   label: 'Uso de CPU e memória (live)',      cmd: 'Get-Process | Sort-Object CPU -Descending | Select -First 10', tags: 'sistema cpu memoria uso' },
        { secao: 'Sistema',   label: 'Ver variáveis de ambiente',        cmd: 'set',                                                   tags: 'sistema variaveis ambiente env' },
        { secao: 'Sistema',   label: 'Limpar cache DNS do sistema',      cmd: 'ipconfig /flushdns && netsh int ip reset',              tags: 'sistema dns cache limpar reset' },
        { secao: 'Sistema',   label: 'Ver usuários logados',             cmd: 'query user',                                            tags: 'sistema usuarios logados sessao' },
        { secao: 'Sistema',   label: 'Ver hora do sistema',              cmd: 'time /t && date /t',                                    tags: 'sistema hora data' },
        // Banco de Dados
        { secao: 'Banco de Dados', label: 'Verificar porta SQL Server',  cmd: 'netstat -an | findstr 1433',                            tags: 'banco sql server porta 1433' },
        { secao: 'Banco de Dados', label: 'Verificar porta MySQL',       cmd: 'netstat -an | findstr 3306',                            tags: 'banco mysql porta 3306' },
        { secao: 'Banco de Dados', label: 'Verificar porta PostgreSQL',  cmd: 'netstat -an | findstr 5432',                            tags: 'banco postgres postgresql porta 5432' },
        { secao: 'Banco de Dados', label: 'Verificar porta Firebird',    cmd: 'netstat -an | findstr 3050',                            tags: 'banco firebird porta 3050' },
        { secao: 'Banco de Dados', label: 'Testar conexão SQL Server',   cmd: 'Test-NetConnection -ComputerName HOST -Port 1433',      tags: 'banco sql server conexao teste' },
        { secao: 'Banco de Dados', label: 'Testar conexão MySQL',        cmd: 'Test-NetConnection -ComputerName HOST -Port 3306',      tags: 'banco mysql conexao teste' },
        // DICOM / PACS
        { secao: 'DICOM / PACS', label: 'Verificar porta DICOM padrão', cmd: 'netstat -an | findstr 104',                             tags: 'dicom pacs porta 104' },
        { secao: 'DICOM / PACS', label: 'Testar porta DICOM',           cmd: 'Test-NetConnection -ComputerName HOST -Port 104',       tags: 'dicom pacs porta teste' },
        { secao: 'DICOM / PACS', label: 'Verificar porta worklist',     cmd: 'netstat -an | findstr 1105',                            tags: 'dicom worklist porta 1105' },
        // Portas & Rede
        { secao: 'Portas & Rede', label: 'Listar todas as portas abertas',          cmd: 'netstat -an',                                                  tags: 'porta rede aberta listen' },
        { secao: 'Portas & Rede', label: 'Portas em LISTEN (aguardando conexão)',   cmd: 'netstat -an | findstr LISTENING',                              tags: 'porta listen escuta aberta' },
        { secao: 'Portas & Rede', label: 'Verificar qual processo usa uma porta',   cmd: 'netstat -ano | findstr :104',                                  tags: 'porta processo pid ocupada' },
        { secao: 'Portas & Rede', label: 'Matar processo que ocupa uma porta',      cmd: 'FOR /F "tokens=5" %P IN ("netstat -ano | findstr :104") DO taskkill /PID %P /F', tags: 'porta matar processo kill pid' },
        { secao: 'Portas & Rede', label: 'Testar porta remota (PowerShell)',         cmd: 'Test-NetConnection -ComputerName HOST -Port 104',               tags: 'porta remota teste tcp' },
        { secao: 'Portas & Rede', label: 'Testar porta com timeout (PowerShell)',    cmd: '(New-Object Net.Sockets.TcpClient).Connect("HOST", 104)',      tags: 'porta tcp socket timeout' },
        { secao: 'Portas & Rede', label: 'Listar portas TCP abertas com PID',        cmd: 'netstat -aon | findstr TCP',                                   tags: 'porta tcp pid lista' },
        { secao: 'Portas & Rede', label: 'Listar portas UDP abertas',                cmd: 'netstat -aon | findstr UDP',                                   tags: 'porta udp lista' },
        { secao: 'Portas & Rede', label: 'Ver porta 80 (HTTP)',                      cmd: 'netstat -an | findstr :80',                                    tags: 'porta 80 http' },
        { secao: 'Portas & Rede', label: 'Ver porta 443 (HTTPS)',                    cmd: 'netstat -an | findstr :443',                                   tags: 'porta 443 https ssl' },
        { secao: 'Portas & Rede', label: 'Ver porta 22 (SSH)',                       cmd: 'netstat -an | findstr :22',                                    tags: 'porta 22 ssh' },
        { secao: 'Portas & Rede', label: 'Ver porta 3389 (RDP)',                     cmd: 'netstat -an | findstr :3389',                                  tags: 'porta 3389 rdp remote desktop' },
        { secao: 'Portas & Rede', label: 'Ver porta 8080 (HTTP alternativo)',        cmd: 'netstat -an | findstr :8080',                                  tags: 'porta 8080 http alternativo' },
        { secao: 'Portas & Rede', label: 'Ver porta 8443 (HTTPS alternativo)',       cmd: 'netstat -an | findstr :8443',                                  tags: 'porta 8443 https alternativo' },
        { secao: 'Portas & Rede', label: 'Verificar porta DICOM (104)',              cmd: 'netstat -an | findstr :104',                                   tags: 'porta dicom 104 pacs' },
        { secao: 'Portas & Rede', label: 'Verificar porta Worklist (1105)',          cmd: 'netstat -an | findstr :1105',                                  tags: 'porta worklist 1105 dicom' },
        { secao: 'Portas & Rede', label: 'Verificar porta SQL Server (1433)',        cmd: 'netstat -an | findstr :1433',                                  tags: 'porta sql server 1433 banco' },
        { secao: 'Portas & Rede', label: 'Verificar porta MySQL (3306)',             cmd: 'netstat -an | findstr :3306',                                  tags: 'porta mysql 3306 banco' },
        { secao: 'Portas & Rede', label: 'Verificar porta PostgreSQL (5432)',        cmd: 'netstat -an | findstr :5432',                                  tags: 'porta postgres 5432 banco' },
        { secao: 'Portas & Rede', label: 'Verificar porta Firebird (3050)',          cmd: 'netstat -an | findstr :3050',                                  tags: 'porta firebird 3050 banco' },
        { secao: 'Portas & Rede', label: 'Verificar porta RabbitMQ (5672)',          cmd: 'netstat -an | findstr :5672',                                  tags: 'porta rabbitmq 5672 fila' },
        { secao: 'Portas & Rede', label: 'Verificar porta Redis (6379)',             cmd: 'netstat -an | findstr :6379',                                  tags: 'porta redis 6379 cache' },
        { secao: 'Portas & Rede', label: 'Abrir porta no Firewall Windows',         cmd: 'netsh advfirewall firewall add rule name="PORTA" protocol=TCP dir=in localport=104 action=allow', tags: 'porta abrir firewall liberar' },
        { secao: 'Portas & Rede', label: 'Fechar porta no Firewall Windows',        cmd: 'netsh advfirewall firewall add rule name="BLOQUEAR" protocol=TCP dir=in localport=104 action=block', tags: 'porta fechar bloquear firewall' },
        // Firewall
        { secao: 'Firewall',  label: 'Ver regras do firewall',           cmd: 'netsh advfirewall firewall show rule name=all',         tags: 'firewall regras' },
        { secao: 'Firewall',  label: 'Desativar firewall (temporário)',  cmd: 'netsh advfirewall set allprofiles state off',           tags: 'firewall desativar off' },
        { secao: 'Firewall',  label: 'Ativar firewall',                  cmd: 'netsh advfirewall set allprofiles state on',            tags: 'firewall ativar on' },
        { secao: 'Firewall',  label: 'Abrir porta no firewall',          cmd: 'netsh advfirewall firewall add rule name="PORTA" protocol=TCP dir=in localport=104 action=allow', tags: 'firewall porta abrir liberar' },
    ],
    linux: [
        // Rede & IP
        { secao: 'Rede & IP', label: 'Ver IP local',                    cmd: 'ip addr show',                                          tags: 'rede ip ifconfig' },
        { secao: 'Rede & IP', label: 'Ver IP (Mac/ifconfig)',           cmd: 'ifconfig',                                              tags: 'rede ip mac' },
        { secao: 'Rede & IP', label: 'Testar conectividade',            cmd: 'ping 8.8.8.8',                                          tags: 'rede ping conectividade' },
        { secao: 'Rede & IP', label: 'Ping com limite de pacotes',      cmd: 'ping -c 10 8.8.8.8',                                   tags: 'rede ping pacotes' },
        { secao: 'Rede & IP', label: 'Rastrear rota',                   cmd: 'traceroute 8.8.8.8',                                   tags: 'rede rota traceroute' },
        { secao: 'Rede & IP', label: 'Ver conexões ativas',             cmd: 'ss -tuln',                                              tags: 'rede conexoes ss netstat' },
        { secao: 'Rede & IP', label: 'Flush DNS (Linux)',               cmd: 'sudo systemd-resolve --flush-caches',                   tags: 'rede dns flush limpar' },
        { secao: 'Rede & IP', label: 'Testar porta específica',         cmd: 'nc -zv HOST 3306',                                     tags: 'rede porta tcp nc' },
        { secao: 'Rede & IP', label: 'Resolver DNS',                    cmd: 'nslookup google.com',                                   tags: 'rede dns nslookup' },
        { secao: 'Rede & IP', label: 'Ver tabela de rotas',             cmd: 'ip route show',                                         tags: 'rede rota route' },
        { secao: 'Rede & IP', label: 'Ver tabela ARP',                  cmd: 'arp -n',                                                tags: 'rede arp mac' },
        { secao: 'Rede & IP', label: 'Monitorar tráfego de rede',       cmd: 'iftop -i eth0',                                         tags: 'rede trafego monitorar' },
        // Sistema
        { secao: 'Sistema',   label: 'Uso de disco',                    cmd: 'df -h',                                                 tags: 'sistema disco storage hd' },
        { secao: 'Sistema',   label: 'Uso de memória',                  cmd: 'free -h',                                               tags: 'sistema memoria ram' },
        { secao: 'Sistema',   label: 'Processos em tempo real',         cmd: 'top',                                                   tags: 'sistema processos cpu' },
        { secao: 'Sistema',   label: 'Processos melhorado',             cmd: 'htop',                                                  tags: 'sistema processos cpu htop' },
        { secao: 'Sistema',   label: 'Versão do sistema',               cmd: 'uname -a',                                              tags: 'sistema versao linux kernel' },
        { secao: 'Sistema',   label: 'Reiniciar serviço (systemd)',      cmd: 'sudo systemctl restart nome-servico',                   tags: 'sistema servico reiniciar systemd' },
        { secao: 'Sistema',   label: 'Status de serviço',               cmd: 'sudo systemctl status nome-servico',                    tags: 'sistema servico status' },
        { secao: 'Sistema',   label: 'Ver logs do sistema',             cmd: 'journalctl -xe',                                        tags: 'sistema logs journal' },
        { secao: 'Sistema',   label: 'Ver logs em tempo real',          cmd: 'journalctl -f',                                         tags: 'sistema logs tempo real' },
        { secao: 'Sistema',   label: 'Ver usuários logados',            cmd: 'who',                                                   tags: 'sistema usuarios logados' },
        { secao: 'Sistema',   label: 'Espaço usado por pasta',          cmd: 'du -sh /caminho/pasta',                                 tags: 'sistema disco pasta tamanho' },
        { secao: 'Sistema',   label: 'Ver processos por porta',         cmd: 'sudo lsof -i :104',                                     tags: 'sistema porta processo lsof' },
        // Banco de Dados
        { secao: 'Banco de Dados', label: 'Verificar porta MySQL',      cmd: 'ss -tuln | grep 3306',                                  tags: 'banco mysql porta 3306' },
        { secao: 'Banco de Dados', label: 'Verificar porta PostgreSQL', cmd: 'ss -tuln | grep 5432',                                  tags: 'banco postgres postgresql porta 5432' },
        { secao: 'Banco de Dados', label: 'Verificar porta Firebird',   cmd: 'ss -tuln | grep 3050',                                  tags: 'banco firebird porta 3050' },
        { secao: 'Banco de Dados', label: 'Reiniciar MySQL',            cmd: 'sudo systemctl restart mysql',                          tags: 'banco mysql reiniciar' },
        { secao: 'Banco de Dados', label: 'Reiniciar PostgreSQL',       cmd: 'sudo systemctl restart postgresql',                     tags: 'banco postgres reiniciar' },
        { secao: 'Banco de Dados', label: 'Entrar no MySQL (root)',      cmd: 'mysql -u root -p',                                      tags: 'banco mysql entrar login' },
        { secao: 'Banco de Dados', label: 'Backup MySQL rápido',        cmd: 'mysqldump -u root -p banco > backup.sql',               tags: 'banco mysql backup dump' },
        // DICOM / PACS
        { secao: 'DICOM / PACS', label: 'Verificar porta DICOM',       cmd: 'ss -tuln | grep 104',                                   tags: 'dicom pacs porta 104' },
        { secao: 'DICOM / PACS', label: 'Testar porta DICOM',          cmd: 'nc -zv HOST 104',                                       tags: 'dicom pacs teste porta' },
        { secao: 'DICOM / PACS', label: 'Ver logs do dcm4chee',        cmd: 'sudo journalctl -u wildfly -f',                         tags: 'dicom pacs dcm4chee logs wildfly' },
        { secao: 'DICOM / PACS', label: 'Reiniciar dcm4chee',          cmd: 'sudo systemctl restart wildfly',                        tags: 'dicom pacs dcm4chee reiniciar wildfly' },
        { secao: 'DICOM / PACS', label: 'Ver porta worklist',          cmd: 'ss -tuln | grep 1105',                                  tags: 'dicom worklist porta 1105' },
        // Portas & Rede
        { secao: 'Portas & Rede', label: 'Listar todas as portas abertas',          cmd: 'ss -tuln',                                                     tags: 'porta rede aberta listen' },
        { secao: 'Portas & Rede', label: 'Portas em LISTEN com processo',           cmd: 'ss -tulnp',                                                    tags: 'porta listen processo pid' },
        { secao: 'Portas & Rede', label: 'Verificar qual processo usa uma porta',   cmd: 'sudo lsof -i :104',                                            tags: 'porta processo pid ocupada lsof' },
        { secao: 'Portas & Rede', label: 'Matar processo que ocupa uma porta',      cmd: 'sudo fuser -k 104/tcp',                                        tags: 'porta matar processo kill fuser' },
        { secao: 'Portas & Rede', label: 'Testar porta remota (nc)',                cmd: 'nc -zv HOST 104',                                              tags: 'porta remota teste nc netcat' },
        { secao: 'Portas & Rede', label: 'Testar porta com timeout (nc)',           cmd: 'nc -zvw 3 HOST 104',                                           tags: 'porta tcp timeout nc' },
        { secao: 'Portas & Rede', label: 'Testar porta remota (bash)',              cmd: 'bash -c "echo > /dev/tcp/HOST/104" && echo aberta || echo fechada', tags: 'porta remota bash tcp' },
        { secao: 'Portas & Rede', label: 'Listar portas TCP abertas',               cmd: 'ss -tln',                                                      tags: 'porta tcp lista aberta' },
        { secao: 'Portas & Rede', label: 'Listar portas UDP abertas',               cmd: 'ss -uln',                                                      tags: 'porta udp lista aberta' },
        { secao: 'Portas & Rede', label: 'Ver porta 80 (HTTP)',                     cmd: 'ss -tuln | grep :80',                                          tags: 'porta 80 http' },
        { secao: 'Portas & Rede', label: 'Ver porta 443 (HTTPS)',                   cmd: 'ss -tuln | grep :443',                                         tags: 'porta 443 https ssl' },
        { secao: 'Portas & Rede', label: 'Ver porta 22 (SSH)',                      cmd: 'ss -tuln | grep :22',                                          tags: 'porta 22 ssh' },
        { secao: 'Portas & Rede', label: 'Ver porta 8080 (HTTP alternativo)',       cmd: 'ss -tuln | grep :8080',                                        tags: 'porta 8080 http alternativo' },
        { secao: 'Portas & Rede', label: 'Ver porta 8443 (HTTPS alternativo)',      cmd: 'ss -tuln | grep :8443',                                        tags: 'porta 8443 https alternativo' },
        { secao: 'Portas & Rede', label: 'Verificar porta DICOM (104)',             cmd: 'ss -tuln | grep :104',                                         tags: 'porta dicom 104 pacs' },
        { secao: 'Portas & Rede', label: 'Verificar porta Worklist (1105)',         cmd: 'ss -tuln | grep :1105',                                        tags: 'porta worklist 1105 dicom' },
        { secao: 'Portas & Rede', label: 'Verificar porta MySQL (3306)',            cmd: 'ss -tuln | grep :3306',                                        tags: 'porta mysql 3306 banco' },
        { secao: 'Portas & Rede', label: 'Verificar porta PostgreSQL (5432)',       cmd: 'ss -tuln | grep :5432',                                        tags: 'porta postgres 5432 banco' },
        { secao: 'Portas & Rede', label: 'Verificar porta Firebird (3050)',         cmd: 'ss -tuln | grep :3050',                                        tags: 'porta firebird 3050 banco' },
        { secao: 'Portas & Rede', label: 'Verificar porta RabbitMQ (5672)',         cmd: 'ss -tuln | grep :5672',                                        tags: 'porta rabbitmq 5672 fila' },
        { secao: 'Portas & Rede', label: 'Verificar porta Redis (6379)',            cmd: 'ss -tuln | grep :6379',                                        tags: 'porta redis 6379 cache' },
        { secao: 'Portas & Rede', label: 'Scan de portas num host (nmap)',          cmd: 'nmap -p 1-1024 HOST',                                          tags: 'porta scan nmap host' },
        { secao: 'Portas & Rede', label: 'Liberar porta no firewall (ufw)',         cmd: 'sudo ufw allow 104/tcp',                                       tags: 'porta liberar ufw firewall' },
        { secao: 'Portas & Rede', label: 'Fechar porta no firewall (ufw)',          cmd: 'sudo ufw deny 104/tcp',                                        tags: 'porta fechar bloquear ufw' },
        // Firewall
        { secao: 'Firewall',  label: 'Ver regras do firewall (ufw)',    cmd: 'sudo ufw status verbose',                               tags: 'firewall ufw regras' },
        { secao: 'Firewall',  label: 'Liberar porta no firewall',       cmd: 'sudo ufw allow 104/tcp',                                tags: 'firewall porta liberar abrir' },
        { secao: 'Firewall',  label: 'Ver regras iptables',             cmd: 'sudo iptables -L -n -v',                                tags: 'firewall iptables regras' },
    ]
};

function cmdInit() {
    cmdRenderOS('windows');
    cmdRenderOS('linux');
}

function cmdRenderOS(os) {
    var el = document.getElementById('cmd-' + os + '-list');
    if (!el) return;
    var cmds = CMD_DATA[os] || [];

    var secoes = {};
    cmds.forEach(function(c) {
        if (!secoes[c.secao]) secoes[c.secao] = [];
        secoes[c.secao].push(c);
    });

    var iconMap = { 'Rede & IP': '🌐', 'Sistema': '🖥️', 'Banco de Dados': '🗄️', 'DICOM / PACS': '📡', 'Firewall': '🔒', 'Portas & Rede': '🔌' };

    el.innerHTML = Object.keys(secoes).map(function(secao, idx) {
        var id = os + '_' + secao.replace(/[^a-z0-9]/gi,'_');
        var itens = secoes[secao].map(function(c) {
            var cmdEsc = c.cmd.replace(/&/g,'&amp;').replace(/"/g,'&quot;');
            return '<div class="cmd-item" data-cmd="' + cmdEsc + '">' +
                '<div class="cmd-info">' +
                '<span class="cmd-label">' + c.label + '</span>' +
                '<code class="cmd-code">' + c.cmd + '</code>' +
                '</div>' +
                '<button class="cmd-copy-btn" onclick="cmdCopiarItem(this)">📋</button>' +
                '</div>';
        }).join('');
        var count = secoes[secao].length;
        return '<div class="cmd-accordion">' +
            '<button class="cmd-accordion-btn" data-secao="' + id + '" onclick="cmdToggleSecao(this)">' +
                '<span class="cmd-accordion-icon">' + (iconMap[secao] || '🔧') + '</span>' +
                '<span class="cmd-accordion-title">' + secao + '</span>' +
                '<span class="cmd-accordion-count">' + count + '</span>' +
                '<svg class="cmd-accordion-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>' +
            '</button>' +
            '<div class="cmd-accordion-body" id="' + id + '">' +
                '<div class="cmd-list">' + itens + '</div>' +
            '</div>' +
            '</div>';
    }).join('');
}

function cmdToggleSecao(btn) {
    var id = btn.getAttribute('data-secao');
    var body = document.getElementById(id);
    if (!body) return;
    var isOpen = body.classList.contains('open');
    body.classList.toggle('open', !isOpen);
    btn.classList.toggle('active', !isOpen);
}

function cmdFiltrar(q) {
    var clear = document.getElementById('cmdSearchClear');
    if (clear) clear.style.display = q ? 'block' : 'none';

    var resultsEl = document.getElementById('cmdSearchResults');
    var windowsEl = document.getElementById('cmd-os-windows');
    var linuxEl   = document.getElementById('cmd-os-linux');

    if (!q.trim()) {
        if (resultsEl) resultsEl.style.display = 'none';
        if (windowsEl) windowsEl.style.display = 'block';
        if (linuxEl)   linuxEl.style.display = 'none';
        cmdSwitchOS(CMD_OS_ATUAL, document.querySelector('.cmd-os-btn.active'));
        return;
    }

    if (windowsEl) windowsEl.style.display = 'none';
    if (linuxEl)   linuxEl.style.display   = 'none';
    if (resultsEl) resultsEl.style.display = 'block';

    var lower = q.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    var todos = [];
    ['windows', 'linux'].forEach(function(os) {
        CMD_DATA[os].forEach(function(c) {
            todos.push({ os: os, cmd: c });
        });
    });

    var filtrado = todos.filter(function(item) {
        var c = item.cmd;
        var texto = (c.label + ' ' + c.cmd + ' ' + c.secao + ' ' + (c.tags || '')).toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return texto.includes(lower);
    });

    if (!filtrado.length) {
        resultsEl.innerHTML = '<div class="storage-empty-hint"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.4"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><div>Nenhum comando encontrado</div></div>';
        return;
    }

    var osBadge = { windows: '🪟 Windows', linux: '🐧 Linux' };
    resultsEl.innerHTML = '<div class="cmd-search-count">' + filtrado.length + ' comando' + (filtrado.length !== 1 ? 's' : '') + ' encontrado' + (filtrado.length !== 1 ? 's' : '') + '</div>' +
        '<div class="cmd-list">' +
        filtrado.map(function(item) {
            var c = item.cmd;
            var cmdEsc = c.cmd.replace(/&/g,'&amp;').replace(/"/g,'&quot;');
            return '<div class="cmd-item" data-cmd="' + cmdEsc + '">' +
                '<div class="cmd-info">' +
                '<span class="cmd-label">' + c.label + ' <span class="cmd-os-badge">' + osBadge[item.os] + '</span></span>' +
                '<code class="cmd-code">' + c.cmd + '</code>' +
                '</div>' +
                '<button class="cmd-copy-btn" onclick="cmdCopiarItem(this)">📋</button>' +
                '</div>';
        }).join('') +
        '</div>';
}

function cmdLimparBusca() {
    var inp = document.getElementById('cmdSearch');
    if (inp) inp.value = '';
    var clear = document.getElementById('cmdSearchClear');
    if (clear) clear.style.display = 'none';
    var resultsEl = document.getElementById('cmdSearchResults');
    if (resultsEl) resultsEl.style.display = 'none';
    cmdSwitchOS(CMD_OS_ATUAL, document.querySelector('.cmd-os-btn.active'));
}

function cmdSwitchOS(os, btn) {
    CMD_OS_ATUAL = os;
    document.querySelectorAll('.cmd-os-panel').forEach(function(p) { p.classList.remove('active'); });
    document.querySelectorAll('.cmd-os-btn').forEach(function(b) { b.classList.remove('active'); });
    var panel = document.getElementById('cmd-os-' + os);
    if (panel) { panel.classList.add('active'); panel.style.display = 'block'; }
    if (btn) btn.classList.add('active');
    var inp = document.getElementById('cmdSearch');
    if (inp && inp.value) { inp.value = ''; cmdLimparBusca(); }
}

function cmdCopiar(btn, texto) {
    navigator.clipboard.writeText(texto).then(function() {
        var orig = btn.textContent;
        btn.textContent = '✅';
        btn.classList.add('copied');
        setTimeout(function() {
            btn.textContent = orig;
            btn.classList.remove('copied');
        }, 1500);
    });
}

function cmdCopiarItem(btn) {
    var item = btn;
    while (item && !item.classList.contains('cmd-item')) item = item.parentElement;
    var texto = item ? item.getAttribute('data-cmd') : '';
    if (!texto) return;
    var ta = document.createElement('textarea');
    ta.innerHTML = texto;
    cmdCopiar(btn, ta.value);
}
