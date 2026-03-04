import * as vscode from 'vscode';
import { HistoryManager } from './historyManager';
import { optimizePrompt } from './promptService';
import { getWebviewContent } from './webviewContent';

/**
 * Gerencia o painel WebView do Prompt Optimizer.
 * Implementa o padrão singleton: apenas um painel aberto por vez.
 */
export class PromptOptimizerPanel {
  public static currentPanel: PromptOptimizerPanel | undefined;

  private readonly _panel: vscode.WebviewPanel;
  private readonly _context: vscode.ExtensionContext;
  private readonly _historyManager: HistoryManager;
  private _disposables: vscode.Disposable[] = [];

  // ── Factory: cria ou traz ao foco o painel existente ──────────────────────
  public static createOrShow(
    context: vscode.ExtensionContext,
    historyManager: HistoryManager,
    prefillText = ''
  ) {
    const column = vscode.window.activeTextEditor
      ? vscode.ViewColumn.Beside
      : vscode.ViewColumn.One;

    // Reutiliza painel existente
    if (PromptOptimizerPanel.currentPanel) {
      PromptOptimizerPanel.currentPanel._panel.reveal(column);
      if (prefillText) {
        PromptOptimizerPanel.currentPanel._sendMessage({ type: 'prefill', text: prefillText });
      }
      return;
    }

    // Cria novo painel
    const panel = vscode.window.createWebviewPanel(
      'promptOptimizer',
      'Prompt Optimizer',
      column,
      {
        enableScripts: true,
        retainContextWhenHidden: true,       // mantém estado ao trocar de aba
        localResourceRoots: [
          vscode.Uri.joinPath(context.extensionUri, 'media'),
        ],
      }
    );

    PromptOptimizerPanel.currentPanel = new PromptOptimizerPanel(
      panel,
      context,
      historyManager,
      prefillText
    );
  }

  private constructor(
    panel: vscode.WebviewPanel,
    context: vscode.ExtensionContext,
    historyManager: HistoryManager,
    prefillText: string
  ) {
    this._panel = panel;
    this._context = context;
    this._historyManager = historyManager;

    // Define o conteúdo HTML inicial
    this._panel.webview.html = getWebviewContent(this._panel.webview, context.extensionUri);

    // Escuta mensagens vindas do WebView
    this._panel.webview.onDidReceiveMessage(
      (msg) => this._handleMessage(msg),
      null,
      this._disposables
    );

    // Limpa recursos quando o painel é fechado
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    // Pré-preenche o textarea se houver texto selecionado no editor
    if (prefillText) {
      // Aguarda o WebView carregar antes de enviar
      setTimeout(() => this._sendMessage({ type: 'prefill', text: prefillText }), 500);
    }

    // Envia histórico salvo ao carregar
    setTimeout(() => {
      const history = this._historyManager.getHistory();
      this._sendMessage({ type: 'historyLoaded', history });
    }, 600);
  }

  // ── Roteador de mensagens recebidas do WebView ────────────────────────────
  private async _handleMessage(message: { type: string; [key: string]: unknown }) {
    switch (message.type) {
      case 'optimize':
        await this._handleOptimize(message.prompt as string);
        break;

      case 'copyToClipboard':
        await vscode.env.clipboard.writeText(message.text as string);
        this._sendMessage({ type: 'copied' });
        break;

      case 'insertInEditor':
        await this._insertTextInEditor(message.text as string);
        break;

      case 'openSettings':
        await vscode.commands.executeCommand(
          'workbench.action.openSettings',
          'promptOptimizer'
        );
        break;

      case 'clearHistory':
        this._historyManager.clearHistory();
        this._sendMessage({ type: 'historyLoaded', history: [] });
        break;
    }
  }

  // ── Chama a API do Claude e retorna o resultado ───────────────────────────
  private async _handleOptimize(prompt: string) {
    if (!prompt?.trim()) {
      return;
    }

    // Verifica se a API Key está configurada
    const apiKey = vscode.workspace
      .getConfiguration('promptOptimizer')
      .get<string>('apiKey', '');

    if (!apiKey) {
      const action = await vscode.window.showWarningMessage(
        'API Key não configurada. Configure-a para usar o Prompt Optimizer.',
        'Configurar Agora'
      );
      if (action === 'Configurar Agora') {
        await vscode.commands.executeCommand('promptOptimizer.setApiKey');
      }
      this._sendMessage({ type: 'error', message: 'API Key não configurada.' });
      return;
    }

    const model = vscode.workspace
      .getConfiguration('promptOptimizer')
      .get<string>('model', 'claude-sonnet-4-20250514');

    this._sendMessage({ type: 'loading', loading: true });

    try {
      const result = await optimizePrompt(prompt, apiKey, model);

      // Salva no histórico
      this._historyManager.addEntry({ prompt, result, timestamp: Date.now() });

      this._sendMessage({ type: 'result', result });
      this._sendMessage({ type: 'historyLoaded', history: this._historyManager.getHistory() });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      vscode.window.showErrorMessage(`Prompt Optimizer: ${errorMessage}`);
      this._sendMessage({ type: 'error', message: errorMessage });
    } finally {
      this._sendMessage({ type: 'loading', loading: false });
    }
  }

  // ── Insere texto no editor ativo ─────────────────────────────────────────
  private async _insertTextInEditor(text: string) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showWarningMessage('Nenhum editor ativo para inserir o texto.');
      return;
    }
    await editor.edit((editBuilder) => {
      editBuilder.replace(editor.selection, text);
    });
    vscode.window.showInformationMessage('✅ Prompt inserido no editor!');
  }

  /** Envia mensagem para o JavaScript do WebView. */
  private _sendMessage(data: object) {
    this._panel.webview.postMessage(data);
  }

  public dispose() {
    PromptOptimizerPanel.currentPanel = undefined;
    this._panel.dispose();
    this._disposables.forEach((d) => d.dispose());
    this._disposables = [];
  }
}
