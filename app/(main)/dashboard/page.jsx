"use client";
import React, { useState, useEffect } from 'react';

// CORRECCIÓN: Rutas relativas apuntando a app/components/
import WelcomeModal from '../../components/WelcomeModal'; 
import Card from '../../components/ui/Card';
import StatCard from '../../components/ui/StatCard';

import { 
  PawPrint, Activity, Weight, TrendingUp, Cpu 
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const [animals, setAnimals] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => { 
    fetchAnimals();
    // Obtener usuario para el saludo
    const savedUser = localStorage.getItem('zooai_user');
    if (savedUser) setCurrentUser(JSON.parse(savedUser));
  }, []);

  const fetchAnimals = async () => {
    try {
      const res = await fetch('/api/animals');
      const data = await res.json();
      setAnimals(Array.isArray(data) ? data : []);
    } catch (error) { setAnimals([]); }
  };

  // Lógica para llenar los datos del Modal
  const systemStats = {
    totalAnimals: animals?.length || 0,
    alerts: 8,
    // El ? protege el código en caso de que animals sea null por un microsegundo
    ready: animals?.filter(a => a?.gender === 'Hembra' && a?.currentWeight >= 800)?.length || 0,
    gpd: 12.4
  };

  const totalWeight = animals.reduce((sum, a) => sum + (Number(a.currentWeight) || 0), 0);
  const averageWeight = animals.length > 0 ? (totalWeight / animals.length).toFixed(2) : "0.00";

  return (
    <div className="grid gap-4 md:gap-6">
      
      {/* VENTANA FLOTANTE DE BIENVENIDA (Solo aparece al loguear) */}
      <WelcomeModal user={currentUser} stats={systemStats} />

      {/* --- ESTADÍSTICAS (Diseño Original) --- */}
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
          <div className="bg-slate-900 text-white p-5 md:p-6 rounded-xl shadow-lg relative border border-slate-800">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-emerald-500/20 text-emerald-400 rounded-md flex items-center justify-center"><Cpu size={14} /></div>
                <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-wider">BioLogic IA Activa</p>
              </div>
              <div className="text-xs text-emerald-50/80 leading-relaxed mb-6 italic min-h-[60px]">
                {aiAnalysis || "Pulsa para analizar el rendimiento zootécnico en tiempo real."}
              </div>
              <button className="w-full bg-emerald-600 text-white text-[10px] font-bold py-3 px-6 rounded-lg hover:bg-emerald-500 transition-all uppercase">
                Analizar Producción
              </button>
            </div>
          </div>

          <Card className="p-4 md:p-6 dark:bg-slate-900 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-widest mb-4">Alertas Críticas</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/30">
                <div className="w-2 h-2 mt-1.5 bg-red-500 rounded-full animate-pulse"></div>
                <div>
                  <p className="text-[11px] font-bold text-slate-800 dark:text-red-200">Revisión de Empadre</p>
                  <p className="text-[10px] text-slate-500 dark:text-red-300 font-medium">{systemStats.ready} hembras aptas</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}