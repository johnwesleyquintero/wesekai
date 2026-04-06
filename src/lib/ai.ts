import { GoogleGenAI } from '@google/genai';
import { Recommendation } from '../types';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey: API_KEY });

export async function getWesleyAnalysis(
  recommendation: Recommendation,
  userPreferences: Record<string, number>
): Promise<string> {
  if (!API_KEY) {
    return 'Intelligence Layer offline. (Missing API Key)';
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

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', // Use 2.0 as 1.5 is deprecated in 2026
      contents: prompt,
    });

    return response.text || 'Analysis complete, but the response was empty.';
  } catch (error) {
    console.error('Wesley Analysis Error:', error);
    // Fallback if 2.0 fails, try 1.5-flash-latest or return error
    return 'Analysis failed. The Intelligence Layer encountered a quantum fluctuation.';
  }
}
