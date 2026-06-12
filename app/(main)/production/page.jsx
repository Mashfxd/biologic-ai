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
  
  const [births, setBirths] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [animals, setAnimals] = useState([]);

  const [formData, setFormData] = useState({
    poza: '', motherId: '', fatherId: '', matingDate: '',
    birthDate: '', bornAlive: '', bornDead: '0', avgBirthWeight: '', observations: ''
  });



  const fetchProduction = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/production');
      if (res.ok) {
        const data = await res.json();
        setBirths(data);
      }else {
        const data = await res.json();
        setErrorMsg(data.error || 'No se pudo cargar producción.');
        setBirths([]);}
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchAnimals = async () => {
  try {
    const res = await fetch('/api/animals');

    if (res.ok) {
      const data = await res.json();
      setAnimals(Array.isArray(data) ? data : []);
    } else {
      setAnimals([]);
    }
  } catch (error) {
    console.error('Error al cargar animales:', error);
    setAnimals([]);
  }
};

  useEffect(() => {
    fetchProduction();
    fetchAnimals();
  }, []);


  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMsg(''); 
  };

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
        setErrorMsg(result.error || 'Error al guardar el registro.');
      } else {
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

  // Determinar qué datos mostrar 
  const displayData = births;

  const totalNacimientos = births.length;
  const promCrias = totalNacimientos > 0 ? (births.reduce((sum, b) => sum + b.bornAlive, 0) / totalNacimientos).toFixed(1) : "0.0";
  const promPeso = totalNacimientos > 0 ? (births.reduce((sum, b) => sum + parseFloat(b.avgBirthWeight || 0), 0) / totalNacimientos).toFixed(1) : "0.0";

  const femaleAnimals = animals.filter(
  (animal) =>
    animal.gender === 'HEMBRA' &&
    ['HEALTHY', 'SICK'].includes(animal.status)
);

const maleAnimals = animals.filter(
  (animal) =>
    animal.gender === 'MACHO' &&
    ['HEALTHY', 'SICK'].includes(animal.status)
);

  const filteredBirths = displayData.filter(record => 
    record.motherId?.toString().includes(searchTerm) || 
    record.poza?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4 md:space-y-6 animate-in fade-in duration-500 relative">
      
      {/* MODAL DE NUEVO REGISTRO (SIN CAMBIOS) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-950 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="sticky top-0 bg-white dark:bg-slate-950 p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between z-10">
              <div>
                <h2 className="text-xl font-black text-slate-800 dark:text-white">Nuevo Registro de Parto</h2>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Ingresa los datos del cuaderno de galpón.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {errorMsg && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3">
                  <AlertCircle size={18} className="text-rose-500 mt-0.5" />
                  <p className="text-sm font-bold text-rose-700">{errorMsg}</p>
                </div>
              )}

              {/* Sección 1: Identificación */}
              <div>
                <h3 className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">1. Identificación</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Poza *</label>
                    <input type="text" name="poza" value={formData.poza} required onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Ej. A6" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Madre *</label>
                   <select name="motherId" value={formData.motherId} required onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"> <option value="">Seleccione madre...</option>{femaleAnimals.map((animal) => (<option key={animal.id} value={animal.id}>{animal.name} / {animal.breed} / {animal.currentWeight}g</option>))}</select>
                   {femaleAnimals.length === 0 && (<p className="mt-1 text-xs font-medium text-rose-500">No hay hembras activas registradas en inventario.</p>
)}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Padre</label>
                   <select
    name="fatherId"
    value={formData.fatherId}
    onChange={handleInputChange}
    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
  >
    <option value="">Sin padre registrado</option>

    {maleAnimals.map((animal) => (
      <option key={animal.id} value={animal.id}>
        {animal.name} / {animal.breed} / {animal.currentWeight}g
      </option>
    ))}
  </select>
  {maleAnimals.length === 0 && (
  <p className="mt-1 text-xs font-medium text-slate-400">
    No hay machos activos registrados. Puedes dejar este campo vacío.
  </p>
)}
                  </div>
                </div>
              </div>

              {/* Sección 2: Fechas */}
              <div>
                <h3 className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">2. Cronología</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Fecha de Parto *</label>
                    <input type="date" name="birthDate" value={formData.birthDate} required onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Fecha de Empadre</label>
                    <input type="date" name="matingDate" value={formData.matingDate} onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500 text-slate-500" />
                  </div>
                </div>
              </div>

              {/* Sección 3: Resultados */}
              <div>
                <h3 className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">3. Rendimiento de Camada</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Nacidos Vivos *</label>
                    <input type="number" name="bornAlive" value={formData.bornAlive} required min="0" onChange={handleInputChange} className="w-full px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500" placeholder="0" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Nacidos Muertos</label>
                    <input type="number" name="bornDead" value={formData.bornDead} min="0" onChange={handleInputChange} className="w-full px-3 py-2 bg-rose-50 border border-rose-200 rounded-lg text-sm font-bold text-rose-600 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Peso Promedio (g) *</label>
                    <input type="number" name="avgBirthWeight" value={formData.avgBirthWeight} required step="0.01" onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Ej. 145" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Observaciones</label>
                <textarea name="observations" value={formData.observations} rows="2" onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500 resize-none" placeholder="Condición de la madre..."></textarea>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" disabled={isSubmitting} onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50">Cancelar</button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50">
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
                  {isSubmitting ? 'Guardando...' : 'Guardar Registro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- INTERFAZ PRINCIPAL (ESTILO FONDO BLANCO UNIFICADO) --- */}
      <Card className="p-4 md:p-6 bg-transparent border-none shadow-none md:bg-white dark:md:bg-slate-900 md:border-solid md:shadow-sm transition-colors">
        
        {/* Cabecera y Botón */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Registro de Nacimientos</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Digitalización del cuaderno de galpón</p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-sm active:scale-95">
            <PlusCircle size={20} /> Nuevo Parto / Camada
          </button>
        </div>

        {/* Tarjetas de Resumen (KPIs) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="p-4 border border-slate-100 dark:border-slate-800 rounded-xl flex items-center gap-4 bg-[#F8FAFC] dark:bg-slate-950">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 text-blue-600 rounded-lg flex items-center justify-center"><Baby size={20} /></div>
            <div><p className="text-[10px] font-bold text-slate-400 uppercase">Partos Reales</p><h3 className="text-xl font-black text-slate-800 dark:text-white">{totalNacimientos}</h3></div>
          </div>
          <div className="p-4 border border-slate-100 dark:border-slate-800 rounded-xl flex items-center gap-4 bg-[#F8FAFC] dark:bg-slate-950">
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/20 text-amber-600 rounded-lg flex items-center justify-center"><Activity size={20} /></div>
            <div><p className="text-[10px] font-bold text-slate-400 uppercase">Prom. Crías</p><h3 className="text-xl font-black text-slate-800 dark:text-white">{promCrias}</h3></div>
          </div>
          <div className="p-4 border border-slate-100 dark:border-slate-800 rounded-xl flex items-center gap-4 bg-[#F8FAFC] dark:bg-slate-950">
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 rounded-lg flex items-center justify-center"><Weight size={20} /></div>
            <div><p className="text-[10px] font-bold text-slate-400 uppercase">Peso Promedio</p><h3 className="text-xl font-black text-slate-800 dark:text-white">{promPeso} g</h3></div>
          </div>
        </div>

        {/* Buscador de Tabla */}
        <div className="mb-4 flex flex-col sm:flex-row gap-3 justify-between items-center">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input type="text" placeholder="Buscar por ID de Madre o Poza..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <button className="flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 w-full sm:w-auto"><Filter size={16} /> Filtros</button>
        </div>

        {/* Tabla Responsiva Estilo Salud */}
        <div className="md:border md:border-slate-100 dark:md:border-slate-800 md:rounded-xl md:overflow-hidden bg-[#F8FAFC] dark:bg-slate-900 md:bg-white p-2 md:p-0 rounded-xl">
          <table className="w-full text-left border-collapse">
            <thead className="hidden md:table-header-group bg-slate-50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Poza / Info</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Madre / Padre</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Fecha / Crías</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Desempeño</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="block md:table-row-group divide-y-0 md:divide-y md:divide-slate-100 dark:md:divide-slate-800">
              {isLoading ? (
                <tr>
    <td colSpan="5" className="py-8 text-center text-slate-500 font-medium">
      Cargando registros...
    </td>
  </tr>
) : filteredBirths.length === 0 ? (
  <tr>
    <td colSpan="5" className="py-8 text-center text-slate-500 font-medium">
      No hay registros de producción todavía.
    </td>
  </tr>
              ) : filteredBirths.map((record) => (
                <tr key={record.id} className="block md:table-row bg-white dark:bg-slate-900 md:hover:bg-slate-50 dark:md:hover:bg-slate-800/50 transition-colors border border-slate-200 dark:border-slate-800 md:border-0 rounded-xl md:rounded-none p-4 md:p-0 mb-4 md:mb-0 shadow-sm md:shadow-none">
                  
                  <td className="flex md:table-cell justify-between items-center md:px-6 md:py-4 border-b border-slate-50 dark:border-slate-800 md:border-none py-2 md:py-0">
                    <span className="md:hidden text-[10px] font-bold text-slate-400 uppercase">Poza</span>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-slate-700 dark:text-slate-200">{record.poza}</span>
                      {record.isMock && <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full font-bold">EJEMPLO</span>}
                    </div>
                  </td>
                  
                  <td className="flex md:table-cell justify-between items-center md:px-6 md:py-4 border-b border-slate-50 dark:border-slate-800 md:border-none py-2 md:py-0">
                    <span className="md:hidden text-[10px] font-bold text-slate-400 uppercase">Madre / Padre</span>
                    <div className="flex flex-col md:items-start items-end text-right md:text-left">
                      <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">M: {record.mother?.name || `ID ${record.motherId}`}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">P: {record.fatherId ? (record.father?.name || `ID ${record.fatherId}`) : 'N/A'}</span>
                    </div>
                  </td>
                  
                  <td className="flex md:table-cell justify-between items-center md:px-6 md:py-4 border-b border-slate-50 dark:border-slate-800 md:border-none py-2 md:py-0">
                    <span className="md:hidden text-[10px] font-bold text-slate-400 uppercase">Datos del Parto</span>
                    <div className="flex flex-col md:items-start items-end text-right md:text-left">
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{new Date(record.birthDate).toLocaleDateString()}</span>
                      <span className="text-xs font-medium text-slate-500">{record.bornAlive} crías vivas</span>
                    </div>
                  </td>
                  
                  <td className="flex md:table-cell justify-between items-center md:px-6 md:py-4 border-b border-slate-50 dark:border-slate-800 md:border-none py-2 md:py-0">
                    <span className="md:hidden text-[10px] font-bold text-slate-400 uppercase">Desempeño</span>
                    <span className="px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/50 text-amber-700 dark:text-amber-400 text-xs font-bold">
                      {record.avgBirthWeight}g prom.
                    </span>
                  </td>
                  
                  <td className="flex md:table-cell justify-between items-center md:px-6 md:py-4 py-2 md:py-0">
                    <span className="md:hidden text-[10px] font-bold text-slate-400 uppercase">Acción</span>
                    <div className="flex justify-end gap-1">
                      <button className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"><MoreVertical size={18} /></button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}