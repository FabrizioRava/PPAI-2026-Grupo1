import { Request } from 'express';
import { UsuarioRepository } from '../repositories/UsuarioRepository';

/**
 * Gestor de autenticación. Valida credenciales de los empleados de cada
 * Comisión Médica contra el repositorio de usuarios.
 * Los handlers HTTP (login/logout/me) viven en http/AuthController.ts.
 */
export class GestorLogin {
  constructor(private readonly usuarioRepository: UsuarioRepository) {}

  // Extrae el token "Bearer <token>" del header Authorization.
  static obtenerToken(req: Request): string | undefined {
    const header = req.headers.authorization;
    if (!header) return undefined;
    return header.startsWith('Bearer ') ? header.slice(7) : header;
  }

  // Busca el usuario que coincide con las credenciales (usuario + contraseña).
  autenticar(username: string, password: string) {
    return this.usuarioRepository.getAll().find((u) => u.sosVos(username, password)) ?? null;
  }
}
