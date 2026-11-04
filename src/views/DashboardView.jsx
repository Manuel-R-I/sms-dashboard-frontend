import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FileText, ShieldAlert, AlertTriangle, ExternalLink, Database, RefreshCw,
  X, ChevronRight, CheckCircle2, TrendingUp, Percent
} from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { useAuth } from '../context/useAuth.js';
import { obtenerReportes } from '../lib/api';
import { obtenerNivelRiesgo, estiloRiesgo, ESTILO_RIESGO } from '../lib/riesgo';

const COLOR_CATEGORIA = { banca: '#ef4444', encomiendas: '#f59e0b', gobierno: '#3b82f6', retail: '#a855f7', telecomunicaciones: '#06b6d4', peajes: '#84cc16', otros: '#94a3b8', sin_clasificar: '#64748b' };
const ETIQUETA_CATEGORIA = { banca: 'Banca', encomiendas: 'Encomiendas', gobierno: 'Gobierno', retail: 'Retail', telecomunicaciones: 'Telecomunicaciones', peajes: 'Peajes', otros: 'Otros', sin_clasificar: 'Sin clasificar' };
const ETIQUETA_ESTADO = { pendiente: 'Pendiente', confirmado_smishing: 'Confirmado', falso_positivo: 'Falso positivo' };

