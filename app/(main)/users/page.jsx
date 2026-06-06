"use client";
import { PlusCircle, Shield, User as UserIcon, X, Edit, Trash2 } from 'lucide-react';
import React, { useState, useEffect ,useRef} from 'react';
import Card from '@/components/ui/Card';
import { cn } from '@/lib/utils';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const userModalTitleId = editingId ? 'editar-usuario-title' : 'nuevo-usuario-title';
  const firstUserModalFieldRef = useRef(null);

useEffect(() => {
  if (!showModal) return;

  firstUserModalFieldRef.current?.focus();

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

  const [currentUserRole, setCurrentUserRole] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('zooai_user');
      if (stored) {
        const user = JSON.parse(stored);
        return user.role?.toUpperCase() || 'OPERATOR';
      }
    }
    return 'OPERATOR';
  });

  const [formData, setFormData] = useState({
    username: '', email: '', password: '', role: 'OPERATOR'
  });

  useEffect(() => {
    fetchUsers();
    const storedUser = localStorage.getItem('zooai_user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setCurrentUserRole(String(user.role || "").trim().toUpperCase());
    }
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  const handleEditClick = (user) => {
    setEditingId(user.id);
    setFormData({ username: user.username, email: user.email, password: '', role: user.role });
    setShowModal(true);
  };

  const handleDeleteClick = async (id, username) => {
    if (!confirm(`¿Eliminar al usuario "${username}"?`)) return;
    try {
      const res = await fetch(`/api/users?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchUsers();
    } catch (error) { alert("Error de conexión"); }
  };

  const handleOpenNewUserModal = () => {
    setEditingId(null);
    setFormData({ username: '', email: '', password: '', role: 'OPERATOR' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const isUpdating = editingId !== null;
      const res = await fetch('/api/users', {
        method: isUpdating ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isUpdating ? { ...formData, id: editingId } : formData)
      });

      const data = await res.json(); // Obtenemos la respuesta del servidor

      if (res.ok) {
        setShowModal(false);
        fetchUsers(); 
      } else {
        // Mostramos el error específico que enviamos desde el backend
        alert(`Error: ${data.error || "No se pudo guardar"}`);
      }
    } catch (error) {
      alert("Error crítico: Revisa tu conexión a internet o la base de datos.");
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <Card className="p-4 md:p-6 bg-transparent border-none shadow-none md:bg-white md:border-solid md:shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h3 className="text-xl font-bold text-slate-800">Gestión de Usuarios</h3>
            <p className="text-sm text-slate-500 font-medium">Administra los accesos del sistema</p>
          </div>
          <button
  type="button"
  onClick={handleOpenNewUserModal}
  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
>
  <PlusCircle size={20} aria-hidden="true" focusable="false" />
  Nuevo Usuario
</button>
        </div>
        
        {/* LA NUEVA TABLA TRANSFORMABLE (Sin overflow-x, full Card View en Móvil) */}
        <div className="md:border md:border-slate-100 md:rounded-xl md:overflow-hidden bg-[#F8FAFC] md:bg-white p-2 md:p-0 rounded-xl">
          <table className="w-full text-left border-collapse">
            
            {/* Ocultamos el encabezado tradicional en celular */}
            <thead className="hidden md:table-header-group bg-[#F8FAFC] border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Usuario</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Rol</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>

            {/* En celular, el tbody se vuelve un Flex de columnas (tarjetas) */}
            <tbody className="flex flex-col md:table-row-group gap-4 md:gap-0">
              {users.length > 0 ? users.map((user) => (
                <tr 
                  key={user.id} 
                  // TR transformado: en celular es un bloque blanco con sombra, en PC es una fila
                  className="flex flex-col md:table-row bg-white md:hover:bg-slate-50/50 transition-colors border border-slate-200 md:border-0 md:border-b md:border-slate-100 rounded-xl md:rounded-none p-4 md:p-0 shadow-sm md:shadow-none"
                >
                  
                  {/* Celda Usuario */}
                  <td className="md:px-6 md:py-4 flex items-center justify-between md:table-cell border-b border-slate-50 md:border-none pb-3 md:pb-0 mb-3 md:mb-0">
                    <span className="md:hidden text-[10px] font-bold text-slate-400 uppercase">Usuario</span>
                    <div className="flex items-center gap-3">
                      <div className="hidden md:flex w-8 h-8 rounded-full bg-slate-100 items-center justify-center text-slate-600 shrink-0">
                        <UserIcon size={16} />
                      </div>
                      <span className="font-bold text-slate-800">{user.username}</span>
                    </div>
                  </td>

                  {/* Celda Email */}
                  <td className="md:px-6 md:py-4 flex items-center justify-between md:table-cell border-b border-slate-50 md:border-none pb-3 md:pb-0 mb-3 md:mb-0">
                    <span className="md:hidden text-[10px] font-bold text-slate-400 uppercase">Email</span>
                    <span className="text-sm font-medium text-slate-600 truncate max-w-[180px] md:max-w-none">{user.email}</span>
                  </td>

                  {/* Celda Rol */}
                  <td className="md:px-6 md:py-4 flex items-center justify-between md:table-cell border-b border-slate-50 md:border-none pb-3 md:pb-0 mb-3 md:mb-0">
                    <span className="md:hidden text-[10px] font-bold text-slate-400 uppercase">Rol</span>
                    <span className={cn("px-3 py-1 text-[10px] md:text-xs font-bold rounded-full uppercase border", user.role === 'ADMIN' ? "bg-purple-50 text-purple-700 border-purple-100" : "bg-blue-50 text-blue-700 border-blue-100")}>
                      {user.role === 'ADMIN' ? 'Administrador' : 'Operador'}
                    </span>
                  </td>

                  {/* Celda Acciones */}
                  <td className="md:px-6 md:py-4 flex items-center justify-between md:table-cell pt-1 md:pt-0">
                    <span className="md:hidden text-[10px] font-bold text-slate-400 uppercase">Acciones</span>
                    <div className="flex justify-end gap-2 md:gap-3">
                      {String(currentUserRole).includes('ADMIN') ? (
                        <>
                          <button
  type="button"
  onClick={() => handleEditClick(user)}
  aria-label={`Editar usuario ${user.username}`}
  className="p-2 bg-slate-50 md:bg-transparent text-slate-500 hover:text-blue-600 rounded-lg transition-colors border border-slate-200 md:border-none focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
>
  <Edit size={16} aria-hidden="true" focusable="false" />
</button>
                          <button
  type="button"
  onClick={() => handleDeleteClick(user.id, user.username)}
  aria-label={`Eliminar usuario ${user.username}`}
  className="p-2 bg-slate-50 md:bg-transparent text-slate-500 hover:text-red-600 rounded-lg transition-colors border border-slate-200 md:border-none focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
>
  <Trash2 size={16} aria-hidden="true" focusable="false" />
</button>
                        </>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic bg-slate-50 px-2 py-1 rounded">Limitado</span>
                      )}
                    </div>
                  </td>

                </tr>
              )) : (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-slate-400 font-medium">Cargando...</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* MODAL (Se mantiene igual, ya lo habíamos optimizado) */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4" role="presentation">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col" role="dialog" aria-labelledby={userModalTitleId} aria-modal="true" >
            <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-white shrink-0">
              <h3 id={userModalTitleId} className="font-bold text-lg text-slate-800">{editingId ? 'Editar Usuario' : 'Registrar Nuevo Usuario'}</h3>
              <button type="button" onClick={() => setShowModal(false)}  className="text-slate-400 hover:bg-slate-100 p-1 rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500" aria-label="Cerrar modal">
                <X size={20} aria-hidden="true" focusable="false" />
              </button>
            </div>
            <div className="overflow-y-auto p-5">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Usuario</label>
                  <input ref={firstUserModalFieldRef} required type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-500" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value.toLowerCase().replace(/\s/g, '')})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
                  <input required type="email" className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-500" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Contraseña {editingId && <span className="text-emerald-500 lowercase">(Opcional)</span>}
                  </label>
                  <input required={!editingId} type="password" minLength="6" className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-500" placeholder={editingId ? "Dejar en blanco para no cambiar" : "Mínimo 6 caracteres"} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Rol en el Sistema</label>
                  <select className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-500" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                    <option value="OPERATOR">Operador (Solo registros)</option>
                    <option value="ADMIN">Administrador (Acceso total)</option>
                  </select>
                </div>
                <div className="pt-4 flex flex-col sm:flex-row justify-end gap-2">
                  <button type="button" onClick={() => setShowModal(false)} className="w-full sm:w-auto px-4 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">Cancelar</button>
                  <button type="submit" className="w-full sm:w-auto px-4 py-2.5 text-sm font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">{editingId ? 'Guardar Cambios' : 'Crear Usuario'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}