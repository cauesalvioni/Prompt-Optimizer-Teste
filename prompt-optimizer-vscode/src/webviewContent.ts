import * as vscode from 'vscode';

/**
 * Gera o HTML completo do WebView com estilos e lógica inline.
 * Usa variáveis CSS do VSCode para compatibilidade com temas dark/light.
 */
export function getWebviewContent(
  webview: vscode.Webview,
  _extensionUri: vscode.Uri
): string {
  // Nonce para Content-Security-Policy — permite apenas scripts conhecidos
  const nonce = getNonce();

  return /* html */ `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy"
        content="default-src 'none';
                 style-src ${webview.cspSource} 'unsafe-inline';
                 script-src 'nonce-${nonce}';
                 font-src https://fonts.gstatic.com;
                 connect-src https://fonts.googleapis.com;">
  <title>Prompt Optimizer</title>
  <style>
    /* ── Reset & Base ─────────────────────────────────────────────────── */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg:           var(--vscode-editor-background);
      --bg-card:      var(--vscode-sideBar-background, #1e1e2e);
      --bg-input:     var(--vscode-input-background);
      --border:       var(--vscode-panel-border, rgba(99,102,241,0.2));
      --text:         var(--vscode-editor-foreground);
      --text-muted:   var(--vscode-descriptionForeground);
      --accent:       var(--vscode-button-background, #6366f1);
      --accent-fg:    var(--vscode-button-foreground, #fff);
      --accent-hover: var(--vscode-button-hoverBackground, #818cf8);
      --success:      #4ade80;
      --warn:         #facc15;
      --danger:       #f87171;
      --radius:       10px;
      --font-mono:    var(--vscode-editor-font-family, 'Consolas', monospace);
      --font-ui:      var(--vscode-font-family, -apple-system, sans-serif);
    }

    body {
      background: var(--bg);
      color: var(--text);
      font-family: var(--font-ui);
      font-size: var(--vscode-font-size, 13px);
      line-height: 1.5;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    /* ── Layout ───────────────────────────────────────────────────────── */
    .container {
      max-width: 780px;
      margin: 0 auto;
      padding: 24px 16px 48px;
      width: 100%;
    }

    /* ── Header ───────────────────────────────────────────────────────── */
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
      gap: 12px;
      flex-wrap: wrap;
    }

    .header-title {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(99,102,241,0.12);
      border: 1px solid rgba(99,102,241,0.3);
      border-radius: 100px;
      padding: 3px 10px;
      font-size: 10px;
      color: var(--accent-hover, #818cf8);
      font-weight: 600;
      letter-spacing: 0.1em;
    }

    .badge-dot {
      width: 6px; height: 6px;
      border-radius: 50%;
      background: currentColor;
      animation: pulse 2s infinite;
    }

    h1 {
      font-size: 1.4em;
      font-weight: 700;
      letter-spacing: -0.01em;
    }

    h1 span { color: var(--accent-hover, #818cf8); }

    .btn-settings {
      background: transparent;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      color: var(--text-muted);
      cursor: pointer;
      padding: 5px 12px;
      font-size: 12px;
      display: flex; align-items: center; gap: 5px;
      transition: all 0.15s;
    }
    .btn-settings:hover { color: var(--text); border-color: var(--accent); }

    /* ── Card ─────────────────────────────────────────────────────────── */
    .card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 12px;
      overflow: hidden;
      margin-bottom: 14px;
    }

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 9px 14px;
      border-bottom: 1px solid var(--border);
      font-size: 11px;
      color: var(--text-muted);
      font-weight: 600;
      letter-spacing: 0.06em;
    }

    .card-header-dots {
      display: flex; gap: 5px;
    }
    .dot { width: 9px; height: 9px; border-radius: 50%; opacity: 0.7; }

    /* ── Textarea input ───────────────────────────────────────────────── */
    textarea {
      width: 100%;
      background: transparent;
      border: none;
      outline: none;
      color: var(--text);
      font-family: var(--font-mono);
      font-size: 13px;
      line-height: 1.7;
      padding: 14px;
      resize: vertical;
      min-height: 100px;
      caret-color: var(--accent-hover, #818cf8);
    }
    textarea::placeholder { color: var(--text-muted); opacity: 0.6; }

    .input-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 14px;
      border-top: 1px solid var(--border);
    }

    .char-count {
      font-size: 11px;
      color: var(--text-muted);
      font-family: var(--font-mono);
    }

    /* ── Buttons ──────────────────────────────────────────────────────── */
    .btn-primary {
      background: var(--accent);
      color: var(--accent-fg);
      border: none;
      border-radius: var(--radius);
      padding: 8px 22px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      display: flex; align-items: center; gap: 7px;
      transition: background 0.15s, opacity 0.15s;
      letter-spacing: 0.01em;
    }
    .btn-primary:hover:not(:disabled) { background: var(--accent-hover); }
    .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }

    .btn-ghost {
      background: transparent;
      border: 1px solid var(--border);
      border-radius: 7px;
      color: var(--text-muted);
      cursor: pointer;
      padding: 4px 12px;
      font-size: 12px;
      font-weight: 500;
      transition: all 0.15s;
    }
    .btn-ghost:hover { color: var(--text); border-color: var(--accent); }
    .btn-ghost.success { color: var(--success); border-color: var(--success); }

    /* ── Spinner ──────────────────────────────────────────────────────── */
    .spinner {
      width: 13px; height: 13px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
      flex-shrink: 0;
    }

    /* ── Score ring ───────────────────────────────────────────────────── */
    .scores-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 32px;
      padding: 20px;
    }
    .score-item { display: flex; flex-direction: column; align-items: center; gap: 6px; }
    .score-label { font-size: 10px; color: var(--text-muted); font-weight: 600; letter-spacing: 0.1em; }
    .score-arrow { font-size: 20px; color: var(--success); }
    .score-delta { font-size: 10px; color: var(--success); font-weight: 700; }

    /* ── Result sections ──────────────────────────────────────────────── */
    .result-text {
      padding: 14px;
      color: var(--text);
      font-family: var(--font-mono);
      font-size: 12px;
      line-height: 1.8;
      white-space: pre-wrap;
      word-break: break-word;
    }

    .improvements-list {
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .improvement-item {
      display: flex;
      align-items: flex-start;
      gap: 10px;
    }

    .improvement-num {
      min-width: 20px; height: 20px;
      background: rgba(99,102,241,0.15);
      border: 1px solid rgba(99,102,241,0.3);
      border-radius: 5px;
      display: flex; align-items: center; justify-content: center;
      font-size: 10px; font-weight: 700;
      color: var(--accent-hover, #818cf8);
      flex-shrink: 0;
      margin-top: 1px;
    }

    .improvement-text { font-size: 13px; color: var(--text-muted); line-height: 1.5; }

    .tip-box {
      background: rgba(250,204,21,0.06);
      border: 1px solid rgba(250,204,21,0.25);
      border-radius: 12px;
      padding: 14px 16px;
      display: flex; gap: 12px; align-items: flex-start;
      margin-bottom: 14px;
    }
    .tip-icon { font-size: 18px; line-height: 1; }
    .tip-label { font-size: 10px; color: var(--warn); font-weight: 700; letter-spacing: 0.08em; margin-bottom: 5px; }
    .tip-text { font-size: 13px; color: var(--text-muted); line-height: 1.6; }

    /* ── Error ────────────────────────────────────────────────────────── */
    .error-box {
      background: rgba(239,68,68,0.08);
      border: 1px solid rgba(239,68,68,0.3);
      border-radius: var(--radius);
      padding: 10px 14px;
      color: #fca5a5;
      font-size: 13px;
      margin-bottom: 14px;
      display: none;
    }

    /* ── History ──────────────────────────────────────────────────────── */
    .section-title {
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.08em;
      color: var(--text-muted);
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .history-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .history-item {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 9px 12px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      transition: border-color 0.15s;
    }
    .history-item:hover { border-color: var(--accent); }

    .history-prompt {
      font-size: 12px;
      color: var(--text-muted);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      flex: 1;
    }

    .history-meta {
      display: flex; align-items: center; gap: 8px; flex-shrink: 0;
    }

    .score-pill {
      font-size: 10px; font-weight: 700;
      padding: 2px 7px;
      border-radius: 100px;
      background: rgba(74,222,128,0.12);
      color: var(--success);
    }

    .history-time {
      font-size: 10px; color: var(--text-muted); opacity: 0.6;
    }

    .empty-history {
      text-align: center;
      color: var(--text-muted);
      font-size: 12px;
      padding: 14px;
      opacity: 0.6;
    }

    /* ── Divider ──────────────────────────────────────────────────────── */
    .divider { height: 1px; background: var(--border); margin: 20px 0; opacity: 0.5; }

    /* ── Hidden utility ───────────────────────────────────────────────── */
    .hidden { display: none !important; }

    /* ── Action row ───────────────────────────────────────────────────── */
    .action-row {
      display: flex; gap: 8px; align-items: center;
    }

    /* ── Animations ───────────────────────────────────────────────────── */
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .fade-up { animation: fadeUp 0.35s ease; }
  </style>
</head>
<body>
<div class="container">

  <!-- ── Header ──────────────────────────────────────────────────────────── -->
  <div class="header">
    <div class="header-title">
      <h1>Prompt<span>.</span>Optimizer</h1>
      <span class="badge">
        <span class="badge-dot"></span>
        IA ATIVA
      </span>
    </div>
    <button class="btn-settings" id="btnSettings">⚙ Configurações</button>
  </div>

  <!-- ── Input card ───────────────────────────────────────────────────────── -->
  <div class="card">
    <div class="card-header">
      <div class="card-header-dots">
        <div class="dot" style="background:#f87171"></div>
        <div class="dot" style="background:#facc15"></div>
        <div class="dot" style="background:#4ade80"></div>
      </div>
      <span>prompt.txt</span>
    </div>
    <textarea
      id="promptInput"
      rows="6"
      placeholder="Ex: me fala sobre machine learning"
    ></textarea>
    <div class="input-footer">
      <span class="char-count" id="charCount">0 chars</span>
      <button class="btn-primary" id="btnOptimize">
        <span id="btnIcon">✦</span>
        <span id="btnLabel">Otimizar Prompt</span>
      </button>
    </div>
  </div>

  <!-- ── Error box ────────────────────────────────────────────────────────── -->
  <div class="error-box" id="errorBox"></div>

  <!-- ── Results (hidden until response arrives) ─────────────────────────── -->
  <div id="resultSection" class="hidden">

    <!-- Scores -->
    <div class="card fade-up">
      <div class="scores-row">
        <div class="score-item">
          <svg id="ringOriginal" width="72" height="72"></svg>
          <span class="score-label">ORIGINAL</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:4px">
          <div class="score-arrow">→</div>
          <span class="score-delta" id="scoreDelta"></span>
        </div>
        <div class="score-item">
          <svg id="ringImproved" width="72" height="72"></svg>
          <span class="score-label">OTIMIZADO</span>
        </div>
      </div>
    </div>

    <!-- Optimized prompt -->
    <div class="card fade-up">
      <div class="card-header">
        <span style="color:var(--accent-hover,#818cf8)">PROMPT OTIMIZADO</span>
        <div class="action-row">
          <button class="btn-ghost" id="btnInsert">⤵ Inserir no Editor</button>
          <button class="btn-ghost" id="btnCopy">Copiar</button>
        </div>
      </div>
      <div class="result-text" id="improvedPrompt"></div>
    </div>

    <!-- Improvements -->
    <div class="card fade-up">
      <div class="card-header">
        <span>MELHORIAS APLICADAS</span>
      </div>
      <div class="improvements-list" id="improvementsList"></div>
    </div>

    <!-- Tip -->
    <div class="tip-box fade-up" id="tipBox">
      <div class="tip-icon">💡</div>
      <div>
        <div class="tip-label">DICA EXTRA</div>
        <div class="tip-text" id="tipText"></div>
      </div>
    </div>

  </div>

  <!-- ── History ───────────────────────────────────────────────────────────── -->
  <div class="divider"></div>
  <div class="section-title">
    <span>HISTÓRICO (últimos 5)</span>
    <button class="btn-ghost" id="btnClearHistory">Limpar</button>
  </div>
  <div class="history-list" id="historyList">
    <div class="empty-history">Nenhum prompt otimizado ainda.</div>
  </div>

</div>

<script nonce="${nonce}">
  // ── VSCode API bridge ────────────────────────────────────────────────────
  const vscode = acquireVsCodeApi();

  // ── Element refs ─────────────────────────────────────────────────────────
  const $ = (id) => document.getElementById(id);
  const promptInput   = $('promptInput');
  const charCount     = $('charCount');
  const btnOptimize   = $('btnOptimize');
  const btnIcon       = $('btnIcon');
  const btnLabel      = $('btnLabel');
  const errorBox      = $('errorBox');
  const resultSection = $('resultSection');
  const improvedPrompt= $('improvedPrompt');
  const improvList    = $('improvementsList');
  const tipBox        = $('tipBox');
  const tipText       = $('tipText');
  const scoreDelta    = $('scoreDelta');
  const historyList   = $('historyList');
  const btnCopy       = $('btnCopy');
  const btnInsert     = $('btnInsert');
  const btnClear      = $('btnClearHistory');
  const btnSettings   = $('btnSettings');

  let currentResult = null;

  // ── Char counter ─────────────────────────────────────────────────────────
  promptInput.addEventListener('input', () => {
    charCount.textContent = promptInput.value.length + ' chars';
  });

  // ── Optimize button ───────────────────────────────────────────────────────
  btnOptimize.addEventListener('click', () => {
    const text = promptInput.value.trim();
    if (!text) return;
    vscode.postMessage({ type: 'optimize', prompt: text });
  });

  // ── Copy button ───────────────────────────────────────────────────────────
  btnCopy.addEventListener('click', () => {
    if (!currentResult) return;
    vscode.postMessage({ type: 'copyToClipboard', text: currentResult.prompt_melhorado });
  });

  // ── Insert in editor ─────────────────────────────────────────────────────
  btnInsert.addEventListener('click', () => {
    if (!currentResult) return;
    vscode.postMessage({ type: 'insertInEditor', text: currentResult.prompt_melhorado });
  });

  // ── Settings ──────────────────────────────────────────────────────────────
  btnSettings.addEventListener('click', () => {
    vscode.postMessage({ type: 'openSettings' });
  });

  // ── Clear history ─────────────────────────────────────────────────────────
  btnClear.addEventListener('click', () => {
    vscode.postMessage({ type: 'clearHistory' });
  });

  // ── Messages from extension ───────────────────────────────────────────────
  window.addEventListener('message', (event) => {
    const msg = event.data;
    switch (msg.type) {

      case 'prefill':
        promptInput.value = msg.text;
        charCount.textContent = msg.text.length + ' chars';
        break;

      case 'loading':
        setLoading(msg.loading);
        break;

      case 'result':
        currentResult = msg.result;
        renderResult(msg.result);
        break;

      case 'error':
        showError(msg.message);
        break;

      case 'copied':
        btnCopy.textContent = '✓ Copiado!';
        btnCopy.classList.add('success');
        setTimeout(() => {
          btnCopy.textContent = 'Copiar';
          btnCopy.classList.remove('success');
        }, 2000);
        break;

      case 'historyLoaded':
        renderHistory(msg.history);
        break;
    }
  });

  // ── UI helpers ────────────────────────────────────────────────────────────
  function setLoading(isLoading) {
    btnOptimize.disabled = isLoading;
    if (isLoading) {
      btnIcon.outerHTML = '<span id="btnIcon" class="spinner"></span>';
      $('btnLabel').textContent = 'Otimizando...';
      errorBox.style.display = 'none';
      resultSection.classList.add('hidden');
    } else {
      // Re-grab after innerHTML swap
      const icon = $('btnIcon');
      if (icon) icon.outerHTML = '<span id="btnIcon">✦</span>';
      $('btnLabel').textContent = 'Otimizar Prompt';
    }
  }

  function showError(msg) {
    errorBox.textContent = '⚠ ' + msg;
    errorBox.style.display = 'block';
  }

  function renderResult(r) {
    // Scores
    drawRing('ringOriginal', r.score_original);
    drawRing('ringImproved', r.score_melhorado);
    scoreDelta.textContent = '+' + (r.score_melhorado - r.score_original) + ' pts';

    // Improved prompt
    improvedPrompt.textContent = r.prompt_melhorado;

    // Improvements list
    improvList.innerHTML = '';
    (r.melhorias || []).forEach((m, i) => {
      const item = document.createElement('div');
      item.className = 'improvement-item';
      item.innerHTML = \`
        <div class="improvement-num">\${i + 1}</div>
        <div class="improvement-text">\${escHtml(m)}</div>
      \`;
      improvList.appendChild(item);
    });

    // Tip
    if (r.dica_extra) {
      tipText.textContent = r.dica_extra;
      tipBox.style.display = 'flex';
    } else {
      tipBox.style.display = 'none';
    }

    resultSection.classList.remove('hidden');
    resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function renderHistory(history) {
    if (!history || history.length === 0) {
      historyList.innerHTML = '<div class="empty-history">Nenhum prompt otimizado ainda.</div>';
      return;
    }

    historyList.innerHTML = '';
    history.forEach((entry) => {
      const item = document.createElement('div');
      item.className = 'history-item';
      item.innerHTML = \`
        <span class="history-prompt">\${escHtml(entry.prompt)}</span>
        <div class="history-meta">
          <span class="score-pill">\${entry.result.score_melhorado}</span>
          <span class="history-time">\${timeAgo(entry.timestamp)}</span>
        </div>
      \`;
      // Click loads that history entry back into view
      item.addEventListener('click', () => {
        currentResult = entry.result;
        promptInput.value = entry.prompt;
        charCount.textContent = entry.prompt.length + ' chars';
        renderResult(entry.result);
      });
      historyList.appendChild(item);
    });
  }

  // ── SVG score ring ────────────────────────────────────────────────────────
  function drawRing(svgId, score) {
    const svg = $(svgId);
    const size = 72, strokeW = 5;
    const r = (size - strokeW * 2) / 2;
    const cx = size / 2, cy = size / 2;
    const circ = 2 * Math.PI * r;
    const offset = circ - (score / 100) * circ;

    const color = score >= 80 ? '#4ade80' : score >= 50 ? '#facc15' : '#f87171';

    svg.setAttribute('viewBox', \`0 0 \${size} \${size}\`);
    svg.innerHTML = \`
      <circle cx="\${cx}" cy="\${cy}" r="\${r}"
              fill="none" stroke="var(--border)" stroke-width="\${strokeW}" />
      <circle cx="\${cx}" cy="\${cy}" r="\${r}"
              fill="none" stroke="\${color}" stroke-width="\${strokeW}"
              stroke-dasharray="\${circ}" stroke-dashoffset="\${offset}"
              stroke-linecap="round"
              transform="rotate(-90 \${cx} \${cy})"
              style="transition:stroke-dashoffset 0.8s ease" />
      <text x="\${cx}" y="\${cy}" text-anchor="middle" dominant-baseline="central"
            fill="\${color}" font-size="16" font-weight="700"
            font-family="var(--font-ui)">\${score}</text>
    \`;
  }

  // ── Utilities ─────────────────────────────────────────────────────────────
  function escHtml(str) {
    return String(str)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function timeAgo(ts) {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'agora';
    if (mins < 60) return mins + 'min atrás';
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return hrs + 'h atrás';
    return Math.floor(hrs / 24) + 'd atrás';
  }
</script>
</body>
</html>`;
}

/** Gera um nonce aleatório para Content-Security-Policy. */
function getNonce(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let nonce = '';
  for (let i = 0; i < 32; i++) {
    nonce += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return nonce;
}
