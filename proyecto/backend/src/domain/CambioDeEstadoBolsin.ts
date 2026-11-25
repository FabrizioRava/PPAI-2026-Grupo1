import { EstadoBolsin } from './EstadoBolsin';
import { Empleado } from './Empleado';

export class CambioDeEstadoBolsin {
  private estado: EstadoBolsin;
  private fechaHoraInicio: Date;
  private fechaHoraFin: Date | null;
  private responsableCE: Empleado;

  constructor(estado: EstadoBolsin, fechaHoraInicio: Date, fechaHoraFin: Date | null, responsableCE: Empleado) {
    this.estado = estado;
    this.fechaHoraInicio = fechaHoraInicio;
    this.fechaHoraFin = fechaHoraFin;
    this.responsableCE = responsableCE;
  }

  // --- Getters / Setters ---
  getEstado(): EstadoBolsin {
    return this.estado;
  }

  setEstado(estado: EstadoBolsin): void {
    this.estado = estado;
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

  getResponsableCE(): Empleado {
    return this.responsableCE;
  }

  setResponsableCE(responsableCE: Empleado): void {
    this.responsableCE = responsableCE;
  }

  // --- Comportamiento ---
  sosActual(): boolean {
    return this.fechaHoraInicio !== null && this.fechaHoraFin === null;
  }

  // Diagrama (paso 3): estAB -> estB: sosEnviado()
  sosEnviado(): boolean {
    return this.estado.sosEnviado();
  }
}
