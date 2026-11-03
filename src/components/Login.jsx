
import { useState } from 'react';
import { ShieldAlert, Loader2 } from 'lucide-react';
import { solicitarOtp, verificarOtp } from '../lib/api';
import { useAuth } from '../context/useAuth.js';

export default function Login() {
  const { iniciarSesion } = useAuth();

  const [paso, setPaso] = useState('telefono');
  const [telefono, setTelefono] = useState('');
  const [codigo, setCodigo] = useState('');
  const [codigoSimulado, setCodigoSimulado] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const pedirCodigo = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      const respuesta = await solicitarOtp(telefono);

      setCodigoSimulado(respuesta.codigo);
      setPaso('codigo');
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo enviar el codigo');
    } finally {
      setCargando(false);
    }
  };

  const confirmar = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      const { token, usuario } = await verificarOtp(telefono, codigo);

      if (usuario.rol !== 'admin') {
        setError('Esta cuenta no tiene permisos de administrador.');
        return;
      }

      iniciarSesion(token, usuario);
    } catch (err) {
      setError(err.response?.data?.error || 'Codigo invalido');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-slate-900/80 border border-slate-800/80 rounded-2xl p-8 shadow-lg">

        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-emerald-950 border border-emerald-800/80 rounded-xl">
            <ShieldAlert className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">SMS Security</h1>
            <p className="text-xs text-slate-400">Acceso administrador</p>
          </div>
        </div>

        {paso === 'telefono' ? (
          <form onSubmit={pedirCodigo} className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                Telefono
              </label>
              <input
                type="tel"
                required
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="+56912345678"
                className="mt-1.5 w-full bg-slate-950 text-slate-200 border border-slate-800 text-sm px-3 py-2.5 rounded-xl focus:outline-none focus:border-emerald-500"
              />
            </div>

            {error && <p className="text-xs text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={cargando}
              className="w-full bg-emerald-950 hover:bg-emerald-800 text-emerald-300 border border-emerald-700/80 px-4 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {cargando && <Loader2 className="w-4 h-4 animate-spin" />}
              Enviar codigo
            </button>
          </form>
        ) : (
          <form onSubmit={confirmar} className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                Codigo
              </label>

              {codigoSimulado && (
                <p className="mt-2 text-xs text-emerald-400">
                  Código de prueba (simulado):{' '}
                  <span className="font-mono font-bold tracking-widest">
                    {codigoSimulado}
                  </span>
                </p>
              )}

              <input
                type="text"
                required
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                placeholder="123456"
                className="mt-1.5 w-full bg-slate-950 text-slate-200 border border-slate-800 text-sm px-3 py-2.5 rounded-xl focus:outline-none focus:border-emerald-500 font-mono tracking-widest"
              />
            </div>

            {error && <p className="text-xs text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={cargando}
              className="w-full bg-emerald-950 hover:bg-emerald-800 text-emerald-300 border border-emerald-700/80 px-4 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {cargando && <Loader2 className="w-4 h-4 animate-spin" />}
              Verificar
            </button>

            <button
              type="button"
              onClick={() => {
                setPaso('telefono');
                setCodigo('');
                setCodigoSimulado('');
                setError('');
              }}
              className="w-full text-slate-400 text-xs hover:text-slate-200"
            >
              Cambiar numero
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
