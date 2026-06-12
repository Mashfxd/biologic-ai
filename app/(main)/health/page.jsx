"use client";
import React, { useState, useEffect } from 'react';
import { PlusCircle, Calendar, X, Edit, Trash2, Stethoscope } from 'lucide-react';
import Card from '@/components/ui/Card';

export default function HealthPage() {
  const [records, setRecords] = useState([]);
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    animal_id: '', diagnostic: '', treatment: '', date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => { 
    fetchRecords(); 
    fetchAnimals(); 
  }, []);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/health');
      setRecords(await res.json() || []);
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  const fetchAnimals = async () => {
    try {
      const res = await fetch('/api/animals');
      setAnimals(await res.json() || []);
    } catch (error) { console.error(error); }
  };

  const handleOpenModal = (record = null) => {
    if (record) {
      setEditingId(record.id);
      setFormData({
        animal_id: record.animal_id, diagnostic: record.diagnostic, treatment: record.treatment, date: record.date.split('T')[0]
      });
    } else {
      setEditingId(null);
      setFormData({ animal_id: animals.length > 0 ? animals[0].id : '', diagnostic: '', treatment: '', date: new Date().toISOString().split('T')[0] });
    }
    setErrorMsg('');
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar este registro médico?")) return;
    await fetch(`/api/health?id=${id}`, { method: 'DELETE' });
    fetchRecords();
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setErrorMsg('');

  if (!formData.animal_id) {
    setErrorMsg('Seleccione un animal.');
    return;
  }

  try {
    const method = editingId ? 'PUT' : 'POST';
    const body = editingId ? { ...formData, id: editingId } : formData;

    const res = await fetch('/api/health', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const result = await res.json();

    if (!res.ok) {
      const details = result.details
        ? Object.values(result.details).flat().join(' ')
        : '';

      setErrorMsg(result.error || details || 'No se pudo guardar el registro médico.');
      return;
    }

    setShowModal(false);
    fetchRecords();
  } catch (error) {
    console.error('Error al guardar salud:', error);
    setErrorMsg('Error de conexión con el servidor.');
  }
};

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Card className="p-4 md:p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        
        {/* CABECERA */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Control de Salud</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Historial clínico y tratamientos</p>
          </div>
          <button onClick={() => handleOpenModal()} className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-sm active:scale-95">
            <PlusCircle size={18} /> Nuevo Registro Médico
          </button>
        </div>

        {/* TABLA ESTILO ALIMENTACIÓN */}
        <div className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-950">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Animal</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Diagnóstico</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tratamiento</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {records.length > 0 ? records.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    
                    {/* Fecha con icono */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <Calendar size={14} />
                        <span className="text-sm font-medium">{new Date(r.date).toLocaleDateString()}</span>
                      </div>
                    </td>
                    
                    {/* Animal (Negrita Negra/Blanca) */}
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {r.animal?.name || 'Eliminado'}
                      </span>
                    </td>
                    
                    {/* Diagnóstico (Con puntito rojo de alerta) */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300 capitalize">{r.diagnostic}</span>
                      </div>
                    </td>
                    
                    {/* Tratamiento (Verde estilo cantidad de alimento) */}
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        {r.treatment}
                      </span>
                    </td>
                    
                    {/* Acciones */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleOpenModal(r)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"><Edit size={16} /></button>
                        <button onClick={() => handleDelete(r.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-md transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </td>

                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-slate-400 font-medium">
                      {loading ? 'Cargando registros médicos...' : 'No hay registros de salud.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* MODAL DE REGISTRO */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white dark:bg-slate-950 rounded-3xl shadow-2xl w-full max-w-md flex flex-col border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-black text-lg text-slate-800 dark:text-white">
                {editingId ? 'Editar Salud' : 'Registrar Salud'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                {errorMsg && (<div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-sm font-bold text-rose-700">{errorMsg}</div>)}
                <div className="grid grid-cols-1 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Animal *</label>
                    <select required className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm" value={formData.animal_id} onChange={e => setFormData({...formData, animal_id: e.target.value})}>
                      <option value="" disabled>-- Seleccione Animal --</option>
                      {animals.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Diagnóstico *</label>
                    <input required type="text" placeholder="Ej. Mastitis, Neumonía..." className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm" value={formData.diagnostic} onChange={e => setFormData({...formData, diagnostic: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Tratamiento / Medicina *</label>
                    <textarea required rows="2" placeholder="Ej. Lactofur 0.5ml cada 24h" className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm resize-none" value={formData.treatment} onChange={e => setFormData({...formData, treatment: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Fecha *</label>
                    <input required type="date" className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                  </div>
                </div>
                
                <div className="pt-4 flex flex-col sm:flex-row justify-end gap-3 border-t border-slate-100 dark:border-slate-800 mt-6">
                  <button type="button" onClick={() => setShowModal(false)} className="w-full sm:w-auto px-5 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                    Cancelar
                  </button>
                  <button type="submit" className="w-full sm:w-auto px-5 py-2.5 text-sm font-bold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors shadow-sm">
                    Guardar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}