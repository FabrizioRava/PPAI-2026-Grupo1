import { EstadoBolsin } from './EstadoBolsin';

export class CambioDeEstadoBolsin {
  private id: number;
  private estadoBolsin: EstadoBolsin;
  private fechaHoraInicio: Date;
  private fechaHoraFin: Date | null;

  constructor(
    id: number,
    estadoBolsin: EstadoBolsin,
    fechaHoraInicio: Date,
    fechaHoraFin: Date | null = null
  ) {
    this.id = id;
    this.estadoBolsin = estadoBolsin;
    this.fechaHoraInicio = fechaHoraInicio;
    this.fechaHoraFin = fechaHoraFin;
  }

  // --- Getters / Setters ---
  getId(): number {
    return this.id;
  }

  setId(id: number): void {
    this.id = id;
  }

  getEstadoBolsin(): EstadoBolsin {
    return this.estadoBolsin;
  }

  setEstadoBolsin(estadoBolsin: EstadoBolsin): void {
    this.estadoBolsin = estadoBolsin;
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
  sosActual(): boolean {
    return this.fechaHoraInicio !== null && this.fechaHoraFin === null;
  }

  // Diagrama (paso 3): estAB -> estB: sosEnviado()
  sosEnviado(): boolean {
    return this.estadoBolsin.sosEnviado();
  }
}