import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PantSegBolsines } from './PantSegBolsines';
import * as api from '../api';

vi.mock('../api', async () => {
  const actual = await vi.importActual<typeof api>('../api');
  return { ...actual, obtenerBolsinesActivos: vi.fn(), seleccionarBolsin: vi.fn() };
});

const usuarioMock: api.UsuarioDTO = {
  id: 1,
  username: 'jperez',
  nombre: 'Juan',
  apellido: 'Pérez',
  correo: 'jperez@srt.gob.ar',
  rol: 'Administrativo',
  comisionMedica: { id: 1, nombre: 'Villa María', codigo: 'CM-VM' },
};

describe('PantSegBolsines', () => {
  it('renderiza los bolsines devueltos por obtenerBolsinesActivos', async () => {
    vi.mocked(api.obtenerBolsinesActivos).mockResolvedValue({
      nombreCM: 'Villa María',
      bolsines: [
        {
          numeroPrecinto: 4501,
          latitud: -32.1632,
          longitud: -63.4721,
          estado: 'Enviado',
          fechaHoraActualizacion: new Date().toISOString(),
          cmDestinoNombre: 'Córdoba',
          cmDestinoCodigo: 'CM-CBA',
        },
      ],
    });

    render(<PantSegBolsines usuario={usuarioMock} />);

    expect(await screen.findByText('BOL-4501')).toBeInTheDocument();
  });

  it('muestra el mensaje de "sin bolsines" cuando la lista viene vacía', async () => {
    vi.mocked(api.obtenerBolsinesActivos).mockResolvedValue({ nombreCM: 'Villa María', bolsines: [] });

    render(<PantSegBolsines usuario={usuarioMock} />);

    expect(await screen.findByText(/sin bolsines en tránsito/i)).toBeInTheDocument();
  });
});
