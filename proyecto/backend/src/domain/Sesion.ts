import { Usuario } from './Usuario';

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

  static buscarUsuarioLogueado(): Usuario | null {
    if (Sesion.activeSession && Sesion.activeSession.activa) {
      return Sesion.activeSession.usuario;
    }
    return null;
  }
}

