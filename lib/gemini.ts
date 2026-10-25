import { GoogleGenAI } from '@google/genai';

// Initialisation du SDK Google Gen AI avec la clé stockée dans .env.local
const apiKey = process.env.GEMINI_API_KEY || '';

if (!apiKey) {
  console.warn("Attention : GEMINI_API_KEY n'est pas définie dans les variables d'environnement.");
}

export const ai = new GoogleGenAI({ apiKey });