import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function analyzeProduction(animals, growthLogs, feedingLogs) {
  if (!process.env.GEMINI_API_KEY) {
    return "La API Key de Gemini no está configurada. No se pueden generar análisis.";
  }

  const prompt = `
    Eres un experto en optimización de producción animal menor (conejos, aves, etc.).
    Analiza los siguientes datos de producción y proporciona:
    1. Un resumen del estado actual.
    2. 3 Alertas inteligentes basadas en tendencias de crecimiento o salud.
    3. Recomendaciones de optimización para mejorar el rendimiento.

    DATOS:
    Animales: ${JSON.stringify(animals.slice(0, 10))}
    Logs de Crecimiento: ${JSON.stringify(growthLogs.slice(0, 20))}
    Logs de Alimentación: ${JSON.stringify(feedingLogs.slice(0, 20))}

    Responde de forma concisa y profesional en español.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return "Error al generar el análisis de IA.";
  }
}
