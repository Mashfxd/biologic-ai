"use client";
import React from 'react';
import Card from '@/components/ui/Card';
import { PlusCircle, FileText } from 'lucide-react';

export default function ProductionPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Cabecera del Módulo */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white">
            Producción y Eventos Reproductivos
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">
            Digitalización de registros de empadre, partos y cálculo de prolificidad.
          </p>
        </div>
        <button className="bg-emerald-600 text-white font-bold px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-emerald-700 transition-colors shadow-sm">
          <PlusCircle size={18} />
          Nuevo Registro de Parto
        </button>
      </div>

      {/* Contenedor temporal simulando tu cuaderno físico */}
      <Card className="p-8 flex flex-col items-center justify-center text-center min-h-[400px] border-dashed border-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-4">
          <FileText size={32} />
        </div>
        <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-2">
          Módulo de Producción Listo
        </h3>
        <p className="text-slate-500 dark:text-slate-400 max-w-md">
          Aquí integraremos el formulario digital para reemplazar el cuaderno de galpón de SEREPAR S.R.L. y calcular automáticamente el Índice Genético.
        </p>
      </Card>

    </div>
  );
}