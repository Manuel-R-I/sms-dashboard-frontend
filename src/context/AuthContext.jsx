
import { useState, useCallback, useMemo } from 'react';
import { AuthContext } from './AuthContext.js';

const TOKEN_KEY = 'sms_admin_token';
const USER_KEY = 'sms_admin_usuario';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() =>
    localStorage.getItem(TOKEN_KEY)
  );

  const [usuario, setUsuario] = useState(() => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  });

  const iniciarSesion = useCallback((t, u) => {
    localStorage.setItem(TOKEN_KEY, t);
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    setToken(t);
    setUsuario(u);
  }, []);

  const cerrarSesion = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUsuario(null);
  }, []);

  const value = useMemo(() => ({
    token,
    usuario,
    autenticado: Boolean(token),
    iniciarSesion,
    cerrarSesion
  }), [token, usuario, iniciarSesion, cerrarSesion]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
