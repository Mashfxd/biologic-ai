"use client";
import React, { useState, useEffect } from 'react';
import { PawPrint, Activity, Weight, TrendingUp, Cpu } from 'lucide-react';
import { cn } from '@/lib/utils';
import Card from '@/components/ui/Card';
import StatCard from '@/components/ui/StatCard';
// Asegúrate de tener este servicio creado, si no, puedes comentar la importación por ahora
import { analyzeProduction } from '@/lib/geminiService'; 

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
  setAiAnalysis("Consultando con el experto de BioLogic AI..."); // Mensaje de carga

  try {
    // Obtenemos los datos frescos
    const [resAni, resFeed, resGrowth, resHealth] = await Promise.all([
      fetch('/api/animals'),
      fetch('/api/feeding'),
      fetch('/api/growth'),
      fetch('/api/health')
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
      // Si el backend mandó un error, lo mostramos
      setAiAnalysis(`Aviso: ${result.error || "La IA no pudo procesar los datos."}`);
    }

  } catch (error) {
    setAiAnalysis("Error de conexión. Asegúrate de que el servidor esté corriendo.");
  } finally {
    setIsAnalyzing(false);
  }
};

  const totalWeight = animals.reduce((sum, a) => sum + (Number(a.currentWeight) || 0), 0);
  const averageWeight = animals.length > 0 ? (totalWeight / animals.length).toFixed(2) : "0.00";

  return (
    <div className="grid gap-4 md:gap-6">
      {/* 1. Tarjetas Superiores: 1 columna en móvil, 2 en tablet, 4 en PC */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard icon={PawPrint} label="Población Total" value={animals.length} color="bg-emerald-500" trend="+4%" />
        <StatCard icon={Activity} label="Estado Salud" value="Óptimo" color="bg-emerald-500" trend="98%" />
        <StatCard icon={Weight} label="Peso Promedio" value={`${averageWeight} kg`} color="bg-amber-500" />
        <StatCard icon={TrendingUp} label="Eficiencia FCR" value="1.2" color="bg-purple-500" />
      </div>

      {/* 2. Sección Principal: 1 columna en móvil/tablet, 12 columnas en PC */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
        
        {/* Gráfica */}
        <Card className="lg:col-span-8 flex flex-col p-4 md:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
            <h4 className="font-bold text-slate-800">Crecimiento Proyectado vs Real</h4>
            <div className="flex gap-2">
              <span className="text-[10px] bg-slate-100 px-2 py-1 rounded font-bold text-slate-500">Lote #04</span>
              <span className="text-[10px] bg-slate-100 px-2 py-1 rounded font-bold text-slate-500">Lote #12</span>
            </div>
          </div>
          {/* Contenedor responsivo para gráfica */}
          <div className="flex-1 min-h-[220px] overflow-x-auto pb-4">
             <div className="min-w-[500px] h-full flex items-end justify-between gap-2 border-b border-slate-100 px-2">
                {[24, 32, 40, 48, 56, 64, 100, 110, 56, 48].map((h, i) => (
                  <div key={i} style={{ height: `${h}%` }} className={cn("w-full max-w-[32px] rounded-t-sm", i < 8 ? (i % 2 === 0 ? "bg-emerald-100" : "bg-emerald-500") : "bg-slate-100")} />
                ))}
             </div>
          </div>
        </Card>

        {/* 3. Panel Lateral IA */}
        <div className="lg:col-span-4 space-y-4 md:space-y-6">
          <div className="bg-slate-900 text-white p-5 md:p-6 rounded-xl shadow-lg relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-emerald-500/20 text-emerald-400 rounded-md flex items-center justify-center"><Cpu size={14} /></div>
                <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-wider">IA ZooAI Activa</p>
              </div>
              <div className="text-xs text-emerald-50/80 leading-relaxed mb-6 italic min-h-[60px]">
                {aiAnalysis ? aiAnalysis : "Pulsa para analizar el estado de tu producción en tiempo real."}
              </div>
              <button onClick={runAiAnalysis} disabled={isAnalyzing} className="w-full sm:w-auto bg-white text-slate-900 text-[10px] font-bold py-3 px-6 rounded-lg hover:bg-emerald-50 transition-all uppercase">
                {isAnalyzing ? 'Calculando...' : 'Analizar Producción'}
              </button>
            </div>
          </div>
          <Card className="p-4 md:p-6">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-4">Alertas Críticas</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                <div className="w-2 h-2 mt-1.5 bg-red-500 rounded-full animate-pulse"></div>
                <div>
                  <p className="text-[11px] font-bold text-slate-800">Temperatura Alta - Galpón A</p>
                  <p className="text-[10px] text-slate-500 font-medium">Actual: 34°C</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}