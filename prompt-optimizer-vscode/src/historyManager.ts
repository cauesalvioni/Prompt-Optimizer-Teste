import * as vscode from 'vscode';
import { OptimizationResult } from './promptService';

export interface HistoryEntry {
  prompt: string;
  result: OptimizationResult;
  timestamp: number;
}

const HISTORY_KEY = 'promptOptimizer.history';
const MAX_ENTRIES = 5;

/**
 * Gerencia o histórico dos últimos prompts otimizados usando o globalState do VSCode.
 * Os dados persistem entre sessões do editor.
 */
export class HistoryManager {
  constructor(private readonly _state: vscode.Memento) {}

  /** Retorna todos os registros do histórico (do mais recente ao mais antigo). */
  public getHistory(): HistoryEntry[] {
    return this._state.get<HistoryEntry[]>(HISTORY_KEY, []);
  }

  /** Adiciona um novo registro e mantém o limite de MAX_ENTRIES itens. */
  public addEntry(entry: HistoryEntry): void {
    const history = this.getHistory();
    history.unshift(entry);                          // insere no início

    // Limita ao máximo definido
    const trimmed = history.slice(0, MAX_ENTRIES);
    this._state.update(HISTORY_KEY, trimmed);
  }

  /** Remove todos os registros do histórico. */
  public clearHistory(): void {
    this._state.update(HISTORY_KEY, []);
  }
}
