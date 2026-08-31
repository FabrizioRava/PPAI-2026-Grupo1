import { Usuario } from './Usuario';
import { ComisionMedica } from './ComisionMedica';

export class Sesion {
  private id: number;
  private usuario: Usuario;
  private fechaHoraInicio: Date;
  private fechaHoraFin: Date | null;
  private cmUsuarioLogueado: string;
  private token: string;

  private static sesiones: Map<string, Sesion> = new Map();
  private static contadorId = 0;

  constructor(usuario: Usuario, token: string) {
    this.id = ++Sesion.contadorId;
    this.usuario = usuario;
    this.fechaHoraInicio = new Date();
    this.fechaHoraFin = null;
    
    const empleado = usuario.obtenerEmpleado();
    this.cmUsuarioLogueado = empleado.obtenerCM().getNombreCM();
    this.token = token;
  }

  // --- Getters / Setters ---
  getId(): number {
    return this.id;
  }

  setId(id: number): void {
    this.id = id;
  }

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

  /** @deprecated Usa cerrarSesion() o setFechaHoraFin() */
  setActiva(activa: boolean): void {
    this.fechaHoraFin = activa ? null : (this.fechaHoraFin ?? new Date());
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

  getToken(): string {
    return this.token;
  }

  setToken(token: string): void {
    this.token = token;
  }

  // --- Comportamiento ---
  static iniciarSesion(usuario: Usuario): Sesion {
    const token = `sesion-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    const sesion = new Sesion(usuario, token);
    Sesion.sesiones.set(token, sesion);
    return sesion;
  }

  static cerrarSesion(token: string | undefined): boolean {
    if (!token) return false;
    const sesion = Sesion.sesiones.get(token);
    if (!sesion) return false;
    
    sesion.fechaHoraFin = new Date();
    Sesion.sesiones.delete(token);
    return true;
  }

  static buscarPorToken(token: string | undefined): Sesion | null {
    if (!token) return null;
    const sesion = Sesion.sesiones.get(token);
    return sesion && sesion.estaActiva() ? sesion : null;
  }

  buscarCMUsuarioLogueado(): ComisionMedica {
    const empleado = this.usuario.obtenerEmpleado();
    return empleado.obtenerCM();
  }
}