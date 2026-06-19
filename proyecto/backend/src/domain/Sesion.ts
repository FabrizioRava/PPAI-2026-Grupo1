import { Usuario } from './Usuario';
import { ComisionMedica } from './ComisionMedica';

export class Sesion {
  id: number;
  usuario: Usuario;
  activa: boolean;
  fechaInicio: Date;

  private static activeSession: Sesion | null = null;

  constructor(id: number, usuario: Usuario, activa: boolean, fechaInicio: Date) {
    this.id = id;
    this.usuario = usuario;
    this.activa = activa;
    this.fechaInicio = fechaInicio;
    if (activa) {
      Sesion.activeSession = this;
    }
  }

  // Paso 2 del diagrama: G -> S: buscarCMUsuarioLogueado()
  // Cadena: A:Sesion -> L:Usuario.obtenerEmpleado() -> L:Empleado.obtenerCodigoCM() (devuelve la CM)
  static buscarCMUsuarioLogueado(): ComisionMedica | null {
    if (Sesion.activeSession && Sesion.activeSession.activa) {
      const empleado = Sesion.activeSession.usuario.obtenerEmpleado();
      return empleado.obtenerCodigoCM();
    }
    return null;
  }
}

