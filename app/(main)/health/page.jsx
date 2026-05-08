"use client";
import React, { useState, useEffect } from 'react';
import { PlusCircle, Stethoscope, Calendar, X, Edit, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Card from '@/components/ui/Card';

export default function HealthPage() {
  const [records, setRecords] = useState([]);
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

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
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar este registro médico?")) return;
    await fetch(`/api/health?id=${id}`, { method: 'DELETE' });
    fetchRecords();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.animal_id) return alert("Seleccione un animal.");
    const method = editingId ? 'PUT' : 'POST';
    const body = editingId ? { ...formData, id: editingId } : formData;
    const res = await fetch('/api/health', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (res.ok) { setShowModal(false); fetchRecords(); }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <Card className="p-4 md:p-6 bg-transparent border-none shadow-none md:bg-white md:border-solid md:shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h3 className="text-xl font-bold text-slate-800">Control de Salud</h3>
            <p className="text-sm text-slate-500 font-medium">Historial clínico y tratamientos</p>
          </div>
          <button onClick={() => handleOpenModal()} className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-sm">
            <PlusCircle size={20} /> Nuevo Registro Médico
          </button>
        </div>

        <div className="md:border md:border-slate-100 md:rounded-xl md:overflow-hidden bg-[#F8FAFC] md:bg-white p-2 md:p-0 rounded-xl">
          <table className="w-full text-left border-collapse">
            <thead className="hidden md:table-header-group bg-[#F8FAFC] border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Fecha</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Animal</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Diagnóstico</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Tratamiento</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="flex flex-col md:table-row-group gap-4 md:gap-0">
              {records.length > 0 ? records.map((r) => (
                <tr key={r.id} className="flex flex-col md:table-row bg-white md:hover:bg-slate-50 transition-colors border border-slate-200 md:border-0 md:border-b md:border-slate-100 rounded-xl md:rounded-none p-4 md:p-0">
                  <td className="md:px-6 md:py-4 flex items-center justify-between border-b border-slate-50 md:border-none pb-2 md:pb-0 mb-2 md:mb-0">
                    <span className="md:hidden text-[10px] font-bold text-slate-400 uppercase">Fecha</span>
                    <span className="text-sm font-medium text-slate-600">{new Date(r.date).toLocaleDateString()}</span>
                  </td>
                  <td className="md:px-6 md:py-4 flex items-center justify-between border-b border-slate-50 md:border-none pb-2 md:pb-0 mb-2 md:mb-0">
                    <span className="md:hidden text-[10px] font-bold text-slate-400 uppercase">Animal</span>
                    <span className="font-bold text-slate-800">{r.animal?.name || 'Eliminado'}</span>
                  </td>
                  <td className="md:px-6 md:py-4 flex flex-col md:table-cell border-b border-slate-50 md:border-none pb-2 md:pb-0 mb-2 md:mb-0">
                    <span className="md:hidden text-[10px] font-bold text-slate-400 uppercase mb-1">Diagnóstico</span>
                    <span className="text-sm text-rose-600 font-semibold">{r.diagnostic}</span>
                  </td>
                  <td className="md:px-6 md:py-4 flex flex-col md:table-cell border-b border-slate-50 md:border-none pb-2 md:pb-0 mb-2 md:mb-0">
                    <span className="md:hidden text-[10px] font-bold text-slate-400 uppercase mb-1">Tratamiento</span>
                    <span className="text-sm text-slate-600 italic">{r.treatment}</span>
                  </td>
                  <td className="md:px-6 md:py-4 flex items-center justify-between pt-1 md:pt-0">
                    <span className="md:hidden text-[10px] font-bold text-slate-400 uppercase">Acciones</span>
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleOpenModal(r)} className="p-2 text-slate-400 hover:text-blue-600"><Edit size={16} /></button>
                      <button onClick={() => handleDelete(r.id)} className="p-2 text-slate-400 hover:text-red-600"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              )) : <tr><td colSpan="5" className="p-8 text-center text-slate-400">Sin registros de salud.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col">
            <div className="flex justify-between items-center p-5 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-800">{editingId ? 'Editar Salud' : 'Registrar Salud'}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:bg-slate-100 p-1 rounded-md"><X size={20} /></button>
            </div>
            <div className="p-5">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Animal</label>
                    <select required className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-500" value={formData.animal_id} onChange={e => setFormData({...formData, animal_id: e.target.value})}>
                      <option value="" disabled>-- Seleccione --</option>
                      {animals.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Diagnóstico</label>
                    <input required type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-500" value={formData.diagnostic} onChange={e => setFormData({...formData, diagnostic: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tratamiento / Medicina</label>
                    <textarea required rows="2" className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-500" value={formData.treatment} onChange={e => setFormData({...formData, treatment: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Fecha</label>
                    <input required type="date" className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-500" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                  </div>
                </div>
                <div className="pt-4 flex flex-col sm:flex-row justify-end gap-2">
                  <button type="button" onClick={() => setShowModal(false)} className="w-full sm:w-auto px-4 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-lg">Cancelar</button>
                  <button type="submit" className="w-full sm:w-auto px-4 py-2.5 text-sm font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">Guardar</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}