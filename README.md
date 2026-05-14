# 🏥 Mobilemed Tools

Ferramenta web gratuita com dois módulos integrados: **Gerador de Assinatura Médica** e **Gerador de Senha** — tudo em uma interface unificada com sistema de abas.

---

## 🚀 Funcionalidades

### 🩺 **Gerador de Assinatura Médica**

#### 📝 Assinaturas
- ✅ **Assinatura Simples** - Uma assinatura com nome e registro
- ✅ **Assinatura Dupla** - Duas assinaturas lado a lado (médico + residente, médico + veterinário, etc)

#### 👨‍⚕️ Tipo de Profissional
- ✅ **Médico** - Registro CRM (ex: CRM 12345/SP)
- ✅ **Veterinário** - Registro CRMV (ex: CRMV 98765/SP)
- ✅ Label e placeholder do campo de registro se adaptam automaticamente

#### 🔤 Fontes
- ✅ **Arial** (padrão)
- ✅ **Times New Roman**
- ✅ **Courier New**

#### 🎨 Processamento de Imagem
- ✅ **Remoção de Fundo** - Remove fundos brancos/claros automaticamente
- ✅ **Converter para Preto** - Transforma assinaturas coloridas em preto puro
- ✅ **Limpar Pixels Fracos** - Remove sujeira e bordas indesejadas
- ✅ **Crop Automático** - Remove espaços vazios e otimiza tamanho
- ✅ **Ajuste de Contraste** - 50% a 300% (manual ou automático)
- ✅ **Ajuste de Nitidez** - 0 a 20 (manual ou automático)
- ✅ **Filtros Python** - Contraste 2.0x + nitidez fixa (modo automático)

#### 📋 Campos Personalizáveis
- ✅ Nome completo (ex: Dr. João Silva)
- ✅ Registro com estado (CRM ou CRMV, conforme o tipo de profissional)
- ✅ Até 2 frases extras por assinatura (especialidade, cargo, etc)

#### 💾 Exportação
- ✅ Download em PNG de alta qualidade
- ✅ Preview em tempo real
- ✅ Canvas otimizado (600x120px para dupla, 480x120px para simples)

---

### 🔐 **Gerador de Senha**

#### ⚙️ Configurações
- ✅ **Prefixo configurável** - Padrão `Mobile`, totalmente editável
- ✅ **Quantidade** - Gere de 1 a 10 senhas de uma vez
- ✅ **Comprimento** - De 6 a 16 caracteres após o `@`
- ✅ **Caracteres especiais** - Toggle para incluir/excluir
- ✅ **Apenas maiúsculas** - Toggle para modo all-caps
- ✅ Garante sempre pelo menos 1 maiúscula, 1 minúscula, 1 número e 1 especial

#### 🏢 Modo Implantação
- ✅ **Geração em lote** - Digite vários nomes, um por linha
- ✅ **E-mail automático** - Converte nome para `joao.silva@dominio.com.br`
- ✅ **Domínio configurável** - Padrão `mobilemed.com.br`, editável
- ✅ **E-mail Manual** - Toggle para digitar nome e e-mail completo individualmente
- ✅ **Contador de nomes** em tempo real
- ✅ Cada usuário gerado é salvo automaticamente em Usuários Salvos

#### 👥 Usuários Salvos
- ✅ Lista de todos os usuários gerados no Modo Implantação
- ✅ **Copiar Credenciais** - Copia `Email: x | Senha: y` de todos os usuários
- ✅ **Copiar Mensagem** - Copia mensagem de boas-vindas (padrão ou personalizada)
- ✅ **Mensagem Personalizável** - Editor de mensagem com variáveis `{nome}`, `{email}` e `{senha}`
- ✅ **Carregar Padrão** - Carrega a mensagem padrão no editor para editar
- ✅ **Exportar CSV** - Baixa lista completa em `.csv` compatível com Excel
- ✅ **Exportar Excel** - Baixa lista completa em `.xlsx` com colunas formatadas
- ✅ **Importar CSV / Excel** - Importa usuários de arquivo existente (detecta duplicatas por e-mail)
- ✅ Copiar senha individual por usuário
- ✅ Remover usuário individualmente

---

### 🎨 **Interface**
- ✅ **Tema Claro** - Gradiente azul escuro → azul claro
- ✅ **Tema Escuro** - Gradiente dark + roxo
- ✅ Alternância de tema com botão fixo no canto da tela
- ✅ Preferência de tema salva automaticamente no navegador

