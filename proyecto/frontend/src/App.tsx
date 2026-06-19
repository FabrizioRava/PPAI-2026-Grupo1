import React, { useState } from 'react';
import { MenuPrincipal } from './screens/MenuPrincipal';
import { PantSegBolsines } from './screens/PantSegBolsines';

type Vista = 'menu' | 'seguimiento';

export const App: React.FC = () => {
  const [vista, setVista] = useState<Vista>('menu');

  // Paso 1 del diagrama: opConsultarUbicBolsines() -> habilitarVentana()
  // Al seleccionar la opción del menú, se abre la pantalla de seguimiento,
  // que al montarse ejecuta el flujo del Gestor (buscar CM, bolsines, ubicaciones).
  const opConsultarUbicBolsines = () => setVista('seguimiento');

  if (vista === 'seguimiento') {
    return <PantSegBolsines onVolver={() => setVista('menu')} />;
  }

  return <MenuPrincipal onConsultarUbicacionBolsines={opConsultarUbicBolsines} />;
};
