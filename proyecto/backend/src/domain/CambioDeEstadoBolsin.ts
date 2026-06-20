import { EstadoBolsin } from './EstadoBolsin';

export class CambioDeEstadoBolsin {
  id: number;
  estadoBolsin: EstadoBolsin;
  fechaHoraInicio: Date;
  fechaHoraFin: Date | null;

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

  sosActual(): boolean {
    return this.fechaHoraInicio !== null && this.fechaHoraFin === null;
  }

  // Diagrama (paso 3): estAB -> estB: sosEnviado()
  sosEnviado(): boolean {
    return this.estadoBolsin.sosEnviado();
  }
}
