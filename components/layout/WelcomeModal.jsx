"use client";
import React, { useState } from 'react';
import { X, ArrowRight, PawPrint, Activity, Heart, ChartBar } from 'lucide-react';

export default function WelcomeModal({ user, stats }) {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-950 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-300">
        <div className="relative h-32 bg-emerald-600 flex items-center justify-center">
          <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/40 text-white rounded-full transition-colors">
            <X size={20} />
          </button>
          <img src="/logo.jpg" alt="SEREPAR" className="h-20 drop-shadow-lg" />
        </div>
        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-slate-800 dark:text-white">¡Hola, {user.username}! 👋</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Resumen actual de la granja para hoy.</p>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
              <p className="text-2xl font-black text-slate-800 dark:text-white">{stats.totalAnimals}</p>
              <span className="text-[10px] font-bold uppercase text-slate-400">Población</span>
            </div>
            {/* ... Agrega los demás stats aquí ... */}
          </div>
          <button onClick={() => setIsOpen(false)} className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl flex items-center justify-center gap-3 hover:gap-5 transition-all group">
            Continuar al Dashboard <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}