import { GoogleGenAI } from '@google/genai';
import { Recommendation } from '../types';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey: API_KEY });

// Simple in-memory cache to prevent redundant API calls
const analysisCache = new Map<string, string>();

export async function getWesleyAnalysis(
  recommendation: Recommendation,
  userPreferences: Record<string, number>
): Promise<string> {
  if (!API_KEY) {
    return 'Intelligence Layer offline. (Missing API Key)';
  }

  if (analysisCache.has(recommendation.title)) {
    return analysisCache.get(recommendation.title)!;
  }

  try {
    // Format top preferences for context
    const topPositive = Object.entries(userPreferences)
      .filter(([, weight]) => weight > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag]) => tag);

    const prompt = `
      You are the Wesley Intelligence Layer, an advanced AI specialized in Isekai and Fantasy content.
      Analyze why the following recommendation fits the user's taste.

      Anime/Manhwa: ${recommendation.title}
      Tags: ${recommendation.tags.join(', ')}
      World Building Score: ${recommendation.wbScore}/10

      User's Top Interests: ${topPositive.join(', ')}

      Provide a concise (2-3 sentences) analysis in a sophisticated, slightly futuristic tone. 
      Focus on how the specific tags align with their interests or why the world-building is notable.
      Don't use markdown formatting, just plain text.
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
      });
      const text =
        response.text || 'The Intelligence Layer processed the data but returned silence.';
      analysisCache.set(recommendation.title, text);
      return text;
    } catch {
      // Secondary fallback to stable 1.5 if 2.0 has an outage
      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash-latest',
        contents: prompt,
      });
      const text = response.text || 'Intelligence Layer fallback complete.';
      analysisCache.set(recommendation.title, text);
      return text;
    }
  } catch (error) {
    console.error('Wesley Analysis Error:', error);
    return 'The Intelligence Layer encountered a quantum fluctuation. Recalibrating...';
  }
}
