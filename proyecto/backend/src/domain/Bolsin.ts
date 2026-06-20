import { ComisionMedica } from './ComisionMedica';
import { CambioDeEstadoBolsin } from './CambioDeEstadoBolsin';
import { EstadoBolsin } from './EstadoBolsin';
import { DispositivoGPS } from './DispositivoGPS';

export class Bolsin {
  private id: number;
  private codigo: string;
  private comisionMedicaOrigen: ComisionMedica;
  private comisionMedicaDestino: ComisionMedica;
  private cambiosDeEstado: CambioDeEstadoBolsin[];
  private dispositivoGPS: DispositivoGPS;

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
  }

  // --- Getters / Setters ---
  getId(): number {
    return this.id;
  }

  setId(id: number): void {
    this.id = id;
  }

  getCodigo(): string {
    return this.codigo;
  }

  setCodigo(codigo: string): void {
    this.codigo = codigo;
  }

  getComisionMedicaOrigen(): ComisionMedica {
    return this.comisionMedicaOrigen;
  }

  setComisionMedicaOrigen(comisionMedicaOrigen: ComisionMedica): void {
    this.comisionMedicaOrigen = comisionMedicaOrigen;
  }

  getComisionMedicaDestino(): ComisionMedica {
    return this.comisionMedicaDestino;
  }

  setComisionMedicaDestino(comisionMedicaDestino: ComisionMedica): void {
    this.comisionMedicaDestino = comisionMedicaDestino;
  }

  getCambiosDeEstado(): CambioDeEstadoBolsin[] {
    return this.cambiosDeEstado;
  }

  setCambiosDeEstado(cambiosDeEstado: CambioDeEstadoBolsin[]): void {
    this.cambiosDeEstado = cambiosDeEstado;
  }

  getDispositivoGPS(): DispositivoGPS {
    return this.dispositivoGPS;
  }

  setDispositivoGPS(dispositivoGPS: DispositivoGPS): void {
    this.dispositivoGPS = dispositivoGPS;
  }

  // --- Comportamiento ---
  // Diagrama (paso 3): G -> B: sosEnviado()
  // B -> cEstB: sosActual()  /  estAB -> estB: sosEnviado()
  sosEnviado(): boolean {
    const actual = this.cambiosDeEstado.find(c => c.sosActual());
    if (!actual) return false;
    return actual.sosEnviado();
  }

  esTuCMDeOrigen(cmId: number): boolean {
    return this.comisionMedicaOrigen.getId() === cmId;
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
    return actual ? actual.getEstadoBolsin() : null;
  }

  obtenerCMDestino(): ComisionMedica {
    return this.comisionMedicaDestino;
  }

  // Diagrama (paso 4): G -> B: obtenerDispositivoGPS()
  obtenerDispositivoGPS(): DispositivoGPS {
    return this.dispositivoGPS;
  }
}
