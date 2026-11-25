import { ComisionMedica } from './ComisionMedica';
import { CambioDeEstadoBolsin } from './CambioDeEstadoBolsin';
import { EstadoBolsin } from './EstadoBolsin';
import { DispositivoGPS } from './DispositivoGPS';

export class Bolsin {
  private numeroBolsin: number;
  private numeroPrecinto: number;
  private fecha: Date;
  private peso: number;
  private origen: ComisionMedica;
  private destino: ComisionMedica;
  private cambioEstado: CambioDeEstadoBolsin[];
  private dispositivoGPS: DispositivoGPS;

  constructor(
    numeroBolsin: number,
    numeroPrecinto: number,
    fecha: Date,
    peso: number,
    origen: ComisionMedica,
    destino: ComisionMedica,
    cambioEstado: CambioDeEstadoBolsin[],
    dispositivoGPS: DispositivoGPS = new DispositivoGPS()
  ) {
    this.numeroBolsin = numeroBolsin;
    this.numeroPrecinto = numeroPrecinto;
    this.fecha = fecha;
    this.peso = peso;
    this.origen = origen;
    this.destino = destino;
    this.cambioEstado = cambioEstado;
    this.dispositivoGPS = dispositivoGPS;
  }

  // --- Getters / Setters ---
  getFecha(): Date {
    return this.fecha;
  }

  setFecha(fecha: Date): void {
    this.fecha = fecha;
  }

  getPeso(): number {
    return this.peso;
  }

  setPeso(peso: number): void {
    this.peso = peso;
  }

  getOrigen(): ComisionMedica {
    return this.origen;
  }

  setOrigen(origen: ComisionMedica): void {
    this.origen = origen;
  }

  getDestino(): ComisionMedica {
    return this.destino;
  }

  setDestino(destino: ComisionMedica): void {
    this.destino = destino;
  }

  getCambioEstado(): CambioDeEstadoBolsin[] {
    return this.cambioEstado;
  }

  setCambioEstado(cambioEstado: CambioDeEstadoBolsin[]): void {
    this.cambioEstado = cambioEstado;
  }

  getDispositivoGPS(): DispositivoGPS {
    return this.dispositivoGPS;
  }

  setDispositivoGPS(dispositivoGPS: DispositivoGPS): void {
    this.dispositivoGPS = dispositivoGPS;
  }

  getNumeroPrecinto(): number {
    return this.numeroPrecinto;
  }

  setNumeroPrecinto(numeroPrecinto: number): void {
    this.numeroPrecinto = numeroPrecinto;
  }

  setNumeroBolsin(numeroBolsin: number): void {
    this.numeroBolsin = numeroBolsin;
  }

  // --- Comportamiento (Mensajes del Diagrama de Secuencia) ---

  // Diagrama: G -> B: sosEnviado()
  sosEnviado(): boolean {
    const actual = this.cambioEstado.find((c) => c.sosActual());
    if (!actual) return false;
    return actual.sosEnviado();
  }

  // Diagrama: G -> B: esTuCMDeOrigen(codigoCM)
  esTuCMDeOrigen(codigoCM: string): boolean {
    return this.origen.getCodigoCM() === codigoCM;
  }

  // Diagrama: G -> B: getNumeroBolsin()
  getNumeroBolsin(): number {
    return this.numeroBolsin;
  }

  // Soporte para armar el objeto plano de la ubicación
  getEstadoActual(): EstadoBolsin | null {
    const actual = this.cambioEstado.find((c) => c.sosActual());
    return actual ? actual.getEstado() : null;
  }

  // Diagrama: G -> B: obtenerCMDestino(); B -> CM: getCodigoCM(), getNombreCM()
  // Retorna [nombreCM, codigoCM]
  obtenerCMDestino(): string[] {
    return [this.destino.getNombreCM(), this.destino.getCodigoCM()];
  }

  // Diagrama: G -> B: obtenerDispositivoGPS(); B -> DGPS: getMarcaGPS(), getModeloGPS()
  // Retorna [marca, modelo]
  obtenerDispositivoGPS(): string[] {
    return [this.dispositivoGPS.getMarcaGPS(), this.dispositivoGPS.getModeloGPS()];
  }
}
