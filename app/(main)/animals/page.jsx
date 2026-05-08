"use client";
import React, { useState, useEffect } from 'react';
import { PlusCircle, PawPrint, Activity, X, Edit, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Card from '@/components/ui/Card';

export default function AnimalsPage() {
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: '', species: 'Conejo', breed: '', birthDate: '', gender: 'M', currentWeight: '', status: 'healthy'
  });

  useEffect(() => { fetchAnimals(); }, []);

  const fetchAnimals = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/animals');
      const text = await res.text(); 
      if (!res.ok || !text) { setAnimals([]); return; }
      const data = JSON.parse(text);
      setAnimals(Array.isArray(data) ? data : []);
    } catch (error) { setAnimals([]); } 
    finally { setLoading(false); }
  };

  const handleOpenNewModal = () => {
    setEditingId(null);
    setFormData({ name: '', species: 'Conejo', breed: '', birthDate: '', gender: 'M', currentWeight: '', status: 'healthy' });
    setShowModal(true);
  };

  const handleEditClick = (animal) => {
    setEditingId(animal.id);
    setFormData({
      name: animal.name,
      species: animal.species,
      breed: animal.breed,
      birthDate: animal.birthDate ? animal.birthDate.split('T')[0] : '',
      gender: animal.gender || 'M',
      currentWeight: animal.currentWeight,
      status: animal.status || 'healthy'
    });
    setShowModal(true);
  };

  const handleDeleteClick = async (id, name) => {
    if (!confirm(`¿Eliminar el registro de "${name}"?`)) return;
    try {
      const res = await fetch(`/api/animals?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchAnimals();
    } catch (error) { alert("Error de conexión"); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const isUpdating = editingId !== null;
      const res = await fetch('/api/animals', {
        method: isUpdating ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isUpdating ? { ...formData, id: editingId } : formData)
      });
      if (res.ok) {
        setShowModal(false);
        fetchAnimals(); 
      } else {
        alert("Error al guardar el animal");
      }
    } catch (error) { alert("Error de conexión"); }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <Card className="p-4 md:p-6 bg-transparent border-none shadow-none md:bg-white md:border-solid md:shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h3 className="text-xl font-bold text-slate-800">Censo de Producción</h3>
            <p className="text-sm text-slate-500 font-medium">Gestiona y monitorea tus animales</p>
          </div>
          <button 
            onClick={handleOpenNewModal}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-sm"
          >
            <PlusCircle size={20} /> Nuevo Animal
          </button>
        </div>
        
        {/* LA NUEVA TABLA TRANSFORMABLE (Animales) */}
        <div className="md:border md:border-slate-100 md:rounded-xl md:overflow-hidden bg-[#F8FAFC] md:bg-white p-2 md:p-0 rounded-xl">
          <table className="w-full text-left border-collapse">
            
            {/* Encabezado Oculto en Celular */}
            <thead className="hidden md:table-header-group bg-[#F8FAFC] border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">ID / Nombre</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Especie/Raza</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Peso</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Salud</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>

            {/* Tbody Flex para Tarjetas en Celular */}
            <tbody className="flex flex-col md:table-row-group gap-4 md:gap-0">
              {animals.length > 0 ? animals.map((a) => (
                <tr 
                  key={a.id} 
                  className="flex flex-col md:table-row bg-white md:hover:bg-slate-50/50 transition-colors border border-slate-200 md:border-0 md:border-b md:border-slate-100 rounded-xl md:rounded-none p-4 md:p-0 shadow-sm md:shadow-none"
                >
                  
                  {/* Nombre / ID */}
                  <td className="md:px-6 md:py-4 flex items-center justify-between md:table-cell border-b border-slate-50 md:border-none pb-3 md:pb-0 mb-3 md:mb-0">
                    <span className="md:hidden text-[10px] font-bold text-slate-400 uppercase">ID / Nombre</span>
                    <div className="flex items-center gap-3">
                      <div className="hidden md:flex w-8 h-8 rounded-full bg-emerald-50 items-center justify-center text-emerald-600 shrink-0">
                        <PawPrint size={16} />
                      </div>
                      <span className="font-bold text-slate-800 text-right md:text-left">{a.name}</span>
                    </div>
                  </td>

                  {/* Especie / Raza */}
                  <td className="md:px-6 md:py-4 flex items-center justify-between md:table-cell border-b border-slate-50 md:border-none pb-3 md:pb-0 mb-3 md:mb-0">
                    <span className="md:hidden text-[10px] font-bold text-slate-400 uppercase">Especie / Raza</span>
                    <div className="flex flex-col items-end md:items-start">
                      <span className="text-sm font-semibold text-slate-700">{a.species}</span>
                      <span className="text-xs text-slate-400 font-medium">{a.breed}</span>
                    </div>
                  </td>

                  {/* Peso */}
                  <td className="md:px-6 md:py-4 flex items-center justify-between md:table-cell border-b border-slate-50 md:border-none pb-3 md:pb-0 mb-3 md:mb-0">
                    <span className="md:hidden text-[10px] font-bold text-slate-400 uppercase">Peso Actual</span>
                    <span className="font-mono text-sm font-bold text-amber-600">{a.currentWeight} kg</span>
                  </td>

                  {/* Salud */}
                  <td className="md:px-6 md:py-4 flex items-center justify-between md:table-cell border-b border-slate-50 md:border-none pb-3 md:pb-0 mb-3 md:mb-0">
                    <span className="md:hidden text-[10px] font-bold text-slate-400 uppercase">Salud</span>
                    <span className={cn(
                      "px-3 py-1 text-[10px] md:text-xs font-bold rounded-full border",
                      a.status === 'healthy' ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-rose-50 text-rose-700 border-rose-100"
                    )}>
                      {a.status === 'healthy' ? 'ÓPTIMO' : 'OBSERVACIÓN'}
                    </span>
                  </td>

                  {/* Acciones */}
                  <td className="md:px-6 md:py-4 flex items-center justify-between md:table-cell pt-1 md:pt-0">
                    <span className="md:hidden text-[10px] font-bold text-slate-400 uppercase">Acciones</span>
                    <div className="flex justify-end gap-2 md:gap-3">
                      <button onClick={() => handleEditClick(a)} className="p-2 bg-slate-50 md:bg-transparent text-slate-400 hover:text-blue-600 rounded-lg transition-colors border border-slate-200 md:border-none"><Edit size={16} /></button>
                      <button onClick={() => handleDeleteClick(a.id, a.name)} className="p-2 bg-slate-50 md:bg-transparent text-slate-400 hover:text-red-600 rounded-lg transition-colors border border-slate-200 md:border-none"><Trash2 size={16} /></button>
                    </div>
                  </td>

                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-400 font-medium">
                    {loading ? "Cargando..." : "No hay animales registrados."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* MODAL RESPONSIVO */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-white shrink-0">
              <h3 className="font-bold text-lg text-slate-800">{editingId ? 'Editar Animal' : 'Registrar Nuevo Animal'}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:bg-slate-100 p-1 rounded-md transition-colors"><X size={20} /></button>
            </div>
            <div className="overflow-y-auto p-5">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">ID / Código</label>
                    <input required type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-500" placeholder="Ej: LOTE-A-01" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Especie</label>
                    <select className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-500" value={formData.species} onChange={e => setFormData({...formData, species: e.target.value})}>
                      <option value="Conejo">Conejo</option>
                      <option value="Cuy">Cuy</option>
                      <option value="Codorniz">Codorniz</option>
                      <option value="Gallina">Gallina</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Raza</label>
                    <input required type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-500" value={formData.breed} onChange={e => setFormData({...formData, breed: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nacimiento</label>
                    <input required type="date" className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-500 text-sm" value={formData.birthDate} onChange={e => setFormData({...formData, birthDate: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Peso (kg)</label>
                    <input required type="number" step="0.01" className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-500" value={formData.currentWeight} onChange={e => setFormData({...formData, currentWeight: e.target.value})} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Estado de Salud</label>
                    <select className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-500" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                      <option value="healthy">✅ Óptimo (Saludable)</option>
                      <option value="sick">⚠️ En Observación (Enfermo / Estrés)</option>
                    </select>
                  </div>
                </div>
                <div className="pt-4 flex flex-col sm:flex-row justify-end gap-2">
                  <button type="button" onClick={() => setShowModal(false)} className="w-full sm:w-auto px-4 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">Cancelar</button>
                  <button type="submit" className="w-full sm:w-auto px-4 py-2.5 text-sm font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">{editingId ? 'Guardar Cambios' : 'Registrar Animal'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}