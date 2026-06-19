"use client";
import React, { useState, useEffect, useRef } from 'react';
import { PlusCircle, PawPrint, X, Edit, Trash2, Heart, Bell, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import Card from '@/components/ui/Card';

export default function AnimalsPage() {
  const [animals, setAnimals] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [clearedAlerts, setClearedAlerts] = useState([]);

  const modalTitleId = editingId ? 'editar-animal-title' : 'nuevo-animal-title';
  const firstModalFieldRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    species: 'Cuy',
    breed: '',
    birthDate: '',
    gender: 'HEMBRA',
    currentWeight: '',
    status: 'HEALTHY',
    purpose: 'Engorde',
    litterCode: '',
  });

  useEffect(() => {
    fetchAnimals();
  }, []);

  useEffect(() => {
    if (!showModal) return;

    firstModalFieldRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setShowModal(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showModal]);

  const fetchAnimals = async () => {
    setLoading(true);

    try {
      const res = await fetch('/api/animals');
      const text = await res.text();

      if (!res.ok || !text) {
        setAnimals([]);
        return;
      }

      const data = JSON.parse(text);
      setAnimals(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar animales:', error);
      setAnimals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenNewModal = () => {
    setEditingId(null);
    setFormData({
      name: '',
      species: 'Cuy',
      breed: '',
      birthDate: '',
      gender: 'HEMBRA',
      currentWeight: '',
      status: 'HEALTHY',
      purpose: 'Engorde',
      litterCode: '',
    });
    setShowModal(true);
  };

  const handleEditClick = (animal) => {
    setEditingId(animal.id);
    setFormData({
      name: animal.name,
      species: animal.species,
      breed: animal.breed,
      birthDate: animal.birthDate ? animal.birthDate.split('T')[0] : '',
      gender: animal.gender || 'HEMBRA',
      currentWeight: animal.currentWeight,
      status: animal.status || 'HEALTHY',
      purpose: animal.purpose || 'Engorde',
      litterCode: animal.litterCode || '',
    });
    setShowModal(true);
  };

  const handleDeleteClick = async (id, name) => {
    if (!confirm(`¿Eliminar el registro de "${name}"?`)) return;

    try {
      const res = await fetch(`/api/animals?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchAnimals();
    } catch (error) {
      alert('Error de conexión');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const isUpdating = editingId !== null;
      const payload = {
        ...formData,
        currentWeight: parseFloat(formData.currentWeight),
      };

      const res = await fetch('/api/animals', {
        method: isUpdating ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isUpdating ? { ...payload, id: editingId } : payload),
      });

      if (res.ok) {
        setShowModal(false);
        fetchAnimals();
      } else {
        alert('Error al guardar el animal');
      }
    } catch (error) {
      alert('Error de conexión');
    }
  };

  const isAptoParaEmpadre = (gender, weight) => {
    const w = parseFloat(weight);
    if (!w) return false;
    if (gender === 'HEMBRA' && w >= 800) return true;
    if (gender === 'MACHO' && w >= 900) return true;
    return false;
  };

  const alertasEmpadre = animals.filter((animal) => {
    const apto = isAptoParaEmpadre(animal.gender, animal.currentWeight);
    return apto && !clearedAlerts.includes(animal.id);
  });

  const filteredAnimals = animals.filter((animal) => {
    const term = searchTerm.toLowerCase();
    const visualStatus =
      animal.status === 'HEALTHY'
        ? 'activo saludable sano'
        : animal.status === 'SICK'
          ? 'enfermo tratamiento'
          : animal.status === 'SOLD'
            ? 'vendido saca'
            : 'mortalidad fallecido muerto';

    return (
      animal.name?.toLowerCase().includes(term) ||
      animal.species?.toLowerCase().includes(term) ||
      animal.breed?.toLowerCase().includes(term) ||
      animal.gender?.toLowerCase().includes(term) ||
      animal.status?.toLowerCase().includes(term) ||
      animal.purpose?.toLowerCase().includes(term) ||
      animal.litterCode?.toLowerCase().includes(term) ||
      animal.currentWeight?.toString().includes(term) ||
      visualStatus.includes(term)
    );
  });

  return (
    <div className="space-y-4 md:space-y-6">
      <Card className="p-4 md:p-6 bg-transparent border-none shadow-none md:bg-white md:border-solid md:shadow-sm dark:md:bg-slate-900 dark:border-slate-800 transition-colors">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Inventario y Censo</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Gestiona camadas, genética y reproducción</p>
          </div>

          <div className="flex w-full sm:w-auto items-center gap-3">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNotifications(!showNotifications)}
                aria-label={`Ver alertas de empadre. ${alertasEmpadre.length} alertas nuevas`}
                aria-expanded={showNotifications}
                aria-controls="panel-alertas-empadre"
                className="p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-all shadow-sm relative flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                <Bell size={20} aria-hidden="true" focusable="false" />
                {alertasEmpadre.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm animate-pulse">
                    {alertasEmpadre.length}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div id="panel-alertas-empadre" className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 shadow-xl rounded-2xl z-50 overflow-hidden">
                  <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <h4 className="font-bold text-slate-800 dark:text-white text-sm">Alertas de Empadre</h4>
                    {alertasEmpadre.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          const idsToClear = alertasEmpadre.map((animal) => animal.id);
                          setClearedAlerts([...clearedAlerts, ...idsToClear]);
                          setShowNotifications(false);
                        }}
                        className="text-xs text-slate-500 hover:text-rose-600 font-semibold flex items-center gap-1 transition-colors"
                      >
                        <Trash2 size={14} /> Borrar Todas
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {alertasEmpadre.length > 0 ? (
                      alertasEmpadre.map((animal) => (
                        <div key={animal.id} className="p-4 border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                          <p className="text-sm text-slate-700 dark:text-slate-300 leading-tight mb-1">
                            El animal <strong className="text-emerald-700 dark:text-emerald-400">{animal.name}</strong> ({animal.gender}) ha alcanzado <strong>{animal.currentWeight}g</strong>.
                          </p>
                          <span className="text-[10px] font-bold text-pink-600 inline-flex items-center gap-1 bg-pink-50 px-2 py-0.5 rounded-md">
                            <Heart size={10} /> LISTO PARA REPRODUCCIÓN
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center flex flex-col items-center justify-center gap-2">
                        <div className="w-12 h-12 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center text-slate-300">
                          <Bell size={24} />
                        </div>
                        <p className="text-slate-400 text-sm font-medium">No hay alertas nuevas.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleOpenNewModal}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
            >
              <PlusCircle size={20} aria-hidden="true" focusable="false" />
              Nuevo Animal
            </button>
          </div>
        </div>

        <div className="mb-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} aria-hidden="true" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por código, especie, raza, sexo, camada, peso o estado..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700 dark:text-slate-200 placeholder-slate-400"
            />
          </div>
        </div>

        <div className="md:border md:border-slate-100 dark:md:border-slate-800 md:rounded-xl md:overflow-hidden bg-[#F8FAFC] dark:bg-slate-900 md:bg-white dark:md:bg-slate-950 p-2 md:p-0 rounded-xl transition-colors">
          <table className="w-full text-left border-collapse">
            <thead className="hidden md:table-header-group bg-[#F8FAFC] dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">ID / Genética</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Camada / Sexo</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Peso (g)</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="flex flex-col md:table-row-group gap-4 md:gap-0">
              {filteredAnimals.length > 0 ? filteredAnimals.map((animal) => {
                const apto = isAptoParaEmpadre(animal.gender, animal.currentWeight);

                return (
                  <tr
                    key={animal.id}
                    className={cn(
                      'flex flex-col md:table-row transition-colors border md:border-0 md:border-b rounded-xl md:rounded-none p-4 md:p-0 shadow-sm md:shadow-none',
                      apto
                        ? 'bg-pink-50/30 border-pink-200 md:border-slate-100 dark:bg-pink-900/10 dark:border-pink-900/30'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 md:border-slate-100 dark:md:border-slate-800 md:hover:bg-slate-50/50 dark:md:hover:bg-slate-800/50'
                    )}
                  >
                    <td className="md:px-6 md:py-4 flex items-center justify-between md:table-cell border-b border-slate-50 dark:border-slate-800 md:border-none pb-3 md:pb-0 mb-3 md:mb-0">
                      <span className="md:hidden text-[10px] font-bold text-slate-400 uppercase">ID / Genética</span>
                      <div className="flex items-center gap-3">
                        <div className="hidden md:flex w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-900/20 items-center justify-center text-emerald-600 shrink-0">
                          <PawPrint size={16} />
                        </div>
                        <div className="flex flex-col items-end md:items-start">
                          <span className="font-bold text-slate-800 dark:text-slate-100 text-right md:text-left">{animal.name}</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">{animal.species} - {animal.breed}</span>
                        </div>
                      </div>
                    </td>
                    <td className="md:px-6 md:py-4 flex items-center justify-between md:table-cell border-b border-slate-50 dark:border-slate-800 md:border-none pb-3 md:pb-0 mb-3 md:mb-0">
                      <span className="md:hidden text-[10px] font-bold text-slate-400 uppercase">Camada / Sexo</span>
                      <div className="flex flex-col items-end md:items-start">
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{animal.litterCode || 'Sin Camada'}</span>
                        <span className={cn('text-xs font-bold', animal.gender === 'HEMBRA' ? 'text-pink-500' : 'text-blue-500')}>{animal.gender}</span>
                      </div>
                    </td>
                    <td className="md:px-6 md:py-4 flex items-center justify-between md:table-cell border-b border-slate-50 dark:border-slate-800 md:border-none pb-3 md:pb-0 mb-3 md:mb-0">
                      <span className="md:hidden text-[10px] font-bold text-slate-400 uppercase">Peso Actual</span>
                      <div className="flex flex-col items-end md:items-start gap-1">
                        <span className="font-mono text-sm font-bold text-amber-600">{animal.currentWeight} g</span>
                        {apto && <span className="flex items-center gap-1 bg-pink-100 text-pink-700 text-[10px] px-2 py-0.5 rounded-full font-bold"><Heart size={10} /> APTO EMPADRE</span>}
                      </div>
                    </td>
                    <td className="md:px-6 md:py-4 flex items-center justify-between md:table-cell border-b border-slate-50 dark:border-slate-800 md:border-none pb-3 md:pb-0 mb-3 md:mb-0">
                      <span className="md:hidden text-[10px] font-bold text-slate-400 uppercase">Estado</span>
                      <div className="flex flex-col items-end md:items-start gap-1">
                        <span className={cn(
                          'px-3 py-1 text-[10px] md:text-xs font-bold rounded-full border',
                          animal.status === 'HEALTHY'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                            : animal.status === 'SOLD'
                              ? 'bg-blue-50 text-blue-700 border-blue-100'
                              : animal.status === 'SICK'
                                ? 'bg-amber-50 text-amber-700 border-amber-100'
                                : 'bg-rose-50 text-rose-700 border-rose-100'
                        )}>
                          {animal.status === 'HEALTHY' ? 'ACTIVO' : animal.status === 'SICK' ? 'ENFERMO / TRATAMIENTO' : animal.status === 'SOLD' ? 'VENDIDO' : 'MORTALIDAD'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium uppercase">{animal.purpose}</span>
                      </div>
                    </td>
                    <td className="md:px-6 md:py-4 flex items-center justify-between md:table-cell pt-1 md:pt-0">
                      <span className="md:hidden text-[10px] font-bold text-slate-400 uppercase">Acciones</span>
                      <div className="flex justify-end gap-2 md:gap-3">
                        <button type="button" onClick={() => handleEditClick(animal)} aria-label={`Editar animal ${animal.name}`} className="p-2 bg-slate-50 md:bg-transparent text-slate-400 hover:text-blue-600 rounded-lg transition-colors border border-slate-200 md:border-none"><Edit size={16} /></button>
                        <button type="button" onClick={() => handleDeleteClick(animal.id, animal.name)} aria-label={`Eliminar animal ${animal.name}`} className="p-2 bg-slate-50 md:bg-transparent text-slate-400 hover:text-red-600 rounded-lg transition-colors border border-slate-200 md:border-none"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-400 font-medium">
                    {loading ? 'Cargando registros...' : searchTerm ? 'No se encontraron animales.' : 'No hay animales registrados.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-[60] p-4" role="presentation">
          <div className="bg-white dark:bg-slate-950 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col" role="dialog" aria-modal="true" aria-labelledby={modalTitleId}>
            <div className="flex justify-between items-center p-5 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 shrink-0">
              <h3 id={modalTitleId} className="font-bold text-lg text-slate-800 dark:text-white">{editingId ? 'Editar Registro' : 'Registrar Nuevo Animal'}</h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                aria-label="Cerrar modal de animal"
                className="text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 p-1 rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                <X size={20} aria-hidden="true" focusable="false" />
              </button>
            </div>
            <div className="overflow-y-auto p-5">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">ID / Código Identificador</label>
                    <input ref={firstModalFieldRef} required type="text" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 dark:bg-slate-900 rounded-lg outline-none focus:border-emerald-500" placeholder="Ej: LOTE-A-01" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Especie</label>
                    <select className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 dark:bg-slate-900 rounded-lg outline-none focus:border-emerald-500" value={formData.species} onChange={e => setFormData({ ...formData, species: e.target.value })}>
                      <option value="Cuy">Cuy</option>
                      <option value="Conejo">Conejo</option>
                      <option value="Gallina">Gallina</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Raza / Genética</label>
                    <select required className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 dark:bg-slate-900 rounded-lg outline-none focus:border-emerald-500" value={formData.breed} onChange={e => setFormData({ ...formData, breed: e.target.value })}>
                      <option value="">Seleccione raza...</option>
                      <option value="Perú">Raza Perú (Pesada)</option>
                      <option value="Andina">Raza Andina (Prolífica)</option>
                      <option value="Inti">Raza Inti (Intermedia)</option>
                      <option value="Criolla">Criolla / Mejorada</option>
                      <option value="Otra">Otra</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Sexo</label>
                    <select className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 dark:bg-slate-900 rounded-lg outline-none focus:border-emerald-500" value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })}>
                      <option value="HEMBRA">Hembra</option>
                      <option value="MACHO">Macho</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Código de Camada (Opcional)</label>
                    <input type="text" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 dark:bg-slate-900 rounded-lg outline-none focus:border-emerald-500" placeholder="Ej: CAM-001" value={formData.litterCode} onChange={e => setFormData({ ...formData, litterCode: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Fecha Nacimiento</label>
                    <input required type="date" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 dark:bg-slate-900 rounded-lg outline-none focus:border-emerald-500 text-sm" value={formData.birthDate} onChange={e => setFormData({ ...formData, birthDate: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Peso en Gramos (g)</label>
                    <input required type="number" step="1" min="0" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 dark:bg-slate-900 rounded-lg outline-none focus:border-emerald-500" placeholder="Ej: 850" value={formData.currentWeight} onChange={e => setFormData({ ...formData, currentWeight: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Estado en Inventario</label>
                    <select className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 dark:bg-slate-900 rounded-lg outline-none focus:border-emerald-500" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                      <option value="HEALTHY">🟢 Activo en Granja</option>
                      <option value="SICK">🟡 Enfermo / Tratamiento</option>
                      <option value="SOLD">🔵 Vendido / Saca</option>
                      <option value="DECEASED">🔴 Mortalidad (Baja)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Propósito</label>
                    <select className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 dark:bg-slate-900 rounded-lg outline-none focus:border-emerald-500" value={formData.purpose} onChange={e => setFormData({ ...formData, purpose: e.target.value })}>
                      <option value="Engorde">Producción / Engorde</option>
                      <option value="Reproductor">Plantel Reproductor</option>
                      <option value="Descarte">Descarte</option>
                    </select>
                  </div>
                </div>
                <div className="pt-6 flex flex-col sm:flex-row justify-end gap-3 border-t border-slate-100 dark:border-slate-800 mt-6">
                  <button type="button" onClick={() => setShowModal(false)} className="w-full sm:w-auto px-5 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">Cancelar</button>
                  <button type="submit" className="w-full sm:w-auto px-5 py-2.5 text-sm font-bold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors shadow-sm">{editingId ? 'Guardar Cambios' : 'Registrar en Inventario'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
