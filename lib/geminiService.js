import { GoogleGenAI } from '@google/genai';

/**
 * Genera un diagnóstico zootécnico determinista basado en reglas reales
 * como respaldo cuando no hay GEMINI_API_KEY configurada o falla la red.
 */
export function generateRuleBasedAnalysis(summary) {
  const {
    activePopulation = 0,
    sickAnimals = 0,
    morbidityRate = 0,
    mortalityRate = 0,
    avgCurrentWeight = 0,
    totalBirths = 0,
    avgBirthsPerDelivery = 0,
    ica = 0,
  } = summary || {};

  if (activePopulation === 0) {
    return 'Aún no hay población activa suficiente para generar un análisis zootécnico. Registra animales sanos o en seguimiento para iniciar el diagnóstico.';
  }

  const messages = [];

  if (morbidityRate >= 20) {
    messages.push(
      `Salud animal: morbilidad alta (${morbidityRate}%). Se recomienda revisar ventilación, limpieza, densidad por poza y seguimiento sanitario de los ${sickAnimals} animales en tratamiento.`
    );
  } else if (morbidityRate >= 8) {
    messages.push(
      `Salud animal: morbilidad moderada (${morbidityRate}%). Conviene reforzar observación clínica y aislar preventivamente animales con síntomas.`
    );
  } else {
    messages.push(
      `Salud animal: morbilidad controlada (${morbidityRate}%). El estado sanitario general de la granja es estable.`
    );
  }

  if (mortalityRate >= 10) {
    messages.push(
      `Mortalidad elevada (${mortalityRate}%). Revisa causas de baja, manejo térmico, bioseguridad y protocolos de tratamiento.`
    );
  } else if (mortalityRate > 0) {
    messages.push(
      `Mortalidad acumulada baja (${mortalityRate}%). Mantén el monitoreo preventivo.`
    );
  } else {
    messages.push('Sin mortalidad registrada, indicador positivo de bioseguridad.');
  }

  if (totalBirths === 0) {
    messages.push(
      'Productividad: sin partos registrados aún para evaluar desempeño reproductivo.'
    );
  } else if (avgBirthsPerDelivery < 2.5) {
    messages.push(
      `Productividad: promedio de crías por parto bajo (${avgBirthsPerDelivery}). Revisa condición corporal y selección de reproductores.`
    );
  } else {
    messages.push(
      `Productividad: promedio de ${avgBirthsPerDelivery} crías por parto (${totalBirths} nacidos vivos en total).`
    );
  }

  if (avgCurrentWeight > 0 && avgCurrentWeight < 500) {
    messages.push(
      `Crecimiento: peso promedio actual en etapa inicial o bajo (${avgCurrentWeight} g). Verifica curva de crecimiento y ración diaria.`
    );
  } else if (avgCurrentWeight >= 500) {
    messages.push(
      `Crecimiento: peso promedio actual de ${avgCurrentWeight} g con evolución favorable.`
    );
  }

  if (ica > 0) {
    const icaNote =
      ica <= 3
        ? 'conversión eficiente'
        : ica <= 5
          ? 'conversión aceptable, monitorear dieta'
          : 'conversión elevada, revisar desperdicio o calidad de alimento';
    messages.push(`Eficiencia alimenticia: ICA de ${ica.toFixed(2)} (${icaNote}).`);
  } else {
    messages.push(
      'Eficiencia alimenticia: registra alimentación y al menos dos pesajes por animal para calcular el ICA.'
    );
  }

  return messages.join(' ');
}

export async function analyzeProduction({
  animals = [],
  growthLogs = [],
  feedingLogs = [],
  healthLogs = [],
  summary = {},
}) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    return {
      analysis: generateRuleBasedAnalysis(summary),
      source: 'rule-based',
    };
  }

  const prompt = `
Eres un ingeniero zootecnista experto en producción de animales menores (cuyes, conejos, aves).
Analiza los siguientes datos reales de la granja y proporciona en un párrafo estructurado y directo (máximo 140 palabras):
1. Estado actual sanitario y productivo.
2. Alertas críticas basadas en pesos, salud o conversión alimenticia (ICA).
3. Dos recomendaciones concretas de manejo u optimización.

RESUMEN DE MÉTRICAS:
${JSON.stringify(summary)}

MUESTRA DE ANIMALES (últimos 10):
${JSON.stringify(animals.slice(0, 10))}

REGISTROS DE CRECIMIENTO (últimos 15):
${JSON.stringify(growthLogs.slice(0, 15))}

REGISTROS DE ALIMENTACIÓN (últimos 15):
${JSON.stringify(feedingLogs.slice(0, 15))}

REGISTROS DE SALUD (últimos 10):
${JSON.stringify(healthLogs.slice(0, 10))}

Responde de forma concisa, técnica y en español plano (sin bloques markdown complejos).
`.trim();

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const text = response?.text?.trim();
    if (!text) {
      return {
        analysis: generateRuleBasedAnalysis(summary),
        source: 'rule-based-fallback',
      };
    }

    return {
      analysis: text,
      source: 'gemini',
    };
  } catch (error) {
    console.error('AI Analysis Error (Gemini):', error);
    return {
      analysis: generateRuleBasedAnalysis(summary),
      source: 'rule-based-fallback',
    };
  }
}