---

### 🔔 **Alerta de Atualização**
- ✅ Detecta automaticamente novos commits no GitHub
- ✅ Exibe toast discreto no canto inferior direito ao identificar nova versão
- ✅ Mostra mensagem do commit, data e hash
- ✅ Some automaticamente após 8 segundos
- ✅ Funciona para todos os usuários — GitHub Pages, Vercel ou qualquer hospedagem

---

### 🔒 **Privacidade**
- ✅ 100% processamento local (nada é enviado para servidores)
- ✅ Funciona offline após primeiro acesso
- ✅ Sem cadastro ou login necessário
- ✅ Código aberto (open-source)

---

## 📦 Instalação

1. Baixe os 3 arquivos: `index.html`, `script.js`, `style.css`
2. Coloque na mesma pasta
3. Abra `index.html` no navegador

**OU** hospede gratuitamente no GitHub Pages ou Vercel.

---

## 📋 Changelog

### **v4.0** - 06/05/2026
- ✅ **E-mail Manual no Modo Implantação** - Toggle para digitar nome e e-mail completo individualmente, sem depender de domínio fixo
- ✅ **Mensagem personalizável** - Editor de texto no modal de Usuários Salvos com suporte a variáveis `{nome}`, `{email}` e `{senha}`
- ✅ Botão **Carregar Padrão** - Preenche o editor com a mensagem padrão para edição
- ✅ Botão **Limpar** - Esvazia o editor para escrever mensagem do zero
- ✅ Botão **Copiar Mensagem** usa automaticamente o conteúdo do editor (ou padrão se vazio)

### **v3.0** - 05/05/2026
- ✅ **Exportar CSV** - Download da lista de usuários em `.csv` com BOM UTF-8
- ✅ **Exportar Excel** - Download em `.xlsx` com colunas formatadas (via SheetJS)
- ✅ **Importar CSV / Excel** - Leitura de arquivos com detecção automática de colunas e prevenção de duplicatas
- ✅ **Tema Claro / Escuro** - Dois temas visuais com alternância por botão fixo
- ✅ Modal de Usuários Salvos segue o tema ativo
- ✅ **Alerta de atualização automático** - Toast no canto da tela ao detectar novo commit no GitHub
- ✅ Correção: e-mails com ponto (ex: `ricardo.orbetelli`) preservados corretamente na geração

### **v2.0** - 24/04/2026
- ✅ **Integração dos dois projetos** em uma única interface com sistema de abas
- ✅ **Gerador de Senha** integrado com visual unificado
- ✅ **Modo Implantação com geração em lote** - múltiplos nomes por linha
- ✅ E-mail gerado automaticamente a partir do nome (`joao.silva@dominio.com.br`)
- ✅ Domínio configurável com padrão `mobilemed.com.br`
- ✅ Botão **Copiar Credenciais** no modal de usuários salvos
- ✅ Botão **Copiar Mensagem** com texto completo de boas-vindas
- ✅ Copiar credenciais individualmente por usuário gerado

### **v1.2** - 30/03/2026
- ✅ **Adicionado seletor de tipo de profissional** (Médico / Veterinário)
- ✅ Campo de registro adaptável (CRM ou CRMV) com label e placeholder automáticos
- ✅ **Adicionado seletor de fonte** (Arial, Times New Roman, Courier New)
- ✅ Suporte a seletor de profissional na assinatura dupla

### **v1.1** - 09/02/2026
- ✅ **Adicionada assinatura dupla** (layout lado a lado)
- ✅ Upload separado para segunda assinatura
- ✅ Remoção de fundo individual para cada assinatura
- ✅ Campos personalizados por médico
- ✅ Canvas expandido para comportar duas assinaturas

### **v1.0** - 09/02/2026
- ✅ Assinatura simples funcional
- ✅ Remoção de fundo por detecção de cor
- ✅ Filtros profissionais (contraste, nitidez, preto, crop)
- ✅ Modo híbrido (filtros Python + controles manuais)
- ✅ Preview em tempo real
- ✅ Download em PNG

---

## 🛠️ Tecnologias

- HTML5
- CSS3
- JavaScript puro
- Canvas API
- SheetJS (exportação/importação Excel)
- GitHub API (alerta de atualização)

---

## 📄 Licença

MIT License - Uso livre para qualquer finalidade.

---

**Desenvolvido com ❤️ para profissionais de saúde**