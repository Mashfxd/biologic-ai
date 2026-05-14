"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, Activity, Calendar, Stethoscope, 
  TrendingUp, Users, LogOut, Bell, PawPrint,
  ClipboardList, BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';

const SidebarItem = ({ icon: Icon, label, href, active }) => (
  <Link href={href} className={cn(
    "flex items-center w-full gap-3 px-3 py-2 text-sm font-medium transition-all duration-150 rounded-md",
    active ? "bg-emerald-50 text-emerald-700" : "text-slate-600 hover:bg-slate-100"
  )}>
    <Icon size={18} />
    <span>{label}</span>
  </Link>
);

export default function DashboardLayout({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const pathname = usePathname();
  const router = useRouter();

  // Verificación básica de sesión en el cliente
  useEffect(() => {
    const savedUser = localStorage.getItem('zooai_user');
    if (!savedUser) {
      router.push('/'); // Si no hay usuario, lo mandamos al login
    } else {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('zooai_user');
    router.push('/');
  };

  if (!currentUser) return null; // O un spinner de carga

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
            <PawPrint size={18} className="text-white" />
          </div>
          <span className="text-lg font-bold text-slate-800 tracking-tight">BioLogic AI</span>
        </div>
    <nav className="flex-1 px-4 space-y-1">
        <SidebarItem href="/dashboard" icon={LayoutDashboard} label="Dashboard" active={pathname === '/dashboard'} />
        <SidebarItem href="/animals" icon={ClipboardList} label="Inventario y Censo" active={pathname === '/animals'} />
        <SidebarItem href="/production" icon={BarChart3} label="Producción" active={pathname === '/production'} />
        <SidebarItem href="/feeding" icon={Calendar} label="Alimentación" active={pathname === '/feeding'} />
        <SidebarItem href="/health" icon={Stethoscope} label="Salud Animal" active={pathname === '/health'} />
        <SidebarItem href="/growth" icon={TrendingUp} label="Crecimiento" active={pathname === '/growth'} />
  
        {currentUser?.role === 'admin' && (
          <SidebarItem href="/users" icon={Users} label="Usuarios y Roles" active={pathname === '/users'} />
         )}
     </nav>
        <div className="p-4 mt-auto border-t border-slate-200">
          <div className="flex items-center p-2 gap-3 rounded-lg hover:bg-slate-50 transition-colors">
            <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-[10px] font-bold text-slate-600">
              {currentUser.username[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0 overflow-hidden">
              <p className="text-[11px] font-bold text-slate-800 truncate">{currentUser.username}</p>
              <p className="text-[9px] text-slate-500 uppercase font-bold tracking-tighter">
                {currentUser.role === 'admin' ? 'Administrador' : 'Operador'}
              </p>
            </div>
          </div>
          <button onClick={handleLogout} className="mt-2 flex items-center w-full gap-2 px-3 py-1.5 text-[10px] font-bold text-rose-500 hover:bg-rose-50 rounded-md transition-all uppercase tracking-wider">
            <LogOut size={14} /> Salir
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header (se puede extraer a otro componente después) */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
          <div className="flex items-center gap-4 bg-slate-100 px-3 py-1.5 rounded-full w-96">
            <LayoutDashboard size={14} className="text-slate-400" />
            <input type="text" placeholder="Buscar lote, animal o alerta..." className="bg-transparent border-none text-[12px] focus:ring-0 w-full outline-none text-slate-600 font-medium" />
          </div>
          <div className="flex items-center gap-4">
            <button className="bg-emerald-600 text-white text-[11px] font-bold px-4 py-2 rounded-md hover:bg-emerald-700 transition-colors shadow-sm">Reporte Personalizado</button>
            <button className="p-1.5 text-slate-400 hover:bg-slate-50 rounded-lg relative">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>
            </button>
          </div>
        </header>
        
        {/* Aquí se renderizarán las páginas hijas (/dashboard, /animals, etc) */}
        <div className="flex-1 overflow-y-auto p-8 bg-[#F8FAFC]">
          {children}
        </div>
      </main>
    </div>
  );
}