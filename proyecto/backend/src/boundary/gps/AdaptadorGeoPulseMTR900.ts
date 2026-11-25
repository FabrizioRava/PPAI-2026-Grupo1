import { IAdaptadorGPSTracker } from './IAdaptadorGPSTracker';
import { ServicioGeoPulseMTR900 } from './ServicioGeoPulseMTR900';

// «adapter» Adapta el servicio del GPS Tracker GeoPulse MTR-900 (matriz).
// Este modelo no necesita códigos de CM.
export class AdaptadorGeoPulseMTR900 implements IAdaptadorGPSTracker {
  private apiKey: string;
  private numeroBolsin!: number;
  private ubicacionRecibida!: string[][];
  private ubicacionAdaptada!: string[];
  private servicio: ServicioGeoPulseMTR900;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.servicio = new ServicioGeoPulseMTR900();
  }

  obtenerUbicacionBolsin(numeroBolsin: number, codigoCMOrigen: string, codigoCMDestino: string): string[] {
    void codigoCMOrigen; // este modelo no usa códigos de CM
    void codigoCMDestino;
    this.numeroBolsin = numeroBolsin;
    this.solicitarUbicacion();
    this.adaptarUbicacion();
    return this.ubicacionAdaptada;
  }

  solicitarUbicacion(): void {
    this.ubicacionRecibida = this.servicio.fetchCargoPositions(this.apiKey, this.numeroBolsin);
  }

  // Recorre la matriz y toma la fila con la fecha y hora de actualización más reciente.
  adaptarUbicacion(): void {
    const masReciente = this.ubicacionRecibida.reduce((a, b) => (new Date(b[3]) > new Date(a[3]) ? b : a));
    this.ubicacionAdaptada = [masReciente[0], masReciente[1], masReciente[2], masReciente[3]];
    console.log(
      `[AdaptadorGeoPulseMTR900] recibido: ${JSON.stringify(this.ubicacionRecibida)} → adaptado: ${JSON.stringify(this.ubicacionAdaptada)}`
    );
  }
}
