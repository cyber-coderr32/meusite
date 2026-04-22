
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Tradução AI - Utiliza Gemini para traduzir textos e detectar idiomas
 */
export const translateText = async (
    text: string, 
    targetLanguage: string = 'Português'
): Promise<string> => {
    if (!text || text.trim().length === 0) return '';
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Traduza o seguinte texto para ${targetLanguage}. 
            Retorne APENAS a tradução, sem comentários adicionais.
            
            TEXTO: "${text}"`
        });

        const translated = response.text || text;
        return translated.trim();
    } catch (error) {
        console.error("Erro na Tradução AI:", error);
        return text; // Fallback para o texto original
    }
};
