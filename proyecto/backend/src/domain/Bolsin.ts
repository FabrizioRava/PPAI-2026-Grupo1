import { ComisionMedica } from './ComisionMedica';
import { CambioDeEstadoBolsin } from './CambioDeEstadoBolsin';
import { EstadoBolsin } from './EstadoBolsin';
import { DispositivoGPS } from './DispositivoGPS';

export class Bolsin {
  id: number;
  codigo: string;
  comisionMedicaOrigen: ComisionMedica;
  comisionMedicaDestino: ComisionMedica;
  cambiosDeEstado: CambioDeEstadoBolsin[];
  dispositivoGPS: DispositivoGPS;
  numeroPrecinto: number;
  numeroBolsin: number;

  constructor(
    id: number,
    codigo: string,
    comisionMedicaOrigen: ComisionMedica,
    comisionMedicaDestino: ComisionMedica,
    cambiosDeEstado: CambioDeEstadoBolsin[],
    dispositivoGPS: DispositivoGPS = new DispositivoGPS()
  ) {
    this.id = id;
    this.codigo = codigo;
    this.comisionMedicaOrigen = comisionMedicaOrigen;
    this.comisionMedicaDestino = comisionMedicaDestino;
    this.cambiosDeEstado = cambiosDeEstado;
    this.dispositivoGPS = dispositivoGPS;
    this.numeroPrecinto = this.getNumeroPrecinto();
    this.numeroBolsin = this.getNumeroBolsin();
  }

  // Diagrama (paso 3): G -> B: sosEnviado()
  // B -> cEstB: sosActual()  /  estAB -> estB: sosEnviado()
  sosEnviado(): boolean {
    const actual = this.cambiosDeEstado.find(c => c.sosActual());
    if (!actual) return false;
    return actual.sosEnviado();
  }

  esTuCMDeOrigen(codigoCM: string): boolean {
    return this.comisionMedicaOrigen.getCodigoCM() === codigoCM;
  }

  // Diagrama (paso 3): G -> B: getNumeroPrecinto()  (número de precinto extraído del código BOL-XXXX)
  getNumeroPrecinto(): number {
    return parseInt(this.codigo.replace(/\D/g, ''), 10) || this.id;
  }

  // Diagrama (paso 3): G -> B: getNumeroBolsin()
  getNumeroBolsin(): number {
    return this.id;
  }

  getEstadoActual(): EstadoBolsin | null {
    const actual = this.cambiosDeEstado.find(c => c.sosActual());
    return actual ? actual.estadoBolsin : null;
  }

  obtenerCMDestino(): ComisionMedica {
    return this.comisionMedicaDestino;
  }

  // Diagrama (paso 4): G -> B: obtenerDispositivoGPS()
  obtenerDispositivoGPS(): DispositivoGPS {
    return this.dispositivoGPS;
  }
}


