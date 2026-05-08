import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();
    const numAnimals = body.animals?.length || 0;
    const numGrowth = body.growth?.length || 0;

    // Base de conocimientos experta para el simulador
    const consejos = [
      "Se observa un patrón estable. Se recomienda aumentar el forraje verde un 5% para mejorar la conversión alimenticia.",
      "Atención: Los registros de peso sugieren que el Lote actual podría alcanzar el peso de mercado en 2 semanas. Prepare el área de despacho.",
      "Recomendación técnica: Mantener la temperatura del galpón entre 18°C y 24°C para evitar el estrés térmico en las crías.",
      "Análisis BioLogic: La relación entre alimentación y ganancia de peso es óptima. Mantenga el cronograma de desparasitación.",
      "Consejo del experto: El registro de salud muestra estabilidad. Sugerimos rotar el tipo de concentrado para evitar el rechazo por palatabilidad."
    ];

    // Lógica: Si no hay animales, pide registros. Si hay, da un consejo aleatorio.
    let respuesta;
    if (numAnimals === 0) {
      respuesta = "El cerebro de BioLogic AI está listo. Por favor, registra tu primer animal para iniciar el análisis técnico.";
    } else if (numGrowth === 0) {
      respuesta = `He detectado ${numAnimals} animales. Para darte consejos de crecimiento, necesito que registres el primer pesaje en el módulo de Crecimiento.`;
    } else {
      // Elige un consejo aleatorio para que parezca que la IA está pensando
      respuesta = consejos[Math.floor(Math.random() * consejos.length)];
    }

    // Simulamos un pequeño retraso para que el usuario sienta que la IA está "procesando"
    await new Promise(resolve => setTimeout(resolve, 1500));

    return NextResponse.json({ analysis: respuesta });

  } catch (error) {
    return NextResponse.json({ analysis: "El módulo de IA se está sincronizando. Intenta en un momento." });
  }
}