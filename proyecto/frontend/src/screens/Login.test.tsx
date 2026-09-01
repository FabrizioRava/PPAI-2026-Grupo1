import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Login } from './Login';
import * as api from '../api';

vi.mock('../api', async () => {
  const actual = await vi.importActual<typeof api>('../api');
  return { ...actual, login: vi.fn() };
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

describe('Login', () => {
  beforeEach(() => {
    vi.mocked(api.login).mockReset();
  });

  it('llama a login con las credenciales ingresadas y avisa el éxito', async () => {
    const user = userEvent.setup();
    vi.mocked(api.login).mockResolvedValue({ token: 'tok-123', usuario: usuarioMock });
    const onLoginExitoso = vi.fn();

    render(<Login onLoginExitoso={onLoginExitoso} />);

    await user.type(screen.getByLabelText(/usuario/i), 'jperez');
    await user.type(screen.getByLabelText('Contraseña'), '1234');
    await user.click(screen.getByRole('button', { name: /ingresar/i }));

    await waitFor(() => expect(onLoginExitoso).toHaveBeenCalledWith(usuarioMock));
    expect(api.login).toHaveBeenCalledWith('jperez', '1234');
  });

  it('muestra un mensaje de error cuando falla la autenticación', async () => {
    const user = userEvent.setup();
    vi.mocked(api.login).mockRejectedValue(new Error('Usuario o contraseña incorrectos.'));

    render(<Login onLoginExitoso={vi.fn()} />);

    await user.type(screen.getByLabelText(/usuario/i), 'jperez');
    await user.type(screen.getByLabelText('Contraseña'), 'mala-clave');
    await user.click(screen.getByRole('button', { name: /ingresar/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Usuario o contraseña incorrectos.');
  });
});
