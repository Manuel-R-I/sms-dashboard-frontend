
import { useEffect, useState } from 'react';
import { Search, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import {
  obtenerReportes,
  actualizarReporte,
  eliminarReporte
} from '../lib/api';

const ETIQUETA_ESTADO = {
  pendiente: {
    texto: 'PENDIENTE',
    clase: 'bg-amber-950 text-amber-400 border-amber-800'
  },
  confirmado_smishing: {
    texto: 'CONFIRMADO',
    clase: 'bg-red-950 text-red-400 border-red-800'
  },
  falso_positivo: {
    texto: 'FALSO POSITIVO',
    clase: 'bg-slate-800 text-slate-400 border-slate-700'
  }
};

export default function ReportesView() {
  const { token } = useAuth();

  const [reportes, setReportes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [accionando, setAccionando] = useState(null);

  const cargar = async () => {
    setCargando(true);

    try {
      const data = await obtenerReportes(token);
      setReportes(data);
    } catch (error) {
      console.error('Error al cargar reportes:', error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    let cancelado = false;

    obtenerReportes(token)
      .then((data) => {
        if (!cancelado) {
          setReportes(data);
        }
      })
      .catch((error) => {
        if (!cancelado) {
          console.error('Error al cargar reportes:', error);
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

  const cambiarEstado = async (id, estado) => {
    setAccionando(id);

    try {
      await actualizarReporte(id, { estado }, token);
      await cargar();
    } finally {
      setAccionando(null);
    }
  };

  const eliminar = async (id) => {
    setAccionando(id);

    try {
      await eliminarReporte(id, token);
      await cargar();
    } finally {
      setAccionando(null);
    }
  };

  const filtrados = reportes.filter((r) =>
    r.mensaje?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.empresa_mencionada?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r._id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Reportes
        </h1>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />

          <input
            type="text"
            placeholder="Buscar por empresa, mensaje o id..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-slate-950 text-slate-200 border border-slate-800 text-xs pl-9 pr-4 py-2 rounded-xl focus:outline-none focus:border-emerald-500 w-full sm:w-80"
          />
        </div>
      </div>

      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl shadow-lg overflow-x-auto">
        {cargando ? (
          <p className="p-6 text-sm text-slate-400">
            Cargando...
          </p>
        ) : (
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-4">Fecha</th>
                <th className="p-4">Mensaje</th>
                <th className="p-4">Score</th>
                <th className="p-4">Estado</th>
                <th className="p-4 text-right">Accion</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60">
              {filtrados.map((rep) => {
                const estado =
                  ETIQUETA_ESTADO[rep.estado] ||
                  ETIQUETA_ESTADO.pendiente;

                return (
                  <tr
                    key={rep._id}
                    className="hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="p-4 whitespace-nowrap text-slate-500">
                      {new Date(rep.fecha_reporte).toLocaleString('es-CL')}
                    </td>

                    <td className="p-4 max-w-md">
                      <p className="font-semibold text-slate-200">
                        {rep.empresa_mencionada}
                      </p>
                      <p className="text-slate-400">
                        {rep.mensaje}
                      </p>
                    </td>

                    <td className="p-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded font-mono font-bold bg-red-950 text-red-400 border border-red-800/60 text-[10px]">
                        {rep.score_riesgo ?? '-'}/100{' '}
                        {rep.nivel_riesgo?.toUpperCase()}
                      </span>
                    </td>

                    <td className="p-4">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-xl border ${estado.clase}`}
                      >
                        {estado.texto}
                      </span>
                    </td>

                    <td className="p-4 text-right whitespace-nowrap">
                      <div className="flex justify-end gap-2">
                        {rep.estado !== 'confirmado_smishing' && (
                          <button
                            onClick={() =>
                              cambiarEstado(rep._id, 'confirmado_smishing')
                            }
                            disabled={accionando === rep._id}
                            className="bg-emerald-950 hover:bg-emerald-800 text-emerald-300 border border-emerald-700/80 px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 disabled:opacity-50"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            Confirmar
                          </button>
                        )}

                        {rep.estado !== 'falso_positivo' && (
                          <button
                            onClick={() =>
                              cambiarEstado(rep._id, 'falso_positivo')
                            }
                            disabled={accionando === rep._id}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 disabled:opacity-50"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Falso positivo
                          </button>
                        )}

                        <button
                          onClick={() => eliminar(rep._id)}
                          disabled={accionando === rep._id}
                          className="bg-red-950 hover:bg-red-800 text-red-300 border border-red-800/60 px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 disabled:opacity-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
