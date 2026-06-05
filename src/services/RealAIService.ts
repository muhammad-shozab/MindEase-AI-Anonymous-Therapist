import GeminiService, { Message } from './GeminiService';
import OpenRouterService from './OpenRouterService';
import OpenAI from 'openai';

class RealAIService {
  private static instance: RealAIService;
  private gemini: GeminiService;
  private openRouter: OpenRouterService;
  private openaiClient: OpenAI | null;
  private openaiApiKey: string;
  private openaiModel: string;

  private constructor() {
    this.gemini = GeminiService.getInstance();
    this.openRouter = OpenRouterService.getInstance();
    this.openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
    this.openaiModel = import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o-mini';
    this.openaiClient = this.openaiApiKey
      ? new OpenAI({
          apiKey: this.openaiApiKey,
          dangerouslyAllowBrowser: true,
        })
      : null;
  }

  static getInstance(): RealAIService {
    if (!RealAIService.instance) {
      RealAIService.instance = new RealAIService();
    }
    return RealAIService.instance;
  }

  private getSystemPrompt(): string {
    return `You are Aria, a warm, practical AI therapist and mental health coach.

Always respond in this exact style:
1) A short acknowledgment sentence that reflects what the user said.
2) A numbered list with exactly 3 specific, practical steps.
3) One short hopeful reframe sentence.
4) One short follow-up question.

Quality rules:
- Be concrete and actionable, not generic.
- Keep tone caring, calm, and conversational.
- Do not ask multiple questions.
- Keep replies around 120-190 words.

Safety rule:
- Only include 988 guidance when the user explicitly indicates self-harm, suicide intent, or immediate danger.
- Do not include 988 for normal stress, relationship, mood, or everyday problems.`;
  }

  async chat(messages: Message[], _systemPrompt: string): Promise<string> {
    try {
      return await this.chatWithBestProvider(messages);
    } catch (error: any) {
      const msg = String(error?.message || '');
      if (msg.toLowerCase().includes('quota')) {
        throw new Error('AI is busy right now due to usage limits. Please retry in a minute.');
      }
      throw new Error('Unable to get a response right now. Please try again shortly.');
    }
  }

  private async chatWithBestProvider(messages: Message[]): Promise<string> {
    const systemPrompt = this.getSystemPrompt();

    if (this.openRouter.isConfigured()) {
      try {
        const text = await this.openRouter.chat(messages, systemPrompt);
        if (text?.trim()) return text.trim();
      } catch (error) {
        console.warn('OpenRouter failed, trying OpenAI/Gemini:', error);
      }
    }

    if (this.openaiClient) {
      try {
        const text = await this.chatWithOpenAI(messages, systemPrompt);
        if (text?.trim()) return text.trim();
      } catch (error) {
        console.warn('OpenAI failed, falling back to Gemini:', error);
      }
    }

    return this.gemini.chat(messages, systemPrompt);
  }

  private async chatWithOpenAI(messages: Message[], systemPrompt: string): Promise<string> {
    if (!this.openaiClient) {
      throw new Error('OpenAI not configured');
    }

    const formattedMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...messages.map((m) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      })),
    ];

    const response = await this.openaiClient.chat.completions.create({
      model: this.openaiModel,
      messages: formattedMessages,
      temperature: 0.8,
      max_tokens: 700,
    });

    const text = response?.choices?.[0]?.message?.content;
    if (!text || typeof text !== 'string') {
      throw new Error('OpenAI returned empty response');
    }
    return text.trim();
  }

  async getDailyQuote(): Promise<string> {
    const messages: Message[] = [
      {
        role: 'user',
        content: 'Give me one short, original, uplifting mental health quote for today. Just the quote, nothing else.',
        timestamp: Date.now(),
      },
    ];

    try {
      return await this.chatWithBestProvider(messages);
    } catch {
      return 'Small steps forward are still progress. Be kind to yourself today.';
    }
  }
}

export default RealAIService;
