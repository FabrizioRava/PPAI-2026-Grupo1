import React, { useState, useEffect } from 'react';
import { Login } from './screens/Login';
import { MenuPrincipal } from './screens/MenuPrincipal';
import { PantSegBolsines } from './screens/PantSegBolsines';
import { sesion, UsuarioDTO } from './api';

// Cambiado a export nombrado para resolver el SyntaxError en main.tsx
export function App() {
  const [usuario, setUsuario] = useState<UsuarioDTO | null>(null);
  const [pantallaActual, setPantallaActual] = useState<'login' | 'menu' | 'seguimiento'>('login');
  const [inicializando, setInicializando] = useState<boolean>(true);

  // Al arrancar la App, rehidratamos la sesión del localStorage
  useEffect(() => {
    const usuarioGuardado = sesion.getUsuario();
    const tokenGuardado = sesion.getToken();

    if (usuarioGuardado && tokenGuardado) {
      setUsuario(usuarioGuardado);
      setPantallaActual('menu');
    } else {
      sesion.limpiar();
      setPantallaActual('login');
    }
    setInicializando(false);
  }, []);

  const manejarLoginExitoso = (usuarioLogueado: UsuarioDTO) => {
    setUsuario(usuarioLogueado);
    setPantallaActual('menu');
  };

  const manejarCerrarSesion = () => {
    sesion.limpiar();
    setUsuario(null);
    setPantallaActual('login');
  };

  // Evita parpadeos y llamadas asíncronas inválidas mientras lee el localStorage
  if (inicializando) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-gradient-to-br from-[#fbe7df] via-[#f4eef3] to-[#efe7f0]">
            <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Enrutador básico de pantallas según el estado de la sesión
  switch (pantallaActual) {
    case 'login':
      return <Login onLoginExitoso={manejarLoginExitoso} />;

    case 'menu':
      return usuario ? (
        <MenuPrincipal
          usuario={usuario}
          onConsultarUbicacionBolsines={() => setPantallaActual('seguimiento')}
          onCerrarSesion={manejarCerrarSesion}
        />
      ) : (
        <Login onLoginExitoso={manejarLoginExitoso} />
      );

    case 'seguimiento':
      return usuario ? (
        <PantSegBolsines
          usuario={usuario}
          onVolver={() => setPantallaActual('menu')}
        />
      ) : (
        <Login onLoginExitoso={manejarLoginExitoso} />
      );

    default:
      return <Login onLoginExitoso={manejarLoginExitoso} />;
  }
}