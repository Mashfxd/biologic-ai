"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PawPrint, Sun, Moon } from 'lucide-react';
import { motion } from 'motion/react';
import Card from '@/components/ui/Card';

export default function LoginPage() {
  const router = useRouter();
  
  // Estado para el botón de modo oscuro en el Login
  const [isDarkMode, setIsDarkMode] = useState(false);

  // 1. Revisar si el usuario ya tenía el modo oscuro activado antes
  useEffect(() => {
    const theme = localStorage.getItem('zooai_theme');
    if (theme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  // 2. Función para cambiar el tema desde el Login
  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('zooai_theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('zooai_theme', 'dark');
      setIsDarkMode(true);
    }
  };

  // 3. Revisar si ya hay sesión iniciada
  useEffect(() => {
    const savedUser = localStorage.getItem('zooai_user');
    if (savedUser) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get('username');
    const password = formData.get('password');

    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (res.ok) {
        const user = await res.json();
        localStorage.setItem('zooai_user', JSON.stringify(user));
        router.push('/dashboard'); 
      } else {
        alert('Credenciales inválidas.');
      }
    } catch (error) {
      console.error(error);
      alert('Error de conexión.');
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 font-sans transition-colors duration-300">
      
      {/* BOTÓN MODO OSCURO EN LA ESQUINA */}
      <button 
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-3 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors"
        title="Cambiar Modo"
      >
        {isDarkMode ? <Sun size={24} className="text-amber-400" /> : <Moon size={24} />}
      </button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md px-4">
        {/* Usamos dark:bg-slate-950 para que la tarjeta también se oscurezca */}
        <Card className="shadow-2xl dark:bg-slate-950 dark:border-slate-800 transition-colors">
          <div className="flex flex-col items-center gap-2 mb-8">
           <div className="mb-4">
             <img 
               src="/logo-serepar.png" 
               alt="Logo SEREPAR" 
               className="h-32 w-32 object-contain drop-shadow-sm mx-auto" 
               />
           </div>
              
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">BioLogic AI</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium italic">Gestión Animal Inteligente</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block mb-1 text-sm font-semibold text-slate-700 dark:text-slate-300">Usuario</label>
              {/* CORRECCIÓN: bg-white text-slate-900 para modo claro | dark:bg-slate-900 dark:text-white para oscuro */}
              <input 
                name="username" 
                type="text" 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium placeholder-slate-400" 
                placeholder="admin" 
                required 
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-semibold text-slate-700 dark:text-slate-300">Contraseña</label>
              {/* CORRECCIÓN APLICADA AQUÍ TAMBIÉN */}
              <input 
                name="password" 
                type="password" 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium placeholder-slate-400" 
                placeholder="••••••••" 
                required 
              />
            </div>
            <button type="submit" className="w-full py-3 mt-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 dark:shadow-none active:scale-[0.98]">
              Acceder al Sistema
            </button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}