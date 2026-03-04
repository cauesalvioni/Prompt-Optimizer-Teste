import * as vscode from 'vscode';
import { PromptOptimizerPanel } from './promptOptimizerPanel';
import { HistoryManager } from './historyManager';

/**
 * Ponto de entrada da extensão — ativado quando o usuário executa qualquer comando registrado.
 */
export function activate(context: vscode.ExtensionContext) {
  console.log('Prompt Optimizer ativado.');

  const historyManager = new HistoryManager(context.globalState);

  // ── Comando: Abrir painel principal ──────────────────────────────────────
  const openCommand = vscode.commands.registerCommand('promptOptimizer.open', async () => {
    // Se houver texto selecionado no editor, pré-preenche o input
    const editor = vscode.window.activeTextEditor;
    const selectedText = editor?.document.getText(editor.selection) ?? '';

    PromptOptimizerPanel.createOrShow(context, historyManager, selectedText);
  });

  // ── Comando: Configurar API Key via input seguro ─────────────────────────
  const setApiKeyCommand = vscode.commands.registerCommand('promptOptimizer.setApiKey', async () => {
    const key = await vscode.window.showInputBox({
      prompt: 'Cole sua API Key da Anthropic (sk-ant-...)',
      password: true,                         // esconde o valor digitado
      ignoreFocusOut: true,
      validateInput: (val) => {
        if (!val?.startsWith('sk-ant-')) {
          return 'A chave deve começar com sk-ant-';
        }
        return null;
      },
    });

    if (key) {
      // Armazena na configuração do workspace/usuário
      await vscode.workspace
        .getConfiguration('promptOptimizer')
        .update('apiKey', key, vscode.ConfigurationTarget.Global);

      vscode.window.showInformationMessage('✅ API Key salva com sucesso!');
    }
  });

  context.subscriptions.push(openCommand, setApiKeyCommand);
}

/** Chamado quando a extensão é desativada — limpeza de recursos. */
export function deactivate() {}
