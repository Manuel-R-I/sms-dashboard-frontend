import { LayoutDashboard, FileWarning, Users, ShieldAlert, LogOut } from 'lucide-react';
import { useAuth } from '../context/useAuth.js';

const ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'reportes', label: 'Reportes', icon: FileWarning },
  { id: 'usuarios', label: 'Usuarios', icon: Users }
];

export default function Sidebar({ vistaActiva, onCambiarVista }) {
  const { usuario, cerrarSesion } = useAuth();
  return (
    <aside className="w-full md:w-64 md:min-h-screen bg-slate-900/80 border-b md:border-b-0 md:border-r border-slate-800/80 p-4 md:p-6 flex md:flex-col gap-2 md:gap-1">
      <div className="hidden md:flex items-center gap-3 mb-8">
        <div className="p-2.5 bg-emerald-950 border border-emerald-800/80 rounded-xl">
          <ShieldAlert className="w-6 h-6 text-emerald-400" />
        </div>
        <div>
          <h1 className="text-base font-bold text-white leading-tight">SMS Security</h1>
          <p className="text-[11px] text-slate-400">Panel admin</p>
        </div>
      </div>

      <nav className="flex md:flex-col gap-1 flex-1">
        {ITEMS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => onCambiarVista(id)}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              vistaActiva === id
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/80'
                : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 border border-transparent'
            }`}>
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </nav>

      <div className="md:pt-4 md:mt-4 md:border-t border-slate-800/80 flex items-center gap-2">
        <div className="hidden md:block flex-1 min-w-0">
          <p className="text-xs text-slate-300 truncate">{usuario?.telefono}</p>
          <p className="text-[10px] text-slate-500">Administrador</p>
        </div>
        <button onClick={cerrarSesion}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-400 px-2 py-1.5 rounded-lg hover:bg-slate-800/60">
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Salir</span>
        </button>
      </div>
    </aside>
  );
}