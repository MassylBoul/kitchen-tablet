import { NextResponse } from 'next/server';
import { ai } from '@/lib/gemini';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message manquant' }, { status: 400 });
    }

    // Utilisation du modèle recommandé par l'API Google
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: message,
      config: {
        systemInstruction: "Tu es un chef cuisinier expert, chaleureux et concis, intégré sur une tablette tactile de cuisine. Donne des astuces pratiques, des recettes rapides et aide à la gestion de la maison.",
      },
    });

    return NextResponse.json({ reply: response.text });
  } catch (error) {
    console.error('Erreur API Gemini :', error);
    return NextResponse.json({ error: 'Erreur lors de la communication avec l\'IA' }, { status: 500 });
  }
}