const formatearFecha = (f) => (f ? new Date(f).toLocaleString('es-CL', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '-');

export default function DashboardView({ onIrARepotes }) {
  const { token } = useAuth();

  const [reportes, setReportes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState('');
  const [categoriaActiva, setCategoriaActiva] = useState(null);
  const [filtroKpi, setFiltroKpi] = useState(null);

  const cargar = useCallback(async () => {
    try {
      const data = await obtenerReportes(token);
      setReportes(Array.isArray(data) ? data : []);
      setError('');
    } catch {
      setError('No se pudieron cargar los reportes');
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, [token]);

  useEffect(() => { cargar(); }, [cargar]);

  const kpis = useMemo(() => {
    const revisados = reportes.filter((r) => r.estado && r.estado !== 'pendiente').length;
    const confirmados = reportes.filter((r) => r.estado === 'confirmado_smishing').length;
    return {
      total: reportes.length,
      altoRiesgo: reportes.filter((r) => r.nivel_riesgo === 'alto').length,
      pendientes: reportes.filter((r) => r.estado === 'pendiente').length,
      conMaliciosos: reportes.filter((r) => (r.analisis?.virustotal_maliciosos ?? 0) > 0).length,
      tasaConfirmacion: revisados ? Math.round((confirmados / revisados) * 100) : 0
    };
  }, [reportes]);

  const datosCategorias = useMemo(() => {
    const conteo = {};
    reportes.forEach((r) => { const cat = r.categoria || 'sin_clasificar'; conteo[cat] = (conteo[cat] || 0) + 1; });
    return Object.entries(conteo)
      .map(([categoria, count]) => ({ categoria, name: ETIQUETA_CATEGORIA[categoria] || categoria, value: count, color: COLOR_CATEGORIA[categoria] || '#64748b' }))
      .sort((a, b) => b.value - a.value);
  }, [reportes]);

  // Reportes de la categoría seleccionada en el gráfico
  const reportesDeCategoria = useMemo(() => {
    if (!categoriaActiva) return [];
    return reportes
      .filter((r) => (r.categoria || 'sin_clasificar') === categoriaActiva)
      .sort((a, b) => new Date(b.fecha_reporte) - new Date(a.fecha_reporte));
  }, [reportes, categoriaActiva]);

  const aplicarFiltroKpi = (lista) => {
    const id = filtroKpi?.id;
    if (id === 'total') return lista;
    if (id === 'alto') return lista.filter((r) => r.nivel_riesgo === 'alto');
    if (id === 'pendientes') return lista.filter((r) => r.estado === 'pendiente');
    if (id === 'maliciosos') return lista.filter((r) => (r.analisis?.virustotal_maliciosos ?? 0) > 0);
    return lista;
  };

  const kpiActivo = filtroKpi || { id: 'total', label: 'Actividad reciente' };

  const actividad = useMemo(() => {
    return aplicarFiltroKpi(reportes)
      .slice()
      .sort((a, b) => new Date(b.fecha_reporte) - new Date(a.fecha_reporte))
      .slice(0, 8);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportes, filtroKpi]);

  const datosRiesgo = useMemo(() => {
    const conteo = { bajo: 0, medio: 0, alto: 0, ninguno: 0 };
    reportes.forEach((r) => { conteo[obtenerNivelRiesgo(r.score_riesgo) || 'ninguno'] += 1; });
    return [
      { nivel: 'bajo', name: 'Bajo', value: conteo.bajo, color: ESTILO_RIESGO.bajo.hex },
      { nivel: 'medio', name: 'Medio', value: conteo.medio, color: ESTILO_RIESGO.medio.hex },
      { nivel: 'alto', name: 'Alto', value: conteo.alto, color: ESTILO_RIESGO.alto.hex }
    ];
  }, [reportes]);

  const datosTendencia = useMemo(() => {
    const dias = [];
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    for (let i = 6; i >= 0; i -= 1) {
      const dia = new Date(hoy);
      dia.setDate(hoy.getDate() - i);
      const fin = new Date(dia);
      fin.setDate(dia.getDate() + 1);
      dias.push({
        name: dia.toLocaleDateString('es-CL', { weekday: 'short', day: '2-digit' }),
        total: reportes.filter((r) => {
          const f = new Date(r.fecha_reporte);
          return f >= dia && f < fin;
        }).length
      });
    }
    return dias;
  }, [reportes]);

  const refrescar = () => { setRefrescando(true); cargar(); };
  const irAReportes = () => onIrARepotes && onIrARepotes();

  if (cargando) return <div className="p-8 text-slate-400 text-sm">Cargando datos del backend...</div>;

  return (
    <div className="w-full">
      <header className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800 gap-4 w-full mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Dashboard</h1>
          <p className="text-slate-400 text-xs md:text-sm mt-0.5">Panel Interno de Monitoreo de Smishing [Chile]</p>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-400 bg-slate-900/90 p-3 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2"><Database className="w-4 h-4 text-emerald-400" /><span>API: <strong className={error ? 'text-red-400' : 'text-emerald-400'}>{error ? 'Error' : 'Conectado'}</strong></span></div>
          <span className="text-slate-700">|</span>
          <button onClick={refrescar} disabled={refrescando} className="flex items-center gap-2 hover:text-slate-200 disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 text-blue-400 ${refrescando ? 'animate-spin' : ''}`} />
            {refrescando ? 'Actualizando...' : 'Actualizar'}
          </button>
        </div>
      </header>

      {error && <p className="text-xs text-red-400 mb-4">{error}</p>}

      {/* KPIs clicables como filtro del panel de actividad */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6 w-full">
        <TarjetaKpi icon={FileText} color="blue" label="Total Reportes" valor={kpis.total} nota="Reportes formales en la base"
          activa={filtroKpi?.id === 'total'} onClick={() => setFiltroKpi({ id: 'total', label: 'Todos los reportes' })} />
        <TarjetaKpi icon={ShieldAlert} color="red" label="Alto Riesgo" valor={kpis.altoRiesgo} nota={`${kpis.total ? Math.round((kpis.altoRiesgo / kpis.total) * 100) : 0}% del total`}
          activa={filtroKpi?.id === 'alto'} onClick={() => setFiltroKpi({ id: 'alto', label: 'Reportes de alto riesgo' })} />
        <TarjetaKpi icon={AlertTriangle} color="amber" label="Pendientes de Revisar" valor={kpis.pendientes} nota="Estado: pendiente"
          activa={filtroKpi?.id === 'pendientes'} onClick={() => setFiltroKpi({ id: 'pendientes', label: 'Reportes pendientes' })} />
        <TarjetaKpi icon={ExternalLink} color="purple" label="Con URL Maliciosa" valor={kpis.conMaliciosos} nota="Detectado via VirusTotal"
          activa={filtroKpi?.id === 'maliciosos'} onClick={() => setFiltroKpi({ id: 'maliciosos', label: 'Reportes con URL maliciosa' })} />
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Tasa de confirmacion</span>
            <div className="text-3xl font-extrabold mt-3 font-mono text-emerald-400">{kpis.tasaConfirmacion}%</div>
            <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Confirmados sobre revisados</p>
          </div>
          <Percent className="w-8 h-8 text-emerald-500/50" />
        </div>
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Últimos 7 días</span>
            <div className="text-3xl font-extrabold mt-2 font-mono text-blue-400">
              {datosTendencia.reduce((a, d) => a + d.total, 0)}
            </div>
            <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" /> Reportes recibidos esta semana
            </p>
          </div>

          {/* Gráfico ampliado con ejes etiquetados */}
          <div className="w-full md:w-64 h-24">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={datosTendencia} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="#64748b"
                  fontSize={9}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                  interval={0}       
                  angle={-30}         
                  textAnchor="end"    
                  height={35}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={10}
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, fontSize: 11 }}
                  cursor={{ fill: 'rgba(51, 65, 85, 0.3)' }}
                />
                <Bar dataKey="total" fill="#3b82f6" radius={[3, 3, 0, 0]} name="Reportes" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Gráfico de torta + lista lateral de la categoría seleccionada */}
      <section className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 shadow-lg">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h2 className="text-base font-bold text-white">Categorias de Posible Smishing</h2>
            <p className="text-xs text-slate-400 mb-4">Haz clic en una categoria para ver sus reportes.</p>
          </div>
          {categoriaActiva && (
            <button onClick={() => setCategoriaActiva(null)} className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1">
              <X className="w-3.5 h-3.5" /> Limpiar
            </button>
          )}
        </div>

        {datosCategorias.length === 0 ? <p className="text-sm text-slate-500">Aun no hay reportes para graficar.</p> : (
          <div className={`grid gap-6 ${categoriaActiva ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={datosCategorias}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    onClick={(_, index) => {
                      const cat = datosCategorias[index]?.categoria;
                      setCategoriaActiva((prev) => (prev === cat ? null : cat));
                    }}
                  >
                    {datosCategorias.map((d) => (
                      <Cell
                        key={d.categoria}
                        fill={d.color}
                        stroke={categoriaActiva === d.categoria ? '#f8fafc' : 'transparent'}
                        strokeWidth={2}
                        cursor="pointer"
                        opacity={!categoriaActiva || categoriaActiva === d.categoria ? 1 : 0.35}
                      />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, fontSize: 12 }} />
                  <Legend
                    wrapperStyle={{ fontSize: 12, cursor: 'pointer' }}
                    onClick={(entry) => {
                      const item = datosCategorias.find((d) => d.name === entry.value);
                      if (!item) return;
                      setCategoriaActiva((prev) => (prev === item.categoria ? null : item.categoria));
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {categoriaActiva && (
              <div className="border border-slate-800 rounded-xl overflow-hidden flex flex-col max-h-72">
                <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLOR_CATEGORIA[categoriaActiva] || '#64748b' }} />
                    <h3 className="text-sm font-bold text-white">{ETIQUETA_CATEGORIA[categoriaActiva] || categoriaActiva}</h3>
                  </div>
                  <span className="text-[10px] text-slate-400">{reportesDeCategoria.length} reportes</span>
                </div>

                <div className="overflow-y-auto divide-y divide-slate-800/60">
                  {reportesDeCategoria.length === 0 ? (
                    <p className="p-4 text-xs text-slate-500">Sin reportes en esta categoria.</p>
                  ) : reportesDeCategoria.map((r) => {
                    const est = estiloRiesgo(r.score_riesgo);
                    return (
                      <button key={r._id} onClick={irAReportes} className="w-full text-left p-3 hover:bg-slate-800/40 transition-colors">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-slate-200 truncate">{r.empresa_mencionada || 'sin_identificar'}</span>
                          <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border shrink-0 ${est.chip}`}>
                            {r.score_riesgo ?? '-'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">{r.mensaje}</p>
                        <div className="flex items-center justify-between mt-1.5 text-[10px] text-slate-500">
                          <span>{formatearFecha(r.fecha_reporte)}</span>
                          <span>{ETIQUETA_ESTADO[r.estado] || r.estado}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <button onClick={irAReportes} className="mt-auto px-4 py-2.5 text-xs text-emerald-400 hover:bg-slate-800/40 border-t border-slate-800 flex items-center justify-center gap-1">
                  Ver todos en Reportes <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Actividad reciente (filtrada por el KPI cliqueado) */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white">{kpiActivo.label}</h2>
            {filtroKpi && (
              <button
                onClick={() => setFiltroKpi(null)}
                className="text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                Quitar filtro
              </button>
            )}
          </div>

          {actividad.length === 0 ? (
            <p className="text-sm text-slate-500">No hay reportes para este filtro.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="pb-3 pl-2">Detalle del Reporte</th>
                    <th className="pb-3 text-center px-2">Score Riesgo</th>
                    <th className="pb-3 text-right pr-2">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {actividad.map((r) => {
                    const est = estiloRiesgo(r.score_riesgo);
                    return (
                      <tr key={r._id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 pl-2 max-w-[280px] sm:max-w-xs">
                          <div className="flex items-center gap-2">
                            <span className={`w-1.5 h-6 rounded-full shrink-0 ${est.texto.replace('text-', 'bg-')}`} />
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-slate-200 truncate">
                                {r.empresa_mencionada || 'sin_identificar'} · {ETIQUETA_CATEGORIA[r.categoria] || r.categoria}
                              </p>
                              <p className="text-[11px] text-slate-400 truncate">{r.mensaje}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-center whitespace-nowrap">
                          <span className={`inline-block text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${est.chip}`}>
                            {r.score_riesgo ?? '-'} / 100
                          </span>
                        </td>
                        <td className="py-3 text-right pr-2 whitespace-nowrap text-[11px] text-slate-400 font-mono">
                          {formatearFecha(r.fecha_reporte)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 shadow-lg">
          <h2 className="text-base font-bold text-white mb-1">Reportes por riesgo</h2>
          <p className="text-xs text-slate-400 mb-4">0-39 bajo · 40-69 medio · 70-100 alto</p>

          {reportes.length === 0 ? <p className="text-sm text-slate-500">Sin datos.</p> : (
            <>
              <div className="flex h-4 w-full rounded-full overflow-hidden">
                {datosRiesgo.map((d) => (
                  d.value > 0 && (
                    <div key={d.nivel} title={`${d.name}: ${d.value}`} style={{ width: `${(d.value / reportes.length) * 100}%`, background: d.color }} />
                  )
                ))}
              </div>
              <div className="mt-4 space-y-2">
                {datosRiesgo.map((d) => (
                  <button key={d.nivel} onClick={() => setFiltroKpi({ id: d.nivel === 'alto' ? 'alto' : d.nivel, label: `Riesgo ${d.name.toLowerCase()}` })}
                    className="w-full flex items-center justify-between text-xs px-2 py-1.5 rounded-lg hover:bg-slate-800/50">
                    <span className="flex items-center gap-2 text-slate-300">
                      <span className="w-2 h-2 rounded-full" style={{ background: d.color }} /> {d.name}
                    </span>
                    <span className="font-mono text-slate-400">{d.value} ({reportes.length ? Math.round((d.value / reportes.length) * 100) : 0}%)</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

function TarjetaKpi({ icon: Icon, color, label, valor, nota, activa, onClick }) {
  const colores = { blue: 'text-blue-400', red: 'text-red-400', amber: 'text-amber-400', purple: 'text-purple-400' };
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left bg-slate-900/80 border rounded-2xl p-6 shadow-lg transition-colors ${activa ? 'border-emerald-600 ring-1 ring-emerald-600/40' : 'border-slate-800/80 hover:border-slate-700'
        }`}
    >
      <div className="flex justify-between items-start">
        <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{label}</span>
        <Icon className={`w-5 h-5 ${colores[color]}`} />
      </div>
      <div className={`text-3xl font-extrabold mt-3 font-mono ${color === 'blue' ? 'text-white' : colores[color]}`}>{valor}</div>
      <p className="text-xs text-slate-500 mt-2">{nota}</p>
    </button>
  );
}
