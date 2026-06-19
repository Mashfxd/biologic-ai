"use client";
import React, { useState, useEffect } from 'react';

import WelcomeModal from '@/components/layout/WelcomeModal';
import Card from '@/components/ui/Card';
import StatCard from '@/components/ui/StatCard';

import {
  PawPrint, Activity, Weight, TrendingUp, Cpu, Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();

    const savedUser = localStorage.getItem('zooai_user');
    if (savedUser) setCurrentUser(JSON.parse(savedUser));
  }, []);

  const fetchMetrics = async () => {
    setIsLoading(true);

    try {
      const res = await fetch('/api/metrics');

      if (res.ok) {
        const data = await res.json();
        setMetrics(data);
      }
    } catch (error) {
      console.error('Error cargando dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBasicAiAnalysis = () => {
    if (!metrics) return;

    const messages = [];

    const mortality = Number(metrics.tasaMortalidad || 0);
    const morbidity = Number(metrics.tasaMorbilidad || 0);
    const activePopulation = Number(metrics.poblacionActiva || 0);
    const sickAnimals = Number(metrics.animalesEnfermos || 0);
    const births = Number(metrics.produccion?.totalCrias || 0);
    const avgCurrentWeight = Number(metrics.pesoPromedioActual || 0);
    const avgBirthsPerDelivery = Number(metrics.produccion?.promedioCriasPorParto || 0);
    const ica = Number(metrics.eficiencia?.indiceConversionAlimenticia || 0);
    const icaInterpretation = metrics.eficiencia?.interpretacionICA;

    if (activePopulation === 0) {
      setAiAnalysis(
        'Aún no hay población activa suficiente para generar un análisis zootécnico. Registra animales sanos o en seguimiento para iniciar el diagnóstico.'
      );
      return;
    }

    if (morbidity >= 20) {
      messages.push(
        `Salud animal: morbilidad alta (${morbidity}%). Se recomienda revisar ventilación, limpieza, densidad por poza y seguimiento sanitario de los ${sickAnimals} animales enfermos.`
      );
    } else if (morbidity >= 8) {
      messages.push(
        `Salud animal: morbilidad moderada (${morbidity}%). Conviene reforzar observación clínica y separar animales con signos de enfermedad.`
      );
    } else {
      messages.push(
        `Salud animal: morbilidad controlada (${morbidity}%). El estado sanitario general parece estable.`
      );
    }

    if (mortality >= 10) {
      messages.push(
        `Mortalidad elevada (${mortality}%). Revisa causas de muerte, manejo térmico, alimentación, bioseguridad y registros de tratamientos.`
      );
    } else if (mortality > 0) {
      messages.push(
        `Mortalidad presente pero baja (${mortality}%). Mantén seguimiento para evitar incremento.`
      );
    } else {
      messages.push(
        'No se registra mortalidad acumulada. Es un indicador positivo para la granja.'
      );
    }

    if (births === 0) {
      messages.push(
        'Productividad: todavía no hay nacimientos registrados. Cuando agregues partos, el sistema podrá evaluar productividad reproductiva.'
      );
    } else if (avgBirthsPerDelivery < 2.5) {
      messages.push(
        `Productividad: promedio de crías por parto bajo (${avgBirthsPerDelivery}). Revisa edad reproductiva, condición corporal, empadre y selección de reproductores.`
      );
    } else if (avgBirthsPerDelivery <= 4) {
      messages.push(
        `Productividad: promedio de crías por parto aceptable (${avgBirthsPerDelivery}). La producción reproductiva parece dentro de un rango funcional.`
      );
    } else {
      messages.push(
        `Productividad: promedio de crías por parto alto (${avgBirthsPerDelivery}). Buen rendimiento reproductivo; conviene vigilar peso al nacimiento y supervivencia.`
      );
    }

    if (avgCurrentWeight > 0 && avgCurrentWeight < 500) {
      messages.push(
        `Crecimiento: peso promedio actual bajo (${avgCurrentWeight} g). Verifica edad de los animales, calidad de dieta y frecuencia de pesaje.`
      );
    } else if (avgCurrentWeight >= 500) {
      messages.push(
        `Crecimiento: peso promedio actual de ${avgCurrentWeight} g. El crecimiento general parece favorable según la población registrada.`
      );
    }

    if (ica > 0) {
      messages.push(
        `Eficiencia alimenticia: ICA ${ica}. ${icaInterpretation}`
      );
    } else {
      messages.push(
        'Eficiencia alimenticia: aún no hay datos suficientes para calcular el ICA. Registra alimentación y al menos dos pesajes por animal.'
      );
    }

    setAiAnalysis(messages.join(' '));
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <p className="font-medium">Calculando métricas zootécnicas...</p>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white">
          No se pudieron cargar las métricas
        </h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Revisa la API de métricas o vuelve a intentarlo.
        </p>
        <button
          type="button"
          onClick={fetchMetrics}
          className="mt-4 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:gap-6 animate-in fade-in duration-500">
      <WelcomeModal user={currentUser} stats={{
        totalAnimals: metrics.poblacionActiva,
        alerts: metrics.alertasRecientes.length,
        ready: metrics.animalesEnfermos,
      }} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
        <StatCard
          icon={PawPrint}
          label="Población Activa"
          value={metrics.poblacionActiva}
          color="bg-emerald-500"
          trend="Real"
        />
        <StatCard
          icon={Activity}
          label="Animales en Tratamiento"
          value={metrics.animalesEnfermos}
          color="bg-rose-500"
          trend={`Morbilidad ${metrics.tasaMorbilidad}%`}
        />
        <StatCard
          icon={Weight}
          label="Peso Promedio Actual"
          value={`${metrics.pesoPromedioActual} g`}
          color="bg-amber-500"
        />
        <StatCard
          icon={TrendingUp}
          label="Total Nacimientos"
          value={metrics.produccion.totalCrias}
          color="bg-purple-500"
        />
        <StatCard
          icon={Activity}
          label="ICA"
          value={metrics.eficiencia?.indiceConversionAlimenticia || '0.00'}
          color="bg-cyan-500"
          trend="kg alimento / kg ganado"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
        <Card className="lg:col-span-8 flex flex-col p-4 md:p-6 dark:bg-slate-900 dark:border-slate-800 transition-colors">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
            <h4 className="font-bold text-slate-800 dark:text-white">Crecimiento Proyectado vs Real</h4>
          </div>
          <div className="flex-1 min-h-[220px] overflow-x-auto pb-4">
            <div className="min-w-[500px] h-full flex items-end justify-between gap-2 border-b border-slate-100 dark:border-slate-800 px-2">
              {[24, 32, 40, 48, 56, 64, 100, 110, 56, 48].map((h, i) => (
                <div key={i} style={{ height: `${h}%` }} className={cn('w-full max-w-[32px] rounded-t-sm transition-all hover:opacity-80', i < 8 ? (i % 2 === 0 ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-emerald-500') : 'bg-slate-100 dark:bg-slate-800')} />
              ))}
            </div>
          </div>
        </Card>

        <div className="lg:col-span-4 space-y-4 md:gap-6">
          <div className="bg-slate-900 text-white p-5 md:p-6 rounded-xl shadow-lg relative border border-slate-800 hover:border-emerald-500/30 transition-colors">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-emerald-500/20 text-emerald-400 rounded-md flex items-center justify-center">
                  <Cpu size={14} />
                </div>
                <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-wider">BioLogic IA Activa</p>
              </div>
              <div className="text-xs text-emerald-50/80 leading-relaxed mb-6 italic min-h-[60px]">
                {aiAnalysis || 'Pulsa para analizar el rendimiento zootécnico en tiempo real basado en la base de datos.'}
              </div>
              <button
                type="button"
                onClick={handleBasicAiAnalysis}
                className="w-full bg-emerald-600 text-white text-[10px] font-bold py-3 px-6 rounded-lg hover:bg-emerald-500 transition-all uppercase focus-visible:ring-2 focus-visible:ring-emerald-400 outline-none"
              >
                Analizar Producción
              </button>
            </div>
          </div>

          <Card className="p-4 md:p-6 dark:bg-slate-900 dark:border-slate-800 transition-colors">
            <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-widest mb-4">Alertas de Salud</h4>
            <div className="space-y-3">
              {metrics.alertasRecientes.length > 0 ? (
                metrics.alertasRecientes.map((alerta) => (
                  <div key={alerta.id} className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/30 transition-colors">
                    <div className="w-2 h-2 mt-1.5 bg-red-500 rounded-full animate-pulse flex-shrink-0"></div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-800 dark:text-red-200 uppercase">{alerta.diagnostic}</p>
                      <p className="text-[10px] text-slate-600 dark:text-red-300/80 font-medium mt-0.5">
                        Animal: {alerta.animal?.name || 'Desconocido'} - {new Date(alerta.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center rounded-lg border border-emerald-100 dark:border-emerald-900/30 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                  No hay alertas médicas recientes.
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
