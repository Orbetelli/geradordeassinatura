# 🩺 Gerador de Assinatura Médica

Ferramenta web gratuita para criar assinaturas profissionais para documentos médicos e veterinários.

---

## 🚀 Funcionalidades

### 📝 **Assinaturas**
- ✅ **Assinatura Simples** - Uma assinatura com nome e registro
- ✅ **Assinatura Dupla** - Duas assinaturas lado a lado (médico + residente, médico + veterinário, etc)

### 👨‍⚕️ **Tipo de Profissional**
- ✅ **Médico** - Registro CRM (ex: CRM 12345/SP)
- ✅ **Veterinário** - Registro CRMV (ex: CRMV 98765/SP)
- ✅ Label e placeholder do campo de registro se adaptam automaticamente

### 🔤 **Fontes**
- ✅ **Arial** (padrão)
- ✅ **Times New Roman**
- ✅ **Courier New**

### 🎨 **Processamento de Imagem**
- ✅ **Remoção de Fundo** - Remove fundos brancos/claros automaticamente
- ✅ **Converter para Preto** - Transforma assinaturas coloridas em preto puro
- ✅ **Limpar Pixels Fracos** - Remove sujeira e bordas indesejadas
- ✅ **Crop Automático** - Remove espaços vazios e otimiza tamanho
- ✅ **Ajuste de Contraste** - 50% a 300% (manual ou automático)
- ✅ **Ajuste de Nitidez** - 0 a 20 (manual ou automático)
- ✅ **Filtros Python** - Contraste 2.0x + nitidez fixa (modo automático)

### 📋 **Campos Personalizáveis**
- ✅ Nome completo (ex: Dr. João Silva)
- ✅ Registro com estado (CRM ou CRMV, conforme o tipo de profissional)
- ✅ Até 2 frases extras por assinatura (especialidade, cargo, etc)

### 💾 **Exportação**
- ✅ Download em PNG de alta qualidade
- ✅ Preview em tempo real
- ✅ Canvas otimizado (600x120px para dupla, 480x120px para simples)

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

**OU** hospede gratuitamente no GitHub Pages.

---

## 📋 Changelog

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
- JavaScript puro (sem dependências)
- Canvas API

---

## 📄 Licença

MIT License - Uso livre para qualquer finalidade.

---

**Desenvolvido com ❤️ para profissionais de saúde**