import { EstadoBolsin } from './EstadoBolsin';

export class CambioDeEstadoBolsin {
  private id: number;
  private estadoBolsin: EstadoBolsin;
  private fechaHora: Date;
  private fechaHoraFin: Date | null;

  constructor(
    id: number,
    estadoBolsin: EstadoBolsin,
    fechaHora: Date,
    fechaHoraFin: Date | null = null
  ) {
    this.id = id;
    this.estadoBolsin = estadoBolsin;
    this.fechaHora = fechaHora;
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

  getFechaHora(): Date {
    return this.fechaHora;
  }

  setFechaHora(fechaHora: Date): void {
    this.fechaHora = fechaHora;
  }

  getFechaHoraFin(): Date | null {
    return this.fechaHoraFin;
  }

  setFechaHoraFin(fechaHoraFin: Date | null): void {
    this.fechaHoraFin = fechaHoraFin;
  }

  // --- Comportamiento ---
  sosActual(): boolean {
    return this.fechaHoraFin === null;
  }

  // Diagrama (paso 3): estAB -> estB: sosEnviado()
  sosEnviado(): boolean {
    return this.estadoBolsin.sosEnviado();
  }
}
