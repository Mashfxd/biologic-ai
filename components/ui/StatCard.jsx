import React from 'react';
import Card from './Card';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function StatCard({ icon: Icon, label, value, trend, color }) {
  return (
    <Card className="flex flex-col gap-1 border-slate-200">
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</p>
      <div className="flex items-center justify-between mt-1">
        <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
        {trend && (
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
            {trend}
          </span>
        )}
      </div>
      <div className="mt-3 flex items-center gap-2">
        <div className={cn("w-1.5 h-1.5 rounded-full", color.replace('bg-', 'bg-'))}></div>
        <p className="text-[10px] text-slate-400 font-medium">Actualizado ahora</p>
      </div>
    </Card>
  );
}