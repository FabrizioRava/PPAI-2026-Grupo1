import { Usuario } from './Usuario';

export class Sesion {
  private usuario: Usuario;
  private fechaHoraInicio: Date;
  private fechaHoraFin: Date | null;

  constructor(usuario: Usuario) {
    this.usuario = usuario;
    this.fechaHoraInicio = new Date();
    this.fechaHoraFin = null;
  }

  // --- Getters / Setters ---
  getUsuario(): Usuario {
    return this.usuario;
  }

  setUsuario(usuario: Usuario): void {
    this.usuario = usuario;
  }

  // Estado calculado a partir de fechaHoraFin (evita romper código externo)
  estaActiva(): boolean {
    return this.fechaHoraFin === null;
  }

  getFechaHoraInicio(): Date {
    return this.fechaHoraInicio;
  }

  setFechaHoraInicio(fechaHoraInicio: Date): void {
    this.fechaHoraInicio = fechaHoraInicio;
  }

  getFechaHoraFin(): Date | null {
    return this.fechaHoraFin;
  }

  setFechaHoraFin(fechaHoraFin: Date | null): void {
    this.fechaHoraFin = fechaHoraFin;
  }

  // --- Comportamiento ---
  // Diagrama: S -> U: obtenerEmpleado(); U -> E: obtenerCM(). Retorna [nombreCM, codigoCM]
  buscarCMUsuarioLogueado(): string[] {
    const empleado = this.usuario.obtenerEmpleado();
    return empleado.obtenerCM();
  }
}
