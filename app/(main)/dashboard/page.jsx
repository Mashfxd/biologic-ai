"use client";
import React, { useState, useEffect } from 'react';
import { 
  PawPrint, Activity, Weight, TrendingUp, Cpu, 
  PlusCircle, ClipboardList, ChartBar 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Card from '@/components/ui/Card';
import StatCard from '@/components/ui/StatCard';

export default function DashboardPage() {
  const [animals, setAnimals] = useState([]);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => { fetchAnimals(); }, []);

  const fetchAnimals = async () => {
    try {
      const res = await fetch('/api/animals');
      const text = await res.text(); 
      if (!res.ok || !text) { setAnimals([]); return; }
      const data = JSON.parse(text);
      setAnimals(Array.isArray(data) ? data : []);
    } catch (error) { setAnimals([]); }
  };

  const runAiAnalysis = async () => {
    setIsAnalyzing(true);
    setAiAnalysis("Consultando con el experto de BioLogic AI...");
    try {
      const [resAni, resFeed, resGrowth, resHealth] = await Promise.all([
        fetch('/api/animals'), fetch('/api/feeding'), fetch('/api/growth'), fetch('/api/health')
      ]);
      const data = {
        animals: await resAni.json(),
        feeding: await resFeed.json(),
        growth: await resGrowth.json(),
        health: await resHealth.json()
      };
      const resAi = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await resAi.json();
      if (resAi.ok && result.analysis) {
        setAiAnalysis(result.analysis);
      } else {
        setAiAnalysis(`Aviso: ${result.error || "La IA no pudo procesar los datos."}`);
      }
    } catch (error) {
      setAiAnalysis("Error de conexión con el servidor.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const totalWeight = animals.reduce((sum, a) => sum + (Number(a.currentWeight) || 0), 0);
  const averageWeight = animals.length > 0 ? (totalWeight / animals.length).toFixed(2) : "0.00";

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* --- NUEVA SECCIÓN DE BIENVENIDA --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">
            ¡Bienvenido a BioLogic AI! 👋
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Gestión técnica y productiva para SEREPAR S.R.L.
          </p>
        </div>
        <div className="px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-2xl">
          <span className="text-emerald-700 dark:text-emerald-400 text-sm font-bold">Servidor: Operativo 🟢</span>
        </div>
      </div>

      {/* --- BOTONES DE ACCIÓN RÁPIDA --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-emerald-500 transition-all group">
          <div className="text-left">
            <p className="font-bold text-slate-700 dark:text-slate-200 group-hover:text-emerald-600">Nuevo Pesaje</p>
            <p className="text-[10px] text-slate-400">Registrar evolución de peso</p>
          </div>
          <PlusCircle className="text-slate-300 group-hover:text-emerald-500" size={20} />
        </button>
        <button className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-blue-500 transition-all group">
          <div className="text-left">
            <p className="font-bold text-slate-700 dark:text-slate-200 group-hover:text-blue-600">Control Sanitario</p>
            <p className="text-[10px] text-slate-400">Tratamientos y vacunas</p>
          </div>
          <Activity className="text-slate-300 group-hover:text-blue-500" size={20} />
        </button>
        <button className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-amber-500 transition-all group">
          <div className="text-left">
            <p className="font-bold text-slate-700 dark:text-slate-200 group-hover:text-amber-600">Índices de Tesis</p>
            <p className="text-[10px] text-slate-400">Ver GPD y Prolificidad</p>
          </div>
          <ChartBar className="text-slate-300 group-hover:text-amber-500" size={20} />
        </button>
      </div>

      {/* --- ESTADÍSTICAS EXISTENTES --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard icon={PawPrint} label="Población Total" value={animals.length} color="bg-emerald-500" trend="+4%" />
        <StatCard icon={Activity} label="Estado Salud" value="Óptimo" color="bg-emerald-500" trend="98%" />
        <StatCard icon={Weight} label="Peso Promedio" value={`${averageWeight} g`} color="bg-amber-500" />
        <StatCard icon={TrendingUp} label="Eficiencia FCR" value="1.2" color="bg-purple-500" />
      </div>

      {/* --- GRÁFICA E IA --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
        <Card className="lg:col-span-8 flex flex-col p-4 md:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
            <h4 className="font-bold text-slate-800 dark:text-white">Crecimiento Proyectado vs Real</h4>
          </div>
          <div className="flex-1 min-h-[220px] overflow-x-auto pb-4">
            <div className="min-w-[500px] h-full flex items-end justify-between gap-2 border-b border-slate-100 px-2">
              {[24, 32, 40, 48, 56, 64, 100, 110, 56, 48].map((h, i) => (
                <div key={i} style={{ height: `${h}%` }} className={cn("w-full max-w-[32px] rounded-t-sm", i < 8 ? (i % 2 === 0 ? "bg-emerald-100" : "bg-emerald-500") : "bg-slate-100")} />
              ))}
            </div>
          </div>
        </Card>

        <div className="lg:col-span-4 space-y-4 md:space-y-6">
          <div className="bg-slate-900 text-white p-5 md:p-6 rounded-xl shadow-lg relative overflow-hidden group border border-slate-800">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-emerald-500/20 text-emerald-400 rounded-md flex items-center justify-center"><Cpu size={14} /></div>
                <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-wider">BioLogic IA Activa</p>
              </div>
              <div className="text-xs text-emerald-50/80 leading-relaxed mb-6 italic min-h-[60px]">
                {aiAnalysis ? aiAnalysis : "Pulsa para analizar el rendimiento zootécnico en tiempo real."}
              </div>
              <button onClick={runAiAnalysis} disabled={isAnalyzing} className="w-full bg-emerald-600 text-white text-[10px] font-bold py-3 px-6 rounded-lg hover:bg-emerald-500 transition-all uppercase">
                {isAnalyzing ? 'Calculando Índices...' : 'Analizar Producción'}
              </button>
            </div>
          </div>

          <Card className="p-4 md:p-6 dark:bg-slate-900 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-widest mb-4">Alertas Críticas</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/30">
                <div className="w-2 h-2 mt-1.5 bg-red-500 rounded-full animate-pulse"></div>
                <div>
                  <p className="text-[11px] font-bold text-slate-800 dark:text-red-200">Revisión de Empadre Pendiente</p>
                  <p className="text-[10px] text-slate-500 dark:text-red-300 font-medium">3 hembras superaron los 800g</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}