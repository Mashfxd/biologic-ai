"use client";
import React, { useState, useEffect } from 'react';
import { PlusCircle, Calendar, Utensils, X, Edit, Trash2, Search } from 'lucide-react';
import Card from '@/components/ui/Card';

export default function FeedingPage() {
  const [records, setRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    animal_id: '', food_type: 'Concentrado', quantity: '', date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchRecords();
    fetchAnimals();
  }, []);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/feeding');
      const data = await res.json();
      setRecords(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnimals = async () => {
    try {
      const res = await fetch('/api/animals');
      const data = await res.json();
      setAnimals(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    }
  };

  const handleOpenModal = (record = null) => {
    if (record) {
      setEditingId(record.id);
      setFormData({
        animal_id: record.animal_id,
        food_type: record.food_type,
        quantity: record.quantity,
        date: record.date.split('T')[0]
      });
    } else {
      setEditingId(null);
      setFormData({
        animal_id: animals.length > 0 ? animals[0].id : '',
        food_type: 'Concentrado',
        quantity: '',
        date: new Date().toISOString().split('T')[0]
      });
    }
    setErrorMsg('');
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este registro de alimentación?')) return;
    await fetch(`/api/feeding?id=${id}`, { method: 'DELETE' });
    fetchRecords();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.animal_id) {
      setErrorMsg('Debe seleccionar un animal.');
      return;
    }

    try {
      const method = editingId ? 'PUT' : 'POST';
      const body = editingId ? { ...formData, id: editingId } : formData;

      const res = await fetch('/api/feeding', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const result = await res.json();

      if (!res.ok) {
        const details = result.details
          ? Object.values(result.details).flat().join(' ')
          : '';

        setErrorMsg(result.error || details || 'No se pudo guardar el registro.');
        return;
      }

      setShowModal(false);
      fetchRecords();
    } catch (error) {
      console.error('Error al guardar alimentación:', error);
      setErrorMsg('Error de conexión con el servidor.');
    }
  };

  const filteredRecords = records.filter((record) => {
    const term = searchTerm.toLowerCase();

    return (
      record.animal?.name?.toLowerCase().includes(term) ||
      record.food_type?.toLowerCase().includes(term) ||
      record.quantity?.toString().includes(term) ||
      new Date(record.date).toLocaleDateString('es-ES').includes(term)
    );
  });

  return (
    <div className="space-y-4 md:space-y-6">
      <Card className="p-4 md:p-6 bg-transparent border-none shadow-none md:bg-white md:border-solid md:shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h3 className="text-xl font-bold text-slate-800">Control de Alimentación</h3>
            <p className="text-sm text-slate-500 font-medium">Registro diario de suministros</p>
          </div>
          <button onClick={() => handleOpenModal()} className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-sm">
            <PlusCircle size={20} /> Registrar Comida
          </button>
        </div>

        <div className="mb-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} aria-hidden="true" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por animal, alimento, cantidad o fecha..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700 dark:text-slate-200 placeholder-slate-400"
            />
          </div>
        </div>

        <div className="md:border md:border-slate-100 md:rounded-xl md:overflow-hidden bg-[#F8FAFC] md:bg-white p-2 md:p-0 rounded-xl">
          <table className="w-full text-left border-collapse">
            <thead className="hidden md:table-header-group bg-[#F8FAFC] border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Animal / Lote</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Alimento</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Cantidad</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="flex flex-col md:table-row-group gap-4 md:gap-0">
              {filteredRecords.length > 0 ? filteredRecords.map((r) => (
                <tr key={r.id} className="flex flex-col md:table-row bg-white md:hover:bg-slate-50/50 transition-colors border border-slate-200 md:border-0 md:border-b md:border-slate-100 rounded-xl md:rounded-none p-4 md:p-0 shadow-sm md:shadow-none">
                  <td className="md:px-6 md:py-4 flex items-center justify-between md:table-cell border-b border-slate-50 md:border-none pb-2 md:pb-0 mb-2 md:mb-0">
                    <span className="md:hidden text-[10px] font-bold text-slate-400 uppercase">Fecha</span>
                    <div className="flex items-center gap-2 text-slate-600 font-medium text-sm">
                      <Calendar size={14} className="hidden md:block text-slate-400" />
                      {new Date(r.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </div>
                  </td>

                  <td className="md:px-6 md:py-4 flex items-center justify-between md:table-cell border-b border-slate-50 md:border-none pb-2 md:pb-0 mb-2 md:mb-0">
                    <span className="md:hidden text-[10px] font-bold text-slate-400 uppercase">Animal / Lote</span>
                    <span className="font-bold text-slate-800">{r.animal ? r.animal.name : 'Animal Eliminado'}</span>
                  </td>

                  <td className="md:px-6 md:py-4 flex items-center justify-between md:table-cell border-b border-slate-50 md:border-none pb-2 md:pb-0 mb-2 md:mb-0">
                    <span className="md:hidden text-[10px] font-bold text-slate-400 uppercase">Insumo</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      <span className="text-sm font-semibold text-slate-700">{r.food_type}</span>
                    </div>
                  </td>

                  <td className="md:px-6 md:py-4 flex items-center justify-between md:table-cell border-b border-slate-50 md:border-none pb-2 md:pb-0 mb-2 md:mb-0 md:text-right">
                    <span className="md:hidden text-[10px] font-bold text-slate-400 uppercase">Cantidad</span>
                    <span className="font-mono font-bold text-emerald-600">{r.quantity} kg</span>
                  </td>

                  <td className="md:px-6 md:py-4 flex items-center justify-between md:table-cell pt-1 md:pt-0">
                    <span className="md:hidden text-[10px] font-bold text-slate-400 uppercase">Acciones</span>
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleOpenModal(r)} className="p-2 bg-slate-50 md:bg-transparent text-slate-400 hover:text-blue-600 rounded-lg transition-colors border border-slate-200 md:border-none"><Edit size={16} /></button>
                      <button onClick={() => handleDelete(r.id)} className="p-2 bg-slate-50 md:bg-transparent text-slate-400 hover:text-red-600 rounded-lg transition-colors border border-slate-200 md:border-none"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-400 font-medium">{loading ? 'Cargando registros de alimentación...' : searchTerm ? 'No se encontraron registros de alimentación.' : 'No hay registros de alimentación.'}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-white shrink-0">
              <h3 className="font-bold text-lg text-slate-800">{editingId ? 'Editar Registro' : 'Nuevo Registro de Comida'}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:bg-slate-100 p-1 rounded-md"><X size={20} /></button>
            </div>
            <div className="overflow-y-auto p-5">
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMsg && (<div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-sm font-bold text-rose-700">{errorMsg}</div>)}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Seleccionar Animal / Lote</label>
                    <select required className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-500" value={formData.animal_id} onChange={e => setFormData({...formData, animal_id: e.target.value})}>
                      <option value="" disabled>-- Elija un animal --</option>
                      {animals.map(a => (
                        <option key={a.id} value={a.id}>{a.name} ({a.species})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tipo de Alimento</label>
                    <input required type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-500" placeholder="Ej: Concentrado, Alfalfa..." value={formData.food_type} onChange={e => setFormData({...formData, food_type: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Cantidad (kg)</label>
                    <input required type="number" step="0.01" className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-500" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Fecha de Suministro</label>
                    <input required type="date" className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-500" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                  </div>
                </div>
                <div className="pt-4 flex flex-col sm:flex-row justify-end gap-2">
                  <button type="button" onClick={() => setShowModal(false)} className="w-full sm:w-auto px-4 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">Cancelar</button>
                  <button type="submit" className="w-full sm:w-auto px-4 py-2.5 text-sm font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
                    {editingId ? 'Actualizar Registro' : 'Guardar Registro'}
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
