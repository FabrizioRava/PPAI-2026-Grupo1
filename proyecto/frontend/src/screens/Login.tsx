import React, { useState } from 'react';
import { login, UsuarioDTO } from '../api';

const glassPanel =
  'bg-white/55 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_rgba(68,51,79,0.12)] ring-1 ring-brand-bgMain/5';

export interface LoginProps {
  // Se invoca al autenticar correctamente, con los datos del usuario logueado.
  onLoginExitoso: (usuario: UsuarioDTO) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginExitoso }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [verPassword, setVerPassword] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tomarInicioSesion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cargando) return;
    setError(null);
    setCargando(true);
    try {
      const { usuario } = await login(username.trim(), password);
      onLoginExitoso(usuario);
    } catch (err: any) {
      setError(err.message || 'No se pudo iniciar sesión.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="relative min-h-dvh flex flex-col items-center justify-center font-sans antialiased text-brand-bgMain selection:bg-brand-primary selection:text-white overflow-hidden p-4">

      {/* FONDO: gradiente base + blobs de color difuminados (consistente con el resto) */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-br from-[#fbe7df] via-[#f4eef3] to-[#efe7f0]" aria-hidden="true" />
      <div className="pointer-events-none fixed -top-32 -left-24 -z-10 w-[28rem] h-[28rem] rounded-full bg-brand-primary/25 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none fixed top-1/3 -right-28 -z-10 w-[30rem] h-[30rem] rounded-full bg-brand-secondary/20 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none fixed -bottom-40 left-1/3 -z-10 w-[26rem] h-[26rem] rounded-full bg-brand-bgMain/15 blur-3xl" aria-hidden="true" />

      <div className={`${glassPanel} w-full max-w-md rounded-3xl p-8 sm:p-10`}>
        {/* Marca */}
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-primary to-brand-secondary flex items-center justify-center shadow-lg shadow-brand-primary/30">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-brand-bgMain">Gestión de Bolsines</h1>
          <p className="text-xs text-brand-bgMain/60 font-mono mt-1">PPAI 2026 • INICIAR SESIÓN</p>
        </div>

        {/* Formulario */}
        <form onSubmit={tomarInicioSesion} className="mt-8 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="login-username" className="text-xs font-bold text-brand-bgMain uppercase tracking-wider">
              Usuario
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-bgMain/50">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <input
                id="login-username"
                type="text"
                autoComplete="username"
                placeholder="Ej: jperez"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full bg-white/70 border border-white/70 rounded-xl py-2.5 pl-10 pr-4 text-sm text-brand-bgMain placeholder-brand-bgMain/40 focus:outline-none focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/40 transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="login-password" className="text-xs font-bold text-brand-bgMain uppercase tracking-wider">
              Contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-bgMain/50">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                id="login-password"
                type={verPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-white/70 border border-white/70 rounded-xl py-2.5 pl-10 pr-10 text-sm text-brand-bgMain placeholder-brand-bgMain/40 focus:outline-none focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/40 transition-all"
              />
              <button
                type="button"
                onClick={() => setVerPassword((v) => !v)}
                aria-label={verPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-brand-bgMain/50 hover:text-brand-bgMain transition-colors focus:outline-none"
              >
                {verPassword ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029M9.88 9.88a3 3 0 104.24 4.24M9.88 9.88l4.24 4.24M9.88 9.88L4.46 4.46m4.42 5.42l5.66 5.66m0 0L19.54 19.54" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div role="alert" className="flex items-center gap-2 bg-rose-50/80 border border-rose-200/80 text-rose-800 rounded-xl px-3.5 py-2.5 text-xs font-bold">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M5.07 19h13.86a2 2 0 001.74-2.99l-6.93-12a2 2 0 00-3.48 0l-6.93 12A2 2 0 005.07 19z" />
              </svg>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="mt-2 w-full py-2.5 bg-brand-primary hover:bg-brand-primary/90 active:scale-[0.98] disabled:bg-brand-bgMain/30 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            {cargando ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full motion-safe:animate-spin"></span>
                Ingresando...
              </>
            ) : (
              'Ingresar'
            )}
          </button>
        </form>

        {/* Ayuda de credenciales moqueadas (quitar al conectar la DB) */}
        <div className="mt-6 bg-white/40 border border-white/60 rounded-xl p-3.5 text-xs text-brand-bgMain/70 leading-relaxed">
          <p className="font-bold text-brand-bgMain/80 mb-1">Credenciales de prueba</p>
          <p>Contraseña <strong>1234</strong> para todos. Usuarios: <span className="font-mono">jperez</span> (Villa María), <span className="font-mono">agomez</span> (Córdoba), <span className="font-mono">cruiz</span> (Río Cuarto).</p>
        </div>
      </div>

      <footer className="mt-6 text-xs text-brand-bgMain/45">
        PPAI 2026 · Grupo 1 · CU36 Seguimiento de Bolsines
      </footer>
    </div>
  );
};
