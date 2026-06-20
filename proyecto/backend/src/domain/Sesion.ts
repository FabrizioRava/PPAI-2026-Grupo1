import { Usuario } from './Usuario';
import { ComisionMedica } from './ComisionMedica';

export class Sesion {
  id: number;
  usuario: Usuario;
  activa: boolean;
  fechaInicio: Date;
  token: string;

  // Repositorio en memoria de sesiones activas, indexado por token.
  // Al migrar a DB se reemplaza por una tabla de sesiones / store de tokens.
  private static sesiones: Map<string, Sesion> = new Map();
  private static contadorId = 0;

  constructor(usuario: Usuario, token: string) {
    this.id = ++Sesion.contadorId;
    this.usuario = usuario;
    this.activa = true;
    this.fechaInicio = new Date();
    this.token = token;
  }

  // Crea y registra una nueva sesión activa para el usuario autenticado.
  static iniciarSesion(usuario: Usuario): Sesion {
    const token = `sesion-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    const sesion = new Sesion(usuario, token);
    Sesion.sesiones.set(token, sesion);
    return sesion;
  }

  // Cierra la sesión asociada al token (logout).
  static cerrarSesion(token: string | undefined): boolean {
    if (!token) return false;
    const sesion = Sesion.sesiones.get(token);
    if (!sesion) return false;
    sesion.activa = false;
    Sesion.sesiones.delete(token);
    return true;
  }

  // Recupera una sesión activa a partir de su token.
  static buscarPorToken(token: string | undefined): Sesion | null {
    if (!token) return null;
    const sesion = Sesion.sesiones.get(token);
    return sesion && sesion.activa ? sesion : null;
  }

  // Paso 2 del diagrama: G -> S: buscarCMUsuarioLogueado()
  // Cadena: S -> L:Usuario.obtenerEmpleado() -> L:Empleado.obtenerCodigoCM() (devuelve la CM)
  // Mensaje sin parámetros: la sesión ya conoce a su usuario logueado.
  buscarCMUsuarioLogueado(): ComisionMedica {
    const empleado = this.usuario.obtenerEmpleado();
    return empleado.obtenerCodigoCM();
  }
}
