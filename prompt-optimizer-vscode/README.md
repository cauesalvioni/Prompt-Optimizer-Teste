# Prompt Optimizer for Claude — VSCode Extension

> Otimize seus prompts para Claude diretamente no VSCode usando IA.

---

## ✨ Funcionalidades

- **Otimização inteligente** — Reescreve seu prompt aplicando boas práticas de engenharia de prompts
- **Score visual** — Exibe pontuação antes/depois com gráfico de anel
- **Lista de melhorias** — Mostra cada melhoria aplicada de forma clara
- **Dica extra** — Sugestão adicional específica para o tipo de prompt
- **Histórico** — Guarda os últimos 5 prompts otimizados entre sessões
- **Copiar / Inserir** — Copie o prompt melhorado ou insira direto no editor ativo
- **Compatível com temas** — Adapta-se ao tema dark/light do VSCode automaticamente

---

## 🚀 Instalação

### Pré-requisitos
- [Node.js](https://nodejs.org/) v18 ou superior
- [VSCode](https://code.visualstudio.com/) v1.85 ou superior
- Uma [API Key da Anthropic](https://console.anthropic.com)

### Opção 1 — Instalar pelo arquivo `.vsix` (recomendado)

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/prompt-optimizer-vscode
cd prompt-optimizer-vscode

# 2. Instale as dependências
npm install

# 3. Compile o TypeScript
npm run compile

# 4. Gere o pacote .vsix
npm run package

# 5. Instale no VSCode
code --install-extension prompt-optimizer-1.0.0.vsix
```

### Opção 2 — Rodar em modo desenvolvimento

```bash
# 1. Clone e instale dependências
git clone https://github.com/seu-usuario/prompt-optimizer-vscode
cd prompt-optimizer-vscode
npm install

# 2. Abra no VSCode
code .

# 3. Pressione F5 para abrir a Extension Development Host
```

---

## ⚙️ Configuração

### API Key (obrigatório)

Após instalar, configure sua API Key:

1. Abra a Paleta de Comandos (`Ctrl+Shift+P` / `Cmd+Shift+P`)
2. Digite: `Prompt Optimizer: Configurar API Key do Claude`
3. Cole sua chave `sk-ant-...`

Ou via Settings (`Ctrl+,`):
```
promptOptimizer.apiKey = "sk-ant-..."
```

### Configurações disponíveis

| Configuração | Padrão | Descrição |
|---|---|---|
| `promptOptimizer.apiKey` | `""` | API Key da Anthropic |
| `promptOptimizer.model` | `claude-sonnet-4-20250514` | Modelo Claude a usar |
| `promptOptimizer.language` | `pt-BR` | Idioma da interface |

---

## 📖 Como usar

### Abrindo o painel

- **Paleta de Comandos**: `Ctrl+Shift+P` → `Abrir Prompt Optimizer`
- **Menu de contexto**: Selecione texto no editor → clique direito → `Abrir Prompt Optimizer`
  - O texto selecionado é automaticamente inserido no campo de input

### Fluxo básico

1. Abra o painel do Prompt Optimizer
2. Digite ou cole seu prompt bruto no campo de texto
3. Clique em **✦ Otimizar Prompt**
4. Veja o resultado:
   - **Scores** comparando original vs otimizado
   - **Prompt melhorado** com botão de copiar e inserir no editor
   - **Lista de melhorias** aplicadas
   - **Dica extra** específica para seu caso
5. Clique em **Inserir no Editor** para substituir a seleção ativa

### Histórico

- Os últimos 5 prompts ficam salvos no histórico
- Clique em qualquer item do histórico para recarregar o resultado
- Use **Limpar** para apagar o histórico

---

## 🗂️ Estrutura do projeto

```
prompt-optimizer-vscode/
├── src/
│   ├── extension.ts          # Ponto de entrada, registro de comandos
│   ├── promptOptimizerPanel.ts  # Gerenciador do WebView Panel
│   ├── promptService.ts      # Chamada à API da Anthropic
│   ├── historyManager.ts     # Persistência do histórico
│   └── webviewContent.ts     # HTML/CSS/JS da interface
├── media/                    # Assets estáticos (ícones etc.)
├── out/                      # TypeScript compilado (gerado)
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🔒 Segurança

- A API Key é armazenada nas configurações do VSCode (não no código)
- O WebView usa `Content-Security-Policy` com nonce para evitar XSS
- Nenhum dado é enviado a terceiros além da API da Anthropic

---

## 🛠️ Desenvolvimento

```bash
# Compilar em modo watch (recompila ao salvar)
npm run watch

# Lint
npm run lint

# Empacotar para distribuição
npm run package
```

---

## 📄 Licença

MIT © 2025
