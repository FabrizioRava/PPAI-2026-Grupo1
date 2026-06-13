import { ComisionMedica } from './ComisionMedica';
import { CambioDeEstadoBolsin } from './CambioDeEstadoBolsin';
import { EstadoBolsin } from './EstadoBolsin';

export class Bolsin {
  id: number;
  codigo: string;
  comisionMedicaOrigen: ComisionMedica;
  comisionMedicaDestino: ComisionMedica;
  cambiosDeEstado: CambioDeEstadoBolsin[];

  constructor(
    id: number,
    codigo: string,
    comisionMedicaOrigen: ComisionMedica,
    comisionMedicaDestino: ComisionMedica,
    cambiosDeEstado: CambioDeEstadoBolsin[]
  ) {
    this.id = id;
    this.codigo = codigo;
    this.comisionMedicaOrigen = comisionMedicaOrigen;
    this.comisionMedicaDestino = comisionMedicaDestino;
    this.cambiosDeEstado = cambiosDeEstado;
  }

  buscarBolsinesEnEstadoEnviado(): boolean {
    const actual = this.cambiosDeEstado.find(c => c.sosActual());
    if (!actual) return false;
    return actual.estadoBolsin.sosEnviado();
  }

  esTuCMDeOrigen(cmId: number): boolean {
    return this.comisionMedicaOrigen.id === cmId;
  }

  getEstadoActual(): EstadoBolsin | null {
    const actual = this.cambiosDeEstado.find(c => c.sosActual());
    return actual ? actual.estadoBolsin : null;
  }

  obtenerCMDestino(): ComisionMedica {
    return this.comisionMedicaDestino;
  }
}


