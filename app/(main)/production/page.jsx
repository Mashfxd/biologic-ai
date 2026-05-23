"use client";
import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import { 
  PlusCircle, Search, Filter, Baby, Calendar, 
  Weight, Activity, MoreVertical, X, Save, AlertCircle, Loader2
} from 'lucide-react';

export default function ProductionPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Estados para manejar los datos reales de la BD
  const [births, setBirths] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Estado para capturar los datos del formulario
  const [formData, setFormData] = useState({
    poza: '', motherId: '', fatherId: '', matingDate: '',
    birthDate: '', bornAlive: '', bornDead: '0', avgBirthWeight: '', observations: ''
  });

  // 1. CARGAR DATOS AL INICIAR LA PÁGINA
  const fetchProduction = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/production');
      if (res.ok) {
        const data = await res.json();
        setBirths(data);
      }
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProduction();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMsg(''); // Limpiar errores cuando el usuario escribe
  };

  // 2. ENVIAR DATOS A LA API
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/production', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await res.json();

      if (!res.ok) {
        // Mostrar el error que viene desde la API (ej. "La madre no existe")
        setErrorMsg(result.error || 'Error al guardar el registro.');
      } else {
        // ÉXITO: Agregar el nuevo parto a la tabla, cerrar modal y limpiar form
        setBirths([result.data, ...births]);
        setIsModalOpen(false);
        setFormData({ poza: '', motherId: '', fatherId: '', matingDate: '', birthDate: '', bornAlive: '', bornDead: '0', avgBirthWeight: '', observations: '' });
      }
    } catch (error) {
      setErrorMsg('Error de conexión con el servidor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. CÁLCULOS MATEMÁTICOS PARA LAS TARJETAS (KPIs reales)
  const totalNacimientos = births.length;
  const promCrias = totalNacimientos > 0 
    ? (births.reduce((sum, b) => sum + b.bornAlive, 0) / totalNacimientos).toFixed(1) 
    : "0.0";
  const promPeso = totalNacimientos > 0 
    ? (births.reduce((sum, b) => sum + b.avgBirthWeight, 0) / totalNacimientos).toFixed(1) 
    : "0.0";

  // Filtro de búsqueda en la tabla
  const filteredBirths = births.filter(record => 
    record.motherId.toString().includes(searchTerm) || 
    record.poza.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative">
      
      {/* --- MODAL DE NUEVO REGISTRO --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-950 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            
            <div className="sticky top-0 bg-white dark:bg-slate-950 p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between z-10">
              <div>
                <h2 className="text-xl font-black text-slate-800 dark:text-white">Nuevo Registro de Parto</h2>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Ingresa los datos del cuaderno de galpón.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              
              {/* Alerta de Error Dinámica */}
              {errorMsg && (
                <div className="p-4 bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-900/50 rounded-xl flex items-start gap-3">
                  <AlertCircle size={18} className="text-rose-500 mt-0.5" />
                  <p className="text-sm font-bold text-rose-700 dark:text-rose-400">{errorMsg}</p>
                </div>
              )}

              {/* Sección 1: Identificación */}
              <div>
                <h3 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">1. Identificación</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Poza *</label>
                    <input type="text" name="poza" value={formData.poza} required onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Ej. A6" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">ID Madre *</label>
                    <input type="number" name="motherId" value={formData.motherId} required onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Ej. 17525" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">ID Padre</label>
                    <input type="number" name="fatherId" value={formData.fatherId} onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Opcional" />
                  </div>
                </div>
              </div>

              {/* Sección 2: Fechas */}
              <div>
                <h3 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">2. Cronología</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Fecha de Parto *</label>
                    <input type="date" name="birthDate" value={formData.birthDate} required onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Fecha de Empadre</label>
                    <input type="date" name="matingDate" value={formData.matingDate} onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none text-slate-500" />
                  </div>
                </div>
              </div>

              {/* Sección 3: Resultados */}
              <div>
                <h3 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">3. Rendimiento de Camada</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Nacidos Vivos *</label>
                    <input type="number" name="bornAlive" value={formData.bornAlive} required min="0" onChange={handleInputChange} className="w-full px-3 py-2 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 rounded-lg text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="0" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Nacidos Muertos</label>
                    <input type="number" name="bornDead" value={formData.bornDead} min="0" onChange={handleInputChange} className="w-full px-3 py-2 bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-800 rounded-lg text-sm font-bold text-rose-600 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Peso Promedio (g) *</label>
                    <input type="number" name="avgBirthWeight" value={formData.avgBirthWeight} required step="0.01" onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Ej. 145" />
                  </div>
                </div>
              </div>

              {/* Observaciones */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Observaciones Adicionales</label>
                <textarea name="observations" value={formData.observations} rows="2" onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none resize-none" placeholder="Condición de la madre, complicaciones, etc."></textarea>
              </div>

              {/* Botones de Acción */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                <button type="button" disabled={isSubmitting} onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors disabled:opacity-50">
                  Cancelar
                </button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50">
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
                  {isSubmitting ? 'Guardando...' : 'Guardar Registro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- INTERFAZ PRINCIPAL DEL MÓDULO --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white">Registro de Nacimientos</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Digitalización del cuaderno de galpón.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-emerald-600 text-white font-bold px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors shadow-sm active:scale-95">
          <PlusCircle size={18} /> Nuevo Parto / Camada
        </button>
      </div>

      {/* Tarjetas de Resumen Dinámicas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 flex items-center gap-4 bg-white dark:bg-slate-900">
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl flex items-center justify-center"><Baby size={24} /></div>
          <div><p className="text-xs font-bold text-slate-400 uppercase">Partos Registrados</p><h3 className="text-2xl font-black text-slate-800 dark:text-white">{totalNacimientos}</h3></div>
        </Card>
        <Card className="p-5 flex items-center gap-4 bg-white dark:bg-slate-900">
          <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-xl flex items-center justify-center"><Activity size={24} /></div>
          <div><p className="text-xs font-bold text-slate-400 uppercase">Promedio Crías</p><h3 className="text-2xl font-black text-slate-800 dark:text-white">{promCrias}</h3></div>
        </Card>
        <Card className="p-5 flex items-center gap-4 bg-white dark:bg-slate-900">
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-xl flex items-center justify-center"><Weight size={24} /></div>
          <div><p className="text-xs font-bold text-slate-400 uppercase">Peso Promedio</p><h3 className="text-2xl font-black text-slate-800 dark:text-white">{promPeso} g</h3></div>
        </Card>
      </div>

      {/* Tabla de Registros Reales */}
      <Card className="bg-white dark:bg-slate-900 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input type="text" placeholder="Buscar por ID de Madre o Poza..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 rounded-lg text-sm outline-none border border-slate-200 dark:border-slate-800" />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 w-full sm:w-auto justify-center"><Filter size={16} /> Filtros</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800">
                <th className="py-3 px-4 text-[11px] font-bold text-slate-500 uppercase">Poza</th>
                <th className="py-3 px-4 text-[11px] font-bold text-slate-500 uppercase">Madre / Padre</th>
                <th className="py-3 px-4 text-[11px] font-bold text-slate-500 uppercase">Datos del Parto</th>
                <th className="py-3 px-4 text-[11px] font-bold text-slate-500 uppercase">Desempeño</th>
                <th className="py-3 px-4 text-[11px] font-bold text-slate-500 uppercase">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-500 font-medium">Cargando registros de Neon DB...</td>
                </tr>
              ) : filteredBirths.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-500 font-medium">No hay partos registrados en el sistema.</td>
                </tr>
              ) : (
                filteredBirths.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-3 px-4 font-bold text-slate-700 dark:text-slate-300">{record.poza}</td>
                    <td className="py-3 px-4">
                      <span className="block text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        M: #{record.mother?.code || record.motherId}
                      </span>
                      <span className="text-xs text-slate-500">
                        P: {record.fatherId ? `#${record.father?.code || record.fatherId}` : 'N/A'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="block text-sm font-bold text-slate-800 dark:text-slate-200">
                        {new Date(record.birthDate).toLocaleDateString()}
                      </span>
                      <span className="text-xs text-slate-500">{record.bornAlive} crías vivas</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 rounded bg-amber-50 text-amber-700 text-xs font-bold">{record.avgBirthWeight}g prom.</span>
                    </td>
                    <td className="py-3 px-4">
                      <button className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-md"><MoreVertical size={18} /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}