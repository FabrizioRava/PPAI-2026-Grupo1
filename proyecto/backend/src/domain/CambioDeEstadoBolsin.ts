import { EstadoBolsin } from './EstadoBolsin';

export class CambioDeEstadoBolsin {
  id: number;
  estadoBolsin: EstadoBolsin;
  fechaHora: Date;
  fechaHoraFin: Date | null;

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

  sosActual(): boolean {
    return this.fechaHoraFin === null;
  }
}
