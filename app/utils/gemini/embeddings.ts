import { GoogleGenAI } from "@google/genai";

export async function getEmbedding(text: string) {

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

    const response = await ai.models.embedContent({
        model: 'text-embedding-004',
        contents: text,
        config: {
            taskType: "SEMANTIC_SIMILARITY",
        }
    });

    return response.embeddings ? response.embeddings[0].values : [];
}