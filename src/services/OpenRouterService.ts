import { Message } from './GeminiService';

class OpenRouterService {
  private static instance: OpenRouterService;
  private readonly apiKey: string;
  private readonly apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
  private readonly models = [
    'deepseek/deepseek-v3.1:free',
    'openai/gpt-oss-120b:free',
    'nvidia/nemotron-3-super-120b-a12b:free',
    'z-ai/glm-4.5-air:free',
    'openrouter/auto',
  ];

  private constructor() {
    this.apiKey = import.meta.env.VITE_OPENROUTER_API_KEY || '';
  }

  static getInstance(): OpenRouterService {
    if (!OpenRouterService.instance) {
      OpenRouterService.instance = new OpenRouterService();
    }
    return OpenRouterService.instance;
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey && !this.apiKey.includes('your_'));
  }

  async chat(messages: Message[], systemPrompt: string): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('OpenRouter API key missing. Add VITE_OPENROUTER_API_KEY to .env and restart dev server.');
    }

    const recentMessages = messages.slice(-16);
    let lastError: Error | null = null;

    for (const model of this.models) {
      try {
        return await this.tryModel(model, recentMessages, systemPrompt);
      } catch (error: any) {
        lastError = error;
        if (error?.name === 'AbortError') {
          throw error;
        }
      }
    }

    throw new Error(
      `All OpenRouter models failed. ${lastError?.message || 'Please try again in a moment.'}`
    );
  }

  private async tryModel(model: string, messages: Message[], systemPrompt: string): Promise<string> {
    const openRouterMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map((m) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      })),
    ];

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'MindEase Therapy App',
      },
      body: JSON.stringify({
        model,
        messages: openRouterMessages,
        max_tokens: 700,
        temperature: 0.75,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.error?.message || `HTTP ${response.status}`);
    }

    const choice = data?.choices?.[0];
    const text =
      choice?.message?.content ||
      choice?.text ||
      data?.output ||
      data?.content ||
      null;

    if (!text || typeof text !== 'string' || !text.trim()) {
      throw new Error(`Empty response from ${model}`);
    }

    return text.trim();
  }
}

export default OpenRouterService;
