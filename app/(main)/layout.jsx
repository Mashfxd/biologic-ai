"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, Activity, Calendar, Stethoscope, 
  TrendingUp, Users, LogOut, Bell, PawPrint, 
  Menu, X, Sun, Moon, Download,
  ClipboardList, BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';

const SidebarItem = ({ icon: Icon, label, href, active, onClick }) => (
  <Link
    href={href}
    onClick={onClick}
    aria-current={active ? 'page' : undefined}
    className={cn(
      "flex items-center w-full gap-3 px-3 py-2 text-sm font-medium transition-all duration-150 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950",
      active
        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
        : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
    )}
  >
    <Icon size={18} aria-hidden="true" focusable="false" />
    <span>{label}</span>
  </Link>
);

export default function DashboardLayout({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const pathname = usePathname();
  const router = useRouter();

  // 1. Cargar el Modo Oscuro al iniciar
  useEffect(() => {
    const theme = localStorage.getItem('zooai_theme');
    if (theme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  // 2. Función ESTRICTA para cambiar el Modo Oscuro
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

  // 3. Cerrar menús al cambiar de página
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setShowNotifications(false); 
  }, [pathname]);

  // 4. Validar Sesión
  useEffect(() => {
    const loadCurrentUser = async () => {
    try {
      const res = await fetch('/api/users/me');

      if (!res.ok) {
        localStorage.removeItem('zooai_user');
        router.push('/');
        return;
      }

      const data = await res.json();

      setCurrentUser(data.user);
      localStorage.setItem('zooai_user', JSON.stringify(data.user));
    } catch (error) {
      console.error('Error al validar sesión:', error);
      localStorage.removeItem('zooai_user');
      router.push('/');
    }
  };

  loadCurrentUser();
  }, [router]);

  const handleLogout = async () => {
    try {
      // 1. Avisamos al servidor que destruya la cookie segura
      await fetch('/api/users/logout', { method: 'POST' });
    } catch (error) {
      console.error("Error al cerrar sesión", error);
    } finally {
      // 2. Borramos el nombre estético y lo mandamos al inicio
      localStorage.removeItem('zooai_user');
      router.push('/');
    }
  };

  const handleReport = () => {
    window.print();
  };

  if (!currentUser) return null; 

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 font-sans overflow-hidden transition-colors duration-300">
      <a href="#contenido-principal" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-white focus:text-slate-900 focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">Saltar al contenido principal</a>
      
      {/* OVERLAY MÓVIL (Fondo oscuro al abrir menú en celular) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* SIDEBAR MODO CLARO / OSCURO */}
      <aside   id="sidebar-principal" aria-label="Navegación principal" className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex flex-col transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 flex items-center justify-between lg:justify-start gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <PawPrint size={18} className="text-white" />
            </div>
            <span className="text-lg font-bold text-slate-800 dark:text-white tracking-tight">BioLogic AI</span>
          </div>
          <button type='button' onClick={() => setIsMobileMenuOpen(false)} aria-label="Cerrar menú" className="lg:hidden text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 p-1 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
           <X size={20} aria-hidden="true" focusable="false" />
</button>
        </div>

        <nav aria-label="Menú principal" className="flex-1 px-4 space-y-1 overflow-y-auto pb-4 print:hidden">
          <SidebarItem href="/dashboard" icon={LayoutDashboard} label="Dashboard" active={pathname === '/dashboard'} onClick={() => setIsMobileMenuOpen(false)} />
          <SidebarItem href="/animals" icon={ClipboardList} label="Inventario" active={pathname === '/animals'} onClick={() => setIsMobileMenuOpen(false)} />
          <SidebarItem href="/production" icon={BarChart3} label="Producción" active={pathname === '/production'} onClick={() => setIsMobileMenuOpen(false)} />
          <SidebarItem href="/feeding" icon={Calendar} label="Alimentación" active={pathname === '/feeding'} onClick={() => setIsMobileMenuOpen(false)} />
          <SidebarItem href="/health" icon={Stethoscope} label="Salud Animal" active={pathname === '/health'} onClick={() => setIsMobileMenuOpen(false)} />
          <SidebarItem href="/growth" icon={TrendingUp} label="Crecimiento" active={pathname === '/growth'} onClick={() => setIsMobileMenuOpen(false)} />
          {currentUser.role === 'ADMIN' && (
            <SidebarItem href="/users" icon={Users} label="Usuarios y Roles" active={pathname === '/users'} onClick={() => setIsMobileMenuOpen(false)} />
          )}
        </nav>

        <div className="p-4 mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 print:hidden">
          <div className="flex items-center p-2 gap-3 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-300 shrink-0">
              {currentUser.username[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-slate-800 dark:text-white truncate">{currentUser.username}</p>
              <p className="text-[9px] text-slate-500 dark:text-slate-400 uppercase font-bold">{currentUser.role === 'ADMIN' ? 'Administrador' : 'Operador'}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="mt-2 flex items-center w-full gap-2 px-3 py-1.5 text-[10px] font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-md transition-all uppercase">
            <LogOut size={14} /> Salir
          </button>
        </div>
      </aside>

      <main id="contenido-principal" className="flex-1 flex flex-col overflow-hidden w-full relative">
        <header className="h-16 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 lg:px-8 shrink-0 print:hidden transition-colors duration-300">
          <div className="flex items-center gap-2 lg:gap-4 flex-1">
            <button type="button" onClick={() => setIsMobileMenuOpen(true)} aria-label="Abrir menú" aria-expanded={isMobileMenuOpen} aria-controls="sidebar-principal" className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg lg:hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
  <Menu size={24} aria-hidden="true" focusable="false" />
</button>
            <div className="hidden sm:flex items-center gap-4 bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-full w-full max-w-sm">
              <LayoutDashboard size={14} className="text-slate-400" />
              <input type="text" placeholder="Buscar lote o alerta..." className="bg-transparent border-none text-[12px] w-full outline-none text-slate-600 dark:text-slate-300 font-medium placeholder-slate-400" />
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-4 relative">
            
            {/* BOTÓN DE MODO OSCURO */}
            <button
               type="button"
               onClick={toggleTheme}
               aria-label={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
               aria-pressed={isDarkMode}
               className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
             >
             {isDarkMode ? (
              <Sun size={20} className="text-amber-400" aria-hidden="true" focusable="false" />
              ) : (
              <Moon size={20} aria-hidden="true" focusable="false" />
              )}
             </button>

            {/* BOTÓN REPORTE */}
            <button
              type="button"
              onClick={handleReport}
              className="hidden md:flex items-center gap-2 bg-emerald-600 text-white text-[11px] font-bold px-4 py-2 rounded-md hover:bg-emerald-700 transition-colors shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2">
              <Download size={14} aria-hidden="true" focusable="false" />
             Reporte PDF
             </button>

            {/* CAMPANITA DE NOTIFICACIONES */}
            <div className="relative">
              <button
               type="button"
               onClick={() => setShowNotifications(!showNotifications)}
               aria-label="Ver notificaciones"
               aria-expanded={showNotifications}
               aria-controls="panel-notificaciones"
               className="p-2 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg relative transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
>
              </button>

              {/* LÓGICA DE NOTIFICACIONES CON CIERRE AL CLIC AFUERA */}
              {showNotifications && (
                <>
                  {/* Capa invisible para detectar el clic fuera del menú */}
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowNotifications(false)}
                  ></div>

                  {/* Panel del Menú */}
                  <div id="panel-notificaciones" className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-800 z-50 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                      <h4 className="text-sm font-bold text-slate-800 dark:text-white">Notificaciones</h4>
                      <span className="text-[10px] bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 px-2 py-0.5 rounded-full font-bold">2 Nuevas</span>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      <div className="p-4 border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Alerta de Temperatura</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">El galpón A registra 34°C. Riesgo de estrés térmico.</p>
                        <p className="text-[9px] text-slate-400 mt-2">Hace 10 min</p>
                      </div>
                      <div className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Control de Pesaje</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Es momento de registrar el peso del Lote 12.</p>
                        <p className="text-[9px] text-slate-400 mt-2">Hace 2 horas</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>
        
        {/* ÁREA DE LAS PÁGINAS */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#F8FAFC] dark:bg-slate-900 transition-colors duration-300">
          {children}
        </div>
      </main>
    </div>
  );
}