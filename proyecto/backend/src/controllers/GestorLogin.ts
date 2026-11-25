import { Request } from 'express';
import { randomUUID } from 'crypto';
import { UsuarioRepository } from '../repositories/UsuarioRepository';
import { Usuario } from '../domain/Usuario';
import { Sesion } from '../domain/Sesion';

/**
 * Gestor de autenticación. Valida credenciales de los empleados de cada
 * Comisión Médica contra el repositorio de usuarios.
 * Los handlers HTTP (login/logout/me) viven en http/AuthController.ts.
 */
export class GestorLogin {
  // Sesiones activas indexadas por token (el token es un detalle de la API HTTP, no de la entidad Sesion).
  private static sesiones: Map<string, Sesion> = new Map();

  constructor(private readonly usuarioRepository: UsuarioRepository) {}

  // Extrae el token "Bearer <token>" del header Authorization.
  static obtenerToken(req: Request): string | undefined {
    const header = req.headers.authorization;
    if (!header) return undefined;
    return header.startsWith('Bearer ') ? header.slice(7) : header;
  }

  // Busca el usuario que coincide con las credenciales (usuario + contraseña).
  async autenticar(username: string, password: string) {
    return (await this.usuarioRepository.getAll()).find((u) => u.sosVos(username, password)) ?? null;
  }

  // Crea la Sesion del usuario autenticado y devuelve el token que la identifica.
  static iniciarSesion(usuario: Usuario): string {
    const token = randomUUID();
    GestorLogin.sesiones.set(token, new Sesion(usuario));
    return token;
  }

  static cerrarSesion(token: string | undefined): boolean {
    if (!token) return false;
    const sesion = GestorLogin.sesiones.get(token);
    if (!sesion) return false;

    sesion.setFechaHoraFin(new Date());
    GestorLogin.sesiones.delete(token);
    return true;
  }

  static buscarPorToken(token: string | undefined): Sesion | null {
    if (!token) return null;
    const sesion = GestorLogin.sesiones.get(token);
    return sesion && sesion.estaActiva() ? sesion : null;
  }
}
