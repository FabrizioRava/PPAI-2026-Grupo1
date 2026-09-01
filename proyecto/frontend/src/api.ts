// Capa de acceso a la API + manejo de la sesión (token) en el cliente.
// Centralizado para que migrar a otra URL/DB sea un único punto de cambio.

export const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:3000';

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

// --- Consultas de Gestión de Bolsines (Protegidas) ---

/**
 * Recupera el usuario logueado desde el backend usando el token activo.
 */
export async function obtenerMiUsuario(): Promise<{ usuario: UsuarioDTO }> {
  const response = await fetch(`${API_BASE}/api/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'Sesión inválida o expirada.');
  }
  return data;
}

/**
 * Envuelve un fetch a un endpoint protegido: agrega el token, y si el backend responde 401
 * (sesión inválida o expirada) limpia la sesión local y recarga la app para volver al login,
 * en vez de propagar el error. Cualquier otro error sí se propaga para que la pantalla lo muestre.
 */
async function fetchProtegido(path: string, opciones: RequestInit = {}, mensajeErrorDefault: string): Promise<any> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...opciones,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...opciones.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401) {
      sesion.limpiar();
      window.location.reload();
      return null;
    }
    throw new Error(data.error || mensajeErrorDefault);
  }
  return data;
}

/**
 * Obtiene los bolsines en estado 'Enviado' correspondientes a la CM del usuario.
 */
export async function obtenerBolsinesActivos(): Promise<{ nombreCM: string; bolsines: any[] }> {
  const data = await fetchProtegido(
    '/api/bolsines/activos',
    { method: 'GET' },
    'No se pudieron recuperar los bolsines activos.'
  );
  return data ?? { nombreCM: '', bolsines: [] };
}

/**
 * Informa al backend cuál es el bolsín seleccionado por el Encargado de Bolsín.
 */
export async function seleccionarBolsin(numeroPrecinto: number): Promise<any> {
  return fetchProtegido(
    '/api/bolsines/seleccionar',
    { method: 'POST', body: JSON.stringify({ numeroPrecinto }) },
    'No se pudo registrar la selección del bolsín.'
  );
}

/**
 * Envía la configuración al gestor para registrar un nuevo reporte de ubicación y despachar el mail al Gerente.
 */
export async function notificarUbicacionBolsin(numeroPrecinto: number): Promise<any> {
  return fetchProtegido(
    '/api/bolsines/notificar',
    { method: 'POST', body: JSON.stringify({ numeroPrecinto }) },
    'No se pudo enviar la notificación de ubicación.'
  );
}
