import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class TranslationService {
  private genAI: GoogleGenerativeAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not defined');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async translateText({
    text,
    sourceLang,
    targetLang,
    field,
  }: {
    text: string;
    sourceLang: 'th';
    targetLang: string;
    field: 'name' | 'description';
  }): Promise<string> {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    let prompt = `Translate the following product description from ${sourceLang} to ${targetLang} in a neutral and professional tone:\n\n"${text}"`;

    if (field === 'name') {
      prompt = `Show only the ${targetLang === 'ch' ? 'chinese' : targetLang} translation of the word "${text}"`;
    }
    try {
      const { response } = await model.generateContent(prompt);

      return response.text();
    } catch (error) {
      console.error('Error with API:', error);
      throw new Error('Failed to translate text');
    }
  }
}
