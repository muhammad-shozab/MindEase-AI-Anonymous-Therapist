// Singleton Pattern - Single instance for Gemini API
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

class GeminiService {
  private static instance: GeminiService;
  private genAI: GoogleGenerativeAI | null = null;
  private readonly primaryModel = 'gemini-2.5-pro';
  private readonly fallbackModel = 'gemini-2.5-flash';

  private constructor() {
    const apiKey = import.meta.env.VITE_GEMINI_KEY;
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
  }

  static getInstance(): GeminiService {
    if (!GeminiService.instance) {
      GeminiService.instance = new GeminiService();
    }
    return GeminiService.instance;
  }

  async chat(messages: Message[], systemPrompt: string): Promise<string> {
    if (!this.genAI) {
      throw new Error('Gemini API key not configured. Please add VITE_GEMINI_KEY to your .env file');
    }

    try {
      const model = this.genAI.getGenerativeModel({
        model: this.primaryModel,
        generationConfig: {
          temperature: 0.45,
          topK: 40,
          topP: 0.92,
          maxOutputTokens: 800,
        },
      });

      // Build conversation history - only last 10 messages to avoid token limits
      const recentMessages = messages.slice(-10);
      const conversationHistory = recentMessages.map(msg => 
        `${msg.role === 'user' ? 'User' : 'Therapist'}: ${msg.content}`
      ).join('\n\n');

      const prompt = `${systemPrompt}

Conversation History:
${conversationHistory}

Write a direct therapeutic response to the user's latest message.
Do not ask multiple questions.
Prefer reflection + actionable help over interrogation.
At most one short follow-up question.`;

      let result = await model.generateContent(prompt);
      let response = await result.response;

      if (!response || !response.text) {
        throw new Error('Empty response from AI');
      }

      let text = response.text();

      // Retry once with a faster fallback model if primary output is empty.
      if (!text || !text.trim()) {
        const fallback = this.genAI.getGenerativeModel({
          model: this.fallbackModel,
          generationConfig: {
            temperature: 0.45,
            topK: 40,
            topP: 0.92,
            maxOutputTokens: 800,
          },
        });
        result = await fallback.generateContent(prompt);
        response = await result.response;
        text = response.text();
      }
      return text;
    } catch (error: any) {
      console.error('Gemini API Error Details:', error);
      
      if (error.message?.includes('API_KEY_INVALID') || error.message?.includes('API key')) {
        throw new Error('Invalid API key. Please check your VITE_GEMINI_KEY in .env file');
      }
      
      if (error.message?.includes('quota')) {
        throw new Error('API quota exceeded. Please try again later or use a different API key');
      }
      
      if (error.message?.includes('SAFETY')) {
        throw new Error('Message blocked by safety filters. Please rephrase your message');
      }
      
      throw new Error(`AI Error: ${error.message || 'Failed to get response. Please check your API key and internet connection'}`);
    }
  }

  async getDailyQuote(): Promise<string> {
    if (!this.genAI) {
      return "Take a deep breath. You are doing better than you think. 🌟";
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: this.fallbackModel });
      const result = await model.generateContent(
        'Generate one short, uplifting mental health quote (max 20 words). Just the quote, no attribution.'
      );
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Quote generation failed:', error);
      return "Every small step forward is progress. Be kind to yourself today.";
    }
  }
}

export default GeminiService;
