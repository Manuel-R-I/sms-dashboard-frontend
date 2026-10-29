import React, { useState } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  FileText, 
  ExternalLink, 
  CheckCircle, 
  XCircle, 
  BarChart2, 
  Database,
  RefreshCw,
  Search
} from 'lucide-react';

const initialKpis = {
  totalAnalyzed: 1245,
  highRiskCount: 312,
  pendingReports: 18,
  suspiciousDomains: 84
};

const mockCategories = [
  { name: 'Banca / Entidades Financieras (Banco Estado, etc.)', percentage: 45, count: 140, color: 'bg-red-500' },
  { name: 'Courier / Entrega de Paquetes (DHL, Chilexpress)', percentage: 30, count: 93, color: 'bg-amber-500' },
  { name: 'Servicios Públicos y Multas / Cobros', percentage: 15, count: 47, color: 'bg-blue-500' },
  { name: 'Redes Sociales y Plataformas Web', percentage: 10, count: 32, color: 'bg-slate-400' }
];

const mockReports = [
  {
    id: 'REP-1024',
    sender: '+56 9 8765 4321',
    message: 'Tu pago de $35.200 fue procesado correctamente. Verifique en https://banco-estado-alerta.cl',
    originalScore: '9/10 ALTO RIESGO',
    userReportType: 'No era estafa',
    userComment: 'Es mi comprobante real de transferencia bancaria.',
    date: '2026-10-01 14:22',
    status: 'PENDIENTE'
  },
  {
    id: 'REP-1025',
    sender: 'Número desconocido',
    message: 'DHL Chile: Tu envio DHL78324 esta retenido. Actualiza tus datos para entregar.',
    originalScore: '5/10 SOSPECHOSO',
    userReportType: 'Faltó detectar estafa',
    userComment: 'Me cobraron dinero en ese enlace, es un fraude directo.',
    date: '2026-10-01 16:05',
    status: 'PENDIENTE'
  },
  {
    id: 'REP-1026',
    sender: '+56 9 1234 5678',
    message: 'Cencosud: Tu boleta #13394 está disponible. Ve tu monto mensual.',
    originalScore: '2/10 SEGURO',
    userReportType: 'No era estafa',
    userComment: 'Es el aviso oficial mensual.',
    date: '2026-10-01 18:40',
    status: 'PENDIENTE'
  }
];

