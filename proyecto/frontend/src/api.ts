// Capa de acceso a la API + manejo de la sesión (token) en el cliente.
// Centralizado para que migrar a otra URL/DB sea un único punto de cambio.

export const API_BASE = 'http://localhost:3000';

export interface UsuarioDTO {
  id: number;
  username: string;
  nombre: string;
  apellido: string;
  correo: string;
  rol: string;
  comisionMedica: { id: number; nombre: string; codigo: string };
}

const TOKEN_KEY = 'ppai.token';
const USER_KEY = 'ppai.usuario';

// --- Almacenamiento local de la sesión ---
export const sesion = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },
  getUsuario(): UsuarioDTO | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as UsuarioDTO;
    } catch {
      return null;
    }
  },
  guardar(token: string, usuario: UsuarioDTO) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(usuario));
  },
  limpiar() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

// Header de autorización para las requests protegidas.
export function authHeaders(): Record<string, string> {
  const token = sesion.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// --- Llamadas a la API ---
export async function login(username: string, password: string): Promise<{ token: string; usuario: UsuarioDTO }> {
  const response = await fetch(`${API_BASE}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'No se pudo iniciar sesión.');
  }

  sesion.guardar(data.token, data.usuario);
  return data;
}

export async function logout(): Promise<void> {
  try {
    await fetch(`${API_BASE}/api/logout`, {
      method: 'POST',
      headers: { ...authHeaders() },
    });
  } catch {
    // Aunque falle el server, limpiamos la sesión local igualmente.
  } finally {
    sesion.limpiar();
  }
}
