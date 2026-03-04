/**
 * Serviço responsável por chamar a API da Anthropic e retornar o prompt otimizado.
 */

export interface OptimizationResult {
  prompt_melhorado: string;
  melhorias: string[];
  score_original: number;
  score_melhorado: number;
  dica_extra: string;
}

// ── System prompt que guia o Claude na otimização ─────────────────────────
const SYSTEM_PROMPT = `Você é um especialista em engenharia de prompts para Claude (Anthropic). Sua única função é receber um prompt do usuário e devolvê-lo melhorado, aplicando as melhores práticas.

Ao melhorar um prompt, você deve:
1. Adicionar contexto claro e objetivo
2. Especificar o formato de saída desejado
3. Definir o papel/persona quando relevante
4. Incluir restrições ou limitações importantes
5. Usar linguagem precisa e sem ambiguidade
6. Dividir tarefas complexas em etapas
7. Adicionar exemplos quando necessário (few-shot)
8. Especificar tom, estilo ou nível técnico esperado

Responda SEMPRE neste formato JSON exato (sem markdown, sem explicações fora do JSON):
{
  "prompt_melhorado": "O prompt reescrito e otimizado aqui",
  "melhorias": [
    "Melhoria 1 aplicada",
    "Melhoria 2 aplicada",
    "Melhoria 3 aplicada"
  ],
  "score_original": 45,
  "score_melhorado": 92,
  "dica_extra": "Uma dica adicional específica para este tipo de prompt"
}

Os scores são de 0-100 indicando a qualidade do prompt para obter resultados ótimos de uma IA.`;

/**
 * Chama a API do Claude para otimizar o prompt fornecido.
 *
 * @param prompt   - Texto do prompt original do usuário
 * @param apiKey   - API Key da Anthropic
 * @param model    - Modelo Claude a utilizar
 * @returns        Objeto com o resultado estruturado da otimização
 */
export async function optimizePrompt(
  prompt: string,
  apiKey: string,
  model: string
): Promise<OptimizationResult> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: `Meu prompt: ${prompt}` }],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({})) as { error?: { message?: string } };
    throw new Error(
      errorData?.error?.message ?? `Erro HTTP ${response.status}: ${response.statusText}`
    );
  }

  const data = await response.json() as {
    content?: Array<{ type: string; text?: string }>;
  };

  // Extrai o bloco de texto da resposta
  const rawText = data.content?.find((b) => b.type === 'text')?.text ?? '';

  // Remove possíveis marcações de código antes do parse
  const clean = rawText.replace(/```json|```/g, '').trim();

  try {
    return JSON.parse(clean) as OptimizationResult;
  } catch {
    throw new Error('Resposta da API não está no formato JSON esperado.');
  }
}
