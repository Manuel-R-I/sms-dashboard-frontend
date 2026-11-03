
import { useState, lazy, Suspense } from 'react';
import { AuthProvider } from './context/AuthContext.jsx';
import { useAuth } from './context/useAuth.js';
import Login from './components/Login';
import Sidebar from './components/Sidebar';

const DashboardView = lazy(() => import('./views/DashboardView'));
const ReportesView = lazy(() => import('./views/ReportesView'));
const UsuariosView = lazy(() => import('./views/UsuariosView'));

function Shell() {
  const { autenticado } = useAuth();
  const [vista, setVista] = useState('dashboard');

  if (!autenticado) return <Login />;

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col md:flex-row">
      <Sidebar vistaActiva={vista} onCambiarVista={setVista} />

      <main className="flex-1 p-6 md:p-8 overflow-x-hidden">
        <Suspense
          fallback={
            <p className="p-6 text-sm text-slate-400">
              Cargando vista...
            </p>
          }
        >
          {vista === 'dashboard' && <DashboardView />}
          {vista === 'reportes' && <ReportesView />}
          {vista === 'usuarios' && <UsuariosView />}
        </Suspense>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  );
}