export default function App() {
  const [reports, setReports] = useState(mockReports);
  const [searchTerm, setSearchTerm] = useState('');

  const handleResolveReport = (id, newStatus) => {
    setReports(reports.map(rep => rep.id === id ? { ...rep, status: newStatus } : rep));
  };

  const filteredReports = reports.filter(r => 
    r.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 font-sans p-6 md:p-8">
      {/* Header del Dashboard */}
      <header className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800 gap-4 w-full">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-950 border border-emerald-800/80 rounded-xl">
            <ShieldAlert className="w-8 h-8 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-white">SMS Security</h1>
              <span className="bg-emerald-950 text-emerald-400 text-xs px-2.5 py-0.5 rounded-full border border-emerald-800/80 font-semibold">
                Dashboard
              </span>
            </div>
            <p className="text-slate-400 text-xs md:text-sm mt-0.5">
              Panel Interno de Monitoreo de Smishing y Verificación de Reportes [Chile]
            </p>
          </div>
        </div>

        {/* Status BD */}
        <div className="flex items-center gap-4 text-xs text-slate-400 bg-slate-900/90 p-3 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" />
            <span>MongoDB: <strong className="text-emerald-400 font-mono">sms_db (Conectado)</strong></span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />
            <span>Sincronización API</span>
          </div>
        </div>
      </header>

      {/* KPI Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 my-8 w-full">
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 shadow-lg">
          <div className="flex justify-between items-start">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total SMS Analizados</span>
            <FileText className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-3xl font-extrabold text-white mt-3 font-mono">{initialKpis.totalAnalyzed}</div>
          <p className="text-xs text-slate-500 mt-2">Muestra procesada por el backend</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 shadow-lg">
          <div className="flex justify-between items-start">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Alto Riesgo (Smishing)</span>
            <ShieldAlert className="w-5 h-5 text-red-400" />
          </div>
          <div className="text-3xl font-extrabold text-red-400 mt-3 font-mono">{initialKpis.highRiskCount}</div>
          <p className="text-xs text-red-400/80 mt-2">25% del total detectado</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 shadow-lg">
          <div className="flex justify-between items-start">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Reportes Pendientes</span>
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-amber-400 mt-3 font-mono">{initialKpis.pendingReports}</div>
          <p className="text-xs text-amber-300/80 mt-2">Peticiones enviadas desde la App Móvil</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 shadow-lg">
          <div className="flex justify-between items-start">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Dominios Sospechosos</span>
            <ExternalLink className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-3xl font-extrabold text-purple-400 mt-3 font-mono">{initialKpis.suspiciousDomains}</div>
          <p className="text-xs text-slate-500 mt-2">Analizados vía VirusTotal & RDAP</p>
        </div>
      </section>

      {/* Grid Central de Pantalla Ancha */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 w-full">
        {/* Categorías Frecuentes (1 columna de 4) */}
        <section className="lg:col-span-1 bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <BarChart2 className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-bold text-white">Categorías de Smishing</h2>
            </div>
            <p className="text-xs text-slate-400 mb-6">
              Patrones de estafa registrados en el dataset chileno y motor heurístico.
            </p>

            <div className="space-y-5">
              {mockCategories.map((cat, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-medium truncate max-w-[200px]">{cat.name}</span>
                    <span className="text-slate-400 font-mono">{cat.percentage}% ({cat.count})</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div className={`${cat.color} h-full rounded-full transition-all duration-500`} style={{ width: `${cat.percentage}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-800/80 text-[11px] text-slate-500 text-center">
            Dataset de Patrones Chilenos + Scoring Heurístico
          </div>
        </section>

        {/* Tabla de Reportes (3 columnas de 4) */}
        <section className="lg:col-span-3 bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-bold text-white">Reportes Enviados por Usuarios</h2>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input 
                type="text" 
                placeholder="Buscar por remitente o mensaje..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-950 text-slate-200 border border-slate-800 text-xs pl-9 pr-4 py-2 rounded-xl focus:outline-none focus:border-emerald-500 w-full sm:w-80"
              />
            </div>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-4">ID / Fecha</th>
                  <th className="p-4">SMS Detectado</th>
                  <th className="p-4">Score App</th>
                  <th className="p-4">Reporte Usuario</th>
                  <th className="p-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredReports.map((rep) => (
                  <tr key={rep.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 whitespace-nowrap">
                      <div className="font-mono font-bold text-slate-200">{rep.id}</div>
                      <div className="text-slate-500 text-[10px]">{rep.date}</div>
                    </td>
                    <td className="p-4 max-w-md">
                      <p className="font-semibold text-slate-200">{rep.sender}</p>
                      <p className="text-slate-400">{rep.message}</p>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded font-mono font-bold bg-red-950 text-red-400 border border-red-800/60 text-[10px]">
                        {rep.originalScore}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-amber-400">{rep.userReportType}</span>
                      <p className="text-slate-400 text-[11px] italic mt-0.5">"{rep.userComment}"</p>
                    </td>
                    <td className="p-4 text-right whitespace-nowrap">
                      {rep.status === 'PENDIENTE' ? (
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleResolveReport(rep.id, 'APROBADO')}
                            className="bg-emerald-950 hover:bg-emerald-800 text-emerald-300 border border-emerald-700/80 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 font-medium cursor-pointer"
                          >
                            <CheckCircle className="w-4 h-4" /> Aprobar
                          </button>
                          <button 
                            onClick={() => handleResolveReport(rep.id, 'DESCARTADO')}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 font-medium cursor-pointer"
                          >
                            <XCircle className="w-4 h-4" /> Descartar
                          </button>
                        </div>
                      ) : (
                        <span className={`text-[10px] font-bold px-3 py-1 rounded-xl ${
                          rep.status === 'APROBADO' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {rep.status}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}