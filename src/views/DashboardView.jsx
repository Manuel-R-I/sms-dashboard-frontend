import { useEffect, useMemo, useState } from 'react';
import { FileText, ShieldAlert, AlertTriangle, ExternalLink, Database, RefreshCw } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useAuth } from '../context/useAuth.js';
import { obtenerReportes } from '../lib/api';

const COLOR_CATEGORIA = { banca: '#ef4444', encomiendas: '#f59e0b', gobierno: '#3b82f6', retail: '#a855f7', telecomunicaciones: '#06b6d4', peajes: '#84cc16', otros: '#94a3b8', sin_clasificar: '#64748b' };
const ETIQUETA_CATEGORIA = { banca: 'Banca', encomiendas: 'Encomiendas', gobierno: 'Gobierno', retail: 'Retail', telecomunicaciones: 'Telecomunicaciones', peajes: 'Peajes', otros: 'Otros', sin_clasificar: 'Sin clasificar' };

export default function DashboardView() {
  const { token } = useAuth();
  const [reportes, setReportes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    obtenerReportes(token).then(setReportes).catch(() => setError('No se pudieron cargar los reportes')).finally(() => setCargando(false));
  }, [token]);

  const kpis = useMemo(() => ({
    total: reportes.length,
    altoRiesgo: reportes.filter((r) => r.nivel_riesgo === 'alto').length,
    pendientes: reportes.filter((r) => r.estado === 'pendiente').length,
    conMaliciosos: reportes.filter((r) => (r.analisis?.virustotal_maliciosos ?? 0) > 0).length
  }), [reportes]);

  const datosCategorias = useMemo(() => {
    const conteo = {};
    reportes.forEach((r) => { const cat = r.categoria || 'sin_clasificar'; conteo[cat] = (conteo[cat] || 0) + 1; });
    return Object.entries(conteo)
      .map(([categoria, count]) => ({ categoria, name: ETIQUETA_CATEGORIA[categoria] || categoria, value: count, color: COLOR_CATEGORIA[categoria] || '#64748b' }))
      .sort((a, b) => b.value - a.value);
  }, [reportes]);

  if (cargando) return <div className="p-8 text-slate-400 text-sm">Cargando datos del backend...</div>;

  return (
    <div className="w-full">
      <header className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800 gap-4 w-full mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Dashboard</h1>
          <p className="text-slate-400 text-xs md:text-sm mt-0.5">Panel Interno de Monitoreo de Smishing [Chile]</p>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-400 bg-slate-900/90 p-3 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2"><Database className="w-4 h-4 text-emerald-400" /><span>API: <strong className="text-emerald-400 font-mono">{error ? 'Error' : 'Conectado'}</strong></span></div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-2"><RefreshCw className="w-4 h-4 text-blue-400" /><span>Datos en vivo</span></div>
        </div>
      </header>

      {error && <p className="text-xs text-red-400 mb-4">{error}</p>}

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 w-full">
        <TarjetaKpi icon={FileText} color="blue" label="Total Reportes" valor={kpis.total} nota="Reportes formales en la base" />
        <TarjetaKpi icon={ShieldAlert} color="red" label="Alto Riesgo" valor={kpis.altoRiesgo} nota={`${kpis.total ? Math.round((kpis.altoRiesgo / kpis.total) * 100) : 0}% del total`} />
        <TarjetaKpi icon={AlertTriangle} color="amber" label="Pendientes de Revisar" valor={kpis.pendientes} nota="Estado: pendiente" />
        <TarjetaKpi icon={ExternalLink} color="purple" label="Con URL Maliciosa" valor={kpis.conMaliciosos} nota="Detectado via VirusTotal" />
      </section>

      <section className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 shadow-lg">
        <h2 className="text-base font-bold text-white mb-1">Categorias de Posible Smishing</h2>
        <p className="text-xs text-slate-400 mb-4">Distribucion de los reportes recibidos por categoria.</p>
        {datosCategorias.length === 0 ? <p className="text-sm text-slate-500">Aun no hay reportes para graficar.</p> : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={datosCategorias} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={2}>
                  {datosCategorias.map((d) => <Cell key={d.categoria} fill={d.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>
    </div>
  );
}

function TarjetaKpi({ icon: Icon, color, label, valor, nota }) {
  const colores = { blue: 'text-blue-400', red: 'text-red-400', amber: 'text-amber-400', purple: 'text-purple-400' };
  return (
    <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 shadow-lg">
      <div className="flex justify-between items-start">
        <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{label}</span>
        <Icon className={`w-5 h-5 ${colores[color]}`} />
      </div>
      <div className={`text-3xl font-extrabold mt-3 font-mono ${color === 'blue' ? 'text-white' : colores[color]}`}>{valor}</div>
      <p className="text-xs text-slate-500 mt-2">{nota}</p>
    </div>
  );
}