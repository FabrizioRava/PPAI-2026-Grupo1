import React, { useState } from 'react';
import { MenuPrincipal } from './screens/MenuPrincipal';
import { PantSegBolsines } from './screens/PantSegBolsines';
import { Login } from './screens/Login';
import { sesion, logout, UsuarioDTO } from './api';

type Vista = 'menu' | 'seguimiento';

export const App: React.FC = () => {
  // Usuario logueado: se rehidrata desde localStorage al recargar la página.
  const [usuario, setUsuario] = useState<UsuarioDTO | null>(() => sesion.getUsuario());
  const [vista, setVista] = useState<Vista>('menu');

  // Paso 1 del diagrama: opConsultarUbicBolsines() -> habilitarVentana()
  const opConsultarUbicBolsines = () => setVista('seguimiento');

  const cerrarSesion = async () => {
    await logout();
    setUsuario(null);
    setVista('menu');
  };

  // Sin sesión activa: se muestra el login.
  if (!usuario) {
    return <Login onLoginExitoso={(u) => setUsuario(u)} />;
  }

  if (vista === 'seguimiento') {
    return <PantSegBolsines usuario={usuario} onVolver={() => setVista('menu')} />;
  }

  return (
    <MenuPrincipal
      usuario={usuario}
      onConsultarUbicacionBolsines={opConsultarUbicBolsines}
      onCerrarSesion={cerrarSesion}
    />
  );
};
