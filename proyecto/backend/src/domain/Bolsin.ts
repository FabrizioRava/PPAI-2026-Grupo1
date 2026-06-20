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
  private numeroPrecinto: number;
  private numeroBolsin: number;

  constructor(
    id: number,
    codigo: string,
    comisionMedicaOrigen: ComisionMedica,
    comisionMedicaDestino: ComisionMedica,
    cambiosDeEstado: CambioDeEstadoBolsin[],
    dispositivoGPS: DispositivoGPS = new DispositivoGPS(),
    numeroPrecinto: number,
    numeroBolsin?: number // Parámetro opcional para evitar romper mockData anteriores
  ) {
    this.id = id;
    this.codigo = codigo;
    this.comisionMedicaOrigen = comisionMedicaOrigen;
    this.comisionMedicaDestino = comisionMedicaDestino;
    this.cambiosDeEstado = cambiosDeEstado;
    this.dispositivoGPS = dispositivoGPS;
    this.numeroPrecinto = numeroPrecinto;
    // CORRECCIÓN: Asigna el parámetro si viene en el mock, sino usa el id por defecto.
    // Evita llamar a métodos de instancia en el constructor.
    this.numeroBolsin = numeroBolsin !== undefined ? numeroBolsin : id; 
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
    const actual = this.cambiosDeEstado.find(c => c.sosActual());
    if (!actual) return false;
    return actual.sosEnviado();
  }

  // Diagrama: G -> B: esTuCMDeOrigen(codigoCM)
  esTuCMDeOrigen(codigoCM: string): boolean {
    return this.comisionMedicaOrigen.getCodigoCM() === codigoCM;
  }

  // Diagrama: G -> B: getNumeroBolsin()
  getNumeroBolsin(): number {
    return this.numeroBolsin;
  }

  // Soporte para armar el objeto plano de la ubicación
  getEstadoActual(): EstadoBolsin | null {
    const actual = this.cambiosDeEstado.find(c => c.sosActual());
    return actual ? actual.getEstadoBolsin() : null;
  }

  // Diagrama: G -> B: obtenerCMDestino()
  obtenerCMDestino(): ComisionMedica {
    return this.comisionMedicaDestino;
  }

  // Diagrama: G -> B: obtenerDispositivoGPS()
  obtenerDispositivoGPS(): DispositivoGPS {
    return this.dispositivoGPS;
  }
}