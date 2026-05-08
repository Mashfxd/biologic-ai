import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function Card({ children, className }) {
  return (
    <div className={cn("bg-white border border-slate-200 rounded-xl p-5 shadow-sm", className)}>
      {children}
    </div>
  );
}