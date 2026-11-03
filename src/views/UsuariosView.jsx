
import { useEffect, useState } from 'react';
import { ShieldCheck, Trash2 } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import {
  obtenerUsuarios,
  actualizarUsuario,
  eliminarUsuario
} from '../lib/api';

export default function UsuariosView() {
  const { token } = useAuth();

  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [accionando, setAccionando] = useState(null);

  const cargar = async () => {
    setCargando(true);

    try {
      const data = await obtenerUsuarios(token);
      setUsuarios(data);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    let cancelado = false;

    obtenerUsuarios(token)
      .then((data) => {
        if (!cancelado) {
          setUsuarios(data);
        }
      })
      .catch((error) => {
        if (!cancelado) {
          console.error('Error al cargar usuarios:', error);
        }
      })
      .finally(() => {
        if (!cancelado) {
          setCargando(false);
        }
      });

    return () => {
      cancelado = true;
    };
  }, [token]);

  const cambiarRol = async (id, rol) => {
    setAccionando(id);

    try {
      await actualizarUsuario(id, { rol }, token);
      await cargar();
    } finally {
      setAccionando(null);
    }
  };

  const eliminar = async (id) => {
    setAccionando(id);

    try {
      await eliminarUsuario(id, token);
      await cargar();
    } finally {
      setAccionando(null);
    }
  };

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold tracking-tight text-white mb-6">
        Usuarios
      </h1>

      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl shadow-lg overflow-x-auto">
        {cargando ? (
          <p className="p-6 text-sm text-slate-400">
            Cargando...
          </p>
        ) : (
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-4">Telefono</th>
                <th className="p-4">Rol</th>
                <th className="p-4">Registrado</th>
                <th className="p-4 text-right">Accion</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60">
              {usuarios.map((u) => (
                <tr
                  key={u._id}
                  className="hover:bg-slate-800/40 transition-colors"
                >
                  <td className="p-4 font-mono text-slate-200">
                    {u.telefono}
                  </td>

                  <td className="p-4">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-xl border ${
                        u.rol === 'admin'
                          ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {u.rol.toUpperCase()}
                    </span>
                  </td>

                  <td className="p-4 text-slate-500">
                    {new Date(u.fecha_registro).toLocaleDateString('es-CL')}
                  </td>

                  <td className="p-4 text-right whitespace-nowrap">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() =>
                          cambiarRol(
                            u._id,
                            u.rol === 'admin' ? 'usuario_movil' : 'admin'
                          )
                        }
                        disabled={accionando === u._id}
                        className="bg-emerald-950 hover:bg-emerald-800 text-emerald-300 border border-emerald-700/80 px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        {u.rol === 'admin' ? 'Quitar admin' : 'Hacer admin'}
                      </button>

                      <button
                        onClick={() => eliminar(u._id)}
                        disabled={accionando === u._id}
                        className="bg-red-950 hover:bg-red-800 text-red-300 border border-red-800/60 px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
